const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('✅ Conectado al servidor remoto.');
  
  const sql = `
-- 1. Agregar columnas faltantes a ensenanzas
ALTER TABLE ensenanzas ADD COLUMN IF NOT EXISTS views INT DEFAULT 0 AFTER is_published;
ALTER TABLE ensenanzas ADD COLUMN IF NOT EXISTS author VARCHAR(150) DEFAULT 'Moréh Kalev Aquerman' AFTER youtube_link;
ALTER TABLE ensenanzas ADD COLUMN IF NOT EXISTS author_role VARCHAR(150) DEFAULT 'Moreh' AFTER author;
ALTER TABLE ensenanzas ADD COLUMN IF NOT EXISTS author_img VARCHAR(500) DEFAULT '/assets/img/team/kaleb.jpg' AFTER author_role;
ALTER TABLE ensenanzas ADD COLUMN IF NOT EXISTS authors LONGTEXT DEFAULT NULL AFTER author_img;
ALTER TABLE ensenanzas ADD COLUMN IF NOT EXISTS teaching_date DATE DEFAULT NULL AFTER subtitle;
ALTER TABLE ensenanzas ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT NULL AFTER teaching_date;

-- 2. Crear tabla haftarot si no existe
CREATE TABLE IF NOT EXISTS haftarot (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parasha_id INT DEFAULT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    parasha_reference VARCHAR(255),
    description TEXT,
    content LONGTEXT,
    image_url VARCHAR(500),
    youtube_link VARCHAR(500),
    audio_url VARCHAR(500),
    author VARCHAR(150) DEFAULT 'Moréh Kaleb',
    author_role VARCHAR(150) DEFAULT 'Moréh',
    author_img VARCHAR(500) DEFAULT '/assets/img/team/kaleb.jpg',
    authors LONGTEXT DEFAULT NULL,
    views INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Asegurar columnas en haftarot si ya existía
ALTER TABLE haftarot ADD COLUMN IF NOT EXISTS views INT DEFAULT 0 AFTER authors;
ALTER TABLE haftarot ADD COLUMN IF NOT EXISTS parasha_id INT DEFAULT NULL AFTER id;
ALTER TABLE haftarot ADD COLUMN IF NOT EXISTS authors LONGTEXT DEFAULT NULL AFTER author_img;
  `.replace(/"/g, '\\"');

  const cmd = `
    mysql -u yhwh -pFuerza2024! hablemos_yhwh -e "${sql}"
    echo "=== Verificando columnas ==="
    mysql -u yhwh -pFuerza2024! hablemos_yhwh -e "DESCRIBE ensenanzas; DESCRIBE haftarot;"
    echo "=== Probando views ==="
    mysql -u yhwh -pFuerza2024! hablemos_yhwh -e "SELECT id, title, views FROM ensenanzas LIMIT 5; SELECT id, title, views FROM haftarot LIMIT 5;"
    echo "=== Reiniciando servidor ==="
    pm2 restart hablemos-web
  `;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('\n✅ Proceso completado con código:', code);
      conn.end();
    }).on('data', (d) => {
      process.stdout.write(d.toString());
    }).stderr.on('data', (d) => {
      process.stderr.write(d.toString());
    });
  });
}).on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
  finish(['W1ng3y3r&M4rc3l0']);
}).connect({
  host: '179.43.125.96',
  port: 5640,
  username: 'root',
  password: 'W1ng3y3r&M4rc3l0',
  tryKeyboard: true
});
