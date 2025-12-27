<?php
date_default_timezone_set('America/Mexico_City');
// Se incluye el archivo de configuración que contiene la conexión a la base de datos.
// Este archivo define la variable $conn que se usará para ejecutar consultas SQL.
include 'config.php';

// Se inicia la sesión para poder utilizar variables de sesión, lo que permite verificar si el usuario está autenticado.
session_start();

// Se verifica que la solicitud HTTP se haya realizado utilizando el método POST.
// Esto es importante para asegurar que los datos provengan de un formulario o petición segura.
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Se obtienen los datos enviados mediante POST:
    // - idUsuario: el identificador del usuario que está realizando el comentario.
    // - idLibro: el identificador del libro sobre el que se realiza la reseña.
    // - reseña: el contenido textual de la reseña que el usuario escribió.
    $idUsuario = $_POST['idUsuario'];
    $idLibro = $_POST['idLibro'];
    $reseña = $_POST['reseña'];

    // Se valida que el idUsuario esté presente.
    // Si no se recibe un idUsuario, se asume que el usuario no está autenticado y se finaliza la ejecución.
    if (!$idUsuario) {
        echo json_encode(['error' => 'Usuario no autenticado']);
        exit;
    }
 
    // Se prepara una consulta para verificar si ya existe una reseña registrada en la base de datos
    // para el mismo usuario y el mismo libro.
    $stmt = $conn->prepare("SELECT * FROM reseñas WHERE idUsuario = ? AND idLibro = ?");
    $stmt->bind_param("ii", $idUsuario, $idLibro);
    $stmt->execute();
    $result = $stmt->get_result();

    // Se comprueba el número de registros obtenidos.
    // Si ya existe al menos una reseña, se procederá a actualizar la reseña existente.
    if ($result->num_rows > 0) {
        // Actualiza la reseña existente estableciendo el nuevo contenido y la fecha de actualización a la fecha actual.
        $stmt = $conn->prepare("UPDATE reseñas SET Reseña = ?, FechaReseña = NOW() WHERE idUsuario = ? AND idLibro = ?");
        $stmt->bind_param("sii", $reseña, $idUsuario, $idLibro);
    } else {
        // Si no existe una reseña previa para este usuario y libro, se inserta un nuevo registro en la tabla.
        // La fecha de la reseña se establece automáticamente a la fecha y hora actuales utilizando NOW().
        $stmt = $conn->prepare("INSERT INTO reseñas (idUsuario, idLibro, Reseña, FechaReseña) VALUES (?, ?, ?, NOW())");
        $stmt->bind_param("iis", $idUsuario, $idLibro, $reseña);
    }

    // Se ejecuta la consulta preparada (ya sea la de actualización o la de inserción).
    if ($stmt->execute()) {
        // Si la operación fue exitosa, se procede a obtener información adicional para la notificación.

        // Se prepara una consulta para obtener el nombre completo del usuario que ha comentado.
        // Se utiliza la función CONCAT en SQL para unir el nombre, apellido paterno y apellido materno.
        $queryUser = "SELECT CONCAT(nombre, ' ', apPaterno, ' ', apMaterno) AS nombreCompleto FROM usuarios WHERE id = ?";
        $stmtUser = $conn->prepare($queryUser);
        $stmtUser->bind_param("i", $idUsuario);
        $stmtUser->execute();
        $resultUser = $stmtUser->get_result();
        if ($resultUser->num_rows > 0) {
            $rowUser = $resultUser->fetch_assoc();
            $nombreCompleto = $rowUser['nombreCompleto'];
        } else {
            // Si no se encuentra al usuario, se asigna un valor predeterminado.
            $nombreCompleto = "Usuario desconocido";
        }

        // Se prepara una consulta para obtener el título del libro que está siendo comentado.
        $queryLibro = "SELECT titulo FROM libros WHERE id = ?";
        $stmtLibro = $conn->prepare($queryLibro);
        $stmtLibro->bind_param("i", $idLibro);
        $stmtLibro->execute();
        $resultLibro = $stmtLibro->get_result();
        if ($resultLibro->num_rows > 0) {
            $rowLibro = $resultLibro->fetch_assoc();
            $tituloLibro = $rowLibro['titulo'];
        } else {
            // Si el libro no se encuentra, se asigna un valor predeterminado.
            $tituloLibro = "Libro desconocido";
        }

        // Se inserta una notificación en la tabla 'notificaciones' para informar que se ha realizado un nuevo comentario.
        // La notificación incluye el id del usuario, el tipo de notificación ('comentario') y un mensaje informativo.
        $queryNotificacion = "INSERT INTO notificaciones (idUsuario, tipo, mensaje, fecha) VALUES (?, ?, ?, NOW())";
        $stmtNot = $conn->prepare($queryNotificacion);
        if ($stmtNot) {
            // Se define el tipo de notificación.
            $tipo = 'comentario';
            // Se construye el mensaje que será mostrado en la notificación.
            $mensajeNot = "Nuevo comentario realizado por el usuario $nombreCompleto en el libro $tituloLibro.";
            $stmtNot->bind_param("iss", $idUsuario, $tipo, $mensajeNot);
            $stmtNot->execute();
        }

        // Se devuelve una respuesta exitosa al cliente en formato JSON.
        echo json_encode(['message' => '¡Gracias por comentar este libro!']);
    } else {
        // Si ocurre algún error durante la inserción o actualización de la reseña, se notifica el error.
        echo json_encode(['error' => 'Error al registrar comentario']);
    }
}
?>
