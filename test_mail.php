<?php
require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
    // Configuración del servidor
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'gonzagaantonio012@gmail.com'; // Tu correo de Gmail
    $mail->Password = 'iqto vhta jzwz gtml'; // Tu contraseña de aplicación
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    // Habilitar depuración SMTP
    $mail->SMTPDebug = 2;
    $mail->Debugoutput = 'html';

    // Configuración del correo
    $mail->setFrom('gonzagaantonio012@gmail.com', 'SWBV');
    $mail->addAddress('worldaveeplayer@gmail.com'); // Dirección del destinatario

    $mail->isHTML(true);
    $mail->Subject = 'Prueba de PHPMailer';
    $mail->Body    = 'Este es un mensaje de prueba';

    $mail->send();
    echo 'Mensaje enviado';
} catch (Exception $e) {
    echo "Error al enviar el mensaje: {$mail->ErrorInfo}";
}
?>
