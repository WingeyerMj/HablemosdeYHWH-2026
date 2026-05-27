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

// Parashot (soporta imagen + PDF)
router.post('/parashot/create', isAuthenticated, upload.fields([
    { name: 'image_file', maxCount: 1 },
    { name: 'pdf_upload', maxCount: 1 }
]), adminController.createParasha);
router.get('/parashot/edit/:id', isAuthenticated, adminController.editParashaPage);
router.post('/parashot/update', isAuthenticated, upload.fields([
    { name: 'image_file', maxCount: 1 },
    { name: 'pdf_upload', maxCount: 1 }
]), adminController.updateParasha);
router.get('/parashot/delete/:id', isAuthenticated, adminController.deleteParasha);

// Eventos (Portfolio)
router.post('/portfolio/create', isAuthenticated, upload.single('image_file'), adminController.createPortfolio);
router.get('/portfolio/edit/:id', isAuthenticated, adminController.editPortfolioPage);
router.post('/portfolio/update', isAuthenticated, upload.single('image_file'), adminController.updatePortfolio);
router.get('/portfolio/delete/:id', isAuthenticated, adminController.deletePortfolio);

// Equipo
router.post('/team/create', isAuthenticated, upload.single('image_file'), adminController.createTeamMember);
router.post('/team/update', isAuthenticated, upload.single('image_file'), adminController.updateTeamMember);
router.get('/team/delete/:id', isAuthenticated, adminController.deleteTeamMember);

// Testimonios
router.post('/testimonials/create', isAuthenticated, adminController.createTestimonial);
router.post('/testimonials/update', isAuthenticated, adminController.updateTestimonial);
router.get('/testimonials/delete/:id', isAuthenticated, adminController.deleteTestimonial);

// Pricing
router.post('/pricing/update', isAuthenticated, adminController.updatePricing);

// Secciones del Home (Hero, About, etc.)
router.get('/sections', isAuthenticated, isAdmin, adminController.sectionsPage);
router.post('/sections/update', isAuthenticated, isAdmin, upload.single('image_file'), adminController.updateSection);

// Configuración del Sitio
router.get('/settings', isAuthenticated, isAdmin, adminController.settingsPage);
router.post('/settings/update', isAuthenticated, isAdmin, adminController.updateSettings);

// Gestión de Usuarios (Solo Admins)
router.get('/users', isAuthenticated, isAdmin, adminController.usersPage);
router.post('/users/create', isAuthenticated, isAdmin, adminController.createUser);
router.get('/users/delete/:id', isAuthenticated, isAdmin, adminController.deleteUser);

// Secciones Dinámicas
router.get('/dynamic-sections', isAuthenticated, adminController.listDynamicSections);
router.get('/dynamic-sections/new', isAuthenticated, adminController.createDynamicSectionPage);
router.post('/dynamic-sections/create', isAuthenticated, adminController.createDynamicSection);
router.get('/dynamic-sections/edit/:id', isAuthenticated, adminController.editDynamicSection);
router.post('/dynamic-sections/update', isAuthenticated, adminController.updateDynamicSection);
router.get('/dynamic-sections/delete/:id', isAuthenticated, adminController.deleteDynamicSection);
router.get('/dynamic-sections/toggle/:id', isAuthenticated, adminController.toggleDynamicSection);

// Entidades Dinámicas (Tablas creadas por el usuario)
router.get('/entity/:table', isAuthenticated, adminController.manageEntity);
router.post('/entity/:table/add', isAuthenticated, upload.single('image_file'), adminController.addEntityData);
router.get('/entity/:table/edit/:id', isAuthenticated, adminController.editEntityData);
router.post('/entity/:table/update/:id', isAuthenticated, upload.single('image_file'), adminController.updateEntityData);
router.get('/entity/:table/delete/:id', isAuthenticated, adminController.deleteEntityData);

module.exports = router;
