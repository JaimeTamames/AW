-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 13-12-2017 a las 18:25:24
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
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
-- --------------------------------------------------------

ALTER TABLE `sessions` ADD PRIMARY KEY (`session_id`);

--
-- Estructura de tabla para la tabla `friends`
--

CREATE TABLE `friends` (
  `user` varchar(100) REFERENCES user(email),
  `friend` varchar(100) REFERENCES user(email),
  PRIMARY KEY(user, friend)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `requests`
--

CREATE TABLE `requests` (
  `emailSolicitante` varchar(100) REFERENCES user(email),
  `emailSolicitado` varchar(100) REFERENCES user(email),
  PRIMARY KEY(emailSolicitante, emailSolicitado)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `email` varchar(100) PRIMARY KEY,
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
('usuario@ucm.es', 'mipass', '', 'Masculino', 55, '10/11/1963', 'UCM1'),
('ruben@ucm.es', 'mipass', '', 'Masculino', 0, '05/15/1996', 'Ruben Barrado González'),
('monica@ucm.es', 'mipass', '/profile_imgs/Jack-o-lantern-01.png', 'Femenino', 10, '05/15/1996', 'Monica Moran'),
('jaime@ucm.es', 'mipass', 'Bat-01.png', 'Masculino', 31, '05/15/1996', 'Jaime Tamames'),
('alberto@ucm.es', 'mipass', '/profile_imgs/Marshmallow Man-01.png', 'Masculino', 24, '02/12/1995', 'Alberto Camino'),
('julian@ucm.es', 'mipass', 'Harley-01.png', 'Masculino', 45, '02/12/1997', 'Julian Rodriguez'),
('rosario@ucm.es', 'mipass', '/profile_imgs/Vampire Bat-01.png', 'Femenino', 53, '02/12/1986', 'Rosario Cabanas'),
('paula@ucm.es', 'mipass', 'Fatso-01.png', 'Femenino', 30, '02/12/2003', 'Paula Lopez');

--
-- Volcado de datos para la tabla `fiends`
--

INSERT INTO `friends` (`user`, `friend`) VALUES
('usuario@ucm.es', 'ruben@ucm.es'),
('usuario@ucm.es', 'monica@ucm.es'),
('monica@ucm.es', 'usuario@ucm.es'),
('monica@ucm.es', 'jaime@ucm.es'),
('ruben@ucm.es', 'jaime@ucm.es'),
('jaime@ucm.es', 'ruben@ucm.es'),
('paula@ucm.es', 'rosario@ucm.es'),
('alberto@ucm.es', 'rosario@ucm.es'),
('alberto@ucm.es', 'julian@ucm.es'),
('julian@ucm.es', 'alberto@ucm.es');

--
-- Volcado de datos para la tabla `requests`
--

INSERT INTO `requests` (`emailSolicitante`, `emailSolicitado`) VALUES
('julian@ucm.es', 'usuario@ucm.es'),
('julian@ucm.es', 'jaime@ucm.es'),
('paula@ucm.es', 'jaime@ucm.es'),
('paula@ucm.es', 'alberto@ucm.es'),
('monica@ucm.es', 'ruben@ucm.es'),
('monica@ucm.es', 'julian@ucm.es');


--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `sessions`
--

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
