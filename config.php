<?php
// config.php

// --- 1) Parámetros de conexión a la base de datos ---
$servername = "localhost";   // Dirección del servidor MySQL (generalmente localhost)
$username   = "root";        // Usuario de la base de datos
$password   = "";            // Contraseña del usuario de la base de datos
$dbname     = "swbv";        // Nombre de la base de datos que contiene la tabla 'usuarios'

// --- 2) Crear la conexión MySQLi ---
// Se genera una instancia de mysqli con los parámetros anteriores.
$conn = new mysqli($servername, $username, $password, $dbname);

// --- 3) Verificar la conexión ---
// Si ocurre un error al conectar, se detiene la ejecución y se muestra el mensaje.
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// --- 4) Función para resetear credenciales ---
// Evitamos redeclarar la función si ya existe en otro include.
if (! function_exists('resetUserCredentials')) {
    /**
     * Resetea el nombre de usuario y/o contraseña de un usuario.
     *
     * @param mysqli      $conn         Conexión activa a la base de datos
     * @param int         $usuarioId    ID del usuario a actualizar
     * @param string      $newPassword  Nueva contraseña en texto plano (se hashea internamente)
     * @param string|null $newUsername  (Opcional) Nuevo nombre de usuario. Null para no cambiar.
     * @return bool                      True si al menos un campo fue modificado
     * @throws Exception                Si ocurre un error al preparar la consulta
     */
    function resetUserCredentials(mysqli $conn, int $usuarioId, string $newPassword, string $newUsername = null): bool {
        // Array para partes de la cláusula SET y valores para bind_param
        $fields = [];
        $params = [];
        $types  = '';

        // 4.a) Añadir cambio de username si se proporcionó
        if ($newUsername !== null) {
            $fields[]  = 'nombre = ?';         // Campo a actualizar
            $types    .= 's';                  // Tipo 's' para string
            $params[]  = $newUsername;         // Valor a bindear
        }

        // 4.b) Añadir siempre cambio de contraseña
        $fields[]     = 'password = ?';       // Campo contraseña
        $types       .= 's';                  // Tipo string
        $params[]     = password_hash($newPassword, PASSWORD_DEFAULT);
        // password_hash genera un hash seguro de la contraseña

        // 4.c) Construir la consulta dinámicamente
        $sql = 'UPDATE usuarios SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $types    .= 'i';                    // Tipo 'i' para el ID
        $params[]  = $usuarioId;            // Agregar ID al final de los parámetros

        // 4.d) Preparar y ejecutar la consulta
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            // Si falla la preparación, lanzamos excepción con detalle
            throw new Exception("Error prepare: " . $conn->error);
        }
        // Bind dinámico: tipos + lista de valores
        $stmt->bind_param($types, ...$params);
        $stmt->execute();

        // 4.e) Retornar true si al menos una fila fue afectada
        return $stmt->affected_rows > 0;
    }
}

?>
