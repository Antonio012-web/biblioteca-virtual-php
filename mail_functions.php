<?php
// La función sendResetEmail se encarga de enviar un correo electrónico para restablecer la contraseña del usuario.
function sendResetEmail($email, $token) {
    // Construye el enlace para restablecer la contraseña, incluyendo el token como parámetro GET.
    $resetLink = "http://localhost:3000/reset_password.php?token=$token";
    
    // Define el asunto del correo electrónico.
    $subject = "Restablecimiento de contraseña";
    
    // Define el contenido del mensaje, que incluye el enlace para restablecer la contraseña.
    $message = "Haz clic en el siguiente enlace para restablecer tu contraseña: $resetLink";
    
    // Configura los encabezados del correo:
    // 'From' especifica la dirección del remitente.
    // 'Reply-To' define a dónde se enviarán las respuestas (aunque en este caso se usa un correo sin respuesta).
    // 'X-Mailer' identifica que el correo se envía mediante PHP, incluyendo la versión actual.
    $headers = 'From: no-reply@yourwebsite.com' . "\r\n" .
               'Reply-To: no-reply@yourwebsite.com' . "\r\n" .
               'X-Mailer: PHP/' . phpversion();

    // Envía el correo electrónico utilizando la función mail de PHP.
    // Si el envío es exitoso, retorna true.
    if (mail($email, $subject, $message, $headers)) {
        return true;
    } else {
        // Si falla el envío, se registra un mensaje de error en el log del servidor para ayudar en la depuración.
        error_log("Error al enviar el correo a $email"); // Registro del error en el log de errores
        return false;
    }
}
?>
