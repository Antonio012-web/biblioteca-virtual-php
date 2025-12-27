<?php
session_start(); 
// Inicia la sesión PHP para poder utilizar variables de sesión

function checkAuth() {
    // Esta función verifica si el usuario está autenticado y gestiona la inactividad de la sesión

    if (!isset($_SESSION['username'])) {
        // Si no existe la variable de sesión 'username', significa que el usuario no ha iniciado sesión
        header("Location: inicio_sesion.php");
        // Redirige al usuario a la página de inicio de sesión
        exit;
    }

    // Verificar inactividad
    // Comprueba si existe 'last_activity' y si han transcurrido más de 3600 segundos (1 hora) desde su última actualización
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 3600)) {
        // Si pasa el tiempo límite, se considera que la sesión ha expirado por inactividad

        session_unset();
        // Elimina todas las variables de la sesión
        session_destroy();
        // Destruye la sesión por completo

        // Redirigimos a login con un parámetro para indicar que fue "por inactividad"
        header("Location: login.php?session_timeout=1");
        exit;
    }

    // Actualizar el tiempo de última actividad
    // Si se ha llegado hasta este punto, el usuario sigue activo, por lo que se refresca 'last_activity'
    $_SESSION['last_activity'] = time();
}
