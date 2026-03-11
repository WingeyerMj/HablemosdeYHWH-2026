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

-- Tabla para las secciones de la web
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
INSERT INTO users (username, password, role)
SELECT * FROM (SELECT 'admin', '$2a$10$r.v8z6K8X9hHqB6W1i7kUeA4eF.W5.E6B1D0C4C8A9A9A9A9A9A9', 'admin') AS tmp
WHERE NOT EXISTS (SELECT username FROM users WHERE username = 'admin') LIMIT 1;

INSERT INTO users (username, password, role)
SELECT * FROM (SELECT 'editor', '$2a$10$r.v8z6K8X9hHqB6W1i7kUeA4eF.W5.E6B1D0C4C8A9A9A9A9A9A9', 'editor') AS tmp
WHERE NOT EXISTS (SELECT username FROM users WHERE username = 'editor') LIMIT 1;

-- Ejemplos de secciones iniciales
INSERT INTO sections (section_name, title, subtitle, content)
SELECT * FROM (SELECT 'Hero', 'Hablemos de YHWH', 'Descubre las raíces hebreas de tu fe', 'Contenido descriptivo aquí...') AS tmp
WHERE NOT EXISTS (SELECT section_name FROM sections WHERE section_name = 'Hero') LIMIT 1;

INSERT INTO sections (section_name, title, subtitle, content)
SELECT * FROM (SELECT 'Calendario', 'Calendario Lunisolar', 'Sigue los tiempos señalados', 'Información sobre el calendario...') AS tmp
WHERE NOT EXISTS (SELECT section_name FROM sections WHERE section_name = 'Calendario') LIMIT 1;

INSERT INTO sections (section_name, title, subtitle, content)
SELECT * FROM (SELECT 'About', 'Sobre Nosotros', 'Nuestra historia y valores', 'Ullamco laboris nisi ut...') AS tmp
WHERE NOT EXISTS (SELECT section_name FROM sections WHERE section_name = 'About') LIMIT 1;

-- Tabla para las Parashot (Porciones Semanales)
CREATE TABLE IF NOT EXISTS parashot (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100) DEFAULT 'bi-journal-text',
    link VARCHAR(255),
    youtube_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para Portfolio (Eventos)
CREATE TABLE IF NOT EXISTS portfolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    img VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
    features TEXT, -- Comma separated
    na_features TEXT, -- Comma separated
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales condicionales (MySQL)
INSERT INTO parashot (title, description)
SELECT * FROM (SELECT 'Bereshit', 'En el principio...') AS tmp
WHERE NOT EXISTS (SELECT title FROM parashot WHERE title = 'Bereshit') LIMIT 1;

INSERT INTO portfolio (title, category, img, description)
SELECT * FROM (SELECT 'App 1', 'filter-app', '/assets/img/masonry-portfolio/masonry-portfolio-1.jpg', 'Lorem ipsum') AS tmp
WHERE NOT EXISTS (SELECT title FROM portfolio WHERE title = 'App 1') LIMIT 1;

INSERT INTO testimonials (name, role, text, img)
SELECT * FROM (SELECT 'Saul Goodman', 'Ceo & Founder', 'Proin iaculis purus.', '/assets/img/testimonials/testimonials-1.jpg') AS tmp
WHERE NOT EXISTS (SELECT name FROM testimonials WHERE name = 'Saul Goodman') LIMIT 1;

INSERT INTO team (name, role, description, img)
SELECT * FROM (SELECT 'Jeremy Walker', 'CEO, Founder, Atty.', 'Separated they live.', '/assets/img/team/team-1.jpg') AS tmp
WHERE NOT EXISTS (SELECT name FROM team WHERE name = 'Jeremy Walker') LIMIT 1;

INSERT INTO pricing (name, price, featured, features, na_features)
SELECT * FROM (SELECT 'Free Plan', '0', FALSE, 'Feature 1,Feature 2', 'Feature 3') AS tmp
WHERE NOT EXISTS (SELECT name FROM pricing WHERE name = 'Free Plan') LIMIT 1;

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

-- Migración para soporte de tablas dinámicas
ALTER TABLE dynamic_sections ADD COLUMN data_table VARCHAR(100) AFTER show_in_navbar;
