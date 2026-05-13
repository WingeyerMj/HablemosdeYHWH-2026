const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const DynamicSection = require('../models/DynamicSection');
const FooterModel = require('../models/FooterModel');

router.get('/', homeController.index);
router.get('/blog', homeController.blog);
router.get('/calendar', homeController.calendar);
router.get('/parashot', homeController.parashot);
router.get('/parashot/:id', homeController.parashaDetail);
router.get('/eventos/:id', homeController.eventDetail);
router.get('/debug', homeController.debug);

// Ruta para páginas dinámicas
router.get('/s/:slug', homeController.dynamicPage);

module.exports = router;
