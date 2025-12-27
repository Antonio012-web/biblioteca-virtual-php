<?php
// Incluir el archivo de configuración para establecer la conexión a la base de datos
include 'config.php';

// Establecer el encabezado HTTP para indicar que la respuesta será en formato JSON
header('Content-Type: application/json');

// Obtener el parámetro 'action' de la URL; si no está definido, se asigna una cadena vacía
$action = $_GET['action'] ?? '';

try {
    // Verificar si la acción solicitada es 'insert'
    if ($action == 'insert') {
        // Validar que los parámetros necesarios para la inserción estén presentes en $_POST
        if (!isset($_POST['id'], $_POST['idLibro'], $_POST['fechaInicioLectura'])) {
            throw new Exception("Faltan parámetros necesarios");
        }

        // Asignar los valores de los parámetros recibidos
        $id = $_POST['id'];
        $idLibro = $_POST['idLibro'];
        $fechaInicioLectura = $_POST['fechaInicioLectura'];

        // Verificar si el usuario existe en la tabla 'usuarios'
        $query = "SELECT id FROM usuarios WHERE id = ?";
        $stmt = $conn->prepare($query);
        // "i" indica que el parámetro es un entero
        $stmt->bind_param("i", $id);
        $stmt->execute();
        // Obtener el resultado de la consulta
        $result = $stmt->get_result();

        // Si no se encontró ningún usuario con ese ID, lanzar una excepción
        if ($result->num_rows === 0) {
            throw new Exception("El usuario no existe");
        }

        // Preparar la consulta SQL para insertar el historial de lectura en la tabla 'historiallectura'
        $query = "INSERT INTO historiallectura (idUsuario, idLibro, fechaInicioLectura) VALUES (?, ?, ?)";
        $stmt = $conn->prepare($query);
        // "iis" indica: entero, entero, string
        $stmt->bind_param("iis", $id, $idLibro, $fechaInicioLectura);
        // Ejecutar la consulta de inserción
        if ($stmt->execute()) {
            // Si la inserción es exitosa, se devuelve un mensaje de confirmación en formato JSON
            echo json_encode(["message" => "Lectura registrada correctamente"]);
        } else {
            // Si ocurre un error al ejecutar la consulta, se lanza una excepción con el mensaje de error
            throw new Exception("Error al registrar la lectura: " . $stmt->error);
        }
    } 
    // Verificar si la acción solicitada es 'update'
    elseif ($action == 'update') {
        // Validar que los parámetros necesarios para la actualización estén presentes en $_POST
        if (!isset($_POST['id'], $_POST['idLibro'], $_POST['fechaFinLectura'], $_POST['tiempoLectura'])) {
            throw new Exception("Faltan parámetros necesarios");
        }

        // Asignar los valores de los parámetros recibidos para la actualización
        $id = $_POST['id'];
        $idLibro = $_POST['idLibro'];
        $fechaFinLectura = $_POST['fechaFinLectura'];
        $tiempoLectura = $_POST['tiempoLectura'];

        // Preparar la consulta SQL para actualizar el historial de lectura.
        // Se actualiza la fecha de fin y el tiempo de lectura solo para el registro
        // correspondiente al usuario y libro dados, y donde aún no se haya registrado una fecha de fin (IS NULL)
        $query = "UPDATE historiallectura SET fechaFinLectura = ?, tiempoLectura = ? WHERE idUsuario = ? AND idLibro = ? AND fechaFinLectura IS NULL";
        $stmt = $conn->prepare($query);
        // "siii" indica: string, entero, entero, entero
        $stmt->bind_param("siii", $fechaFinLectura, $tiempoLectura, $id, $idLibro);
        // Ejecutar la consulta de actualización
        if ($stmt->execute()) {
            // Si la actualización es exitosa, se devuelve un mensaje de confirmación en formato JSON
            echo json_encode(["message" => "Lectura actualizada correctamente"]);
        } else {
            // Si ocurre un error durante la actualización, se lanza una excepción con el mensaje de error
            throw new Exception("Error al actualizar la lectura: " . $stmt->error);
        }
    } 
    // Si la acción recibida no es 'insert' ni 'update', lanzar una excepción indicando que la acción es no válida
    else {
        throw new Exception("Acción no válida");
    }
} catch (Exception $e) {
    // Capturar cualquier excepción y devolver el mensaje de error en formato JSON
    echo json_encode(["error" => $e->getMessage()]);
}
?>
