const Parasha = require('../models/Parasha');
const Portfolio = require('../models/Portfolio');
const Ensenanza = require('../models/Ensenanza');
const BlogPost = require('../models/BlogPost');
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
            let allDynamicSections = [], latestParashot = [], portfolio = [], latestEnsenanzas = [], latestBlogPosts = [], team = [], testimonials = [], pricingRaw = [], siteSettings = {}, eventCategories = [];
            const sectionsObj = {};

            try {
                // 1. Cargar Secciones Base desde tablas individuales
                const sectionNames = ['hero', 'calendario', 'about', 'parashot', 'eventos', 'ensenanzas', 'blog', 'equipo', 'footer'];
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
                        // Tabla no crítica si aún no está creada
                    }
                }

                // 2. Cargar otros datos dinámicos
                allDynamicSections = await DynamicSection.getAll();
                latestParashot = await Parasha.getLatest(6);
                portfolio = await Portfolio.getLatest(4);
                try { latestEnsenanzas = await Ensenanza.getLatest(4); } catch(e) { latestEnsenanzas = []; }
                try { latestBlogPosts = await BlogPost.getLatest(3); } catch(e) { latestBlogPosts = []; }
                eventCategories = await Portfolio.getCategories();
                team = await Team.getAll();
                testimonials = await Testimonial.getAll();
                pricingRaw = await Pricing.getAll();
                siteSettings = await SiteSettings.getMap();
            } catch (dbErr) {
                console.warn('⚠️ No se pudieron cargar datos de la DB:', dbErr.message || dbErr);
            }

            // 3. Procesar secciones dinámicas y cargar sus datos
            const dynamicInline = [];
            const baseSlugs = ['hero', 'about', 'calendario', 'parashot', 'eventos', 'ensenanzas', 'blog', 'equipo', 'footer'];

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
                ensenanzas: latestEnsenanzas,
                blogPosts: latestBlogPosts,
                eventCategories: eventCategories,
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

    blog: async (req, res, next) => {
        try {
            const { category, q } = req.query;
            const posts = await BlogPost.getPublished({ category, search: q, limit: 12 });
            const categories = await BlogPost.getCategories();
            const totalCount = await BlogPost.countPublished({ category, search: q });
            const recentPosts = await BlogPost.getLatest(4);
            
            res.render('blog', {
                title: 'Blog & Noticias - Hablemos de YHWH',
                page: 'blog',
                posts,
                categories,
                totalCount,
                recentPosts,
                activeCategory: category || 'all',
                searchQuery: q || '',
                layout: false
            });
        } catch (error) {
            next(error);
        }
    },

    blogDetail: async (req, res, next) => {
        try {
            const post = await BlogPost.getById(req.params.id);
            if (!post) return next();
            
            try { await BlogPost.incrementViews(post.id); } catch(e) {}
            
            const relatedPosts = await BlogPost.getRelated(post.id, post.category, 3);
            const categories = await BlogPost.getCategories();

            res.render('blog_detail', {
                title: post.title + ' - Blog Hablemos de YHWH',
                page: 'blog',
                post,
                relatedPosts,
                categories,
                layout: false
            });
        } catch (error) {
            next(error);
        }
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
            const Aliyah = require('../models/Aliyah');
            const parasha = await Parasha.getById(req.params.id);
            if (!parasha) return next();
            const aliyot = await Aliyah.getByParashaId(parasha.id);
            res.render('parasha_detail', { 
                title: parasha.title + ' - Hablemos de YHWH', 
                page: 'parashot', 
                parasha, 
                aliyot,
                layout: false 
            });
        } catch (error) {
            next(error);
        }
    },

    aliyotPage: async (req, res, next) => {
        try {
            const Aliyah = require('../models/Aliyah');
            const parashot = await Parasha.getAll();
            const selectedParashaId = req.query.parasha || (parashot.length > 0 ? parashot[0].id : null);
            let selectedParasha = null;
            let aliyot = [];

            if (selectedParashaId) {
                selectedParasha = await Parasha.getById(selectedParashaId);
                aliyot = await Aliyah.getByParashaId(selectedParashaId);
            }

            res.render('aliyot', {
                title: 'Aliyot - Lecturas Diarias de la Torá - Hablemos de YHWH',
                page: 'aliyot',
                parashot,
                selectedParasha,
                aliyot,
                layout: false
            });
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
    },

    semillasTorah: async (req, res, next) => {
        try {
            const SemillasTorah = require('../models/SemillasTorah');
            const Aliyah = require('../models/Aliyah');
            let items = [], categories = [], siteSettings = {};
            let recentAliyot = [], parashotOverview = [], parashot = [];

            try { items = await SemillasTorah.getPublished(); } catch (e) { items = []; }
            try { categories = await SemillasTorah.getCategories(); } catch (e) { categories = []; }
            try { siteSettings = await SiteSettings.getMap(); } catch (e) { siteSettings = {}; }

            // Cargar datos de Aliyot para el apartado de Lecturas Diarias
            try {
                recentAliyot = await Aliyah.getRecentAliyot(14);
                parashotOverview = await Aliyah.getParashotOverview();
                parashot = await Parasha.getAll();
            } catch (e) {
                console.warn('⚠️ No se pudieron cargar datos de Aliyot para Semillas:', e.message);
            }

            res.render('semillas_torah', {
                title: 'Semillas de Torah - Enseñanza Bíblica Infantil',
                page: 'semillas-torah',
                items,
                categories,
                siteSettings,
                recentAliyot,
                parashotOverview,
                parashot,
                layout: false
            });
        } catch (error) {
            next(error);
        }
    },

    semillasDetail: async (req, res, next) => {
        try {
            const SemillasTorah = require('../models/SemillasTorah');
            const item = await SemillasTorah.getById(req.params.id);
            if (!item) return res.redirect('/semillas-de-torah');
            
            const relatedItems = await SemillasTorah.getLatest(4);
            const siteSettings = await SiteSettings.getMap();
            
            res.render('semillas_detail', {
                title: item.title + ' - Semillas de Torah',
                page: 'semillas-torah',
                item,
                relatedItems: relatedItems.filter(r => r.id != item.id),
                siteSettings,
                layout: false
            });
        } catch (error) {
            next(error);
        }
    },

    eventosPage: async (req, res, next) => {
        try {
            const eventos = await Portfolio.getAll();
            res.render('eventos', {
                title: 'Eventos - Hablemos de YHWH',
                page: 'eventos',
                eventos,
                layout: false
            });
        } catch (error) {
            next(error);
        }
    },

    ensenanzasPage: async (req, res, next) => {
        try {
            const ensenanzas = await Ensenanza.getPublished();
            res.render('ensenanzas', {
                title: 'Enseñanzas - Hablemos de YHWH',
                page: 'ensenanzas',
                ensenanzas,
                layout: false
            });
        } catch (error) {
            next(error);
        }
    },

    ensenanzaDetail: async (req, res, next) => {
        try {
            const ensenanza = await Ensenanza.getById(req.params.id);
            if (!ensenanza) return next();
            res.render('ensenanza_detail', {
                title: ensenanza.title + ' - Hablemos de YHWH',
                page: 'ensenanzas',
                ensenanza,
                layout: false
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = homeController;
