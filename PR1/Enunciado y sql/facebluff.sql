-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 15-12-2017 a las 00:17:11
-- Versión del servidor: 10.1.28-MariaDB
-- Versión de PHP: 5.6.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `facebluff`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `friends`
--

CREATE TABLE `friends` (
  `user` varchar(100) NOT NULL,
  `friend` varchar(100) NOT NULL,
  `state` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `questions`
--

CREATE TABLE `facebluff`.`questions` (
  `idQuestions` INT NOT NULL AUTO_INCREMENT,
  `pregunta` VARCHAR(100) NOT NULL,
  `respuesta1` VARCHAR(45) NOT NULL,
  `respuesta2` VARCHAR(45) NOT NULL,
  `respuesta3` VARCHAR(45) NOT NULL,
  `respuesta4` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idQuestions`, `pregunta`));
  
  --
-- Estructura de tabla para la tabla `answers`
--
  
  CREATE TABLE `facebluff`.`answers` (
  `idAnswers` INT NOT NULL AUTO_INCREMENT,
  `user` VARCHAR(45) NOT NULL,
  `idQuestion` INT NOT NULL,
  `respuesta` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idAnswers`),
  INDEX `user_idx` (`user` ASC),
  INDEX `idQuestions_idx` (`idQuestion` ASC),
  CONSTRAINT `user`
    FOREIGN KEY (`user`)
    REFERENCES `facebluff`.`user` (`email`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `idQuestions`
    FOREIGN KEY (`idQuestion`)
    REFERENCES `facebluff`.`questions` (`idQuestions`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);



--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `img` varchar(100) DEFAULT NULL,
  `sexo` varchar(50) DEFAULT NULL,
  `puntuacion` int(11) DEFAULT NULL,
  `fechaNacimiento` varchar(30) DEFAULT NULL,
  `nombre` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `user`
--

INSERT INTO `user` (`email`, `password`, `img`, `sexo`, `puntuacion`, `fechaNacimiento`, `nombre`) VALUES
('alberto@ucm.es', 'mipass', '/profile_imgs/Marshmallow Man-01.png', 'Masculino', 24, '02/12/1995', 'Alberto Camino'),
('jaime@ucm.es', 'mipass', '/profile_imgs/Jack-o-lantern-01.png', 'Masculino', 31, '05/15/1996', 'Jaime Tamames'),
('julian@ucm.es', 'mipass', '/profile_imgs/Jack-o-lantern-01.png', 'Masculino', 45, '02/12/1997', 'Julian Rodriguez'),
('monica@ucm.es', 'mipass', '/profile_imgs/Jack-o-lantern-01.png', 'Femenino', 10, '05/15/1996', 'Monica Moran'),
('paula@ucm.es', 'mipass', '/profile_imgs/Jack-o-lantern-01.png', 'Femenino', 30, '02/12/2003', 'Paula Lopez'),
('rosario@ucm.es', 'mipass', '/profile_imgs/Vampire Bat-01.png', 'Femenino', 53, '02/12/1986', 'Rosario Cabanas'),
('ruben@ucm.es', 'mipass', '/profile_imgs/Jack-o-lantern-01.png', 'Masculino', 0, '05/15/1996', 'Ruben Barrado González'),
('usuario@ucm.es', 'mipass', '/profile_imgs/Jack-o-lantern-01.png', 'Masculino', 55, '10/11/1963', 'Usuario');

--
-- Volcado de datos para la tabla `friends`
--

INSERT INTO `friends` (`user`, `friend`, `state`) VALUES
('alberto@ucm.es', 'julian@ucm.es', 'aceptada'),
('alberto@ucm.es', 'monica@ucm.es', 'aceptada'),
('alberto@ucm.es', 'rosario@ucm.es', 'aceptada'),
('jaime@ucm.es', 'julian@ucm.es', 'aceptada'),
('jaime@ucm.es', 'rosario@ucm.es', 'aceptada'),
('jaime@ucm.es', 'ruben@ucm.es', 'aceptada'),
('julian@ucm.es', 'alberto@ucm.es', 'aceptada'),
('julian@ucm.es', 'jaime@ucm.es', 'aceptada'),
('julian@ucm.es', 'monica@ucm.es', 'aceptada'),
('monica@ucm.es', 'alberto@ucm.es', 'aceptada'),
('monica@ucm.es', 'jaime@ucm.es', 'aceptada'),
('monica@ucm.es', 'julian@ucm.es', 'aceptada'),
('monica@ucm.es', 'usuario@ucm.es', 'aceptada'),
('rosario@ucm.es', 'alberto@ucm.es', 'aceptada'),
('ruben@ucm.es', 'jaime@ucm.es', 'aceptada'),
('ruben@ucm.es', 'usuario@ucm.es', 'aceptada'),
('usuario@ucm.es', 'monica@ucm.es', 'aceptada'),
('usuario@ucm.es', 'ruben@ucm.es', 'aceptada');

--
-- Volcado de datos para la tabla `questions`
--

INSERT INTO `questions` (`pregunta`, `respuesta1`, `respuesta2`, `respuesta3`, `respuesta4`) VALUES
('¿Cual es la peor pelicula de la historia?', 'El exorcista II: El hereje (1977)', 'Una chica de Jersey (2004)', 'Epic Movie', 'Godzilla (1998)'),
('¿Nintendo Switch, PS4 o XBOX One', 'Nintendo Switch', 'PS4', 'Xbox One', 'No me interesan los videojuegos'),
('¿Cual es tu plato favorito?', 'Macarrones', 'Albondigas', 'Lenguado', 'Chuleton'),
('¿Cual es el personaje mas irritante de Juego de Tronos?', 'Daenerys Targaryen', 'Jon Nieve', 'Gregor Clegane', 'Cersei Lannister'),
('¿Que tipo de cine te gusta mas?', 'Comedia', 'Terror', 'Ciencia Fición', 'Acción');

-- --------------------------------------------------------

--
-- Indices de la tabla `friends`
--
ALTER TABLE `friends`
  ADD PRIMARY KEY (`user`,`friend`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`email`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
