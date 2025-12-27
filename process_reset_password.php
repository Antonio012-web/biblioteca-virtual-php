<?php
// Se incluye el archivo de configuración para establecer la conexión a la base de datos.
require 'config.php';

// Se establece la cabecera HTTP para indicar que la respuesta se enviará en formato JSON.
header('Content-Type: application/json');

// Se inicializa un arreglo de respuesta que contendrá el estado de la operación y un mensaje informativo.
// Inicialmente, 'success' es false y 'message' está vacío.
$response = ['success' => false, 'message' => ''];

try {
    // Se obtiene el contenido del cuerpo de la solicitud HTTP y se decodifica desde JSON a un arreglo asociativo.
    $data = json_decode(file_get_contents('php://input'), true);

    // Se verifica que se hayan recibido tanto la contraseña ('password') como el token ('token').
    // Si alguno de ellos falta, se lanza una excepción con el mensaje "Datos incompletos."
    if (!isset($data['password']) || !isset($data['token'])) {
        throw new Exception('Datos incompletos.');
    }

    // Se extraen la contraseña y el token del arreglo decodificado.
    $password = $data['password'];
    $token = $data['token'];

    // Se valida la contraseña utilizando una expresión regular que verifica que:
    // - Contenga al menos 8 caracteres.
    // - Tenga al menos una letra mayúscula.
    // - Tenga al menos un carácter especial (no alfanumérico).
    if (!preg_match('/^(?=.*[A-Z])(?=.*\W).{8,}$/', $password)) {
        throw new Exception('La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula y un carácter especial.');
    }

    // Se prepara una consulta SQL para verificar que el token exista y no haya expirado.
    // La consulta busca el 'user_id' en la tabla 'password_resets' donde el token coincide
    // y la fecha de expiración ('expires_at') es mayor que la fecha y hora actuales.
    $query = $conn->prepare('SELECT user_id FROM password_resets WHERE token = ? AND expires_at > NOW()');
    $query->bind_param('s', $token);
    $query->execute();
    $result = $query->get_result();

    // Si no se encuentra ningún registro (es decir, el token es inválido o ha expirado),
    // se lanza una excepción con el mensaje "Token inválido o expirado."
    if ($result->num_rows === 0) {
        throw new Exception('Token inválido o expirado.');
    }

    // Se extrae el 'user_id' del resultado para identificar al usuario que solicita el restablecimiento.
    $userId = $result->fetch_assoc()['user_id'];

    // Se genera un hash seguro de la nueva contraseña utilizando el algoritmo BCRYPT.
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Se prepara y ejecuta una consulta SQL para actualizar la contraseña del usuario en la tabla 'usuarios'.
    $query = $conn->prepare('UPDATE usuarios SET password = ? WHERE id = ?');
    $query->bind_param('si', $hashedPassword, $userId);
    $query->execute();

    // Se prepara y ejecuta una consulta SQL para eliminar el token de restablecimiento de la base de datos,
    // ya que el token debe usarse una sola vez y luego descartarse.
    $query = $conn->prepare('DELETE FROM password_resets WHERE token = ?');
    $query->bind_param('s', $token);
    $query->execute();

    // Se inicia la sesión (si no está ya iniciada) y luego se invalida, eliminando cualquier sesión activa.
    // Esto es importante para asegurarse de que el usuario tenga que iniciar sesión de nuevo con la nueva contraseña.
    session_start();
    session_unset();
    session_destroy();

    // Se actualiza el arreglo de respuesta para indicar que la operación fue exitosa,
    // junto con un mensaje que informa que la contraseña ha sido restablecida.
    $response['success'] = true;
    $response['message'] = 'Tu contraseña ha sido restablecida.';
} catch (Exception $e) {
    // Si ocurre cualquier error durante el proceso, se captura la excepción
    // y se asigna el mensaje de error a la respuesta.
    $response['message'] = $e->getMessage();
}

// Se codifica el arreglo de respuesta en formato JSON y se envía como respuesta HTTP.
echo json_encode($response);
?>
