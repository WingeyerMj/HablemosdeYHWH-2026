const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Conectado al servidor - Forzando deploy...');
  
  const commands = [
    // Stash local changes and clean untracked files
    'cd /var/www/hablemos_yhwh',
    'git stash --include-untracked 2>&1',
    'git checkout main 2>&1',
    'git pull origin main 2>&1',
    'echo "=== GIT PULL COMPLETADO ==="',
    // Install dependencies
    'cd /var/www/hablemos_yhwh/node-backend && npm install --production 2>&1',
    'echo "=== NPM INSTALL COMPLETADO ==="',
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
  finish(['W1ng3y3r&M4rc3l0']);
}).connect({
  host: '179.43.125.96',
  port: 5640,
  username: 'root',
  password: 'W1ng3y3r&M4rc3l0',
  tryKeyboard: true
});
