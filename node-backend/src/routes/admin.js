const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

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

router.get('/login', adminController.loginPage);
router.post('/login', adminController.login);
router.get('/logout', adminController.logout);

router.get('/dashboard', isAuthenticated, adminController.dashboard);


router.post('/parashot/create', isAuthenticated, adminController.createParasha);
router.get('/parashot/delete/:id', isAuthenticated, adminController.deleteParasha);

// Portfolio
router.post('/portfolio/create', isAuthenticated, adminController.createPortfolio);
router.get('/portfolio/delete/:id', isAuthenticated, adminController.deletePortfolio);

// Team
router.post('/team/create', isAuthenticated, adminController.createTeamMember);
router.get('/team/delete/:id', isAuthenticated, adminController.deleteTeamMember);

// Testimonials
router.post('/testimonials/create', isAuthenticated, adminController.createTestimonial);
router.get('/testimonials/delete/:id', isAuthenticated, adminController.deleteTestimonial);

// Pricing
router.post('/pricing/update', isAuthenticated, adminController.updatePricing);

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
router.post('/entity/:table/add', isAuthenticated, adminController.addEntityData);
router.get('/entity/:table/delete/:id', isAuthenticated, adminController.deleteEntityData);

module.exports = router;
