<?php
// Asegúrate de iniciar sesión antes de usar $_SESSION.
// session_start(); // Descomenta si aún no se ha iniciado la sesión

// Incluimos el archivo 'csrf.php' que probablemente genere o valide el token CSRF.
include 'csrf.php';
?>
<!DOCTYPE html>
<!-- 
    Indica que este documento está escrito en HTML5, 
    lo que ayuda al navegador a interpretar correctamente la estructura y etiquetas.
-->
<html lang="es">
<!-- 
    Atributo que indica que el contenido principal de la página está en español, 
    útil para motores de búsqueda y lectores de pantalla.
-->
<head>
  <meta charset="UTF-8">
  <!-- 
      Se especifica UTF-8 como la codificación de caracteres, 
      permitiendo usar caracteres con acentos y ñ.
  -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- 
      Ajusta la escala y el ancho de la página al dispositivo actual. 
      Esto hace la web "responsiva" en móviles y tabletas.
  -->
  <title>Inicio de sesión - Biblioteca virtual</title>
  <!-- 
      Título que se muestra en la pestaña del navegador y en los resultados de búsqueda.
  -->

  <!-- Estilos globales -->
  <link rel="stylesheet" href="css/styles.css">
  <!-- 
      Archivo CSS que contiene estilos generales aplicables a todo el sitio.
  -->

  <!-- Estilos específicos del login -->
  <link rel="stylesheet" href="css/login.css">
  <!-- 
      Archivo CSS que contiene estilos particulares para el formulario de inicio de sesión.
      Aquí se definen, por ejemplo, el diseño de la tarjeta de login, posicionamiento, colores, etc.
  -->
  
  <!-- Iconos Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <!-- 
      Proporciona un conjunto de íconos vectoriales (fuentes) para usar en botones, etiquetas, etc.
      Ej. fa-user, fa-lock, etc.
  -->

  <!-- SweetAlert2 -->
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <!-- 
      Biblioteca de JavaScript para mostrar alertas y diálogos personalizables 
      de manera amigable y con estilo.
  -->

  <!-- reCAPTCHA v3 -->
  <script src="https://www.google.com/recaptcha/api.js?render=6LckVjQqAAAAAM09M6ZNt3odRIAX-8zhulbBpf4U"></script>
  <!-- 
      Carga el script de Google reCAPTCHA v3 para proteger tu formulario de envíos automatizados (bots).
      La parte "render=..." incluye tu clave específica de sitio. 
  -->
</head>
<body>
  <!-- Barra de navegación (actualizada) -->
  <nav>
    <!-- 
        Zona de navegación principal con el logo y los enlaces hacia otras secciones del sitio. 
        Se ubica normalmente en la parte superior de la página.
    -->
    <div class="logo">
      <img src="img/logoP.png" alt="Logo de la Escuela">
      <!-- 
          El atributo alt describe la imagen para usuarios con lectores de pantalla 
          o en caso de que la imagen no cargue.
      -->
      <h1>Escuela Primaria Manuel Del Mazo Villasante</h1>
      <!-- 
          Título que indica el nombre oficial de la institución.
      -->
    </div>
    <div class="nav-links">
      <!-- 
          Lista de enlaces que llevan a distintas partes del sitio:
          Inicio, Catálogo, Multimedia, Contacto e Inicio de sesión.
      -->
      <a href="index.php"><i class="fa-solid fa-house"></i> Inicio</a>
      <a href="catalogo.php"><i class="fa-solid fa-book"></i> Catálogo</a>
      <a href="contenido.php"><i class="fa-solid fa-photo-film"></i> Multimedia</a>
      <a href="contacto.php"><i class="fa-solid fa-message"></i> Contacto</a>
      <a class="nav-link active" href="inicio_sesion.php"><i class="fa-solid fa-right-to-bracket"></i> Inicio de sesión</a>
      <!-- 
          La clase "active" resalta que esta es la página actual (Inicio de sesión).
      -->
    </div>
  </nav>

  <!-- Contenido principal con clase para el fondo (opcional) -->
  <main class="login-page">
    <!-- 
        Sección principal donde se presenta el formulario de acceso.
        "login-page" puede servir para aplicar un fondo específico.
    -->
    <div class="login-container">
      <!-- 
          Contenedor que envuelve la estructura de la tarjeta de inicio de sesión: 
          la imagen a un lado y el formulario en el otro.
      -->
      <div class="login-image">
        <!--
            Div que contiene la imagen y un overlay (capa de color semitransparente).
            Esto se hace para oscurecer o aclarar la imagen de fondo y mejorar la legibilidad del texto.
        -->
        <div class="image-overlay"></div>
        <img src="img/pngwing.com.png" alt="Login Image">
        <!-- 
            Imagen ilustrativa; podría ser el logo, una ilustración o cualquier recurso que represente el inicio de sesión.
        -->
      </div>

      <div class="login-form">
        <!-- 
            Sección que contiene los elementos del formulario (campos de texto, contraseña y botones).
        -->
        <h2>¡Bienvenido!</h2>
        <h3>Inicia sesión con tus credenciales</h3>
        <!-- 
            Mensajes introductorios que dan la bienvenida al usuario y le indican qué hacer.
        -->

        <!-- Formulario de login -->
        <form id="loginForm" method="POST">
          <!-- 
              El formulario usa el método POST para enviar datos de forma segura.
              "id" = "loginForm" se utiliza en JavaScript para asociar eventos y validaciones.
          -->

          <!-- Token CSRF -->
          <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
          <!-- 
              Campo oculto que contiene el token CSRF, esencial para prevenir ataques de tipo 
              Cross-Site Request Forgery. Se genera desde 'csrf.php' y se almacena en la sesión.
          -->

          <!-- Token reCAPTCHA v3 (se genera dinámicamente con JS) -->
          <input type="hidden" id="g-recaptcha-response" name="g-recaptcha-response">
          <!-- 
              Campo oculto para almacenar el token devuelto por Google reCAPTCHA. 
              Se asigna en el JavaScript más abajo al cargar la página o al enviar el formulario.
          -->

          <!-- Campo de usuario -->
          <div class="input-group">
            <label for="username"><i class="fas fa-user"></i></label>
            <!-- 
                Etiqueta con un ícono (fa-user) para indicar que corresponde al nombre de usuario.
            -->
            <input type="text" id="username" name="username" placeholder="Nombre de usuario" required autocomplete="off">
            <!-- 
                El campo para ingresar el nombre de usuario. 
                "required" obliga a completarlo y "autocomplete='off'" sugiere que el navegador no guarde sugerencias.
            -->
          </div>

          <!-- Campo de contraseña -->
          <div class="input-group">
            <label for="password"><i class="fas fa-lock"></i></label>
            <!-- 
                Etiqueta con ícono de candado indicando el campo de contraseña.
            -->
            <div class="password-wrapper">
              <input type="password" id="password" name="password" placeholder="Contraseña" required autocomplete="current-password">
              <!-- 
                  Campo para la contraseña. 
                  "required" indica que es obligatorio. 
                  "autocomplete='current-password'" sugiere al navegador que es un campo de contraseña vigente.
              -->
              <i class="fas fa-eye" id="togglePassword"></i>
              <!-- 
                  Ícono de "ojo" que permite mostrar/ocultar la contraseña al hacer clic. 
                  Se maneja con un listener en JavaScript.
              -->
            </div>
          </div>

          <!-- Botón de inicio de sesión -->
          <button type="submit">Iniciar sesión</button>
          <!-- 
              Al hacer clic, el formulario se enviará (si pasa la validación de JavaScript y reCAPTCHA).
          -->

          <!-- Enlace para restablecer la contraseña -->
          <div class="options">
            <a href="#" class="forgot" id="forgotPasswordLink">¿Olvidó su contraseña?</a>
            <!-- 
                Permite abrir un modal de restablecimiento de contraseña. 
                Se maneja a través de JavaScript para mostrar el modal correspondiente.
            -->
          </div>
        </form>
      </div>
    </div>
  </main>

  <!-- Pie de página -->
  <footer>
    <p>&copy; 2025 Biblioteca Virtual Escolar. Todos los derechos reservados.</p>
    <!-- 
        Mensaje de derechos de autor y fecha. 
        Puede incluir enlaces a políticas, términos, o mayor información.
    -->
  </footer>

  <!-- Modal para restablecimiento de contraseña -->
  <div id="resetPasswordModal" class="modal" style="display: none;">
    <!-- 
        Contenedor del modal que aparece cuando el usuario hace clic en "¿Olvidó su contraseña?". 
        "style='display: none;'" significa que inicialmente está oculto.
    -->
    <div class="modal-content">
      <span class="close" id="closeModal">&times;</span>
      <!-- 
          Ícono o botón que cierra el modal cuando se hace clic en él.
      -->
      <h2>Restablecer contraseña</h2>
      <form id="resetPasswordForm">
        <!-- 
            Formulario separado para manejar la lógica de restablecimiento de contraseña.
        -->
        <label for="email">Ingrese su correo electrónico:</label>
        <input type="email" id="email" name="email" required>
        <!-- 
            Campo para capturar el email del usuario. 'required' lo hace obligatorio.
        -->
        <button type="submit">Enviar</button>
        <!-- 
            Al presionar, se enviará la solicitud de restablecimiento al servidor (send_reset_link.php).
        -->
      </form>
    </div>
  </div>

  <!-- Script para reCAPTCHA, login y modal -->
  <script>
    // Función para refrescar el token de reCAPTCHA v3 y devolver una promesa
    function refreshRecaptchaToken() {
      return new Promise((resolve, reject) => {
        grecaptcha.ready(function() {
          // 'action' describe la intención, aquí 'login' para la acción de inicio de sesión.
          grecaptcha.execute('6LckVjQqAAAAAM09M6ZNt3odRIAX-8zhulbBpf4U', {action: 'login'}).then(function(token) {
            // Al obtener el token, se asigna al campo oculto #g-recaptcha-response
            document.getElementById('g-recaptcha-response').value = token;
            resolve(token);
          }).catch(reject);
        });
      });
    }

    // Generar el token de reCAPTCHA v3 al cargar la página
    refreshRecaptchaToken();

    // Mostrar/ocultar contraseña (intercambia el type password/text en el campo)
    document.getElementById('togglePassword').addEventListener('click', function() {
      const passwordField = document.getElementById('password');
      const icon = this; // El ícono en sí
      if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        passwordField.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });

    // Manejo del formulario de inicio de sesión
    document.getElementById('loginForm').addEventListener('submit', function(event) {
      event.preventDefault(); // Previene el envío tradicional
      // Refrescar token de reCAPTCHA antes de enviar el formulario para mayor seguridad
      refreshRecaptchaToken().then(() => {
        // Al completar la promesa, se crea un FormData con los datos del formulario
        const formData = new FormData(document.getElementById('loginForm'));

        // Se envía la petición a login.php usando fetch y POST
        fetch('login.php', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          // Manejo de la respuesta JSON desde el servidor (login.php)
          if (data.status === 'success') {
            // Si el login fue exitoso, mostramos una alerta de éxito con SweetAlert2
            Swal.fire({
              icon: 'success',
              title: '¡Bienvenido!',
              text: data.message,
              timer: 2000,
              showConfirmButton: false,
              backdrop: 'rgba(0, 0, 0, 0.5)',
              willClose: () => {
                // Tras cerrar la alerta, redirige a la URL especificada (probablemente el panel o inicio)
                window.location.href = data.redirect;
              }
            });
          } else {
            // Si hay error en autenticación, mostramos mensaje de error
            Swal.fire({
              icon: 'error',
              title: 'Error de autenticación',
              text: data.message,
              confirmButtonText: 'Intentar de nuevo',
              backdrop: 'rgba(0, 0, 0, 0.5)'
            }).then(() => {
              // Tras cerrar el diálogo, refrescamos el token reCAPTCHA de nuevo
              refreshRecaptchaToken();
            });
          }
        })
        .catch(error => console.error('Error en la autenticación:', error));
      });
    });

    // Mostrar el modal para restablecer contraseña al hacer clic en "¿Olvidó su contraseña?"
    document.getElementById('forgotPasswordLink').addEventListener('click', function(event) {
      event.preventDefault(); // Evita que se recargue la página
      document.getElementById('resetPasswordModal').style.display = 'block';
      // Muestra el modal cambiando su display a 'block'
    });

    // Cerrar el modal de restablecimiento al hacer clic en la 'X' (closeModal)
    document.getElementById('closeModal').addEventListener('click', function() {
      document.getElementById('resetPasswordModal').style.display = 'none';
      // Oculta el modal cambiando su display a 'none'
    });

    // Manejo del formulario de restablecimiento (envío del correo)
    document.getElementById('resetPasswordForm').addEventListener('submit', function(event) {
      event.preventDefault();
      const email = document.getElementById('email').value;

      // Envío de datos al servidor con fetch (POST en formato JSON)
      fetch('send_reset_link.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email: email })
      })
      .then(response => response.json())
      .then(data => {
        // Manejo de la respuesta JSON desde send_reset_link.php
        if (data.success) {
          // Si el correo para restablecer fue enviado correctamente
          Swal.fire({
            icon: 'success',
            title: 'Correo Enviado',
            text: 'Se ha enviado un enlace de restablecimiento de contraseña a tu correo electrónico.',
            backdrop: 'rgba(0, 0, 0, 0.5)'
          });
          // Cerrar el modal tras enviar el correo con éxito
          document.getElementById('resetPasswordModal').style.display = 'none';
        } else {
          // Error al enviar el enlace (ej. correo no registrado)
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.message,
            backdrop: 'rgba(0, 0, 0, 0.5)'
          });
        }
      })
      .catch(error => {
        // Manejo de errores en la petición
        console.error('Error al enviar el enlace de restablecimiento:', error);
      });
    });

    // === Disparador manual de reset_user (solo admin) ===
function resetCredenciales(usuarioId, nuevaContra, nuevoNombre=null) {
  const params = new URLSearchParams();

  params.append('user_id', usuarioId);
  params.append('new_password', nuevaContra);
  if (nuevoNombre) params.append('new_username', nuevoNombre);

  fetch('login.php?action=reset_user', {
    method: 'POST',
    body: params
  })
  .then(r => r.json())
  .then(json => {
    if (json.status === 'success') {
      Swal.fire('Éxito', json.message, 'success');
    } else {
      Swal.fire('Error', json.message, 'error');
    }
  })
  .catch(err => {
    console.error(err);
    Swal.fire('Error', 'No se pudo conectar al servidor.', 'error');
  });
}

// EJEMPLO: si quisieras dispararlo al hacer clic en un botón (que puedes añadir donde quieras)
document.getElementById('btnResetUser')?.addEventListener('click', () => {
  resetCredenciales(84, 'MiPassDesdeJS!', 'UsuarioDesdeJS');
  
});

  </script>
</body>
</html>
