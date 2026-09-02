CREATE DATABASE IF NOT EXISTS hablemos_yhwh;
USE hablemos_yhwh;

-- Tabla de usuarios para el login del backend
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role ENUM('admin', 'editor') DEFAULT 'editor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para las secciones de la web (Hero, About, Calendario, etc.)
CREATE TABLE IF NOT EXISTS sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    page VARCHAR(50) DEFAULT 'home',
    section_name VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255),
    subtitle TEXT,
    content TEXT,
    image_url VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Usuarios iniciales
INSERT IGNORE INTO users (username, password, role)
VALUES ('admin', '$2a$10$r.v8z6K8X9hHqB6W1i7kUeA4eF.W5.E6B1D0C4C8A9A9A9A9A9A9', 'admin');

INSERT IGNORE INTO users (username, password, role)
VALUES ('editor', '$2a$10$r.v8z6K8X9hHqB6W1i7kUeA4eF.W5.E6B1D0C4C8A9A9A9A9A9A9', 'editor');

-- Ejemplos de secciones iniciales
INSERT IGNORE INTO sections (section_name, title, subtitle, content)
VALUES ('Hero', 'Hablemos de YHWH', 'Descubre las raíces hebreas de tu fe', 'Contenido descriptivo aquí...');

INSERT IGNORE INTO sections (section_name, title, subtitle, content)
VALUES ('Calendario', 'Calendario Lunisolar', 'Sigue los tiempos señalados', 'Información sobre el calendario...');

INSERT IGNORE INTO sections (section_name, title, subtitle, content)
VALUES ('About', 'Sobre Nosotros', 'Nuestra historia y valores', 'Ullamco laboris nisi ut...');

-- Tabla para las Parashot (Porciones Semanales)
CREATE TABLE IF NOT EXISTS parashot (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parasha_number INT,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    content LONGTEXT,
    image_url VARCHAR(500),
    pdf_file VARCHAR(500),
    icon VARCHAR(100) DEFAULT 'bi-journal-text',
    link VARCHAR(255),
    youtube_link VARCHAR(255),
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Migraciones seguras para agregar columnas si no existen
ALTER TABLE parashot ADD COLUMN IF NOT EXISTS parasha_number INT AFTER id;
ALTER TABLE parashot ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255) AFTER title;
ALTER TABLE parashot ADD COLUMN IF NOT EXISTS content LONGTEXT AFTER description;
ALTER TABLE parashot ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) AFTER content;
ALTER TABLE parashot ADD COLUMN IF NOT EXISTS pdf_file VARCHAR(500) AFTER image_url;
ALTER TABLE parashot ADD COLUMN IF NOT EXISTS youtube_link VARCHAR(255) AFTER link;
ALTER TABLE parashot ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE AFTER youtube_link;
ALTER TABLE parashot ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Tabla para Eventos (antes Portfolio)
CREATE TABLE IF NOT EXISTS portfolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    category VARCHAR(100),
    description TEXT,
    content LONGTEXT,
    event_date DATE,
    image_url VARCHAR(500),
    img VARCHAR(255),
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Migraciones seguras para portfolio
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS subtitle VARCHAR(255) AFTER title;
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS content LONGTEXT AFTER description;
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS event_date DATE AFTER content;
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) AFTER event_date;
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE AFTER img;
ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Tabla para Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    text TEXT,
    img VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para Team
CREATE TABLE IF NOT EXISTS team (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    description TEXT,
    img VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para Pricing
CREATE TABLE IF NOT EXISTS pricing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price VARCHAR(50),
    featured BOOLEAN DEFAULT FALSE,
    features TEXT,
    na_features TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para configuración del sitio (editable desde backend)
CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('text', 'textarea', 'email', 'url', 'image') DEFAULT 'text',
    setting_group VARCHAR(50) DEFAULT 'general',
    label VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Datos iniciales de configuración del sitio
INSERT IGNORE INTO site_settings (setting_key, setting_value, setting_type, setting_group, label)
VALUES ('site_name', 'Hablemos de YHWH', 'text', 'general', 'Nombre del Sitio');

INSERT IGNORE INTO site_settings (setting_key, setting_value, setting_type, setting_group, label)
VALUES ('contact_address', 'Misiones, Argentina', 'text', 'contact', 'Dirección');

INSERT IGNORE INTO site_settings (setting_key, setting_value, setting_type, setting_group, label)
VALUES ('contact_phone', '+54 9 XXX XXX XXXX', 'text', 'contact', 'Teléfono');

INSERT IGNORE INTO site_settings (setting_key, setting_value, setting_type, setting_group, label)
VALUES ('contact_email', 'info@hablemosdeyhwh.com', 'email', 'contact', 'Email');

INSERT IGNORE INTO site_settings (setting_key, setting_value, setting_type, setting_group, label)
VALUES ('social_youtube', '', 'url', 'social', 'Canal de YouTube');

INSERT IGNORE INTO site_settings (setting_key, setting_value, setting_type, setting_group, label)
VALUES ('social_facebook', '', 'url', 'social', 'Facebook');

INSERT IGNORE INTO site_settings (setting_key, setting_value, setting_type, setting_group, label)
VALUES ('social_instagram', '', 'url', 'social', 'Instagram');

INSERT IGNORE INTO site_settings (setting_key, setting_value, setting_type, setting_group, label)
VALUES ('social_whatsapp', '', 'url', 'social', 'WhatsApp');

-- Datos iniciales condicionales
INSERT IGNORE INTO parashot (title, description)
VALUES ('Bereshit', 'En el principio...');

-- Tabla para secciones dinámicas (administrables desde el backend)
CREATE TABLE IF NOT EXISTS dynamic_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    section_type ENUM('inline', 'page') NOT NULL DEFAULT 'inline',
    summary TEXT,
    content LONGTEXT,
    icon VARCHAR(100) DEFAULT 'bi-file-text',
    image_url VARCHAR(500),
    nav_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    show_in_navbar BOOLEAN DEFAULT TRUE,
    data_table VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla para permisos de secciones por editor
CREATE TABLE IF NOT EXISTS section_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_id INT NOT NULL,
    user_id INT NOT NULL,
    UNIQUE KEY unique_perm (section_id, user_id),
    FOREIGN KEY (section_id) REFERENCES dynamic_sections(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla para enlaces del footer (administrables desde el backend)
CREATE TABLE IF NOT EXISTS footer_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL DEFAULT '#',
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Evita duplicados en instalaciones nuevas.
CREATE UNIQUE INDEX footer_links_unique_link ON footer_links (category, title, url);

-- Sección Footer inicial
INSERT IGNORE INTO sections (section_name, title, subtitle, content)
VALUES ('Footer', 'Hablemos de YHWH', 'Estudio bíblico desde la perspectiva hebrea', '');

-- Enlaces de footer iniciales
INSERT INTO footer_links (category, title, url, order_index)
SELECT 'Enlaces Útiles', 'Inicio', '/', 1
WHERE NOT EXISTS (SELECT 1 FROM footer_links WHERE title = 'Inicio' AND url = '/');

INSERT INTO footer_links (category, title, url, order_index)
SELECT 'Enlaces Útiles', 'Sobre Nosotros', '/#about', 2
WHERE NOT EXISTS (SELECT 1 FROM footer_links WHERE title = 'Sobre Nosotros' AND url = '/#about');

INSERT INTO footer_links (category, title, url, order_index)
SELECT 'Enlaces Útiles', 'Parashot', '/parashot', 3
WHERE NOT EXISTS (SELECT 1 FROM footer_links WHERE title = 'Parashot' AND url = '/parashot');

INSERT INTO footer_links (category, title, url, order_index)
SELECT 'Recursos', 'Calendario', '/calendar', 1
WHERE NOT EXISTS (SELECT 1 FROM footer_links WHERE title = 'Calendario' AND url = '/calendar');

INSERT INTO footer_links (category, title, url, order_index)
SELECT 'Recursos', 'Eventos', '/#portfolio', 2
WHERE NOT EXISTS (SELECT 1 FROM footer_links WHERE title = 'Eventos' AND url = '/#portfolio');

INSERT INTO footer_links (category, title, url, order_index)
SELECT 'Enlaces Útiles', 'Enseñanzas', '/ensenanzas', 4
WHERE NOT EXISTS (SELECT 1 FROM footer_links WHERE title = 'Enseñanzas' AND url = '/ensenanzas');

INSERT INTO footer_links (category, title, url, order_index)
SELECT 'Recursos', 'Semillas de Torah', '/semillas-de-torah', 3
WHERE NOT EXISTS (SELECT 1 FROM footer_links WHERE title = 'Semillas de Torah' AND url = '/semillas-de-torah');

-- Tabla para Enseñanzas
CREATE TABLE IF NOT EXISTS ensenanzas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    content LONGTEXT,
    image_url VARCHAR(500),
    youtube_link VARCHAR(500),
    author VARCHAR(150) DEFAULT 'Moréh Kaleb',
    author_role VARCHAR(150) DEFAULT 'Moréh',
    author_img VARCHAR(500) DEFAULT '/assets/img/team/kaleb.jpg',
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Migraciones seguras para ensenanzas
ALTER TABLE ensenanzas ADD COLUMN IF NOT EXISTS author VARCHAR(150) DEFAULT 'Moréh Kaleb' AFTER youtube_link;
ALTER TABLE ensenanzas ADD COLUMN IF NOT EXISTS author_role VARCHAR(150) DEFAULT 'Moréh' AFTER author;
ALTER TABLE ensenanzas ADD COLUMN IF NOT EXISTS author_img VARCHAR(500) DEFAULT '/assets/img/team/kaleb.jpg' AFTER author_role;

-- Tabla para Haftarot (Lecturas Proféticas de la Torá)
CREATE TABLE IF NOT EXISTS haftarot (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Migraciones seguras para haftarot
ALTER TABLE haftarot ADD COLUMN IF NOT EXISTS author VARCHAR(150) DEFAULT 'Moréh Kaleb' AFTER audio_url;
ALTER TABLE haftarot ADD COLUMN IF NOT EXISTS author_role VARCHAR(150) DEFAULT 'Moréh' AFTER author;
ALTER TABLE haftarot ADD COLUMN IF NOT EXISTS author_img VARCHAR(500) DEFAULT '/assets/img/team/kaleb.jpg' AFTER author_role;
ALTER TABLE haftarot ADD COLUMN IF NOT EXISTS parasha_reference VARCHAR(255) AFTER subtitle;

-- Tabla para sección Enseñanzas del Home
CREATE TABLE IF NOT EXISTS home_section_ensenanzas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) DEFAULT 'Enseñanzas',
    subtitle TEXT,
    content TEXT,
    image_url VARCHAR(500),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO home_section_ensenanzas (id, title, subtitle, content)
VALUES (1, 'Enseñanzas', 'Estudios profundos de las Sagradas Escrituras', 'Descubre nuestras enseñanzas temáticas y reflexiones.');

-- Tabla para Blog / Artículos
CREATE TABLE IF NOT EXISTS blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    subtitle VARCHAR(255),
    category VARCHAR(100) DEFAULT 'Reflexiones',
    author VARCHAR(100) DEFAULT 'Hablemos de YHWH',
    summary TEXT,
    content LONGTEXT,
    image_url VARCHAR(500),
    tags VARCHAR(255),
    views INT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla para sección Blog del Home
CREATE TABLE IF NOT EXISTS home_section_blog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) DEFAULT 'Blog & Noticias',
    subtitle TEXT,
    content TEXT,
    image_url VARCHAR(500),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO home_section_blog (id, title, subtitle, content)
VALUES (1, 'Blog & Noticias', 'Reflexiones, artículos y novedades de nuestra comunidad', 'Espacio para compartir reflexiones de fe, estudios bíblicos y noticias relevantes.');

-- Tabla para Suscriptores del Boletín / Newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para Semillas de Torah (Ministerio Infantil)
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

-- Registros iniciales de ejemplo para Semillas de Torah
INSERT IGNORE INTO semillas_torah (id, title, subtitle, category, author, description, content, image_url, youtube_link, is_published)
VALUES 
(1, 'Parashá Bereshit: El Comienzo de Todo', 'Génesis 1:1 - 6:8', 'Parashá Infantil', 'Elva Avila', 
'Descubre cómo el Creador hizo el mundo en seis días con Su Palabra y descansó en el sagrado Shabat.', 
'<p>¡Shalom amiguitos! En esta primera porción de la Toráh llamada <strong>Bereshit</strong> ("En el principio"), aprendemos cómo nuestro Creador dio vida a la luz, el cielo, la tierra, los mares, los animalitos y finalmente al ser humano.</p><p>Cada día de la creación nos muestra Su amor y sabiduría. ¡Y para coronar toda Su obra, nos regaló el Shabat como día especial de descanso y alegría!</p>', 
'/assets/img/pagina/semillas_torah_banner.png', '', TRUE),

(2, 'La Historia de Noé y el Gran Arcoíris', 'Génesis 6:9 - 11:32', 'Historias Bíblicas', 'Elva Avila', 
'Una lección sobre la obediencia, la confianza en el Creador y la hermosa señal del pacto en el cielo.', 
'<p>Noé era un hombre justo que caminaba con el Creador. Cuando llegó el diluvio, confió plenamente y construyó el arca.</p><p>Al terminar, el Creador puso el arcoíris en las nubes como recordatorio de Su fidelidad y misericordia para siempre.</p>', 
'/assets/img/pagina/semillas_torah.jpg', '', TRUE),

(3, 'Manualidad para Shabat: Candelabro y Flores', 'Actividad Familiar', 'Manualidades & Dibujos', 'Elva Avila', 
'Aprende a preparar una linda decoración para la mesa de Shabat con materiales sencillos que tienes en casa.', 
'<p>¡Prepara junto a tus papás una hermosa manualidad para recibir el día de reposo con gozo y alegría!</p>', 
'/assets/img/pagina/semillas_torah_logo.png', '', TRUE);

-- Tabla para Aliyot (Lecturas Diarias de la Torá por Parashá)
CREATE TABLE IF NOT EXISTS aliyot (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parasha_id INT NULL DEFAULT NULL,
    aliyah_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    verses_reference VARCHAR(255),
    content LONGTEXT,
    content_hebrew LONGTEXT,
    content_phonetic LONGTEXT,
    audio_url TEXT,
    reading_date DATE DEFAULT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parasha_id) REFERENCES parashot(id) ON DELETE SET NULL,
    INDEX idx_parasha_aliyah (parasha_id, aliyah_number)
);

ALTER TABLE aliyot ADD COLUMN IF NOT EXISTS content_hebrew LONGTEXT AFTER content;
ALTER TABLE aliyot ADD COLUMN IF NOT EXISTS content_phonetic LONGTEXT AFTER content_hebrew;

-- Asegurar índice único para las 54 Parashot del ciclo anual
ALTER TABLE parashot ADD UNIQUE INDEX IF NOT EXISTS unique_parasha_num (parasha_number);

-- Semilla de las 54 Parashot Canónicas del Ciclo Anual de la Torá
INSERT INTO parashot (parasha_number, title, subtitle, description, content) VALUES
(1, 'Bereshit', 'Génesis 1:1 al 6:8', 'Porción 1: Génesis 1:1 al 6:8', '<p>Estudio de la porción <strong>Bereshit</strong> (Génesis 1:1 al 6:8).</p>'),
(2, 'Noaj', 'Génesis 6:9 al 11:32', 'Porción 2: Génesis 6:9 al 11:32', '<p>Estudio de la porción <strong>Noaj</strong> (Génesis 6:9 al 11:32).</p>'),
(3, 'Lej Lejá', 'Génesis 12:1 al 17:27', 'Porción 3: Génesis 12:1 al 17:27', '<p>Estudio de la porción <strong>Lej Lejá</strong> (Génesis 12:1 al 17:27).</p>'),
(4, 'Vayerá', 'Génesis 18:1 al 22:24', 'Porción 4: Génesis 18:1 al 22:24', '<p>Estudio de la porción <strong>Vayerá</strong> (Génesis 18:1 al 22:24).</p>'),
(5, 'Jayei Sarah', 'Génesis 23:1 al 25:18', 'Porción 5: Génesis 23:1 al 25:18', '<p>Estudio de la porción <strong>Jayei Sarah</strong> (Génesis 23:1 al 25:18).</p>'),
(6, 'Toldot', 'Génesis 25:19 al 28:9', 'Porción 6: Génesis 25:19 al 28:9', '<p>Estudio de la porción <strong>Toldot</strong> (Génesis 25:19 al 28:9).</p>'),
(7, 'Vayetze', 'Génesis 28:10 al 32:3', 'Porción 7: Génesis 28:10 al 32:3', '<p>Estudio de la porción <strong>Vayetze</strong> (Génesis 28:10 al 32:3).</p>'),
(8, 'Vayishlaj', 'Génesis 32:4 al 36:43', 'Porción 8: Génesis 32:4 al 36:43', '<p>Estudio de la porción <strong>Vayishlaj</strong> (Génesis 32:4 al 36:43).</p>'),
(9, 'Vayeshev', 'Génesis 37:1 al 40:23', 'Porción 9: Génesis 37:1 al 40:23', '<p>Estudio de la porción <strong>Vayeshev</strong> (Génesis 37:1 al 40:23).</p>'),
(10, 'Miketz', 'Génesis 41:1 al 44:17', 'Porción 10: Génesis 41:1 al 44:17', '<p>Estudio de la porción <strong>Miketz</strong> (Génesis 41:1 al 44:17).</p>'),
(11, 'Vayigash', 'Génesis 44:18 al 47:27', 'Porción 11: Génesis 44:18 al 47:27', '<p>Estudio de la porción <strong>Vayigash</strong> (Génesis 44:18 al 47:27).</p>'),
(12, 'Vayeji', 'Génesis 47:28 al 50:26', 'Porción 12: Génesis 47:28 al 50:26', '<p>Estudio de la porción <strong>Vayeji</strong> (Génesis 47:28 al 50:26).</p>'),
(13, 'Shemot', 'Éxodo 1:1 al 6:1', 'Porción 13: Éxodo 1:1 al 6:1', '<p>Estudio de la porción <strong>Shemot</strong> (Éxodo 1:1 al 6:1).</p>'),
(14, 'Vaerá', 'Éxodo 6:2 al 9:35', 'Porción 14: Éxodo 6:2 al 9:35', '<p>Estudio de la porción <strong>Vaerá</strong> (Éxodo 6:2 al 9:35).</p>'),
(15, 'Bo', 'Éxodo 10:1 al 13:16', 'Porción 15: Éxodo 10:1 al 13:16', '<p>Estudio de la porción <strong>Bo</strong> (Éxodo 10:1 al 13:16).</p>'),
(16, 'Beshalaj', 'Éxodo 13:17 al 17:16', 'Porción 16: Éxodo 13:17 al 17:16', '<p>Estudio de la porción <strong>Beshalaj</strong> (Éxodo 13:17 al 17:16).</p>'),
(17, 'Yitró', 'Éxodo 18:1 al 20:23', 'Porción 17: Éxodo 18:1 al 20:23', '<p>Estudio de la porción <strong>Yitró</strong> (Éxodo 18:1 al 20:23).</p>'),
(18, 'Mishpatim', 'Éxodo 21:1 al 24:18', 'Porción 18: Éxodo 21:1 al 24:18', '<p>Estudio de la porción <strong>Mishpatim</strong> (Éxodo 21:1 al 24:18).</p>'),
(19, 'Terumah', 'Éxodo 25:1 al 27:19', 'Porción 19: Éxodo 25:1 al 27:19', '<p>Estudio de la porción <strong>Terumah</strong> (Éxodo 25:1 al 27:19).</p>'),
(20, 'Tetzaveh', 'Éxodo 27:20 al 30:10', 'Porción 20: Éxodo 27:20 al 30:10', '<p>Estudio de la porción <strong>Tetzaveh</strong> (Éxodo 27:20 al 30:10).</p>'),
(21, 'Ki Tisá', 'Éxodo 30:11 al 34:35', 'Porción 21: Éxodo 30:11 al 34:35', '<p>Estudio de la porción <strong>Ki Tisá</strong> (Éxodo 30:11 al 34:35).</p>'),
(22, 'Vayakhel', 'Éxodo 35:1 al 38:20', 'Porción 22: Éxodo 35:1 al 38:20', '<p>Estudio de la porción <strong>Vayakhel</strong> (Éxodo 35:1 al 38:20).</p>'),
(23, 'Pekudei', 'Éxodo 38:21 al 40:38', 'Porción 23: Éxodo 38:21 al 40:38', '<p>Estudio de la porción <strong>Pekudei</strong> (Éxodo 38:21 al 40:38).</p>'),
(24, 'Vayikrá', 'Levítico 1:1 al 5:26', 'Porción 24: Levítico 1:1 al 5:26', '<p>Estudio de la porción <strong>Vayikrá</strong> (Levítico 1:1 al 5:26).</p>'),
(25, 'Tzav', 'Levítico 6:1 al 8:36', 'Porción 25: Levítico 6:1 al 8:36', '<p>Estudio de la porción <strong>Tzav</strong> (Levítico 6:1 al 8:36).</p>'),
(26, 'Sheminí', 'Levítico 9:1 al 11:47', 'Porción 26: Levítico 9:1 al 11:47', '<p>Estudio de la porción <strong>Sheminí</strong> (Levítico 9:1 al 11:47).</p>'),
(27, 'Tazria', 'Levítico 12:1 al 13:59', 'Porción 27: Levítico 12:1 al 13:59', '<p>Estudio de la porción <strong>Tazria</strong> (Levítico 12:1 al 13:59).</p>'),
(28, 'Metzorá', 'Levítico 14:1 al 15:33', 'Porción 28: Levítico 14:1 al 15:33', '<p>Estudio de la porción <strong>Metzorá</strong> (Levítico 14:1 al 15:33).</p>'),
(29, 'Ajarei Mot', 'Levítico 16:1 al 18:30', 'Porción 29: Levítico 16:1 al 18:30', '<p>Estudio de la porción <strong>Ajarei Mot</strong> (Levítico 16:1 al 18:30).</p>'),
(30, 'Kedoshim', 'Levítico 19:1 al 20:27', 'Porción 30: Levítico 19:1 al 20:27', '<p>Estudio de la porción <strong>Kedoshim</strong> (Levítico 19:1 al 20:27).</p>'),
(31, 'Emor', 'Levítico 21:1 al 24:23', 'Porción 31: Levítico 21:1 al 24:23', '<p>Estudio de la porción <strong>Emor</strong> (Levítico 21:1 al 24:23).</p>'),
(32, 'Behar', 'Levítico 25:1 al 26:2', 'Porción 32: Levítico 25:1 al 26:2', '<p>Estudio de la porción <strong>Behar</strong> (Levítico 25:1 al 26:2).</p>'),
(33, 'Bejukotai', 'Levítico 26:3 al 27:34', 'Porción 33: Levítico 26:3 al 27:34', '<p>Estudio de la porción <strong>Bejukotai</strong> (Levítico 26:3 al 27:34).</p>'),
(34, 'Bemidbar', 'Números 1:1 al 4:20', 'Porción 34: Números 1:1 al 4:20', '<p>Estudio de la porción <strong>Bemidbar</strong> (Números 1:1 al 4:20).</p>'),
(35, 'Nasó', 'Números 4:21 al 7:89', 'Porción 35: Números 4:21 al 7:89', '<p>Estudio de la porción <strong>Nasó</strong> (Números 4:21 al 7:89).</p>'),
(36, 'Behaalotjá', 'Números 8:1 al 12:16', 'Porción 36: Números 8:1 al 12:16', '<p>Estudio de la porción <strong>Behaalotjá</strong> (Números 8:1 al 12:16).</p>'),
(37, 'Shelaj Lejá', 'Números 13:1 al 15:41', 'Porción 37: Números 13:1 al 15:41', '<p>Estudio de la porción <strong>Shelaj Lejá</strong> (Números 13:1 al 15:41).</p>'),
(38, 'Kóraj', 'Números 16:1 al 18:32', 'Porción 38: Números 16:1 al 18:32', '<p>Estudio de la porción <strong>Kóraj</strong> (Números 16:1 al 18:32).</p>'),
(39, 'Jukat', 'Números 19:1 al 22:1', 'Porción 39: Números 19:1 al 22:1', '<p>Estudio de la porción <strong>Jukat</strong> (Números 19:1 al 22:1).</p>'),
(40, 'Balak', 'Números 22:2 al 25:9', 'Porción 40: Números 22:2 al 25:9', '<p>Estudio de la porción <strong>Balak</strong> (Números 22:2 al 25:9).</p>'),
(41, 'Pinjás', 'Números 25:10 al 30:1', 'Porción 41: Números 25:10 al 30:1', '<p>Estudio de la porción <strong>Pinjás</strong> (Números 25:10 al 30:1).</p>'),
(42, 'Matot', 'Números 30:2 al 32:42', 'Porción 42: Números 30:2 al 32:42', '<p>Estudio de la porción <strong>Matot</strong> (Números 30:2 al 32:42).</p>'),
(43, 'Masei', 'Números 33:1 al 36:13', 'Porción 43: Números 33:1 al 36:13', '<p>Estudio de la porción <strong>Masei</strong> (Números 33:1 al 36:13).</p>'),
(44, 'Devarim', 'Deuteronomio 1:1 al 3:22', 'Porción 44: Deuteronomio 1:1 al 3:22', '<p>Estudio de la porción <strong>Devarim</strong> (Deuteronomio 1:1 al 3:22).</p>'),
(45, 'Vaetjanán', 'Deuteronomio 3:23 al 7:11', 'Porción 45: Deuteronomio 3:23 al 7:11', '<p>Estudio de la porción <strong>Vaetjanán</strong> (Deuteronomio 3:23 al 7:11).</p>'),
(46, 'Ekev', 'Deuteronomio 7:12 al 11:25', 'Porción 46: Deuteronomio 7:12 al 11:25', '<p>Estudio de la porción <strong>Ekev</strong> (Deuteronomio 7:12 al 11:25).</p>'),
(47, 'Reeh', 'Deuteronomio 11:26 al 16:17', 'Porción 47: Deuteronomio 11:26 al 16:17', '<p>Estudio de la porción <strong>Reeh</strong> (Deuteronomio 11:26 al 16:17).</p>'),
(48, 'Shofetim', 'Deuteronomio 16:18 al 21:9', 'Porción 48: Deuteronomio 16:18 al 21:9', '<p>Estudio de la porción <strong>Shofetim</strong> (Deuteronomio 16:18 al 21:9).</p>'),
(49, 'Ki Tetzé', 'Deuteronomio 21:10 al 25:19', 'Porción 49: Deuteronomio 21:10 al 25:19', '<p>Estudio de la porción <strong>Ki Tetzé</strong> (Deuteronomio 21:10 al 25:19).</p>'),
(50, 'Ki Tavó', 'Deuteronomio 26:1 al 29:8', 'Porción 50: Deuteronomio 26:1 al 29:8', '<p>Estudio de la porción <strong>Ki Tavó</strong> (Deuteronomio 26:1 al 29:8).</p>'),
(51, 'Nitzavim', 'Deuteronomio 29:9 al 30:20', 'Porción 51: Deuteronomio 29:9 al 30:20', '<p>Estudio de la porción <strong>Nitzavim</strong> (Deuteronomio 29:9 al 30:20).</p>'),
(52, 'Vayélej', 'Deuteronomio 31:1 al 31:30', 'Porción 52: Deuteronomio 31:1 al 31:30', '<p>Estudio de la porción <strong>Vayélej</strong> (Deuteronomio 31:1 al 31:30).</p>'),
(53, 'Haazinu', 'Deuteronomio 32:1 al 32:52', 'Porción 53: Deuteronomio 32:1 al 32:52', '<p>Estudio de la porción <strong>Haazinu</strong> (Deuteronomio 32:1 al 32:52).</p>'),
(54, 'Vezot Haberajáh', 'Deuteronomio 33:1 al 34:12', 'Porción 54: Deuteronomio 33:1 al 34:12', '<p>Estudio de la porción <strong>Vezot Haberajáh</strong> (Deuteronomio 33:1 al 34:12).</p>')
ON DUPLICATE KEY UPDATE 
    title = VALUES(title), 
    subtitle = VALUES(subtitle);




