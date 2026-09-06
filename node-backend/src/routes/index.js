const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const DynamicSection = require('../models/DynamicSection');
const FooterModel = require('../models/FooterModel');

router.get('/', homeController.index);
router.get('/blog', homeController.blog);
router.get('/blog/:id', homeController.blogDetail);
router.get('/calendar', homeController.calendar);
router.get('/parashot', homeController.parashot);
router.get('/parashot/:id', homeController.parashaDetail);
router.get('/aliyot', homeController.aliyotPage);
router.get('/eventos', homeController.eventosPage);
router.get('/eventos/:id', homeController.eventDetail);
router.get('/ensenanzas', homeController.ensenanzasPage);
router.get('/ensenanzas/:id', homeController.ensenanzaDetail);
router.get('/haftara', homeController.haftaraPage);
router.get('/haftara/:id', homeController.haftaraDetail);
router.get('/semillas-de-torah', homeController.semillasTorah);
router.get('/semillas-de-torah/articulo/:id', homeController.semillasArticuloDetail);
router.get('/semillas-de-torah/:id', homeController.semillasDetail);
router.get('/semillas', homeController.semillasTorah);
router.get('/semillas/articulo/:id', homeController.semillasArticuloDetail);
router.get('/semillas/:id', homeController.semillasDetail);
if (process.env.NODE_ENV !== 'production') {
    router.get('/debug', homeController.debug);
}

// Ruta para páginas dinámicas
router.get('/s/:slug', homeController.dynamicPage);

module.exports = router;
