<?php
// login.php

// 1) Iniciar sesión y controlar timeout
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
if (isset($_GET['session_timeout']) && $_GET['session_timeout'] === '1') {
    ?>
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    </head>
    <body>
    <script>
        Swal.fire({
            title: 'Sesión finalizada por inactividad',
            text: 'Por favor, inicia sesión nuevamente.',
            icon: 'warning',
            confirmButtonText: 'Aceptar'
        }).then(() => {
            window.location.href = 'inicio_sesion.php';
        });
    </script>
    </body>
    </html>
    <?php
    exit;
}

// 2) Cargar configuración, conexión y funciones sólo una vez
require_once 'config.php';    // aporta $conn y resetUserCredentials()
include_once  'csrf.php';     // tu verifyToken()

// 3) Disparador de reseteo manual desde código
if (isset($_GET['action']) && $_GET['action'] === 'reset_user') {
    header('Content-Type: application/json');

    // Obtener parámetros (puede venir por GET o POST)
    $usuarioId   = isset($_POST['user_id'])   ? (int)$_POST['user_id']   : (isset($_GET['user_id'])   ? (int)$_GET['user_id']   : 0);
    $nuevaContra = isset($_POST['new_password']) ? $_POST['new_password'] : (isset($_GET['new_password']) ? $_GET['new_password'] : '');
    $nuevoNombre = isset($_POST['new_username']) ? $_POST['new_username'] : (isset($_GET['new_username']) ? $_GET['new_username'] : null);

    try {
        if ($usuarioId <= 0 || $nuevaContra === '') {
            throw new Exception("Parámetros inválidos.");
        }

        $ok = resetUserCredentials($conn, $usuarioId, $nuevaContra, $nuevoNombre);
        if ($ok) {
            echo json_encode([
                'status'  => 'success',
                'message' => "Usuario {$usuarioId} actualizado correctamente."
            ]);
        } else {
            echo json_encode([
                'status'  => 'error',
                'message' => "No se actualizaron credenciales (ID inválido o mismos valores)."
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'status'  => 'error',
            'message' => "Error interno: " . $e->getMessage()
        ]);
    }
    exit;
}

// 4) Lógica original de procesamiento de login via POST
$response = [];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    try {
        // 4.1) Validar CSRF
        verifyToken($_POST['csrf_token']);

        // 4.2) Validar reCAPTCHA v3
        $recaptchaResponse = $_POST['g-recaptcha-response'] ?? '';
        $recaptchaSecret   = '6LckVjQqAAAAAPQp_Rhex29O3ZaHebI0kLlfTV0F';
        $recaptchaVerify   = file_get_contents(
            'https://www.google.com/recaptcha/api/siteverify'
            . '?secret=' . $recaptchaSecret
            . '&response=' . $recaptchaResponse
        );
        $recaptcha = json_decode($recaptchaVerify, true);
        if (empty($recaptcha['success']) || $recaptcha['score'] < 0.5) {
            throw new Exception("Error en reCAPTCHA. Por favor, intente nuevamente.");
        }

        // 4.3) Obtener credenciales
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';
        $currentDateTime = date('Y-m-d H:i:s');

        // 4.4) Buscar usuario
        $stmt = $conn->prepare("SELECT id, password, tipoUsuario FROM usuarios WHERE nombre = ?");
        if ($stmt === false) {
            throw new Exception("Error en preparación de consulta: " . $conn->error);
        }
        $stmt->bind_param('s', $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows !== 1) {
            throw new Exception("Usuario no encontrado");
        }

        $user = $result->fetch_assoc();
        $userId = (int)$user['id'];

        // 4.5) Verificar permisos de tipo
        if (!in_array($user['tipoUsuario'], ['administrador', 'profesor'])) {
            throw new Exception("No tiene permiso para iniciar sesión");
        }

        // 4.6) Historial de acceso
        $stmtHist = $conn->prepare(
            "SELECT intentos_fallidos, bloqueado, tiempo_bloqueo 
             FROM historialacceso 
             WHERE idUsuario = ?"
        );
        $stmtHist->bind_param("i", $userId);
        $stmtHist->execute();
        $hist = $stmtHist->get_result()->fetch_assoc() ?? null;

        $intentosFallidos = $hist['intentos_fallidos'] ?? 0;
        $bloqueado        = $hist['bloqueado']        ?? 0;
        $tiempoBloqueo    = $hist['tiempo_bloqueo']   ?? null;

        // 4.7) Verificar bloqueo
        if ($bloqueado && time() < strtotime($tiempoBloqueo)) {
            $minutos = ceil((strtotime($tiempoBloqueo) - time()) / 60);
            throw new Exception("La cuenta está bloqueada. Inténtelo de nuevo en {$minutos} minutos.");
        }

        // 4.8) Verificar contraseña
        if (!password_verify($password, $user['password'])) {
            // actualizar intentos fallidos
            $intentosFallidos++;
            $stmtInc = $conn->prepare(
                "UPDATE historialacceso 
                    SET intentos_fallidos = ?, FechaHoraAcceso = ? 
                  WHERE idUsuario = ?"
            );
            $stmtInc->bind_param("isi", $intentosFallidos, $currentDateTime, $userId);
            $stmtInc->execute();

            // bloquear si excede 5 intentos
            if ($intentosFallidos >= 5) {
                $nuevoBloqueo = date('Y-m-d H:i:s', strtotime('+15 minutes'));
                $stmtBlk = $conn->prepare(
                    "UPDATE historialacceso 
                        SET bloqueado = 1, tiempo_bloqueo = ?, FechaHoraAcceso = ? 
                      WHERE idUsuario = ?"
                );
                $stmtBlk->bind_param("ssi", $nuevoBloqueo, $currentDateTime, $userId);
                $stmtBlk->execute();
                throw new Exception("Cuenta bloqueada temporalmente por múltiples intentos fallidos.");
            }

            throw new Exception("Contraseña incorrecta.");
        }

        // 4.9) Contraseña correcta: generar y guardar session_token
        $sessionToken = bin2hex(random_bytes(32));
        $stmtTok = $conn->prepare("UPDATE usuarios SET session_token = ? WHERE id = ?");
        $stmtTok->bind_param("si", $sessionToken, $userId);
        $stmtTok->execute();

        // 4.10) Resetear historial
        $stmtRst = $conn->prepare(
            "UPDATE historialacceso 
                SET intentos_fallidos = 0, bloqueado = 0, tiempo_bloqueo = NULL, FechaHoraAcceso = ? 
              WHERE idUsuario = ?"
        );
        $stmtRst->bind_param("si", $currentDateTime, $userId);
        $stmtRst->execute();

        // 4.11) Registrar sesión
        $_SESSION['loggedin']      = true;
        $_SESSION['username']      = $username;
        $_SESSION['user_type']     = $user['tipoUsuario'];
        $_SESSION['session_token'] = $sessionToken;

        $response = [
            "status"   => "success",
            "message"  => "Inicio de sesión exitoso",
            "redirect" => ($user['tipoUsuario'] === 'administrador')
                            ? 'dashboard.php'
                            : 'dashboard.php?restricted=true'
        ];
    } catch (Exception $e) {
        $response = [
            "status"  => "error",
            "message" => $e->getMessage()
        ];
    }

    echo json_encode($response);
    exit;
}

// 5) Si no es POST y no es acción de reset, redirigir al form de login
header("Location: inicio_sesion.php");
exit;
