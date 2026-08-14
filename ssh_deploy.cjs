const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Conectado al servidor - Iniciando deploy...');
  
  const commands = [
    'cd /var/www/hablemos_yhwh && git pull origin main 2>&1',
    'cd /var/www/hablemos_yhwh/node-backend && npm install --production 2>&1',
    'pm2 restart hablemos-web 2>&1',
    'pm2 status 2>&1'
  ].join(' && echo "=== SIGUIENTE ===" && ');
  
  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', (code) => {
      console.log(output);
      console.log('\n--- Deploy finalizado con código:', code, '---');
      conn.end();
    }).on('data', (data) => {
      output += data;
      process.stdout.write(data.toString());
    }).stderr.on('data', (data) => {
      output += data;
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
