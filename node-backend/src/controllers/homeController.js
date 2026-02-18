const Section = require('../models/Section');
const Parasha = require('../models/Parasha');
const Portfolio = require('../models/Portfolio');
const Team = require('../models/Team');
const Testimonial = require('../models/Testimonial');
const Pricing = require('../models/Pricing');

const homeController = {
    index: async (req, res, next) => {
        try {
            const sections = await Section.getAll();
            const latestParashot = await Parasha.getLatest(6);
            const portfolio = await Portfolio.getAll();
            const team = await Team.getAll();
            const testimonials = await Testimonial.getAll();
            const pricingRaw = await Pricing.getAll();

            // Transform pricing data
            const pricing = pricingRaw.map(p => ({
                ...p,
                features: p.features ? p.features.split(',').map(f => f.trim()) : [],
                na_features: p.na_features ? p.na_features.split(',').map(f => f.trim()) : []
            }));

            // Convertimos el array de secciones en un objeto para fácil acceso: sectionsObj.Hero.title
            const sectionsObj = {};
            sections.forEach(s => {
                sectionsObj[s.section_name] = s;
            });

            res.render('index', {
                sections: sectionsObj,
                services: latestParashot,
                portfolio: portfolio,
                team: team,
                testimonials: testimonials,
                pricing: pricing,
                title: 'Hablemos de YHWH',
                page: 'home',
                layout: false
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
