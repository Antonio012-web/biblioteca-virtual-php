-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 19-03-2025 a las 04:26:17
-- Versión del servidor: 10.11.10-MariaDB
-- Versión de PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `u338782682_swbv`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detallesprofesores`
--

CREATE TABLE `detallesprofesores` (
  `IdUsuario` int(11) NOT NULL,
  `NivelAcceso` enum('basico','avanzado','administrador') DEFAULT 'basico',
  `Salon` varchar(50) DEFAULT NULL,
  `HorarioTrabajo` varchar(50) DEFAULT NULL,
  `DiasTrabajo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historialacceso`
--

CREATE TABLE `historialacceso` (
  `ID` int(11) NOT NULL,
  `IdUsuario` int(11) NOT NULL,
  `FechaHoraAcceso` datetime NOT NULL,
  `IP` varchar(45) DEFAULT NULL,
  `multimedia_id` int(11) DEFAULT NULL,
  `intentos_fallidos` int(11) DEFAULT 0,
  `bloqueado` tinyint(1) DEFAULT 0,
  `tiempo_bloqueo` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Volcado de datos para la tabla `historialacceso`
--

INSERT INTO `historialacceso` (`ID`, `IdUsuario`, `FechaHoraAcceso`, `IP`, `multimedia_id`, `intentos_fallidos`, `bloqueado`, `tiempo_bloqueo`) VALUES
(1, 63, '2025-03-19 04:11:22', NULL, NULL, 0, 0, NULL),
(2, 64, '2025-01-28 07:18:37', NULL, NULL, 0, 0, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historiallectura`
--

CREATE TABLE `historiallectura` (
  `id` int(11) NOT NULL,
  `idUsuario` int(11) NOT NULL,
  `idLibro` int(11) NOT NULL,
  `fechaInicioLectura` date NOT NULL,
  `fechaFinLectura` date DEFAULT NULL,
  `tiempoLectura` int(11) DEFAULT NULL,
  `multimedia_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Volcado de datos para la tabla `historiallectura`
--

INSERT INTO `historiallectura` (`id`, `idUsuario`, `idLibro`, `fechaInicioLectura`, `fechaFinLectura`, `tiempoLectura`, `multimedia_id`) VALUES
(71, 63, 31, '2024-07-13', '2024-07-13', 3, NULL),
(72, 63, 31, '2024-07-13', '2024-07-13', 2, NULL),
(73, 63, 31, '2024-07-14', '2024-07-14', 6, NULL),
(74, 63, 54, '2024-07-14', '2024-07-14', 2, NULL),
(75, 63, 31, '2024-07-26', '2024-07-26', 0, NULL),
(76, 63, 31, '2024-07-26', '2024-07-26', 0, NULL),
(78, 63, 31, '2024-07-26', '2024-07-26', 0, NULL),
(80, 63, 31, '2024-07-31', '2024-07-31', 0, NULL),
(81, 63, 31, '2024-08-10', '2024-08-10', 0, NULL),
(82, 63, 31, '2024-08-14', '2024-08-14', 0, NULL),
(83, 63, 31, '2024-09-25', '2024-09-25', 0, NULL),
(87, 69, 31, '2024-11-05', '2024-11-05', 0, NULL),
(88, 69, 31, '2024-11-13', '2024-11-13', 0, NULL),
(89, 69, 31, '2024-11-13', '2024-11-13', 0, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `libros`
--

CREATE TABLE `libros` (
  `id` int(11) NOT NULL,
  `titulo` varchar(100) DEFAULT NULL,
  `autor` varchar(100) DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `grado` enum('Primero','Segundo','Tercero','Cuarto','Quinto','Sexto') DEFAULT NULL,
  `añoPublicacion` date DEFAULT NULL,
  `descripcion` varchar(250) DEFAULT NULL,
  `disponibilidad` enum('disponible','no disponible','en prestamo','en reparacion') DEFAULT NULL,
  `urlDescarga` varchar(255) DEFAULT NULL,
  `imagen_libro` blob DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `libros`
--

INSERT INTO `libros` (`id`, `titulo`, `autor`, `categoria`, `grado`, `añoPublicacion`, `descripcion`, `disponibilidad`, `urlDescarga`, `imagen_libro`) VALUES
(31, 'Luna Destaca en el Colegio', 'TCC Trbol Comunicacin y Creacin SA', 'Cuento', NULL, '2024-07-20', 'Un bonito relato destinado a normalizar y familiarizarse con el Trastorno de Hiperactividad o TDAH', 'disponible', 'https://drive.google.com/uc?export=download&id=1ECZTUIXmxzwGQz9Vwll-42sYg98AK9UF', 0x68747470733a2f2f692e70696e696d672e636f6d2f353634782f64312f35362f32632f64313536326331646662663561343731623836643432646134376664366163612e6a7067),
(54, 'Cuento Cichipo y Astrulina', 'UNICEF', 'Cuento', NULL, '2024-07-20', 'Cichipo y Astrulina cuenta la historia de un nio que se siente triste tras mudarse de planeta Pero junto a su amiga Astrulina descubrir la belleza de su nuevo hogar', 'disponible', 'https://drive.google.com/uc?export=download&id=1Wa6QSoMAdTFSbgyUhq3-H_8GI-Xa--wR', 0x68747470733a2f2f7777772e6564756361656e7669766f2e636f6d2f77702d636f6e74656e742f75706c6f6164732f323032342f30352f4375656e746f2d4369636869706f2d792d41737472756c696e612e77656270),
(133, 'El cumpleaños del círculo rojo', 'Laura Ortega Vesga', 'Cuento', NULL, '2024-08-16', 'El Cumpleaños del Círculo Rojo es un cuento infantil en verso. El Círculo Rojo organiza su fiesta de cumpleaños e invita a sus amigas las figuras geométricas para celebrarlo todos.', 'disponible', 'https://drive.google.com/uc?export=download&id=1gLT_3VRBWnzX8gPWD5D1TKBkoGOJhhZa', 0x68747470733a2f2f7777772e6564756361656e7669766f2e636f6d2f77702d636f6e74656e742f75706c6f6164732f323032332f31322f43756d706c65616e6f732d43697263756c6f2d526f6a6f2e77656270);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes_contacto`
--

CREATE TABLE `mensajes_contacto` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `correo` varchar(255) NOT NULL,
  `mensaje` text NOT NULL,
  `fecha` timestamp NULL DEFAULT current_timestamp(),
  `idUsuario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `mensajes_contacto`
--

INSERT INTO `mensajes_contacto` (`id`, `nombre`, `correo`, `mensaje`, `fecha`, `idUsuario`) VALUES
(10, 'Juan Pérez', 'juan19@gmail.com', 'Hola', '2024-11-05 03:14:40', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `multimedia`
--

CREATE TABLE `multimedia` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` enum('Video','Audiolibro','Pdf') NOT NULL,
  `url` varchar(255) NOT NULL,
  `autor` varchar(255) DEFAULT NULL,
  `fecha_publicacion` date DEFAULT NULL,
  `etiquetas` varchar(255) DEFAULT NULL,
  `nivel_educativo` enum('Primero','Segundo','Tercero','Cuarto','Quinto','Sexto') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Volcado de datos para la tabla `multimedia`
--

INSERT INTO `multimedia` (`id`, `titulo`, `descripcion`, `tipo`, `url`, `autor`, `fecha_publicacion`, `etiquetas`, `nivel_educativo`) VALUES
(62, 'El Pulpo Video educativo', 'El Pulpo', 'Video', 'https://drive.google.com/file/d/18MSeQf9D7i-502djbE5ae_KqT9lwA032/view?usp=sharing', 'Monichita', '2024-09-05', 'Edicacion, Video Educativo', 'Tercero'),
(63, 'El patito feo', 'Es un audiolibro del patito feo', 'Audiolibro', 'https://drive.google.com/file/d/1BpHuUEERpnKJ-blkBJdcvCAdJ8Bb7Nyr/view?usp=sharing', 'OkiDokiDo Español', '2024-09-05', 'AduioLibro, Educacion', 'Primero'),
(64, 'Desafíos Matemáticos', 'Escribir y colorear los días de la semana.\r\nEscribir y colorear los meses del año.\r\nEl uso del reloj.\r\nEjercicios propuestos de Unidad de Tiempo.', 'Pdf', 'https://drive.google.com/file/d/1RwU3q0Bbt-JmSb0eMxCVhxfC41srECHE/view?usp=drive_link', 'Descarga Matemáticas', '2024-09-07', 'Pdf, Ejercicio metal, Desafíos', 'Primero'),
(65, 'Desafíos Matemáticos', 'Hola', 'Pdf', 'https://drive.google.com/file/d/1RwU3q0Bbt-JmSb0eMxCVhxfC41srECHE/view?usp=drive_link', 'Descarga Matemáticas', '2024-09-07', 'Pdf, Ejercicio metal, Desafíos', 'Primero'),
(66, 'El Pulpo Video educativo', 'Hola', 'Video', 'https://www.youtube.com/watch?v=wm19KMcRWA8', 'Prueba', '2024-09-07', 'Varios, Musica', 'Sexto');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL,
  `idUsuario` int(11) DEFAULT NULL,
  `tipo` varchar(50) NOT NULL,
  `mensaje` text NOT NULL,
  `fecha` datetime NOT NULL,
  `leido` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(100) NOT NULL,
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Volcado de datos para la tabla `password_resets`
--

INSERT INTO `password_resets` (`id`, `user_id`, `token`, `expires_at`) VALUES
(1, 69, 'ff9792230529ac7ea9e1fc7420bb9737858e4baf196be828e8f439de9f091d73838b11207525880c5bb5f6351a9f86239b67', '2024-07-25 06:45:09'),
(2, 69, 'b178e813bff7659977d3be1b6f7653c801f90034b56888013a5a474ffa322ceb5cf05c76c3e225c3532f43c4734ffe425677', '2024-07-25 06:45:11'),
(3, 63, '934a0669e061b15ed542149ef030bbe6fca9441f282a9efa2290c6be7303f6d0f88367f7ef298e5b79becbc50047796de13d', '2024-07-25 06:46:22'),
(4, 63, '3ecd18c86d847421ad5a924e3575d58c8f62ceb1bae5e06bb61bb580bf7e2535aa970ba15ace84f70c1c0ff622230a78ff50', '2024-07-25 06:56:23'),
(5, 63, 'fedb7ef673e426d5a494668f981ae30cab7bb082809555a9c0a82cea3e26fc921b609d97fde2f12f0b0b84cf268dd1a994ab', '2024-07-25 06:56:29'),
(6, 63, '844cccea411fcc3c33dda8ee8a785e4a161a901608a8b7e4178afb0ee1c5f0d50fdc03fa8927ee9a9e73c05a688d84736333', '2024-07-25 06:57:20'),
(7, 63, '5e8ebe92cfb92508610281ca54bf1010dbc631e0dcb8a9118677a739f318c95e53b108e603a9e79629601964bda0d77ba707', '2024-07-25 07:16:48'),
(8, 63, '1286c6939498be920e78abc20c8da1029856cfe53f144024e43c0c7e8ef3b41dced2c39faa87d57840240fa02ce0d7baad56', '2024-07-25 07:33:49'),
(9, 63, '3e3cd33aa52537ea4e0533d540df2b07b4b7a2756005b8329302b0b28a6e5779b4cf49a2fef1a8ed0c925f1c6018e3f8c257', '2024-07-25 07:37:14'),
(10, 63, '8fbb35c3d1519cae5467a5cb405916f5b778b634ad8a17c4d985574a118ea9816d225e28afa60d189b1a6cafb1d77e196802', '2024-07-25 07:37:17'),
(11, 63, 'd20d014dce7aa38c0309d00ef9042a15cc5adf1ce26f7d8fb94bae236bafae0d3468914b89bf96e7510936373e438d6a1337', '2024-07-25 07:46:58'),
(12, 63, 'f08a3895a8b2432f958a31f74bb8d05c25006fd4c1d8e3e9202f6912a33c89a2bd9210e6765d32cac5f333e5337240b1a862', '2024-07-25 08:01:06'),
(14, 69, 'f069eef62a95d0488d087559992d99d04eb6dcf4b918223f5031a6cd5a53538a137b5c3f895390588181badc55283c2c88ab', '2024-07-25 08:07:22'),
(15, 63, '7c7fddc9c0bac38d989fde1b9a44ef120d36254bdd500f38325c6d02353db41d658b34ffcec34ba860cf5f768e6dbe0b000a', '2024-07-25 08:09:42'),
(16, 63, '349250dadc8e9cab32d046ee1fc1a54d57738fa6916496e8048fdf7e624965647e8eacf2b7cf3b1d0a1813df9a98a021c1dc', '2024-07-25 08:17:06'),
(17, 63, '109cdd28014cc1eefd39d10bc832f757e01ab6973d727c7e7057909ad36ab59d648fb23a9aa5206789cac6b214704c3cb706', '2024-07-25 08:19:36'),
(23, 63, 'fca7f2e72c8c57c26a7f2bf1532a466eb064a2458ee6974eec8d7889760a82e6454b18898f1eeb4f2f62f3fcc35a2d9bc937', '2024-07-26 03:04:32');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `idLibro` int(11) DEFAULT NULL,
  `fechaReserva` date DEFAULT NULL,
  `estado` enum('pendiente','confirmada','cancelada') DEFAULT NULL,
  `idUsuario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reservas`
--

INSERT INTO `reservas` (`id`, `nombre`, `idLibro`, `fechaReserva`, `estado`, `idUsuario`) VALUES
(300, 'Juan Barrera Montoya', 31, '2024-10-02', 'cancelada', 69),
(301, 'Juan Barrera Montoya', 133, '2024-10-11', 'cancelada', 69),
(302, 'Juan Barrera Montoya', 31, '2024-11-01', 'cancelada', 69),
(303, 'Juan Barrera Montoya', 31, '2024-11-04', 'cancelada', 69),
(304, 'Juan Barrera Montoya', 31, '2024-11-12', 'cancelada', 69);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reseñas`
--

CREATE TABLE `reseñas` (
  `id` int(11) NOT NULL,
  `idUsuario` int(11) DEFAULT NULL,
  `idLibro` int(11) DEFAULT NULL,
  `Puntuacion` int(11) DEFAULT NULL,
  `Reseña` text DEFAULT NULL,
  `FechaReseña` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `reseñas`
--

INSERT INTO `reseñas` (`id`, `idUsuario`, `idLibro`, `Puntuacion`, `Reseña`, `FechaReseña`) VALUES
(9, 69, 31, 1, 'La esa', '2024-11-13');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(40) DEFAULT NULL,
  `apPaterno` varchar(40) DEFAULT NULL,
  `apMaterno` varchar(40) DEFAULT NULL,
  `direccion` varchar(100) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `numTelefono` varchar(10) DEFAULT NULL,
  `tipoUsuario` enum('estudiante','profesor','administrador') DEFAULT NULL,
  `password` varchar(512) DEFAULT NULL,
  `fechaRegistro` datetime NOT NULL DEFAULT current_timestamp(),
  `session_token` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apPaterno`, `apMaterno`, `direccion`, `correo`, `numTelefono`, `tipoUsuario`, `password`, `fechaRegistro`, `session_token`) VALUES
(63, 'Onofre', 'Antonio', 'Pérez', 'El fresno', 'gonzagaantonio012@gmail.com', '7121134267', 'administrador', '$2y$10$5CTV46EgKJUcMdATYfd7N.sWU5jOmYzQMuSE2MLXBBK3zHHy5D07W', '0000-00-00 00:00:00', 'f8edd52fae3b1213dbef9bcb2742d5dfa30368041db76d4d0745662eb593e7ab'),
(64, 'David', 'Romero', 'Fuentes', 'Calle morelos', 'davidmorelos@gmail.com', '1234567890', 'profesor', '$2y$10$S.LkQBKIGXN7JvT5m8OqMumFZi0e78s7nHkEkJKbVptgD.OiVpmm.', '0000-00-00 00:00:00', NULL),
(65, 'Lola', 'Morales', 'Quimedo', 'Calle la reforma', 'lola1234@gmail.com', '2314578960', 'estudiante', '$2y$10$hd2FjVpxXRP9F3lKR1pLAunpC2NNo5GLmg9ra6KEWa4ArPpQ8HWIO', '0000-00-00 00:00:00', NULL),
(69, 'Juan', 'Barrera', 'Montoya', 'Calle sin numero', 'juan000@gmail.com', '4552031678', 'estudiante', '$2y$10$j/rsVF8E7AuwO4MNX.ZGle0axsYtVPlOS8MxaMdkIH4IihcxDb19.', '0000-00-00 00:00:00', NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `detallesprofesores`
--
ALTER TABLE `detallesprofesores`
  ADD PRIMARY KEY (`IdUsuario`);

--
-- Indices de la tabla `historialacceso`
--
ALTER TABLE `historialacceso`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `IdUsuario` (`IdUsuario`),
  ADD KEY `multimedia_id` (`multimedia_id`);

--
-- Indices de la tabla `historiallectura`
--
ALTER TABLE `historiallectura`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idUsuario` (`idUsuario`),
  ADD KEY `idLibro` (`idLibro`),
  ADD KEY `multimedia_id` (`multimedia_id`);

--
-- Indices de la tabla `libros`
--
ALTER TABLE `libros`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `mensajes_contacto`
--
ALTER TABLE `mensajes_contacto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_usuario` (`idUsuario`);

--
-- Indices de la tabla `multimedia`
--
ALTER TABLE `multimedia`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idUsuario` (`idUsuario`);

--
-- Indices de la tabla `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idUsuario` (`nombre`),
  ADD KEY `reservas_ibfk_1` (`idLibro`),
  ADD KEY `fk_idUsuario` (`idUsuario`);

--
-- Indices de la tabla `reseñas`
--
ALTER TABLE `reseñas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idUsuario` (`idUsuario`),
  ADD KEY `idLibro` (`idLibro`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `historialacceso`
--
ALTER TABLE `historialacceso`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `historiallectura`
--
ALTER TABLE `historiallectura`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;

--
-- AUTO_INCREMENT de la tabla `libros`
--
ALTER TABLE `libros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=150;

--
-- AUTO_INCREMENT de la tabla `mensajes_contacto`
--
ALTER TABLE `mensajes_contacto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `multimedia`
--
ALTER TABLE `multimedia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=161;

--
-- AUTO_INCREMENT de la tabla `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=305;

--
-- AUTO_INCREMENT de la tabla `reseñas`
--
ALTER TABLE `reseñas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detallesprofesores`
--
ALTER TABLE `detallesprofesores`
  ADD CONSTRAINT `detallesprofesores_ibfk_1` FOREIGN KEY (`IdUsuario`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `historialacceso`
--
ALTER TABLE `historialacceso`
  ADD CONSTRAINT `historialacceso_ibfk_1` FOREIGN KEY (`IdUsuario`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `historialacceso_ibfk_2` FOREIGN KEY (`multimedia_id`) REFERENCES `multimedia` (`id`);

--
-- Filtros para la tabla `historiallectura`
--
ALTER TABLE `historiallectura`
  ADD CONSTRAINT `historiallectura_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `historiallectura_ibfk_2` FOREIGN KEY (`idLibro`) REFERENCES `libros` (`id`),
  ADD CONSTRAINT `historiallectura_ibfk_3` FOREIGN KEY (`multimedia_id`) REFERENCES `multimedia` (`id`);

--
-- Filtros para la tabla `mensajes_contacto`
--
ALTER TABLE `mensajes_contacto`
  ADD CONSTRAINT `fk_usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD CONSTRAINT `fk_idUsuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`idLibro`) REFERENCES `libros` (`id`),
  ADD CONSTRAINT `reservas_ibfk_2` FOREIGN KEY (`idLibro`) REFERENCES `libros` (`id`);

--
-- Filtros para la tabla `reseñas`
--
ALTER TABLE `reseñas`
  ADD CONSTRAINT `reseñas_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `reseñas_ibfk_2` FOREIGN KEY (`idLibro`) REFERENCES `libros` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
