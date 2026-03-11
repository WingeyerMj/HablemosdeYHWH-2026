const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const DynamicSection = require('../models/DynamicSection');

// Middleware: cargar secciones dinámicas para el navbar en todas las rutas
router.use(async (req, res, next) => {
    try {
        res.locals.navbarDynamicSections = await DynamicSection.getNavbarSections();
    } catch (e) {
        res.locals.navbarDynamicSections = [];
    }
    next();
});

router.get('/', homeController.index);
router.get('/blog', homeController.blog);
router.get('/calendar', homeController.calendar);
router.get('/parashot', homeController.parashot);
router.get('/parashot/:id', homeController.parashaDetail);
router.get('/debug', homeController.debug);

// Ruta para páginas dinámicas
router.get('/s/:slug', homeController.dynamicPage);

module.exports = router;
