const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Ready');
  const cmd = `find /var/www/hablemos_yhwh/node-backend/public/uploads/ -type f`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log('ALL UPLOADS ON SERVER:');
      console.log(out);
      conn.end();
    });
  });
}).on('keyboard-interactive', (n, i, l, p, f) => f(['W1ng3y3r&M4rc3l0'])).connect({
  host: '179.43.125.96',
  port: 5640,
  username: 'root',
  password: 'W1ng3y3r&M4rc3l0',
  tryKeyboard: true
});
