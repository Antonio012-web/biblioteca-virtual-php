<?php
// Verifica si la sesión aún no está iniciada
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Función para generar un token CSRF y guardarlo en la sesión
function generateToken() {
    // Si no existe la variable de sesión 'csrf_token',
    // se genera un token de 32 bytes aleatorios convertidos a hexadecimal
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
}

// Función para verificar la validez del token CSRF recibido
function verifyToken($token) {
    // Verifica primero que exista 'csrf_token' en la sesión
    // y luego que coincida con el token proporcionado
    // hash_equals compara de forma segura para prevenir ataques de timing
    if (!isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
        die('CSRF token validation failed');
    }
}

// Genera el token CSRF al cargar este archivo, 
// si es que aún no existe en la sesión
generateToken();
?>
