const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const root = __dirname;
const credentialSource = fs.readFileSync(path.join(root, 'check_remote_views.cjs'), 'utf8');
const password = credentialSource.match(/password:\s*'([^']+)'/)?.[1];
if (!password) throw new Error('No se encontró la credencial SSH local configurada');

const local = path.join(root, 'node-backend', 'src', 'views', 'admin', 'layout.ejs');
const project = '/var/www/hablemos_yhwh';
const remote = `${project}/node-backend/src/views/admin/layout.ejs`;
const temporary = `${remote}.codex-upload`;

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
    const backup = `${project}/deploy-backups/admin-layout-before-modal-scroll-${stamp}.ejs`;
    await run(`set -e; mkdir -p '${project}/deploy-backups'; cp -p '${remote}' '${backup}'`);
    await upload(connection, local, temporary);
    const result = await run(`set -e; grep -Fq 'scrollbar-gutter: stable' '${temporary}'; grep -Fq '.modal-content > form > .modal-body' '${temporary}'; mv '${temporary}' '${remote}'; chown --reference='${backup}' '${remote}'; chmod --reference='${backup}' '${remote}'; pm2 restart hablemos-web --update-env >/dev/null; sleep 2; curl -sS -o /dev/null -w 'ADMIN_HTTP=%{http_code}\n' 'https://hablemosdeyhwh.com/admin/dashboard'; grep -Fq 'scrollbar-gutter: stable' '${remote}'; echo BACKUP='${backup}'; echo MODAL_SCROLL_DEPLOYMENT_OK`);
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
