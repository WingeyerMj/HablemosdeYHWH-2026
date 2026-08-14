const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Conectado al servidor');
  // Find where the app is located
  const cmd = `find / -name "app.js" -path "*/node-backend/*" 2>/dev/null; echo "---"; pm2 list 2>/dev/null || echo "pm2 not found"; echo "---"; systemctl list-units --type=service | grep -i node 2>/dev/null; echo "---"; ps aux | grep node | grep -v grep 2>/dev/null`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', () => {
      console.log(output);
      conn.end();
    }).on('data', (data) => {
      output += data;
    }).stderr.on('data', (data) => {
      output += 'STDERR: ' + data;
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
