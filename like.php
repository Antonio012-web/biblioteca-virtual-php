<?php
// Incluir la configuración que establece la conexión a la base de datos
include 'config.php';

// Verificar que la solicitud se realice mediante el método POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Obtener los parámetros 'idUsuario' y 'idLibro' desde $_POST.
    // Se usa el operador null coalescing (??) para asignar null si no se envían.
    $idUsuario = $_POST['idUsuario'] ?? null;
    $idLibro = $_POST['idLibro'] ?? null;

    // Verificar que ambos parámetros estén presentes; de lo contrario, se devuelve un error en JSON
    if ($idUsuario && $idLibro) {
        // -----------------------------------------------------------------
        // Paso 1: Verificar si el usuario ya ha dado "me gusta" a este libro.
        // Se asume que un "me gusta" se registra con Puntuacion = 1 en la tabla 'reseñas'
        // -----------------------------------------------------------------
        $query = "SELECT id FROM reseñas WHERE idUsuario = ? AND idLibro = ? AND Puntuacion = 1";
        $stmt = $conn->prepare($query);
        // "ii" indica que ambos parámetros son enteros
        $stmt->bind_param("ii", $idUsuario, $idLibro);
        $stmt->execute();
        $result = $stmt->get_result();

        // Si se encontró al menos un registro, el usuario ya le dio "me gusta" al libro
        if ($result->num_rows > 0) {
            // -----------------------------------------------------------------
            // Paso 2a: Si ya existe el like, se elimina (toggle off)
            // Se prepara una consulta para eliminar el registro de "me gusta"
            // -----------------------------------------------------------------
            $queryDelete = "DELETE FROM reseñas WHERE idUsuario = ? AND idLibro = ? AND Puntuacion = 1";
            $stmtDelete = $conn->prepare($queryDelete);
            $stmtDelete->bind_param("ii", $idUsuario, $idLibro);
            if ($stmtDelete->execute()) {
                // -----------------------------------------------------------------
                // Actualizar el contador de "me gusta" para el libro.
                // Se cuenta la cantidad de registros con Puntuacion = 1 para este libro
                // -----------------------------------------------------------------
                $queryLikes = "SELECT COUNT(*) as totalLikes FROM reseñas WHERE idLibro = ? AND Puntuacion = 1";
                $stmtLikes = $conn->prepare($queryLikes);
                $stmtLikes->bind_param("i", $idLibro);
                $stmtLikes->execute();
                $resultLikes = $stmtLikes->get_result();
                $totalLikes = $resultLikes->fetch_assoc()['totalLikes'];

                // Se envía una respuesta en formato JSON informando que el like fue removido
                // y se actualiza el contador total de likes
                echo json_encode(['message' => 'Like removido', 'totalLikes' => $totalLikes]);
            } else {
                // En caso de error al eliminar el registro, se devuelve un mensaje de error en JSON
                echo json_encode(['error' => 'Error al quitar el me gusta']);
            }
        } else {
            // -----------------------------------------------------------------
            // Paso 2b: Si el usuario no ha dado "me gusta" todavía, se inserta un registro (toggle on)
            // -----------------------------------------------------------------
            $queryInsert = "INSERT INTO reseñas (idUsuario, idLibro, Puntuacion) VALUES (?, ?, 1)";
            $stmtInsert = $conn->prepare($queryInsert);
            $stmtInsert->bind_param("ii", $idUsuario, $idLibro);
            if ($stmtInsert->execute()) {
                // -----------------------------------------------------------------
                // (Opcional) Insertar una notificación de "like".
                // Se obtiene el nombre completo del usuario para incluirlo en el mensaje.
                // -----------------------------------------------------------------
                $queryUser = "SELECT CONCAT(nombre, ' ', apPaterno, ' ', apMaterno) AS nombreCompleto FROM usuarios WHERE id = ?";
                $stmtUser = $conn->prepare($queryUser);
                $stmtUser->bind_param("i", $idUsuario);
                $stmtUser->execute();
                $resultUser = $stmtUser->get_result();
                if ($resultUser->num_rows > 0) {
                    $rowUser = $resultUser->fetch_assoc();
                    $nombreCompleto = $rowUser['nombreCompleto'];
                } else {
                    $nombreCompleto = "Usuario desconocido";
                }

                // Se obtiene el título del libro al que se dio like
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

                // Se prepara la consulta para insertar una notificación en la tabla 'notificaciones'
                // que informa sobre el nuevo "me gusta"
                $queryNotificacion = "INSERT INTO notificaciones (idUsuario, tipo, mensaje, fecha) VALUES (?, ?, ?, NOW())";
                $stmtNot = $conn->prepare($queryNotificacion);
                if ($stmtNot) {
                    $tipo = 'like';
                    // El mensaje incluye el nombre completo del usuario y el título del libro
                    $mensajeNot = "Nuevo like por el usuario $nombreCompleto en el libro $tituloLibro.";
                    $stmtNot->bind_param("iss", $idUsuario, $tipo, $mensajeNot);
                    $stmtNot->execute();
                }

                // -----------------------------------------------------------------
                // Actualizar el contador de "me gusta" para el libro.
                // Se realiza una consulta para contar cuántos likes (Puntuacion = 1) tiene el libro.
                // -----------------------------------------------------------------
                $queryLikes = "SELECT COUNT(*) as totalLikes FROM reseñas WHERE idLibro = ? AND Puntuacion = 1";
                $stmtLikes = $conn->prepare($queryLikes);
                $stmtLikes->bind_param("i", $idLibro);
                $stmtLikes->execute();
                $resultLikes = $stmtLikes->get_result();
                $totalLikes = $resultLikes->fetch_assoc()['totalLikes'];

                // Se devuelve una respuesta en formato JSON confirmando la acción exitosa
                // e indicando el nuevo total de likes
                echo json_encode(['message' => '¡Gracias por tu Like!', 'totalLikes' => $totalLikes]);
            } else {
                // Si hay un error al insertar el "me gusta", se envía un mensaje de error en JSON
                echo json_encode(['error' => 'Error al registrar el me gusta']);
            }
        }
    } else {
        // Si faltan parámetros requeridos en la solicitud POST, se devuelve un error en formato JSON
        echo json_encode(['error' => 'Faltan parámetros']);
    }
}
?> 
