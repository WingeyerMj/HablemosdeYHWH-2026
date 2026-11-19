const { Client } = require('ssh2');

function runRemote(cmd) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    const pw = 'H4bl3m0sd3!yhwh';
    conn.on('ready', () => {
      conn.exec(cmd, (err, stream) => {
        if (err) { conn.end(); return reject(err); }
        let stdout = '';
        let stderr = '';
        stream.on('data', d => stdout += d.toString());
        stream.stderr.on('data', d => stderr += d.toString());
        stream.on('close', (code) => {
          conn.end();
          resolve({ code, stdout, stderr });
        });
      });
    }).on('keyboard-interactive', (n, i, l, p, finish) => {
      finish([pw]);
    }).on('error', reject).connect({
      host: '179.43.125.96',
      port: 5640,
      username: 'root',
      password: pw,
      tryKeyboard: true,
      readyTimeout: 20000
    });
  });
}

const arg = process.argv[2] || 'uptime';
runRemote(arg).then(res => {
  if (res.stdout) console.log(res.stdout);
  if (res.stderr) console.error(res.stderr);
  process.exit(res.code || 0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
