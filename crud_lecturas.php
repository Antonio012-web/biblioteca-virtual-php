<?php
// Incluye el archivo de configuración para la conexión a la base de datos
include 'config.php';

// Establece el tipo de contenido de la respuesta como JSON
header('Content-Type: application/json');
 
// Obtiene los parámetros de la petición GET o establece valores por defecto si no existen
$action = $_GET['action'] ?? '';
$search = $_GET['search'] ?? '';
$filter = $_GET['filter'] ?? ''; 
$page = $_GET['page'] ?? 1;
$records_per_page = $_GET['records_per_page'] ?? 10;

// Calcula el desplazamiento para la paginación (ejemplo: si la página es 2 y records_per_page es 10, offset es 10)
$offset = ($page - 1) * $records_per_page;

try {
    // Inicializamos la cláusula WHERE como cadena vacía para luego ir completándola si hay filtros
    $where = '';

    // Construye la cláusula WHERE para la búsqueda, si se proporciona un término de búsqueda
    // Esto busca coincidencias en los campos 'nombre', 'apPaterno', 'apMaterno' del usuario, o en 'titulo' del libro
    if (!empty($search)) {
        $where = "WHERE u.nombre LIKE '%$search%' OR u.apPaterno LIKE '%$search%' OR u.apMaterno LIKE '%$search%' OR l.titulo LIKE '%$search%'";
    }

    // Iniciamos la variable $order (para ORDER BY) como cadena vacía y luego agregamos según el filtro
    $order = '';
    // Determina el orden de los resultados según el filtro aplicado
    if ($filter == 'most_time') {
        // Si se recibe 'most_time', se ordena por mayor tiempo de lectura (tiempoLectura DESC)
        $order = "ORDER BY hl.tiempoLectura DESC";
    } else if ($filter == 'least_time') {
        // Si se recibe 'least_time', se ordena por menor tiempo de lectura (tiempoLectura ASC)
        $order = "ORDER BY hl.tiempoLectura ASC";
    }

    // Maneja las diferentes acciones solicitadas mediante el parámetro 'action'
    if ($action == 'read') {
        // Acción para leer registros con paginación

        // Consulta para obtener un subconjunto de registros con paginación
        // SQL_CALC_FOUND_ROWS permite luego usar FOUND_ROWS() y obtener el total sin otra consulta separada
        $query = "
            SELECT SQL_CALC_FOUND_ROWS hl.*, u.nombre as nombreUsuario, u.apPaterno, u.apMaterno, l.titulo as tituloLibro 
            FROM historiallectura hl
            JOIN usuarios u ON hl.idUsuario = u.id
            JOIN libros l ON hl.idLibro = l.id
            $where
            $order
            LIMIT $offset, $records_per_page
        ";
        $result = $conn->query($query);

        // Verifica si la consulta se ejecutó correctamente
        if (!$result) {
            throw new Exception("Error al ejecutar la consulta: " . $conn->error);
        }

        // Almacena los resultados en un arreglo
        $lecturas = [];
        while ($row = $result->fetch_assoc()) {
            $lecturas[] = $row;
        }

        // Obtiene el total de registros encontrados sin la limitación de paginación
        // Esto funciona en conjunto con SQL_CALC_FOUND_ROWS si la misma conexión se usa en ambas consultas
        $total_query = "SELECT FOUND_ROWS() as total";
        $total_result = $conn->query($total_query);
        if (!$total_result) {
            throw new Exception("Error al obtener el total de registros: " . $conn->error);
        }
        $total_row = $total_result->fetch_assoc();
        $total = $total_row['total']; // Número total de filas encontradas antes del LIMIT

        // Devuelve los resultados y el total en formato JSON
        echo json_encode(['lecturas' => $lecturas, 'total' => $total]);

    } else if ($action == 'read_all') {
        // Acción para leer todos los registros sin ninguna paginación

        // Consulta para obtener todos los registros (sin límites)
        $query = "
            SELECT hl.*, u.nombre as nombreUsuario, u.apPaterno, u.apMaterno, l.titulo as tituloLibro 
            FROM historiallectura hl
            JOIN usuarios u ON hl.idUsuario = u.id
            JOIN libros l ON hl.idLibro = l.id
            $where
            $order
        ";
        $result = $conn->query($query);

        // Verifica si la consulta se ejecutó correctamente
        if (!$result) {
            throw new Exception("Error al ejecutar la consulta: " . $conn->error);
        }

        // Almacena los resultados en un arreglo
        $lecturas = [];
        while ($row = $result->fetch_assoc()) {
            $lecturas[] = $row;
        }

        // Devuelve los resultados en formato JSON
        echo json_encode(['lecturas' => $lecturas]);

    } else if ($action == 'delete') {
        // Acción para eliminar uno o varios registros

        // Obtiene los datos enviados en el cuerpo de la petición (JSON)
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            throw new Exception("Datos inválidos recibidos para eliminación.");
        }
        
        // Convertimos el arreglo de IDs en una cadena separada por comas "1,2,3,..."
        $ids = implode(',', $data['ids']);

        // Consulta para eliminar los registros cuyo ID esté dentro de la lista
        $query = "DELETE FROM historiallectura WHERE id IN ($ids)";
        if (!$conn->query($query)) {
            throw new Exception("Error al eliminar registros: " . $conn->error);
        }

        // Devuelve una respuesta de éxito si no hubo problemas
        echo json_encode(['success' => true]);
    }
} catch (Exception $e) {
    // En caso de cualquier excepción, establecemos el código de respuesta HTTP a 500
    // y devolvemos el mensaje de error en formato JSON
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
