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

// Prevenir que el proceso muera por errores no manejados (ej: MySQL no disponible)
process.on('unhandledRejection', (reason, promise) => {
    console.warn('⚠️ Unhandled Rejection (ignorado):', reason?.code || reason?.message || reason);
});
process.on('uncaughtException', (err) => {
    console.warn('⚠️ Uncaught Exception (ignorado):', err?.code || err?.message || err);
});

const app = express();

// Settings
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Middlewares
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/calendar', express.static(path.join(__dirname, '../Calendar')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
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

    try {
        // Cargar datos globales de forma asíncrona
        const navSections = await DynamicSection.getNavbarSections().catch(() => []);
        const footerConfig = await FooterModel.getFooterConfig().catch(() => ({}));
        const footerLinks = await FooterModel.getFooterLinks().catch(() => ({}));
        const siteSettings = await SiteSettings.getMap().catch(() => ({}));
        
        res.locals.navbarDynamicSections = navSections;
        res.locals.footerConfig = footerConfig;
        res.locals.footerLinks = footerLinks;
        res.locals.siteSettings = siteSettings;
    } catch (e) {
        console.warn('--- Error loading global data:', e.message);
    }

    next();
});

// Routes
const adminRoutes = require('./src/routes/admin');
const indexRoutes = require('./src/routes/index');

app.use('/admin', adminRoutes);
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
        siteSettings: {},
        footerConfig: {},
        footerLinks: {},
        layout: false
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('--- ERROR DETECTADO ---');
    console.error(err.stack);
    res.status(500).send('Algo salió mal en el servidor: ' + err.message);
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

    app.listen(app.get('port'), () => {
        console.log(`Server on port ${app.get('port')}`);
    });
}

startServer();
