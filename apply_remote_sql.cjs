const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected to server.');
  const sql = `
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS semillas_torah (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    category VARCHAR(100) DEFAULT 'Parashá Infantil',
    author VARCHAR(100) DEFAULT 'Elva Avila',
    description TEXT,
    content LONGTEXT,
    image_url VARCHAR(500),
    pdf_file VARCHAR(500),
    youtube_link VARCHAR(500),
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO semillas_torah (id, title, subtitle, category, author, description, content, image_url, youtube_link, is_published)
VALUES 
(1, 'Parashá Bereshit: El Comienzo de Todo', 'Génesis 1:1 - 6:8', 'Parashá Infantil', 'Elva Avila', 
'Descubre cómo el Creador hizo el mundo en seis días con Su Palabra y descansó en el sagrado Shabat.', 
'<p>¡Shalom amiguitos! En esta primera porción de la Toráh llamada <strong>Bereshit</strong> (\"En el principio\"), aprendemos cómo nuestro Creador dio vida a la luz, el cielo, la tierra, los mares, los animalitos y finalmente al ser humano.</p><p>Cada día de la creación nos muestra Su amor y sabiduría. ¡Y para coronar toda Su obra, nos regaló el Shabat como día especial de descanso y alegría!</p>', 
'/assets/img/pagina/semillas_torah_banner.png', '', TRUE),

(2, 'La Historia de Noé y el Gran Arcoíris', 'Génesis 6:9 - 11:32', 'Historias Bíblicas', 'Elva Avila', 
'Una lección sobre la obediencia, la confianza en el Creador y la hermosa señal del pacto en el cielo.', 
'<p>Noé era un hombre justo que caminaba con el Creador. Cuando llegó el diluvio, confió plenamente y construyó el arca.</p><p>Al terminar, el Creador puso el arcoíris en las nubes como recordatorio de Su fidelidad y misericordia para siempre.</p>', 
'/assets/img/pagina/semillas_torah.jpg', '', TRUE),

(3, 'Manualidad para Shabat: Candelabro y Flores', 'Actividad Familiar', 'Manualidades & Dibujos', 'Elva Avila', 
'Aprende a preparar una linda decoración para la mesa de Shabat con materiales sencillos que tienes en casa.', 
'<p>¡Prepara junto a tus papás una hermosa manualidad para recibir el día de reposo con gozo y alegría!</p>', 
'/assets/img/pagina/semillas_torah_logo.png', '', TRUE);
  `.replace(/"/g, '\\"');

  const cmd = `
    mysql -u yhwh -pFuerza2024! hablemos_yhwh -e "${sql}"
    echo "=== Tablas actualizadas ==="
    mysql -u yhwh -pFuerza2024! hablemos_yhwh -e "SELECT count(*) as total_suscriptores FROM newsletter_subscribers; SELECT id, title, category FROM semillas_torah;"
    pm2 restart hablemos-web
  `;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('Process completed with code:', code);
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
