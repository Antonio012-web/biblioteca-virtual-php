<?php
// Se obtiene el valor de 'page' desde la URL (ej: dashboard_back.php?page=gestion_libros.php),
// si no está definido, se asume cadena vacía.
$page = $_GET['page'] ?? '';

// Dependiendo del valor de 'page', se incluye el archivo PHP correspondiente
switch ($page) {
    case 'gestion_libros.php':
        include 'gestion_libros.php';
        // Aquí se carga la lógica y/o interfaz para gestionar libros
        break;
    case 'gestion_usuarios.php':
        include 'gestion_usuarios.php';
        // Archivo que maneja la gestión de usuarios en el sistema
        break;
    case 'gestion_reservas.php':
        include 'gestion_reservas.php';
        // Archivo con funciones para gestionar reservas de libros
        break;
    case 'gestion_profesores.php':
        include 'gestion_profesores.php';
        // Archivo para manejar asignaciones de profesores (salones, horarios, etc.)
        break;
    case 'gestion_multimedia.php':
        include 'gestion_multimedia.php';
        // Archivo que gestiona elementos multimedia (videos, audios, PDF, etc.)
        break;
    case 'gestion_lectura.php':
        include 'gestion_lectura.php';
        // Archivo para registrar o administrar historial de lectura
        break;
    case 'estadisticas.php':
        include 'estadisticas.php';
        // Archivo que podría contener estadísticas del uso del sistema (gráficas, conteos, etc.)
        break;
    case 'gestion_reseñas.php':
        include 'gestion_reseñas.php';
        // Archivo para manejar reseñas o comentarios realizados por usuarios
        break;
    case 'gestion_contacto.php':
        include 'gestion_contacto.php';
        // Archivo donde se gestiona el envío y recepción de mensajes de contacto
        break;
    case 'gestion_acceso.php':
        include 'gestion_acceso.php';
        // Archivo que controla el historial de accesos (login, intentos fallidos, bloqueo, etc.)
        break;
    default:
        // Si 'page' no coincide con ninguno de los casos, se muestra un mensaje de error
        echo 'Página no encontrada';
        break;
}
