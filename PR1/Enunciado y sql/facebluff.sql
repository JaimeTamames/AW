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
-- Estructura de tabla para la tabla `friends`
--

CREATE TABLE `friends` (
  `user` varchar(100) NOT NULL,
  `friend` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `requests`
--

CREATE TABLE `requests` (
  `emailSolicitante` varchar(100) NOT NULL,
  `emailSolicitado` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('V3-ebzSkjd13yVPdFnF2pXRlP22VLESq', 1513249480, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"currentUser\":\"ruben@r.com\"}'),
('VMMtmpKKNwevDXjHrvCDkPvEaFkedK1j', 1513206822, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"currentUser\":\"usuario@ucm.es\"}'),
('ylTTBOx-6YOnGM1Wk--arUbV_dDpAODw', 1513182841, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"currentUser\":\"ruben@r.com\"}');

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
('usuario@ucm.es', 'mipass', '', 'Masculino', 55, '10/11/1963', 'UCM1'),
('ruben@r.com', 'qwerty', '', 'Masculino', 0, '05/15/1996', 'Ruben Barrado González'),
('monica@m.com', 'qwerty', 'Dave-01.png', 'Femenino', 0, '0000-00-00', 'Monica moran'),
('rbg@r.com', 'qwerty', 'Bat-01.png', 'Masculino', 0, '0000-00-00', 'prueba edad'),
('rubern@ruben.com', 'qwerty', 'Harley-01.png', 'Masculino', 0, '02/12/1993', 'ruben edad'),
('rubeern@ruben.com', 'wertyrt', 'Harley-01.png', 'Masculino', 0, '02/12/1993', 'ruben edad'),
('usuario2@ucm.es', 'qwerty', 'img2315.png', 'Masculino', 0, '02/12/1993', 'qwrty qrty'),
('rubenbarrado@r.com', 'qwerty', 'Fatso-01.png', 'Masculino', 0, '02/12/1993', 'ruben barrado g');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
