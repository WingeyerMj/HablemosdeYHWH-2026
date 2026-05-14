const { Client } = require('pg');

async function testConnection(password) {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'hablemos_yhwh',
        password: password,
        port: 5432,
    });
    try {
        await client.connect();
        console.log(`Success with password: "${password}"`);
        await client.end();
        return true;
    } catch (err) {
        console.log(`Failed with password: "${password}" - ${err.message}`);
        return false;
    }
}

async function run() {
    const passwords = ['', 'admin', 'root', 'postgres', '1234', '123456'];
    for (const pwd of passwords) {
        if (await testConnection(pwd)) {
            process.exit(0);
        }
    }
}
run();
