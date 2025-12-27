<?php
// Incluir el archivo de configuración que establece la conexión a la base de datos
include 'config.php';

// Establecer el encabezado HTTP para indicar que la respuesta será en formato JSON
header('Content-Type: application/json');

// Definir la consulta SQL para contar el número de notificaciones no leídas (donde 'leido' es 0)
$query = "SELECT COUNT(*) as count FROM notificaciones WHERE leido = 0";

// Ejecutar la consulta utilizando la conexión a la base de datos ($conn)
$result = mysqli_query($conn, $query);

// Inicializar la variable $count en 0, en caso de que la consulta no retorne resultados
$count = 0;

// Si la consulta se ejecutó correctamente, obtener el resultado
if ($result) {
    // Extraer la fila de resultados como un arreglo asociativo
    $row = mysqli_fetch_assoc($result);
    // Asignar el valor del campo 'count' a la variable $count
    $count = $row['count'];
}

// Codificar el resultado en formato JSON y enviarlo como respuesta
echo json_encode(['count' => $count]);
?>
