const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  
  // Read the .env file from the server
  conn.exec('cat /var/www/hablemos_yhwh/node-backend/.env', (err, stream) => {
    if (err) throw err;
    let envContent = '';
    stream.on('close', (code, signal) => {
      // Parse DB variables
      const dbConfig = {};
      envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join('=').trim();
          dbConfig[key] = val;
        }
      });
      
      const dbUser = dbConfig['DB_USER'] || 'root';
      const dbPass = dbConfig['DB_PASS'] || '';
      const dbName = dbConfig['DB_NAME'] || 'hablemos_yhwh';
      
      console.log(`Using Database Config - User: ${dbUser}, DB: ${dbName}, Has Password: ${dbPass ? 'Yes' : 'No'}`);
      
      let importCmd = `mysql -u "${dbUser}"`;
      if (dbPass) {
        importCmd += ` -p"${dbPass}"`;
      }
      importCmd += ` "${dbName}" < /var/www/hablemos_yhwh/database/hablemos_yhwh.sql`;
      
      console.log('Running DB Import...');
      conn.exec(importCmd, (err2, stream2) => {
        if (err2) throw err2;
        stream2.on('close', (c, s) => {
          console.log('DB Import Finished with code: ' + c);
          conn.end();
        }).on('data', (d) => {
          console.log('DB STDOUT: ' + d);
        }).stderr.on('data', (d) => {
          console.error('DB STDERR: ' + d);
        });
      });
      
    }).on('data', (data) => {
      envContent += data;
    }).stderr.on('data', (data) => {
      console.error('ENV STDERR: ' + data);
    });
  });
}).on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
  finish(['W1ng3y3r&M4rc3l0']);
}).connect({
  host: '179.43.125.96',
  port: 5640,
  username: 'root',
  password: 'W1ng3y3r&M4rc3l0',
  tryKeyboard: true
});
