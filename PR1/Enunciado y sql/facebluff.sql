
-- MySQL dump 10.13  Distrib 5.7.17, for macos10.12 (x86_64)
--
-- Host: localhost    Database: facebluff
-- ------------------------------------------------------
-- Server version	5.7.20

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `answers`
--

DROP TABLE IF EXISTS `answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `answers` (
  `id_respuesta` int(11) NOT NULL AUTO_INCREMENT,
  `id_pregunta` int(11) NOT NULL,
  `respuesta` varchar(50) NOT NULL,
  PRIMARY KEY (`id_respuesta`),
  KEY `id_pregunta_fk_answers_idx` (`id_pregunta`),
  CONSTRAINT `id_pregunta_fk_answers` FOREIGN KEY (`id_pregunta`) REFERENCES `questions` (`id_pregunta`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answers`
--

LOCK TABLES `answers` WRITE;
/*!40000 ALTER TABLE `answers` DISABLE KEYS */;
INSERT INTO `answers` VALUES (4,1,'Invierno'),(5,1,'Verano'),(6,1,'Otoño'),(7,1,'Primavera'),(8,2,'Carne'),(9,2,'Pescado'),(10,3,'Ps4'),(11,3,'Xbox One'),(12,3,'Nintendo Switch'),(13,4,'Windows'),(14,4,'Linux'),(15,5,'Playa'),(16,5,' Montaña'),(17,5,' Campo'),(18,5,' Ciudad'),(19,6,'Perro'),(20,6,' Gato'),(21,6,' Caballo'),(22,6,' Pájaro'),(23,6,' Tortuga'),(24,6,' Cebra'),(25,7,'Si'),(26,7,' No'),(27,7,' No lo se'),(28,5,'En una isla'),(29,2,'Verduras'),(30,2,'Marisco');
/*!40000 ALTER TABLE `answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `answersforme`
--

DROP TABLE IF EXISTS `answersforme`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `answersforme` (
  `id_userAnswer` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` varchar(100) NOT NULL,
  `id_pregunta` int(11) NOT NULL,
  `id_respuesta` int(11) NOT NULL,
  PRIMARY KEY (`id_userAnswer`),
  KEY `id_user_fk_answersforme_idx` (`id_user`),
  KEY `id_pregunta_fk_answersforme_idx` (`id_pregunta`),
  KEY `id_respuesta_fk_answersforme_idx` (`id_respuesta`),
  CONSTRAINT `id_pregunta_fk_answersforme` FOREIGN KEY (`id_pregunta`) REFERENCES `questions` (`id_pregunta`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `id_respuesta_fk_answersforme` FOREIGN KEY (`id_respuesta`) REFERENCES `answers` (`id_respuesta`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `id_user_fk_answersforme` FOREIGN KEY (`id_user`) REFERENCES `user` (`email`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answersforme`
--

LOCK TABLES `answersforme` WRITE;
/*!40000 ALTER TABLE `answersforme` DISABLE KEYS */;
INSERT INTO `answersforme` VALUES (1,'jaime@ucm.es',3,10),(2,'jaime@ucm.es',4,13),(3,'paula@ucm.es',3,10),(4,'paula@ucm.es',7,25),(5,'paula@ucm.es',5,28),(6,'ruben@ucm.es',3,12),(7,'ruben@ucm.es',1,5),(8,'ruben@ucm.es',2,29),(9,'julio@ucm.es',4,13),(10,'julio@ucm.es',1,5),(11,'julio@ucm.es',7,26),(12,'maria@ucm.es',1,6),(13,'maria@ucm.es',5,16),(14,'maria@ucm.es',2,30),(15,'alberto@ucm.es',6,24),(16,'alberto@ucm.es',1,6),(17,'alberto@ucm.es',5,17),(18,'alberto@ucm.es',4,14),(19,'laura@ucm.es',5,17),(20,'laura@ucm.es',7,25),(21,'laura@ucm.es',2,29),(22,'laura@ucm.es',3,12),(23,'laura@ucm.es',6,21),(24,'alberto@ucm.es',3,12);
/*!40000 ALTER TABLE `answersforme` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `answersforothers`
--

DROP TABLE IF EXISTS `answersforothers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `answersforothers` (
  `id_answer` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` varchar(100) NOT NULL,
  `id_friend` varchar(100) NOT NULL,
  `id_pregunta` int(11) NOT NULL,
  `id_respuesta` int(11) NOT NULL,
  PRIMARY KEY (`id_answer`),
  KEY `id_user_fk_answersforothers_idx` (`id_user`),
  KEY `id_friendr_fk_answersforothers_idx` (`id_friend`),
  KEY `id_pregunta_fk_answersforothers_idx` (`id_pregunta`),
  KEY `id_respuesta_fk_answersforothers_idx` (`id_respuesta`),
  CONSTRAINT `id_friend_fk_answersforothers` FOREIGN KEY (`id_friend`) REFERENCES `user` (`email`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `id_pregunta_fk_answersforothers` FOREIGN KEY (`id_pregunta`) REFERENCES `questions` (`id_pregunta`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `id_respuesta_fk_answersforothers` FOREIGN KEY (`id_respuesta`) REFERENCES `answers` (`id_respuesta`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `id_user_fk_answersforothers` FOREIGN KEY (`id_user`) REFERENCES `user` (`email`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answersforothers`
--

LOCK TABLES `answersforothers` WRITE;
/*!40000 ALTER TABLE `answersforothers` DISABLE KEYS */;
/*!40000 ALTER TABLE `answersforothers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `friends`
--

DROP TABLE IF EXISTS `friends`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `friends` (
  `user` varchar(100) NOT NULL,
  `friend` varchar(100) NOT NULL,
  `state` varchar(20) NOT NULL,
  KEY `id_user_fk_friends_idx` (`user`),
  KEY `id_friend_fk_friends_idx` (`friend`),
  CONSTRAINT `id_friend_fk_friends` FOREIGN KEY (`friend`) REFERENCES `user` (`email`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `id_user_fk_friends` FOREIGN KEY (`user`) REFERENCES `user` (`email`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friends`
--

LOCK TABLES `friends` WRITE;
/*!40000 ALTER TABLE `friends` DISABLE KEYS */;
INSERT INTO `friends` VALUES ('laura@ucm.es','alberto@ucm.es','aceptada'),('laura@ucm.es','paula@ucm.es','aceptada'),('laura@ucm.es','miguel@ucm.es','aceptada'),('alberto@ucm.es','laura@ucm.es','aceptada'),('alberto@ucm.es','paula@ucm.es','aceptada'),('alberto@ucm.es','jaime@ucm.es','aceptada'),('paula@ucm.es','laura@ucm.es','aceptada'),('paula@ucm.es','alberto@ucm.es','aceptada'),('paula@ucm.es','jaime@ucm.es','aceptada'),('jaime@ucm.es','alberto@ucm.es','aceptada'),('jaime@ucm.es','paula@ucm.es','aceptada'),('jaime@ucm.es','ruben@ucm.es','aceptada'),('ruben@ucm.es','jaime@ucm.es','aceptada'),('ruben@ucm.es','julio@ucm.es','aceptada'),('ruben@ucm.es','miguel@ucm.es','aceptada'),('julio@ucm.es','ruben@ucm.es','aceptada'),('julio@ucm.es','maria@ucm.es','aceptada'),('maria@ucm.es','julio@ucm.es','aceptada'),('miguel@ucm.es','ruben@ucm.es','aceptada'),('miguel@ucm.es','laura@ucm.es','aceptada'),('julio@ucm.es','miguel@ucm.es','aceptada'),('miguel@ucm.es','julio@ucm.es','aceptada');
/*!40000 ALTER TABLE `friends` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `questions` (
  `id_pregunta` int(11) NOT NULL AUTO_INCREMENT,
  `preguntas` varchar(100) NOT NULL,
  PRIMARY KEY (`id_pregunta`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,'¿Verano, primavera, otoño o invierno?'),(2,'¿Carne, percado o verduras?'),(3,'¿Ps4, Xbox One o Nintendo Switch?'),(4,'¿Windows o Linux?'),(5,'¿Donde prefieres veranear?'),(6,'¿Que animal prefieres?'),(7,'¿Crees que hay vide extraterrestre?');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('bx6rxHk3fM3wr_owLGrU92864ucD4FRQ',1513637251,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"UserMail\":\"miguel@ucm.es\",\"UserImg\":\"/profile_imgs/Zombie PVZ-01.png\",\"UserSex\":\"Masculino\",\"UserPoints\":0,\"UserDate\":\"07/30/1983\",\"UserAge\":34,\"UserName\":\"Miguel UCM\"}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `img` varchar(100) DEFAULT NULL,
  `sexo` varchar(50) DEFAULT NULL,
  `puntuacion` int(11) NOT NULL,
  `fechaNacimiento` varchar(30) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('alberto@ucm.es','mipass','/profile_imgs/Grim Reaper-01.png','Masculino',0,'03/12/1995','Alberto UCM'),('jaime@ucm.es','mipass','/profile_imgs/Diablo-01.png','Masculino',0,'09/13/1992','Jaime UCM'),('julio@ucm.es','mipass','/profile_imgs/Vampire Bat-01.png','Masculino',0,'04/21/1987','Julio UCM'),('laura@ucm.es','mipass','/profile_imgs/Hannibal-01.png','Femenino',0,'06/13/1998','Laura UCM'),('maria@ucm.es','mipass','/profile_imgs/Fatso-01.png','Femenino',0,'05/14/1990','Maria UCM'),('miguel@ucm.es','mipass','/profile_imgs/Zombie PVZ-01.png','Masculino',0,'07/30/1983','Miguel UCM'),('paula@ucm.es','mipass','/profile_imgs/Hannibal-01.png','Femenino',0,'01/23/1998','Paula UCM'),('ruben@ucm.es','mipass','/profile_imgs/Mummy-01.png','Masculino',0,'01/25/1993','Ruben UCM');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

