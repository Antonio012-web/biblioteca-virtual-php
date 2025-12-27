<?php
// mail_config.php

// Importa las clases PHPMailer y Exception del paquete PHPMailer, necesarias para el envío de correos y el manejo de errores.
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Carga el autoloader de Composer, que se encarga de cargar todas las dependencias (incluido PHPMailer).
require 'vendor/autoload.php';

/**
 * Función para enviar un correo electrónico de restablecimiento de contraseña.
 *
 * @param string $email Dirección de correo electrónico del destinatario.
 * @param string $token Token único generado para identificar la solicitud de restablecimiento.
 * @return bool Retorna true si el correo se envía correctamente; de lo contrario, retorna false.
 */
function sendResetEmail($email, $token) {
    // Se crea una nueva instancia de PHPMailer y se habilita el manejo de excepciones.
    $mail = new PHPMailer(true);

    try {
        // Configuración del servidor SMTP para el envío de correos

        $mail->isSMTP(); // Indica que se usará el protocolo SMTP.
        $mail->Host = 'smtp.gmail.com'; // Define el servidor SMTP de Gmail.
        $mail->SMTPAuth = true; // Habilita la autenticación SMTP.
        $mail->Username = 'gonzagaantonio012@gmail.com'; // Establece la dirección de correo del remitente.
        $mail->Password = 'iqto vhta jzwz gtml'; // Define la contraseña del remitente o la contraseña de aplicación.
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Configura el cifrado TLS para la conexión.
        $mail->Port = 587; // Establece el puerto SMTP a utilizar (587 para TLS).

        // Configuración del correo electrónico a enviar

        $mail->setFrom('gonzagaantonio012@gmail.com', 'SWBV'); // Configura el remitente, incluyendo la dirección y el nombre.
        $mail->addAddress($email); // Agrega la dirección del destinatario.

        $mail->isHTML(true); // Indica que el correo se enviará en formato HTML.
        $mail->Subject = 'Restablecimiento de contraseña'; // Define el asunto del correo.
        // Define el cuerpo del correo en formato HTML, incluyendo un enlace que incorpora el token para identificar la solicitud.
        $mail->Body    = "Haz clic en el siguiente enlace para restablecer tu contraseña: <a href='http://localhost:3000/reset_password.php?token=$token'>Restablecer contraseña</a>";

        // Intenta enviar el correo
        $mail->send();
        // Si no se produce ninguna excepción, el correo se envía correctamente y se retorna true.
        return true;
    } catch (Exception $e) {
        // En caso de error, se registra el mensaje de error en el log del servidor.
        error_log("Error al enviar el correo: {$mail->ErrorInfo}");
        // Se retorna false para indicar que el envío falló.
        return false;
    }
}
?>
