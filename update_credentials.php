<?php
// update_credentials.php

// Mostrar todos los errores para facilitar la depuración.
ini_set('display_errors', 1);
error_reporting(E_ALL);

// 1) Incluir configuración y función de reseteo
// require_once asegura que config.php se cargue una sola vez.
// config.php define la conexión $conn y la función resetUserCredentials().
require_once __DIR__ . '/config.php';

// --- 2) Definir el "identificador" del usuario a resetear ---
// Puede ser un ID numérico (tratado como ID) o un string (tratado como nombre de usuario).

$identificador = '90';  // ej. '84' o 'juan123'

// 2.b) Definir las nuevas credenciales:
// - $nuevaContra: contraseña en texto plano (se hashea internamente).
// - $nuevoNombre: nuevo nombre de usuario (null para no cambiarlo).

$nuevaContra = 'MiPassBackend!23';
$nuevoNombre = 'David';  // o 'OtroNombre' si deseas renombrar (Por default colocar null si no se desesa cambiar el nombre)

// --- 3) Resolver el ID de usuario real ---
if (ctype_digit($identificador)) {
    // Si el identificador es sólo dígitos, se convierte directamente a int.
    $usuarioId = (int) $identificador;
} else {
    // Si no, es un nombre de usuario: buscar el ID correspondiente.
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE nombre = ?");
    $stmt->bind_param('s', $identificador);
    $stmt->execute();
    $res = $stmt->get_result();

    // Si no se encuentra exactamente un usuario, terminar con mensaje de error.
    if ($res->num_rows !== 1) {
        exit("❌ Error: No existe un usuario con nombre '{$identificador}'.\n");
    }

    // Obtener el ID de la fila resultante.
    $row       = $res->fetch_assoc();
    $usuarioId = (int) $row['id'];
}

// --- 4) Ejecutar el reseteo de credenciales ---
try {
    // Llamar a la función que actualiza el nombre y/o contraseña.
    $ok = resetUserCredentials($conn, $usuarioId, $nuevaContra, $nuevoNombre);

    if ($ok) {
        // Éxito: al menos una fila afectada.
        echo "✅ Usuario ID {$usuarioId} actualizado correctamente.\n";
    } else {
        // Sin cambios: ID inválido o valores idénticos a los actuales.
        echo "ℹ️ No se actualizaron credenciales (valores idénticos o ID inválido).\n";
    }
} catch (Exception $e) {
    // Capturar y mostrar cualquier excepción generada.
    echo "❌ Error al resetear: " . $e->getMessage() . "\n";
}



// 5) Escribir en negevador para aplicar cambios de usuario y/o contraseña: 

// Hostinguer: https://royalblue-boar-982782.hostingersite.com/update_credentials.php

// Localhost: http://localhost:3000/update_credentials.php

?>


