const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  
  // Step 1: Git Pull
  console.log('Running git pull...');
  conn.exec('cd /var/www/hablemos_yhwh && git pull', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('Git pull finished with code:', code);
      
      // Step 2: Read .env for DB config
      conn.exec('cat /var/www/hablemos_yhwh/node-backend/.env', (err2, stream2) => {
        if (err2) throw err2;
        let envContent = '';
        stream2.on('close', (code2) => {
          const dbConfig = {};
          envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
              dbConfig[parts[0].trim()] = parts.slice(1).join('=').trim();
            }
          });
          
          const dbUser = dbConfig['DB_USER'] || 'root';
          const dbPass = dbConfig['DB_PASS'] || '';
          const dbName = dbConfig['DB_NAME'] || 'hablemos_yhwh';
          
          console.log(`Using Database - User: ${dbUser}, DB: ${dbName}, Has Password: ${dbPass ? 'Yes' : 'No'}`);
          
          let importCmd = `mysql -u "${dbUser}"`;
          if (dbPass) importCmd += ` -p"${dbPass}"`;
          importCmd += ` "${dbName}" < /var/www/hablemos_yhwh/database/hablemos_yhwh.sql`;
          
          // Step 3: DB Import
          console.log('Running DB Import...');
          conn.exec(importCmd, (err3, stream3) => {
            if (err3) throw err3;
            stream3.on('close', (code3) => {
              console.log('DB Import finished with code:', code3);
              
              // Step 4: NPM Install & PM2 Restart
              console.log('Restarting application...');
              conn.exec('cd /var/www/hablemos_yhwh/node-backend && npm install && pm2 restart hablemos-web', (err4, stream4) => {
                if (err4) throw err4;
                stream4.on('close', (code4) => {
                  console.log('Deploy completed. Restart code:', code4);
                  conn.end();
                }).on('data', (d) => console.log('RESTART STDOUT:', d.toString()))
                  .stderr.on('data', (d) => console.error('RESTART STDERR:', d.toString()));
              });
            }).on('data', (d) => console.log('DB STDOUT:', d.toString()))
              .stderr.on('data', (d) => console.error('DB STDERR:', d.toString()));
          });
        }).on('data', (data) => {
          envContent += data;
        });
      });
    }).on('data', (data) => {
      console.log('GIT STDOUT:', data.toString());
    }).stderr.on('data', (data) => {
      console.error('GIT STDERR:', data.toString());
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
