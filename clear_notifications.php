<?php
include 'config.php'; 
// Se incluye el archivo de configuración, donde se define la conexión a la base de datos

header('Content-Type: application/json');
// Se establece el encabezado para que la respuesta sea tratada como JSON

$query = "DELETE FROM notificaciones WHERE leido = 1";
// Consulta SQL para eliminar todas las notificaciones cuyo campo 'leido' sea igual a 1 (leídas)

if (mysqli_query($conn, $query)) {
    // Si la consulta se ejecuta correctamente, se envía una respuesta en formato JSON con estado "success"
    echo json_encode(['status' => 'success', 'message' => 'Notificaciones leídas eliminadas']);
} else {
    // Si ocurre algún error al ejecutar la consulta, se devuelve un estado "error"
    echo json_encode(['status' => 'error', 'message' => 'Error al limpiar notificaciones']);
}
?>
