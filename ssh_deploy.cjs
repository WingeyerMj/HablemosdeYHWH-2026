const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Conectado al servidor - Forzando deploy...');
  
  const commands = [
    // Stash tracked changes safely without touching uploaded media files
    'cd /var/www/hablemos_yhwh',
    'git stash 2>&1',
    'git checkout main 2>&1',
    'git pull origin main 2>&1',
    'echo "=== GIT PULL COMPLETADO ==="',
    // Install dependencies
    'cd /var/www/hablemos_yhwh/node-backend && npm install --production 2>&1',
    'echo "=== NPM INSTALL COMPLETADO ==="',
    'node src/scripts/update_about_content.js 2>&1',
    'echo "=== UPDATE ABOUT COMPLETADO ==="',
    // Restart the app
    'pm2 restart hablemos-web 2>&1',
    'echo "=== PM2 RESTART COMPLETADO ==="',
    'pm2 status 2>&1'
  ].join(' && ');
  
  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', (code) => {
      console.log('\n--- Deploy finalizado con código:', code, '---');
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data.toString());
    }).stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });
  });
}).on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
  finish(['H4bl3m0sd3!yhwh']);
}).connect({
  host: '179.43.125.96',
  port: 5640,
  username: 'root',
  password: 'H4bl3m0sd3!yhwh',
  tryKeyboard: true
});
