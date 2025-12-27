<?php
// Solo CLI
if (php_sapi_name() !== 'cli') {
    die("Ejecuta este script desde la línea de comandos.\n");
}

require 'config.php';   // aporta $conn

// Lectura de argumentos
$usuarioId   = (int) ($argv[1] ?? 0);
$nuevaContra = $argv[2] ?? '';
$nuevoUser   = $argv[3] ?? null;

if (!$usuarioId || !$nuevaContra) {
    echo "Uso: php admin_reset_user.php <usuario_id> <nueva_contraseña> [nuevo_nombre]\n";
    exit;
}

try {
    $ok = resetUserCredentials($conn, $usuarioId, $nuevaContra, $nuevoUser);
    echo $ok
      ? "Usuario ID {$usuarioId} actualizado correctamente.\n"
      : "No se hicieron cambios (¿ID inválido o mismos valores?).\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
