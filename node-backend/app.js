const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const db = require('./src/config/db');
const initDB = require('./src/config/init-db');
const DynamicSection = require('./src/models/DynamicSection');
const FooterModel = require('./src/models/FooterModel');
const SiteSettings = require('./src/models/SiteSettings');
const MusicTrack = require('./src/models/MusicTrack');
const { getIconBuffer, ensureCalendarPwaIconsOnDisk } = require('./src/utils/calendarPwaAssets');

// Asegurar que los iconos PNG para la PWA del calendario existan en disco
ensureCalendarPwaIconsOnDisk();

// Prevenir que el proceso muera por errores no manejados (ej: MySQL no disponible)
process.on('unhandledRejection', (reason, promise) => {
    console.warn('⚠️ Unhandled Rejection (ignorado):', reason?.code || reason?.message || reason);
});
process.on('uncaughtException', (err) => {
    console.warn('⚠️ Uncaught Exception (ignorado):', err?.code || err?.message || err);
});

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// Ocultar cabeceras de fingerprinting de Express
app.disable('x-powered-by');

// Cabeceras de Seguridad HTTP (Anti-XSS, Anti-Clickjacking, Anti-MIME sniffing)
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "base-uri 'self'; form-action 'self'; frame-ancestors 'self'");
    if (req.secure) res.setHeader('Strict-Transport-Security', 'max-age=15552000');
    next();
});

if (isProduction) app.set('trust proxy', 1);

// Settings
app.set('port', process.env.PORT || 3001);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Middlewares
app.use(expressLayouts);
app.set('layout', false);
const fs = require('fs');
const { serveUploads } = require('./src/utils/safeUploads');
app.use('/uploads', serveUploads([path.join(__dirname, '../public/uploads'), path.join(__dirname, 'public/uploads')]));
app.use('/assets/parashot', serveUploads([path.join(__dirname, '../public/assets/parashot'), path.join(__dirname, 'public/assets/parashot')]));
// /calendar/ (con barra) -> /calendar: una única versión del calendario (la que funciona offline e instalable)
app.use((req, res, next) => {
    if (req.method === 'GET' && req.path === '/calendar/') {
        const qs = req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : '';
        return res.redirect(302, '/calendar' + qs);
    }
    next();
});
app.use(['/sw.js', '/sw-calendar.js', '/manifest.webmanifest', '/manifest-calendar.json'], (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    next();
});
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/calendar', express.static(path.join(__dirname, '../Calendar'), { redirect: false, index: false }));

// Rutas explícitas para PWA / Modo Offline del Calendario Lunisolar
app.get('/sw-calendar.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(__dirname, '../public/sw-calendar.js'));
});

app.get('/manifest-calendar.json', (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.sendFile(path.join(__dirname, '../public/manifest-calendar.json'));
});

app.get(['/assets/calendar/icons/:iconFile', '/calendar/icons/:iconFile'], (req, res, next) => {
    const map = {
        'icon-192.png': 192,
        'icon-512.png': 512,
        'apple-touch-icon.png': 180
    };
    const size = map[req.params.iconFile];
    if (!size) return next();
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=604800');
    return res.send(getIconBuffer(size));
});
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

app.use(session({
    secret: process.env.SESSION_SECRET || (isProduction ? (() => {
        throw new Error('SESSION_SECRET es obligatorio en producción');
    })() : 'development-only-secret'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        maxAge: 8 * 60 * 60 * 1000
    }
}));

// Global variables (access session in all views)
app.use(async (req, res, next) => {
    // Inicializar SIEMPRE para evitar ReferenceError en EJS
    res.locals.user = req.session.userId || null;
    res.locals.username = req.session.username || null;
    res.locals.role = req.session.role || null;
    res.locals.req = req;
    res.locals.navbarDynamicSections = [];
    res.locals.footerConfig = {};
    res.locals.footerLinks = {};
    res.locals.siteSettings = {};
    res.locals.globalMusicTracks = [];

    // URL pública absoluta (para compartir en redes y etiquetas Open Graph)
    const reqHost = req.get('host') || '';
    const isLocalHost = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(reqHost);
    const siteOrigin = (process.env.SITE_URL || (isLocalHost ? 'https://www.hablemosdeyhwh.com' : `${req.protocol}://${reqHost}`)).replace(/\/+$/, '');
    res.locals.siteOrigin = siteOrigin;
    res.locals.currentFullUrl = siteOrigin + req.originalUrl;

    try {
        // Cargar datos globales de forma asíncrona
        const navSections = await DynamicSection.getNavbarSections().catch(() => []);
        const footerConfig = await FooterModel.getFooterConfig().catch(() => ({}));
        const footerLinks = await FooterModel.getFooterLinks().catch(() => ({}));
        const siteSettings = await SiteSettings.getMap().catch(() => ({}));
        const globalMusicTracks = await MusicTrack.getAutoPlaylist().catch(() => []);
        
        res.locals.navbarDynamicSections = navSections;
        res.locals.footerConfig = footerConfig;
        res.locals.footerLinks = footerLinks;
        res.locals.siteSettings = siteSettings;
        res.locals.globalMusicTracks = globalMusicTracks;
    } catch (e) {
        console.warn('--- Error loading global data:', e.message);
    }

    next();
});

// Routes
const adminRoutes = require('./src/routes/admin');
const indexRoutes = require('./src/routes/index');
const apiRoutes = require('./src/routes/api');

app.use('/admin', require('./src/utils/security').csrf, adminRoutes);
app.use('/api', apiRoutes);
app.use('/', indexRoutes);

// Error handling - 404
app.use((req, res, next) => {
    res.status(404).render('index', {
        title: '404 - Not Found',
        page: '404',
        sections: {},
        services: [],
        portfolio: [],
        team: [],
        testimonials: [],
        pricing: [],
        dynamicInline: [],
        layout: false
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('--- ERROR DETECTADO ---');
    console.error(err.stack);
    if (err.status === 400 || err.name === 'MulterError') return res.status(400).send('Archivo o formulario no válido. Verifica el formato y el tamaño.');
    res.status(500).send('No se pudo completar la solicitud. Intenta nuevamente.');
});

// Start server
async function startServer() {
    try {
        // Inicializar base de datos primero (esperar a que se creen las tablas)
        await initDB(db);
    } catch (error) {
        console.warn('⚠️ No se pudo inicializar la base de datos:', error.message || error);
        console.warn('⚠️ El servidor continuará sin base de datos.');
    }

    require('./src/utils/roshJodesPublisher').start(db);

    app.listen(app.get('port'), () => {
        console.log(`Server on port ${app.get('port')}`);
    });
}

startServer();

