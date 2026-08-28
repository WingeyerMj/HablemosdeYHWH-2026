const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../config/multer');

// Middleware para proteger rutas
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/admin/login');
};

const isAdmin = (req, res, next) => {
    if (req.session.role === 'admin') {
        return next();
    }
    res.status(403).send('Acceso denegado: Se requieren permisos de Administrador.');
};

// Middleware para pasar datos del usuario y página activa a todas las vistas
router.use((req, res, next) => {
    res.locals.activePage = ''; // Inicializar siempre
    if (req.session.userId) {
        res.locals.username = req.session.username;
        res.locals.role = req.session.role;
        
        // Determinar activePage basado en la URL
        const path = req.path;
        if (path === '/dashboard') res.locals.activePage = 'dashboard';
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

// Eventos (Portfolio) - Admin y Editor
router.post('/portfolio/create', isAuthenticated, upload.single('image_file'), adminController.createPortfolio);
router.get('/portfolio/edit/:id', isAuthenticated, adminController.editPortfolioPage);
router.post('/portfolio/update', isAuthenticated, upload.single('image_file'), adminController.updatePortfolio);
router.get('/portfolio/delete/:id', isAuthenticated, adminController.deletePortfolio);

// Enseñanzas (Solo Admin)
router.post('/ensenanzas/create', isAuthenticated, isAdmin, upload.single('image_file'), adminController.createEnsenanza);
router.get('/ensenanzas/edit/:id', isAuthenticated, isAdmin, adminController.editEnsenanzaPage);
router.post('/ensenanzas/update', isAuthenticated, isAdmin, upload.single('image_file'), adminController.updateEnsenanza);
router.get('/ensenanzas/delete/:id', isAuthenticated, isAdmin, adminController.deleteEnsenanza);

// Semillas de Torah (Infantil) - Admin y Editor
router.post('/semillas/create', isAuthenticated, upload.fields([
    { name: 'image_file', maxCount: 1 },
    { name: 'pdf_upload', maxCount: 1 }
]), adminController.createSemillas);
router.get('/semillas/edit/:id', isAuthenticated, adminController.editSemillasPage);
router.post('/semillas/update', isAuthenticated, upload.fields([
    { name: 'image_file', maxCount: 1 },
    { name: 'pdf_upload', maxCount: 1 }
]), adminController.updateSemillas);
router.get('/semillas/delete/:id', isAuthenticated, adminController.deleteSemillas);

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
router.get('/settings', isAuthenticated, isAdmin, adminController.settingsPage);
router.post('/settings/update', isAuthenticated, isAdmin, adminController.updateSettings);

// Gestión de Usuarios (Solo Admin)
router.get('/users', isAuthenticated, isAdmin, adminController.usersPage);
router.post('/users/create', isAuthenticated, isAdmin, adminController.createUser);
router.get('/users/delete/:id', isAuthenticated, isAdmin, adminController.deleteUser);

// Secciones Dinámicas (Solo Admin)
router.get('/dynamic-sections', isAuthenticated, isAdmin, adminController.listDynamicSections);
router.get('/dynamic-sections/new', isAuthenticated, isAdmin, adminController.createDynamicSectionPage);
router.post('/dynamic-sections/create', isAuthenticated, isAdmin, adminController.createDynamicSection);
router.get('/dynamic-sections/edit/:id', isAuthenticated, isAdmin, adminController.editDynamicSection);
router.post('/dynamic-sections/update', isAuthenticated, isAdmin, adminController.updateDynamicSection);
router.get('/dynamic-sections/delete/:id', isAuthenticated, isAdmin, adminController.deleteDynamicSection);
router.get('/dynamic-sections/toggle/:id', isAuthenticated, isAdmin, adminController.toggleDynamicSection);

// Entidades Dinámicas (Solo Admin)
router.get('/entity/:table', isAuthenticated, isAdmin, adminController.manageEntity);
router.post('/entity/:table/add', isAuthenticated, isAdmin, upload.fields([
    { name: 'image_file', maxCount: 1 },
    { name: 'pdf_upload', maxCount: 1 }
]), adminController.addEntityData);
router.get('/entity/:table/edit/:id', isAuthenticated, isAdmin, adminController.editEntityData);
router.post('/entity/:table/update/:id', isAuthenticated, isAdmin, upload.fields([
    { name: 'image_file', maxCount: 1 },
    { name: 'pdf_upload', maxCount: 1 }
]), adminController.updateEntityData);
router.get('/entity/:table/delete/:id', isAuthenticated, isAdmin, adminController.deleteEntityData);

// Suscriptores Boletín (Solo Admin)
router.get('/subscribers/delete/:id', isAuthenticated, isAdmin, adminController.deleteSubscriber);

module.exports = router;
