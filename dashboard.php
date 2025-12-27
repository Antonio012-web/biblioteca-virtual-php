<?php
session_start(); 
// Inicia o reanuda una sesión en PHP para poder usar variables de sesión
include 'config.php'; 
// Incluye el archivo de configuración, el cual contiene la conexión a la base de datos ($conn)

// Verificar que el usuario esté autenticado.
// 'loggedin' es una variable de sesión que se establece cuando el usuario inicia sesión con éxito
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    // Si la sesión no existe o 'loggedin' es false, 
    // se redirige al formulario de inicio de sesión
    header("Location: inicio_sesion.php");
    exit;
}

// Guardamos el nombre de usuario y el token de sesión actual
$username = $_SESSION['username'];
$currentToken = $_SESSION['session_token'];

// Verificar que el token en la base de datos coincida con el token de la sesión actual.
// Esto previene que un usuario pueda reutilizar cookies de sesión anteriores 
// si su sesión fue cerrada desde otro dispositivo o navegador.
$stmt = $conn->prepare("SELECT session_token FROM usuarios WHERE nombre = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 1) {
    // Si se encuentra un registro para ese usuario
    $data = $result->fetch_assoc();
    if ($data['session_token'] !== $currentToken) {
        // Si el token en la BD no coincide con la sesión actual, 
        // implica que el usuario cerró sesión en otro lado o se generó un token nuevo.
        session_destroy(); 
        // Se destruye la sesión local
        header("Location: inicio_sesion.php?session_timeout=1");
        // Redirige al inicio de sesión con un indicador de timeout
        exit;
    }
} else {
    // Si no se encuentra ese usuario en la BD (caso raro) 
    // se asume que la sesión no es válida
    session_destroy();
    header("Location: inicio_sesion.php?session_timeout=1");
    exit;
}

// Determina el tipo de usuario (ej. administrador, profesor, etc.)
// Se usa para mostrar u ocultar ciertas secciones del panel
$user_type = $_SESSION['user_type'];
?> 
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <!-- 
        Indica que se usará codificación UTF-8 para aceptar acentos y caracteres especiales
    -->
    <title>Dashboard</title>
    <!--
        Título de la página que aparecerá en la pestaña del navegador
    -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- 
        Metaetiqueta para adaptar la página al ancho de cualquier dispositivo (responsivo)
    -->

    <link rel="stylesheet" href="css/nofouc.css">
    <!-- 
        Archivo CSS para prevenir FOUC (Flash of Unstyled Content)
        usualmente contiene estilos para ocultar contenido 
        antes de que se apliquen los estilos finales
    -->

    <script> 
      // Antes de que el navegador muestre algo,
      // se agrega la clase "nofouc" al elemento <html>
      // Esto evita que se vea un parpadeo antes de aplicar estilos.
      document.documentElement.classList.add('nofouc');
    </script>

    <!-- Estilos globales y específicos -->
    <link rel="stylesheet" href="css/dashboard.css">
    <!-- 
        Hoja de estilos principal para el diseño del dashboard
    -->

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!-- 
        Biblioteca de íconos FontAwesome para mostrar íconos de interfaz (casita, engrane, etc.)
    -->

    <!-- Slick Carousel CSS -->
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css"/>
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css"/>
    <!-- 
        Archivos CSS de la librería Slick Carousel para generar carruseles de elementos
    -->

    <!-- Librerías globales de JavaScript -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <!-- 
        jQuery es muy común para manipulaciones DOM y peticiones AJAX
    -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- 
        Librería SweetAlert2 para mostrar alertas y diálogos con estilo
    -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.70/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.70/vfs_fonts.js"></script>
    <!-- 
        Biblioteca pdfmake y fuentes virtuales (vfs_fonts) para generar PDFs en el navegador
    -->

    <!-- Slick Carousel JS -->
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"></script>
    <!-- 
        Script principal de la librería Slick para carruseles
    -->

    <!-- Scripts de cada módulo (ej. para manejar la lógica de libros, usuarios, etc.) -->
    <script src="js/gestion_libros.js"></script>
    <script src="js/gestion_usuarios.js"></script>
    <script src="js/gestion_profesores.js"></script>
    <!-- Agrega más si tienes otros módulos -->

</head>
<body>
    <!-- 
        #overlay y #spinner se muestran cuando el contenido está cargando
        para indicar al usuario que espere
    -->
    <div id="overlay">
        <div id="spinner" class="loader"></div>
    </div>

    <!-- SIDEBAR (barra lateral) -->
    <div class="sidebar" id="sidebar">
        <!-- Encabezado fijo de la sidebar -->
        <div class="sidebar-header">
            <button class="close-btn">
                <!-- 
                    Botón para ocultar la barra lateral (toggle)
                -->
                <i class="fas fa-bars"></i>
                <span class="tooltip-text">Ocultar barra de navegación</span>
            </button>
        </div>
        <!-- Contenido desplazable dentro de la barra lateral -->
        <div class="sidebar-content"> 
            <div class="user-info">
                <!-- Muestra el ícono de usuario y el nombre de usuario actual -->
                <i class="fas fa-user-circle"></i>
                <span><?php echo htmlspecialchars($username); ?></span>
                <!-- 
                    htmlspecialchars() evita que se ejecuten scripts si el username contiene caracteres especiales
                -->
            </div>
            <!-- 
                Enlaces para cargar diferentes secciones del panel de gestión 
                usando la función loadContent('archivo.php')
            -->
            <a class="nav-link active" href="dashboard.php" id="linkDashboard" onclick="loadContent('dashboard.php')">
                <i class="fas fa-home"></i> Inicio
            </a>
            <a href="#" onclick="loadContent('gestion_libros.php')"><i class="fas fa-book"></i> Libros</a>

            <!-- 
                Dependiendo del tipo de usuario, se muestran distintas opciones
                Si user_type != 'profesor', se asume que es un rol más privilegiado
                y por tanto ve todas las secciones
            -->
            <?php if ($user_type != 'profesor'): ?>
                <a href="#" onclick="loadContent('gestion_usuarios.php')"><i class="fas fa-user"></i> Usuarios</a>
                <a href="#" onclick="loadContent('gestion_multimedia.php')"><i class="fas fa-photo-video"></i> Multimedia</a>
                <a href="#" onclick="loadContent('gestion_profesores.php')"><i class="fas fa-chalkboard-teacher"></i> Docentes</a>
                <a href="#" onclick="loadContent('gestion_acceso.php')"><i class="fa-regular fa-id-card"></i> Accesos</a>
                <a href="#" onclick="loadContent('gestion_reservas.php')"><i class="fas fa-calendar-alt"></i> Reservas</a>
                <a href="#" onclick="loadContent('gestion_lectura.php')"><i class="fas fa-book-reader"></i> Lectura</a>
                <a href="#" onclick="loadContent('estadisticas.php')"><i class="fas fa-chart-line"></i> Estadísticas</a>
                <a href="#" onclick="loadContent('gestion_reseñas.php')"><i class="fa-regular fa-star-half-stroke"></i> Reseñas</a>
                <a href="#" onclick="loadContent('gestion_contacto.php')"><i class="fa-brands fa-rocketchat"></i> Mensajes</a>
            <?php else: ?>
                <!-- 
                    Si es un profesor, se muestran menos opciones
                -->
                <a href="#" onclick="loadContent('gestion_reservas.php')"><i class="fas fa-calendar-alt"></i> Reservas</a>
                <a href="#" onclick="loadContent('gestion_multimedia.php')"><i class="fas fa-photo-video"></i> Multimedia</a>
                <a href="#" onclick="loadContent('gestion_lectura.php')"><i class="fas fa-book-reader"></i> Lectura</a>
                <a href="#" onclick="loadContent('estadisticas.php')"><i class="fas fa-chart-line"></i> Estadísticas</a>
                <a href="#" onclick="loadContent('gestion_reseñas.php')"><i class="fa-regular fa-star-half-stroke"></i> Reseñas</a>
                <a href="#" onclick="loadContent('gestion_contacto.php')"><i class="fa-brands fa-rocketchat"></i> Mensajes</a>
            <?php endif; ?>

            <!-- Enlace para cerrar la sesión del usuario -->
            <a href="logout.php"><i class="fas fa-sign-out-alt"></i> Salir</a>
        </div>
    </div>

    <!-- Área principal de contenido (lo que no es la sidebar) -->
    <div class="content" id="content">
        <!-- 
            Sección para breadcrumbs y notificaciones 
        -->
        <nav id="breadcrumb-container" class="breadcrumb">
           <div class="notification-container">
               <!-- Ícono de campana con un contador de notificaciones (#notificationCount) -->
               <i class="fas fa-bell"></i>
               <span class="badge" id="notificationCount">0</span>
           </div>
           <!-- Reloj o elemento que puede mostrar fecha y hora actual (#clock) -->
           <span id="clock"></span>
           <!-- Enlace que vuelve al inicio del dashboard -->
           <a href="dashboard.php" onclick="loadContent('dashboard.php')">Inicio</a>
        </nav>
        
        <!-- Contenedor donde se carga el contenido dinámico con AJAX -->
        <div id="pageContent">
            <!-- Mensaje de bienvenida por defecto -->
            <h1>¡Bienvenido al panel de gestión, <span><?php echo htmlspecialchars($username); ?></span>!</h1>
            <p>Selecciona una opción del menú para comenzar.</p>
            <div class="logo-container">
                <img src="img/logoP.png" alt="Logo de la escuela">
            </div>

            <?php
            // Se realiza una consulta para mostrar los 5 libros más recientemente añadidos
            $sql = "SELECT id, titulo, autor, categoria, imagen_libro, añoPublicacion
                    FROM libros
                    ORDER BY añoPublicacion DESC
                    LIMIT 5";
            $result = mysqli_query($conn, $sql);
            ?>

            <!-- Separador visual entre secciones -->
            <div class="section-separator"></div> 

            <div class="ultimos-libros">
                <h2>Últimos Libros Añadidos</h2>
                <?php if ($result && mysqli_num_rows($result) > 0): ?>
                    <!-- Contenedor para crear un carrusel con Slick Carousel -->
                    <div class="carousel-libros">
                        <?php while ($row = mysqli_fetch_assoc($result)): ?>
                            <div class="slide-libro">
                                <!-- Muestra la portada del libro -->
                                <img src="<?php echo htmlspecialchars($row['imagen_libro']); ?>" alt="Portada" class="portada-libro">
                                <!-- Información básica del libro -->
                                <div class="info-libro">
                                    <strong><?php echo htmlspecialchars($row['titulo']); ?></strong><br>
                                    <em><?php echo htmlspecialchars($row['autor']); ?></em><br>
                                    <p><?php echo htmlspecialchars($row['categoria']); ?></p>
                                    <small>Agregado: <?php echo htmlspecialchars($row['añoPublicacion']); ?></small>
                                </div>
                            </div>
                        <?php endwhile; ?>
                    </div>
                <?php else: ?>
                    <!-- Si no hay libros recientes, se muestra un mensaje -->
                    <p>No hay libros recientes.</p>
                <?php endif; ?>
                <footer>
                    © 2025 Biblioteca Virtual Escolar. Todos los derechos reservados.
                </footer>
            </div>
        </div>
    </div>
    
    <!-- Botón flotante para mostrar la barra de navegación si está oculta -->
    <button class="float-btn" id="floatBtn">
      <i class="fas fa-bars"></i>
      <span class="tooltip-text">Mostrar barra de navegación. Puede arrastrar este botón a su preferencia.</span>
    </button>

    <!-- Script principal de dashboard (js/dashboard.js) 
         Encargado de la lógica para abrir/cerrar la sidebar,
         manejar la carga de contenido AJAX, etc.
    -->
    <script src="js/dashboard.js"></script>

    <!-- Dropdown de notificaciones (contenido de la campana) -->
    <div id="notificationsDropdown" class="notification-dropdown">
        <div class="dropdown-header">
            <h3>Notificaciones</h3>
        </div>
        <div class="notifications-actions">
            <button id="markAllReadBtnDropdown">Marcar todo como leído</button>
            <button id="clearNotificationsBtnDropdown">Limpiar notificaciones</button>
        </div>
        <div id="notificationsListDropdown" class="dropdown-body"></div>
        <!-- Pie del dropdown de notificaciones -->
        <div class="dropdown-footer">
            <a href="#"></a>
        </div>
    </div>
</body>
</html>
