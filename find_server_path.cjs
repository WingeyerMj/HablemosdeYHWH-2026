const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec('find /var /home /opt /root -type d -name "HablemosdeYHWH-2026" 2>/dev/null', (err, stream) => {
    if (err) throw err;
    let result = '';
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      console.log('Result Paths:\n' + result);
      conn.end();
    }).on('data', (data) => {
      result += data;
    }).stderr.on('data', (data) => {
      console.error('STDERR: ' + data);
    });
  });
}).on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
  finish(['M4rc3l0&W1ng3y3r']);
}).connect({
  host: '179.43.125.96',
  port: 5640,
  username: 'root',
  password: 'M4rc3l0&W1ng3y3r',
  tryKeyboard: true
});
