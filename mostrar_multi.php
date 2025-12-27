<?php
// Se incluye el archivo de configuración que establece la conexión a la base de datos.
include 'config.php'; // Conexión a la base de datos

// Se establece el encabezado HTTP para indicar que la respuesta será en formato JSON.
header('Content-Type: application/json');

// Se obtienen los parámetros de la URL (GET) y se asignan valores predeterminados si alguno falta:
// - 'tipo': Tipo de contenido multimedia a filtrar; por defecto se usa "Video".
// - 'cantidad': Número de registros a mostrar por página; por defecto es 5.
// - 'page': Número de página actual para paginación; por defecto es 1.
// - 'nivel': Filtro opcional por nivel educativo; si no se especifica, se deja vacío.
// - 'fecha': Orden de los registros según la fecha de publicación; por defecto es 'desc' (descendente).
$tipo = isset($_GET['tipo']) ? $_GET['tipo'] : 'Video';
$cantidad = isset($_GET['cantidad']) ? (int)$_GET['cantidad'] : 5;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$nivel = isset($_GET['nivel']) ? $_GET['nivel'] : '';
$fecha = isset($_GET['fecha']) ? $_GET['fecha'] : 'desc';

// Se calcula el desplazamiento (offset) para la consulta SQL según la página actual y la cantidad de registros por página.
$offset = ($page - 1) * $cantidad; 

// Se construye la consulta SQL para obtener los registros de la tabla 'multimedia'.
// Se seleccionan columnas relevantes y se filtra por el tipo de contenido.
$sql = "SELECT id, titulo, descripcion, tipo, url, autor, fecha_publicacion, etiquetas, nivel_educativo 
        FROM multimedia 
        WHERE tipo = ?";

// Si se ha especificado un filtro por nivel educativo, se añade una condición adicional a la consulta.
if ($nivel) {
    $sql .= " AND nivel_educativo = ?";
}

// Se añade la cláusula ORDER BY para ordenar los resultados por fecha de publicación según el orden indicado (ascendente o descendente).
// Además, se limita el número de registros devueltos y se define el desplazamiento para la paginación.
$sql .= " ORDER BY fecha_publicacion $fecha LIMIT ? OFFSET ?";

// Se prepara la consulta SQL para evitar inyecciones y manejar los parámetros de forma segura.
$stmt = $conn->prepare($sql);

// Se vinculan los parámetros a la consulta preparada.
// Si se aplica el filtro de nivel, se vinculan cuatro parámetros: tipo (string), nivel (string), cantidad (entero) y offset (entero).
if ($nivel) {
    $stmt->bind_param("ssii", $tipo, $nivel, $cantidad, $offset);
} else {
    // Si no se filtra por nivel, se vinculan tres parámetros: tipo (string), cantidad (entero) y offset (entero).
    $stmt->bind_param("sii", $tipo, $cantidad, $offset);
}

// Se ejecuta la consulta preparada.
$stmt->execute();

// Se obtienen los resultados de la consulta.
$result = $stmt->get_result();

// Se inicializa un arreglo para almacenar los registros obtenidos.
$multimedia = [];
while ($row = $result->fetch_assoc()) {
    $multimedia[] = $row;
}

// Para la paginación, se necesita conocer el total de registros que cumplen con el filtro por 'tipo'.
// Se prepara una consulta SQL que cuenta el número total de registros en la tabla 'multimedia' para el tipo especificado.
$sql_count = "SELECT COUNT(*) AS total FROM multimedia WHERE tipo = ?";
$stmt_count = $conn->prepare($sql_count);
$stmt_count->bind_param("s", $tipo);
$stmt_count->execute();
// Se extrae el total de registros del resultado.
$total_items = $stmt_count->get_result()->fetch_assoc()['total'];
// Se calcula el número total de páginas dividiendo el total de registros por la cantidad de registros por página, redondeando hacia arriba.
$total_pages = ceil($total_items / $cantidad);

// Se devuelve la respuesta en formato JSON, incluyendo:
// - 'data': arreglo de registros de multimedia.
// - 'total_pages': número total de páginas disponibles.
// - 'total_records': total de registros que cumplen con el filtro.
// - 'current_page': página actual solicitada.
echo json_encode([
    'data' => $multimedia,
    'total_pages' => $total_pages,
    'total_records' => $total_items,
    'current_page' => $page
]);

// Se cierra la sentencia preparada y la conexión a la base de datos para liberar recursos.
$stmt->close();
$conn->close(); 
?>
