-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: hablemos_yhwh
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `dynamic_sections`
--

DROP TABLE IF EXISTS `dynamic_sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dynamic_sections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `data_table` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dynamic_sections`
--

LOCK TABLES `dynamic_sections` WRITE;
/*!40000 ALTER TABLE `dynamic_sections` DISABLE KEYS */;
INSERT INTO `dynamic_sections` VALUES (1,'Hablemos de YHWH','hero','inline','Descubre las ra├â┬¡ces hebreas de tu fe','Contenido descriptivo aqu├â┬¡...','bi-house',NULL,0,1,1,'home_section_hero','2026-02-24 12:08:30','2026-05-14 00:29:38'),(2,'Calendario Lunisolar','calendario','inline','Sigue los tiempos se├â┬▒alados','Informaci├â┬│n sobre el calendario...','bi-calendar3',NULL,0,1,1,'home_section_calendario','2026-02-24 12:08:30','2026-05-14 00:29:38'),(5,'Sobre Nosotros','about','inline',NULL,NULL,'bi-file-text',NULL,0,1,1,NULL,'2026-05-15 00:00:48','2026-05-15 00:00:48'),(12,'Identidad','identidad','inline','Instroduccion a descrubri nuestra identidad conforme a la voluntad de YHWH, y lo que las escrituras nos revelan','La serie completa ense┬▒a que la identidad del creyente no se construye desde emociones, cultura, religi┬¥n o experiencias personales, sino desde lo que YHWH declara en Su Palabra. A lo largo de los cuatro videos, se muestra que la humanidad perdi┬¥ su identidad original al separarse del Creador, y que Yeshua es quien la restaura, devolviendo prop┬¥sito, direcci┬¥n y sentido.\r\n\r\nLa serie revela que muchas personas viven desde identidades distorsionadas ├╣marcadas por heridas, etiquetas humanas, expectativas sociales o patrones mentales antiguos├╣ y por eso experimentan confusi┬¥n, inseguridad o falta de prop┬¥sito. La verdadera identidad se recupera cuando el creyente renueva su mente, escucha la voz del Creador por encima de las voces externas y se alinea con la perspectiva b├Øblica original.\r\n\r\nFinalmente, la identidad en Yeshua no es un concepto te┬¥rico, sino una forma de vida pr├ƒctica: se recibe, se aprende, se vive y se expresa en decisiones, car├ƒcter, obediencia y comunidad. La serie concluye afirmando que caminar en la identidad restaurada es un proceso continuo que transforma cada ├ƒrea de la vida y permite al creyente reflejar la naturaleza de YHWH en el mundo.','bi-file-text',NULL,0,1,1,'identidad_items','2026-06-19 14:17:23','2026-06-19 14:35:02');
/*!40000 ALTER TABLE `dynamic_sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `escuchandolaparashot`
--

DROP TABLE IF EXISTS `escuchandolaparashot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `escuchandolaparashot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) DEFAULT NULL,
  `nombreparasha` varchar(255) DEFAULT NULL,
  `versiculos` varchar(255) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `urlyoutube` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `escuchandolaparashot`
--

LOCK TABLES `escuchandolaparashot` WRITE;
/*!40000 ALTER TABLE `escuchandolaparashot` DISABLE KEYS */;
/*!40000 ALTER TABLE `escuchandolaparashot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `footer_links`
--

DROP TABLE IF EXISTS `footer_links`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `footer_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(50) NOT NULL,
  `title` varchar(100) NOT NULL,
  `url` varchar(255) NOT NULL,
  `order_index` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `footer_links`
--

LOCK TABLES `footer_links` WRITE;
/*!40000 ALTER TABLE `footer_links` DISABLE KEYS */;
INSERT INTO `footer_links` VALUES (27,'Recursos','Calendario','/calendar',1),(30,'Enlaces ├â┼ítiles','Parashot','/parashot',3),(89,'Enlaces ├Ütiles','Sobre Nosotros','/#about',2),(90,'Enlaces ├Ütiles','Parashot','/parashot',3),(91,'Recursos','Calendario','/calendar',1),(92,'Recursos','Eventos','/#portfolio',2);
/*!40000 ALTER TABLE `footer_links` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_section_about`
--

DROP TABLE IF EXISTS `home_section_about`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `home_section_about` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_section_about`
--

LOCK TABLES `home_section_about` WRITE;
/*!40000 ALTER TABLE `home_section_about` DISABLE KEYS */;
INSERT INTO `home_section_about` VALUES (1,'Qui├â┬®nes somos','En un mundo lleno de ruido, incertidumbre y b├â┬║squedas sin respuesta, nace un espacio dedicado a lo esencial: volver a la Palabra, al Nombre y a la Presencia del Eterno. Hablemos de YHWH es un lugar para detenernos, respirar y reencontrarnos con la verdad que transforma, gu├â┬¡a y sostiene. Aqu├â┬¡ exploramos la Escritura con respeto, claridad y prop├â┬│sito, reconociendo que cada conversaci├â┬│n sobre el Creador es un acto de acercamiento, un paso hacia la luz y la comprensi├â┬│n.  Este proyecto surge del deseo profundo de compartir, aprender y crecer, no desde la imposici├â┬│n, sino desde la apertura y el di├â┬ílogo. Porque hablar de YHWH es hablar de vida, de prop├â┬│sito y de identidad.','Somos una comunidad de buscadores, aprendices y servidores que anhelan conocer m├â┬ís al Eterno y caminar conforme a Su voluntad.\r\nNo somos una instituci├â┬│n ni una denominaci├â┬│n: somos un espacio de estudio, reflexi├â┬│n y encuentro, donde cada persona puede acercarse a la Escritura desde la autenticidad y el respeto.\r\n\r\nCreemos en una fe viva, consciente y fundamentada.\r\nCreemos en la importancia de volver a las ra├â┬¡ces, al significado profundo del Nombre y a la esencia del mensaje divino.\r\nY creemos que cada conversaci├â┬│n sincera sobre YHWH tiene el poder de despertar, sanar y transformar.','','2026-05-15 00:01:37');
/*!40000 ALTER TABLE `home_section_about` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_section_calendario`
--

DROP TABLE IF EXISTS `home_section_calendario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `home_section_calendario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_section_calendario`
--

LOCK TABLES `home_section_calendario` WRITE;
/*!40000 ALTER TABLE `home_section_calendario` DISABLE KEYS */;
INSERT INTO `home_section_calendario` VALUES (1,'Calendario Lunisolar','Sigue los tiempos se├â┬▒alados','Informaci├â┬│n sobre el calendario...',NULL,'2026-05-14 00:29:38');
/*!40000 ALTER TABLE `home_section_calendario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_section_contactos`
--

DROP TABLE IF EXISTS `home_section_contactos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `home_section_contactos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_section_contactos`
--

LOCK TABLES `home_section_contactos` WRITE;
/*!40000 ALTER TABLE `home_section_contactos` DISABLE KEYS */;
/*!40000 ALTER TABLE `home_section_contactos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_section_equipo`
--

DROP TABLE IF EXISTS `home_section_equipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `home_section_equipo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_section_equipo`
--

LOCK TABLES `home_section_equipo` WRITE;
/*!40000 ALTER TABLE `home_section_equipo` DISABLE KEYS */;
/*!40000 ALTER TABLE `home_section_equipo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_section_footer`
--

DROP TABLE IF EXISTS `home_section_footer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `home_section_footer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_section_footer`
--

LOCK TABLES `home_section_footer` WRITE;
/*!40000 ALTER TABLE `home_section_footer` DISABLE KEYS */;
INSERT INTO `home_section_footer` VALUES (1,'Hablemos de YHWH','Nuestro objetivo es el estudio de las ra├â┬Øces hebreas.','Estudio profundo de las escrituras.',NULL,'2026-05-14 00:29:38');
/*!40000 ALTER TABLE `home_section_footer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_section_hero`
--

DROP TABLE IF EXISTS `home_section_hero`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `home_section_hero` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_section_hero`
--

LOCK TABLES `home_section_hero` WRITE;
/*!40000 ALTER TABLE `home_section_hero` DISABLE KEYS */;
INSERT INTO `home_section_hero` VALUES (1,'Hablemos de YHWH','Descubre las ra├â┬¡ces hebreas de tu fe','Contenido descriptivo aqu├â┬¡...','https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1920','2026-05-14 00:27:44');
/*!40000 ALTER TABLE `home_section_hero` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_section_parashot`
--

DROP TABLE IF EXISTS `home_section_parashot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `home_section_parashot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_section_parashot`
--

LOCK TABLES `home_section_parashot` WRITE;
/*!40000 ALTER TABLE `home_section_parashot` DISABLE KEYS */;
/*!40000 ALTER TABLE `home_section_parashot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `home_section_testimonio`
--

DROP TABLE IF EXISTS `home_section_testimonio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `home_section_testimonio` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `home_section_testimonio`
--

LOCK TABLES `home_section_testimonio` WRITE;
/*!40000 ALTER TABLE `home_section_testimonio` DISABLE KEYS */;
/*!40000 ALTER TABLE `home_section_testimonio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `identidad_items`
--

DROP TABLE IF EXISTS `identidad_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `identidad_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `youtube_link` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `pdf_file` varchar(255) DEFAULT NULL,
  `parasha_number` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `identidad_items`
--

LOCK TABLES `identidad_items` WRITE;
/*!40000 ALTER TABLE `identidad_items` DISABLE KEYS */;
INSERT INTO `identidad_items` VALUES (1,'Identidad Parte # 4','','Redescubriendo el dise├▒o original: De la dispersi├│n de las naciones a nuestra verdadera ciudadan├¡a en Israel.','<p>\"┬┐Qui├®nes somos realmente a la luz de las Escrituras? Durante generaciones, interpretaciones marcadas por conceptos helen├¡sticos y visiones dogm├íticas nos han distanciado de la ra├¡z de nuestra fe. En este esclarecedor cierre de serie, <a href=\"http://www.youtube.com/watch?v=OizjeBc5UFU\" target=\"_blank\"><strong>identidad Parte # 4</strong></a> nos invita a derribar paradigmas tradicionales para abrazar nuestra verdadera identidad espiritual desde una perspectiva estrictamente hebrea.</p><p>A trav├®s del sacrificio del Mes├¡as Yeshua, no somos llamados a una nueva religi├│n, sino a recuperar nuestra ciudadan├¡a en Israel, dejando atr├ís la condici├│n de gentiles. Descubre el verdadero significado de la inmersi├│n espiritual (<em>Tvil</em>), la vigencia eterna de las instrucciones del Creador (<em>Tor├í</em>) y c├│mo el mensaje de la Nueva Jerusal├®n nos confirma que el plan original del Eterno siempre ha sido, y seguir├í siendo, unificar a Su pueblo.\"</p>','https://www.youtube.com/watch?v=OizjeBc5UFU','/uploads/entity/1781881973661-729784546.png',NULL,4,'2026-06-19 15:12:53'),(2,'Identidad Parte # 3','','Redenci├│n y Retorno: El Pacto Renovado y la Restauraci├│n de las Tribus de Israel bajo una Perspectiva Hebrea','<h2><strong>El Pacto Renovado: El Retorno de las Tribus de Israel</strong></h2><p>┬┐Por qu├® miles de personas en todo el mundo est├ín volviendo a las ra├¡ces hebreas de la fe? No es una moda, es el cumplimiento de un dise├▒o prof├®tico ancestral: el despertar y la unificaci├│n del pueblo escogido.</p><h3><strong>El Contrato Matrimonial y la Redenci├│n</strong></h3><p>Desde la perspectiva hebrea, la Tor├í representa una <em>Ketuv├í</em> (un contrato matrimonial) donde el Creador es el esposo y la naci├│n de Israel es la novia.</p><ul><li><strong>El Divorcio:</strong> Debido a la idolatr├¡a y la asimilaci├│n con las naciones gentiles, la Casa de Israel (Efra├¡n) recibi├│ \"carta de divorcio\".</li><li><strong>La Ley Jur├¡dica:</strong> Seg├║n Deuteronomio 24:1-4, una esposa repudiada no pod├¡a volver legalmente con su primer marido a menos que mediara una muerte.</li><li><strong>La Soluci├│n:</strong> La muerte de Yeshua en la cruz pag├│ el precio de esa transgresi├│n legal, haciendo posible un <strong>Pacto Renovado</strong> (<em>Brit Hadashah</em>) para restaurar y tomar de nuevo a su novia sin quebrantar la ley.</li></ul><h3><strong>Profec├¡as en Cumplimiento Activo</strong></h3><p>Lo que hoy vemos es el cumplimiento de antiguas palabras prof├®ticas:</p><ul><li><strong>Zacar├¡as 8:23:</strong> Diez hombres de las naciones se colgar├ín del manto (<em>Talit</em>) de un jud├¡o para aprender las instrucciones del Dios verdadero. Esto representa a las personas en la dispersi├│n que hoy anhelan estudiar la Tor├í.</li><li><strong>Ezequiel 34:</strong> El Pastor mismo prometi├│ buscar personalmente a sus ovejas perdidas y rescatarlas de las falsas doctrinas.</li></ul><p><br></p>','https://www.youtube.com/watch?v=gEg8WKb58GU','/uploads/entity/1781882128971-670646096.png',NULL,3,'2026-06-19 15:15:28');
/*!40000 ALTER TABLE `identidad_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parashot`
--

DROP TABLE IF EXISTS `parashot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parashot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parashot`
--

LOCK TABLES `parashot` WRITE;
/*!40000 ALTER TABLE `parashot` DISABLE KEYS */;
INSERT INTO `parashot` VALUES (2,2,'Noaj','G├â┬®nesis 6:9 al 11:32','No├â┬® y el diluvio...','<p><strong>Aliot de la Tor├â┬íh: </strong></p><p>1. 6:9-22 </p><p>2. 7:1-16 </p><p>3. 7:17 - 8:14 </p><p>4. 8:15 - 9:7 </p><p>5. 9:8-17 </p><p>6. 9:18 - 10:32 </p><p>7. 11:1-32 8. </p><p><br></p><p><strong>Maftir: 1</strong>1:29-32 </p><p><br></p><p><strong>Haftar├â┬íh: </strong>Yeshaiahu (Isa├â┬¡as) 54:1-10 Brit HaJadash├â┬íh: Mordejai (Marcos) 2:1-28 Lecturas adicionales del Brit HaJadasha: Matitiahu (Mateo) 24:36-39; Ivrim (Hebreos) 11:7; Kef├â┬í ├â┬ülef (1 Pedro) 3:18-22; Kef├â┬í Bet (2 Pedro) 2:5; Hitgalut (Apocalipsis) 14:8; 16:19; 17:1├óÔé¼ÔÇ£17; 18:1├óÔé¼ÔÇ£24 </p><p><br></p><p><strong>N├âÔÇ£AJ Significa ├óÔé¼┼ôDescanso, Recto, Justo├óÔé¼┬Ø.</strong></p>','/assets/parashot/1778595803021-724165542.jpg','','bi-journal-text','','https://www.youtube.com/watch?v=YywwmkIdcgo&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=16',1,'2026-02-18 11:47:23','2026-05-12 14:23:23'),(3,3,'Lej Leja','G├â┬®nesis 12:1 al 17:27 ','Vete de tu tierra...','<p><strong>Aliot de la Tor├â┬íh: </strong></p><p>1. 12:1-13 </p><p>2. 12:14 - 13:4 </p><p>3. 13:5-18 </p><p>4. 14:1-20 </p><p>5. 14:21 - 15:6 </p><p>6. 15:7 - 17:6 </p><p>7. 17:7-27 </p><p><br></p><p><strong>8. Maftir</strong>: 17:24-27 </p><p><br></p><p><strong>Haftar├â┬íh</strong>: Yeshaiahu (Isa├â┬¡as) 40:27 - 41:16 </p><p><br></p><p><strong>Brit Hadash├â┬íh</strong>: Mordejai (Marcos) 3:1 - 4:20 Lecturas adicionales del Brit HaJadashah: Maaseh (Hechos) 7:1-8; Romanos 4:1-25; G├â┬ílatas 3:1-29; Ivrim (Hebreos) 7:1-19; Ivrim (Hebreos) 11:8-12 </p><p><br></p><p><strong>LEJ LEJ├â┬ü Significa ├óÔé¼┼ôVete para ti├óÔé¼┬Ø; ├óÔé¼┼ôVete por tu propio bien├óÔé¼┬Ø.</strong></p>','/assets/parashot/1778595767083-210836392.jpg','','bi-journal-text','','https://www.youtube.com/watch?v=LY0CZmD99xI&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=15',1,'2026-02-18 11:47:23','2026-05-12 14:22:47'),(4,4,'Vayer├â┬í','G├â┬®nesis 18:1 al 22:24','Y se le apareci├â┬│...','<p><strong>Aliot de la Tor├â┬íh:</strong> </p><p>1. 18:1-14 </p><p>2. 18:15-33 </p><p>3. 19:1-20 </p><p>4. 19:21 - 21:4 </p><p>5. 21:5-21 </p><p>6. 21:22-34 </p><p>7. 22:1-24 </p><p><br></p><p><strong>8. Maftir</strong>: 22:20-24 </p><p><br></p><p><strong>Haftar├â┬íh</strong>: Melajim Bet (2 Reyes) 4:1-23 </p><p><br></p><p><strong>Brit HaJadash├â┬íh</strong>: Mordejai (Marcos) 4:21 - 6:56; Hilel (Lucas) 17:28-37 Lecturas adicionales del Brit HaJadashah: Romanos 9:6├óÔé¼ÔÇ£11; G├â┬ílatas 4:21-31; Ivrim (Hebreos) 6:13├óÔé¼ÔÇ£20; 11:13├óÔé¼ÔÇ£19; Yaakov (Santiago) 2:14├óÔé¼ÔÇ£24; Kef├â┬í Bet (2 Pedro) 2:4├óÔé¼ÔÇ£11. </p><p><br></p><p><strong>VAYER├â┬ü Significa ├óÔé¼┼ôApareci├â┬│├óÔé¼┬Ø</strong></p>','/assets/parashot/1778595537522-343576235.jpg','','bi-journal-text','','https://www.youtube.com/watch?v=-yPLFAsaufM&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=14',1,'2026-02-18 11:47:23','2026-05-12 14:18:57'),(5,5,'Jayei Sarah','G├â┬®nesis 23:1 al 25:18','La vida de Sara...','<p><strong>Aliot de la Tor├â┬íh:</strong></p><p>1. 23:1-16 </p><p>2. 23:17 - 24:9 </p><p>3. 24:10-26 </p><p>4. 24:27-52 </p><p>5. 24:53-67 </p><p>6. 25:1-11 </p><p>7. 25:12-18 8. </p><p><br></p><p><strong>Maftir:</strong> 25:16-18 </p><p><br></p><p><strong>Haftar├â┬í: </strong>Melajim ├â┬ülef (1 Reyes) 1:1-31 </p><p><br></p><p><strong>Brit HaJadash├â┬íh:</strong> Mordejai (Marcos) 7:1 - 9:13; Yojan├â┬ín (Juan) 4:3-14 Lecturas adicionales del Brit HaJadashah: Ivrim (Hebreos) 11:13├óÔé¼ÔÇ£16; 1 Corintios 15:50├óÔé¼ÔÇ£ 57 </p><p><br></p><p><strong>JAYEI SAR├â┬üH Significa ├óÔé¼┼ôLa vida de Sarah├óÔé¼┬Ø.</strong></p>','/assets/parashot/1778595016317-709604774.jpg','','bi-journal-text','','https://www.youtube.com/watch?v=bOT-lNl-6LQ&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=13',1,'2026-02-18 11:47:23','2026-05-12 14:10:16'),(6,6,'Toldot','G├â┬®nesis 25:19 al 28:9','Generaciones...','<p>Generaciones...</p>','/assets/parashot/1778595850019-720860231.jpg','','bi-journal-text','','https://www.youtube.com/watch?v=AqleRto1mz0&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=12',1,'2026-02-18 11:47:23','2026-05-12 14:24:10'),(8,7,'Vayetz├â┬®','Genesis 28:10 al 32:3','Y sali├â┬│...','<p>Aliot de la Tor├â┬íh: </p><p>1. 28:10-22 </p><p>2. 29:1-17 </p><p>3. 29:18 - 30:13 </p><p>4. 30:14-27 </p><p>5. 30:28 - 31:16 </p><p>6. 31:17-42 </p><p>7. 31:43 - 32:3 (32:2 V. Cast.) </p><p>8. Maftir: 32:1 (31:55 V. Cast.) -32:3 (32:2 V. Cast.) </p><p><br></p><p><strong>Haftar├â┬í:</strong> Hoshea (Oseas) 11:7 - 12:12 (12:11 V. Cast.)</p><p><br></p><p><strong>Brit HaJadash├â┬íh:</strong> Mordejai (Marcos) 10:32 - 11:33; Yojan├â┬ín (Juan) 1:41-51 Lecturas adicionales del Brit HaJadash├â┬íh: Matitiahu (Mateo) 10:6, 15:24, 19:28; Hillel (Lucas) 22:30; Yojanan (Juan) 1:43-51; Ivrim (Hebreos) 8:6-8; Yaakov (Santiago) 1:1; Hitgalut (Apocalipsis) 21:12. </p><p><br></p><p><strong>VAYETZ├âÔÇ░ Significa ├óÔé¼┼ôY Sali├â┬│├óÔé¼┬Ø</strong></p>','/assets/parashot/1778594609006-721383818.jpg','','bi-journal-text','','https://www.youtube.com/watch?v=yFkrdydR-Tg&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=11',1,'2026-02-18 15:48:13','2026-05-12 14:03:29'),(9,1,'Bereshit','G├â┬®nesis 1:1 al 6:8','En el principio...','<p>Aliot de la Tor├â┬íh: </p><p>1. 1:1-13</p><p>2. 1:14-23 </p><p>3. 1:24 - 2:3 </p><p>4. 2:4 - 3:21 </p><p>5. 3:22 - 4:26 </p><p>6. 5:1-24 </p><p>7. 5:25 - 6:8 8. </p><p><br></p><p>Maftir: 6:5-8 </p><p><br></p><p>Haftar├â┬íh: Yeshaiahu (Isa├â┬¡as) 42:5-21 Brit HaJadash├â┬íh: Mordejai (Marcos) 1:1-45. </p><p><br></p><p>Lecturas adicionales del Brit HaJadashah: Yojanan (Juan) 1:1-16; Colosenses 1:14-17; Ivrim (Hebreos) 1:1-3, 11:1-6; (Hitgalut) Apocalipsis 2:7; 21:1-6,23; 22:1-5,14; Romanos 5:12-21; 1 Corintios 15:35-58; Matitiahu (Mateo) 19:4-6; Efesios 5:21-33; 1 Timoteo 2:11-15; </p><p><br></p><p>BERESHIT Significa ├óÔé¼┼ôEn el principio, Desde el origen, Por causa del Principal├óÔé¼┬Ø.</p>','/assets/parashot/1778595820285-904624154.jpg','','bi-journal-text','','https://youtu.be/oA6ALkq-DbA?si=KtHRJ-x12XvKmBeP',1,'2026-05-12 10:13:03','2026-05-12 14:23:40'),(11,8,'Vayishlaj','G├â┬®nesis 32:4 al 36:43','Y envi├â┬│n','<p><strong>Aliot de la Tor├â┬íh: </strong></p><p>1. 32:4  - 32:13 </p><p>2. 32:14 - 30 </p><p>3. 32:31 - 33:5 </p><p>4. 33:6-20 </p><p>5. 34:1 - 35:13 </p><p>6. 35:14 - 36:19 </p><p>7. 36:20-43 </p><p><br></p><p><strong>8. Maftir: 36:40-43 </strong></p><p><br></p><p><strong>Haftar├â┬í:</strong> Obadiah (Abd├â┬¡as) 1-21 </p><p><br></p><p><strong>Brit HaJadash├â┬íh:</strong> Mordejai (Marcos) 12:1- 44; Matitiahu (Mateo) 2:13-23 Lecturas adicionales del Brit HaJadash├â┬íh: Matitiahu (Mateo) 26:36-46; 1 Corintios 5:1- 13; Hitgalut (Apocalipsis) 7:1-14; 18-2,4 </p><p><br></p><p><strong>VAISHLAJ Significa ├óÔé¼┼ôY Envi├â┬│├óÔé¼┬Ø</strong></p>','/assets/parashot/1779963851039-564082659.jpg','','bi-journal-text','','https://www.youtube.com/watch?v=MwlLUaRN3CM&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=10',1,'2026-05-15 14:16:10','2026-05-28 10:24:11'),(12,9,'Vayeshev','G├â┬®nesis 37:1 al 40:23','Y se estableci├â┬│','<p><strong>Aliot a la Tor├â┬íh:</strong> </p><p>1. 37:1-11 </p><p>2. 37:12-22 </p><p>3. 37:23-36 </p><p>4. 38:1-30 </p><p>5. 39:1-6 </p><p>6. 39:7-23 </p><p>7. 40:1-23 </p><p><br></p><p><strong>8. Maftir: </strong>40:20-23 </p><p><br></p><p><strong>Haftar├â┬íh:</strong> Am├â┬│s 2:6 - 3:8 </p><p><br></p><p><strong>Brit HaJadashah:</strong> Matitiahu (Mateo) 1:18-25 Lecturas adicionales del Brit HaJadash├â┬íh: Maaseh (Hechos) 7:9-16 </p><p><br></p><p><strong>VAYESHEV Significa ├óÔé¼┼ôY se Estableci├â┬│├óÔé¼┬Ø</strong></p>','/assets/parashot/1779963829457-928952380.jpg','','bi-journal-text','','https://www.youtube.com/watch?v=XtY92vEGkJ4&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=9',1,'2026-05-15 15:53:11','2026-05-28 10:23:49'),(13,10,'Miketz','G├â┬®nesis 41:1 al 44:17','Al final','<p><strong>Aliot a la Tor├â┬íh: </strong></p><p>1. 41:1-14 </p><p>2. 41:15-38 </p><p>3. 41:39-52 </p><p>4. 41:53 ├óÔé¼ÔÇ£ 42:18 </p><p>5. 42:19 ├óÔé¼ÔÇ£ 43:15 </p><p>6. 43:16-29 </p><p>7. 43:30 ├óÔé¼ÔÇ£ 44:17 </p><p><br></p><p><strong>8. Maftir: </strong>44:14-17 </p><p><br></p><p><strong>Haftar├â┬íh: </strong>Melajim Alef (1 Reyes) 3:15 ├óÔé¼ÔÇ£ 4:1 </p><p><br></p><p><strong>Brit Hadashah:</strong> Mordejai (Marcos) 13:1 ├óÔé¼ÔÇ£ 14:31 Lecturas adicionales del Brit HaJadash├â┬íh: Maaseh (Hechos) 7:9-16; Matitiahu (Mateo) 7:2 </p><p><br></p><p><strong>MIKETZ Significa ├óÔé¼┼ôAl final├óÔé¼┬Ø, ├óÔé¼┼ôAl cabo├óÔé¼┬Ø.</strong></p>','/assets/parashot/1779963798092-480618273.jpg','','bi-journal-text','','https://www.youtube.com/watch?v=-Geay0Julw8&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=8',1,'2026-05-15 15:55:46','2026-05-28 10:23:18'),(14,11,'Vayigash','G├â┬®nesis 44:18 al 47:27','Y se acerc├â┬│','<p><strong>Aliot de la Tor├â┬íh: </strong></p><p>1. 44:18-30 </p><p>2. 44:31 ├óÔé¼ÔÇ£ 45:7 </p><p>3. 45:8-18 </p><p>4. 45:19-27 </p><p>5. 45:28 ├óÔé¼ÔÇ£ 46:27 </p><p>6. 46:28 ├óÔé¼ÔÇ£ 47:10 </p><p>7. 47:11-27 </p><p><br></p><p><strong>8. Maftir:</strong> 47:25-27 </p><p><br></p><p><strong>Haftar├â┬íh:</strong> Yejezkel (Ezequiel) 37:15-28 </p><p><br></p><p><strong>Brit HaJadashah: </strong>Mordejai (Marcos) 14:32 ├óÔé¼ÔÇ£ 15:5 Lecturas adicionales del Brit HaJadash├â┬íh: Romanos 9:1-29, 11:13-24; Efesios 2:11-22; Matitiahu (Mateo) 10:6, 15:24 </p><p><br></p><p><strong>VAYIGASH Significa: ├óÔé¼┼ôY se acerc├â┬│├óÔé¼┬Ø.&nbsp;</strong></p>','/assets/parashot/1779963810340-170336645.jpg','','bi-journal-text','','https://www.youtube.com/watch?v=b0YDsypqolQ',1,'2026-05-15 16:04:51','2026-05-28 10:23:30'),(15,12,'Vayeji','G├â┬®nesis 47:28 al 50:26','Y vivi├â┬│','<p><strong>Aliot a la Tor├â┬íh: </strong></p><p><br></p><p>1. 47:28 ├óÔé¼ÔÇ£ 48:9 </p><p>2. 48:10-16 </p><p>3. 48:17-22 </p><p>4. 49:1-18 </p><p>5. 49:19-26 </p><p>6. 49:27 ├óÔé¼ÔÇ£ 50:20 </p><p>7. 50:21-26 </p><p><br></p><p><strong>8. Maftir:</strong> 50:23-26 </p><p><br></p><p><strong>Haftar├â┬íh: </strong>Melajim ├â┬ülef (1 Reyes) 2:1-12 </p><p><br></p><p><strong>Brith HaJadash├â┬íh:</strong> Mordejai (Marcos) 15:6 ├óÔé¼ÔÇ£ 16:8 Lecturas adicionales del Brit HaJadash├â┬íh: Hilel (Lucas) 1:23├óÔé¼ÔÇ£33; Maaseh (Hechos) 7:9- 16, 15:17; Hitgalut (Apocalipsis) 7:9-17; Ivrim (Hebreos) 11:21-22; Hitgalut (Apocalipsis) 5:5 </p><p><br></p><p><strong>VAIEJ├â┬ì Significa ├óÔé¼┼ôY Vivi├â┬│├óÔé¼┬Ø&nbsp;</strong></p>','/assets/parashot/1779963731236-987445526.png','','bi-journal-text','','https://www.youtube.com/watch?v=ifZQv5A3JQ8&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=7',1,'2026-05-15 16:13:28','2026-05-28 10:22:11'),(16,13,'Shemot','├âÔÇ░xodo 1:1 al 6:1','Nombres ','<p><strong>Aliot a la Torah: </strong></p><p>1. 1:1-17 </p><p>2. 1:18 ├óÔé¼ÔÇ£ 2:10 </p><p>3. 2:11-25 </p><p>4. 3:1-17 </p><p>5. 3:18 ├óÔé¼ÔÇ£ 4:17 </p><p>6. 4:18-31</p><p>7. 5:1 ├óÔé¼ÔÇ£ 6:1 8. </p><p><br></p><p><strong>Maftir:</strong> 5:22 ├óÔé¼ÔÇ£ 6:1 </p><p><br></p><p><strong>Haftar├â┬íh: </strong>Yermeiahu (Jerem├â┬¡as) 1:1 ├óÔé¼ÔÇ£ 2:3 </p><p><br></p><p><strong>Brit HaJadashah:</strong> Hillel (Lucas) 1:1-2:20 Lecturas adicionales del Brit HaJadashah: Matitiahu (Mateo) 12:26; Hillel (Lucas) 20:37; Yojanan (Juan) 8:58; Maaseh (Hechos) 7:17- 35; Ivrim (Hebreos) 11:23-27 </p><p><br></p><p><strong>SHEMOT Significa ├óÔé¼┼ôNombres├óÔé¼┬Ø&nbsp;</strong></p>','/assets/parashot/1779963711995-246358753.png','','bi-journal-text','','https://www.youtube.com/live/j7Q3bmB2iIE',1,'2026-05-21 01:24:06','2026-05-28 10:21:51'),(17,14,'Vaer├â┬í','├âÔÇ░xodo 6:2 al 9:35','Y me mostr├â┬®','<p><strong>Aliot a la Torah</strong> </p><p>1. 6:2-13 </p><p>2. 6:14-28 </p><p>3. 6:29 ├óÔé¼ÔÇ£ 7:7 </p><p>4. 7:8 ├óÔé¼ÔÇ£ 8:6 </p><p>5. 8:7-18 </p><p>6. 8:19 ├óÔé¼ÔÇ£ 9:16 </p><p>7. 9:17-35 </p><p><br></p><p><strong>8. Maftir:</strong> 9:33-35 </p><p><br></p><p><strong>Haftarah:</strong> Yejezkel (Ezequiel) 28:25 ├óÔé¼ÔÇ£ 29:21 </p><p><br></p><p><strong>Brit HaJadashah:</strong> Hillel (Lucas) 2:21 ├óÔé¼ÔÇ£ 5:1 Lecturas adicionales del Brit HaJadashah: Hechos 7:7, 17├óÔé¼ÔÇ£35; Ivrim (Hebreos) 11:23├óÔé¼ÔÇ£ 27; Romanos 9:14-17, 5:3, 12:12; 1 Corintios 3:11-15; 2 Corintios 6:14-7:1; 1 Tesalonicenses 1:10, 5:9, Hitgalut (Apocalipsis) 6:17, 7:2-3, 18:1-8.</p><p><br></p><p><strong>VAER├â┬ü Significa ├óÔé¼┼ôY Me mostr├â┬®├óÔé¼┬Ø o ├óÔé¼┼ôY Me le aparec├â┬¡├óÔé¼┬Ø.</strong>&nbsp;</p>','/assets/parashot/1779963682578-867142076.png','','bi-journal-text','','',1,'2026-05-21 01:58:37','2026-05-28 10:21:22'),(18,15,'Bo','├âÔÇ░xodo 10:1 al 13:16','Ven','<p><strong>Aliot a la Torah: </strong></p><p>1. 10:1-11 </p><p>2. 10:12-23 </p><p>3. 10:24 ├óÔé¼ÔÇ£ 11:3 </p><p>4. 11:4 ├óÔé¼ÔÇ£ 12:20 </p><p>5. 12:21-28 </p><p>6. 12:29-51 </p><p>7. 13:1-16 </p><p><br></p><p><strong>8. Maftir: </strong>13:14-16 </p><p><br></p><p><strong>Haftarah:</strong> Yermiyah (Jerem├â┬¡as) 46:13-28 </p><p><br></p><p><strong>Brit HaJadashah:</strong> Hillel (Lucas) 5:12 ├óÔé¼ÔÇ£ 7:50 Lecturas adicionales del Brit HaJadashah: Hitgalut (Apocalipsis) 8:6 - 9:21,16:1-21; Colosenses 2:16-17; 1 Corintios 5:5-8; Matityah (Mateo) 26:1 - 27:56; Yojanan (Juan) 19:1-37; Hitgalut (Apocalipsis) 5:6,9,12, 13:8, 14:4; Yojanan (Juan) 1:29, 36; Maaseh (Hechos) 20:28; Efesios 1:7; Colosenses 1:14; 1 Pedro 1:18-19; Maaseh (Hechos) 13:16-17; 2 Corintios 6:16 - 7:1; Hitgalut (Apocalipsis) 18:1-8; Hillel (Lucas) 2:22-24.</p><p><br></p><p><strong>BO Significa ├óÔé¼┼ôVen├óÔé¼┬Ø</strong></p>','/assets/parashot/1779963540225-595123708.jpg','','bi-journal-text','','https://www.youtube.com/watch?v=qHNHFWzYhv0',1,'2026-05-21 02:15:24','2026-05-28 10:19:00'),(19,16,'Beshalaj','├âÔÇ░xodo 13:17 al 17:16','Cuando dej├â┬│ ir','<p><strong>Aliot a la Torah </strong></p><p>1. 13:17 ├óÔé¼ÔÇ£ 14:8 </p><p>2. 14:9-25 </p><p>3. 14:26 ├óÔé¼ÔÇ£ 15:26 </p><p>4. 15:27 ├óÔé¼ÔÇ£ 16:10 </p><p>5. 16:11-29 </p><p>6. 16:30-36 </p><p>7. 17:1-16 </p><p><br></p><p><strong>8. Maftir:</strong> 17:14-16 </p><p><br></p><p><strong>Haftarah: </strong>Shoftim (Jueces) 5:1-31 </p><p><br></p><p><strong>Brit HaJadashah: </strong>Hillel (Lucas) 8:1 ├óÔé¼ÔÇ£ 9:62 Lecturas adicionales del Brit HaJadashah: Romanos 9:15├óÔé¼ÔÇ£23; Maaseh (Hechos) 7:36; Ivrim (Hebreos) 11:29; Hitgalut (Apocalipsis) 15:1-4; Yojanan (Juan) 6:25-58; Hitgalut (Apocalipsis) 2:17; 1 Corintios 10:1-13. </p><p><br></p><p><strong>BESHALAJ Significa ├óÔé¼┼ôCuando dej├â┬│ ir├óÔé¼┬Ø</strong></p>','/assets/parashot/1779963524692-235223649.jpg','','bi-journal-text','','https://www.youtube.com/watch?v=QLv997JJCjM',1,'2026-05-21 02:19:44','2026-05-28 10:18:44'),(20,17,'Itro','├âÔÇ░xodo 18:1 al 20:23','Jetro','<p><strong>Aliot a la Torah: </strong></p><p><br></p><p>1. 18:1-12 </p><p>2. 18:13-23 </p><p>3. 18:24-27 </p><p>4. 19:1-6 </p><p>5. 19:7-19 </p><p>6. 19:20 ├óÔé¼ÔÇ£ 20:14 </p><p>7. 20:15-23 </p><p><br></p><p><strong>8. Maftir:</strong> 20:19-23 </p><p><br></p><p><strong>Haftarah:</strong> Yeshaiahu (Isa├â┬¡as) 6:1-13 </p><p><br></p><p><strong>Brit HaJadashah:</strong> Hillel (Lucas) 10:1 ├óÔé¼ÔÇ£ 11:54 Lecturas adicionales del Brit HaJadashah: Efesios 4:11-13; Tito 1:5; 1 Timoteo 3:1-13; Hitgalut (Apocalipsis) 19:6-9; 2 Corintios 11:2; Kefa ├â┬ülef (1 Pedro) 2:9-10; Ivrim (Hebreos) 12:18-29; Matitiahu (Mateo) 5:17-19; 19:16- 30; Yojanan (Juan) 14:15; Romanos 7:7-12, 13:8-10; Yaakov (Santiago) 2:8-13; Yojanan ├â┬ülef (1 Juan) 2:3-6; 3:4-10</p><p><br></p><p><strong>Itro suegro de Moises</strong></p>','/assets/parashot/1779963508803-480871648.jpg','','bi-journal-text','','https://www.youtube.com/watch?v=ezHNXMp-FdU',1,'2026-05-21 02:39:17','2026-05-28 10:18:28'),(21,18,'Mishpatim','├âÔÇ░xodo 21:1 al 24:18','Preseptos','<p><strong>Aliot a la Torah: </strong></p><p><br></p><p>1. 21:1-19 </p><p>2. 21:20-22:3 </p><p>3. 22:4-26 </p><p>4. 22:27-23:5</p><p>5. 23:6-19 </p><p>6. 23:20-25 </p><p>7. 23:26-24:18 </p><p><br></p><p><strong>8. Maftir: </strong>24:15-18 </p><p><br></p><p><strong>Haftarah:</strong> Yermeiahu (Jerem├â┬¡as) 34:8-22; 33:25-26. </p><p><br></p><p><strong>Brit HaJadashah: </strong>Hillel (Lucas) 12:1-14:35 </p><p><br></p><p><strong>Lecturas adicionales del Brit HaJadash├â┬íh: </strong>Ivrim (Hebreos) 10:28-31; Matitiahu (Mateo) 5:38-42, 26:52; Hillel (Lucas) 19:8, 6:35; Hitgalut (Apocalipsis) 22:15; Yaakov (Santiago) 1:27; Efesios 4:25; Hitgalut (Apocalipsis) 12:10; Yaakov (Santiago) 2:5-6; 1 Tesalonicenses 5:22; 1 Corintios 5:7├óÔé¼ÔÇ£8; G├â┬ílatas 5:20-21; Matitiahu (Mateo) 12:37; Hillel (Lucas) 6:45; Efesios 4:22, 25, 29; Yaakov (Santiago) 3:2-12; Maaseh (Hechos) 2:1, 20:16; 1 Corintios 16:8; Yojanan (Juan) 7:37; Maaseh (Hechos) 7:38; Ivrim (Hebreos) 12:25; 2 Corintios 6:14-17; Efesios 1:7; Colosenses 1:20; Ivrim (Hebreos) 8:7-13, 9:15-22, 12:24, 13:20; Kefa ├â┬ülef (1 Pedro) 1:2,19; 1 Timoteo 6:16; Hitgalut (Apocalipsis) 4:2-6; Matitiahu (Mateo) 17:5; Maaseh (Hechos) 1:9 </p><p><br></p><p><strong>MISHPATIM Significa ├óÔé¼┼ôReglamentos, Ordenanzas o Preceptos\"</strong></p><p><br></p>','/assets/parashot/1780011460960-906690417.jpg','','bi-journal-text','','https://www.youtube.com/watch?v=qdFza0NqyQA&list=PL_OwekzPzSlTm170B0XJYuAtMu5OhivuE&index=3',1,'2026-05-28 23:37:40','2026-05-28 23:37:40'),(22,19,'Terumah','├âÔÇ░xodo 25:1 al 27:19','Ofrenda elevada','<p><strong>Aliot de la Tor├â┬íh: </strong></p><p><br></p><p>1. 25:1-16 </p><p>2. 25:17-30 </p><p>3. 25:31-26:14 </p><p>4. 26:15-30 </p><p>5. 26:31-37 </p><p>6. 27:1-8 </p><p>7. 27:9-19 </p><p><br></p><p><strong>8. Maftir:</strong> 27:17-19 </p><p><br></p><p><strong>Haftarah:</strong> 1 Reyes 5:26-6:13 </p><p><br></p><p><strong>Brit HaJadashah: </strong>Ivrim (Hebreos) 8:1-6; 9:23-24; 10:1 Lecturas adicionales del Brit HaJadash├â┬íh: Matitiahu (Mateo) 5:14-16; 1 Corintios 3:16; 2 Corintios 6:16, 8:12; Efesios 2:20-22; Ivrim (Hebreos) 4:16, 8:1-6, 9:1-27, 10:1, 19-22, 13:10-12; Hitgalut (Apocalipsis) 1:12, 20, 4:5, 11:19, 21:3. </p><p><br></p><p><strong>TERUMAH Significa ├óÔé¼┼ôOfrenda Alzada, Porci├â┬│n Separada├óÔé¼┬Ø</strong></p>','/assets/parashot/1780322402404-953219958.png','','bi-journal-text','','https://www.youtube.com/watch?v=d5Zvxts6Kdc&t=4s',1,'2026-06-01 14:00:02','2026-06-01 14:11:32'),(23,20,'Tetzaveh','├âÔÇ░xodo 27:20 al 30:10','Mandar├â┬ís','<p><strong>Aliot de la Torah: </strong></p><p><br></p><p>1. 27:20-28:12 </p><p>2. 28:13-30 </p><p>3. 28:31-43 </p><p>4. 29:1-18 </p><p>5. 29:19-37 </p><p>6. 29:38-46 </p><p>7. 30:1-10 </p><p><br></p><p><strong>8. Maftir:</strong> 30:8-10 </p><p><br></p><p><strong>Haftarah:</strong> Yejezkel (Ezequiel) 43:10-27 </p><p><br></p><p><strong>Brit HaJadashah:</strong> Hillel (Lucas) 18:15-20:26 Lecturas adicionales del Brit HaJadashah: Hitgalut (Apocalipsis) 11:4; Ivrim (Hebreos) 5:1-10, 7:26, 12:14; 1 Pedro 1:15-16, 2:9; Hitgalut (Apocalipsis) 5:9-10; Yojanan (Juan) 1:29; Ivrim (Hebreos) 7:27; 1 Pedro 1:19; Romanos 12:1; 1 Corintios 15:31; Ivrim (Hebreos) 13:10-17; Hitgalut (Apocalipsis) 8:3 </p><p><br></p><p><strong>TETZAVEH Significa ├óÔé¼┼ôOrdenar├â┬ís o Mandar├â┬ís├óÔé¼┬Ø</strong></p>','/assets/parashot/1780322546741-444926158.png','','bi-journal-text','','https://www.youtube.com/watch?v=DeRRlujJ2AQ',1,'2026-06-01 14:02:26','2026-06-01 14:09:30'),(24,21,'Ki Tisa','├âÔÇ░xodo 30:11 al 34:35','Cuenado hagas un censo','<p><strong>Aliot de la Torah: </strong></p><p><br></p><p>1. 30:11 - 31:17 </p><p>2. 31:18 - 33:11 </p><p>3. 33:12-16 </p><p>4. 33:17-23 </p><p>5. 34:1-9 </p><p>6. 34:10-26 </p><p>7. 34:27-35 </p><p><br></p><p><strong>8. Maftir: </strong>34:33-35 </p><p><br></p><p><strong>Haftarah:</strong> Melakhim ├â┬ülef (1 Reyes) 18:20-39 </p><p><br></p><p><strong>Brit HaJadashah: </strong>Hillel (Lucas) 20:27 ├óÔé¼ÔÇ£ 22:46 Lecturas adicionales del Brit HaJadashah: Tito 3:5; Yojanan ├â┬ülef (1 Juan) 1:7, Yojanan (Juan) 13:4-15; 1 Corintios 6:9-11; Ivrim (Hebreos) 10:22; Hitgalut (Apocalipsis) 1:5-6; 1 Corintios 1:21-22; Yojanan ├â┬ülef (1 Juan) 1:20,27; 1 Corintios 12:1-31; Ivrim (Hebreos) 4:9; 2 Corintios 3:1-18; Maaseh (Hechos) 7:39-42, 17:29-31; 1 Corintios 10:1-13; Kefa Bet (2 Pedro) 3:3-4; 2 Corintios 6:14-7:1; Hitgalut (Apocalipsis) 3:5, 17:8, 21:27, 22:19; Matitiahu (Mateo) 11:28; Romanos 9:19; Yojanan (Juan) 1:18; 1 Timoteo 6:16; 2 Corintios 3:13-18, 6:14-16; 1 Corintios 5:8; Maaseh (Hechos) 2:1, 20:16; 1 Corintios 16:8; Yojanan (Juan) 17:1-2. </p><p><br></p><p><strong>KI TIS├â┬ü Significa ├óÔé¼┼ôCuando hagas un censo├óÔé¼┬Ø</strong></p>','/assets/parashot/1780322925985-581376289.jpg','','bi-journal-text','','https://www.youtube.com/live/pdGiMJKa6_s',1,'2026-06-01 14:08:45','2026-06-01 14:08:45'),(25,22,'Vayak\'hel','├ëxodo 35:1 al 38:20','El congreg├│','<p><strong>Aliyot de la Tor├â┬íh - VaYakhel </strong></p><p><br></p><p>1. 35:1-20 </p><p>2. 35:21-29 </p><p>3. 35:30 ├óÔé¼ÔÇ£ 36:7 </p><p>4. 36:8-19 </p><p>5. 36:20 ├óÔé¼ÔÇ£ 37:16 </p><p>6. 37:17-29 </p><p>7. 38:1-20 </p><p><br></p><p><strong>8. Maftir:</strong> 38:18-20 </p><p><br></p><p><strong>Haftar├â┬íh:</strong> Melajim ├â┬ülef (1 Reyes) 7:13-26 </p><p><br></p><p><strong>Brit HaJadashah: </strong>Lucas (Hillel) 22:47 - 24:53 Lecturas adicionales del Brit HaJadashah: Ivrim (Hebreos) 10:26-31; 2 Corintios 9:1-15; 1 Corintios 3:9-17, 12:4; Yaakov (Santiago) 1:17; Ivrim (Hebreos) 8:1-5, 9:1-28. </p><p><br></p><p><strong>VAIAKEHEL Significa ├óÔé¼┼ôCongreg├â┬│├óÔé¼┬Ø</strong></p>','/assets/parashot/1780323648680-622333138.png','','bi-journal-text','','https://www.youtube.com/live/BBUcrxgMjIQ',1,'2026-06-01 14:20:48','2026-06-19 14:52:10');
/*!40000 ALTER TABLE `parashot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `portfolio`
--

DROP TABLE IF EXISTS `portfolio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `portfolio` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `portfolio`
--

LOCK TABLES `portfolio` WRITE;
/*!40000 ALTER TABLE `portfolio` DISABLE KEYS */;
INSERT INTO `portfolio` VALUES (1,'Rosh Jodesh Mes 3','Mes Tercero','filter-app','/uploads/portfolio/1778596426490-462990542.png',1,'Comienzo del mes tercero','<p>Comienza el mes tercero segun la obserbancia de las lumbreras del cielo, como esta instruido en la Torha</p><p><br></p>','2026-05-16','/uploads/portfolio/1778596426490-462990542.png','2026-02-18 15:33:08','2026-06-01 14:35:22'),(2,'Shavuot','Fiesta de las Semanas','filter-app','/uploads/portfolio/1779969163919-366739135.png',1,'Lev├â┬¡ticos 23:17','<h1>├âÔÇ░xodo 34:22</h1><p><strong>22 </strong>Tambi├â┬®n celebrar├â┬ís la fiesta de las semanas, la de las primicias de la siega del trigo, y la fiesta de la cosecha a la salida del a├â┬▒o.</p><p><br></p><h1>Lev├â┬¡tico 23:15-21</h1><p><strong>15 </strong>Y contar├â┬®is desde el d├â┬¡a que sigue al d├â┬¡a de reposo, desde el d├â┬¡a en que ofrecisteis la gavilla de la ofrenda mecida; siete semanas cumplidas ser├â┬ín. <strong>16 </strong>Hasta el d├â┬¡a siguiente del s├â┬®ptimo d├â┬¡a de reposo contar├â┬®is cincuenta d├â┬¡as; entonces ofrecer├â┬®is el nuevo grano a YHWH. <strong>17 </strong>De vuestras habitaciones traer├â┬®is dos panes para ofrenda mecida, que ser├â┬ín de dos d├â┬®cimas de efa de flor de harina, cocidos con levadura, como primicias para Jehov├â┬í. <strong>18 </strong>Y ofrecer├â┬®is con el pan siete corderos de un a├â┬▒o, sin defecto, un becerro de la vacada, y dos carneros; ser├â┬ín holocausto a YHWH, con su ofrenda y sus libaciones, ofrenda encendida de olor grato para Jehov├â┬í. <strong>19 </strong>Ofrecer├â┬®is adem├â┬ís un macho cabr├â┬¡o por expiaci├â┬│n, y dos corderos de un a├â┬▒o en sacrificio de ofrenda de paz. <strong>20 </strong>Y el sacerdote los presentar├â┬í como ofrenda mecida delante de YHWH, con el pan de las primicias y los dos corderos; ser├â┬ín cosa sagrada a Jehov├â┬í para el sacerdote. <strong>21 </strong>Y convocar├â┬®is en este mismo d├â┬¡a santa convocaci├â┬│n; ning├â┬║n trabajo de siervos har├â┬®is; estatuto perpetuo en dondequiera que habit├â┬®is por vuestras generaciones.</p><p><br></p><h1>N├â┬║meros 28:26</h1><p><strong>26 </strong>Adem├â┬ís, el d├â┬¡a de las primicias, cuando present├â┬®is ofrenda nueva a YHWH en vuestras semanas, tendr├â┬®is santa convocaci├â┬│n; ninguna obra de siervos har├â┬®is.</p><p><br></p><h1>Deuteronomio 16:9-10</h1><p><strong>9 </strong>Siete semanas contar├â┬ís; desde que comenzare a meterse la hoz en las mieses comenzar├â┬ís a contar las siete semanas. <strong>10 </strong>Y har├â┬ís la fiesta solemne de las semanas a YHWH tu Dios; de la abundancia voluntaria de tu mano ser├â┬í lo que dieres, seg├â┬║n YHWH tu Dios te hubiere bendecido.</p><p><br></p><h1>Hechos 2:1-4</h1><h3><strong>La venida del Esp├â┬¡ritu Santo</strong></h3><p><strong>2 </strong>Cuando lleg├â┬│ el d├â┬¡a de Pentecost├â┬®s, estaban todos un├â┬ínimes juntos. <strong>2 </strong>Y de repente vino del cielo un estruendo como de un viento recio que soplaba, el cual llen├â┬│ toda la casa donde estaban sentados; <strong>3 </strong>y se les aparecieron lenguas repartidas, como de fuego, asent├â┬índose sobre cada uno de ellos. <strong>4 </strong>Y fueron todos llenos del Esp├â┬¡ritu Santo, y comenzaron a hablar en otras lenguas, seg├â┬║n el Esp├â┬¡ritu les daba que hablasen.</p><p><br></p><p><br></p>','2026-05-24','/uploads/portfolio/1779969163919-366739135.png','2026-05-15 13:34:32','2026-05-28 11:52:43'),(3,'Rosh Jodesh Mes 4','Comienzo del mes Cuarto','filter-app','/uploads/portfolio/1780324452480-841690316.png',1,'','<p><br></p>','2026-06-15','/uploads/portfolio/1780324452480-841690316.png','2026-06-01 14:34:12','2026-06-01 14:34:43');
/*!40000 ALTER TABLE `portfolio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pricing`
--

DROP TABLE IF EXISTS `pricing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pricing` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` varchar(50) DEFAULT NULL,
  `featured` tinyint(1) DEFAULT 0,
  `features` text DEFAULT NULL,
  `na_features` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pricing`
--

LOCK TABLES `pricing` WRITE;
/*!40000 ALTER TABLE `pricing` DISABLE KEYS */;
INSERT INTO `pricing` VALUES (1,'Free Plan','0',0,'Feature 1,Feature 2','Feature 3','2026-02-18 15:33:08');
/*!40000 ALTER TABLE `pricing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `section_permissions`
--

DROP TABLE IF EXISTS `section_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `section_permissions` (
  `section_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`section_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `section_permissions_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `dynamic_sections` (`id`) ON DELETE CASCADE,
  CONSTRAINT `section_permissions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `section_permissions`
--

LOCK TABLES `section_permissions` WRITE;
/*!40000 ALTER TABLE `section_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `section_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sections`
--

DROP TABLE IF EXISTS `sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page` varchar(50) DEFAULT 'home',
  `section_name` varchar(100) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `subtitle` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `section_name` (`section_name`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sections`
--

LOCK TABLES `sections` WRITE;
/*!40000 ALTER TABLE `sections` DISABLE KEYS */;
INSERT INTO `sections` VALUES (1,'home','Hero','Hablemos de YHWH','Descubre las ra├â┬¡ces hebreas de tu fe','Contenido descriptivo aqu├â┬¡...','https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=1920','2026-05-12 10:52:20'),(2,'home','Calendario','Calendario Lunisolar','Sigue los tiempos se├â┬▒alados','Informaci├â┬│n sobre el calendario...',NULL,'2026-02-18 11:47:23'),(3,'home','About','Sobre Nosotros','Nuestra historia y valores','Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',NULL,'2026-02-18 11:47:23'),(9,'home','Footer','Hablemos de YHWH','Nuestro objetivo es el estudio de las ra├â┬Øces hebreas.','Estudio profundo de las escrituras.',NULL,'2026-05-12 11:58:34');
/*!40000 ALTER TABLE `sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `site_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` enum('text','textarea','email','url','image') DEFAULT 'text',
  `setting_group` varchar(50) DEFAULT 'general',
  `label` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=219 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES (1,'site_name','Hablemos de YHWH','text','general','Nombre del Sitio','2026-05-12 10:13:03'),(2,'contact_address','Caucete, San Juan, Argentina','text','contact','Direcci??n','2026-05-12 13:52:13'),(3,'contact_phone','+549 264 5758367','text','contact','Tel??fono','2026-05-12 13:52:13'),(4,'contact_email','hablemosdeyhwh2024@gmail.com','email','contact','Email','2026-05-12 13:52:13'),(5,'social_youtube','https://www.youtube.com/@hablemosdeYHWH','url','social','Canal de YouTube','2026-05-12 13:52:13'),(6,'social_facebook','https://www.facebook.com/hablemos.yhwh/','url','social','Facebook','2026-05-12 13:52:13'),(7,'social_instagram','https://www.instagram.com/hablemosyhwh/','url','social','Instagram','2026-05-12 13:52:13'),(8,'social_whatsapp','https://chat.whatsapp.com/IAiMKUyvdjYC94r2LbeL8P','url','social','WhatsApp','2026-05-12 13:52:13');
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team`
--

DROP TABLE IF EXISTS `team`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `team` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team`
--

LOCK TABLES `team` WRITE;
/*!40000 ALTER TABLE `team` DISABLE KEYS */;
INSERT INTO `team` VALUES (1,'Marcelo Wingeyer','Moreh  ├ù┼¥├ùÔÇó├ù┬¿├ùÔÇØ','','/uploads/team/1778597286773-301692308.png','2026-02-18 15:33:08'),(2,'Ivana Orme├â┬▒o','Morah   ├ù┼¥├ùÔÇó├ù┬¿├ùÔÇØ','','/uploads/team/1778597981589-654668347.png','2026-05-12 14:59:41');
/*!40000 ALTER TABLE `team` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `testimonials`
--

DROP TABLE IF EXISTS `testimonials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `testimonials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `role` varchar(100) DEFAULT NULL,
  `text` text DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `testimonials`
--

LOCK TABLES `testimonials` WRITE;
/*!40000 ALTER TABLE `testimonials` DISABLE KEYS */;
/*!40000 ALTER TABLE `testimonials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` enum('admin','editor') DEFAULT 'editor',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$YrP6H0h8gTO433CO4mg/NuWhXjpfJpdHoHtpnasBohWLrFYVdx2YW',NULL,'admin','2026-02-18 11:47:23'),(2,'editor','$2b$10$YrP6H0h8gTO433CO4mg/NuWhXjpfJpdHoHtpnasBohWLrFYVdx2YW',NULL,'editor','2026-02-18 11:47:23');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-19 12:16:53
