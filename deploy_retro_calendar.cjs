// Despliegue del Motor Lunisolar Retrospectivo (Año 1 al 2040+) y endpoints de API
const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const root = __dirname;

const files = [
  'node-backend/src/services/calendarService.js',
  'node-backend/src/data/calendario_retro.json',
  'node-backend/src/routes/api.js',
  'node-backend/src/views/calendar.ejs',
  'Calendar/index.html',
  'Calendar/js/calendarEngine.js',
  'Calendar/js/moonPhase.js',
  'Calendar/js/main.js',
  'Calendar/sw.js',
  'public/assets/calendar/js/calendarEngine.js',
  'public/assets/calendar/js/moonPhase.js',
  'public/assets/calendar/js/main.js',
  'public/sw-calendar.js'
];

for (const f of files) {
  if (!fs.existsSync(path.join(root, f))) {
    throw new Error('Falta archivo local para despliegue: ' + f);
  }
}

const project = '/var/www/hablemos_yhwh';
const password = 'H4bl3m0sd3!yhwh';

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
    console.log('✅ Conexión SSH establecida con el servidor de producción.');
    const connection = await sftp();
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, 'Z');
    const backupDir = `${project}/deploy-backups/calendar-retro-${stamp}`;

    // 1. Copia de seguridad de los archivos existentes en el VPS
    const quoted = files.map(f => `'${f}'`).join(' ');
    await run(`set -e; cd '${project}'; mkdir -p '${backupDir}'; for f in ${quoted}; do if [ -f "$f" ]; then mkdir -p "${backupDir}/$(dirname "$f")"; cp -p "$f" "${backupDir}/$f"; fi; done`);
    console.log(`📁 Backup creado en el servidor: ${backupDir}`);

    // 2. Subida atómica con sufijo temporal
    for (const f of files) {
      const remote = `${project}/${f}`;
      await run(`mkdir -p '${path.posix.dirname(remote)}'`);
      await upload(connection, path.join(root, f), `${remote}.retro-upload`);
      console.log('⬆️  Subido archivo: ' + f);
    }

    // 3. Reemplazo atómico, verificación de sintaxis y reinicio con PM2
    const moves = files.map(f => `mv '${project}/${f}.retro-upload' '${project}/${f}'`).join('; ');
    const remoteCommands = `
      set -e
      ${moves}
      cd '${project}/node-backend'
      node --check src/services/calendarService.js
      node --check src/routes/api.js
      node --check app.js
      node -e "const cs = require('./src/services/calendarService'); console.log('Test Año 1:', cs.buildLunisolarYear(1).roshHashana); console.log('Test Año 2026:', cs.buildLunisolarYear(2026).roshHashana);"
      pm2 restart hablemos-web --update-env >/dev/null
      sleep 3
      curl -sS 'http://localhost:3000/api/calendar/year/1' | head -c 120
      echo ""
      curl -sS 'http://localhost:3000/api/calendar/year/2026' | head -c 120
      echo ""
      curl -sS -o /dev/null -w 'CALENDAR_UI_HTTP=%{http_code}\n' 'https://hablemosdeyhwh.com/calendar'
      echo "DEPLOY_RETRO_CALENDAR_SUCCESS"
    `;

    const result = await run(remoteCommands);
    console.log(result.trim());
    console.log('🎉 ¡Despliegue completado con éxito en el servidor de producción!');
  } catch (error) {
    console.error(`❌ Error durante el despliegue: ${error.message}`);
    process.exitCode = 1;
  } finally {
    client.end();
  }
});

client.on('error', error => {
  console.error(`❌ Error de conexión SSH: ${error.message}`);
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
  readyTimeout: 30000
});
