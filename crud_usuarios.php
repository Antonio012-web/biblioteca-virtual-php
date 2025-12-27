<?php
// crud_usuarios.php

// Configuraciones de errores
ini_set('display_errors', 0);  // No imprimir errores en la salida
ini_set('log_errors', 1);      // Guardarlos en el log del servidor
error_reporting(E_ALL);        // Reportar todos los errores

header('Content-Type: application/json; charset=utf-8');

include 'config.php'; // Debe contener la conexión $conn a la base de datos

// Se obtiene la acción a realizar, por defecto se leerán los usuarios si no se especifica
$action = $_GET['action'] ?? '';

// Enrutamiento de la acción
switch ($action) {
    case 'create':
        createUser();
        break;
    case 'read':
        readUsers();
        break;
    case 'update':
        updateUser();
        break;
    case 'updatePassword':
        updatePassword();
        break;
    case 'delete':
        deleteUser();
        break;
    case 'deleteSelected':
        deleteSelectedUsers();
        break;
    case 'import':
        // Accion para importar usuarios en masa
        importUsers();
        break;
    default:
        // Si no se especifica una acción o no coincide con las anteriores,
        // se llama por defecto a readUsers() para listar
        readUsers();
}

// ---------------------------------------------------------
// 1) CREATE: Crear un nuevo usuario en la tabla "usuarios"
function createUser() {
    global $conn;

    // Obtenemos los campos de $_POST
    $nombre      = $_POST['nombre']      ?? null;
    $apPaterno   = $_POST['apPaterno']   ?? null;
    $apMaterno   = $_POST['apMaterno']   ?? null;
    $direccion   = $_POST['direccion']   ?? null;
    $correo      = $_POST['correo']      ?? null;
    $numTelefono = $_POST['numTelefono'] ?? null;
    $tipoUsuario = $_POST['tipoUsuario'] ?? null;
    $password    = $_POST['password']    ?? null;

    // Validación básica: Verificamos que todos los campos obligatorios existan
    if (
        !$nombre || !$apPaterno || !$apMaterno || !$direccion ||
        !$correo || !$numTelefono || !$tipoUsuario || !$password
    ) {
        echo json_encode(['success' => false, 'message' => 'Datos incompletos para crear el usuario.']);
        return;
    }

    // 1. Verificar si existe un usuario con exactamente los mismos apellidos, correo y teléfono
    $sqlExact = "
        SELECT id FROM usuarios
        WHERE apPaterno='$apPaterno'
          AND apMaterno='$apMaterno'
          AND correo='$correo'
          AND numTelefono='$numTelefono'
        LIMIT 1
    ";
    $resExact = $conn->query($sqlExact);
    if ($resExact->num_rows > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Este usuario ya se encuentra registrado (mismos apellidos, correo y teléfono).'
        ]);
        return;
    }

    // 2. Verificar conflicto: si el mismo correo o teléfono ya está en uso,
    //    pero con apellidos distintos => conflicto
    $sqlCheck = "
        SELECT apPaterno, apMaterno 
        FROM usuarios
        WHERE correo='$correo'
           OR numTelefono='$numTelefono'
    ";
    $resCheck = $conn->query($sqlCheck);
    while ($row = $resCheck->fetch_assoc()) {
        if ($row['apPaterno'] != $apPaterno || $row['apMaterno'] != $apMaterno) {
            // Conflicto detectado
            echo json_encode([
                'success' => false,
                'message' => 'El correo o teléfono ya está en uso por alguien con apellidos distintos.'
            ]);
            return;
        }
    }

    // Si pasamos los checks anteriores, procedemos a crear el usuario
    $passwordHashed = password_hash($password, PASSWORD_DEFAULT);
    $sqlInsert = "INSERT INTO usuarios 
        (nombre, apPaterno, apMaterno, direccion, correo, numTelefono, tipoUsuario, password)
        VALUES
        ('$nombre','$apPaterno','$apMaterno','$direccion','$correo','$numTelefono','$tipoUsuario','$passwordHashed')";

    if ($conn->query($sqlInsert) === TRUE) {
        echo json_encode(['success' => true, 'message' => 'Usuario creado exitosamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al crear el usuario: ' . $conn->error]);
    }
}

// ---------------------------------------------------------
// 2) READ: Leer usuarios
function readUsers() {
    global $conn;
    $id = $_GET['id'] ?? ''; // Podemos recibir opcionalmente un ID para leer un solo usuario

    if ($id) {
        // Obtener un solo usuario por ID
        $sql = "SELECT * FROM usuarios WHERE id = $id";
        $result = $conn->query($sql);
        $user = $result->fetch_assoc();
        echo json_encode(['user' => $user]);
    } else {
        // Obtener todos los usuarios
        $sql = "SELECT * FROM usuarios";
        $result = $conn->query($sql);
        $users = [];
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        echo json_encode(['users' => $users]);
    }
}

// ---------------------------------------------------------
// 3) UPDATE: Actualizar datos de un usuario
function updateUser() {
    global $conn;

    // Obtenemos los campos de $_POST
    $id          = $_POST['id']          ?? null;
    $nombre      = $_POST['nombre']      ?? null;
    $apPaterno   = $_POST['apPaterno']   ?? null;
    $apMaterno   = $_POST['apMaterno']   ?? null;
    $direccion   = $_POST['direccion']   ?? null;
    $correo      = $_POST['correo']      ?? null;
    $numTelefono = $_POST['numTelefono'] ?? null;
    $tipoUsuario = $_POST['tipoUsuario'] ?? null;

    // Validación básica
    if (
        !$id || !$nombre || !$apPaterno || !$apMaterno || !$direccion ||
        !$correo || !$numTelefono || !$tipoUsuario
    ) {
        echo json_encode(['success' => false, 'message' => 'Datos incompletos para actualizar el usuario.']);
        return;
    }

    // 1. Chequeo exacto: si hay otro usuario con estos mismos apellidos, correo y teléfono
    $sqlExact = "
        SELECT id FROM usuarios
        WHERE apPaterno='$apPaterno'
          AND apMaterno='$apMaterno'
          AND correo='$correo'
          AND numTelefono='$numTelefono'
          AND id != $id
        LIMIT 1
    ";
    $resExact = $conn->query($sqlExact);
    if ($resExact->num_rows > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Ya existe otro usuario con estos mismos apellidos, correo y teléfono.'
        ]);
        return;
    }

    // 2. Chequeo de conflicto: si el correo o teléfono está en uso por alguien con apellidos distintos
    $sqlCheck = "
        SELECT apPaterno, apMaterno FROM usuarios
        WHERE (correo='$correo' OR numTelefono='$numTelefono')
          AND id != $id
    ";
    $resCheck = $conn->query($sqlCheck);
    while ($row = $resCheck->fetch_assoc()) {
        if ($row['apPaterno'] != $apPaterno || $row['apMaterno'] != $apMaterno) {
            echo json_encode([
                'success' => false,
                'message' => 'El correo o teléfono ya están en uso por alguien con apellidos distintos.'
            ]);
            return;
        }
    }

    // Actualiza los campos indicados
    $sqlUpdate = "
        UPDATE usuarios
        SET nombre='$nombre',
            apPaterno='$apPaterno',
            apMaterno='$apMaterno',
            direccion='$direccion',
            correo='$correo',
            numTelefono='$numTelefono',
            tipoUsuario='$tipoUsuario'
        WHERE id=$id
    ";
    if ($conn->query($sqlUpdate) === TRUE) {
        echo json_encode(['success' => true, 'message' => 'Usuario actualizado exitosamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar el usuario: ' . $conn->error]);
    }
}

// ---------------------------------------------------------
// 4) UPDATE PASSWORD: Actualizar la contraseña de un usuario
function updatePassword() {
    global $conn;

    $id          = $_POST['id']          ?? null;
    $newPassword = $_POST['newPassword'] ?? null;

    if (!$id || !$newPassword) {
        echo json_encode(['success' => false, 'message' => 'Datos incompletos para actualizar la contraseña.']);
        return;
    }

    // Hasheamos la nueva contraseña antes de guardarla
    $newPasswordHashed = password_hash($newPassword, PASSWORD_DEFAULT);
    $sql = "UPDATE usuarios SET password='$newPasswordHashed' WHERE id=$id";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(['success' => true, 'message' => 'Contraseña actualizada exitosamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar la contraseña: ' . $conn->error]);
    }
}

// ---------------------------------------------------------
// 5) DELETE: Eliminar un usuario específico por ID
function deleteUser() {
    global $conn;
    $id = $_GET['id'] ?? null;

    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ID de usuario no proporcionado.']);
        return;
    }

    $sql = "DELETE FROM usuarios WHERE id=$id";
    if ($conn->query($sql) === TRUE) {
        echo json_encode(['success' => true, 'message' => 'Usuario eliminado exitosamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al eliminar el usuario: ' . $conn->error]);
    }
}

// ---------------------------------------------------------
// 6) DELETE SELECTED: Eliminar varios usuarios a la vez
function deleteSelectedUsers() {
    global $conn;
    // Recibimos un array de IDs en formato JSON por $_POST['ids']
    $ids = json_decode($_POST['ids'], true);

    if (empty($ids)) {
        echo json_encode(['success' => false, 'message' => 'No hay usuarios seleccionados para eliminar.']);
        return;
    }

    // Creamos un string con los IDs separados por coma
    $idsString = implode(',', array_map('intval', $ids));
    $sql = "DELETE FROM usuarios WHERE id IN ($idsString)";
    if ($conn->query($sql) === TRUE) {
        echo json_encode(['success' => true, 'message' => 'Usuarios eliminados exitosamente']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al eliminar los usuarios: ' . $conn->error]);
    }
}

// ---------------------------------------------------------
// 7) IMPORT: Importación masiva de usuarios
function importUsers() {
    global $conn;

    // Leemos la cadena JSON cruda enviada por la petición
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    // Validamos que se haya enviado un array 'userData'
    if (!isset($data['userData']) || !is_array($data['userData'])) {
        echo json_encode(['success' => false, 'message' => 'No se recibieron datos de usuarios.']);
        return;
    }

    $userData = $data['userData'];
    $contadorInsertados = 0;
    $contadorOmitidos   = 0;
    $detalles           = [];

    // Array local para “llaves” de duplicados en ESTA importación
    $localInserts = [];

    foreach ($userData as $index => $row) {
        // Limpieza y normalización de cada campo
        $nombre      = $conn->real_escape_string(trim($row['nombre']      ?? ''));
        $apPaterno   = $conn->real_escape_string(trim($row['apPaterno']   ?? ''));
        $apMaterno   = $conn->real_escape_string(trim($row['apMaterno']   ?? ''));
        $direccion   = $conn->real_escape_string(trim($row['direccion']   ?? ''));
        $correo      = $conn->real_escape_string(trim($row['correo']      ?? ''));
        $numTelefono = $conn->real_escape_string(trim($row['numTelefono'] ?? ''));
        $tipoUsuario = $conn->real_escape_string(trim($row['tipoUsuario'] ?? ''));
        $password    = $conn->real_escape_string(trim($row['password']    ?? ''));

        // 1) Validación de campos obligatorios
        if (
            !$nombre || !$apPaterno || !$apMaterno || !$direccion ||
            !$correo || !$numTelefono || !$tipoUsuario || !$password
        ) {
            $contadorOmitidos++;
            $detalles[] = [
                'fila'   => $index+1,
                'exito'  => false,
                'motivo' => 'Campos obligatorios vacíos.'
            ];
            continue;
        }

        // 2) Creamos una “llave” que ignora el teléfono (por ejemplo, nombre+apellidos+correo).
        $userKey = $nombre . '|' . $apPaterno . '|' . $apMaterno . '|' . $correo;

        // 3) Revisar si ya se insertó un usuario igual (en la presente importación)
        if (in_array($userKey, $localInserts)) {
            // El usuario aparece duplicado en la misma lista de importación
            $contadorOmitidos++;
            $detalles[] = [
                'fila'   => $index+1,
                'exito'  => false,
                'motivo' => 'Este usuario ya fue insertado en esta misma importación (ignora teléfono).'
            ];
            continue;
        }

        // 4) Revisar la base de datos ignorando el teléfono (nombre, apellidos, correo)
        $sqlExact = "
            SELECT id FROM usuarios
            WHERE nombre='$nombre'
              AND apPaterno='$apPaterno'
              AND apMaterno='$apMaterno'
              AND correo='$correo'
            LIMIT 1
        ";
        $resExact = $conn->query($sqlExact);
        if ($resExact->num_rows > 0) {
            // Ya existe en la BD un usuario con los mismos nombre, apellidos y correo
            $contadorOmitidos++;
            $detalles[] = [
                'fila'   => $index+1,
                'exito'  => false,
                'motivo' => 'Este usuario ya existe en BD (nombre+apellidos+correo).'
            ];
            continue;
        }

        // 5) [Opcional] Verificación de conflicto adicional (apellidos distintos y mismo correo/tel),
        //    si es que se requiere. Aquí se omitió o se comentó para simplificar.

        // Insertamos el usuario con su contraseña hasheada
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $sqlInsert = "INSERT INTO usuarios
            (nombre, apPaterno, apMaterno, direccion, correo, numTelefono, tipoUsuario, password)
            VALUES
            ('$nombre','$apPaterno','$apMaterno','$direccion','$correo','$numTelefono','$tipoUsuario','$hashedPassword')";

        if ($conn->query($sqlInsert) === TRUE) {
            $contadorInsertados++;
            $detalles[] = [
                'fila'   => $index+1,
                'exito'  => true,
                'motivo' => 'Insertado correctamente (ignora teléfono).'
            ];
            // Añadimos la llave local para no insertar otro usuario igual en esta importación
            $localInserts[] = $userKey;
        } else {
            $contadorOmitidos++;
            $detalles[] = [
                'fila'   => $index+1,
                'exito'  => false,
                'motivo' => 'Error al insertar: ' . $conn->error
            ];
        }
    }

    // Al finalizar, enviamos un resumen de la importación
    echo json_encode([
        'success' => true,
        'message' => "Importación completada: $contadorInsertados insertados, $contadorOmitidos omitidos.",
        'detalles' => $detalles
    ]);
}
?>
