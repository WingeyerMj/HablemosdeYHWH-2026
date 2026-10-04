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

            // 2. Tabla de Comentarios
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
                    is_approved BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_entity_comments (entity_type, entity_id),
                    INDEX idx_parent (parent_id)
                )
            `;
            await db.query(createCommentsSql);
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

    // ==================== COMENTARIOS ====================
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

        // Generar un color aleatorio armónico para el avatar
        const colors = ['#d4a853', '#0284c7', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#e11d48'];
        const avatarColor = colors[Math.floor(Math.random() * colors.length)];

        const cleanName = (user_name || 'Hermano/a').trim().substring(0, 140);
        const cleanEmail = (user_email || '').trim().substring(0, 140);
        const cleanText = (comment_text || '').trim();

        if (!cleanText) throw new Error('El comentario no puede estar vacío');

        const [result] = await db.query(
            `INSERT INTO item_comments 
            (entity_type, entity_id, user_name, user_email, comment_text, parent_id, avatar_color, is_approved) 
            VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [entity_type, entity_id, cleanName, cleanEmail, cleanText, parent_id ? parseInt(parent_id) : null, avatarColor]
        );

        return {
            id: result.insertId,
            entity_type,
            entity_id,
            user_name: cleanName,
            comment_text: cleanText,
            avatar_color: avatarColor,
            created_at: new Date()
        };
    }

    static async getAllComments(limit = 50, offset = 0) {
        await Interaction.ensureTable();
        const [rows] = await db.query(
            'SELECT * FROM item_comments ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        return rows;
    }

    static async deleteComment(id) {
        await Interaction.ensureTable();
        return await db.query('DELETE FROM item_comments WHERE id = ?', [id]);
    }
}

module.exports = Interaction;
