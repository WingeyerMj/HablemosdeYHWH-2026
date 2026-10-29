// Despliegue selectivo: Calendario Lunisolar instalable (PWA 100% offline)
// Sube solo los archivos modificados, con copia de seguridad previa en el servidor.
const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const root = __dirname;
fs.copyFileSync(path.join(root, 'public/assets/calendar/js/main.js'), path.join(root, 'Calendar/js/main.js'));
fs.copyFileSync(path.join(root, 'public/assets/calendar/css/style.css'), path.join(root, 'Calendar/css/style.css'));
const credentialSource = fs.readFileSync(path.join(root, 'check_remote_views.cjs'), 'utf8');
const password = credentialSource.match(/password:\s*'([^']+)'/)?.[1];
if (!password) throw new Error('No se encontró la credencial SSH local configurada');

const project = '/var/www/hablemos_yhwh';
const files = [
  'node-backend/app.js',
  'node-backend/src/utils/calendarPwaAssets.js',
  'node-backend/src/views/partials/head.ejs',
  'node-backend/src/views/calendar.ejs',
  'public/manifest-calendar.json',
  'public/sw-calendar.js',
  'public/assets/js/main.js',
  'public/assets/calendar/css/style.css',
  'public/assets/calendar/js/main.js',
  'public/assets/calendar/js/parashotEngine.js',
  'public/assets/calendar/icons/calendar-icon.svg',
  'public/assets/calendar/icons/cal-icon.jpg',
  'public/assets/calendar/icons/icon-192.png',
  'public/assets/calendar/icons/icon-512.png',
  'public/assets/calendar/icons/apple-touch-icon.png',
  'Calendar/index.html',
  'Calendar/manifest.json',
  'Calendar/sw.js',
  'Calendar/css/style.css',
  'Calendar/js/main.js',
  'Calendar/js/parashotEngine.js',
  'Calendar/icons/calendar-icon.svg',
  'Calendar/icons/cal-icon.jpg',
  'Calendar/icons/icon-192.png',
  'Calendar/icons/icon-512.png',
  'Calendar/icons/apple-touch-icon.png'
];

for (const f of files) {
  if (!fs.existsSync(path.join(root, f))) throw new Error('Falta archivo local: ' + f);
}

const client = new Client();
const run = command => new Promise((resolve, reject) => {
  client.exec(command, (error, stream) => {
    if (error) return reject(error);
    let stdout = '';
    let stderr = '';
    stream.on('data', data => { stdout += data; });
    stream.stderr.on('data', data => { stderr += data; });
    stream.on('close', code => code === 0 ? resolve(stdout) : reject(new Error(stderr || stdout)));
  });
});
const sftp = () => new Promise((resolve, reject) => client.sftp((error, value) => error ? reject(error) : resolve(value)));
const upload = (connection, source, destination) => new Promise((resolve, reject) => {
  connection.fastPut(source, destination, error => error ? reject(error) : resolve());
});

client.on('ready', async () => {
  try {
    const connection = await sftp();
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, 'Z');
    const backupDir = `${project}/deploy-backups/calendar-pwa-${stamp}`;

    // 1. Copia de seguridad de los archivos existentes
    const quoted = files.map(f => `'${f}'`).join(' ');
    await run(`set -e; cd '${project}'; mkdir -p '${backupDir}'; for f in ${quoted}; do if [ -f "$f" ]; then mkdir -p "${backupDir}/$(dirname "$f")"; cp -p "$f" "${backupDir}/$f"; fi; done`);
    console.log('BACKUP=' + backupDir);

    // 2. Subida a archivos temporales
    for (const f of files) {
      const remote = `${project}/${f}`;
      await run(`mkdir -p '${path.posix.dirname(remote)}'`);
      await upload(connection, path.join(root, f), `${remote}.codex-upload`);
      console.log('SUBIDO ' + f);
    }

    // 3. Reemplazo atómico, verificación de sintaxis y reinicio
    const moves = files.map(f => `mv '${project}/${f}.codex-upload' '${project}/${f}'`).join('; ');
    const result = await run(`set -e; ${moves}; cd '${project}/node-backend'; node --check app.js; node -e "require('./src/utils/calendarPwaAssets')"; pm2 restart hablemos-web --update-env >/dev/null; sleep 3; curl -sS -o /dev/null -w 'CALENDAR_HTTP=%{http_code}\\n' 'https://hablemosdeyhwh.com/calendar'; curl -sS -o /dev/null -w 'SW_HTTP=%{http_code}\\n' 'https://hablemosdeyhwh.com/sw-calendar.js'; curl -sS -o /dev/null -w 'MANIFEST_HTTP=%{http_code}\\n' 'https://hablemosdeyhwh.com/manifest-calendar.json'; curl -sS -o /dev/null -w 'ICON_HTTP=%{http_code}\\n' 'https://hablemosdeyhwh.com/assets/calendar/icons/icon-192.png'; echo CALENDAR_PWA_DEPLOYMENT_OK`);
    console.log(result.trim());
  } catch (error) {
    console.error(`DEPLOYMENT_ERROR=${error.message}`);
    process.exitCode = 1;
  } finally {
    client.end();
  }
});
client.on('error', error => {
  console.error(`SSH_ERROR=${error.message}`);
  process.exitCode = 1;
});
client.on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
  finish(prompts.map(() => password));
});
client.connect({
  host: '179.43.125.96',
  port: 5640,
  username: 'root',
  password,
  tryKeyboard: true,
  readyTimeout: 20000,
});

