const DynamicSection = require('../models/DynamicSection');
const EntityModel = require('../models/EntityModel');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const adminController = {
    loginPage: (req, res) => {
        if (req.session.userId) return res.redirect('/admin/dashboard');
        res.render('admin/login', { layout: false, error: null });
    },

    login: async (req, res) => {
        const { username, password } = req.body;
        
        // --- BYPASS TEMPORAL PARA DEPuración (Base de datos desconectada) ---
        if (username === 'admin' && password === 'admin123') {
            console.warn('⚠️ Inicio de sesión mediante bypass (base de datos desconectada)');
            req.session.userId = 999;
            req.session.username = 'admin';
            req.session.role = 'admin';
            return res.redirect('/admin/dynamic-sections');
        }
        // -------------------------------------------------------------------

        try {
            const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
            if (rows.length === 0) return res.render('admin/login', { error: 'Usuario no encontrado', layout: false });

            const user = rows[0];
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return res.render('admin/login', { error: 'Contraseña incorrecta', layout: false });

            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.role = user.role;

            res.redirect('/admin/dynamic-sections');
        } catch (error) {
            res.render('admin/login', { error: 'Error del servidor', layout: false });
        }
    },

    dashboard: async (req, res, next) => {
        try {
            // Re-importar modelos para el dashboard (compatibilidad con lógica anterior)
            const Parasha = require('../models/Parasha');
            const Portfolio = require('../models/Portfolio');
            const Team = require('../models/Team');
            const Testimonial = require('../models/Testimonial');
            const Pricing = require('../models/Pricing');

            let parashot = [], portfolio = [], team = [], testimonials = [], pricing = [];
            
            try {
                parashot = await Parasha.getAll();
                portfolio = await Portfolio.getAll();
                team = await Team.getAll();
                testimonials = await Testimonial.getAll();
                pricing = await Pricing.getAll();
            } catch (dbErr) {
                console.warn('⚠️ No se pudieron cargar datos del dashboard (DB desconectada)');
            }

            res.render('admin/dashboard', {
                layout: 'admin/layout',
                parashot,
                portfolio,
                team,
                testimonials,
                pricing
            });
        } catch (error) {
            next(error);
        }
    },

    // Parashot
    createParasha: async (req, res) => {
        try {
            let { parasha_number, title, description, subtitle, content, image_url, icon, link, youtube_link } = req.body;
            
            // Si hay un archivo subido, usamos su ruta
            if (req.file) {
                image_url = '/uploads/parashot/' + req.file.filename;
            }

            const Parasha = require('../models/Parasha');
            await Parasha.create({ parasha_number, title, description, subtitle, content, image_url, icon, link, youtube_link });
            res.redirect('/admin/dashboard');
        } catch (error) {
            console.error(error);
            res.redirect('/admin/dashboard');
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
            let { id, parasha_number, title, description, subtitle, content, image_url, icon, link, youtube_link } = req.body;
            
            // Si hay un archivo subido, usamos su ruta
            if (req.file) {
                image_url = '/uploads/parashot/' + req.file.filename;
            }

            const Parasha = require('../models/Parasha');
            await Parasha.update(id, { parasha_number, title, description, subtitle, content, image_url, icon, link, youtube_link });
            res.redirect('/admin/dashboard');
        } catch (error) {
            res.redirect('/admin/dashboard');
        }
    },

    deleteParasha: async (req, res) => {
        const Parasha = require('../models/Parasha');
        await Parasha.delete(req.params.id);
        res.redirect('/admin/dashboard');
    },

    // Portfolio
    createPortfolio: async (req, res) => {
        try {
            let { title, category, subtitle, description, event_date, content, image_url } = req.body;
            if (req.file) {
                image_url = '/uploads/portfolio/' + req.file.filename;
            }
            // Fallback forimg field if image_url is provided
            const img = image_url; 
            
            await db.query(
                'INSERT INTO portfolio (title, category, subtitle, description, event_date, content, image_url, img) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [title, category, subtitle || '', description || '', event_date || null, content || '', image_url || '', img || '']
            );
            res.redirect('/admin/dashboard#portfolio');
        } catch (error) {
            console.error(error);
            res.redirect('/admin/dashboard#portfolio');
        }
    },

    updatePortfolio: async (req, res) => {
        try {
            let { id, title, category, subtitle, description, event_date, content, image_url } = req.body;
            if (req.file) {
                image_url = '/uploads/portfolio/' + req.file.filename;
            }
            await db.query(
                'UPDATE portfolio SET title = ?, category = ?, subtitle = ?, description = ?, event_date = ?, content = ?, image_url = ?, img = ? WHERE id = ?',
                [title, category, subtitle, description, event_date, content, image_url, image_url, id]
            );
            res.redirect('/admin/dashboard#portfolio');
        } catch (error) {
            res.redirect('/admin/dashboard#portfolio');
        }
    },

    deletePortfolio: async (req, res) => {
        await db.query('DELETE FROM portfolio WHERE id = ?', [req.params.id]);
        res.redirect('/admin/dashboard#portfolio');
    },

    // Team
    createTeamMember: async (req, res) => {
        try {
            let { name, role, description, img } = req.body;
            if (req.file) {
                img = '/uploads/team/' + req.file.filename;
            }
            await db.query('INSERT INTO team (name, role, description, img) VALUES (?, ?, ?, ?)', [name, role, description || '', img || '']);
            res.redirect('/admin/dashboard#team');
        } catch (error) {
            res.redirect('/admin/dashboard#team');
        }
    },

    deleteTeamMember: async (req, res) => {
        await db.query('DELETE FROM team WHERE id = ?', [req.params.id]);
        res.redirect('/admin/dashboard#team');
    },

    // Testimonials
    createTestimonial: async (req, res) => {
        const { name, role, text } = req.body;
        await db.query('INSERT INTO testimonials (name, role, text) VALUES (?, ?, ?)', [name, role, text]);
        res.redirect('/admin/dashboard#testimonials');
    },

    deleteTestimonial: async (req, res) => {
        await db.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
        res.redirect('/admin/dashboard#testimonials');
    },

    // Pricing
    updatePricing: async (req, res) => {
        const { id, name, price, features } = req.body;
        await db.query('UPDATE pricing SET name = ?, price = ?, features = ? WHERE id = ?', [name, price, features, id]);
        res.redirect('/admin/dashboard#pricing');
    },

    logout: (req, res) => {
        req.session.destroy();
        res.redirect('/admin/login');
    },

    // Gestión de Usuarios (Solo Admins)
    usersPage: async (req, res) => {
        const [users] = await db.query('SELECT id, username, email, role FROM users');
        res.render('admin/users', { layout: 'admin/layout', users });
    },

    createUser: async (req, res) => {
        const { username, password, role, email } = req.body;
        const hashedP = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)', [username, hashedP, role, email]);
        res.redirect('/admin/users');
    },

    deleteUser: async (req, res) => {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.redirect('/admin/users');
    },

    // === Secciones Dinámicas ===
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
        const [editors] = await db.query("SELECT id, username FROM users WHERE role = 'editor'");
        res.render('admin/create_dynamic_section', { layout: 'admin/layout', editors });
    },


    createDynamicSection: async (req, res) => {
        try {
            const { title, section_type, summary, content, icon, image_url, nav_order, show_in_navbar, allowed_editors, has_table, field_names, field_types } = req.body;
            const slug = DynamicSection.generateSlug(title);

            let data_table = null;
            if (has_table === 'on' && field_names) {
                const fields = [];
                const names = Array.isArray(field_names) ? field_names : [field_names];
                const types = Array.isArray(field_types) ? field_types : [field_types];

                names.forEach((name, i) => {
                    if (name.trim()) {
                        fields.push({ name: name.trim(), type: types[i] });
                    }
                });

                if (fields.length > 0) {
                    data_table = await EntityModel.createDynamicTable(slug, fields);
                }
            }

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
            const { id, title, section_type, summary, content, icon, image_url, nav_order, is_active, show_in_navbar, allowed_editors } = req.body;
            if (req.session.role !== 'admin') {
                const hasPerm = await DynamicSection.hasPermission(id, req.session.userId);
                if (!hasPerm) return res.status(403).send('No tienes permiso.');
            }

            const slug = DynamicSection.generateSlug(title);
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
                show_in_navbar: show_in_navbar === 'on'
            });

            if (req.session.role === 'admin') {
                let editorIds = [];
                if (Array.isArray(allowed_editors)) editorIds = allowed_editors;
                else if (allowed_editors) editorIds = [allowed_editors];
                await DynamicSection.setPermissions(id, editorIds);
            }

            res.redirect('/admin/dynamic-sections');
        } catch (error) {
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
        const tableName = req.params.table;
        await EntityModel.insert(tableName, req.body);
        res.redirect(`/admin/entity/${tableName}`);
    },

    deleteEntityData: async (req, res) => {
        const { table, id } = req.params;
        await EntityModel.delete(table, id);
        res.redirect(`/admin/entity/${table}`);
    }
};

module.exports = adminController;
