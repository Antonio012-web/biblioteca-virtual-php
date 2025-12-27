<?php
// Incluir el archivo de configuración para establecer la conexión a la base de datos.
include 'config.php';

// Establecer el encabezado HTTP para indicar que la respuesta será enviada en formato JSON.
header('Content-Type: application/json');

// Definir la consulta SQL para contar las reservas que se encuentran en estado 'pendiente' o 'confirmada'.
// Estos estados se consideran activos. Puedes ajustar los valores del IN según las necesidades de tu aplicación.
$query = "SELECT COUNT(*) as count FROM reservas WHERE estado IN ('pendiente', 'confirmada')";

// Ejecutar la consulta utilizando la conexión a la base de datos.
$result = mysqli_query($conn, $query);

// Inicializar la variable $count en 0, en caso de que la consulta no devuelva resultados.
$count = 0;

// Verificar si la consulta se ejecutó correctamente.
if ($result) {
    // Extraer la fila de resultados como un arreglo asociativo.
    $row = mysqli_fetch_assoc($result);
    // Asignar el valor del campo 'count' a la variable $count.
    $count = $row['count'];
}

// Codificar el resultado en formato JSON y enviarlo como respuesta.
// El JSON contendrá un objeto con la clave "count" que indica el número de reservas activas.
echo json_encode(['count' => $count]);
?>
