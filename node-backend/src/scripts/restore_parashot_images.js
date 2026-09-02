const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function restore() {
    try {
        console.log('--- Iniciando restauración de imágenes de Parashot ---');

        // 1. Asegurar directorios locales
        const srcDir = path.join(__dirname, '../../public/assets/parashot');
        const destDir = path.join(__dirname, '../../../../public/assets/parashot');

        if (fs.existsSync(srcDir)) {
            if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
            const files = fs.readdirSync(srcDir);
            for (const f of files) {
                const s = path.join(srcDir, f);
                const d = path.join(destDir, f);
                if (fs.existsSync(s) && !fs.existsSync(d)) {
                    fs.copyFileSync(s, d);
                }
            }
            console.log(`✅ ${files.length} archivos de parashot sincronizados entre directorios públicos`);
        }

        // 2. Cargar mapeos originales de parashot desde hablemos_yhwh.sql si existe
        const sqlPath = path.join(__dirname, '../../../database/hablemos_yhwh.sql');
        if (fs.existsSync(sqlPath)) {
            const content = fs.readFileSync(sqlPath, 'utf-8');
            // Extraer inserts de parashot
            const regex = /\((\d+),(\d+),'([^']+)',[^,]+,[^,]+,[^,]+,'([^']*)'/g;
            let match;
            let updated = 0;
            while ((match = regex.exec(content)) !== null) {
                const parashaNum = parseInt(match[2]);
                const imgUrl = match[4];
                if (imgUrl && imgUrl.trim() !== '') {
                    // Verificar si el archivo existe
                    const fileName = path.basename(imgUrl);
                    const localPath = path.join(srcDir, fileName);
                    if (fs.existsSync(localPath)) {
                        await db.query('UPDATE parashot SET image_url = ? WHERE parasha_number = ?', [imgUrl, parashaNum]);
                        updated++;
                    } else {
                        // Si no existe el archivo, dejarlo en NULL para que muestre el badge elegante
                        await db.query('UPDATE parashot SET image_url = NULL WHERE parasha_number = ? AND (image_url IS NULL OR image_url = ?)', [parashaNum, imgUrl]);
                    }
                }
            }
            console.log(`✅ ${updated} imágenes de parashot restauradas y vinculadas con éxito`);
        }

        // 3. Limpiar cualquier parasha cuyo image_url apunte a un archivo inexistente
        const [rows] = await db.query('SELECT id, parasha_number, title, image_url FROM parashot WHERE image_url IS NOT NULL AND image_url != ""');
        let cleaned = 0;
        for (const r of rows) {
            const fileName = path.basename(r.image_url);
            const p1 = path.join(srcDir, fileName);
            const p2 = path.join(destDir, fileName);
            if (!fs.existsSync(p1) && !fs.existsSync(p2)) {
                await db.query('UPDATE parashot SET image_url = NULL WHERE id = ?', [r.id]);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            console.log(`🧹 ${cleaned} parashot sin archivo de imagen real limpiadas (ahora mostrarán badge Próximamente)`);
        }

        console.log('--- Restauración finalizada con éxito ---');
        process.exit(0);
    } catch (err) {
        console.error('Error restaurando imágenes de parashot:', err);
        process.exit(1);
    }
}

restore();
