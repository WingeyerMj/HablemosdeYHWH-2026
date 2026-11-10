const fs = require('fs');
const { Client } = require('ssh2');

const credentialSource = fs.readFileSync('check_remote_views.cjs', 'utf8');
const password = require('C:/Users/WingeyerMarcelo/Documents/ChatGPT/hablemosdeyhwh/security-hardening/ssh-credentials.cjs').getPassword();

const conn = new Client();
conn.on('ready', () => {
  conn.exec("mysql -u root -p$(cat /var/www/hablemos_yhwh/node-backend/.env | grep DB_PASSWORD | cut -d'=' -f2) hablemos_yhwh -e 'SELECT id, ip_address, platform, browser, created_at FROM torah_viviente_clicks LIMIT 5;'", (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.on('close', () => {
      conn.end();
      process.exit(0);
    });
  });
}).connect({
  host: '179.43.125.96',
  port: 5640,
  username: 'root',
  password
});

