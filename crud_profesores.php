<?php
header('Content-Type: application/json');
include 'config.php';

// Opciones de visualización y registro de errores (útiles en desarrollo o depuración)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Se obtiene la acción a realizar y el criterio de orden
$action = $_GET['action'] ?? '';
$sortOrder = $_GET['sortOrder'] ?? 'recientes';

try {
    // Según la acción solicitada, llamamos a la función correspondiente
    switch ($action) {
        case 'create':
            createProfesor();
            break;
        case 'read':
            readProfesores($sortOrder);
            break;
        case 'update':
            updateProfesor();
            break;
        case 'delete':
            deleteProfesor();
            break;
        case 'resetSelected':
            resetSelectedProfesores();
            break;
        default:
            echo json_encode(['success' => false, 'message' => 'Acción no válida']);
            break;
    }
} catch (Exception $e) {
    // Si ocurre una excepción, devolvemos un mensaje de error en formato JSON
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}

/**
 * Función validateInput: 
 * Aplica verificaciones de horario y salón válido. También se asegura de que 
 * no haya otro profesor con horario/días traslapados.
 * 
 * @param array $data Arreglo con los campos: id, salon, horarioEntrada, horarioSalida, diasTrabajo, etc.
 * @return mixed Devuelve true si pasa las validaciones o una cadena de error si falla.
 */
function validateInput($data) {
    $validSalones = ["1°A", "1°B", "2°A", "2°B", "3°A", "3°B", "4°A", "4°B", "5°A", "5°B", "5°C", "6°A", "6°B"];

    // Validamos que el salón sea uno de los permitidos
    if (!in_array($data['salon'], $validSalones)) {
        return "Salón no válido.";
    }
    // Validamos que la hora de entrada sea >= 09:00
    if ($data['horarioEntrada'] < "09:00") {
        return "La hora de entrada debe ser mayor o igual a 09:00.";
    }
    // Validamos que la hora de salida sea <= 14:00
    if ($data['horarioSalida'] > "14:00") {
        return "La hora de salida debe ser menor o igual a 14:00.";
    }

    global $conn;
    // Se convierte la lista de días de trabajo a un arreglo
    $diasTrabajo = explode(',', $data['diasTrabajo']);

    // Consulta que devuelve todos los profesores (excepto el profesor actual si está en update)
    $query = $conn->prepare("SELECT * FROM detallesprofesores WHERE IdUsuario != ?");
    $query->bind_param("i", $data['id']);
    $query->execute();
    $result = $query->get_result();

    // Se verifica si hay traslape de horario con algún profesor existente para los mismos días
    while ($row = $result->fetch_assoc()) {
        $profesorDiasTrabajo = explode(',', $row['DiasTrabajo']);
        // Buscamos días en común
        $diasSolapados = array_intersect($diasTrabajo, $profesorDiasTrabajo);
        if (!empty($diasSolapados)) {
            // Extraemos la hora de entrada y salida del profesor ya existente
            list($horarioEntradaExistente, $horarioSalidaExistente) = explode(' - ', $row['HorarioTrabajo']);
            // Si hay solapamiento de horas en al menos un día, devolvemos error
            if (($data['horarioEntrada'] >= $horarioEntradaExistente && $data['horarioEntrada'] < $horarioSalidaExistente) ||
                ($data['horarioSalida'] > $horarioEntradaExistente && $data['horarioSalida'] <= $horarioSalidaExistente)) {
                return "Ya hay un profesor asignado con ese horario y días.";
            }
        }
    }
    // Si pasa todas las validaciones, retornamos true
    return true;
}

/**
 * createProfesor:
 * Inserta una nueva entrada en la tabla "detallesprofesores" asociada a un usuario profesor.
 * Validamos si pasa las reglas definidas en validateInput().
 */
function createProfesor() {
    global $conn;
    $idUsuario = $_POST['id'];
    $salon = $_POST['salon'];
    $horarioTrabajo = $_POST['horarioTrabajo'];
    // Si 'diasTrabajo' llega como arreglo, lo convertimos a cadena separada por comas
    $diasTrabajo = isset($_POST['diasTrabajo']) ? (is_array($_POST['diasTrabajo']) ? implode(',', $_POST['diasTrabajo']) : $_POST['diasTrabajo']) : '';

    // Llamamos a validateInput para verificar salón, horario, etc.
    $validationResult = validateInput($_POST);
    if ($validationResult !== true) {
        echo json_encode(['success' => false, 'message' => $validationResult]);
        return;
    }

    // Insertamos el profesor
    $sqlInsert = "INSERT INTO detallesprofesores (IdUsuario, Salon, HorarioTrabajo, DiasTrabajo) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sqlInsert);
    $stmt->bind_param("isss", $idUsuario, $salon, $horarioTrabajo, $diasTrabajo);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Profesor creado exitosamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al crear el profesor: ' . $conn->error]);
    }
}

/**
 * readProfesores:
 * Si se recibe un ID, retorna la info de un solo profesor (JOIN con usuarios).
 * De lo contrario, retorna todos los profesores, ordenados por ID ascendente o descendente.
 */
function readProfesores($sortOrder) {
    global $conn;
    $id = $_GET['id'] ?? '';
    // Determinamos el orden: recientes (DESC) o más antiguos (ASC)
    $orderBy = $sortOrder === 'recientes' ? 'DESC' : 'ASC';

    if ($id) {
        // Lectura de un profesor por ID
        $sql = "SELECT u.ID as IdUsuario, u.Nombre, u.ApPaterno, u.ApMaterno, u.Correo, u.NumTelefono, 
                       d.Salon, d.HorarioTrabajo, d.DiasTrabajo
                FROM usuarios u
                LEFT JOIN detallesprofesores d ON u.ID = d.IdUsuario
                WHERE u.TipoUsuario = 'profesor' AND u.ID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result) {
            $profesor = $result->fetch_assoc();
            echo json_encode(['profesor' => $profesor]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al recuperar el profesor: ' . $conn->error]);
        }
    } else {
        // Lectura de todos los profesores, ordenados por ID
        $sql = "SELECT u.ID as IdUsuario, u.Nombre, u.ApPaterno, u.ApMaterno, u.Correo, u.NumTelefono,
                       d.Salon, d.HorarioTrabajo, d.DiasTrabajo
                FROM usuarios u
                LEFT JOIN detallesprofesores d ON u.ID = d.IdUsuario
                WHERE u.TipoUsuario = 'profesor'
                ORDER BY u.ID $orderBy";
        $result = $conn->query($sql);
        if ($result) {
            $profesores = [];
            // Se recorre cada fila y se agrega al arreglo de salida
            while ($row = $result->fetch_assoc()) {
                // Asegura que 'DiasTrabajo' exista y no sea null
                $row['DiasTrabajo'] = $row['DiasTrabajo'] ?? '';
                $profesores[] = $row;
            }
            echo json_encode(['profesores' => $profesores]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al recuperar los profesores: ' . $conn->error]);
        }
    }
}

/**
 * updateProfesor:
 * Actualiza el registro de un profesor en la tabla 'detallesprofesores'.
 * Si no existe registro previo, llama a createProfesor() para crearlo.
 */
function updateProfesor() {
    global $conn;
    $idUsuario = $_POST['id'];
    $salon = $_POST['salon'];
    $horarioTrabajo = $_POST['horarioTrabajo'];
    // Conversion de arreglo de días a cadena separada por comas
    $diasTrabajo = isset($_POST['diasTrabajo']) ? (is_array($_POST['diasTrabajo']) ? implode(',', $_POST['diasTrabajo']) : $_POST['diasTrabajo']) : '';

    // Primero verificamos si existe un registro en detallesprofesores para el IdUsuario
    $sqlCheck = "SELECT 1 FROM detallesprofesores WHERE IdUsuario = ?";
    $stmtCheck = $conn->prepare($sqlCheck);
    $stmtCheck->bind_param("i", $idUsuario);
    $stmtCheck->execute();
    $resultCheck = $stmtCheck->get_result();

    // Si no se encuentra registro, creamos uno nuevo
    if ($resultCheck->num_rows === 0) {
        createProfesor();
        return;
    }

    // Valida los datos (verifica si no hay horarios/días en conflicto)
    $validationResult = validateInput($_POST);
    if ($validationResult !== true) {
        echo json_encode(['success' => false, 'message' => $validationResult]);
        return;
    }

    // Actualiza los datos del profesor
    $sqlUpdate = "UPDATE detallesprofesores SET Salon = ?, HorarioTrabajo = ?, DiasTrabajo = ? WHERE IdUsuario = ?";
    $stmt = $conn->prepare($sqlUpdate);
    $stmt->bind_param("sssi", $salon, $horarioTrabajo, $diasTrabajo, $idUsuario);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Profesor actualizado']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar el profesor: ' . $conn->error]);
    }
}

/**
 * deleteProfesor:
 * Elimina el registro de 'detallesprofesores' asociado a un usuario por su ID.
 * (No elimina de la tabla 'usuarios', sino que "resetea" los valores específicos de profesor).
 */
function deleteProfesor() {
    global $conn;
    $id = $_GET['id']; // IdUsuario
    $sql = "DELETE FROM detallesprofesores WHERE IdUsuario = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        // Indica éxito en la eliminación de los detalles
        echo json_encode(['success' => true, 'message' => 'Valores reseteados exitosamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al eliminar el profesor: ' . $conn->error]);
    }
}

/**
 * resetSelectedProfesores:
 * Elimina registros de 'detallesprofesores' para varios IDs recibidos como un arreglo JSON (AJAX).
 */
function resetSelectedProfesores() {
    global $conn;
    // Verifica que se hayan enviado los IDs por POST
    if (!isset($_POST['ids'])) {
        echo json_encode(['success' => false, 'message' => 'No se enviaron IDs.']);
        return;
    }
    $ids = json_decode($_POST['ids'], true);
    if (empty($ids) || !is_array($ids)) {
        echo json_encode(['success' => false, 'message' => 'No se enviaron IDs válidos.']);
        return;
    }
    
    // Construir una consulta preparada para borrar todos los registros con los IDs recibidos
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $sql = "DELETE FROM detallesprofesores WHERE IdUsuario IN ($placeholders)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Error en la preparación de la consulta: ' . $conn->error]);
        return;
    }
    // Asumiendo que los IDs son enteros, repetimos 'i' tantas veces como IDs haya
    $types = str_repeat("i", count($ids));
    $stmt->bind_param($types, ...$ids);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Valores reseteados exitosamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al resetear: ' . $conn->error]);
    }
}
?>
