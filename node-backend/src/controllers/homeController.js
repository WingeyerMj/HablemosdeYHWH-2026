const Parasha = require('../models/Parasha');
const Portfolio = require('../models/Portfolio');
const Team = require('../models/Team');
const Testimonial = require('../models/Testimonial');
const Pricing = require('../models/Pricing');
const DynamicSection = require('../models/DynamicSection');
const EntityModel = require('../models/EntityModel');

const homeController = {
    index: async (req, res, next) => {
        try {
            let allDynamicSections = [], latestParashot = [], portfolio = [], team = [], testimonials = [], pricingRaw = [];
            try {
                allDynamicSections = await DynamicSection.getAll();
                latestParashot = await Parasha.getLatest(6);
                portfolio = await Portfolio.getAll();
                team = await Team.getAll();
                testimonials = await Testimonial.getAll();
                pricingRaw = await Pricing.getAll();
            } catch (dbErr) {
                console.warn('⚠️ No se pudieron cargar datos de la DB:', dbErr.message || dbErr);
            }

            // Transform pricing data
            const pricing = pricingRaw.map(p => ({
                ...p,
                features: p.features ? p.features.split(',').map(f => f.trim()) : [],
                na_features: p.na_features ? p.na_features.split(',').map(f => f.trim()) : []
            }));

            // Convertimos el array de secciones dinámicas en un objeto para fácil acceso: sectionsObj.hero.title
            // Usamos el slug como llave (hero, about, calendario, etc.)
            const sectionsObj = {};
            const dynamicInline = [];

            allDynamicSections.forEach(ds => {
                if (ds.is_active) {
                    const slug = ds.slug.toLowerCase().trim();
                    const key = slug.charAt(0).toUpperCase() + slug.slice(1);
                    sectionsObj[key] = ds;

                    if (ds.section_type === 'inline') {
                        // Exclude sections that are explicitly rendered in the EJS template
                        const excludedSlugs = ['hero', 'about', 'calendario', 'parashot', 'eventos', 'equipo'];
                        if (!excludedSlugs.includes(slug)) {
                            dynamicInline.push(ds);
                        }
                    }
                }
            });

            res.render('index', {
                sections: sectionsObj,
                services: latestParashot,
                portfolio: portfolio,
                team: team,
                testimonials: testimonials,
                pricing: pricing,
                dynamicInline: dynamicInline,
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
    parashot: async (req, res, next) => {
        try {
            const allParashot = await Parasha.getAll();
            res.render('parashot', { 
                title: 'Parashot - Hablemos de YHWH', 
                page: 'parashot', 
                parashot: allParashot,
                layout: false 
            });
        } catch (error) {
            next(error);
        }
    },
    debug: async (req, res, next) => {
        try {
            const allParashot = await Parasha.getAll();
            const latest = await Parasha.getLatest(6);
            res.render('debug', { 
                parashot: allParashot,
                services: latest,
                layout: false 
            });
        } catch (error) {
            next(error);
        }
    },
    parashaDetail: async (req, res, next) => {
        try {
            const parasha = await Parasha.getById(req.params.id);
            if (!parasha) return next();
            res.render('parasha_detail', { title: parasha.title + ' - Hablemos de YHWH', page: 'parashot', parasha, layout: false });
        } catch (error) {
            next(error);
        }
    },
    dynamicPage: async (req, res, next) => {
        try {
            const section = await DynamicSection.getBySlug(req.params.slug);
            if (!section) return next();

            let tableData = null;
            let tableColumns = null;
            if (section.data_table) {
                tableData = await EntityModel.getAll(section.data_table);
                tableColumns = await EntityModel.getColumns(section.data_table);
            }

            res.render('dynamic_page', {
                title: section.title + ' - Hablemos de YHWH',
                page: 'dynamic',
                section,
                tableData,
                tableColumns,
                layout: false
            });
        } catch (error) {
            next(error);
        }
    },
    eventDetail: async (req, res, next) => {
        try {
            const event = await Portfolio.getById(req.params.id);
            if (!event) return next();
            res.render('evento_detail', { 
                title: event.title + ' - Hablemos de YHWH', 
                page: 'portfolio', 
                evento: event,
                layout: false 
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = homeController;
