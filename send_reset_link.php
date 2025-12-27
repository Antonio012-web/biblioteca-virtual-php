<?php
// Activa la visualización de todos los errores, pero se deshabilita la salida de errores al navegador.
// Esto es útil para que los errores sean capturados y manejados por el sistema, sin mostrarlos al usuario final.
error_reporting(E_ALL);
ini_set('display_errors', 0);

/**
 * Función personalizada para el manejo de errores.
 * Cuando ocurre un error, esta función establece un código HTTP 500 y devuelve un mensaje JSON detallando el error.
 *
 * @param int $errno Número del error.
 * @param string $errstr Mensaje de error.
 * @param string $errfile Archivo donde ocurrió el error.
 * @param int $errline Línea donde ocurrió el error.
 */
function handleError($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => "Error interno: $errstr en $errfile en la línea $errline"
    ]);
    exit();
}

// Se establece 'handleError' como el manejador de errores para que todos los errores sean capturados por esta función.
set_error_handler('handleError');

// Se establece el encabezado HTTP para indicar que la respuesta será en formato JSON.
header('Content-Type: application/json');

// Se incluyen los archivos de configuración y de correo electrónico.
// 'config.php' contiene la configuración de la base de datos.
// 'mail_config.php' contiene la configuración y funciones para el envío de correos.
require 'config.php';
require 'mail_config.php';

// Se inicializa el arreglo de respuesta, que tendrá dos claves: 'success' (estado) y 'message' (mensaje informativo).
$response = ['success' => false, 'message' => ''];

try {
    // Se lee el contenido de la solicitud HTTP (generalmente enviado mediante POST) y se decodifica desde JSON a un arreglo asociativo.
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Se verifica que el campo 'email' esté presente en los datos recibidos.
    if (!isset($data['email'])) {
        throw new Exception('Correo electrónico no proporcionado.');
    }

    // Se extrae el correo electrónico del arreglo de datos.
    $email = $data['email'];

    // Se prepara una consulta SQL para buscar el usuario en la base de datos mediante su correo electrónico.
    $query = $conn->prepare('SELECT id FROM usuarios WHERE correo = ?');
    if (!$query) {
        throw new Exception('Error al preparar la consulta: ' . $conn->error);
    }

    // Se vincula el parámetro del correo electrónico a la consulta preparada.
    $query->bind_param('s', $email);
    // Se ejecuta la consulta.
    if (!$query->execute()) {
        throw new Exception('Error al ejecutar la consulta: ' . $query->error);
    }

    // Se obtiene el resultado de la consulta.
    $result = $query->get_result();
    // Se verifica si se encontró algún usuario con ese correo.
    if ($result->num_rows > 0) {
        // Se obtiene el 'id' del usuario.
        $userId = $result->fetch_assoc()['id'];
        // Se genera un token seguro utilizando 50 bytes aleatorios convertidos a hexadecimal.
        $token = bin2hex(random_bytes(50));
        if (!$token) {
            throw new Exception('Error al generar el token.');
        }

        // Se calcula la fecha de expiración del token; en este caso, se establece a 1 hora a partir del momento actual.
        $expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));
        // Se prepara la consulta para insertar el token de restablecimiento en la tabla 'password_resets'.
        $query = $conn->prepare('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)');
        if (!$query) {
            throw new Exception('Error al preparar la consulta de inserción: ' . $conn->error);
        }

        // Se vinculan los parámetros: el ID del usuario (entero), el token (cadena) y la fecha de expiración (cadena).
        $query->bind_param('iss', $userId, $token, $expiry);
        // Se ejecuta la consulta de inserción.
        if (!$query->execute()) {
            throw new Exception('Error al ejecutar la consulta de inserción: ' . $query->error);
        }

        // Se envía el correo electrónico de restablecimiento utilizando la función sendResetEmail definida en 'mail_config.php'.
        // Si el envío del correo falla, se lanza una excepción.
        if (!sendResetEmail($email, $token)) {
            throw new Exception('Error al enviar el correo electrónico.');
        }

        // Si todo ha salido bien, se actualiza el arreglo de respuesta indicando éxito.
        $response['success'] = true;
        $response['message'] = 'Se ha enviado un enlace de restablecimiento de contraseña a tu correo electrónico.';
    } else {
        // Si no se encontró ningún usuario con el correo proporcionado, se informa que el correo no está registrado.
        $response['message'] = 'El correo electrónico no está registrado.';
    }
} catch (Exception $e) {
    // En caso de excepción, se captura y se asigna el mensaje de error a la respuesta.
    $response['message'] = $e->getMessage();
}

// Se devuelve la respuesta final en formato JSON.
echo json_encode($response);
?>
