<?php
// Se incluye el archivo 'config.php' para obtener la configuración y establecer la conexión con la base de datos.
include 'config.php';

// Se establece la cabecera HTTP para indicar que la respuesta será en formato JSON.
header('Content-Type: application/json');

// Se verifica que la solicitud sea de tipo POST y que se haya enviado el parámetro 'id'.
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['id'])) {
    // Se asigna el valor de 'id' enviado en la solicitud POST a la variable $id.
    $id = $_POST['id'];
    
    // Se prepara la consulta SQL para actualizar la notificación específica, marcándola como leída.
    // El signo de interrogación (?) es un marcador de posición para evitar inyección SQL.
    $query = "UPDATE notificaciones SET leido = 1 WHERE id = ?";
    
    // Se prepara la consulta utilizando la conexión establecida en 'config.php'.
    $stmt = $conn->prepare($query);
    
    // Se vincula el parámetro $id al marcador de posición en la consulta.
    // "i" indica que el parámetro es de tipo entero.
    $stmt->bind_param("i", $id);
    
    // Se ejecuta la consulta preparada.
    if ($stmt->execute()){
        // Si la ejecución es exitosa, se envía una respuesta JSON indicando éxito.
        echo json_encode(['status' => 'success', 'message' => 'Notificación marcada como leída']);
    } else {
        // Si ocurre un error durante la ejecución, se envía una respuesta JSON con un mensaje de error.
        echo json_encode(['status' => 'error', 'message' => 'Error al actualizar la notificación']);
    }
} else {
    // Si la solicitud no es POST o falta el parámetro 'id', se envía una respuesta JSON con un mensaje de error.
    echo json_encode(['status' => 'error', 'message' => 'Parámetros faltantes']);
}
?>
