const db = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function updatePassword() {
    try {
        const password = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await db.query('UPDATE users SET password = ? WHERE username = ?', [hash, 'admin']);
        console.log('Password for admin updated to admin123');

        await db.query('UPDATE users SET password = ? WHERE username = ?', [hash, 'editor']);
        console.log('Password for editor updated to admin123');
    } catch (error) {
        console.error('Update error:', error);
    } finally {
        process.exit();
    }
}

updatePassword();
