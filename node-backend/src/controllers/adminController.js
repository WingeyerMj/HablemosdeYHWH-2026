const Section = require('../models/Section');
const Parasha = require('../models/Parasha');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const adminController = {
    loginPage: (req, res) => {
        res.render('admin/login', { layout: 'admin/layout', error: null });
    },

    login: async (req, res) => {
        const { username, password } = req.body;
        try {
            const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
            const user = rows[0];

            if (user && await bcrypt.compare(password, user.password)) {
                req.session.userId = user.id;
                req.session.username = user.username;
                req.session.role = user.role;
                return res.redirect('/admin/dashboard');
            }
            res.render('admin/login', { layout: 'admin/layout', error: 'Credenciales inválidas' });
        } catch (error) {
            console.error(error);
            res.render('admin/login', { layout: 'admin/layout', error: 'Error en el servidor' });
        }
    },

    dashboard: async (req, res, next) => {
        try {
            const sections = await Section.getAll();
            const parashot = await Parasha.getLatest(10);
            res.render('admin/dashboard', { layout: 'admin/layout', sections, parashot });
        } catch (error) {
            next(error);
        }
    },

    createParasha: async (req, res) => {
        const { title, description, icon, link } = req.body;
        await Parasha.create({ title, description, icon, link });
        res.redirect('/admin/dashboard');
    },

    deleteParasha: async (req, res) => {
        await Parasha.delete(req.params.id);
        res.redirect('/admin/dashboard');
    },

    editSection: async (req, res) => {
        const section = await Section.getByName(req.params.name);
        res.render('admin/edit_section', { layout: 'admin/layout', section });
    },

    updateSection: async (req, res) => {
        const { id, title, subtitle, content, image_url } = req.body;
        await Section.update(id, { title, subtitle, content, image_url });
        res.redirect('/admin/dashboard');
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
        const { username, password, email, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, email, role]);
        res.redirect('/admin/users');
    },

    deleteUser: async (req, res) => {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.redirect('/admin/users');
    }
};

module.exports = adminController;
