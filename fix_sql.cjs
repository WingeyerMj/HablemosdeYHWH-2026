const fs = require('fs');
let text = fs.readFileSync('database/backup_servidor.sql', 'utf8');
// Remove MariaDB 11.x sandbox mode line that breaks older versions
text = text.replace(/\/\*M!999999\\- enable the sandbox mode \*\/\s*\n?/, '');
fs.writeFileSync('database/backup_clean.sql', text, 'utf8');
console.log('Sandbox line removed. File saved as database/backup_clean.sql');
console.log('First 200 chars:', text.substring(0, 200));
