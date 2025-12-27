<?php
// Iniciar la sesión para acceder a las variables de sesión del usuario
session_start();

// Verificar si la variable de sesión 'id' está definida, lo que indica que el usuario está autenticado
if (isset($_SESSION['id'])) {
    // Si la variable 'id' existe, se codifica y se envía una respuesta JSON con el ID del usuario
    echo json_encode(['id' => $_SESSION['id']]);
} else {
    // Si la variable 'id' no existe, significa que el usuario no está autenticado.
    // Se envía una respuesta JSON con un mensaje de error.
    echo json_encode(['error' => 'Usuario no autenticado']);
}
?>
