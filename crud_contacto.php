<?php 
include 'config.php';
// Se incluye el archivo de configuración, para establecer la conexión a la base de datos

// Leer el cuerpo de la solicitud (JSON) para manejar acciones de eliminación
$request_body = file_get_contents('php://input');
$data = json_decode($request_body, true);
// 'php://input' permite capturar datos en bruto enviados en la petición,
// y json_decode transforma la cadena JSON en un array asociativo (o stdClass, según el segundo parámetro).

// Manejar la acción enviada desde el frontend (JavaScript)
if (isset($data['action'])) {
    // Si en la solicitud existe la clave 'action', significa que se requiere una operación especial (eliminar uno o varios mensajes)
    $action = $data['action'];

    // Eliminar un solo mensaje
    if ($action === 'delete') {
        // Acción 'delete' implica que se eliminará un único mensaje con un ID específico
        if (isset($data['id'])) {
            // Verificamos que se haya proporcionado el 'id'
            $id = intval($data['id']);
            // Convertimos el ID a entero para mayor seguridad

            // Consulta SQL para eliminar el mensaje con el ID proporcionado
            $query = "DELETE FROM mensajes_contacto WHERE id = ?";
            $stmt = $conn->prepare($query);
            $stmt->bind_param("i", $id);

            if ($stmt->execute()) {
                // Si la eliminación se realiza correctamente
                echo json_encode(['success' => true]);
            } else {
                // Si ocurre un fallo en la ejecución
                echo json_encode(['success' => false, 'message' => 'Error al eliminar el mensaje.']);
            }
            $stmt->close();
        } else {
            // Si no se proporciona un ID, notificamos el error
            echo json_encode(['success' => false, 'message' => 'ID no proporcionado.']);
        }

    // Eliminar múltiples mensajes seleccionados
    } elseif ($action === 'deleteSelected') {
        // Acción 'deleteSelected' indica una eliminación masiva de registros
        if (isset($data['ids']) && is_array($data['ids'])) {
            // Verificamos que 'ids' sea un array válido
            $ids = $data['ids'];

            // Crear una lista de marcadores de posición (?) para la consulta
            // tantos como elementos tenga el array $ids
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $query = "DELETE FROM mensajes_contacto WHERE id IN ($placeholders)";

            // Preparar la consulta SQL
            $stmt = $conn->prepare($query);

            // Convertir todos los IDs a enteros y asignarlos a la consulta
            // str_repeat('i', count($ids)) genera una cadena como 'iii...' según la cantidad de IDs
            $stmt->bind_param(str_repeat('i', count($ids)), ...array_map('intval', $ids));

            if ($stmt->execute()) {
                // Si la consulta se ejecuta con éxito, retornamos una respuesta JSON satisfactoria
                echo json_encode(['success' => true]);
            } else {
                // En caso de error al ejecutar
                echo json_encode(['success' => false, 'message' => 'Error al eliminar los mensajes seleccionados.']);
            }
            $stmt->close();
        } else {
            // Si no se proporcionan IDs válidos o el array está vacío
            echo json_encode(['success' => false, 'message' => 'No se proporcionaron IDs válidos.']);
        }

    } else {
        // Si la acción no coincide con 'delete' ni 'deleteSelected'
        echo json_encode(['success' => false, 'message' => 'Acción no válida.']);
    }

} else {
    // Si no se envía una 'action' en el cuerpo JSON, se procede con la lógica de paginación y obtención de registros

    // Número de registros por página
    $registros_por_pagina = 10;
    // Determinar la página actual enviada por POST, o por defecto 1
    $pagina_actual = isset($_POST['pagina']) ? (int)$_POST['pagina'] : 1;

    // Calcular el desplazamiento para la consulta (OFFSET en SQL)
    $offset = ($pagina_actual - 1) * $registros_por_pagina;

    // Obtener el total de registros en la tabla 'mensajes_contacto'
    $total_registros_query = "SELECT COUNT(*) as total FROM mensajes_contacto";
    $total_registros_result = mysqli_query($conn, $total_registros_query);
    $total_registros_row = mysqli_fetch_assoc($total_registros_result);
    $total_registros = $total_registros_row['total'];

    // Consulta para obtener los registros de la página actual
    // LEFT JOIN con 'usuarios' para obtener el nombre del usuario que envió el mensaje (si aplica)
    $query = "
        SELECT mc.id, mc.nombre AS contacto_nombre, mc.correo, mc.mensaje, mc.fecha, u.nombre AS usuario_nombre 
        FROM mensajes_contacto mc 
        LEFT JOIN usuarios u ON mc.idUsuario = u.id
        LIMIT $registros_por_pagina OFFSET $offset
    ";
    $result = mysqli_query($conn, $query);

    // Crear una matriz (array) para almacenar los registros de la consulta
    $mensajes = [];

    while ($row = mysqli_fetch_assoc($result)) {
        $mensajes[] = $row;
    }

    // Calcular el número total de páginas redondeando hacia arriba
    $total_paginas = ceil($total_registros / $registros_por_pagina);

    // Devolver los datos en formato JSON
    echo json_encode([
        'mensajes' => $mensajes,
        'totalPaginas' => $total_paginas,
        'paginaActual' => $pagina_actual,
        'totalRegistros' => $total_registros
    ]);
}

// Cerramos la conexión a la base de datos
$conn->close();
?>
