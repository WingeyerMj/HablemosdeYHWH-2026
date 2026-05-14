const { Client } = require('pg');

async function createDb() {
    // URL without the specific database name (connects to 'postgres' by default)
    const url = "postgres://postgres:wingeyer@localhost:5432/postgres"; 
    
    const client = new Client({ connectionString: url });
    try {
        await client.connect();
        await client.query("CREATE DATABASE hablemos_yhwh");
        console.log("Database created successfully!");
    } catch (err) {
        if (err.code === '42P04') {
            console.log("Database already exists.");
        } else {
            console.log("ERROR:", err.message);
        }
    } finally {
        await client.end();
    }
}
createDb();
