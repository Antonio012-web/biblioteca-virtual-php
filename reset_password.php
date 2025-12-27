<!DOCTYPE html>
<html lang="es">
<head>
    <!-- Define la codificación de caracteres y la configuración de la vista para dispositivos móviles -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Título de la página -->
    <title>Restablecer Contraseña</title>
    
    <!-- Vincula la hoja de estilos CSS para el diseño del login -->
    <link rel="stylesheet" href="css/login.css">
    
    <!-- Se incluye la librería SweetAlert2 desde un CDN para mostrar alertas personalizadas -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    
    <!-- Bloque de JavaScript para manejar la lógica del formulario de restablecimiento de contraseña -->
    <script>
        // Espera a que todo el contenido del DOM esté cargado antes de ejecutar el script
        document.addEventListener('DOMContentLoaded', function() {
            // Se obtiene una referencia al formulario de restablecimiento de contraseña usando su ID
            const newPasswordForm = document.getElementById('newPasswordForm');

            // Se añade un listener al evento 'submit' del formulario para interceptar el envío
            newPasswordForm.addEventListener('submit', function(event) {
                // Prevenir el comportamiento por defecto del formulario (recargar la página)
                event.preventDefault();
                
                // Se obtienen los valores ingresados por el usuario en los campos de nueva contraseña y confirmación
                const newPassword = document.getElementById('new-password').value;
                const confirmPassword = document.getElementById('confirm-password').value;
                
                // Se define una expresión regular para validar que la contraseña tenga al menos 8 caracteres,
                // contenga una letra mayúscula y al menos un carácter especial
                const passwordRegex = /^(?=.*[A-Z])(?=.*\W).{8,}$/;

                // Verifica que las contraseñas ingresadas sean iguales
                if (newPassword !== confirmPassword) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Las contraseñas no coinciden.',
                        backdrop: 'rgba(0, 0, 0, 0.5)'
                    });
                    return;
                }

                // Valida que la nueva contraseña cumpla con los requisitos definidos por la expresión regular
                if (!passwordRegex.test(newPassword)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula y un carácter especial.',
                        backdrop: 'rgba(0, 0, 0, 0.5)'
                    });
                    return;
                }

                // Se extrae el token de la URL usando URLSearchParams, el cual es necesario para identificar la solicitud de restablecimiento
                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token');

                // Se envía una solicitud POST a 'process_reset_password.php' con el nuevo password y el token en formato JSON
                fetch('process_reset_password.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    // Se convierte el objeto JavaScript en una cadena JSON
                    body: JSON.stringify({ password: newPassword, token: token })
                })
                .then(response => response.json()) // Se convierte la respuesta en JSON
                .then(data => {
                    // Si la respuesta indica éxito, se muestra una alerta de éxito y se redirige al inicio de sesión
                    if (data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Éxito',
                            text: 'Tu contraseña ha sido restablecida.',
                            backdrop: 'rgba(0, 0, 0, 0.5)'
                        }).then(() => {
                            window.location.href = 'inicio_sesion.php';
                        });
                    } else {
                        // En caso de error, se muestra una alerta con el mensaje de error recibido
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: data.message,
                            backdrop: 'rgba(0, 0, 0, 0.5)'
                        });
                    }
                })
                .catch(error => console.error('Error:', error)); // Maneja cualquier error en la solicitud fetch
            });
        });
    </script>
</head>
<body>
    <?php
    // Configura las cabeceras HTTP para evitar que la página se almacene en caché,
    // asegurando que siempre se muestre la versión más reciente.
    header("Cache-Control: no-cache, no-store, must-revalidate"); // HTTP 1.1.
    header("Pragma: no-cache"); // HTTP 1.0.
    header("Expires: 0"); // Proxies.
    ?>
    <!-- Contenedor principal para el formulario de restablecimiento de contraseña -->
    <div class="password-reset-container">
        <h2>Restablecer Contraseña</h2>
        <!-- Formulario para ingresar la nueva contraseña y confirmarla -->
        <form id="newPasswordForm">
            <!-- Campo para ingresar la nueva contraseña -->
            <label for="new-password">Nueva Contraseña:</label>
            <input type="password" id="new-password" name="new-password" required>
            
            <!-- Campo para confirmar la nueva contraseña -->
            <label for="confirm-password">Confirmar Contraseña:</label>
            <input type="password" id="confirm-password" name="confirm-password" required>
            
            <!-- Botón para enviar el formulario -->
            <button type="submit">Restablecer Contraseña</button>
        </form>
    </div>
</body>
</html>
