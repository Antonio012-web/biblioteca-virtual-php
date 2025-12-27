<?php
// Se incluye el archivo 'config.php' para cargar la configuración de la base de datos y establecer la conexión.
include 'config.php';

// Se establece el encabezado de la respuesta HTTP para indicar que el contenido es de tipo JSON.
header('Content-Type: application/json');

// Se prepara una consulta SQL para actualizar la tabla 'notificaciones'.
// La consulta marca como leídas todas las notificaciones que actualmente no lo están (leido = 0).
$query = "UPDATE notificaciones SET leido = 1 WHERE leido = 0";

// Se ejecuta la consulta SQL utilizando la función mysqli_query.
// Si la ejecución es exitosa, se envía una respuesta JSON con estado 'success'.
if (mysqli_query($conn, $query)) {
    echo json_encode(['status' => 'success', 'message' => 'Todas las notificaciones marcadas como leídas']);
} else {
    // Si ocurre un error durante la ejecución de la consulta, se envía una respuesta JSON con estado 'error'.
    echo json_encode(['status' => 'error', 'message' => 'Error al marcar notificaciones como leídas']);
}
?>
 