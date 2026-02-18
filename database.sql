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

-- Usuarios iniciales (Password hash for 'admin123')
INSERT IGNORE INTO users (username, password, role) VALUES 
('admin', '$2a$10$r.v8z6K8X9hHqB6W1i7kUeA4eF.W5.E6B1D0C4C8A9A9A9A9A9A9', 'admin'),
('editor', '$2a$10$r.v8z6K8X9hHqB6W1i7kUeA4eF.W5.E6B1D0C4C8A9A9A9A9A9A9', 'editor');

-- Ejemplos de secciones iniciales
INSERT IGNORE INTO sections (section_name, title, subtitle, content) VALUES 
('Hero', 'Hablemos de YHWH', 'Descubre las raíces hebreas de tu fe', 'Contenido descriptivo aquí...'),
('Calendario', 'Calendario Lunisolar', 'Sigue los tiempos señalados', 'Información sobre el calendario...'),
('About', 'Sobre Nosotros', 'Nuestra historia y valores', 'Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.');

-- Tabla para las Parashot (Porciones Semanales)
CREATE TABLE IF NOT EXISTS parashot (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100) DEFAULT 'bi-journal-text',
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para Portfolio (Eventos)
CREATE TABLE IF NOT EXISTS portfolio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100),
    img VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(100),
    text TEXT,
    img VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para Team
CREATE TABLE IF NOT EXISTS team (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(100),
    description TEXT,
    img VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para Pricing
CREATE TABLE IF NOT EXISTS pricing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    price VARCHAR(50),
    featured BOOLEAN DEFAULT FALSE,
    features TEXT, -- Comma separated
    na_features TEXT, -- Comma separated
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales usando INSERT IGNORE para evitar errores de duplicados
INSERT IGNORE INTO parashot (title, description) VALUES 
('Bereshit', 'En el principio...'),
('Noaj', 'Noé y el diluvio...');

INSERT IGNORE INTO portfolio (title, category, img, description) VALUES 
('App 1', 'filter-app', '/assets/img/masonry-portfolio/masonry-portfolio-1.jpg', 'Lorem ipsum, dolor sit');

INSERT IGNORE INTO testimonials (name, role, text, img) VALUES 
('Saul Goodman', 'Ceo & Founder', 'Proin iaculis purus consequat sem cure dignity sim.', '/assets/img/testimonials/testimonials-1.jpg');

INSERT IGNORE INTO team (name, role, description, img) VALUES 
('Jeremy Walker', 'CEO, Founder, Atty.', 'Separated they live in. Separated they live in Bookmarksgrove.', '/assets/img/team/team-1.jpg');

INSERT IGNORE INTO pricing (name, price, featured, features, na_features) VALUES 
('Free Plan', '0', FALSE, 'Feature 1,Feature 2', 'Feature 3');
