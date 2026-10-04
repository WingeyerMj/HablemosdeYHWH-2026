const db = require('../config/db');

class Interaction {
    static async ensureTable() {
        try {
            // 1. Tabla de Likes / Reacciones
            const createLikesSql = `
                CREATE TABLE IF NOT EXISTS item_likes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    entity_type VARCHAR(50) NOT NULL,
                    entity_id INT NOT NULL,
                    ip_address VARCHAR(100) DEFAULT NULL,
                    user_id INT DEFAULT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_entity (entity_type, entity_id),
                    INDEX idx_ip (ip_address)
                )
            `;
            await db.query(createLikesSql);

            // 2. Tabla de Comentarios (con soporte para aprobación y respuesta de administración)
            const createCommentsSql = `
                CREATE TABLE IF NOT EXISTS item_comments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    entity_type VARCHAR(50) NOT NULL,
                    entity_id INT NOT NULL,
                    user_name VARCHAR(150) NOT NULL,
                    user_email VARCHAR(150) DEFAULT NULL,
                    comment_text TEXT NOT NULL,
                    parent_id INT DEFAULT NULL,
                    avatar_color VARCHAR(30) DEFAULT '#d4a853',
                    is_approved BOOLEAN DEFAULT FALSE,
                    admin_reply TEXT DEFAULT NULL,
                    admin_reply_at TIMESTAMP NULL DEFAULT NULL,
                    admin_reply_by VARCHAR(100) DEFAULT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_entity_comments (entity_type, entity_id),
                    INDEX idx_approved (is_approved),
                    INDEX idx_parent (parent_id)
                )
            `;
            await db.query(createCommentsSql);

            // Migración defensiva: asegurar columnas para tablas existentes
            const alterColumns = [
                'ALTER TABLE item_comments ADD COLUMN IF NOT EXISTS admin_reply TEXT DEFAULT NULL',
                'ALTER TABLE item_comments ADD COLUMN IF NOT EXISTS admin_reply_at TIMESTAMP NULL DEFAULT NULL',
                'ALTER TABLE item_comments ADD COLUMN IF NOT EXISTS admin_reply_by VARCHAR(100) DEFAULT NULL'
            ];

            for (const sql of alterColumns) {
                try {
                    await db.query(sql);
                } catch (colErr) {
                    // Si el motor es MySQL anterior a 8.0 y no soporta IF NOT EXISTS en ADD COLUMN
                    if (!colErr.message.includes('Duplicate column') && !colErr.message.includes('already exists')) {
                        // ignore or proceed
                    }
                }
            }
        } catch (e) {
            console.warn('Aviso en Interaction.ensureTable:', e.message);
        }
    }

    // ==================== LIKES ====================
    static async getLikesCount(entity_type, entity_id) {
        await Interaction.ensureTable();
        const [rows] = await db.query(
            'SELECT COUNT(*) as total FROM item_likes WHERE entity_type = ? AND entity_id = ?',
            [entity_type, entity_id]
        );
        return rows[0] ? rows[0].total : 0;
    }

    static async hasUserLiked(entity_type, entity_id, ip_address, user_id = null) {
        await Interaction.ensureTable();
        let sql = 'SELECT id FROM item_likes WHERE entity_type = ? AND entity_id = ? AND ';
        const params = [entity_type, entity_id];

        if (user_id) {
            sql += '(user_id = ? OR ip_address = ?)';
            params.push(user_id, ip_address || '');
        } else {
            sql += 'ip_address = ?';
            params.push(ip_address || '');
        }

        const [rows] = await db.query(sql, params);
        return rows.length > 0;
    }

    static async toggleLike(entity_type, entity_id, ip_address, user_id = null) {
        await Interaction.ensureTable();
        const cleanIp = ip_address ? ip_address.toString().substring(0, 99) : '0.0.0.0';

        // Check if already liked
        let checkSql = 'SELECT id FROM item_likes WHERE entity_type = ? AND entity_id = ? AND ';
        const checkParams = [entity_type, entity_id];

        if (user_id) {
            checkSql += '(user_id = ? OR ip_address = ?)';
            checkParams.push(user_id, cleanIp);
        } else {
            checkSql += 'ip_address = ?';
            checkParams.push(cleanIp);
        }

        const [existing] = await db.query(checkSql, checkParams);

        let liked = false;
        if (existing.length > 0) {
            // Remove like
            await db.query('DELETE FROM item_likes WHERE id = ?', [existing[0].id]);
            liked = false;
        } else {
            // Add like
            await db.query(
                'INSERT INTO item_likes (entity_type, entity_id, ip_address, user_id) VALUES (?, ?, ?, ?)',
                [entity_type, entity_id, cleanIp, user_id]
            );
            liked = true;
        }

        const count = await Interaction.getLikesCount(entity_type, entity_id);
        return { liked, count };
    }

    // ==================== COMENTARIOS PÚBLICOS ====================
    static async getComments(entity_type, entity_id) {
        await Interaction.ensureTable();
        const [rows] = await db.query(
            'SELECT * FROM item_comments WHERE entity_type = ? AND entity_id = ? AND is_approved = TRUE ORDER BY created_at ASC',
            [entity_type, entity_id]
        );
        return rows;
    }

    static async getCommentsCount(entity_type, entity_id) {
        await Interaction.ensureTable();
        const [rows] = await db.query(
            'SELECT COUNT(*) as total FROM item_comments WHERE entity_type = ? AND entity_id = ? AND is_approved = TRUE',
            [entity_type, entity_id]
        );
        return rows[0] ? rows[0].total : 0;
    }

    static async addComment({ entity_type, entity_id, user_name, user_email, comment_text, parent_id = null }) {
        await Interaction.ensureTable();

        // Generar un color armónico para el avatar
        const colors = ['#d4a853', '#0284c7', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#e11d48'];
        const avatarColor = colors[Math.floor(Math.random() * colors.length)];

        const cleanName = (user_name || 'Hermano/a').trim().substring(0, 140);
        const cleanEmail = (user_email || '').trim().substring(0, 140);
        const cleanText = (comment_text || '').trim();

        if (!cleanText) throw new Error('El comentario no puede estar vacío');

        // TODOS los comentarios requieren aprobación previa obligatoria (is_approved = FALSE / 0)
        // Solo un administrador puede aprobarlos manualmente desde /admin/comentarios
        const [result] = await db.query(
            `INSERT INTO item_comments 
            (entity_type, entity_id, user_name, user_email, comment_text, parent_id, avatar_color, is_approved) 
            VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)`,
            [entity_type, entity_id, cleanName, cleanEmail, cleanText, parent_id ? parseInt(parent_id) : null, avatarColor]
        );

        return {
            id: result.insertId,
            entity_type,
            entity_id,
            user_name: cleanName,
            comment_text: cleanText,
            avatar_color: avatarColor,
            is_approved: false,
            pending_approval: true,
            created_at: new Date()
        };
    }

    // ==================== MODERACIÓN & PANEL ADMIN ====================
    static async getPendingCount() {
        try {
            await Interaction.ensureTable();
            const [rows] = await db.query('SELECT COUNT(*) as total FROM item_comments WHERE is_approved = FALSE');
            return rows[0] ? rows[0].total : 0;
        } catch (e) {
            return 0;
        }
    }

    static async getStats() {
        await Interaction.ensureTable();
        const [pendingRows] = await db.query('SELECT COUNT(*) as total FROM item_comments WHERE is_approved = FALSE');
        const [approvedRows] = await db.query('SELECT COUNT(*) as total FROM item_comments WHERE is_approved = TRUE');
        const [totalRows] = await db.query('SELECT COUNT(*) as total FROM item_comments');
        const [repliedRows] = await db.query('SELECT COUNT(*) as total FROM item_comments WHERE admin_reply IS NOT NULL AND admin_reply != ""');

        return {
            pending: pendingRows[0] ? pendingRows[0].total : 0,
            approved: approvedRows[0] ? approvedRows[0].total : 0,
            total: totalRows[0] ? totalRows[0].total : 0,
            replied: repliedRows[0] ? repliedRows[0].total : 0
        };
    }

    static async getAllComments({ filter = 'all', entity_type = null, search = '', limit = 50, offset = 0 } = {}) {
        await Interaction.ensureTable();
        let sql = 'SELECT * FROM item_comments WHERE 1=1';
        const params = [];

        if (filter === 'pending') {
            sql += ' AND is_approved = FALSE';
        } else if (filter === 'approved') {
            sql += ' AND is_approved = TRUE';
        }

        if (entity_type && entity_type !== 'all') {
            sql += ' AND entity_type = ?';
            params.push(entity_type);
        }

        if (search && search.trim() !== '') {
            sql += ' AND (user_name LIKE ? OR user_email LIKE ? OR comment_text LIKE ? OR admin_reply LIKE ?)';
            const s = `%${search.trim()}%`;
            params.push(s, s, s, s);
        }

        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [comments] = await db.query(sql, params);

        // Enriquecer cada comentario con título y enlace del artículo correspondiente
        for (const item of comments) {
            item.entity_info = await Interaction.getEntityInfo(item.entity_type, item.entity_id);
        }

        return comments;
    }

    static async approveComment(id) {
        await Interaction.ensureTable();
        return await db.query('UPDATE item_comments SET is_approved = TRUE WHERE id = ?', [id]);
    }

    static async unapproveComment(id) {
        await Interaction.ensureTable();
        return await db.query('UPDATE item_comments SET is_approved = FALSE WHERE id = ?', [id]);
    }

    static async replyComment(id, adminReply, adminName = 'Administración') {
        await Interaction.ensureTable();
        const cleanReply = (adminReply || '').trim();
        const cleanAdminName = (adminName || 'Administración').trim().substring(0, 95);

        // Al responder, también se aprueba automáticamente el comentario para que sea visible
        return await db.query(
            'UPDATE item_comments SET admin_reply = ?, admin_reply_at = NOW(), admin_reply_by = ?, is_approved = TRUE WHERE id = ?',
            [cleanReply, cleanAdminName, id]
        );
    }

    static async deleteReply(id) {
        await Interaction.ensureTable();
        return await db.query(
            'UPDATE item_comments SET admin_reply = NULL, admin_reply_at = NULL, admin_reply_by = NULL WHERE id = ?',
            [id]
        );
    }

    static async deleteComment(id) {
        await Interaction.ensureTable();
        return await db.query('DELETE FROM item_comments WHERE id = ?', [id]);
    }

    // ==================== INFORMACIÓN DE ENTIDADES ====================
    static async getEntityInfo(entity_type, entity_id) {
        try {
            switch (entity_type) {
                case 'blog': {
                    const [rows] = await db.query('SELECT id, title FROM blog_posts WHERE id = ?', [entity_id]);
                    return {
                        section_name: 'Blog',
                        title: rows[0]?.title || `Artículo #${entity_id}`,
                        url: `/blog/${entity_id}`,
                        badge_color: 'bg-primary'
                    };
                }
                case 'ensenanzas': {
                    const [rows] = await db.query('SELECT id, title FROM services WHERE id = ?', [entity_id]);
                    return {
                        section_name: 'Enseñanzas',
                        title: rows[0]?.title || `Estudio #${entity_id}`,
                        url: `/ensenanzas/${entity_id}`,
                        badge_color: 'bg-info text-dark'
                    };
                }
                case 'noticias': {
                    const [rows] = await db.query('SELECT id, title FROM noticias WHERE id = ?', [entity_id]);
                    return {
                        section_name: 'Noticias',
                        title: rows[0]?.title || `Noticia #${entity_id}`,
                        url: `/noticias/${entity_id}`,
                        badge_color: 'bg-warning text-dark'
                    };
                }
                case 'parashot': {
                    const [rows] = await db.query('SELECT id, title FROM services WHERE id = ?', [entity_id]);
                    return {
                        section_name: 'Parashot',
                        title: rows[0]?.title || `Parashá #${entity_id}`,
                        url: `/parashot/${entity_id}`,
                        badge_color: 'bg-secondary'
                    };
                }
                case 'haftara': {
                    const [rows] = await db.query('SELECT id, title FROM haftarot WHERE id = ?', [entity_id]);
                    return {
                        section_name: 'Haftará',
                        title: rows[0]?.title || `Haftará #${entity_id}`,
                        url: `/haftara/${entity_id}`,
                        badge_color: 'bg-dark'
                    };
                }
                case 'eventos': {
                    const [rows] = await db.query('SELECT id, title FROM portfolio WHERE id = ?', [entity_id]);
                    return {
                        section_name: 'Eventos',
                        title: rows[0]?.title || `Evento #${entity_id}`,
                        url: `/eventos/${entity_id}`,
                        badge_color: 'bg-danger'
                    };
                }
                case 'seders': {
                    const [rows] = await db.query('SELECT id, title FROM seders WHERE id = ?', [entity_id]);
                    return {
                        section_name: 'Séderes',
                        title: rows[0]?.title || `Séder #${entity_id}`,
                        url: `/seder/${entity_id}`,
                        badge_color: 'bg-purple'
                    };
                }
                case 'semillas_articulos': {
                    const [rows] = await db.query('SELECT id, title FROM semillas_articulos WHERE id = ?', [entity_id]);
                    return {
                        section_name: 'Semillas Artículos',
                        title: rows[0]?.title || `Ficha Semillas #${entity_id}`,
                        url: `/semillas-de-torah/articulo/${entity_id}`,
                        badge_color: 'bg-success'
                    };
                }
                case 'semillas': {
                    const [rows] = await db.query('SELECT id, title FROM semillas_torah WHERE id = ?', [entity_id]);
                    return {
                        section_name: 'Semillas de Torah',
                        title: rows[0]?.title || `Lección #${entity_id}`,
                        url: `/semillas-de-torah/estudio/${entity_id}`,
                        badge_color: 'bg-success'
                    };
                }
                default:
                    return {
                        section_name: entity_type || 'General',
                        title: `Elemento #${entity_id}`,
                        url: '#',
                        badge_color: 'bg-secondary'
                    };
            }
        } catch (e) {
            return {
                section_name: entity_type || 'General',
                title: `Elemento #${entity_id}`,
                url: '#',
                badge_color: 'bg-secondary'
            };
        }
    }
}

module.exports = Interaction;

