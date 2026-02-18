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
router.get('/edit/:name', isAuthenticated, adminController.editSection);
router.post('/edit', isAuthenticated, adminController.updateSection);

router.post('/parashot/create', isAuthenticated, adminController.createParasha);
router.get('/parashot/delete/:id', isAuthenticated, adminController.deleteParasha);

// Gestión de Usuarios (Solo Admins)
router.get('/users', isAuthenticated, isAdmin, adminController.usersPage);
router.post('/users/create', isAuthenticated, isAdmin, adminController.createUser);
router.get('/users/delete/:id', isAuthenticated, isAdmin, adminController.deleteUser);

module.exports = router;
