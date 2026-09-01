const db = require('../config/db');

async function run() {
    try {
        console.log('--- Agregando a Menajem Ben Leví al equipo ---');
        const [existing] = await db.query("SELECT * FROM team WHERE name LIKE '%Menajem%' OR name LIKE '%Levi%'");
        if (existing.length === 0) {
            await db.query(
                "INSERT INTO team (name, role, description, img) VALUES (?, ?, ?, ?)",
                [
                    'Menajem Ben Leví',
                    'Lector de Aliyot / Audios',
                    'Encargado de la recitación y lectura de las Aliyot diarias.',
                    '/assets/img/team/menajem.jpg'
                ]
            );
            console.log('✅ Menajem Ben Leví agregado exitosamente');
        } else {
            await db.query(
                "UPDATE team SET name = ?, role = ?, description = ?, img = ? WHERE id = ?",
                [
                    'Menajem Ben Leví',
                    'Lector de Aliyot / Audios',
                    'Encargado de la recitación y lectura de las Aliyot diarias.',
                    '/assets/img/team/menajem.jpg',
                    existing[0].id
                ]
            );
            console.log('✅ Menajem Ben Leví actualizado exitosamente');
        }

        const [team] = await db.query('SELECT * FROM team');
        console.log('Equipo actual en BD:', team);
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

run();
