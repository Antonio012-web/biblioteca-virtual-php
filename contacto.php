<!DOCTYPE html>
<!-- 
    Especifica que este archivo está escrito en HTML5, lo que ayuda a los navegadores 
    a renderizarlo correctamente.
-->
<html lang="es">
<!--
    Indica que el contenido principal del documento está en español.
-->
<head>
  <meta charset="UTF-8">
  <!-- 
      Define la codificación de caracteres como UTF-8 para permitir caracteres especiales.
  -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- 
      Ajusta el ancho del contenido al dispositivo para que la página sea "responsiva"
      en móviles y tabletas.
  -->
  <title>Contacto - Biblioteca Virtual</title>
  <!--
      Título que aparece en la pestaña del navegador y en resultados de búsqueda.
  -->
  <link rel="stylesheet" href="css/styles.css">
  <!-- 
      Archivo con estilos generales para la página.
  -->
  <link rel="stylesheet" href="css/contacto.css">
  <!-- 
      Archivo CSS específico para la página de contacto.
  -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <!-- 
      Biblioteca de íconos (Font Awesome) para usar en los enlaces de navegación.
  -->
</head>
<body>
  <nav>
    <!-- 
        Barra de navegación donde se muestra el logo y los enlaces principales.
    -->
    <div class="logo">
      <img src="img/logoP.png" alt="Logo de la Escuela">
      <!-- 
          El atributo "alt" describe la imagen para lectores de pantalla o 
          si la imagen no puede mostrarse.
      -->
      <h1>Escuela Primaria Manuel Del Mazo Villasante</h1>
      <!-- 
          Encabezado con el nombre de la institución escolar.
      -->
    </div>
    <div class="nav-links">
      <!-- 
          Enlaces de navegación que apuntan a las diferentes secciones del sitio.
      -->
      <a href="index.php"><i class="fa-solid fa-house"></i> Inicio</a>
      <a href="catalogo.php"><i class="fa-solid fa-book"></i> Catálogo</a>
      <a href="contenido.php"><i class="fa-solid fa-photo-film"></i> Multimedia</a>
      <a class="nav-link active" href="contacto.php"><i class="fa-solid fa-message"></i> Contacto</a>
      <!-- 
          La clase "active" indica la página en la que se encuentra el usuario.
      -->
      <a href="inicio_sesion.php" class="login"><i class="fa-solid fa-right-to-bracket"></i> Inicio de Sesión</a>
    </div>
  </nav>
  <main>
    <!-- 
        Sección principal del sitio para el formulario de contacto.
    -->
    <section class="contacto">
      <h2>Contacto</h2>
      <p>Puedes contactarnos a través del siguiente formulario.</p>

      <form id="formularioContacto">
        <!-- 
            Formulario para que los usuarios envíen sus dudas o sugerencias. 
            El atributo 'id' permite gestionarlo con JavaScript.
        -->
        <fieldset>
          <legend>Envíanos tu mensaje</legend>
          <!-- 
              Agrupación semántica de campos relacionados con el formulario de contacto.
          -->
          <div class="form-group">
            <label for="nombre">Nombre:</label>
            <input type="text" id="nombre" name="nombre" required placeholder="Juan Pérez">
            <!-- 
                Campo de texto para el nombre del usuario. 'required' obliga a completarlo.
            -->
          </div>
          <div class="form-group">
            <label for="correo">Correo electrónico:</label>
            <input type="email" id="correo" name="correo" required placeholder="ejemplo@gmail.com">
            <!-- 
                Campo de correo con validación básica de formato.
            -->
          </div>
          <div class="form-group">
            <label for="mensaje">Mensaje:</label>
            <textarea id="mensaje" name="mensaje" rows="5" required placeholder="Escribe tu comentario"></textarea>
            <!-- 
                Área de texto para que el usuario escriba su mensaje. 
                'rows' define el alto del campo.
            -->
          </div>
          <div class="form-group button-group">
            <button type="submit">Enviar mensaje</button>
            <!-- 
                Al presionar el botón, se envía el formulario (validado mediante JavaScript).
            -->
          </div>
        </fieldset>
      </form>
      <div id="resultado"></div>
      <!-- 
          Div donde se mostrará la respuesta o resultado tras enviar el mensaje.
      -->
    </section>
  </main>
  <footer>
    <!-- 
        Pie de página con el aviso de derechos de autor.
    -->
    <p>&copy; 2025 Biblioteca Virtual Escolar. Todos los derechos reservados.</p>
  </footer>
  <!-- Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <!-- 
      SweetAlert2 para mostrar alertas personalizadas.
  -->
  <script src="js/enviar_mensaje.js"></script>
  <!-- 
      Lógica de envío y validación del formulario de contacto.
  -->
</body>
</html>
