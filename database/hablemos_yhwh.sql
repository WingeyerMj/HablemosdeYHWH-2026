-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 12-05-2026 a las 17:13:41
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `hablemos_yhwh`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dynamic_sections`
--

CREATE TABLE `dynamic_sections` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `section_type` enum('inline','page') NOT NULL DEFAULT 'inline',
  `summary` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `icon` varchar(100) DEFAULT 'bi-file-text',
  `image_url` varchar(500) DEFAULT NULL,
  `nav_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `show_in_navbar` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `dynamic_sections`
--

INSERT INTO `dynamic_sections` (`id`, `title`, `slug`, `section_type`, `summary`, `content`, `icon`, `image_url`, `nav_order`, `is_active`, `show_in_navbar`, `created_at`, `updated_at`) VALUES
(1, 'Hablemos de YHWH', 'hero', 'inline', 'Descubre las raíces hebreas de tu fe', 'Contenido descriptivo aquí...', 'bi-house', NULL, 0, 1, 1, '2026-02-24 12:08:30', '2026-02-24 12:08:30'),
(2, 'Calendario Lunisolar', 'calendario', 'inline', 'Sigue los tiempos señalados', 'Información sobre el calendario...', 'bi-calendar3', NULL, 0, 1, 1, '2026-02-24 12:08:30', '2026-02-24 12:08:30'),
(3, 'Sobre Nosotros', 'about', 'inline', 'Nuestra historia y valores', 'Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', 'bi-info-circle', NULL, 0, 1, 1, '2026-02-24 12:08:30', '2026-02-24 12:08:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `footer_links`
--

CREATE TABLE `footer_links` (
  `id` int(11) NOT NULL,
  `category` varchar(50) NOT NULL,
  `title` varchar(100) NOT NULL,
  `url` varchar(255) NOT NULL,
  `order_index` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `footer_links`
--

INSERT INTO `footer_links` (`id`, `category`, `title`, `url`, `order_index`) VALUES
(1, 'Enlaces ·tiles', 'Hogar', '/', 1),
(2, 'Enlaces ·tiles', 'Sobre nosotros', '/#about', 2),
(3, 'Enlaces ·tiles', 'Servicios', '/#services', 3),
(4, 'Enlaces ·tiles', 'Condiciones de servicio', '#', 4),
(5, 'Nuestros servicios', 'Dise±o web', '#', 1),
(6, 'Nuestros servicios', 'Desarrollo web', '#', 2),
(7, 'Nuestros servicios', 'Gesti¾n de productos', '#', 3),
(8, 'Nuestros servicios', 'Marketing', '#', 4),
(9, 'Enlaces Útiles', 'Sobre Nosotros', '/#about', 2),
(10, 'Enlaces Útiles', 'Parashot', '/parashot', 3),
(11, 'Recursos', 'Calendario', '/calendar', 1),
(12, 'Recursos', 'Eventos', '/#portfolio', 2),
(13, 'Enlaces Útiles', 'Sobre Nosotros', '/#about', 2),
(14, 'Enlaces Útiles', 'Parashot', '/parashot', 3),
(15, 'Recursos', 'Calendario', '/calendar', 1),
(16, 'Recursos', 'Eventos', '/#portfolio', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `parashot`
--

CREATE TABLE `parashot` (
  `id` int(11) NOT NULL,
  `parasha_number` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `pdf_file` varchar(500) DEFAULT NULL,
  `icon` varchar(100) DEFAULT 'bi-journal-text',
  `link` varchar(255) DEFAULT NULL,
  `youtube_link` varchar(255) DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `parashot`
--

INSERT INTO `parashot` (`id`, `parasha_number`, `title`, `subtitle`, `description`, `content`, `image_url`, `pdf_file`, `icon`, `link`, `youtube_link`, `is_published`, `created_at`, `updated_at`) VALUES
(2, 2, 'Noaj', 'Génesis 6:9 al 11:32', 'Noé y el diluvio...', '<p><strong>Aliot de la Toráh: </strong></p><p>1. 6:9-22 </p><p>2. 7:1-16 </p><p>3. 7:17 - 8:14 </p><p>4. 8:15 - 9:7 </p><p>5. 9:8-17 </p><p>6. 9:18 - 10:32 </p><p>7. 11:1-32 8. </p><p><br></p><p><strong>Maftir: 1</strong>1:29-32 </p><p><br></p><p><strong>Haftaráh: </strong>Yeshaiahu (Isaías) 54:1-10 Brit HaJadasháh: Mordejai (Marcos) 2:1-28 Lecturas adicionales del Brit HaJadasha: Matitiahu (Mateo) 24:36-39; Ivrim (Hebreos) 11:7; Kefá Álef (1 Pedro) 3:18-22; Kefá Bet (2 Pedro) 2:5; Hitgalut (Apocalipsis) 14:8; 16:19; 17:1–17; 18:1–24 </p><p><br></p><p><strong>NÓAJ Significa “Descanso, Recto, Justo”.</strong></p>', '/assets/parashot/1778595803021-724165542.jpg', '', 'bi-journal-text', '', 'https://www.youtube.com/watch?v=YywwmkIdcgo&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=16', 1, '2026-02-18 11:47:23', '2026-05-12 14:23:23'),
(3, 3, 'Lej Leja', 'Génesis 12:1 al 17:27 ', 'Vete de tu tierra...', '<p><strong>Aliot de la Toráh: </strong></p><p>1. 12:1-13 </p><p>2. 12:14 - 13:4 </p><p>3. 13:5-18 </p><p>4. 14:1-20 </p><p>5. 14:21 - 15:6 </p><p>6. 15:7 - 17:6 </p><p>7. 17:7-27 </p><p><br></p><p><strong>8. Maftir</strong>: 17:24-27 </p><p><br></p><p><strong>Haftaráh</strong>: Yeshaiahu (Isaías) 40:27 - 41:16 </p><p><br></p><p><strong>Brit Hadasháh</strong>: Mordejai (Marcos) 3:1 - 4:20 Lecturas adicionales del Brit HaJadashah: Maaseh (Hechos) 7:1-8; Romanos 4:1-25; Gálatas 3:1-29; Ivrim (Hebreos) 7:1-19; Ivrim (Hebreos) 11:8-12 </p><p><br></p><p><strong>LEJ LEJÁ Significa “Vete para ti”; “Vete por tu propio bien”.</strong></p>', '/assets/parashot/1778595767083-210836392.jpg', '', 'bi-journal-text', '', 'https://www.youtube.com/watch?v=LY0CZmD99xI&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=15', 1, '2026-02-18 11:47:23', '2026-05-12 14:22:47'),
(4, 4, 'Vayerá', 'Génesis 18:1 al 22:24', 'Y se le apareció...', '<p><strong>Aliot de la Toráh:</strong> </p><p>1. 18:1-14 </p><p>2. 18:15-33 </p><p>3. 19:1-20 </p><p>4. 19:21 - 21:4 </p><p>5. 21:5-21 </p><p>6. 21:22-34 </p><p>7. 22:1-24 </p><p><br></p><p><strong>8. Maftir</strong>: 22:20-24 </p><p><br></p><p><strong>Haftaráh</strong>: Melajim Bet (2 Reyes) 4:1-23 </p><p><br></p><p><strong>Brit HaJadasháh</strong>: Mordejai (Marcos) 4:21 - 6:56; Hilel (Lucas) 17:28-37 Lecturas adicionales del Brit HaJadashah: Romanos 9:6–11; Gálatas 4:21-31; Ivrim (Hebreos) 6:13–20; 11:13–19; Yaakov (Santiago) 2:14–24; Kefá Bet (2 Pedro) 2:4–11. </p><p><br></p><p><strong>VAYERÁ Significa “Apareció”</strong></p>', '/assets/parashot/1778595537522-343576235.jpg', '', 'bi-journal-text', '', 'https://www.youtube.com/watch?v=-yPLFAsaufM&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=14', 1, '2026-02-18 11:47:23', '2026-05-12 14:18:57'),
(5, 5, 'Jayei Sarah', 'Génesis 23:1 al 25:18', 'La vida de Sara...', '<p><strong>Aliot de la Toráh:</strong></p><p>1. 23:1-16 </p><p>2. 23:17 - 24:9 </p><p>3. 24:10-26 </p><p>4. 24:27-52 </p><p>5. 24:53-67 </p><p>6. 25:1-11 </p><p>7. 25:12-18 8. </p><p><br></p><p><strong>Maftir:</strong> 25:16-18 </p><p><br></p><p><strong>Haftará: </strong>Melajim Álef (1 Reyes) 1:1-31 </p><p><br></p><p><strong>Brit HaJadasháh:</strong> Mordejai (Marcos) 7:1 - 9:13; Yojanán (Juan) 4:3-14 Lecturas adicionales del Brit HaJadashah: Ivrim (Hebreos) 11:13–16; 1 Corintios 15:50– 57 </p><p><br></p><p><strong>JAYEI SARÁH Significa “La vida de Sarah”.</strong></p>', '/assets/parashot/1778595016317-709604774.jpg', '', 'bi-journal-text', '', 'https://www.youtube.com/watch?v=bOT-lNl-6LQ&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=13', 1, '2026-02-18 11:47:23', '2026-05-12 14:10:16'),
(6, 6, 'Toldot', 'Génesis 25:19 al 28:9', 'Generaciones...', '<p>Generaciones...</p>', '/assets/parashot/1778595850019-720860231.jpg', '', 'bi-journal-text', '', 'https://www.youtube.com/watch?v=AqleRto1mz0&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=12', 1, '2026-02-18 11:47:23', '2026-05-12 14:24:10'),
(8, 7, 'Vayetzé', 'Genesis 28:10 al 32:3', 'Y salió...', '<p>Aliot de la Toráh: </p><p>1. 28:10-22 </p><p>2. 29:1-17 </p><p>3. 29:18 - 30:13 </p><p>4. 30:14-27 </p><p>5. 30:28 - 31:16 </p><p>6. 31:17-42 </p><p>7. 31:43 - 32:3 (32:2 V. Cast.) </p><p>8. Maftir: 32:1 (31:55 V. Cast.) -32:3 (32:2 V. Cast.) </p><p><br></p><p><strong>Haftará:</strong> Hoshea (Oseas) 11:7 - 12:12 (12:11 V. Cast.)</p><p><br></p><p><strong>Brit HaJadasháh:</strong> Mordejai (Marcos) 10:32 - 11:33; Yojanán (Juan) 1:41-51 Lecturas adicionales del Brit HaJadasháh: Matitiahu (Mateo) 10:6, 15:24, 19:28; Hillel (Lucas) 22:30; Yojanan (Juan) 1:43-51; Ivrim (Hebreos) 8:6-8; Yaakov (Santiago) 1:1; Hitgalut (Apocalipsis) 21:12. </p><p><br></p><p><strong>VAYETZÉ Significa “Y Salió”</strong></p>', '/assets/parashot/1778594609006-721383818.jpg', '', 'bi-journal-text', '', 'https://www.youtube.com/watch?v=yFkrdydR-Tg&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=11', 1, '2026-02-18 15:48:13', '2026-05-12 14:03:29'),
(9, 1, 'Bereshit', 'Génesis 1:1 al 6:8', 'En el principio...', '<p>Aliot de la Toráh: </p><p>1. 1:1-13</p><p>2. 1:14-23 </p><p>3. 1:24 - 2:3 </p><p>4. 2:4 - 3:21 </p><p>5. 3:22 - 4:26 </p><p>6. 5:1-24 </p><p>7. 5:25 - 6:8 8. </p><p><br></p><p>Maftir: 6:5-8 </p><p><br></p><p>Haftaráh: Yeshaiahu (Isaías) 42:5-21 Brit HaJadasháh: Mordejai (Marcos) 1:1-45. </p><p><br></p><p>Lecturas adicionales del Brit HaJadashah: Yojanan (Juan) 1:1-16; Colosenses 1:14-17; Ivrim (Hebreos) 1:1-3, 11:1-6; (Hitgalut) Apocalipsis 2:7; 21:1-6,23; 22:1-5,14; Romanos 5:12-21; 1 Corintios 15:35-58; Matitiahu (Mateo) 19:4-6; Efesios 5:21-33; 1 Timoteo 2:11-15; </p><p><br></p><p>BERESHIT Significa “En el principio, Desde el origen, Por causa del Principal”.</p>', '/assets/parashot/1778595820285-904624154.jpg', '', 'bi-journal-text', '', 'https://youtu.be/oA6ALkq-DbA?si=KtHRJ-x12XvKmBeP', 1, '2026-05-12 10:13:03', '2026-05-12 14:23:40');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `portfolio`
--

CREATE TABLE `portfolio` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT 1,
  `description` text DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `portfolio`
--

INSERT INTO `portfolio` (`id`, `title`, `subtitle`, `category`, `img`, `is_published`, `description`, `content`, `event_date`, `image_url`, `created_at`, `updated_at`) VALUES
(1, 'Rosh Jodesh', 'Mes Tercero', 'filter-app', '/uploads/portfolio/1778596426490-462990542.png', 1, 'Comienzo del mes tercero', '<p>Comienza el mes tercero segun la obserbancia de las lumbreras del cielo, como esta instruido en la Torha</p><p><br></p>', '2026-05-16', '/uploads/portfolio/1778596426490-462990542.png', '2026-02-18 15:33:08', '2026-05-12 14:33:46');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pricing`
--

CREATE TABLE `pricing` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `price` varchar(50) DEFAULT NULL,
  `featured` tinyint(1) DEFAULT 0,
  `features` text DEFAULT NULL,
  `na_features` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pricing`
--

INSERT INTO `pricing` (`id`, `name`, `price`, `featured`, `features`, `na_features`, `created_at`) VALUES
(1, 'Free Plan', '0', 0, 'Feature 1,Feature 2', 'Feature 3', '2026-02-18 15:33:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sections`
--

CREATE TABLE `sections` (
  `id` int(11) NOT NULL,
  `page` varchar(50) DEFAULT 'home',
  `section_name` varchar(100) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sections`
--

INSERT INTO `sections` (`id`, `page`, `section_name`, `title`, `subtitle`, `content`, `image_url`, `updated_at`) VALUES
(1, 'home', 'Hero', 'Hablemos de YHWH', 'Descubre las raíces hebreas de tu fe', 'Contenido descriptivo aquí...', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1920', '2026-05-12 10:52:20'),
(2, 'home', 'Calendario', 'Calendario Lunisolar', 'Sigue los tiempos señalados', 'Información sobre el calendario...', NULL, '2026-02-18 11:47:23'),
(3, 'home', 'About', 'Sobre Nosotros', 'Nuestra historia y valores', 'Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', NULL, '2026-02-18 11:47:23'),
(9, 'home', 'Footer', 'Hablemos de YHWH', 'Nuestro objetivo es el estudio de las raÝces hebreas.', 'Estudio profundo de las escrituras.', NULL, '2026-05-12 11:58:34');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `section_permissions`
--

CREATE TABLE `section_permissions` (
  `section_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `site_settings`
--

CREATE TABLE `site_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` enum('text','textarea','email','url','image') DEFAULT 'text',
  `setting_group` varchar(50) DEFAULT 'general',
  `label` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `site_settings`
--

INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `setting_group`, `label`, `updated_at`) VALUES
(1, 'site_name', 'Hablemos de YHWH', 'text', 'general', 'Nombre del Sitio', '2026-05-12 10:13:03'),
(2, 'contact_address', 'Caucete, San Juan, Argentina', 'text', 'contact', 'Direcci??n', '2026-05-12 13:52:13'),
(3, 'contact_phone', '+549 264 5758367', 'text', 'contact', 'Tel??fono', '2026-05-12 13:52:13'),
(4, 'contact_email', 'hablemosdeyhwh2024@gmail.com', 'email', 'contact', 'Email', '2026-05-12 13:52:13'),
(5, 'social_youtube', 'https://www.youtube.com/@hablemosdeYHWH', 'url', 'social', 'Canal de YouTube', '2026-05-12 13:52:13'),
(6, 'social_facebook', 'https://www.facebook.com/hablemos.yhwh/', 'url', 'social', 'Facebook', '2026-05-12 13:52:13'),
(7, 'social_instagram', 'https://www.instagram.com/hablemosyhwh/', 'url', 'social', 'Instagram', '2026-05-12 13:52:13'),
(8, 'social_whatsapp', 'https://chat.whatsapp.com/IAiMKUyvdjYC94r2LbeL8P', 'url', 'social', 'WhatsApp', '2026-05-12 13:52:13');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `team`
--

CREATE TABLE `team` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `team`
--

INSERT INTO `team` (`id`, `name`, `role`, `description`, `img`, `created_at`) VALUES
(1, 'Marcelo Wingeyer', 'Moreh  מורה', '', '/uploads/team/1778597286773-301692308.png', '2026-02-18 15:33:08'),
(2, 'Ivana Ormeño', 'Morah   מורה', '', '/uploads/team/1778597981589-654668347.png', '2026-05-12 14:59:41');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `testimonials`
--

CREATE TABLE `testimonials` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `text` text DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` enum('admin','editor') DEFAULT 'editor',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `role`, `created_at`) VALUES
(1, 'admin', '$2b$10$jfB8QtPjpbA6ivru7VWlEucDTao.RUZ8aqb06KsCWnRLhQceoL7EG', NULL, 'admin', '2026-02-18 11:47:23'),
(2, 'editor', '$2b$10$jfB8QtPjpbA6ivru7VWlEucDTao.RUZ8aqb06KsCWnRLhQceoL7EG', NULL, 'editor', '2026-02-18 11:47:23');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `dynamic_sections`
--
ALTER TABLE `dynamic_sections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indices de la tabla `footer_links`
--
ALTER TABLE `footer_links`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `parashot`
--
ALTER TABLE `parashot`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `portfolio`
--
ALTER TABLE `portfolio`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pricing`
--
ALTER TABLE `pricing`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `section_name` (`section_name`);

--
-- Indices de la tabla `section_permissions`
--
ALTER TABLE `section_permissions`
  ADD PRIMARY KEY (`section_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `site_settings`
--
ALTER TABLE `site_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indices de la tabla `team`
--
ALTER TABLE `team`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `testimonials`
--
ALTER TABLE `testimonials`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `dynamic_sections`
--
ALTER TABLE `dynamic_sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `footer_links`
--
ALTER TABLE `footer_links`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `parashot`
--
ALTER TABLE `parashot`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `portfolio`
--
ALTER TABLE `portfolio`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `pricing`
--
ALTER TABLE `pricing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `sections`
--
ALTER TABLE `sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `site_settings`
--
ALTER TABLE `site_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `team`
--
ALTER TABLE `team`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `testimonials`
--
ALTER TABLE `testimonials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `section_permissions`
--
ALTER TABLE `section_permissions`
  ADD CONSTRAINT `section_permissions_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `dynamic_sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `section_permissions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
