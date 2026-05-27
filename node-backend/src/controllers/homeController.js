const Parasha = require('../models/Parasha');
const Portfolio = require('../models/Portfolio');
const Team = require('../models/Team');
const Testimonial = require('../models/Testimonial');
const Pricing = require('../models/Pricing');
const DynamicSection = require('../models/DynamicSection');
const EntityModel = require('../models/EntityModel');
const SiteSettings = require('../models/SiteSettings');
const db = require('../config/db');

const homeController = {
    index: async (req, res, next) => {
        try {
            let allDynamicSections = [], latestParashot = [], portfolio = [], team = [], testimonials = [], pricingRaw = [], siteSettings = {};
            const sectionsObj = {};

            try {
                // 1. Cargar Secciones Base desde tablas individuales
                const sectionNames = ['hero', 'calendario', 'about', 'parashot', 'eventos', 'equipo', 'footer'];
                for (const name of sectionNames) {
                    try {
                        const tableName = `home_section_${name}`;
                        const [rows] = await db.query(`SELECT * FROM ${tableName} LIMIT 1`);
                        if (rows && rows.length > 0) {
                            // Mapeo explícito para asegurar que la primera letra sea mayúscula (hero -> Hero)
                            const key = name.charAt(0).toUpperCase() + name.slice(1);
                            sectionsObj[key] = rows[0];
                            console.log(`✅ Cargada sección base: ${key} desde ${tableName}`);
                        } else {
                            console.warn(`⚠️ La tabla ${tableName} está vacía.`);
                        }
                    } catch (e) {
                        console.error(`❌ Error crítico cargando tabla home_section_${name}:`, e.message);
                    }
                }

                // 2. Cargar otros datos dinámicos
                allDynamicSections = await DynamicSection.getAll();
                latestParashot = await Parasha.getLatest(6);
                portfolio = await Portfolio.getPublished();
                team = await Team.getAll();
                testimonials = await Testimonial.getAll();
                pricingRaw = await Pricing.getAll();
                siteSettings = await SiteSettings.getMap();
            } catch (dbErr) {
                console.warn('⚠️ No se pudieron cargar datos de la DB:', dbErr.message || dbErr);
            }

            // 3. Procesar secciones dinámicas y cargar sus datos
            const dynamicInline = [];
            const baseSlugs = ['hero', 'about', 'calendario', 'parashot', 'eventos', 'equipo', 'footer'];

            for (const ds of allDynamicSections) {
                if (ds.is_active) {
                    const slug = ds.slug.toLowerCase().trim();
                    const key = slug.charAt(0).toUpperCase() + slug.slice(1);
                    
                    // Cargar items si tiene tabla
                    let items = [];
                    if (ds.data_table) {
                        try {
                            items = await EntityModel.getAll(ds.data_table);
                        } catch (e) {
                            console.warn(`⚠️ Error cargando items de ${ds.data_table}:`, e.message);
                        }
                    }
                    
                    const sectionData = { ...ds, items };

                    // Solo agregamos a sectionsObj si NO es una sección base 
                    // o si la sección base no pudo cargarse previamente.
                    if (!baseSlugs.includes(slug) || !sectionsObj[key]) {
                        sectionsObj[key] = sectionData;
                    }

                    if (ds.section_type === 'inline') {
                        if (!baseSlugs.includes(slug)) {
                            dynamicInline.push(sectionData);
                        }
                    }
                }
            }

            // Transform pricing data
            const pricing = pricingRaw.map(p => ({
                ...p,
                features: p.features ? p.features.split(',').map(f => f.trim()) : [],
                na_features: p.na_features ? p.na_features.split(',').map(f => f.trim()) : []
            }));

            res.render('index', {
                sections: sectionsObj,
                services: latestParashot,
                portfolio: portfolio,
                team: team,
                testimonials: testimonials,
                pricing: pricing,
                dynamicInline: dynamicInline,
                siteSettings: siteSettings,
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
