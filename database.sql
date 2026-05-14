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

-- Sección Footer inicial
INSERT IGNORE INTO sections (section_name, title, subtitle, content)
VALUES ('Footer', 'Hablemos de YHWH', 'Estudio bíblico desde la perspectiva hebrea', '');

-- Enlaces de footer iniciales
INSERT IGNORE INTO footer_links (category, title, url, order_index)
VALUES ('Enlaces Útiles', 'Inicio', '/', 1);

INSERT IGNORE INTO footer_links (category, title, url, order_index)
VALUES ('Enlaces Útiles', 'Sobre Nosotros', '/#about', 2);

INSERT IGNORE INTO footer_links (category, title, url, order_index)
VALUES ('Enlaces Útiles', 'Parashot', '/parashot', 3);

INSERT IGNORE INTO footer_links (category, title, url, order_index)
VALUES ('Recursos', 'Calendario', '/calendar', 1);

INSERT IGNORE INTO footer_links (category, title, url, order_index)
VALUES ('Recursos', 'Eventos', '/#portfolio', 2);

