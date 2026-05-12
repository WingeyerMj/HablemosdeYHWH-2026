const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const db = require('./src/config/db');
const initDB = require('./src/config/init-db');

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
app.use((req, res, next) => {
    res.locals.user = req.session.userId || null;
    res.locals.username = req.session.username || null;
    res.locals.role = req.session.role || null;
    // Hacemos req disponible en res.locals para usarlo en las vistas (dashboard)
    res.locals.req = req;
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
