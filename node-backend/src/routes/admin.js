const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../config/multer');

// Middleware para proteger rutas
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    if (req.xhr || req.headers.accept?.includes('application/json') || req.path.includes('/api/')) {
        return res.status(401).json({ success: false, error: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente en otra pestaña o recarga la página.' });
    }
    res.redirect('/admin/login');
};

const isStaff = (req, res, next) => {
    if (req.session.role === 'admin' || req.session.role === 'editor') {
        return next();
    }
    if (req.xhr || req.headers.accept?.includes('application/json') || req.path.includes('/api/')) {
        return res.status(403).json({ success: false, error: 'Acceso denegado: Se requieren permisos de Administrador o Editor.' });
    }
    res.status(403).send('Acceso denegado.');
};

const isStrictAdmin = (req, res, next) => {
    if (req.session.role === 'admin') {
        return next();
    }
    if (req.xhr || req.headers.accept?.includes('application/json') || req.path.includes('/api/')) {
        return res.status(403).json({ success: false, error: 'Acceso denegado: Se requieren permisos de Administrador Principal.' });
    }
    res.status(403).send('Acceso denegado: Se requieren permisos de Administrador Principal.');
};

const isAdmin = isStaff;

// Middleware para pasar datos del usuario y página activa a todas las vistas
router.use((req, res, next) => {
    res.locals.activePage = ''; // Inicializar siempre
    if (req.session.userId) {
        res.locals.username = req.session.username;
        res.locals.role = req.session.role;
        
        // Determinar activePage basado en la URL
        const path = req.path;
        if (path === '/dashboard') res.locals.activePage = 'dashboard';
        else if (path.includes('/semillas-articulos')) res.locals.activePage = 'semillas-articulos';
        else if (path.includes('/aliyot')) res.locals.activePage = 'aliyot';
        else if (path.includes('/dynamic-sections')) res.locals.activePage = 'dynamic-sections';
        else if (path.includes('/sections')) res.locals.activePage = 'sections';
        else if (path.includes('/entity/footer_links')) res.locals.activePage = 'footer';
        else if (path.includes('/settings')) res.locals.activePage = 'settings';
        else if (path.includes('/users')) res.locals.activePage = 'users';
    }
    next();
});

router.get('/login', adminController.loginPage);
router.post('/login', adminController.login);
router.get('/logout', adminController.logout);

router.get('/dashboard', isAuthenticated, adminController.dashboard);

// Parashot (Solo Admin)
router.post('/parashot/create', isAuthenticated, isAdmin, upload.fields([
    { name: 'image_file', maxCount: 1 },
    { name: 'pdf_upload', maxCount: 1 }
]), adminController.createParasha);
router.get('/parashot/edit/:id', isAuthenticated, isAdmin, adminController.editParashaPage);
router.post('/parashot/update', isAuthenticated, isAdmin, upload.fields([
    { name: 'image_file', maxCount: 1 },
    { name: 'pdf_upload', maxCount: 1 }
]), adminController.updateParasha);
router.get('/parashot/delete/:id', isAuthenticated, isAdmin, adminController.deleteParasha);

// Aliyot (Lecturas Diarias por Parashá - Solo Admin)
router.get('/aliyot', isAuthenticated, isAdmin, adminController.aliyotIndex);
router.post('/aliyot/create', isAuthenticated, isAdmin, upload.fields([
    { name: 'audio_file', maxCount: 10 },
    { name: 'audio_files', maxCount: 20 }
]), adminController.createAliyahSingle);
router.get('/aliyot/edit-item/:id', isAuthenticated, isAdmin, adminController.editAliyahSinglePage);
router.post('/aliyot/update-item', isAuthenticated, isAdmin, upload.fields([
    { name: 'audio_file', maxCount: 10 },
    { name: 'audio_files', maxCount: 20 }
]), adminController.updateAliyahSingle);
router.post('/aliyot/link', isAuthenticated, isAdmin, adminController.linkAliyahToParasha);
router.get('/aliyot/delete-item/:id', isAuthenticated, isAdmin, adminController.deleteAliyahSingle);
router.get('/aliyot/edit/:parashaId', isAuthenticated, isAdmin, adminController.editAliyotPage);
router.post('/aliyot/save', isAuthenticated, isAdmin, upload.fields([
    { name: 'audio_file', maxCount: 10 },
    { name: 'audio_files', maxCount: 20 }
]), adminController.saveAliyah);
router.get('/aliyot/delete-audio/:id/:parashaId/:aliyahNumber', isAuthenticated, isAdmin, adminController.deleteAliyahAudio);
router.post('/aliyot/api/transliterate', isAuthenticated, isAdmin, adminController.apiTransliterateHebrew);
router.post('/aliyot/api/fetch-verses', isAuthenticated, isAdmin, adminController.apiFetchVerses);
router.post('/aliyot/api/translate-spanish', isAuthenticated, isAdmin, adminController.apiTranslateSpanishToHebrew);

// Eventos (Portfolio) - Admin y Editor
router.post('/portfolio/create', isAuthenticated, upload.fields([
    { name: 'image_file', maxCount: 1 },
    { name: 'seder_pdf', maxCount: 1 },
    { name: 'seder_image', maxCount: 1 }
]), adminController.createPortfolio);
router.get('/portfolio/edit/:id', isAuthenticated, adminController.editPortfolioPage);
router.post('/portfolio/update', isAuthenticated, upload.fields([
    { name: 'image_file', maxCount: 1 },
    { name: 'seder_pdf', maxCount: 1 },
    { name: 'seder_image', maxCount: 1 }
]), adminController.updatePortfolio);
router.get('/portfolio/delete/:id', isAuthenticated, adminController.deletePortfolio);

// Enseñanzas (Solo Admin)
router.post('/ensenanzas/create', isAuthenticated, isAdmin, upload.single('image_file'), adminController.createEnsenanza);
router.get('/ensenanzas/edit/:id', isAuthenticated, isAdmin, adminController.editEnsenanzaPage);
router.post('/ensenanzas/update', isAuthenticated, isAdmin, upload.single('image_file'), adminController.updateEnsenanza);
router.get('/ensenanzas/delete/:id', isAuthenticated, isAdmin, adminController.deleteEnsenanza);

// Haftará (Lecturas Proféticas - Solo Admin)
router.post('/haftara/create', isAuthenticated, isAdmin, upload.single('image_file'), adminController.createHaftara);
router.get('/haftara/edit/:id', isAuthenticated, isAdmin, adminController.editHaftaraPage);
router.post('/haftara/update', isAuthenticated, isAdmin, upload.single('image_file'), adminController.updateHaftara);
router.get('/haftara/delete/:id', isAuthenticated, isAdmin, adminController.deleteHaftara);

// Semillas de Torah (Infantil) - Admin y Editor
router.post('/semillas/create', isAuthenticated, upload.fields([
    { name: 'image_file', maxCount: 1 },
    { name: 'pdf_upload', maxCount: 1 },
    { name: 'video_upload', maxCount: 1 }
]), adminController.createSemillas);
router.get('/semillas/edit/:id', isAuthenticated, adminController.editSemillasPage);
router.post('/semillas/update', isAuthenticated, upload.fields([
    { name: 'image_file', maxCount: 1 },
    { name: 'pdf_upload', maxCount: 1 },
    { name: 'video_upload', maxCount: 1 }
]), adminController.updateSemillas);
router.get('/semillas/delete/:id', isAuthenticated, adminController.deleteSemillas);

// Semillas Shorts / Aliyot con Niños (Novedades)
router.post('/semillas-shorts/create', isAuthenticated, upload.fields([
    { name: 'thumbnail_file', maxCount: 1 },
    { name: 'video_upload', maxCount: 1 }
]), adminController.createSemillasShort);
router.get('/semillas-shorts/edit/:id', isAuthenticated, adminController.editSemillasShortPage);
router.post('/semillas-shorts/update', isAuthenticated, upload.fields([
    { name: 'thumbnail_file', maxCount: 1 },
    { name: 'video_upload', maxCount: 1 }
]), adminController.updateSemillasShort);
router.get('/semillas-shorts/delete/:id', isAuthenticated, adminController.deleteSemillasShort);

// Semillas Artículos / Resúmenes de Parashá con Imágenes (Infantil)
router.get('/semillas-articulos', isAuthenticated, adminController.semillasArticulosIndex);
router.post('/semillas-articulos/create', isAuthenticated, upload.fields([
    { name: 'image_file', maxCount: 1 },
    { name: 'gallery_images', maxCount: 10 },
    { name: 'pdf_upload', maxCount: 1 }
]), adminController.createSemillasArticulo);
router.get('/semillas-articulos/edit/:id', isAuthenticated, adminController.editSemillasArticuloPage);
router.post('/semillas-articulos/update', isAuthenticated, upload.fields([
    { name: 'image_file', maxCount: 1 },
    { name: 'gallery_images', maxCount: 10 },
    { name: 'pdf_upload', maxCount: 1 }
]), adminController.updateSemillasArticulo);
router.get('/semillas-articulos/toggle/:id', isAuthenticated, adminController.toggleSemillasArticulo);
router.get('/semillas-articulos/delete/:id', isAuthenticated, adminController.deleteSemillasArticulo);

// Blog / Artículos - Admin y Editor
router.post('/blog/create', isAuthenticated, upload.single('image_file'), adminController.createBlogPost);
router.get('/blog/edit/:id', isAuthenticated, adminController.editBlogPostPage);
router.post('/blog/update', isAuthenticated, upload.single('image_file'), adminController.updateBlogPost);
router.get('/blog/delete/:id', isAuthenticated, adminController.deleteBlogPost);

// Equipo (Solo Admin)
router.post('/team/create', isAuthenticated, isAdmin, upload.single('image_file'), adminController.createTeamMember);
router.post('/team/update', isAuthenticated, isAdmin, upload.single('image_file'), adminController.updateTeamMember);
router.get('/team/delete/:id', isAuthenticated, isAdmin, adminController.deleteTeamMember);

// Testimonios (Solo Admin)
router.post('/testimonials/create', isAuthenticated, isAdmin, adminController.createTestimonial);
router.post('/testimonials/update', isAuthenticated, isAdmin, adminController.updateTestimonial);
router.get('/testimonials/delete/:id', isAuthenticated, isAdmin, adminController.deleteTestimonial);

// Pricing (Solo Admin)
router.post('/pricing/update', isAuthenticated, isAdmin, adminController.updatePricing);

// Secciones del Home (Hero, About, etc. - Solo Admin)
router.get('/sections', isAuthenticated, isAdmin, adminController.sectionsPage);
router.post('/sections/update', isAuthenticated, isAdmin, upload.single('image_file'), adminController.updateSection);

// Configuración del Sitio (Solo Admin)
router.get('/settings', isAuthenticated, isStrictAdmin, adminController.settingsPage);
router.post('/settings/update', isAuthenticated, isStrictAdmin, adminController.updateSettings);

// Gestión de Usuarios (Solo Admin)
router.get('/users', isAuthenticated, isStrictAdmin, adminController.usersPage);
router.post('/users/create', isAuthenticated, isStrictAdmin, adminController.createUser);
router.post('/users/edit/:id', isAuthenticated, isStrictAdmin, adminController.updateUser);
router.post('/users/update/:id', isAuthenticated, isStrictAdmin, adminController.updateUser);
router.get('/users/delete/:id', isAuthenticated, isStrictAdmin, adminController.deleteUser);

// Secciones Dinámicas (Solo Admin)
router.get('/dynamic-sections', isAuthenticated, isStrictAdmin, adminController.listDynamicSections);
router.get('/dynamic-sections/new', isAuthenticated, isStrictAdmin, adminController.createDynamicSectionPage);
router.post('/dynamic-sections/create', isAuthenticated, isStrictAdmin, adminController.createDynamicSection);
router.get('/dynamic-sections/edit/:id', isAuthenticated, isStrictAdmin, adminController.editDynamicSection);
router.post('/dynamic-sections/update', isAuthenticated, isStrictAdmin, adminController.updateDynamicSection);
router.get('/dynamic-sections/delete/:id', isAuthenticated, isStrictAdmin, adminController.deleteDynamicSection);
router.get('/dynamic-sections/toggle/:id', isAuthenticated, isStrictAdmin, adminController.toggleDynamicSection);

// Entidades Dinámicas (Solo Admin)
router.get('/entity/:table', isAuthenticated, isStrictAdmin, adminController.manageEntity);
router.post('/entity/:table/add', isAuthenticated, isStrictAdmin, upload.fields([
    { name: 'image_file', maxCount: 1 },
    { name: 'pdf_upload', maxCount: 1 }
]), adminController.addEntityData);
router.get('/entity/:table/edit/:id', isAuthenticated, isStrictAdmin, adminController.editEntityData);
router.post('/entity/:table/update/:id', isAuthenticated, isStrictAdmin, upload.fields([
    { name: 'image_file', maxCount: 1 },
    { name: 'pdf_upload', maxCount: 1 }
]), adminController.updateEntityData);
router.get('/entity/:table/delete/:id', isAuthenticated, isStrictAdmin, adminController.deleteEntityData);

// Suscriptores Boletín (Solo Admin)
router.post('/subscribers/create', isAuthenticated, isStrictAdmin, adminController.createSubscriber);
router.post('/subscribers/broadcast', isAuthenticated, isStrictAdmin, adminController.broadcastNewsletter);
router.get('/subscribers/delete/:id', isAuthenticated, isStrictAdmin, adminController.deleteSubscriber);

module.exports = router;

