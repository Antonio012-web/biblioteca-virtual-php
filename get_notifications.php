<?php
// Incluir la configuración para establecer la conexión a la base de datos
include 'config.php';

// Establecer el encabezado HTTP para indicar que la respuesta será en formato JSON
header('Content-Type: application/json');

// Definir la consulta SQL para obtener todas las notificaciones,
// ordenándolas por fecha de manera descendente (las más recientes primero)
$query = "SELECT * FROM notificaciones ORDER BY fecha DESC";

// Ejecutar la consulta utilizando la conexión a la base de datos
$result = mysqli_query($conn, $query);

// Inicializar un arreglo vacío para almacenar las notificaciones obtenidas
$notifications = [];

// Verificar si la consulta se ejecutó correctamente
if ($result) {
    // Recorrer cada fila del resultado y agregarla al arreglo $notifications
    while ($row = mysqli_fetch_assoc($result)) {
        $notifications[] = $row;
    }
}

// Codificar el arreglo de notificaciones a formato JSON y enviarlo como respuesta
echo json_encode($notifications);
?>
