const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const SSH_CONFIG = {
  host: '179.43.125.96',
  port: 5640,
  username: 'root',
  password: 'H4bl3m0sd3!yhwh',
  tryKeyboard: true,
  readyTimeout: 30000
};

const REMOTE_BASE = '/var/www/hablemos_yhwh';

const filesToSync = [
  'node-backend/app.js',
  'node-backend/src/config/multer.js',
  'node-backend/src/models/ParashaInfantil.js',
  'node-backend/src/views/semillas_torah.ejs',
  'public/assets/js/audio-gain-booster.js',
  'node-backend/src/views/aliyot.ejs',
  'node-backend/src/views/admin/aliyot.ejs',
  'node-backend/src/views/admin/edit_aliyah_single.ejs',
  'node-backend/src/views/admin/edit_aliyot.ejs',
  'node-backend/src/views/admin/edit_musica.ejs',
  'node-backend/src/views/admin/musica.ejs',
  'node-backend/src/views/admin/edit_parasha_infantil.ejs',
  'node-backend/src/views/parasha_detail.ejs',
  'node-backend/src/views/haftara_detail.ejs',
  'node-backend/src/views/archivo_historico.ejs'
];

const conn = new Client();

conn.on('ready', () => {
  console.log('✅ Conectado al VPS!');
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP error:', err);
      conn.end();
      process.exit(1);
    }

    let i = 0;
    function uploadNext() {
      if (i >= filesToSync.length) {
        console.log('\n✅ Todos los archivos subidos correctamente.');
        restartPM2();
        return;
      }
      const relPath = filesToSync[i++];
      const localFile = path.resolve(__dirname, relPath);
      const remoteFile = REMOTE_BASE + '/' + relPath.replace(/\\/g, '/');

      console.log(`Subiendo [${i}/${filesToSync.length}]: ${relPath}`);
      sftp.fastPut(localFile, remoteFile, (err) => {
        if (err) {
          console.error(`❌ Error subiendo ${relPath}:`, err.message);
          conn.end();
          process.exit(1);
        }
        uploadNext();
      });
    }

    uploadNext();
  });
}).on('keyboard-interactive', (n, i, l, p, finish) => {
  finish([SSH_CONFIG.password]);
}).on('error', (err) => {
  console.error('SSH Error:', err.message);
  process.exit(1);
}).connect(SSH_CONFIG);

function restartPM2() {
  console.log('Reiniciando servicio en PM2...');
  const cmd = 'pm2 restart hablemos-web && pm2 status hablemos-web';
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Error al reiniciar PM2:', err);
      conn.end();
      process.exit(1);
    }
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stderr.write(d.toString()));
    stream.on('close', (code) => {
      console.log(`\nPM2 finalizado con código ${code}`);
      conn.end();
      process.exit(0);
    });
  });
}
