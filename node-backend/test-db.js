const db = require('./src/config/db');

async function testDB() {
    try {
        const [rows] = await db.query('SHOW TABLES');
        console.log('Tables in database:', rows);
        const [users] = await db.query('SELECT * FROM users');
        console.log('Users found:', users.length);
        if (users.length > 0) {
            console.log('Sample user:', { ...users[0], password: '[HIDDEN]' });
        }
    } catch (error) {
        console.error('Database error:', error.message);
    } finally {
        process.exit();
    }
}

testDB();
