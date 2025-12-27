<?php
// Se incluye el archivo 'config.php' para establecer la conexión a la base de datos.
include 'config.php'; 

// Se establece el encabezado HTTP para indicar que la respuesta se enviará en formato JSON.
// Es vital que no haya ninguna salida antes de esta línea para evitar problemas con las cabeceras.
header('Content-Type: application/json');

// Se obtiene el parámetro 'action' enviado vía GET para determinar qué operación se debe ejecutar.
// Si no se proporciona, se asigna una cadena vacía.
$action = $_GET['action'] ?? '';

try {
    // Acción: actualizarEstado
    // Esta opción actualiza el estado de una reserva específica.
    if ($action == 'actualizarEstado') {
        // Verifica que se hayan enviado los parámetros 'id' y 'estado' mediante POST.
        if (!isset($_POST['id']) || !isset($_POST['estado'])) {
            throw new Exception("ID y estado son obligatorios");
        }

        // Se asignan los valores enviados a variables locales.
        $id = $_POST['id'];
        $estado = $_POST['estado'];

        // Se prepara la consulta SQL para actualizar el campo 'estado' en la tabla 'reservas'
        // para el registro cuyo 'id' coincide con el proporcionado.
        $query = "UPDATE reservas SET estado = ? WHERE id = ?";
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            throw new Exception("Error al preparar la consulta: " . $conn->error);
        }
        // Se vinculan los parámetros: 'estado' (string) y 'id' (entero).
        $stmt->bind_param("si", $estado, $id);
        // Se ejecuta la consulta y se verifica el resultado.
        if ($stmt->execute()) {
            echo json_encode(["message" => "Estado de la reserva actualizado con éxito."]);
        } else {
            throw new Exception("Error al actualizar el estado de la reserva: " . $stmt->error);
        }
    } 
    // Acción: actualizarEstadoMasivo
    // Esta opción actualiza el estado de múltiples reservas a la vez.
    elseif ($action == 'actualizarEstadoMasivo') {
        // Verifica que se hayan enviado los parámetros 'ids' y 'estado' mediante POST.
        if (!isset($_POST['ids']) || !isset($_POST['estado'])) {
            throw new Exception("IDs y estado son obligatorios");
        }

        // Se decodifica el JSON enviado en 'ids' para obtener un arreglo de IDs.
        $ids = json_decode($_POST['ids'], true);
        $estado = $_POST['estado'];

        // Se crea una cadena de placeholders ('?') separados por comas, uno por cada ID recibido.
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        // Se prepara la consulta SQL para actualizar el estado en la tabla 'reservas'
        // para todos los registros cuyos IDs estén en el arreglo.
        $query = "UPDATE reservas SET estado = ? WHERE id IN ($placeholders)";
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            throw new Exception("Error al preparar la consulta: " . $conn->error);
        }

        // Se genera una cadena de tipos para bind_param:
        // - 's' para el parámetro 'estado'
        // - 'i' repetido según la cantidad de IDs recibidos.
        $types = str_repeat('i', count($ids));
        $stmt->bind_param(str_repeat('s', 1) . $types, $estado, ...$ids);
        if ($stmt->execute()) {
            echo json_encode(["message" => "Estados de las reservas actualizados con éxito."]);
        } else {
            throw new Exception("Error al actualizar los estados de las reservas: " . $stmt->error);
        }
    } 
    // Acción: eliminar
    // Esta opción elimina una reserva específica.
    elseif ($action == 'eliminar') {
        // Verifica que se haya enviado el parámetro 'id' mediante POST.
        if (!isset($_POST['id'])) {
            throw new Exception("ID es obligatorio");
        }

        $id = $_POST['id'];

        // Se prepara la consulta SQL para eliminar el registro en la tabla 'reservas' cuyo 'id' coincide.
        $query = "DELETE FROM reservas WHERE id = ?";
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            throw new Exception("Error al preparar la consulta: " . $conn->error);
        }
        // Se vincula el parámetro 'id' como entero.
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            echo json_encode(["message" => "Reserva eliminada con éxito."]);
        } else {
            throw new Exception("Error al eliminar la reserva: " . $stmt->error);
        }
    } 
    // Acción: eliminarMasivo
    // Esta opción elimina múltiples reservas simultáneamente.
    elseif ($action == 'eliminarMasivo') {
        // Verifica que se haya enviado el parámetro 'ids' mediante POST.
        if (!isset($_POST['ids'])) {
            throw new Exception("IDs son obligatorios");
        }

        // Se decodifica el JSON enviado en 'ids' para obtener un arreglo de IDs.
        $ids = json_decode($_POST['ids'], true);

        // Se crea una cadena de placeholders separados por comas, uno por cada ID.
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        // Se prepara la consulta SQL para eliminar todos los registros en la tabla 'reservas'
        // cuyos IDs estén en el arreglo.
        $query = "DELETE FROM reservas WHERE id IN ($placeholders)";
        $stmt = $conn->prepare($query);
        if (!$stmt) {
            throw new Exception("Error al preparar la consulta: " . $conn->error);
        }

        // Se genera una cadena de tipos 'i' repetida según el número de IDs recibidos.
        $types = str_repeat('i', count($ids));
        // Se vinculan los parámetros usando la expansión del arreglo $ids.
        $stmt->bind_param($types, ...$ids);
        if ($stmt->execute()) {
            echo json_encode(["message" => "Reservas eliminadas con éxito."]);
        } else {
            throw new Exception("Error al eliminar las reservas: " . $stmt->error);
        }
    } 
    // Si el valor de 'action' no coincide con ninguna de las opciones anteriores, se lanza una excepción.
    else {
        throw new Exception("Acción no válida");
    }
} catch (Exception $e) {
    // En caso de error, se captura la excepción y se devuelve una respuesta JSON con el mensaje de error.
    echo json_encode(["error" => $e->getMessage()]);
}
?>
