const db = require('../config/db');

class SemillasManualidad {
    static async ensureTable() {
        const isPostgres = !!process.env.DATABASE_URL;
        if (isPostgres) {
            await db.query(`
                CREATE TABLE IF NOT EXISTS semillas_manualidades (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    category VARCHAR(100) NOT NULL DEFAULT 'Porción Semanal',
                    parasha_id INT DEFAULT NULL,
                    parasha_number INT DEFAULT NULL,
                    parasha_name VARCHAR(150) DEFAULT NULL,
                    moed_name VARCHAR(150) DEFAULT NULL,
                    description TEXT DEFAULT NULL,
                    age_range VARCHAR(100) DEFAULT '3 a 12 años',
                    materials TEXT DEFAULT NULL,
                    instructions TEXT DEFAULT NULL,
                    image_url VARCHAR(500) DEFAULT NULL,
                    pdf_file VARCHAR(500) DEFAULT NULL,
                    author_name VARCHAR(150) DEFAULT 'Ministerio Semillas de Toráh',
                    author_role VARCHAR(150) DEFAULT 'Maestra / Encargada',
                    author_phone VARCHAR(100) DEFAULT NULL,
                    is_approved BOOLEAN DEFAULT TRUE,
                    is_featured BOOLEAN DEFAULT FALSE,
                    downloads_count INT DEFAULT 0,
                    views_count INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_sm_cat ON semillas_manualidades(category);
                CREATE INDEX IF NOT EXISTS idx_sm_parasha ON semillas_manualidades(parasha_id);
                CREATE INDEX IF NOT EXISTS idx_sm_moed ON semillas_manualidades(moed_name);
                CREATE INDEX IF NOT EXISTS idx_sm_approved ON semillas_manualidades(is_approved);
            `);
        } else {
            await db.query(`
                CREATE TABLE IF NOT EXISTS semillas_manualidades (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    category VARCHAR(100) NOT NULL DEFAULT 'Porción Semanal',
                    parasha_id INT DEFAULT NULL,
                    parasha_number INT DEFAULT NULL,
                    parasha_name VARCHAR(150) DEFAULT NULL,
                    moed_name VARCHAR(150) DEFAULT NULL,
                    description TEXT DEFAULT NULL,
                    age_range VARCHAR(100) DEFAULT '3 a 12 años',
                    materials TEXT DEFAULT NULL,
                    instructions TEXT DEFAULT NULL,
                    image_url VARCHAR(500) DEFAULT NULL,
                    pdf_file VARCHAR(500) DEFAULT NULL,
                    author_name VARCHAR(150) DEFAULT 'Ministerio Semillas de Toráh',
                    author_role VARCHAR(150) DEFAULT 'Maestra / Encargada',
                    author_phone VARCHAR(100) DEFAULT NULL,
                    is_approved BOOLEAN DEFAULT TRUE,
                    is_featured BOOLEAN DEFAULT FALSE,
                    downloads_count INT DEFAULT 0,
                    views_count INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_sm_cat (category),
                    INDEX idx_sm_parasha (parasha_id),
                    INDEX idx_sm_moed (moed_name),
                    INDEX idx_sm_approved (is_approved)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            `);
        }

        // Auto-seed initial content if empty
        try {
            const [rows] = await db.query("SELECT COUNT(*) AS total FROM semillas_manualidades");
            const count = (rows && rows[0]) ? (rows[0].total || rows[0].count || 0) : 0;
            if (parseInt(count) === 0) {
                await this.seedDefaults();
            } else {
                // Actualizar rutas de imágenes a los nuevos SVGs ilustrados y láminas en blanco para colorear
                await db.query(`
                    UPDATE semillas_manualidades SET image_url = '/assets/img/semillas/manualidad_mini_suca.svg', pdf_file = '/assets/img/semillas/colorear/manualidad_mini_suca_bn.svg' WHERE title LIKE '%Sucá%' OR moed_name = 'Sucot';
                `);
                await db.query(`
                    UPDATE semillas_manualidades SET image_url = '/assets/img/semillas/manualidad_shofar_infantil.svg', pdf_file = '/assets/img/semillas/colorear/manualidad_shofar_infantil_bn.svg' WHERE title LIKE '%Shofar%' OR moed_name = 'Yom Teruáh';
                `);
                await db.query(`
                    UPDATE semillas_manualidades SET image_url = '/assets/img/semillas/manualidad_shavuot_tablas.svg', pdf_file = '/assets/img/semillas/colorear/manualidad_shavuot_tablas_bn.svg' WHERE title LIKE '%Tablas%' OR moed_name = 'Shavuot';
                `);
                await db.query(`
                    UPDATE semillas_manualidades SET image_url = '/assets/img/semillas/manualidad_afikoman.svg', pdf_file = '/assets/img/semillas/colorear/manualidad_afikoman_bn.svg' WHERE title LIKE '%Afikomán%' OR moed_name = 'Jag HaMatzot';
                `);
                await db.query(`
                    UPDATE semillas_manualidades SET image_url = '/assets/img/semillas/manualidad_pesaj_plato.svg', pdf_file = '/assets/img/semillas/colorear/manualidad_pesaj_plato_bn.svg' WHERE title LIKE '%Séder%' OR moed_name = 'Pésaj';
                `);
                await db.query(`
                    UPDATE semillas_manualidades SET image_url = '/assets/img/semillas/manualidad_shabat_hala.svg', pdf_file = '/assets/img/semillas/colorear/manualidad_shabat_hala_bn.svg' WHERE title LIKE '%Jalá%' OR (moed_name = 'Shabat' AND category = 'Santas Convocaciones');
                `);
                await db.query(`
                    UPDATE semillas_manualidades SET image_url = '/assets/img/semillas/bereshit_creacion_colorear.svg', pdf_file = '/assets/img/semillas/colorear/bereshit_creacion_bn.svg' WHERE parasha_number = 1 OR title LIKE '%Bereshit%';
                `);
                await db.query(`
                    UPDATE semillas_manualidades SET image_url = '/assets/img/semillas/noaj_arca_colorear.svg', pdf_file = '/assets/img/semillas/colorear/noaj_arca_bn.svg' WHERE parasha_number = 2 OR title LIKE '%Nóaj%';
                `);
                await db.query(`
                    UPDATE semillas_manualidades SET image_url = '/assets/img/semillas/lej_leja_estrellas.svg', pdf_file = '/assets/img/semillas/colorear/lej_leja_estrellas_bn.svg' WHERE parasha_number = 3 OR title LIKE '%Léj Lejá%';
                `);
                await db.query(`
                    UPDATE semillas_manualidades SET image_url = '/assets/img/semillas/vayira_hospitalidad.svg', pdf_file = '/assets/img/semillas/colorear/vayira_hospitalidad_bn.svg' WHERE parasha_number = 4 OR title LIKE '%Vayirá%';
                `);
            }
        } catch (eSeed) {
            console.warn('[SemillasManualidad] Seed check error:', eSeed.message);
        }
    }

    static async seedDefaults() {
        const initialItems = [
            {
                title: 'Bereshit: Los 7 Días de la Creación y el Shabat',
                category: 'Porción Semanal',
                parasha_number: 1,
                parasha_name: 'Bereshit',
                moed_name: 'Shabat',
                description: 'Lámina coloreable con los 7 días de la Creación, destacando el reposo sagrado del Shabat instituido por YHWH.',
                age_range: '4 a 10 años',
                materials: 'Crayones, lápices de colores, brillantina para las estrellas del día 4.',
                instructions: 'Colorear cada círculo con su día correspondiente. Al llegar al día 7 (Shabat), agregar un marco dorado como señal de reposo y santidad.',
                image_url: '/assets/img/semillas/bereshit_creacion_colorear.svg',
                pdf_file: '/assets/img/semillas/colorear/bereshit_creacion_bn.svg',
                author_name: 'Elva Ávila',
                author_role: 'Directora Semillas de Toráh',
                is_approved: true,
                is_featured: true
            },
            {
                title: 'Nóaj: El Arca de Salvación y el Arcoíris del Pacto',
                category: 'Porción Semanal',
                parasha_number: 2,
                parasha_name: 'Nóaj',
                moed_name: null,
                description: 'Dibujo para colorear con Noé, el arca sobre las aguas y los siete colores del arcoíris como pacto eterno.',
                age_range: '3 a 9 años',
                materials: 'Acuarelas o marcadores de agua, algodón para las nubes.',
                instructions: 'Pintar el arcoíris respetando los 7 colores. Pegar copos de algodón suave sobre las nubes para dar volumen.',
                image_url: '/assets/img/semillas/noaj_arca_colorear.svg',
                pdf_file: '/assets/img/semillas/colorear/noaj_arca_bn.svg',
                author_name: 'Equipo Semillas de Toráh',
                author_role: 'Ministerio Infantil',
                is_approved: true,
                is_featured: true
            },
            {
                title: 'Léj Lejá: Las Estrellas y la Promesa a Abraham',
                category: 'Porción Semanal',
                parasha_number: 3,
                parasha_name: 'Léj Lejá',
                moed_name: null,
                description: 'Abraham mirando al cielo estrellado. Hoja didáctica con conteo de estrellas y versículo de Génesis 15:5.',
                age_range: '5 a 12 años',
                materials: 'Cartulina negra o azul marino, tiza blanca, estrellas autoadhesivas fluorescentes.',
                instructions: 'Delinear la silueta de Abraham y pegar las estrellitas en el firmamento para recordar la promesa de multiplicar su descendencia.',
                image_url: '/assets/img/semillas/lej_leja_estrellas.svg',
                pdf_file: '/assets/img/semillas/colorear/lej_leja_estrellas_bn.svg',
                author_name: 'Semillas de Toráh',
                author_role: 'Equipo Docente',
                is_approved: true,
                is_featured: false
            },
            {
                title: 'Vayirá: Los Tres Mensajeros y la Carpa Abierta de la Hospitalidad',
                category: 'Porción Semanal',
                parasha_number: 4,
                parasha_name: 'Vayirá',
                moed_name: null,
                description: 'Dibujo de la tienda de Abraham y Sara abierta en los 4 costados para recibir al forastero.',
                age_range: '4 a 11 años',
                materials: 'Palitos de helado para la estructura de la carpa, tela o papel barrilete, pegamento escolar.',
                instructions: 'Armar los postes de la carpa pegando palitos sobre el dibujo y plegar la tela para mostrar cómo se recibía con amor a los visitantes.',
                image_url: '/assets/img/semillas/vayira_hospitalidad.svg',
                pdf_file: '/assets/img/semillas/colorear/vayira_hospitalidad_bn.svg',
                author_name: 'Elva Ávila',
                author_role: 'Directora Semillas de Toráh',
                is_approved: true,
                is_featured: false
            },
            {
                title: 'Shabat Kadosh: Mantelito para Jalá y Velitas de Plastilina',
                category: 'Santas Convocaciones',
                parasha_number: null,
                parasha_name: null,
                moed_name: 'Shabat',
                description: 'Manualidad práctica para la mesa del Shabat en familia: mantelito protector decorado a mano y velas sin llama para los más pequeños.',
                age_range: '3 a 8 años',
                materials: 'Fieltro blanco o lienzo de 30x30 cm, marcadores para tela, cintas doradas, plastilina amarilla y blanca.',
                instructions: '1. Dibujar espigas de trigo y letras hebreas en el fieltro. 2. Moldear 2 velitas con plastilina blanca y llamas doradas. 3. Cubrir el pan de Shabat en la cena familiar.',
                image_url: '/assets/img/semillas/manualidad_shabat_hala.svg',
                pdf_file: '/assets/img/semillas/colorear/manualidad_shabat_hala_bn.svg',
                author_name: 'Elva Ávila',
                author_role: 'Directora Semillas de Toráh',
                is_approved: true,
                is_featured: true
            },
            {
                title: 'Pésaj: Bandeja Didáctica del Séder con Elementos Recortables',
                category: 'Santas Convocaciones',
                parasha_number: null,
                parasha_name: null,
                moed_name: 'Pésaj',
                description: 'Plato del Séder de cartón donde los niños pegan cada uno de los elementos explicativos: matzá, hierbas amargas (maror), carpas, joróset y copa de redención.',
                age_range: '5 a 12 años',
                materials: 'Plato descartable blanco, tijeras de punta redonda, pegamento, lámina recortable descargable.',
                instructions: 'Recortar las 6 insignias del Séder, explicar su significado bíblico en Éxodo 12 y pegarlas en su compartimento correspondiente en el plato.',
                image_url: '/assets/img/semillas/manualidad_pesaj_plato.svg',
                pdf_file: '/assets/img/semillas/colorear/manualidad_pesaj_plato_bn.svg',
                author_name: 'Equipo Semillas de Toráh',
                author_role: 'Maestras de Niños',
                is_approved: true,
                is_featured: true
            },
            {
                title: 'Jag HaMatzot: Bolsita Especial para el Afikomán con Bordado Fácil',
                category: 'Santas Convocaciones',
                parasha_number: null,
                parasha_name: null,
                moed_name: 'Jag HaMatzot',
                description: 'Funda de tela suave o cartulina para esconder y buscar el Afikomán durante la fiesta de los Panes sin Levadura.',
                age_range: '6 a 12 años',
                materials: 'Bolsita de liencillo o friselina blanca, lana azul o púrpura, aguja de plástico.',
                instructions: 'Enhebrar la lana y pasar puntadas simples alrededor del borde. Estampar con sello de papa o marcador el nombre Afikomán.',
                image_url: '/assets/img/semillas/manualidad_afikoman.svg',
                pdf_file: '/assets/img/semillas/colorear/manualidad_afikoman_bn.svg',
                author_name: 'Maestra Raquel M.',
                author_role: 'Encargada de Taller',
                is_approved: true,
                is_featured: false
            },
            {
                title: 'Shavuot: Las Tablas de la Toráh en Masa de Sal con Flores',
                category: 'Santas Convocaciones',
                parasha_number: null,
                parasha_name: null,
                moed_name: 'Shavuot',
                description: 'Modelado en masa de sal de las dos tablas de la Ley entregadas en el Monte Sinaí, adornadas con flores de papel en recuerdo de los primeros frutos.',
                age_range: '4 a 12 años',
                materials: 'Harina (2 tazas), sal (1 taza), agua tibia, témperas grises o piedra, florcitas secas o de papel crepe.',
                instructions: 'Amasar hasta obtener consistencia suave, cortar en dos tabletas arqueadas en la parte superior. Grabar las 10 letras del Alef-Bet (Alef a Yod) con un palito y dejar secar al aire.',
                image_url: '/assets/img/semillas/manualidad_shavuot_tablas.svg',
                pdf_file: '/assets/img/semillas/colorear/manualidad_shavuot_tablas_bn.svg',
                author_name: 'Elva Ávila',
                author_role: 'Directora Semillas de Toráh',
                is_approved: true,
                is_featured: true
            },
            {
                title: 'Yom Teruáh: Shofar Artesanal de Cartón y Lana Dorada',
                category: 'Santas Convocaciones',
                parasha_number: null,
                parasha_name: null,
                moed_name: 'Yom Teruáh',
                description: 'Construcción de un shofar de juguete para practicar los sonidos bíblicos (Tekiáh, Shevarim, Teruáh, Tekiáh Guedolá) antes de la fiesta de las Trompetas.',
                age_range: '3 a 10 años',
                materials: 'Rollo de cocina de cartón, papel craft en cono, cinta de carrocero, pintura marrón o dorada.',
                instructions: 'Curvar suavemente el extremo del cono humedeciéndolo con un poco de agua, unirlo al tubo, encintar y pintar imitando el cuerno de carnero.',
                image_url: '/assets/img/semillas/manualidad_shofar_infantil.svg',
                pdf_file: '/assets/img/semillas/colorear/manualidad_shofar_infantil_bn.svg',
                author_name: 'Equipo Semillas de Toráh',
                author_role: 'Maestras de Niños',
                is_approved: true,
                is_featured: true
            },
            {
                title: 'Sucot: Mini Sucá Familiar con Ramitas y Techo de Hojas',
                category: 'Santas Convocaciones',
                parasha_number: null,
                parasha_name: null,
                moed_name: 'Sucot',
                description: 'Maqueta de cabaña festiva (Sucá) para el comedor o dormitorio infantil, con 3 paredes y techo natural (Sejaj) donde se puedan ver las estrellas.',
                age_range: '4 a 12 años',
                materials: 'Cajita de zapatos vacía, ramitas secas de jardín, hojas de palmera o pino, gomitas de pegar, frutitas miniatura de masa.',
                instructions: 'Retirar la tapa y un lateral de la caja. En el techo colocar las ramitas separadas para que pase la luz. Colgar pequeñas guirnaldas de colores en el interior.',
                image_url: '/assets/img/semillas/manualidad_mini_suca.svg',
                pdf_file: '/assets/img/semillas/colorear/manualidad_mini_suca_bn.svg',
                author_name: 'Elva Ávila',
                author_role: 'Directora Semillas de Toráh',
                is_approved: true,
                is_featured: true
            }
        ];

        for (const item of initialItems) {
            try {
                await db.query(`
                    INSERT INTO semillas_manualidades 
                    (title, category, parasha_number, parasha_name, moed_name, description, age_range, materials, instructions, image_url, pdf_file, author_name, author_role, is_approved, is_featured)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    item.title, item.category, item.parasha_number, item.parasha_name, item.moed_name,
                    item.description, item.age_range, item.materials, item.instructions, item.image_url,
                    item.pdf_file, item.author_name, item.author_role, item.is_approved ? 1 : 0, item.is_featured ? 1 : 0
                ]);
            } catch (eItem) {
                console.warn('[SemillasManualidad] Error inserting seed:', item.title, eItem.message);
            }
        }
    }

    static async getAll() {
        await this.ensureTable();
        const [rows] = await db.query(`
            SELECT sm.*, 
                   p.title AS canonical_parasha_title,
                   p.subtitle AS canonical_parasha_subtitle
            FROM semillas_manualidades sm
            LEFT JOIN parashot p ON (sm.parasha_id = p.id OR (sm.parasha_number IS NOT NULL AND sm.parasha_number = p.parasha_number))
            ORDER BY sm.is_featured DESC, sm.id DESC
        `);
        return rows || [];
    }

    static async getApproved() {
        await this.ensureTable();
        const [rows] = await db.query(`
            SELECT sm.*, 
                   p.title AS canonical_parasha_title,
                   p.subtitle AS canonical_parasha_subtitle
            FROM semillas_manualidades sm
            LEFT JOIN parashot p ON (sm.parasha_id = p.id OR (sm.parasha_number IS NOT NULL AND sm.parasha_number = p.parasha_number))
            WHERE sm.is_approved = 1 OR sm.is_approved = TRUE
            ORDER BY sm.is_featured DESC, sm.id DESC
        `);
        return rows || [];
    }

    static async getWeeklyDrawings() {
        await this.ensureTable();
        const [rows] = await db.query(`
            SELECT sm.*, 
                   p.title AS canonical_parasha_title,
                   p.subtitle AS canonical_parasha_subtitle
            FROM semillas_manualidades sm
            LEFT JOIN parashot p ON (sm.parasha_id = p.id OR (sm.parasha_number IS NOT NULL AND sm.parasha_number = p.parasha_number))
            WHERE (sm.is_approved = 1 OR sm.is_approved = TRUE)
              AND sm.category = 'Porción Semanal'
            ORDER BY COALESCE(sm.parasha_number, 999) ASC, sm.id DESC
        `);
        return rows || [];
    }

    static async getFeastCrafts() {
        await this.ensureTable();
        const [rows] = await db.query(`
            SELECT sm.*
            FROM semillas_manualidades sm
            WHERE (sm.is_approved = 1 OR sm.is_approved = TRUE)
              AND sm.category = 'Santas Convocaciones'
            ORDER BY sm.is_featured DESC, sm.id DESC
        `);
        return rows || [];
    }

    static async getSuggestions() {
        await this.ensureTable();
        const [rows] = await db.query(`
            SELECT sm.*
            FROM semillas_manualidades sm
            WHERE sm.category = 'Sugerencia de Encargadas'
            ORDER BY sm.id DESC
        `);
        return rows || [];
    }

    static async getById(id) {
        await this.ensureTable();
        const [rows] = await db.query(`
            SELECT sm.*,
                   p.title AS canonical_parasha_title,
                   p.subtitle AS canonical_parasha_subtitle
            FROM semillas_manualidades sm
            LEFT JOIN parashot p ON (sm.parasha_id = p.id OR (sm.parasha_number IS NOT NULL AND sm.parasha_number = p.parasha_number))
            WHERE sm.id = ?
        `, [id]);
        return (rows && rows.length > 0) ? rows[0] : null;
    }

    static async create(data) {
        await this.ensureTable();
        const {
            title, category, parasha_id, parasha_number, parasha_name, moed_name,
            description, age_range, materials, instructions, image_url, pdf_file,
            author_name, author_role, author_phone, is_approved, is_featured
        } = data;

        const [result] = await db.query(`
            INSERT INTO semillas_manualidades
            (title, category, parasha_id, parasha_number, parasha_name, moed_name,
             description, age_range, materials, instructions, image_url, pdf_file,
             author_name, author_role, author_phone, is_approved, is_featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            title,
            category || 'Porción Semanal',
            parasha_id ? parseInt(parasha_id) : null,
            parasha_number ? parseInt(parasha_number) : null,
            parasha_name || null,
            moed_name || null,
            description || null,
            age_range || '3 a 12 años',
            materials || null,
            instructions || null,
            image_url || null,
            pdf_file || null,
            author_name || 'Encargada Semillas',
            author_role || 'Maestra de Niños',
            author_phone || null,
            is_approved !== undefined ? (is_approved ? 1 : 0) : 1,
            is_featured !== undefined ? (is_featured ? 1 : 0) : 0
        ]);

        return result.insertId;
    }

    static async update(id, data) {
        await this.ensureTable();
        const {
            title, category, parasha_id, parasha_number, parasha_name, moed_name,
            description, age_range, materials, instructions, image_url, pdf_file,
            author_name, author_role, author_phone, is_approved, is_featured
        } = data;

        let query = `
            UPDATE semillas_manualidades SET
                title = ?,
                category = ?,
                parasha_id = ?,
                parasha_number = ?,
                parasha_name = ?,
                moed_name = ?,
                description = ?,
                age_range = ?,
                materials = ?,
                instructions = ?,
                author_name = ?,
                author_role = ?,
                author_phone = ?,
                is_approved = ?,
                is_featured = ?
        `;
        const params = [
            title,
            category || 'Porción Semanal',
            parasha_id ? parseInt(parasha_id) : null,
            parasha_number ? parseInt(parasha_number) : null,
            parasha_name || null,
            moed_name || null,
            description || null,
            age_range || '3 a 12 años',
            materials || null,
            instructions || null,
            author_name || null,
            author_role || null,
            author_phone || null,
            is_approved ? 1 : 0,
            is_featured ? 1 : 0
        ];

        if (image_url !== undefined && image_url !== null) {
            query += `, image_url = ?`;
            params.push(image_url);
        }
        if (pdf_file !== undefined && pdf_file !== null) {
            query += `, pdf_file = ?`;
            params.push(pdf_file);
        }

        query += ` WHERE id = ?`;
        params.push(id);

        await db.query(query, params);
        return true;
    }

    static async toggleApproved(id) {
        await this.ensureTable();
        await db.query(`
            UPDATE semillas_manualidades
            SET is_approved = CASE WHEN is_approved = 1 THEN 0 ELSE 1 END
            WHERE id = ?
        `, [id]);
        return true;
    }

    static async incrementDownloads(id) {
        await this.ensureTable();
        await db.query("UPDATE semillas_manualidades SET downloads_count = downloads_count + 1 WHERE id = ?", [id]);
    }

    static async incrementViews(id) {
        await this.ensureTable();
        await db.query("UPDATE semillas_manualidades SET views_count = views_count + 1 WHERE id = ?", [id]);
    }

    static async delete(id) {
        await this.ensureTable();
        await db.query("DELETE FROM semillas_manualidades WHERE id = ?", [id]);
        return true;
    }
}

module.exports = SemillasManualidad;

