-- Tabla de usuarios para el login del backend
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(20) DEFAULT 'editor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para las secciones de la web
CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    page VARCHAR(50) DEFAULT 'home',
    section_name VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255),
    subtitle TEXT,
    content TEXT,
    image_url VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para las Parashot
CREATE TABLE IF NOT EXISTS parashot (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100) DEFAULT 'bi-journal-text',
    link VARCHAR(255),
    youtube_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para Portfolio (Eventos)
CREATE TABLE IF NOT EXISTS portfolio (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    img VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    text TEXT,
    img VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para Team
CREATE TABLE IF NOT EXISTS team (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    description TEXT,
    img VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para Pricing
CREATE TABLE IF NOT EXISTS pricing (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price VARCHAR(50),
    featured BOOLEAN DEFAULT FALSE,
    features TEXT,
    na_features TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para secciones dinámicas (ANTES de los bloques DO para que siempre se cree)
CREATE TABLE IF NOT EXISTS dynamic_sections (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    section_type VARCHAR(20) NOT NULL DEFAULT 'inline',
    summary TEXT,
    content TEXT,
    icon VARCHAR(100) DEFAULT 'bi-file-text',
    image_url VARCHAR(500),
    nav_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    show_in_navbar BOOLEAN DEFAULT TRUE,
    data_table VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para permisos de secciones
CREATE TABLE IF NOT EXISTS section_permissions (
    id SERIAL PRIMARY KEY,
    section_id INT NOT NULL REFERENCES dynamic_sections(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(section_id, user_id)
);

-- Usuarios iniciales
INSERT INTO users (username, password, role)
SELECT 'admin', '$2a$10$r.v8z6K8X9hHqB6W1i7kUeA4eF.W5.E6B1D0C4C8A9A9A9A9A9A9', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

INSERT INTO users (username, password, role)
SELECT 'editor', '$2a$10$r.v8z6K8X9hHqB6W1i7kUeA4eF.W5.E6B1D0C4C8A9A9A9A9A9A9', 'editor'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'editor');

-- Ejemplos de secciones iniciales
INSERT INTO sections (section_name, title, subtitle, content)
SELECT 'Hero', 'Hablemos de YHWH', 'Descubre las raíces hebreas de tu fe', 'Contenido descriptivo aquí...'
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE section_name = 'Hero');

INSERT INTO sections (section_name, title, subtitle, content)
SELECT 'Calendario', 'Calendario Lunisolar', 'Sigue los tiempos señalados', 'Información sobre el calendario...'
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE section_name = 'Calendario');

INSERT INTO sections (section_name, title, subtitle, content)
SELECT 'About', 'Sobre Nosotros', 'Nuestra historia y valores', 'Ullamco laboris nisi ut aliquip ex ea commodo consequat.'
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE section_name = 'About');

-- Datos de ejemplo condicionales (PostgreSQL)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM parashot WHERE title = 'Bereshit') THEN
        INSERT INTO parashot (title, description) VALUES ('Bereshit', 'En el principio...');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM portfolio WHERE title = 'App 1') THEN
        INSERT INTO portfolio (title, category, img, description) VALUES ('App 1', 'filter-app', '/assets/img/masonry-portfolio/masonry-portfolio-1.jpg', 'Lorem ipsum');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM testimonials WHERE name = 'Saul Goodman') THEN
        INSERT INTO testimonials (name, role, text, img) VALUES ('Saul Goodman', 'Ceo & Founder', 'Proin iaculis purus.', '/assets/img/testimonials/testimonials-1.jpg');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM team WHERE name = 'Jeremy Walker') THEN
        INSERT INTO team (name, role, description, img) VALUES ('Jeremy Walker', 'CEO, Founder, Atty.', 'Separated they live.', '/assets/img/team/team-1.jpg');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pricing WHERE name = 'Free Plan') THEN
        INSERT INTO pricing (name, price, featured, features, na_features) VALUES ('Free Plan', '0', FALSE, 'Feature 1,Feature 2', 'Feature 3');
    END IF;
END $$;
