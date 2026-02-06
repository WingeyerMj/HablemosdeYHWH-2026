const dataModel = require('../models/dataModel');

const homeController = {
    index: (req, res) => {
        const data = dataModel.getHomeData();
        res.render('index', { ...data, title: 'Hablemos de YHWH', page: 'home' });
    },
    blog: (req, res) => {
        res.render('blog', { title: 'Blog - Hablemos de YHWH', page: 'blog' });
    },
    calendar: (req, res) => {
        res.render('calendar', { title: 'Calendario - Hablemos de YHWH', page: 'calendar' });
    }
};

module.exports = homeController;
