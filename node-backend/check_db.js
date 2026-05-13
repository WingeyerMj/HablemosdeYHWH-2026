const mysql = require('mysql2/promise');
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hablemos_yhwh'
};

async function checkData() {
    try {
        const db = await mysql.createConnection(dbConfig);
        const [sections] = await db.query('SELECT * FROM sections');
        console.log(JSON.stringify(sections, null, 2));
        await db.end();
    } catch (err) {
        console.error(err);
    }
}

checkData();
