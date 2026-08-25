const { Client } = require('ssh2');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const SSH_CONFIG = {
  host: '179.43.125.96',
  port: 5640,
  username: 'root',
  password: 'W1ng3y3r&M4rc3l0',
  tryKeyboard: true
};

const REMOTE_DIR = '/var/www/hablemos_yhwh';
const LOCAL_TAR_PATH = path.join(__dirname, '..', 'project_temp.tar.gz');
const REMOTE_TAR_PATH = REMOTE_DIR + '/project_temp.tar.gz';

console.log('--- DEPLOY DIRECTO AL SERVIDOR (SIN TOCAR BASE DE DATOS) ---');

// Paso 1: Comprimir localmente
try {
  console.log('1. Comprimiendo archivos locales (excluyendo node_modules, vendor, .git, .env)...');
  
  // Si ya existe el archivo temporal, lo eliminamos
  if (fs.existsSync(LOCAL_TAR_PATH)) {
    fs.unlinkSync(LOCAL_TAR_PATH);
  }

  // Comando tar para excluir directorios pesados, envs y carpetas de uploads dinámicos
  const tarCmd = `tar --exclude=node_modules --exclude=vendor --exclude=.git --exclude=.env --exclude=*.zip --exclude=temp_zip_check --exclude=node-backend/node_modules --exclude=node-backend/.env --exclude=node-backend/public/assets/parashot --exclude=node-backend/public/uploads --exclude=public/uploads -czf "${LOCAL_TAR_PATH}" .`;
  
  execSync(tarCmd, { cwd: __dirname });
  const stats = fs.statSync(LOCAL_TAR_PATH);
  console.log(`   Compresión completada con éxito. Tamaño del archivo: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
} catch (error) {
  console.error('Error al comprimir los archivos:', error.message);
  process.exit(1);
}

// Paso 2: Conectar e iniciar subida
const conn = new Client();

conn.on('ready', () => {
  console.log('2. Conectado al servidor vía SSH.');
  
  conn.sftp((err, sftp) => {
    if (err) {
      cleanupLocal();
      console.error('Error al iniciar SFTP:', err);
      conn.end();
      process.exit(1);
    }
    
    console.log('3. Subiendo archivo al servidor...');
    
    sftp.fastPut(LOCAL_TAR_PATH, REMOTE_TAR_PATH, {
      step: (transferred, chunk, total) => {
        const percent = ((transferred / total) * 100).toFixed(2);
        process.stdout.write(`   Progreso de subida: ${percent}% (${(transferred / 1024 / 1024).toFixed(2)} MB de ${(total / 1024 / 1024).toFixed(2)} MB)\r`);
      }
    }, (errUpload) => {
      if (errUpload) {
        cleanupLocal();
        console.error('\nError en la subida SFTP:', errUpload);
        conn.end();
        process.exit(1);
      }
      
      console.log('\n4. Subida completada con éxito.');
      
      // Paso 3: Descomprimir y reiniciar PM2 en el servidor
      console.log('5. Descomprimiendo en el servidor y reiniciando pm2...');
      
      const remoteCmd = `
        echo "=== Descomprimiendo archivos ===" &&
        tar -xzf "${REMOTE_TAR_PATH}" -C "${REMOTE_DIR}" &&
        echo "=== Eliminando archivo temporal en servidor ===" &&
        rm "${REMOTE_TAR_PATH}" &&
        echo "=== Instalando dependencias de Node.js ===" &&
        cd "${REMOTE_DIR}/node-backend" &&
        npm install &&
        echo "=== Reiniciando servicio PM2 ===" &&
        pm2 restart hablemos-web &&
        echo "=== PM2 Status ===" &&
        pm2 list
      `;
      
      conn.exec(remoteCmd, (errExec, stream) => {
        if (errExec) {
          cleanupLocal();
          console.error('Error al ejecutar comandos remotos:', errExec);
          conn.end();
          process.exit(1);
        }
        
        stream.on('close', (code, signal) => {
          cleanupLocal();
          console.log(`\nStream cerrado con código: ${code}`);
          if (code === 0) {
            console.log('\n¡Despliegue finalizado con éxito de forma directa!');
          } else {
            console.error('\nHubo un problema durante la ejecución de comandos en el servidor.');
          }
          conn.end();
        }).on('data', (data) => {
          process.stdout.write(data.toString());
        }).stderr.on('data', (data) => {
          process.stderr.write(data.toString());
        });
      });
    });
  });
}).on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
  finish([SSH_CONFIG.password]);
}).on('error', (err) => {
  cleanupLocal();
  console.error('Error de conexión SSH:', err.message);
}).connect(SSH_CONFIG);

function cleanupLocal() {
  try {
    if (fs.existsSync(LOCAL_TAR_PATH)) {
      console.log('6. Limpiando archivo temporal local...');
      fs.unlinkSync(LOCAL_TAR_PATH);
    }
  } catch (e) {
    console.error('Error al limpiar archivo local:', e.message);
  }
}
