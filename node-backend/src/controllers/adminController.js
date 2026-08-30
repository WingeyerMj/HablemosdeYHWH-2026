const DynamicSection = require('../models/DynamicSection');
const EntityModel = require('../models/EntityModel');
const SiteSettings = require('../models/SiteSettings');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const adminController = {
    loginPage: (req, res) => {
        if (req.session.userId) return res.redirect('/admin/dashboard');
        res.render('admin/login', { layout: false, error: null });
    },

    login: async (req, res) => {
        const { username, password } = req.body;
        try {
            const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
            if (rows.length === 0) return res.render('admin/login', { error: 'Usuario no encontrado', layout: false });

            const user = rows[0];
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return res.render('admin/login', { error: 'Contraseña incorrecta', layout: false });

            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.role = user.role;

            res.redirect('/admin/dashboard');
        } catch (error) {
            console.error('Error de login:', error);
            res.render('admin/login', { error: 'Error del servidor: ' + error.message, layout: false });
        }
    },

    dashboard: async (req, res, next) => {
        try {
            const Parasha = require('../models/Parasha');
            const Portfolio = require('../models/Portfolio');
            const Ensenanza = require('../models/Ensenanza');
            const BlogPost = require('../models/BlogPost');
            const Team = require('../models/Team');
            const Testimonial = require('../models/Testimonial');
            const Pricing = require('../models/Pricing');

            let parashot = [], portfolio = [], ensenanzas = [], blogs = [], team = [], testimonials = [], pricing = [], sections = [], semillas = [];
            
            try {
                parashot = await Parasha.getAll();
                portfolio = await Portfolio.getAll();
                try { ensenanzas = await Ensenanza.getAll(); } catch(e) { ensenanzas = []; }
                try { blogs = await BlogPost.getAll(); } catch(e) { blogs = []; }
                try { 
                    const SemillasTorah = require('../models/SemillasTorah');
                    semillas = await SemillasTorah.getAll(); 
                } catch(e) { semillas = []; }
                team = await Team.getAll();
                testimonials = await Testimonial.getAll();
                pricing = await Pricing.getAll();
                let subscribers = [];
                try {
                    const [subRows] = await db.query('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC');
                    subscribers = subRows || [];
                } catch(e) {
                    subscribers = [];
                }
                const sectionNames = ['hero', 'calendario', 'about', 'parashot', 'eventos', 'ensenanzas', 'blog', 'equipo', 'footer'];
                for (const name of sectionNames) {
                    try {
                        const [rows] = await db.query(`SELECT * FROM home_section_${name} LIMIT 1`);
                        if (rows.length > 0) {
                            sections.push({ ...rows[0], section_name: name });
                        }
                    } catch(e) {}
                }
            } catch (dbErr) {
                console.warn('⚠️ No se pudieron cargar datos del dashboard:', dbErr.message);
            }

            // Cargar secciones dinámicas y sus registros para las pestañas
            const DynamicSection = require('../models/DynamicSection');
            const EntityModel = require('../models/EntityModel');
            let dashboardDynamicSections = [];
            try {
                dashboardDynamicSections = await DynamicSection.getAll();
                for (let ds of dashboardDynamicSections) {
                    if (ds.data_table) {
                        try {
                            ds.records = await EntityModel.getAll(ds.data_table);
                        } catch (e) {
                            ds.records = [];
                        }
                    } else {
                        ds.records = [];
                    }
                }
            } catch(e) {
                console.warn('⚠️ No se pudieron cargar secciones dinámicas para dashboard:', e.message);
            }

            let eventCategories = [];
            try {
                eventCategories = await Portfolio.getCategories();
            } catch(e) {}

            let blogCategories = [];
            try {
                blogCategories = await BlogPost.getCategories();
            } catch(e) {}

            let semillasCategories = [];
            try {
                const SemillasTorah = require('../models/SemillasTorah');
                semillasCategories = await SemillasTorah.getCategories();
            } catch(e) {}

            res.render('admin/dashboard', {
                layout: 'admin/layout',
                parashot,
                portfolio,
                ensenanzas,
                blogs,
                semillas,
                team,
                testimonials,
                pricing,
                sections,
                dashboardDynamicSections,
                eventCategories,
                blogCategories,
                semillasCategories,
                subscribers: typeof subscribers !== 'undefined' ? subscribers : []
            });
        } catch (error) {
            next(error);
        }
    },

    // ==================== PARASHOT ====================
    createParasha: async (req, res) => {
        try {
            let { parasha_number, title, description, subtitle, content, image_url, pdf_file, icon, link, youtube_link } = req.body;
            
            if (req.files) {
                if (req.files['image_file'] && req.files['image_file'][0]) {
                    image_url = '/assets/parashot/' + req.files['image_file'][0].filename;
                }
                if (req.files['pdf_upload'] && req.files['pdf_upload'][0]) {
                    pdf_file = '/uploads/pdf/' + req.files['pdf_upload'][0].filename;
                }
            }

            console.log('--- Saving Parasha with image_url:', image_url);
            const Parasha = require('../models/Parasha');
            await Parasha.create({ parasha_number, title, description, subtitle, content, image_url, pdf_file, icon, link, youtube_link });
            res.redirect('/admin/dashboard#pills-services');
        } catch (error) {
            console.error('Error createParasha:', error);
            res.redirect('/admin/dashboard#pills-services');
        }
    },

    editParashaPage: async (req, res) => {
        try {
            const Parasha = require('../models/Parasha');
            const parasha = await Parasha.getById(req.params.id);
            if (!parasha) return res.redirect('/admin/dashboard');
            res.render('admin/edit_parasha', { layout: 'admin/layout', parasha });
        } catch (error) {
            res.redirect('/admin/dashboard');
        }
    },

    updateParasha: async (req, res) => {
        try {
            let { id, parasha_number, title, description, subtitle, content, image_url, pdf_file, icon, link, youtube_link } = req.body;
            
            if (req.files) {
                if (req.files['image_file'] && req.files['image_file'][0]) {
                    image_url = '/assets/parashot/' + req.files['image_file'][0].filename;
                }
                if (req.files['pdf_upload'] && req.files['pdf_upload'][0]) {
                    pdf_file = '/uploads/pdf/' + req.files['pdf_upload'][0].filename;
                }
            }

            console.log('--- Updating Parasha ID:', id, 'with image_url:', image_url);
            const Parasha = require('../models/Parasha');
            await Parasha.update(id, { parasha_number, title, description, subtitle, content, image_url, pdf_file, icon, link, youtube_link });
            res.redirect('/admin/dashboard#pills-services');
        } catch (error) {
            console.error('Error updateParasha:', error);
            res.redirect('/admin/dashboard#pills-services');
        }
    },

    deleteParasha: async (req, res) => {
        const Parasha = require('../models/Parasha');
        await Parasha.delete(req.params.id);
        res.redirect('/admin/dashboard#pills-services');
    },

    // ==================== EVENTOS (PORTFOLIO) ====================
    createPortfolio: async (req, res) => {
        try {
            let { title, category, subtitle, description, event_date, content, image_url } = req.body;
            if (req.file) {
                image_url = '/uploads/portfolio/' + req.file.filename;
            }
            
            const Portfolio = require('../models/Portfolio');
            await Portfolio.create({ title, subtitle, category, description, content, event_date: event_date || null, image_url });
            res.redirect('/admin/dashboard#pills-portfolio');
        } catch (error) {
            console.error('Error createPortfolio:', error);
            res.redirect('/admin/dashboard#pills-portfolio');
        }
    },

    editPortfolioPage: async (req, res) => {
        try {
            const Portfolio = require('../models/Portfolio');
            const evento = await Portfolio.getById(req.params.id);
            if (!evento) return res.redirect('/admin/dashboard#pills-portfolio');
            res.render('admin/edit_portfolio', { layout: 'admin/layout', evento });
        } catch (error) {
            res.redirect('/admin/dashboard#pills-portfolio');
        }
    },

    updatePortfolio: async (req, res) => {
        try {
            let { id, title, category, subtitle, description, event_date, content, image_url } = req.body;
            if (req.file) {
                image_url = '/uploads/portfolio/' + req.file.filename;
            }
            
            const formattedDate = event_date === '' ? null : event_date;

            const Portfolio = require('../models/Portfolio');
            await Portfolio.update(id, { title, subtitle, category, description, content, event_date: formattedDate, image_url });
            res.redirect('/admin/dashboard#pills-portfolio');
        } catch (error) {
            console.error('Error updatePortfolio:', error);
            res.redirect('/admin/dashboard#pills-portfolio');
        }
    },

    deletePortfolio: async (req, res) => {
        try {
            await db.query('DELETE FROM portfolio WHERE id = ?', [req.params.id]);
            res.redirect('/admin/dashboard#pills-portfolio');
        } catch (error) {
            console.error('Error deletePortfolio:', error);
            res.redirect('/admin/dashboard#pills-portfolio');
        }
    },

    // ==================== ENSEÑANZAS ====================
    createEnsenanza: async (req, res) => {
        try {
            let { title, subtitle, description, content, youtube_link, image_url } = req.body;
            if (req.file) {
                image_url = '/uploads/ensenanzas/' + req.file.filename;
            }
            
            const Ensenanza = require('../models/Ensenanza');
            await Ensenanza.create({
                title,
                subtitle: subtitle || '',
                description: description || '',
                content: content || '',
                youtube_link: youtube_link || '',
                image_url: image_url || ''
            });
            res.redirect('/admin/dashboard#pills-ensenanzas');
        } catch (error) {
            console.error('Error createEnsenanza:', error);
            res.redirect('/admin/dashboard#pills-ensenanzas');
        }
    },

    editEnsenanzaPage: async (req, res) => {
        try {
            const Ensenanza = require('../models/Ensenanza');
            const ensenanza = await Ensenanza.getById(req.params.id);
            if (!ensenanza) return res.redirect('/admin/dashboard#pills-ensenanzas');
            res.render('admin/edit_ensenanza', { layout: 'admin/layout', ensenanza });
        } catch (error) {
            console.error('Error editEnsenanzaPage:', error);
            res.redirect('/admin/dashboard#pills-ensenanzas');
        }
    },

    updateEnsenanza: async (req, res) => {
        try {
            let { id, title, subtitle, description, content, youtube_link, image_url } = req.body;
            if (req.file) {
                image_url = '/uploads/ensenanzas/' + req.file.filename;
            }
            
            const Ensenanza = require('../models/Ensenanza');
            await Ensenanza.update(id, {
                title,
                subtitle: subtitle || '',
                description: description || '',
                content: content || '',
                youtube_link: youtube_link || '',
                image_url: image_url || ''
            });
            res.redirect('/admin/dashboard#pills-ensenanzas');
        } catch (error) {
            console.error('Error updateEnsenanza:', error);
            res.redirect('/admin/dashboard#pills-ensenanzas');
        }
    },

    deleteEnsenanza: async (req, res) => {
        try {
            const Ensenanza = require('../models/Ensenanza');
            await Ensenanza.delete(req.params.id);
            res.redirect('/admin/dashboard#pills-ensenanzas');
        } catch (error) {
            console.error('Error deleteEnsenanza:', error);
            res.redirect('/admin/dashboard#pills-ensenanzas');
        }
    },

    // ==================== SEMILLAS DE TORAH ====================
    createSemillas: async (req, res) => {
        try {
            let { title, subtitle, category, author, description, content, youtube_link, is_published, image_url, pdf_file } = req.body;
            
            if (req.files) {
                if (req.files['image_file'] && req.files['image_file'][0]) {
                    image_url = '/uploads/semillas/' + req.files['image_file'][0].filename;
                }
                if (req.files['pdf_upload'] && req.files['pdf_upload'][0]) {
                    pdf_file = '/uploads/pdf/' + req.files['pdf_upload'][0].filename;
                }
            } else if (req.file) {
                image_url = '/uploads/semillas/' + req.file.filename;
            }

            const SemillasTorah = require('../models/SemillasTorah');
            await SemillasTorah.create({
                title,
                subtitle: subtitle || '',
                category: category || 'Parashá Infantil',
                author: author || 'Elva Avila',
                description: description || '',
                content: content || '',
                youtube_link: youtube_link || '',
                image_url: image_url || '',
                pdf_file: pdf_file || '',
                is_published: is_published !== '0' && is_published !== false
            });
            res.redirect('/admin/dashboard#pills-semillas');
        } catch (error) {
            console.error('Error createSemillas:', error);
            res.redirect('/admin/dashboard#pills-semillas');
        }
    },

    editSemillasPage: async (req, res) => {
        try {
            const SemillasTorah = require('../models/SemillasTorah');
            const item = await SemillasTorah.getById(req.params.id);
            if (!item) return res.redirect('/admin/dashboard#pills-semillas');
            res.render('admin/edit_semillas', { layout: 'admin/layout', item });
        } catch (error) {
            console.error('Error editSemillasPage:', error);
            res.redirect('/admin/dashboard#pills-semillas');
        }
    },

    updateSemillas: async (req, res) => {
        try {
            let { id, title, subtitle, category, author, description, content, youtube_link, is_published, image_url, pdf_file } = req.body;
            
            if (req.files) {
                if (req.files['image_file'] && req.files['image_file'][0]) {
                    image_url = '/uploads/semillas/' + req.files['image_file'][0].filename;
                }
                if (req.files['pdf_upload'] && req.files['pdf_upload'][0]) {
                    pdf_file = '/uploads/pdf/' + req.files['pdf_upload'][0].filename;
                }
            } else if (req.file) {
                image_url = '/uploads/semillas/' + req.file.filename;
            }

            const SemillasTorah = require('../models/SemillasTorah');
            await SemillasTorah.update(id, {
                title,
                subtitle: subtitle || '',
                category: category || 'Parashá Infantil',
                author: author || 'Elva Avila',
                description: description || '',
                content: content || '',
                youtube_link: youtube_link || '',
                image_url: image_url || '',
                pdf_file: pdf_file || '',
                is_published: is_published !== '0' && is_published !== false
            });
            res.redirect('/admin/dashboard#pills-semillas');
        } catch (error) {
            console.error('Error updateSemillas:', error);
            res.redirect('/admin/dashboard#pills-semillas');
        }
    },

    deleteSemillas: async (req, res) => {
        try {
            const SemillasTorah = require('../models/SemillasTorah');
            await SemillasTorah.delete(req.params.id);
            res.redirect('/admin/dashboard#pills-semillas');
        } catch (error) {
            console.error('Error deleteSemillas:', error);
            res.redirect('/admin/dashboard#pills-semillas');
        }
    },

    // ==================== BLOG / ARTÍCULOS ====================
    createBlogPost: async (req, res) => {
        try {
            let { title, subtitle, category, author, summary, content, tags, is_published, image_url } = req.body;
            if (req.file) {
                image_url = '/uploads/blog/' + req.file.filename;
            }
            
            const BlogPost = require('../models/BlogPost');
            await BlogPost.create({
                title,
                subtitle: subtitle || '',
                category: category || 'Reflexiones',
                author: author || 'Hablemos de YHWH',
                summary: summary || '',
                content: content || '',
                tags: tags || '',
                is_published: is_published !== '0' && is_published !== false,
                image_url: image_url || ''
            });
            res.redirect('/admin/dashboard#pills-blog');
        } catch (error) {
            console.error('Error createBlogPost:', error);
            res.redirect('/admin/dashboard#pills-blog');
        }
    },

    editBlogPostPage: async (req, res) => {
        try {
            const BlogPost = require('../models/BlogPost');
            const post = await BlogPost.getById(req.params.id);
            if (!post) return res.redirect('/admin/dashboard#pills-blog');
            
            let blogCategories = [];
            try {
                blogCategories = await BlogPost.getCategories();
            } catch(e) {}

            res.render('admin/edit_blog', { layout: 'admin/layout', post, blogCategories });
        } catch (error) {
            console.error('Error editBlogPostPage:', error);
            res.redirect('/admin/dashboard#pills-blog');
        }
    },

    updateBlogPost: async (req, res) => {
        try {
            let { id, title, subtitle, category, author, summary, content, tags, is_published, image_url } = req.body;
            if (req.file) {
                image_url = '/uploads/blog/' + req.file.filename;
            }
            
            const BlogPost = require('../models/BlogPost');
            await BlogPost.update(id, {
                title,
                subtitle: subtitle || '',
                category: category || 'Reflexiones',
                author: author || 'Hablemos de YHWH',
                summary: summary || '',
                content: content || '',
                tags: tags || '',
                is_published: is_published !== '0' && is_published !== false,
                image_url: image_url || ''
            });
            res.redirect('/admin/dashboard#pills-blog');
        } catch (error) {
            console.error('Error updateBlogPost:', error);
            res.redirect('/admin/dashboard#pills-blog');
        }
    },

    deleteBlogPost: async (req, res) => {
        try {
            const BlogPost = require('../models/BlogPost');
            await BlogPost.delete(req.params.id);
            res.redirect('/admin/dashboard#pills-blog');
        } catch (error) {
            console.error('Error deleteBlogPost:', error);
            res.redirect('/admin/dashboard#pills-blog');
        }
    },

    // ==================== EQUIPO ====================
    createTeamMember: async (req, res) => {
        try {
            let { name, role, description, img } = req.body;
            if (req.file) {
                img = '/uploads/team/' + req.file.filename;
            }
            await db.query('INSERT INTO team (name, role, description, img) VALUES (?, ?, ?, ?)', [name, role, description || '', img || '']);
            res.redirect('/admin/dashboard#pills-team');
        } catch (error) {
            console.error('Error createTeamMember:', error);
            res.redirect('/admin/dashboard#pills-team');
        }
    },

    updateTeamMember: async (req, res) => {
        try {
            let { id, name, role, description, img } = req.body;
            if (req.file) {
                img = '/uploads/team/' + req.file.filename;
            }
            await db.query('UPDATE team SET name = ?, role = ?, description = ?, img = ? WHERE id = ?', [name, role, description, img, id]);
            res.redirect('/admin/dashboard#pills-team');
        } catch (error) {
            console.error('Error updateTeamMember:', error);
            res.redirect('/admin/dashboard#pills-team');
        }
    },

    deleteTeamMember: async (req, res) => {
        try {
            await db.query('DELETE FROM team WHERE id = ?', [req.params.id]);
            res.redirect('/admin/dashboard#pills-team');
        } catch (error) {
            console.error('Error deleteTeamMember:', error);
            res.redirect('/admin/dashboard#pills-team');
        }
    },

    // ==================== TESTIMONIOS ====================
    createTestimonial: async (req, res) => {
        try {
            const { name, role, text, img } = req.body;
            await db.query('INSERT INTO testimonials (name, role, text, img) VALUES (?, ?, ?, ?)', [name, role, text, img || '']);
            res.redirect('/admin/dashboard#pills-testimonials');
        } catch (error) {
            console.error('Error createTestimonial:', error);
            res.redirect('/admin/dashboard#pills-testimonials');
        }
    },

    updateTestimonial: async (req, res) => {
        try {
            const { id, name, role, text, img } = req.body;
            await db.query('UPDATE testimonials SET name = ?, role = ?, text = ?, img = ? WHERE id = ?', [name, role, text, img, id]);
            res.redirect('/admin/dashboard#pills-testimonials');
        } catch (error) {
            console.error('Error updateTestimonial:', error);
            res.redirect('/admin/dashboard#pills-testimonials');
        }
    },

    deleteTestimonial: async (req, res) => {
        try {
            await db.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
            res.redirect('/admin/dashboard#pills-testimonials');
        } catch (error) {
            console.error('Error deleteTestimonial:', error);
            res.redirect('/admin/dashboard#pills-testimonials');
        }
    },

    // ==================== PRICING ====================
    updatePricing: async (req, res) => {
        const { id, name, price, features } = req.body;
        await db.query('UPDATE pricing SET name = ?, price = ?, features = ? WHERE id = ?', [name, price, features, id]);
        res.redirect('/admin/dashboard#pricing');
    },

    // ==================== SECCIONES DEL HOME (Hero, About, etc.) ====================
    sectionsPage: async (req, res) => {
        try {
            const sectionNames = ['hero', 'calendario', 'about', 'parashot', 'eventos', 'ensenanzas', 'blog', 'equipo', 'footer'];
            const sections = [];
            for (const name of sectionNames) {
                try {
                    const [rows] = await db.query(`SELECT * FROM home_section_${name} LIMIT 1`);
                    if (rows.length > 0) {
                        sections.push({
                            ...rows[0],
                            section_name: name,
                            tableName: `home_section_${name}`
                        });
                    }
                } catch(e) {}
            }
            res.render('admin/sections', { layout: 'admin/layout', sections });
        } catch (error) {
            console.error('Error sectionsPage:', error);
            res.redirect('/admin/dashboard');
        }
    },

    updateSection: async (req, res) => {
        try {
            const { id, tableName, title, subtitle, content, image_url } = req.body;
            let finalImageUrl = image_url;
            if (req.file) {
                finalImageUrl = '/uploads/general/' + req.file.filename;
            }
            
            if (!tableName) throw new Error('Nombre de tabla no especificado');

            await db.query(
                `UPDATE ${tableName} SET title = ?, subtitle = ?, content = ?, image_url = ? WHERE id = ?`,
                [title, subtitle, content, finalImageUrl, id]
            );
            res.redirect('/admin/sections');
        } catch (error) {
            console.error('Error updateSection:', error);
            res.redirect('/admin/sections');
        }
    },

    // ==================== CONFIGURACIÓN DEL SITIO ====================
    settingsPage: async (req, res) => {
        try {
            const settingsGrouped = await SiteSettings.getAllGrouped();
            res.render('admin/settings', { layout: 'admin/layout', settingsGrouped });
        } catch (error) {
            console.error('Error settingsPage:', error);
            res.redirect('/admin/dashboard');
        }
    },

    updateSettings: async (req, res) => {
        try {
            const data = req.body;
            // data viene como { setting_key: value, ... }
            await SiteSettings.setMultiple(data);
            res.redirect('/admin/settings');
        } catch (error) {
            console.error('Error updateSettings:', error);
            res.redirect('/admin/settings');
        }
    },

    // ==================== SESIÓN ====================
    logout: (req, res) => {
        req.session.destroy();
        res.redirect('/admin/login');
    },

    // ==================== USUARIOS (Solo Admins) ====================
    usersPage: async (req, res) => {
        try {
            const [users] = await db.query('SELECT id, username, email, role FROM users');
            res.render('admin/users', { layout: 'admin/layout', users });
        } catch (error) {
            console.error('Error usersPage:', error);
            res.redirect('/admin/dashboard');
        }
    },

    createUser: async (req, res) => {
        try {
            const { username, password, role, email } = req.body;
            const hashedP = await bcrypt.hash(password, 10);
            await db.query('INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)', [username, hashedP, role, email]);
            res.redirect('/admin/users');
        } catch (error) {
            console.error('Error createUser:', error);
            res.redirect('/admin/users');
        }
    },

    deleteUser: async (req, res) => {
        try {
            await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
            res.redirect('/admin/users');
        } catch (error) {
            console.error('Error deleteUser:', error);
            res.redirect('/admin/users');
        }
    },

    // ==================== SECCIONES DINÁMICAS ====================
    listDynamicSections: async (req, res, next) => {
        try {
            let dynamicSections = [];
            try {
                if (req.session.role === 'admin') {
                    dynamicSections = await DynamicSection.getAll();
                } else {
                    dynamicSections = await DynamicSection.getAllByUserId(req.session.userId);
                }
            } catch (dbErr) {
                 console.warn('⚠️ No se pudieron cargar secciones dinámicas (DB desconectada)');
            }

            res.render('admin/dynamic_sections', {
                layout: 'admin/layout',
                dynamicSections
            });
        } catch (error) {
            next(error);
        }
    },

    createDynamicSectionPage: async (req, res) => {
        try {
            const [editors] = await db.query("SELECT id, username FROM users WHERE role = 'editor'");
            res.render('admin/create_dynamic_section', { layout: 'admin/layout', editors });
        } catch (error) {
            console.error('Error createDynamicSectionPage:', error);
            res.redirect('/admin/dynamic-sections');
        }
    },


    createDynamicSection: async (req, res) => {
        try {
            const { title, section_type, summary, content, icon, image_url, nav_order, show_in_navbar, allowed_editors, has_table, field_names, field_types } = req.body;
            const slug = DynamicSection.generateSlug(title);

            // Forzamos la creación de una tabla para cada nueva sección
            let data_table = null;
            const fields = [];
            
            if (field_names) {
                const names = Array.isArray(field_names) ? field_names : [field_names];
                const types = Array.isArray(field_types) ? field_types : [field_types];

                names.forEach((name, i) => {
                    if (name.trim()) {
                        fields.push({ name: name.trim(), type: types[i] });
                    }
                });
            }

            // Si no hay campos definidos, agregamos unos por defecto para que la sección sea funcional de inmediato
            if (fields.length === 0) {
                fields.push({ name: 'parasha_number', type: 'string' });
                fields.push({ name: 'title', type: 'string' });
                fields.push({ name: 'subtitle', type: 'string' });
                fields.push({ name: 'description', type: 'text' });
                fields.push({ name: 'content', type: 'text' });
                fields.push({ name: 'youtube_link', type: 'string' });
                fields.push({ name: 'pdf_file', type: 'string' });
                fields.push({ name: 'icon', type: 'string' });
                fields.push({ name: 'link', type: 'string' });
                fields.push({ name: 'image_url', type: 'string' });
            }

            // Crear la tabla siempre
            data_table = await EntityModel.createDynamicTable(slug, fields);

            const result = await DynamicSection.create({
                title,
                slug,
                section_type: section_type || 'inline',
                summary,
                content,
                icon: icon || 'bi-file-text',
                image_url,
                nav_order: parseInt(nav_order) || 0,
                is_active: true,
                show_in_navbar: show_in_navbar === 'on',
                data_table
            });

            if (req.session.role === 'admin' && result.insertId) {
                let editorIds = [];
                if (Array.isArray(allowed_editors)) editorIds = allowed_editors;
                else if (allowed_editors) editorIds = [allowed_editors];

                await DynamicSection.setPermissions(result.insertId, editorIds);
            }


            res.redirect('/admin/dynamic-sections');
        } catch (error) {
            console.error('Error creating dynamic section:', error);
            res.redirect('/admin/dynamic-sections');
        }
    },

    editDynamicSection: async (req, res) => {
        try {
            const sectionId = req.params.id;
            if (req.session.role !== 'admin') {
                const hasPerm = await DynamicSection.hasPermission(sectionId, req.session.userId);
                if (!hasPerm) return res.status(403).send('No tienes permiso.');
            }

            const section = await DynamicSection.getById(sectionId);
            if (!section) return res.redirect('/admin/dynamic-sections');

            const [editors] = await db.query("SELECT id, username FROM users WHERE role = 'editor'");

            const sectionEditors = await DynamicSection.getPermissions(sectionId);

            res.render('admin/edit_dynamic_section', {
                layout: 'admin/layout',
                section,
                editors,
                sectionEditors
            });
        } catch (error) {
            res.redirect('/admin/dynamic-sections');
        }
    },

    updateDynamicSection: async (req, res) => {
        try {
            const { id, title, section_type, summary, content, icon, image_url, nav_order, is_active, show_in_navbar, allowed_editors, data_table } = req.body;
            if (req.session.role !== 'admin') {
                const hasPerm = await DynamicSection.hasPermission(id, req.session.userId);
                if (!hasPerm) return res.status(403).send('No tienes permiso.');
            }

            const existing = await DynamicSection.getById(id);
            const slug = DynamicSection.generateSlug(title);
            const resolvedDataTable = data_table !== undefined && data_table !== '' ? data_table : (existing ? existing.data_table : null);

            await DynamicSection.update(id, {
                title,
                slug,
                section_type,
                summary,
                content,
                icon: icon || 'bi-file-text',
                image_url,
                nav_order: parseInt(nav_order) || 0,
                is_active: is_active === 'on',
                show_in_navbar: show_in_navbar === 'on',
                data_table: resolvedDataTable
            });

            if (req.session.role === 'admin') {
                let editorIds = [];
                if (Array.isArray(allowed_editors)) editorIds = allowed_editors;
                else if (allowed_editors) editorIds = [allowed_editors];
                await DynamicSection.setPermissions(id, editorIds);
            }

            res.redirect('/admin/dynamic-sections');
        } catch (error) {
            console.error('Error updating dynamic section:', error);
            res.redirect('/admin/dynamic-sections');
        }
    },

    deleteDynamicSection: async (req, res) => {
        if (req.session.role !== 'admin') return res.status(403).send('Restringido.');
        await DynamicSection.delete(req.params.id);
        res.redirect('/admin/dynamic-sections');
    },

    toggleDynamicSection: async (req, res) => {
        const sectionId = req.params.id;
        if (req.session.role !== 'admin') {
            const hasPerm = await DynamicSection.hasPermission(sectionId, req.session.userId);
            if (!hasPerm) return res.status(403).send('Restringido.');
        }

        const section = await DynamicSection.getById(sectionId);
        if (section) {
            await DynamicSection.update(section.id, {
                ...section,
                is_active: !section.is_active,
                show_in_navbar: section.show_in_navbar === 1 || section.show_in_navbar === true
            });
        }
        res.redirect('/admin/dynamic-sections');
    },

    manageEntity: async (req, res) => {
        try {
            const tableName = req.params.table;
            const columns = await EntityModel.getColumns(tableName);
            const data = await EntityModel.getAll(tableName);
            const [rows] = await db.query('SELECT title FROM dynamic_sections WHERE data_table = ?', [tableName]);

            res.render('admin/manage_entity', {
                layout: 'admin/layout',
                tableName,
                columns,
                data,
                title: rows[0] ? rows[0].title : tableName
            });
        } catch (error) {
            console.error(error);
            res.redirect('/admin/dynamic-sections');
        }
    },

    addEntityData: async (req, res) => {
        try {
            const tableName = req.params.table;
            const data = { ...req.body };
            
            if (req.files || req.file) {
                const columns = await EntityModel.getColumns(tableName);
                const imgCol = columns.find(c => (c.Field.includes('imagen') || c.Field.includes('image') || c.Field.includes('img') || c.Field.includes('url')) && !c.Field.includes('youtube'));
                if (imgCol) {
                    if (req.files && req.files['image_file'] && req.files['image_file'][0]) {
                        data[imgCol.Field] = '/uploads/entity/' + req.files['image_file'][0].filename;
                    } else if (req.file) {
                        data[imgCol.Field] = '/uploads/entity/' + req.file.filename;
                    }
                }
                const pdfCol = columns.find(c => c.Field.includes('pdf'));
                if (req.files && req.files['pdf_upload'] && req.files['pdf_upload'][0] && pdfCol) {
                    data[pdfCol.Field] = '/uploads/pdf/' + req.files['pdf_upload'][0].filename;
                }
            }
            
            // Clean up empty fields to prevent errors with INT columns like parasha_number
            Object.keys(data).forEach(key => {
                if (data[key] === '') data[key] = null;
            });

            await EntityModel.insert(tableName, data);
            res.redirect(`/admin/dashboard#pills-ds-${tableName}`);
        } catch (error) {
            console.error('Error addEntityData:', error);
            res.redirect(`/admin/dashboard#pills-ds-${req.params.table}`);
        }
    },

    editEntityData: async (req, res) => {
        try {
            const { table, id } = req.params;
            const columns = await EntityModel.getColumns(table);
            const data = await EntityModel.getById(table, id);
            const [rows] = await db.query('SELECT title FROM dynamic_sections WHERE data_table = ?', [table]);

            if (!data) return res.redirect(`/admin/dashboard#pills-ds-${table}`);

            res.render('admin/edit_entity', {
                layout: 'admin/layout',
                tableName: table,
                columns,
                data,
                title: rows[0] ? rows[0].title : table
            });
        } catch (error) {
            console.error('Error editEntityData:', error);
            res.redirect(`/admin/dashboard`);
        }
    },

    updateEntityData: async (req, res) => {
        try {
            const { table, id } = req.params;
            const data = { ...req.body };
            
            if (req.files || req.file) {
                const columns = await EntityModel.getColumns(table);
                const imgCol = columns.find(c => (c.Field.includes('imagen') || c.Field.includes('image') || c.Field.includes('img') || c.Field.includes('url')) && !c.Field.includes('youtube'));
                if (imgCol) {
                    if (req.files && req.files['image_file'] && req.files['image_file'][0]) {
                        data[imgCol.Field] = '/uploads/entity/' + req.files['image_file'][0].filename;
                    } else if (req.file) {
                        data[imgCol.Field] = '/uploads/entity/' + req.file.filename;
                    }
                }
                const pdfCol = columns.find(c => c.Field.includes('pdf'));
                if (req.files && req.files['pdf_upload'] && req.files['pdf_upload'][0] && pdfCol) {
                    data[pdfCol.Field] = '/uploads/pdf/' + req.files['pdf_upload'][0].filename;
                }
            }
            
            // Clean up empty fields to prevent errors with INT columns like parasha_number
            Object.keys(data).forEach(key => {
                if (data[key] === '') data[key] = null;
            });

            await EntityModel.update(table, id, data);
            res.redirect(`/admin/dashboard#pills-ds-${table}`);
        } catch (error) {
            console.error('Error updateEntityData:', error);
            res.redirect(`/admin/dashboard#pills-ds-${req.params.table}`);
        }
    },

    deleteEntityData: async (req, res) => {
        const { table, id } = req.params;
        await EntityModel.delete(table, id);
        res.redirect(`/admin/dashboard#pills-ds-${table}`);
    },

    deleteSubscriber: async (req, res) => {
        try {
            const { id } = req.params;
            await db.query('DELETE FROM newsletter_subscribers WHERE id = ?', [id]);
            res.redirect('/admin/dashboard#pills-subscribers');
        } catch (error) {
            console.error('Error deleteSubscriber:', error);
            res.redirect('/admin/dashboard#pills-subscribers');
        }
    },

    // --- GESTIÓN DE ALIYOT (Lecturas Diarias de la Torá) ---
    aliyotIndex: async (req, res) => {
        try {
            const Aliyah = require('../models/Aliyah');
            const parashot = await Aliyah.getParashotOverview();
            res.render('admin/aliyot', {
                title: 'Gestión de Aliyot (Lecturas Diarias)',
                activePage: 'aliyot',
                parashot
            });
        } catch (error) {
            console.error('Error aliyotIndex:', error);
            res.status(500).send('Error al cargar Aliyot: ' + error.message);
        }
    },

    editAliyotPage: async (req, res) => {
        try {
            const Parasha = require('../models/Parasha');
            const Aliyah = require('../models/Aliyah');
            const parashaId = req.params.parashaId;
            const parasha = await Parasha.getById(parashaId);
            if (!parasha) {
                return res.redirect('/admin/aliyot');
            }

            const aliyotRows = await Aliyah.getByParashaId(parashaId);
            
            const dayNames = [
                '1ª Aliyá (Domingo - Día 1)',
                '2ª Aliyá (Lunes - Día 2)',
                '3ª Aliyá (Martes - Día 3)',
                '4ª Aliyá (Miércoles - Día 4)',
                '5ª Aliyá (Jueves - Día 5)',
                '6ª Aliyá (Viernes - Día 6)',
                '7ª Aliyá (Shabat - Día 7)'
            ];

            const aliyotMap = {};
            for (let i = 1; i <= 7; i++) {
                const found = aliyotRows.find(a => Number(a.aliyah_number) === i);
                aliyotMap[i] = found || {
                    id: null,
                    parasha_id: parasha.id,
                    aliyah_number: i,
                    title: dayNames[i - 1],
                    verses_reference: '',
                    content: '',
                    audio_url: ''
                };
            }

            res.render('admin/edit_aliyot', {
                title: `Editar Aliyot: ${parasha.title}`,
                activePage: 'aliyot',
                parasha,
                aliyotMap,
                dayNames,
                savedDay: req.query.saved || '1'
            });
        } catch (error) {
            console.error('Error editAliyotPage:', error);
            res.status(500).send('Error al cargar editor de Aliyot: ' + error.message);
        }
    },

    saveAliyah: async (req, res) => {
        try {
            const Aliyah = require('../models/Aliyah');
            const { parasha_id, aliyah_number, title, verses_reference, content, existing_audio_url, remove_audio } = req.body;

            let audio_url = existing_audio_url || '';

            if (remove_audio === '1') {
                audio_url = '';
            }

            if (req.files && req.files['audio_file'] && req.files['audio_file'][0]) {
                audio_url = '/uploads/audios/' + req.files['audio_file'][0].filename;
            } else if (req.body.custom_audio_url && req.body.custom_audio_url.trim() !== '') {
                audio_url = req.body.custom_audio_url.trim();
            }

            await Aliyah.upsert({
                parasha_id: Number(parasha_id),
                aliyah_number: Number(aliyah_number),
                title: title || `Aliyá ${aliyah_number}`,
                verses_reference: verses_reference || '',
                content: content || '',
                audio_url: audio_url
            });

            res.redirect(`/admin/aliyot/edit/${parasha_id}?saved=${aliyah_number}`);
        } catch (error) {
            console.error('Error saveAliyah:', error);
            res.redirect(`/admin/aliyot/edit/${req.body.parasha_id}?error=1`);
        }
    },

    deleteAliyahAudio: async (req, res) => {
        try {
            const Aliyah = require('../models/Aliyah');
            const { id, parashaId, aliyahNumber } = req.params;
            if (id && id !== 'null') {
                await Aliyah.removeAudio(id);
            }
            res.redirect(`/admin/aliyot/edit/${parashaId}?saved=${aliyahNumber}`);
        } catch (error) {
            console.error('Error deleteAliyahAudio:', error);
            res.redirect('/admin/aliyot');
        }
    }
};

module.exports = adminController;
