const { Client } = require('ssh2');

const SSH_CONFIG = {
  host: '179.43.125.96',
  port: 5640,
  username: 'root',
  password: 'W1ng3y3r&M4rc3l0',
  tryKeyboard: true,
  readyTimeout: 30000,
  algorithms: {
    kex: [
      'ecdh-sha2-nistp256',
      'ecdh-sha2-nistp384',
      'ecdh-sha2-nistp521',
      'diffie-hellman-group-exchange-sha256',
      'diffie-hellman-group14-sha256',
      'diffie-hellman-group14-sha1',
      'diffie-hellman-group-exchange-sha1',
      'diffie-hellman-group1-sha1'
    ]
  }
};

console.log('Intentando conexión SSH a', SSH_CONFIG.host + ':' + SSH_CONFIG.port, '...');

const conn = new Client();

conn.on('ready', () => {
  console.log('✅ Conectado!');
  conn.exec('echo "OK - conexion exitosa" && uptime', (err, stream) => {
    if (err) { console.error('Error exec:', err); conn.end(); return; }
    stream.on('close', () => conn.end())
    .on('data', (d) => process.stdout.write(d.toString()))
    .stderr.on('data', (d) => process.stderr.write(d.toString()));
  });
}).on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
  console.log('  -> Keyboard-interactive auth solicitada, respondiendo...');
  finish([SSH_CONFIG.password]);
}).on('handshake', (negotiated) => {
  console.log('  -> Handshake completado:', JSON.stringify(negotiated.kex));
}).on('error', (err) => {
  console.error('❌ Error SSH:', err.message);
  console.error('   Nivel:', err.level);
  if (err.level === 'client-authentication') {
    console.error('\n   La contraseña fue rechazada por el servidor.');
    console.error('   Verificá conectándote manualmente: ssh -p 5640 root@179.43.125.96');
  }
}).on('close', () => {
  console.log('Conexión cerrada.');
}).connect(SSH_CONFIG);
