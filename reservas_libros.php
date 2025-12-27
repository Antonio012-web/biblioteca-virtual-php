<?php
// Código para gestionar las reservas de usuarios desde la página Catálogo de libros

// Se incluye el archivo de configuración para establecer la conexión a la base de datos.
include 'config.php';

// Se define el encabezado de la respuesta HTTP para indicar que el contenido será JSON.
header('Content-Type: application/json');

// Se establece la zona horaria para México, lo cual es importante para el registro de fechas.
date_default_timezone_set('America/Mexico_City');

// Se inicia la sesión para poder acceder y almacenar variables de sesión, como el token CSRF.
session_start();

// Se obtiene el parámetro 'action' desde la URL (GET) para determinar qué acción se debe ejecutar.
// Si no se especifica, se asigna una cadena vacía.
$action = $_GET['action'] ?? '';

// Si no existe un token CSRF en la sesión, se genera uno nuevo para proteger los formularios.
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

/**
 * Función para validar que el nombre cumpla con ciertos criterios:
 * - Debe iniciar con una letra mayúscula (incluyendo caracteres acentuados).
 * - Las palabras pueden estar separadas por espacios o guiones.
 * - Cada palabra debe contener al menos una vocal.
 *
 * @param string $nombre El nombre a validar.
 * @return bool Retorna true si el nombre es válido, false en caso contrario.
 */
function validarNombre($nombre) {
    $regex = '/^[A-ZÑÁÉÍÓÚÜ][a-zñáéíóúü]+(?:[\s-][A-ZÑÁÉÍÓÚÜ][a-zñáéíóúü]+)*$/';
    $hasVowel = '/[aeiouáéíóúüAEIOUÁÉÍÓÚÜ]/';
    // Se divide el nombre en palabras usando espacios como separador.
    $words = preg_split('/\s+/', $nombre);
    
    // Se recorre cada palabra para asegurarse de que contiene al menos una vocal y tiene más de un carácter.
    foreach ($words as $word) {
        if (!preg_match($hasVowel, $word) || strlen($word) <= 1) {
            return false;
        }
    }
    
    // Se valida el nombre completo contra el patrón definido.
    return preg_match($regex, $nombre);
}

/**
 * Función para verificar que el token CSRF enviado coincida con el almacenado en la sesión.
 *
 * @param string $token El token recibido en la solicitud.
 * @throws Exception Lanza una excepción si el token no es válido.
 */
function verificarCsrfToken($token) {
    if (!isset($_SESSION['csrf_token']) || $token !== $_SESSION['csrf_token']) {
        throw new Exception("Token CSRF no válido");
    }
}

try {
    // Acción para obtener los detalles de un libro, incluyendo información de reservas.
    if ($action == 'detalles') {
        // Se verifica que se haya proporcionado el parámetro 'id' del libro.
        if (!isset($_GET['id'])) {
            throw new Exception("ID no proporcionado");
        }

        $id = $_GET['id'];
        // Consulta SQL para obtener los detalles del libro y, de manera opcional, el idUsuario de una reserva con estado 'confirmada' o 'pendiente'.
        $query = "
            SELECT l.id, l.titulo, l.autor, l.categoria, l.añoPublicacion, l.descripcion, l.disponibilidad, l.imagen_libro, l.urlDescarga, r.idUsuario
            FROM libros l
            LEFT JOIN reservas r ON l.id = r.idLibro AND r.estado IN ('confirmada', 'pendiente')
            WHERE l.id = ?
        ";
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            throw new Exception("Error al preparar la consulta: " . $conn->error);
        }
        // Se vincula el parámetro del libro (id) a la consulta preparada.
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        // Si se encontró el libro...
        if ($result->num_rows > 0) {
            $data = $result->fetch_assoc();
            // Si el libro tiene asociado un idUsuario (es decir, existe una reserva activa)
            if ($data['idUsuario']) {
                // Se prepara una consulta para verificar que el usuario existe en la tabla 'usuarios'.
                $queryUsuario = "SELECT id FROM usuarios WHERE id = ?";
                $stmtUsuario = $conn->prepare($queryUsuario);
                if (!$stmtUsuario) {
                    throw new Exception("Error al preparar la consulta: " . $conn->error);
                }
                $stmtUsuario->bind_param("i", $data['idUsuario']);
                $stmtUsuario->execute();
                $resultUsuario = $stmtUsuario->get_result();
                // Se establece la bandera 'usuarioRegistrado' en true si se encuentra el usuario, o false en caso contrario.
                if ($resultUsuario->num_rows > 0) {
                    $data['usuarioRegistrado'] = true;
                } else {
                    $data['usuarioRegistrado'] = false;
                }
            } else {
                $data['usuarioRegistrado'] = false;
            }
            // Se devuelve la información del libro en formato JSON.
            echo json_encode($data);
        } else {
            throw new Exception("Libro no encontrado");
        }
    
    // Acción para realizar una reserva de un libro.
    } elseif ($action == 'reservar') {
        // Se verifica que se hayan enviado todos los parámetros necesarios mediante POST.
        if (!isset($_POST['nombreEstudiante']) || !isset($_POST['idLibro']) || !isset($_POST['password']) || !isset($_POST['csrfToken'])) {
            throw new Exception("Todos los campos son obligatorios");
        }

        // Se obtienen los datos enviados desde el formulario.
        $nombreEstudiante = $_POST['nombreEstudiante'];
        $idLibro = $_POST['idLibro'];
        $password = $_POST['password'];
        $csrfToken = $_POST['csrfToken'];
        // Se establece el estado de la reserva inicialmente como 'pendiente'.
        $estado = 'pendiente';

        // Se verifica el token CSRF para proteger contra ataques de falsificación.
        verificarCsrfToken($csrfToken);

        // Se valida el nombre del estudiante para asegurar que cumple con el formato esperado.
        if (!validarNombre($nombreEstudiante)) {
            throw new Exception("Nombre no válido. Asegúrese de que solo contenga letras, comience con una mayúscula y cada palabra contenga al menos una vocal.");
        }

        // Se obtiene la fecha y hora actual en la zona horaria de México para registrar el momento de la reserva.
        $fechaReserva = date('Y-m-d H:i:s');

        // Se prepara una consulta para obtener los datos del usuario a partir de su nombre completo concatenado.
        $queryEstudiante = "SELECT id, password FROM usuarios WHERE CONCAT(nombre, ' ', apPaterno, ' ', apMaterno) = ?";
        $stmtEstudiante = $conn->prepare($queryEstudiante);
        if (!$stmtEstudiante) {
            throw new Exception("Error al preparar la consulta: " . $conn->error);
        }
        $stmtEstudiante->bind_param("s", $nombreEstudiante);
        $stmtEstudiante->execute();
        $resultEstudiante = $stmtEstudiante->get_result();

        // Si se encontró el usuario...
        if ($resultEstudiante->num_rows > 0) {
            $userData = $resultEstudiante->fetch_assoc();
            $idUsuario = $userData['id'];  // Se obtiene el ID del usuario
            $hashedPassword = $userData['password'];

            // Se verifica que la contraseña proporcionada coincida con la almacenada (después de hacer hash).
            if (!password_verify($password, $hashedPassword)) {
                // Si la contraseña es incorrecta, se envía una respuesta indicando el error.
                echo json_encode(["password_incorrecta" => true]);
                return;
            }

            // Si la verificación de la contraseña es exitosa, se cambia el estado de la reserva a 'confirmada'
            // y se define un mensaje de confirmación.
            $estado = 'confirmada'; 
            $mensaje = "Reserva confirmada";

            // Se verifica que no exista ya una reserva confirmada para el mismo libro y usuario.
            $queryReserva = "SELECT * FROM reservas WHERE nombre = ? AND idLibro = ? AND estado = 'confirmada'";
            $stmtReserva = $conn->prepare($queryReserva);
            if (!$stmtReserva) {
                throw new Exception("Error al preparar la consulta: " . $conn->error);
            }
            $stmtReserva->bind_param("si", $nombreEstudiante, $idLibro);
            $stmtReserva->execute();
            $resultReserva = $stmtReserva->get_result();

            if ($resultReserva->num_rows > 0) {
                // Si ya existe una reserva confirmada, se notifica al usuario y se detiene la ejecución.
                echo json_encode(["error" => "Tu reserva en este libro ya está confirmada"]);
                return;
            }
        } else {
            // Si el usuario no se encuentra registrado, se informa que no es apto para realizar la reserva.
            echo json_encode(["registrado" => false, "message" => "No eres apto para realizar la reserva"]);
            return;
        }

        // Se prepara la consulta para insertar una nueva reserva en la tabla 'reservas'
        $query = "INSERT INTO reservas (nombre, idLibro, fechaReserva, estado, idUsuario) VALUES (?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            throw new Exception("Error al preparar la consulta: " . $conn->error);
        }
        // Se vinculan los parámetros: nombre del estudiante, ID del libro, fecha de reserva, estado y ID del usuario.
        $stmt->bind_param("sissi", $nombreEstudiante, $idLibro, $fechaReserva, $estado, $idUsuario);
        if ($stmt->execute()) {
            // Si la inserción es exitosa, se obtiene el título del libro para utilizarlo en la notificación.
            $queryLibro = "SELECT titulo FROM libros WHERE id = ?";
            $stmtLibro = $conn->prepare($queryLibro);
            $stmtLibro->bind_param("i", $idLibro);
            $stmtLibro->execute();
            $resultLibro = $stmtLibro->get_result();
            if ($resultLibro->num_rows > 0) {
                $rowLibro = $resultLibro->fetch_assoc();
                $tituloLibro = $rowLibro['titulo'];
            } else {
                $tituloLibro = "Libro desconocido";
            }
            // Se inserta una notificación en la tabla 'notificaciones' para informar sobre la reserva.
            $queryNotificacion = "INSERT INTO notificaciones (idUsuario, tipo, mensaje, fecha) VALUES (?, ?, ?, NOW())";
            $stmtNot = $conn->prepare($queryNotificacion);
            if ($stmtNot) {
                $tipoNot = 'reserva';
                $mensajeNot = "Nueva Reserva confirmada para el libro $tituloLibro por el usuario $nombreEstudiante.";
                $stmtNot->bind_param("iss", $idUsuario, $tipoNot, $mensajeNot);
                $stmtNot->execute();
            }
            // Se devuelve una respuesta JSON con el mensaje de confirmación y algunos datos relevantes.
            echo json_encode(["message" => $mensaje, "idLibro" => $idLibro, "estado" => $estado, "idUsuario" => $idUsuario]);
        } else {
            throw new Exception("Error al realizar la reserva: " . $stmt->error);
        }
    
    // Acción para consultar el estado de las reservas en general.
    } elseif ($action == 'check_status') {
        // Se seleccionan los ID de los libros que tienen reservas en estado 'confirmada' o 'pendiente'.
        $query = "SELECT DISTINCT idLibro FROM reservas WHERE estado IN ('confirmada', 'pendiente')";
        $result = $conn->query($query);
        $confirmed = [];
        // Se recorre el resultado y se almacena cada registro en el arreglo $confirmed.
        while ($row = $result->fetch_assoc()) {
            $confirmed[] = $row;
        }
        // Se devuelve el arreglo de libros con reservas confirmadas o pendientes.
        echo json_encode(["confirmed" => $confirmed]);
    
    // Acción para verificar el estado de la reserva de un libro y obtener el contador de "Me gusta" de reseñas.
    } elseif ($action == 'check_reserva') {
        // Se obtiene el ID del libro desde POST y se asume que el ID del usuario está almacenado en la sesión.
        $idLibro = $_POST['idLibro'] ?? null;
        $idUsuario = $_SESSION['user_id'] = $idUsuario ?? null;  // Asumimos que el ID del usuario está en la sesión

        if ($idLibro) {
            // Se consulta si existe una reserva confirmada para el libro y el usuario.
            $queryReserva = "SELECT estado FROM reservas WHERE idLibro = ? AND idUsuario = ? AND estado = 'confirmada'";
            $stmtReserva = $conn->prepare($queryReserva);
            $stmtReserva->bind_param("ii", $idLibro, $idUsuario);
            $stmtReserva->execute();
            $resultReserva = $stmtReserva->get_result();
            $reservaConfirmada = ($resultReserva->num_rows > 0);

            // Se consulta la cantidad de "Me gusta" (reseñas con puntuación 1) para el libro.
            $queryLikes = "SELECT COUNT(*) as totalLikes FROM reseñas WHERE idLibro = ? AND Puntuacion = 1";
            $stmtLikes = $conn->prepare($queryLikes);
            $stmtLikes->bind_param("i", $idLibro);
            $stmtLikes->execute();
            $resultLikes = $stmtLikes->get_result();
            $totalLikes = $resultLikes->fetch_assoc()['totalLikes'];

            // Se devuelve la información de la reserva y el total de "Me gusta" en formato JSON.
            echo json_encode([
                'reservaConfirmada' => $reservaConfirmada,
                'totalLikes' => $totalLikes
            ]);
        } else {
            echo json_encode(['error' => 'Faltan parámetros']);
        }
    
    // Acción para insertar el inicio de una sesión de lectura en el historial.
    } elseif ($action == 'insert') {
        // Se verifica que se hayan enviado todos los campos obligatorios para registrar el inicio de la lectura.
        if (!isset($_POST['idUsuario']) || !isset($_POST['idLibro']) || !isset($_POST['fechaInicioLectura']) || !isset($_POST['csrfToken'])) {
            throw new Exception("Todos los campos son obligatorios para registrar el inicio de la lectura");
        }

        $idUsuario = $_POST['idUsuario'];
        $idLibro = $_POST['idLibro'];
        $fechaInicioLectura = $_POST['fechaInicioLectura'];
        $csrfToken = $_POST['csrfToken'];

        // Se verifica el token CSRF.
        verificarCsrfToken($csrfToken);

        // Se consulta si el usuario existe en la tabla 'usuarios'.
        $queryUsuario = "SELECT id FROM usuarios WHERE id = ?";
        $stmtUsuario = $conn->prepare($queryUsuario);
        if (!$stmtUsuario) {
            throw new Exception("Error al preparar la consulta: " . $conn->error);
        }
        $stmtUsuario->bind_param("i", $idUsuario);
        $stmtUsuario->execute();
        $resultUsuario = $stmtUsuario->get_result();

        // Si el usuario no se encuentra registrado, se devuelve un error.
        if ($resultUsuario->num_rows == 0) {
            echo json_encode(["error" => "Usuario no registrado"]);
            return;
        }

        // Se inserta un nuevo registro en la tabla 'historiallectura' para marcar el inicio de la lectura.
        $query = "INSERT INTO historiallectura (idUsuario, idLibro, fechaInicioLectura) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            throw new Exception("Error al preparar la consulta: " . $conn->error);
        }
        $stmt->bind_param("iis", $idUsuario, $idLibro, $fechaInicioLectura);
        if ($stmt->execute()) {
            echo json_encode(["message" => "Inicio de lectura registrado"]);
        } else {
            throw new Exception("Error al registrar el inicio de la lectura: " . $stmt->error);
        }
    
    // Acción para actualizar el final de una sesión de lectura en el historial.
    } elseif ($action == 'update') {
        // Se verifica que se hayan enviado todos los campos obligatorios para actualizar el fin de la lectura.
        if (!isset($_POST['idUsuario']) || !isset($_POST['idLibro']) || !isset($_POST['fechaFinLectura']) || !isset($_POST['tiempoLectura']) || !isset($_POST['csrfToken'])) {
            throw new Exception("Todos los campos son obligatorios para actualizar el fin de la lectura");
        }

        $idUsuario = $_POST['idUsuario'];
        $idLibro = $_POST['idLibro'];
        $fechaFinLectura = $_POST['fechaFinLectura'];
        $tiempoLectura = $_POST['tiempoLectura'];
        $csrfToken = $_POST['csrfToken'];

        // Se verifica el token CSRF.
        verificarCsrfToken($csrfToken);

        // Se consulta si el usuario existe en la tabla 'usuarios'.
        $queryUsuario = "SELECT id FROM usuarios WHERE id = ?";
        $stmtUsuario = $conn->prepare($queryUsuario);
        if (!$stmtUsuario) {
            throw new Exception("Error al preparar la consulta: " . $conn->error);
        }
        $stmtUsuario->bind_param("i", $idUsuario);
        $stmtUsuario->execute();
        $resultUsuario = $stmtUsuario->get_result();

        // Si el usuario no se encuentra registrado, se devuelve un error.
        if ($resultUsuario->num_rows == 0) {
            echo json_encode(["error" => "Usuario no registrado"]);
            return;
        }

        // Se actualiza el registro en 'historiallectura' estableciendo la fecha final y el tiempo de lectura,
        // para el registro correspondiente al usuario y libro, siempre que aún no se haya registrado el fin.
        $query = "UPDATE historiallectura SET fechaFinLectura = ?, tiempoLectura = ? WHERE idUsuario = ? AND idLibro = ? AND fechaFinLectura IS NULL";
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            throw new Exception("Error al preparar la consulta: " . $conn->error);
        }
        $stmt->bind_param("siii", $fechaFinLectura, $tiempoLectura, $idUsuario, $idLibro);
        if ($stmt->execute()) {
            echo json_encode(["message" => "Fin de lectura registrado"]);
        } else {
            throw new Exception("Error al registrar el fin de la lectura: " . $stmt->error);
        }
    
    // Si la acción especificada no coincide con ninguna de las anteriores, se lanza una excepción.
    } else {
        throw new Exception("Acción no válida");
    }
} catch (Exception $e) {
    // En caso de error, se registra el mensaje de error en el log del servidor y se devuelve una respuesta JSON con el error.
    error_log("Error: " . $e->getMessage());
    echo json_encode(["error" => $e->getMessage()]);
}
?>
