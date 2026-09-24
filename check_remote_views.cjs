const { Client } = require('ssh2');

const SSH_CONFIG = {
  host: '179.43.125.96',
  port: 5640,
  username: 'root',
  password: 'W1ng3y3r&M4rc3l0',
  tryKeyboard: true,
  readyTimeout: 30000
};

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH conectado');
  const query = "SELECT id, title, views FROM haftarot WHERE title LIKE '%Haazinu%' OR title LIKE '%Ha%';";
  const cmd = `mysql -u yhwh -pFuerza2024! hablemos_yhwh -e "${query}"`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      conn.end();
    })
    .on('data', d => process.stdout.write(d.toString()))
    .stderr.on('data', d => process.stderr.write(d.toString()));
  });
}).on('keyboard-interactive', (n, i, l, p, finish) => finish(['W1ng3y3r&M4rc3l0']))
.on('error', err => console.error('SSH Error:', err))
.connect(SSH_CONFIG);
