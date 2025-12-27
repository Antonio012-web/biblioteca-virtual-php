<?php
// crud_libros.php
ini_set('display_errors', 0);  // No imprimir errores en la salida (evita HTML mezclado en JSON)
ini_set('log_errors', 1);
error_reporting(E_ALL);
// Las directivas anteriores configuran la forma en que PHP maneja los errores:
// - display_errors en 0 evita que se muestren en pantalla (útil en producción para no mezclar HTML con JSON).
// - log_errors en 1 registra los errores en el log del servidor.
// - error_reporting(E_ALL) habilita la captura de todos los niveles de error.

header('Content-Type: application/json');
// Configuramos la cabecera para indicar que la respuesta se devolverá en formato JSON.

// Incluye archivo de config con la conexión $conn
include 'config.php';
// Aquí se cargan las credenciales y la conexión a la base de datos en la variable $conn.

// Asegura la zona horaria
date_default_timezone_set('America/Mexico_City');
// Define la zona horaria (en este caso, la de Ciudad de México).

// Acción
$action = $_GET['action'] ?? '';
// Se obtiene la acción a realizar desde los parámetros de la URL (GET). 
// Si no está definida, se asigna cadena vacía.

// Switch
switch ($action) {
    case 'create':
        createBook();
        break;
    case 'read':
        readBooks();
        break;
    case 'update':
        updateBook();
        break;
    case 'delete':
        deleteBook();
        break;
    case 'import':
        importBooks(); // La nueva acción de import con detalles
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
}
// Dependiendo del valor de $action, se llama a una de las funciones para crear, leer, actualizar,
// eliminar o importar libros. Si la acción no coincide con ninguna, se responde con "Acción no válida".

// --------------------------------------------
// FUNCIONES AUXILIARES

function isValidURL($url) {
    // Comprueba si la cadena $url es una URL válida usando filter_var
    return filter_var($url, FILTER_VALIDATE_URL) !== false;
}

// Permite letras, espacios y comas
// Permite letras, dígitos, espacios, comas, puntos y paréntesis
function validarTituloAutorCategoriaGrado($input) {
    // Aplica una expresión regular para restringir los caracteres permitidos.
    // 'u' al final habilita soporte para Unicode (acentos, caracteres especiales).
    return preg_match('/^[a-zA-Z0-9.,()áéíóúÁÉÍÓÚñÑ\s]+$/u', $input);
}

// Permite letras, dígitos, espacios y signos básicos
function validarDescripcion($input) {
    // Otra expresión regular para validar los caracteres permitidos en la descripción.
    return preg_match('/^[\wáéíóúÁÉÍÓÚñÑ.,!?¡¿\s]+$/u', $input);
}

// --------------------------------------------
// CREATE
function createBook() {
    global $conn;
    // Al usar 'global', accedemos a la variable $conn definida en el ámbito global.

    // Recogemos los datos enviados por POST
    $titulo         = trim($_POST['titulo']);
    $autor          = trim($_POST['autor']);
    $categoria      = trim($_POST['categoria']);
    $grado          = trim($_POST['grado']);
    $añoPublicacion = trim($_POST['añoPublicacion']);
    $descripcion    = trim($_POST['descripcion']);
    $disponibilidad = trim($_POST['disponibilidad']);
    $urlDescarga    = trim($_POST['urlDescarga']);
    $imagen_libro   = trim($_POST['imagen_libro']);

    // Validaciones mínimas y obligatorias
    if (empty($titulo) || empty($autor) || empty($categoria) || empty($grado)
        || empty($descripcion) || empty($urlDescarga) || empty($imagen_libro)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
        return;
    }
    // Verificamos el uso de caracteres permitidos
    if (!validarTituloAutorCategoriaGrado($titulo) || !validarTituloAutorCategoriaGrado($autor) || !validarTituloAutorCategoriaGrado($categoria) || !validarTituloAutorCategoriaGrado($grado)) {
        echo json_encode(['success' => false, 'message' => 'Título, Autor y Categoría deben contener letras, espacios y comas.']);
        return;
    }
    if (!validarDescripcion($descripcion)) {
        echo json_encode(['success' => false, 'message' => 'Descripción con caracteres no permitidos.']);
        return;
    }
    // Verificamos que sean URLs válidas
    if (!isValidURL($urlDescarga) || !isValidURL($imagen_libro)) {
        echo json_encode(['success' => false, 'message' => 'URLs inválidas para descarga o imagen.']);
        return;
    }

    // Checar si ya existe un libro con el mismo título o urlDescarga
    $sqlCheck = "SELECT id FROM libros WHERE titulo = ? OR urlDescarga = ?";
    $stmt = $conn->prepare($sqlCheck);
    $stmt->bind_param('ss', $titulo, $urlDescarga);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'El título o la URL de descarga ya existen.']);
        return;
    }

    // Si todo está bien, realizamos la inserción en la base de datos
    $sql = "INSERT INTO libros (titulo, autor, categoria, grado, añoPublicacion, descripcion, disponibilidad, urlDescarga, imagen_libro)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sssssssss', $titulo, $autor, $categoria, $grado, $añoPublicacion, $descripcion, $disponibilidad, $urlDescarga, $imagen_libro);

    if ($stmt->execute()) {
        // Respuesta exitosa
        echo json_encode(['success' => true, 'message' => 'Libro creado exitosamente']);
    } else {
        // Respuesta de error en caso de falla de SQL
        echo json_encode(['success' => false, 'message' => 'Error al crear el libro: ' . $stmt->error]);
    }
}

// --------------------------------------------
// READ
function readBooks() {
    global $conn;
    // Verificamos si se envió un 'id' como filtro (GET[id]), para buscar un libro específico
    $id = $_GET['id'] ?? '';

    if ($id) {
        // Si existe, construimos la consulta para un libro en particular
        $sql = "SELECT * FROM libros WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $book = $result->fetch_assoc();
            // Retornamos solo ese libro
            echo json_encode(['success' => true, 'book' => $book]);
        } else {
            // No se encontró el libro con ese ID
            echo json_encode(['success' => false, 'message' => 'Libro no encontrado.']);
        }
    } else {
        // Si no se envió un ID, retornamos todos los libros
        $sql = "SELECT * FROM libros";
        $result = $conn->query($sql);
        $books = [];
        while ($row = $result->fetch_assoc()) {
            $books[] = $row;
        }
        echo json_encode(['success' => true, 'books' => $books]);
    }
}

// --------------------------------------------
// UPDATE
function updateBook() {
    global $conn;

    // Recibimos los datos por POST
    $id             = $_POST['id'];
    $titulo         = trim($_POST['titulo']);
    $autor          = trim($_POST['autor']);
    $categoria      = trim($_POST['categoria']);
    $grado          = trim($_POST['grado']);
    $añoPublicacion = trim($_POST['añoPublicacion']);
    $descripcion    = trim($_POST['descripcion']);
    $disponibilidad = trim($_POST['disponibilidad']);
    $urlDescarga    = trim($_POST['urlDescarga']);
    $imagen_libro   = trim($_POST['imagen_libro']);

    // Validaciones
    if (empty($titulo) || empty($autor) || empty($categoria) || empty($grado)
        || empty($descripcion) || empty($urlDescarga) || empty($imagen_libro)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
        return;
    }
    if (!validarTituloAutorCategoriaGrado($titulo) || !validarTituloAutorCategoriaGrado($autor) || !validarTituloAutorCategoriaGrado($categoria) || !validarTituloAutorCategoriaGrado($grado)) {
        echo json_encode(['success' => false, 'message' => 'Título, Autor y Categoría con caracteres no permitidos.']);
        return;
    }
    if (!validarDescripcion($descripcion)) {
        echo json_encode(['success' => false, 'message' => 'Descripción con caracteres no permitidos.']);
        return;
    }
    if (!isValidURL($urlDescarga) || !isValidURL($imagen_libro)) {
        echo json_encode(['success' => false, 'message' => 'URLs inválidas para descarga o imagen.']);
        return;
    }

    // Checar duplicado en otro registro que no sea el actual
    $sqlCheck = "SELECT id FROM libros WHERE (titulo = ? OR urlDescarga = ?) AND id != ?";
    $stmt = $conn->prepare($sqlCheck);
    $stmt->bind_param('ssi', $titulo, $urlDescarga, $id);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'El título o la URL de descarga ya existen.']);
        return;
    }

    // Actualizar el registro con los datos recibidos
    $sql = "UPDATE libros
            SET titulo=?, autor=?, categoria=?, grado=?, añoPublicacion=?, descripcion=?, disponibilidad=?, urlDescarga=?, imagen_libro=?
            WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sssssssssi', $titulo, $autor, $categoria, $grado, $añoPublicacion, $descripcion, $disponibilidad, $urlDescarga, $imagen_libro, $id);

    if ($stmt->execute()) {
        // Éxito en la actualización
        echo json_encode(['success' => true, 'message' => 'Libro actualizado exitosamente']);
    } else {
        // Error en la ejecución de la actualización
        echo json_encode(['success' => false, 'message' => 'Error al actualizar el libro: ' . $stmt->error]);
    }
}

// --------------------------------------------
// DELETE
function deleteBook() {
    global $conn;
    // Obtenemos el ID del libro a eliminar por GET
    $id = $_GET['id'] ?? 0;

    $sql = "DELETE FROM libros WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        // Se eliminó satisfactoriamente
        echo json_encode(['success' => true, 'message' => 'Libro eliminado exitosamente']);
    } else {
        // Hubo un error en la eliminación
        echo json_encode(['success' => false, 'message' => 'Error al eliminar el libro: ' . $stmt->error]);
    }
}

// --------------------------------------------
// IMPORT con DETALLES
function importBooks() {
    global $conn;

    // Leemos los datos crudos enviados en la petición (JSON)
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    // Verificamos si se envió correctamente un array 'booksData'
    if (!isset($data['booksData']) || !is_array($data['booksData'])) {
        echo json_encode(['success' => false, 'message' => 'No se recibieron datos de libros.']);
        return;
    }

    $booksData = $data['booksData'];
    $contadorInsertados = 0;
    $contadorOmitidos   = 0;
    $detalles           = [];

    foreach ($booksData as $index => $row) {
        // Para cada fila, leemos los campos y los limpiamos con real_escape_string
        $titulo         = $conn->real_escape_string(trim($row['titulo']         ?? ''));
        $autor          = $conn->real_escape_string(trim($row['autor']          ?? ''));
        $categoria      = $conn->real_escape_string(trim($row['categoria']      ?? ''));
        $grado          = $conn->real_escape_string(trim($row['grado']          ?? ''));
        $descripcion    = $conn->real_escape_string(trim($row['descripcion']    ?? ''));
        $disponibilidad = $conn->real_escape_string(trim($row['disponibilidad'] ?? ''));
        $urlDescarga    = $conn->real_escape_string(trim($row['urlDescarga']    ?? ''));
        $imagen_libro   = $conn->real_escape_string(trim($row['imagen_libro']   ?? ''));
        $añoPublicacion = $conn->real_escape_string(trim($row['añoPublicacion'] ?? ''));

        // Validaciones mínimas para cada libro que se intenta importar
        if (!$titulo || !$autor || !$categoria || !$grado || !$descripcion
            || !$disponibilidad || !$urlDescarga || !$imagen_libro) {
            $contadorOmitidos++;
            $detalles[] = [
                'fila'   => $index+1,
                'exito'  => false,
                'motivo' => 'Campos obligatorios vacíos.'
            ];
            continue;
        }
        if (!validarTituloAutorCategoriaGrado($titulo) 
         || !validarTituloAutorCategoriaGrado($autor) 
         || !validarTituloAutorCategoriaGrado($categoria)
         || !validarTituloAutorCategoriaGrado($grado)) {
            $contadorOmitidos++;
            $detalles[] = [
                'fila'   => $index+1,
                'exito'  => false,
                'motivo' => 'Título, Autor o Categoría con caracteres no permitidos.'
            ];
            continue;
        }
        if (!validarDescripcion($descripcion)) {
            $contadorOmitidos++;
            $detalles[] = [
                'fila'   => $index+1,
                'exito'  => false,
                'motivo' => 'Descripción con caracteres no permitidos.'
            ];
            continue;
        }
        if (!isValidURL($urlDescarga) || !isValidURL($imagen_libro)) {
            $contadorOmitidos++;
            $detalles[] = [
                'fila'   => $index+1,
                'exito'  => false,
                'motivo' => 'URL de descarga o de imagen inválida.'
            ];
            continue;
        }

        // Checar duplicado por título o urlDescarga
        $sqlCheck = "SELECT id FROM libros WHERE titulo = ? OR urlDescarga = ?";
        $stmt = $conn->prepare($sqlCheck);
        $stmt->bind_param('ss', $titulo, $urlDescarga);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res->num_rows > 0) {
            $contadorOmitidos++;
            $detalles[] = [
                'fila'   => $index+1,
                'exito'  => false,
                'motivo' => 'Título o URL de descarga duplicados.'
            ];
            continue;
        }

        // Insertar el libro
        $sqlInsert = "INSERT INTO libros (titulo, autor, categoria, grado, añoPublicacion,
            descripcion, disponibilidad, urlDescarga, imagen_libro)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt2 = $conn->prepare($sqlInsert);
        $stmt2->bind_param('sssssssss', $titulo, $autor, $categoria, $grado, $añoPublicacion,
                                        $descripcion, $disponibilidad, $urlDescarga, $imagen_libro);

        if ($stmt2->execute()) {
            // Se insertó con éxito
            $contadorInsertados++;
            $detalles[] = [
                'fila'   => $index+1,
                'exito'  => true,
                'motivo' => 'Insertado correctamente.'
            ];
        } else {
            // Error en la inserción
            $contadorOmitidos++;
            $detalles[] = [
                'fila'   => $index+1,
                'exito'  => false,
                'motivo' => 'Error en la inserción: ' . $stmt2->error
            ];
        }
    }

    // Al terminar de procesar todos los libros, construimos la respuesta JSON
    echo json_encode([
        'success' => true,
        'message' => "Importación completada: $contadorInsertados insertados, $contadorOmitidos omitidos.",
        'detalles' => $detalles
    ]);
}
?>
