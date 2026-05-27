-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-05-2026 a las 12:02:13
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
(2, 'Calendario', 'calendario', 'inline', 'Sigue los tiempos señalados', 'Información sobre el calendario...', 'bi-calendar3', NULL, 0, 1, 1, '2026-02-24 12:08:30', '2026-05-13 13:34:01'),
(3, 'Sobre Nosotros', 'about', 'inline', 'Somos una comunidad de buscadores, aprendices y servidores que anhelan conocer más al Eterno y caminar conforme a Su voluntad.\nNo somos una institución ni una denominación: somos un espacio de estudio, reflexión y encuentro, donde cada persona puede acercarse a la Escritura desde la autenticidad y el respeto.\n\nCreemos en una fe viva, consciente y fundamentada.\nCreemos en la importancia de volver a las raíces, al significado profundo del Nombre y a la esencia del mensaje divino.\nY creemos que cada conversación sincera sobre YHWH tiene el poder de despertar, sanar y transformar.', 'En un mundo lleno de ruido, incertidumbre y búsquedas sin respuesta, nace un espacio dedicado a lo esencial: volver a la Palabra, al Nombre y a la Presencia del Eterno.\nHablemos de YHWH es un lugar para detenernos, respirar y reencontrarnos con la verdad que transforma, guía y sostiene. Aquí exploramos la Escritura con respeto, claridad y propósito, reconociendo que cada conversación sobre el Creador es un acto de acercamiento, un paso hacia la luz y la comprensión.\n\nEste proyecto surge del deseo profundo de compartir, aprender y crecer, no desde la imposición, sino desde la apertura y el diálogo. Porque hablar de YHWH es hablar de vida, de propósito y de identidad.', 'bi-info-circle', NULL, 0, 1, 1, '2026-02-24 12:08:30', '2026-05-13 13:33:53');

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
(9, 'Enlaces Útiles', 'Sobre Nosotros', '/#about', 2),
(10, 'Enlaces Útiles', 'Parashot', '/parashot', 3),
(11, 'Recursos', 'Calendario', '/calendar', 1),
(12, 'Recursos', 'Eventos', '/#portfolio', 2),
(26, 'Enlaces Útiles', 'Parashot', '/parashot', 3),
(27, 'Recursos', 'Calendario', '/calendar', 1),
(28, 'Recursos', 'Eventos', '/#portfolio', 2),
(29, 'Enlaces Útiles', 'Sobre Nosotros', '/#about', 2),
(30, 'Enlaces Útiles', 'Parashot', '/parashot', 3),
(31, 'Recursos', 'Calendario', '/calendar', 1),
(32, 'Recursos', 'Eventos', '/#portfolio', 2),
(33, 'Enlaces Útiles', 'Sobre Nosotros', '/#about', 2),
(34, 'Enlaces Útiles', 'Parashot', '/parashot', 3),
(35, 'Recursos', 'Calendario', '/calendar', 1),
(36, 'Recursos', 'Eventos', '/#portfolio', 2),
(37, 'Enlaces Útiles', 'Sobre Nosotros', '/#about', 2),
(38, 'Enlaces Útiles', 'Parashot', '/parashot', 3),
(39, 'Recursos', 'Calendario', '/calendar', 1),
(40, 'Recursos', 'Eventos', '/#portfolio', 2),
(41, 'Enlaces Útiles', 'Sobre Nosotros', '/#about', 2),
(42, 'Enlaces Útiles', 'Parashot', '/parashot', 3),
(43, 'Recursos', 'Calendario', '/calendar', 1),
(44, 'Recursos', 'Eventos', '/#portfolio', 2),
(45, 'Enlaces Útiles', 'Sobre Nosotros', '/#about', 2),
(46, 'Enlaces Útiles', 'Parashot', '/parashot', 3),
(47, 'Recursos', 'Calendario', '/calendar', 1),
(48, 'Recursos', 'Eventos', '/#portfolio', 2),
(49, 'Enlaces Útiles', 'Sobre Nosotros', '/#about', 2),
(50, 'Enlaces Útiles', 'Parashot', '/parashot', 3),
(51, 'Recursos', 'Calendario', '/calendar', 1),
(52, 'Recursos', 'Eventos', '/#portfolio', 2),
(53, 'Enlaces Útiles', 'Sobre Nosotros', '/#about', 2),
(54, 'Enlaces Útiles', 'Parashot', '/parashot', 3),
(55, 'Recursos', 'Calendario', '/calendar', 1),
(56, 'Recursos', 'Eventos', '/#portfolio', 2),
(57, 'Enlaces Útiles', 'Sobre Nosotros', '/#about', 2),
(58, 'Enlaces Útiles', 'Parashot', '/parashot', 3),
(59, 'Recursos', 'Calendario', '/calendar', 1),
(60, 'Recursos', 'Eventos', '/#portfolio', 2),
(61, 'Enlaces Útiles', 'Sobre Nosotros', '/#about', 2),
(62, 'Enlaces Útiles', 'Parashot', '/parashot', 3),
(63, 'Recursos', 'Calendario', '/calendar', 1),
(64, 'Recursos', 'Eventos', '/#portfolio', 2),
(65, 'Enlaces Útiles', 'Sobre Nosotros', '/#about', 2),
(66, 'Enlaces Útiles', 'Parashot', '/parashot', 3),
(67, 'Recursos', 'Calendario', '/calendar', 1),
(68, 'Recursos', 'Eventos', '/#portfolio', 2),
(69, 'Enlaces Útiles', 'Sobre Nosotros', '/#about', 2),
(70, 'Enlaces Útiles', 'Parashot', '/parashot', 3),
(71, 'Recursos', 'Calendario', '/calendar', 1),
(72, 'Recursos', 'Eventos', '/#portfolio', 2),
(73, 'Enlaces Útiles', 'Sobre Nosotros', '/#about', 2),
(74, 'Enlaces Útiles', 'Parashot', '/parashot', 3),
(75, 'Recursos', 'Calendario', '/calendar', 1),
(76, 'Recursos', 'Eventos', '/#portfolio', 2),
(77, 'Enlaces Útiles', 'Sobre Nosotros', '/#about', 2),
(78, 'Enlaces Útiles', 'Parashot', '/parashot', 3),
(79, 'Recursos', 'Calendario', '/calendar', 1),
(80, 'Recursos', 'Eventos', '/#portfolio', 2),
(81, 'Enlaces Útiles', 'Sobre Nosotros', '/#about', 2),
(82, 'Enlaces Útiles', 'Parashot', '/parashot', 3),
(83, 'Recursos', 'Calendario', '/calendar', 1),
(84, 'Recursos', 'Eventos', '/#portfolio', 2),
(85, 'Enlaces Útiles', 'Sobre Nosotros', '/#about', 2),
(86, 'Enlaces Útiles', 'Parashot', '/parashot', 3),
(87, 'Recursos', 'Calendario', '/calendar', 1),
(88, 'Recursos', 'Eventos', '/#portfolio', 2),
(89, 'Enlaces Útiles', 'Sobre Nosotros', '/#about', 2),
(90, 'Enlaces Útiles', 'Parashot', '/parashot', 3),
(91, 'Recursos', 'Calendario', '/calendar', 1),
(92, 'Recursos', 'Eventos', '/#portfolio', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `home_section_about`
--

CREATE TABLE `home_section_about` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `home_section_about`
--

INSERT INTO `home_section_about` (`id`, `title`, `subtitle`, `content`, `image_url`, `updated_at`) VALUES
(1, 'Sobre Nosotros', 'Somos una comunidad de buscadores, aprendices y servidores que anhelan conocer más al Eterno y caminar conforme a Su voluntad. No somos una institución ni una denominación: somos un espacio de estudio, reflexión y encuentro, donde cada persona puede acercarse a la Escritura desde la autenticidad y el respeto.  Creemos en una fe viva, consciente y fundamentada. Creemos en la importancia de volver a las raíces, al significado profundo del Nombre y a la esencia del mensaje divino. Y creemos que cada conversación sincera sobre YHWH tiene el poder de despertar, sanar y transformar.', 'En un mundo lleno de ruido, incertidumbre y búsquedas sin respuesta, nace un espacio dedicado a lo esencial: volver a la Palabra, al Nombre y a la Presencia del Eterno.\r\nHablemos de YHWH es un lugar para detenernos, respirar y reencontrarnos con la verdad que transforma, guía y sostiene. Aquí exploramos la Escritura con respeto, claridad y propósito, reconociendo que cada conversación sobre el Creador es un acto de acercamiento, un paso hacia la luz y la comprensión.\r\n\r\nEste proyecto surge del deseo profundo de compartir, aprender y crecer, no desde la imposición, sino desde la apertura y el diálogo. Porque hablar de YHWH es hablar de vida, de propósito y de identidad.', '', '2026-05-13 13:42:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `home_section_calendario`
--

CREATE TABLE `home_section_calendario` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `home_section_calendario`
--

INSERT INTO `home_section_calendario` (`id`, `title`, `subtitle`, `content`, `image_url`, `updated_at`) VALUES
(1, 'Calendario ', 'Sigue los tiempos señalados', 'Información sobre el calendario...', '', '2026-05-13 13:42:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `home_section_equipo`
--

CREATE TABLE `home_section_equipo` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `home_section_equipo`
--

INSERT INTO `home_section_equipo` (`id`, `title`, `subtitle`, `content`, `image_url`, `updated_at`) VALUES
(1, 'Equipo', 'Conoce a los encargados', '', '', '2026-05-13 13:42:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `home_section_eventos`
--

CREATE TABLE `home_section_eventos` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `home_section_eventos`
--

INSERT INTO `home_section_eventos` (`id`, `title`, `subtitle`, `content`, `image_url`, `updated_at`) VALUES
(1, 'Eventos', 'Nuestro trabajo', '', '', '2026-05-13 13:42:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `home_section_footer`
--

CREATE TABLE `home_section_footer` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `home_section_footer`
--

INSERT INTO `home_section_footer` (`id`, `title`, `subtitle`, `content`, `image_url`, `updated_at`) VALUES
(1, 'Hablemos de YHWH', 'Nuestro objetivo es el estudio de las Sagradas Escrituras desde ua perspectiva Hebrea.', 'Estudio profundo de las escrituras.', '', '2026-05-13 13:42:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `home_section_hero`
--

CREATE TABLE `home_section_hero` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `home_section_hero`
--

INSERT INTO `home_section_hero` (`id`, `title`, `subtitle`, `content`, `image_url`, `updated_at`) VALUES
(1, 'Hablemos de YHWH', 'Descubre las raíces hebreas de tu fe', 'Contenido descriptivo aquí...', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1920', '2026-05-13 13:42:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `home_section_parashot`
--

CREATE TABLE `home_section_parashot` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `home_section_parashot`
--

INSERT INTO `home_section_parashot` (`id`, `title`, `subtitle`, `content`, `image_url`, `updated_at`) VALUES
(1, 'Parashot', 'Lo que ofrecemos', '', '', '2026-05-13 13:42:03');

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
(2, 2, 'Noaj', 'Génesis 6:9 al 11:32', 'Noé y el diluvio...', '<p><strong>Aliot de la Toráh: </strong></p><p>1. 6:9-22 </p><p>2. 7:1-16 </p><p>3. 7:17 - 8:14 </p><p>4. 8:15 - 9:7 </p><p>5. 9:8-17 </p><p>6. 9:18 - 10:32 </p><p>7. 11:1-32 8. </p><p><br></p><p><strong>Maftir: 1</strong>1:29-32 </p><p><br></p><p><strong>Haftaráh: </strong>Yeshaiahu (Isaías) 54:1-10 Brit HaJadasháh: Mordejai (Marcos) 2:1-28 Lecturas adicionales del Brit HaJadasha: Matitiahu (Mateo) 24:36-39; Ivrim (Hebreos) 11:7; Kefá Álef (1 Pedro) 3:18-22; Kefá Bet (2 Pedro) 2:5; Hitgalut (Apocalipsis) 14:8; 16:19; 17:1–17; 18:1–24 </p><p><br></p><p><strong>NÓAJ Significa “Descanso, Recto, Justo”.</strong></p>', '/assets/parashot/1778595803021-724165542.jpg', '', 'bi-journal-text', '', 'https://www.youtube.com/watch?v=YywwmkIdcgo&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=16', 1, '2026-05-02 11:47:23', '2026-05-13 14:07:50'),
(3, 3, 'Lej Leja', 'Génesis 12:1 al 17:27 ', 'Vete de tu tierra...', '<p><strong>Aliot de la Toráh: </strong></p><p>1. 12:1-13 </p><p>2. 12:14 - 13:4 </p><p>3. 13:5-18 </p><p>4. 14:1-20 </p><p>5. 14:21 - 15:6 </p><p>6. 15:7 - 17:6 </p><p>7. 17:7-27 </p><p><br></p><p><strong>8. Maftir</strong>: 17:24-27 </p><p><br></p><p><strong>Haftaráh</strong>: Yeshaiahu (Isaías) 40:27 - 41:16 </p><p><br></p><p><strong>Brit Hadasháh</strong>: Mordejai (Marcos) 3:1 - 4:20 Lecturas adicionales del Brit HaJadashah: Maaseh (Hechos) 7:1-8; Romanos 4:1-25; Gálatas 3:1-29; Ivrim (Hebreos) 7:1-19; Ivrim (Hebreos) 11:8-12 </p><p><br></p><p><strong>LEJ LEJÁ Significa “Vete para ti”; “Vete por tu propio bien”.</strong></p>', '/assets/parashot/1778595767083-210836392.jpg', '', 'bi-journal-text', '', 'https://www.youtube.com/watch?v=LY0CZmD99xI&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=15', 1, '2026-05-03 11:47:23', '2026-05-13 14:07:17'),
(4, 4, 'Vayerá', 'Génesis 18:1 al 22:24', 'Y se le apareció...', '<p><strong>Aliot de la Toráh:</strong> </p><p>1. 18:1-14 </p><p>2. 18:15-33 </p><p>3. 19:1-20 </p><p>4. 19:21 - 21:4 </p><p>5. 21:5-21 </p><p>6. 21:22-34 </p><p>7. 22:1-24 </p><p><br></p><p><strong>8. Maftir</strong>: 22:20-24 </p><p><br></p><p><strong>Haftaráh</strong>: Melajim Bet (2 Reyes) 4:1-23 </p><p><br></p><p><strong>Brit HaJadasháh</strong>: Mordejai (Marcos) 4:21 - 6:56; Hilel (Lucas) 17:28-37 Lecturas adicionales del Brit HaJadashah: Romanos 9:6–11; Gálatas 4:21-31; Ivrim (Hebreos) 6:13–20; 11:13–19; Yaakov (Santiago) 2:14–24; Kefá Bet (2 Pedro) 2:4–11. </p><p><br></p><p><strong>VAYERÁ Significa “Apareció”</strong></p>', '/assets/parashot/1778595537522-343576235.jpg', '', 'bi-journal-text', '', 'https://www.youtube.com/watch?v=-yPLFAsaufM&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=14', 1, '2026-05-04 11:47:23', '2026-05-13 14:07:07'),
(5, 5, 'Jayei Sarah', 'Génesis 23:1 al 25:18', 'La vida de Sara...', '<p><strong>Aliot de la Toráh:</strong></p><p>1. 23:1-16 </p><p>2. 23:17 - 24:9 </p><p>3. 24:10-26 </p><p>4. 24:27-52 </p><p>5. 24:53-67 </p><p>6. 25:1-11 </p><p>7. 25:12-18 8. </p><p><br></p><p><strong>Maftir:</strong> 25:16-18 </p><p><br></p><p><strong>Haftará: </strong>Melajim Álef (1 Reyes) 1:1-31 </p><p><br></p><p><strong>Brit HaJadasháh:</strong> Mordejai (Marcos) 7:1 - 9:13; Yojanán (Juan) 4:3-14 Lecturas adicionales del Brit HaJadashah: Ivrim (Hebreos) 11:13–16; 1 Corintios 15:50– 57 </p><p><br></p><p><strong>JAYEI SARÁH Significa “La vida de Sarah”.</strong></p>', '/assets/parashot/1778595016317-709604774.jpg', '', 'bi-journal-text', '', 'https://www.youtube.com/watch?v=bOT-lNl-6LQ&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=13', 1, '2026-05-05 11:47:23', '2026-05-13 14:07:23'),
(6, 6, 'Toldot', 'Génesis 25:19 al 28:9', 'Generaciones...', '<p>Generaciones...</p>', '/assets/parashot/1778595850019-720860231.jpg', '', 'bi-journal-text', '', 'https://www.youtube.com/watch?v=AqleRto1mz0&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=12', 1, '2026-05-06 11:47:23', '2026-05-13 14:07:30'),
(8, 7, 'Vayetzé', 'Genesis 28:10 al 32:3', 'Y salió...', '<p>Aliot de la Toráh: </p><p>1. 28:10-22 </p><p>2. 29:1-17 </p><p>3. 29:18 - 30:13 </p><p>4. 30:14-27 </p><p>5. 30:28 - 31:16 </p><p>6. 31:17-42 </p><p>7. 31:43 - 32:3 (32:2 V. Cast.) </p><p>8. Maftir: 32:1 (31:55 V. Cast.) -32:3 (32:2 V. Cast.) </p><p><br></p><p><strong>Haftará:</strong> Hoshea (Oseas) 11:7 - 12:12 (12:11 V. Cast.)</p><p><br></p><p><strong>Brit HaJadasháh:</strong> Mordejai (Marcos) 10:32 - 11:33; Yojanán (Juan) 1:41-51 Lecturas adicionales del Brit HaJadasháh: Matitiahu (Mateo) 10:6, 15:24, 19:28; Hillel (Lucas) 22:30; Yojanan (Juan) 1:43-51; Ivrim (Hebreos) 8:6-8; Yaakov (Santiago) 1:1; Hitgalut (Apocalipsis) 21:12. </p><p><br></p><p><strong>VAYETZÉ Significa “Y Salió”</strong></p>', '/assets/parashot/1778594609006-721383818.jpg', '', 'bi-journal-text', '', 'https://www.youtube.com/watch?v=yFkrdydR-Tg&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=11', 1, '2026-05-07 15:48:13', '2026-05-13 14:07:42'),
(9, 1, 'Bereshit', 'Génesis 1:1 al 6:8', 'En el principio...', '<p>Aliot de la Toráh: </p><p>1. 1:1-13</p><p>2. 1:14-23 </p><p>3. 1:24 - 2:3 </p><p>4. 2:4 - 3:21 </p><p>5. 3:22 - 4:26 </p><p>6. 5:1-24 </p><p>7. 5:25 - 6:8 8. </p><p><br></p><p>Maftir: 6:5-8 </p><p><br></p><p>Haftaráh: Yeshaiahu (Isaías) 42:5-21 Brit HaJadasháh: Mordejai (Marcos) 1:1-45. </p><p><br></p><p>Lecturas adicionales del Brit HaJadashah: Yojanan (Juan) 1:1-16; Colosenses 1:14-17; Ivrim (Hebreos) 1:1-3, 11:1-6; (Hitgalut) Apocalipsis 2:7; 21:1-6,23; 22:1-5,14; Romanos 5:12-21; 1 Corintios 15:35-58; Matitiahu (Mateo) 19:4-6; Efesios 5:21-33; 1 Timoteo 2:11-15; </p><p><br></p><p>BERESHIT Significa “En el principio, Desde el origen, Por causa del Principal”.</p>', '/assets/parashot/1778595820285-904624154.jpg', '', 'bi-journal-text', '', 'https://youtu.be/oA6ALkq-DbA?si=KtHRJ-x12XvKmBeP', 1, '2026-05-01 10:13:03', '2026-05-13 14:06:29');

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
(2, 'home', 'Calendario', 'Calendario ', 'Sigue los tiempos señalados', 'Información sobre el calendario...', '', '2026-05-13 13:31:23'),
(3, 'home', 'About', 'Sobre Nosotros', 'Somos una comunidad de buscadores, aprendices y servidores que anhelan conocer más al Eterno y caminar conforme a Su voluntad. No somos una institución ni una denominación: somos un espacio de estudio, reflexión y encuentro, donde cada persona puede acercarse a la Escritura desde la autenticidad y el respeto.  Creemos en una fe viva, consciente y fundamentada. Creemos en la importancia de volver a las raíces, al significado profundo del Nombre y a la esencia del mensaje divino. Y creemos que cada conversación sincera sobre YHWH tiene el poder de despertar, sanar y transformar.', 'En un mundo lleno de ruido, incertidumbre y búsquedas sin respuesta, nace un espacio dedicado a lo esencial: volver a la Palabra, al Nombre y a la Presencia del Eterno.\r\nHablemos de YHWH es un lugar para detenernos, respirar y reencontrarnos con la verdad que transforma, guía y sostiene. Aquí exploramos la Escritura con respeto, claridad y propósito, reconociendo que cada conversación sobre el Creador es un acto de acercamiento, un paso hacia la luz y la comprensión.\r\n\r\nEste proyecto surge del deseo profundo de compartir, aprender y crecer, no desde la imposición, sino desde la apertura y el diálogo. Porque hablar de YHWH es hablar de vida, de propósito y de identidad.', '', '2026-05-13 11:47:00'),
(9, 'home', 'Footer', 'Hablemos de YHWH', 'Nuestro objetivo es el estudio de las Sagradas Escrituras desde ua perspectiva Hebrea.', 'Estudio profundo de las escrituras.', '', '2026-05-13 13:28:45');

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
(1, 'admin', '$2b$10$GU9l7YchLgnI/V7adIbrxOxaKKTKRCaZDTJYGgxNYlCsQZkjI7EDW', NULL, 'admin', '2026-02-18 11:47:23'),
(2, 'editor', '$2b$10$GU9l7YchLgnI/V7adIbrxOxaKKTKRCaZDTJYGgxNYlCsQZkjI7EDW', NULL, 'editor', '2026-02-18 11:47:23');

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
-- Indices de la tabla `home_section_about`
--
ALTER TABLE `home_section_about`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `home_section_calendario`
--
ALTER TABLE `home_section_calendario`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `home_section_equipo`
--
ALTER TABLE `home_section_equipo`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `home_section_eventos`
--
ALTER TABLE `home_section_eventos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `home_section_footer`
--
ALTER TABLE `home_section_footer`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `home_section_hero`
--
ALTER TABLE `home_section_hero`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `home_section_parashot`
--
ALTER TABLE `home_section_parashot`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT de la tabla `home_section_about`
--
ALTER TABLE `home_section_about`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `home_section_calendario`
--
ALTER TABLE `home_section_calendario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `home_section_equipo`
--
ALTER TABLE `home_section_equipo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `home_section_eventos`
--
ALTER TABLE `home_section_eventos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `home_section_footer`
--
ALTER TABLE `home_section_footer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `home_section_hero`
--
ALTER TABLE `home_section_hero`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `home_section_parashot`
--
ALTER TABLE `home_section_parashot`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT de la tabla `site_settings`
--
ALTER TABLE `site_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=163;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

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
