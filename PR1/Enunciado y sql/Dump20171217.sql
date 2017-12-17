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
  PRIMARY KEY (`id_respuesta`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answers`
--

LOCK TABLES `answers` WRITE;
/*!40000 ALTER TABLE `answers` DISABLE KEYS */;
INSERT INTO `answers` VALUES (1,2,'Macarrones'),(2,2,'Albondigas'),(3,2,'Lentejas'),(4,2,'Estofado'),(7,1,'Ps4'),(13,6,'respuesta1'),(14,6,'respuesta2'),(15,6,'respuesta3'),(16,6,'respuesta4'),(17,6,'mi respuesta');
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
  PRIMARY KEY (`id_userAnswer`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answersforme`
--

LOCK TABLES `answersforme` WRITE;
/*!40000 ALTER TABLE `answersforme` DISABLE KEYS */;
INSERT INTO `answersforme` VALUES (10,'jaime@ucm.es',2,1),(11,'jaime@ucm.es',1,7),(12,'jaime@ucm.es',3,9),(13,'jaime@ucm.es',6,17);
/*!40000 ALTER TABLE `answersforme` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `answersforothers`
--

DROP TABLE IF EXISTS `answersforothers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `answersforothers` (
  `id_answer` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_friend` int(11) NOT NULL,
  `id_pregunta` int(11) NOT NULL,
  `id_respuesta` int(11) NOT NULL
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
  `state` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friends`
--

LOCK TABLES `friends` WRITE;
/*!40000 ALTER TABLE `friends` DISABLE KEYS */;
INSERT INTO `friends` VALUES ('alberto@ucm.es','julian@ucm.es','aceptada'),('alberto@ucm.es','monica@ucm.es','aceptada'),('alberto@ucm.es','rosario@ucm.es','aceptada'),('jaime@ucm.es','julian@ucm.es','aceptada'),('jaime@ucm.es','rosario@ucm.es','aceptada'),('jaime@ucm.es','ruben@ucm.es','aceptada'),('julian@ucm.es','alberto@ucm.es','aceptada'),('julian@ucm.es','jaime@ucm.es','aceptada'),('julian@ucm.es','monica@ucm.es','aceptada'),('monica@ucm.es','alberto@ucm.es','aceptada'),('monica@ucm.es','jaime@ucm.es','aceptada'),('monica@ucm.es','julian@ucm.es','aceptada'),('monica@ucm.es','usuario@ucm.es','aceptada'),('rosario@ucm.es','alberto@ucm.es','aceptada'),('ruben@ucm.es','jaime@ucm.es','aceptada'),('ruben@ucm.es','usuario@ucm.es','aceptada'),('usuario@ucm.es','monica@ucm.es','aceptada'),('usuario@ucm.es','ruben@ucm.es','aceptada');
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
  `preguntas` varchar(50) NOT NULL,
  PRIMARY KEY (`id_pregunta`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (0,'¿Cual es la peor pelicula de la historia?'),(1,'¿Nintendo Switch, Ps4 o Xbox One?'),(2,'¿Cual es tu plato favorito?'),(6,'Pregunta');
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
INSERT INTO `sessions` VALUES ('QGqdvMSauMJJHt3b_K5n7y0HvcmkpbZe',1513612097,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"currentUser\":\"jaime@ucm.es\"}');
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
  `puntuacion` int(11) DEFAULT NULL,
  `fechaNacimiento` varchar(30) DEFAULT NULL,
  `nombre` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('alberto@ucm.es','mipass','/profile_imgs/Marshmallow Man-01.png','Masculino',24,'02/12/1995','Alberto Camino'),('jaime@ucm.es','mipass','/profile_imgs/Jack-o-lantern-01.png','Masculino',31,'05/15/1996','Jaime Tamames'),('julian@ucm.es','mipass','/profile_imgs/Jack-o-lantern-01.png','Masculino',45,'02/12/1997','Julian Rodriguez'),('monica@ucm.es','mipass','/profile_imgs/Jack-o-lantern-01.png','Femenino',10,'05/15/1996','Monica Moran'),('paula@ucm.es','mipass','/profile_imgs/Jack-o-lantern-01.png','Femenino',30,'02/12/2003','Paula Lopez'),('rosario@ucm.es','mipass','/profile_imgs/Vampire Bat-01.png','Femenino',53,'02/12/1986','Rosario Cabanas'),('ruben@ucm.es','mipass','/profile_imgs/Jack-o-lantern-01.png','Masculino',0,'05/15/1996','Ruben Barrado González'),('usuario@ucm.es','mipass','/profile_imgs/Jack-o-lantern-01.png','Masculino',55,'10/11/1963','Usuario');
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

-- Dump completed on 2017-12-17 16:52:58
