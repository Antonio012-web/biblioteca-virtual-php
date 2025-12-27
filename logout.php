<?php
// Inicia la sesión o reanuda la sesión actual basada en el identificador de sesión pasado por GET o por cookie.
session_start();

// Se incluye el archivo de configuración, que contiene la conexión a la base de datos necesaria para realizar operaciones SQL.
include 'config.php'; // Conexión a la base de datos

// Verifica si la variable de sesión 'username' está definida, lo que indica que hay un usuario logueado.
if (isset($_SESSION['username'])) {
    // Almacena el nombre de usuario en una variable local para su uso posterior.
    $username = $_SESSION['username'];

    // Genera un nuevo token de sesión de 32 bytes convertidos a hexadecimal.
    // Esto sirve para invalidar cualquier otra sesión activa en diferentes navegadores,
    // ya que el token almacenado en la base de datos se actualizará con este nuevo valor.
    $newToken = bin2hex(random_bytes(32));

    // Prepara una consulta SQL para actualizar el campo 'session_token' en la tabla 'usuarios'
    // asignándole el nuevo token para el usuario identificado por su nombre.
    $stmt = $conn->prepare("UPDATE usuarios SET session_token = ? WHERE nombre = ?");
    // Asocia los parámetros a la consulta: el nuevo token y el nombre de usuario.
    $stmt->bind_param("ss", $newToken, $username);
    // Ejecuta la consulta para actualizar el token en la base de datos.
    $stmt->execute();
}

// Elimina todas las variables de sesión actualmente registradas en el servidor.
// Esto remueve los datos de usuario que se hayan almacenado en la sesión.
session_unset();

// Verifica si la configuración de PHP está utilizando cookies para manejar la sesión.
if (ini_get("session.use_cookies")) {
    // Obtiene los parámetros actuales de la cookie de sesión.
    $params = session_get_cookie_params();
    // Establece la cookie de sesión con un tiempo de expiración en el pasado (42000 segundos atrás),
    // lo que efectivamente la elimina del navegador.
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Destruye la sesión actual, eliminando los datos almacenados en el servidor.
session_destroy();

// Redirige al usuario a la página de inicio de sesión, ya que ha cerrado sesión correctamente.
header("Location: inicio_sesion.php");
// Termina la ejecución del script para asegurar que no se ejecute código adicional.
exit;
?>
