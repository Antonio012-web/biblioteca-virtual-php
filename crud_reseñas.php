<?php
include('config.php'); // Conexión a la base de datos

// Verificamos si la conexión fue exitosa
if (!$conn) {
    error_log('Error en la conexión a la base de datos: ' . mysqli_connect_error());
    // Registramos el error en el log del servidor
    header('Content-Type: application/json');
    // Configuramos la cabecera de la respuesta como JSON
    echo json_encode(['success' => false, 'message' => 'Error en la conexión a la base de datos']);
    exit();
}

// Aseguramos que el request sea POST o GET
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Si la solicitud es POST, tomamos la acción desde $_POST
    $action = $_POST['action'];

    // Eliminación individual de reseñas
    if ($action === 'eliminar') {
        $id = intval($_POST['id']); // Sanitizamos el ID para evitar inyecciones SQL

        // Consulta para eliminar la reseña cuyo 'id' coincida
        $query = "DELETE FROM reseñas WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param('i', $id);

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                // Si realmente se afectó una fila, significa que la reseña existía y se eliminó
                header('Content-Type: application/json');
                http_response_code(200); // OK
                echo json_encode(['success' => true]);
            } else {
                // Si no hubo filas afectadas, no se encontró la reseña con ese ID
                header('Content-Type: application/json');
                http_response_code(400); // Bad Request
                echo json_encode(['success' => false, 'message' => 'No se encontró la reseña con ese ID']);
            }
        } else {
            // Error en la ejecución de la consulta
            header('Content-Type: application/json');
            http_response_code(500); // Internal Server Error
            echo json_encode(['success' => false, 'message' => 'Error al eliminar reseña']);
        }
        $stmt->close();
    }

    // Eliminación masiva de reseñas
    if ($action === 'eliminar_masivo') {
        // Recibimos los IDs en formato JSON (un array) y los decodificamos
        $ids = json_decode($_POST['ids'], true);

        if (is_array($ids) && count($ids) > 0) {
            // Creamos tantos placeholders "?" como IDs, para la cláusula IN
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $query = "DELETE FROM reseñas WHERE id IN ($placeholders)";
            $stmt = $conn->prepare($query);

            // Para cada placeholder, indicamos que el tipo de dato es entero ('i')
            $types = str_repeat('i', count($ids));
            // Desempaquetamos el array de IDs para enlazar los parámetros
            $stmt->bind_param($types, ...$ids);
    
            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    // Si se eliminaron filas, indicamos éxito
                    header('Content-Type: application/json');
                    http_response_code(200); // OK
                    echo json_encode(['success' => true]);
                } else {
                    // No se encontraron reseñas con esos IDs
                    header('Content-Type: application/json');
                    http_response_code(400); // Bad Request
                    echo json_encode(['success' => false, 'message' => 'No se encontraron reseñas con esos IDs']);
                }
            } else {
                // Error al ejecutar la consulta
                header('Content-Type: application/json');
                http_response_code(500); // Internal Server Error
                echo json_encode(['success' => false, 'message' => 'Error al eliminar las reseñas seleccionadas']);
            }
            $stmt->close();
        } else {
            // Si no se proporcionó un array válido de IDs
            header('Content-Type: application/json');
            http_response_code(400); // Bad Request
            echo json_encode(['success' => false, 'message' => 'IDs inválidos']);
        }
    }

    // Cerramos la conexión a la base de datos
    $conn->close();
    exit(); // Aseguramos que no se ejecute nada más después de la respuesta
}

/// Acción para contar el total de reseñas (GET request)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'contar') {
    // Se realiza una consulta para contar cuántas reseñas existen en la tabla
    $query = "SELECT COUNT(*) as total FROM reseñas";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    // Enlazamos la variable $total_records al resultado de la consulta
    $stmt->bind_result($total_records);
    $stmt->fetch();

    // Devolver el total en formato JSON
    header('Content-Type: application/json');
    http_response_code(200); // OK
    echo json_encode(['total' => $total_records]);

    $stmt->close();
    exit();
}
