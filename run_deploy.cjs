const { Client } = require('ssh2');
const conn = new Client();
const pwd = 'H4bl3m0sd3!yhwh';

conn.on('ready', () => {
  console.log('Iniciando implementación en el servidor...');
  const commands = [
    'cd /var/www/hablemos_yhwh',
    // Unstage any staged files without touching working directory files
    'git reset HEAD 2>&1',
    // Pull latest main (which contains the updated .gitignore and protected deploy script)
    'git pull origin main 2>&1',
    'echo "=== PULL COMPLETADO ==="',
    // Copy any parashot covers to public/assets/parashot if missing
    'cp -n node-backend/public/assets/parashot/*.png public/assets/parashot/ 2>/dev/null || true',
    'cp -n public/assets/parashot/*.png node-backend/public/assets/parashot/ 2>/dev/null || true',
    // Restart PM2 service
    'pm2 restart hablemos-web 2>&1',
    'echo "=== PM2 RESTART COMPLETADO ==="',
    'pm2 status 2>&1',
    'echo "=== VERIFICANDO PORTADAS ==="',
    'curl -s -o /dev/null -w "Bereshit: %{http_code}\\n" http://localhost:3000/assets/parashot/1795577413008-13381906.png',
    'curl -s -o /dev/null -w "Noaj: %{http_code}\\n" http://localhost:3000/assets/parashot/1795577428024-13854511.png',
    'curl -s -o /dev/null -w "Lej Leja: %{http_code}\\n" http://localhost:3000/assets/parashot/1795572149170-87131858.png',
    'curl -s -o /dev/null -w "Vayera: %{http_code}\\n" http://localhost:3000/assets/parashot/1795572167130-24087229.png',
    'curl -s -o /dev/null -w "Jaye Sarah: %{http_code}\\n" http://localhost:3000/assets/parashot/1795572187034-898167919.png',
    'curl -s -o /dev/null -w "Toledot: %{http_code}\\n" http://localhost:3000/assets/parashot/1795572214478-525971788.png',
    'curl -s -o /dev/null -w "Vayetze: %{http_code}\\n" http://localhost:3000/assets/parashot/1795572233342-861410321.png'
  ].join(' && ');

  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('Implementación terminada con código:', code);
      conn.end();
    })
    .on('data', d => process.stdout.write(d.toString()))
    .stderr.on('data', d => process.stderr.write(d.toString()));
  });
}).on('keyboard-interactive', (n, i, l, p, finish) => finish([pwd]))
.on('error', err => console.error('SSH error:', err))
.connect({ host: '179.43.125.96', port: 5640, username: 'root', password: pwd, tryKeyboard: true });