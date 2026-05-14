const db = require('./node-backend/src/config/db');

async function update() {
    try {
        await db.query("UPDATE parashot SET youtube_link = 'https://www.youtube.com/watch?v=M5J1Y3l_oio' WHERE id = 7");
        console.log('Updated parasha 7 with youtube link');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

update();
