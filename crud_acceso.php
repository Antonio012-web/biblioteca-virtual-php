<?php
include('config.php'); // Conexión a la base de datos

// Activar mensajes de error (para depuración)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
// Estas directivas muestran los errores y advertencias en el navegador,
// útiles durante la fase de desarrollo o depuración. 
// Se recomienda desactivarlas en un entorno de producción.

// Verificamos si la conexión fue exitosa
if (!$conn) {
    // Si $conn es falso o nulo, significa que la conexión no se estableció correctamente
    error_log('Error en la conexión a la base de datos: ' . mysqli_connect_error());
    // Se registra el error en el log del servidor
    header('Content-Type: application/json');
    // Se indica que la respuesta será en formato JSON
    echo json_encode(['success' => false, 'message' => 'Error en la conexión a la base de datos']);
    // Se devuelve un objeto JSON informando que la conexión falló
    exit();
    // Se detiene la ejecución del script
}

// Verificamos qué tipo de solicitud es (GET o POST)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Si la petición es GET, revisamos si se quiere obtener la lista de accesos
    if (isset($_GET['action']) && $_GET['action'] === 'obtener_accesos') {
        // Si el parámetro 'action' es 'obtener_accesos', llamamos a la función correspondiente
        obtenerAccesos($conn);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Si la petición es POST, entonces se puede manejar la eliminación de registros (individual o masiva)
    if (isset($_POST['action'])) {
        $action = $_POST['action'];
        // Comprobamos el valor del parámetro 'action' para decidir la operación
        if ($action === 'eliminar_masivo') {
            eliminarAccesosMasivos($conn);
        } elseif ($action === 'eliminar') {
            eliminarAcceso($conn);
        }
    }
}

// ---------------------------------------------------------------------------------------------
// Función para obtener los accesos con paginación y un posible filtro de búsqueda
// ---------------------------------------------------------------------------------------------
function obtenerAccesos($conn) {
    $limit = 10; // Número de registros por página
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    // Si no se especifica la página, se asume la 1. De lo contrario, se convierte a entero.

    // Calculamos el desplazamiento (offset) en función de la página y el límite
    $offset = ($page - 1) * $limit;

    // Filtro de búsqueda opcional por nombre de usuario
    $filtro = isset($_GET['filtro']) ? $_GET['filtro'] : '';
    // Si no se envía 'filtro' por GET, queda como cadena vacía.

    // Armamos la cadena para usarla en el LIKE con comodines
    $filtro_param = "%$filtro%";

    // Consulta para contar el total de registros que coinciden con el filtro
    $totalQuery = "SELECT COUNT(*) as total FROM historialacceso ha
                   JOIN usuarios u ON ha.IdUsuario = u.id
                   WHERE u.nombre LIKE ?";
    // Se realiza un JOIN para poder filtrar por el nombre del usuario en la tabla "usuarios"

    $stmt_total = $conn->prepare($totalQuery);
    $stmt_total->bind_param("s", $filtro_param); 
    // "s" indica que es un parámetro de tipo string
    $stmt_total->execute();
    $totalResult = $stmt_total->get_result();
    $totalRow = $totalResult->fetch_assoc();
    // Tomamos la fila con el conteo total
    $total_records = $totalRow['total'];
    // Asignamos el número total de registros coincidentes al array
    $stmt_total->close();

    // Calcular el número total de páginas
    $total_pages = ceil($total_records / $limit);
    // Si tenemos, por ejemplo, 35 registros y el límite es 10, serán 4 páginas (porque 35/10 = 3.5, ceil() = 4)

    // Consulta para obtener los accesos con paginación y filtro aplicado
    // IFNULL(ha.tiempo_bloqueo, 'N/A') sirve para mostrar "N/A" si el campo es NULL
    $query = "SELECT ha.ID, u.nombre AS Usuario, ha.FechaHoraAcceso, ha.intentos_fallidos, ha.bloqueado, 
              IFNULL(ha.tiempo_bloqueo, 'N/A') AS tiempo_bloqueo
              FROM historialacceso ha
              JOIN usuarios u ON ha.IdUsuario = u.id
              WHERE u.nombre LIKE ?
              LIMIT ? OFFSET ?";
    // Se limita la consulta a un máximo de $limit registros y se inicia en $offset

    $stmt = $conn->prepare($query);
    $stmt->bind_param("sii", $filtro_param, $limit, $offset);
    // 'sii' -> first param is string, next two are integers (para LIMIT y OFFSET)
    $stmt->execute();
    $result = $stmt->get_result();

    $accesos = [];
    while ($row = $result->fetch_assoc()) {
        // Convertimos cada fila en un arreglo asociativo y lo agregamos al array $accesos
        $accesos[] = $row;
    }
    $stmt->close();

    // Devolver los accesos en formato JSON
    header('Content-Type: application/json');
    echo json_encode([
        'accesos' => $accesos,       // Lista de accesos encontrados
        'total' => $total_records,   // Cantidad total de registros antes de paginar
        'total_pages' => $total_pages, // Número total de páginas
        'current_page' => $page      // Página actual
    ]);
}

// ---------------------------------------------------------------------------------------------
// Función para eliminar varios accesos (eliminación masiva)
// ---------------------------------------------------------------------------------------------
function eliminarAccesosMasivos($conn) {
    // 'ids' se envía como JSON, por lo que lo decodificamos para obtener un array de IDs
    $ids = json_decode($_POST['ids'], true);

    if (is_array($ids) && count($ids) > 0) {
        // Creamos placeholders "?" en cantidad igual a la cantidad de IDs
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        // Ejemplo: si hay 3 IDs, genera "?,?,?"

        $query = "DELETE FROM historialacceso WHERE ID IN ($placeholders)";
        $stmt = $conn->prepare($query);

        $types = str_repeat('i', count($ids));
        // Cada ID es un entero, entonces por cada ID agregamos una "i" a la cadena $types

        $stmt->bind_param($types, ...$ids);
        // Ligamos los valores del array $ids a los placeholders

        if ($stmt->execute()) {
            // Si se ejecuta correctamente, enviamos una respuesta JSON de éxito
            header('Content-Type: application/json');
            http_response_code(200); // OK
            echo json_encode(['success' => true]);
        } else {
            // Si falla, enviamos un error en formato JSON
            header('Content-Type: application/json');
            http_response_code(500); // Error interno
            echo json_encode(['success' => false, 'message' => 'Error al eliminar los accesos seleccionados']);
        }
        $stmt->close();
    } else {
        // Si $ids no es un array o está vacío, respondemos con un error
        header('Content-Type: application/json');
        http_response_code(400); // Petición inválida
        echo json_encode(['success' => false, 'message' => 'IDs inválidos']);
    }
}

// ---------------------------------------------------------------------------------------------
// Función para eliminar un solo acceso
// ---------------------------------------------------------------------------------------------
function eliminarAcceso($conn) {
    // Convertimos el valor recibido a entero
    $id = intval($_POST['id']);

    $query = "DELETE FROM historialacceso WHERE ID = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        // Si no hay error de ejecución
        if ($stmt->affected_rows > 0) {
            // Si affected_rows > 0, significa que se borró un registro con ese ID
            header('Content-Type: application/json');
            http_response_code(200); // OK
            echo json_encode(['success' => true]);
        } else {
            // Si no se encontró el registro (0 filas afectadas)
            header('Content-Type: application/json');
            http_response_code(400); // Petición inválida
            echo json_encode(['success' => false, 'message' => 'No se encontró el acceso con ese ID']);
        }
    } else {
        // Ocurrió un error al ejecutar la consulta
        header('Content-Type: application/json');
        http_response_code(500); // Error interno
        echo json_encode(['success' => false, 'message' => 'Error al eliminar acceso']);
    }
    $stmt->close();
}

// Al terminar el script, cerramos la conexión con la base de datos
$conn->close();
