const dataModel = require('../models/dataModel');
const Section = require('../models/Section');
const Parasha = require('../models/Parasha');

const homeController = {
    index: async (req, res, next) => {
        try {
            const data = dataModel.getHomeData();
            const sections = await Section.getAll();
            const latestParashot = await Parasha.getLatest(6);

            // Convertimos el array de secciones en un objeto para fácil acceso: sectionsObj.Hero.title
            const sectionsObj = {};
            sections.forEach(s => {
                sectionsObj[s.section_name] = s;
            });

            res.render('index', {
                ...data,
                sections: sectionsObj,
                services: latestParashot, // Sobrescribimos los servicios con las parashot de la DB
                title: 'Hablemos de YHWH',
                page: 'home',
                layout: false // Desactivamos layout global para no romper las vistas actuales
            });
        } catch (error) {
            next(error);
        }
    },
    blog: (req, res) => {
        res.render('blog', { title: 'Blog - Hablemos de YHWH', page: 'blog', layout: false });
    },
    calendar: (req, res) => {
        res.render('calendar', { title: 'Calendario - Hablemos de YHWH', page: 'calendar', layout: false });
    },
    parashot: (req, res) => {
        res.render('parashot', { title: 'Parashot - Hablemos de YHWH', page: 'parashot', layout: false });
    }
};

module.exports = homeController;
