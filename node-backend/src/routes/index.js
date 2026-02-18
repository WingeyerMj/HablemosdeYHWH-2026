const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/', homeController.index);
router.get('/blog', homeController.blog);
router.get('/calendar', homeController.calendar);
router.get('/parashot', homeController.parashot);

module.exports = router;
