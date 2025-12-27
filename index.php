<!DOCTYPE html>
<!-- Indica que el documento está escrito en HTML5 -->
<html lang="es">
<head>
    <meta charset="UTF-8">
    <!-- Configura la codificación de caracteres a UTF-8 para compatibilidad con caracteres latinos -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!-- Indica a los navegadores usar el modo más reciente de compatibilidad -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Hace la página adaptable a diferentes tamaños de pantalla, especialmente móviles -->
    <title>Biblioteca Virtual - Primaria</title>
    <link rel="stylesheet" href="css/styles.css">
    <!-- Vincula el archivo CSS principal donde se definen estilos personalizados -->
    <!-- Using Swiper v9.0.1 to ensure consistency across updates -->
    <link rel="stylesheet" href="https://unpkg.com/swiper@9.0.1/swiper-bundle.min.css">
    <!-- Swiper es una biblioteca de JavaScript para crear carruseles y sliders dinámicos -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!-- Biblioteca de íconos para usar en la interfaz, como iconos de usuario, casa, etc. -->
</head>
<body>
    <div class="container">
        <!-- Contenedor principal de la página -->
        <nav aria-label="Main navigation"> 
            <!-- Elemento de navegación principal (menu) -->
            <div class="logo">
                <img src="img/logoP.png" alt="Logo of Escuela Primaria Manuel Del Mazo Villasante">
                <h1>Escuela Primaria Manuel Del Mazo Villasante</h1>
                <!-- Título de la institución escolar -->
            </div>
            <div class="nav-links">
                <!-- Enlaces de navegación que permiten moverse por el sitio -->
                <a class="nav-link active" href="index.php" aria-current="page"><i class="fa-solid fa-house"></i> Inicio</a>
                <a href="catalogo.php"><i class="fa-solid fa-book"></i> Catálogo</a> 
                <a href="contenido.php"><i class="fa-solid fa-photo-film"></i> Multimedia</a>
                <a href="contacto.php"><i class="fa-solid fa-message"></i> Contacto</a>
                <a href="inicio_sesion.php" class="login"><i class="fa-solid fa-right-to-bracket"></i> Inicio de sesión</a>
            </div>
        </nav>

        <main role="main">
            <!-- Sección principal del sitio web donde se muestra el contenido relevante -->
            <section class="welcome-message">
                <h2>¡Bienvenidos a la Biblioteca Virtual de Sueños!</h2> 
                <!-- Mensaje de bienvenida destacado en la página de inicio -->
            </section>
            <?php include 'nuevos_libros.php'; ?>
            <!-- Incluye el listado de nuevos libros desde un archivo PHP -->
            <?php include 'top_libros.php'; ?>
            <!-- Incluye la sección con los libros más populares desde otro archivo PHP -->
            <?php include 'libros_mas_leidos.php'; ?>
            <!-- Incluye la sección con los libros más leidos desde otro archivo PHP -->
        </main>
        
        <footer>
            <!-- Pie de página con derechos de autor -->
            <p>&copy; 2025 Biblioteca Virtual Escolar. Todos los derechos reservados.</p>
        </footer>

    </div>

    <script src="https://unpkg.com/swiper/swiper-bundle.min.js"></script>
    <!-- Se carga la biblioteca Swiper para la funcionalidad de los carruseles -->
    <script src="js/scripts.js"></script>
    <!-- Se carga el archivo JavaScript principal para agregar funcionalidades personalizadas -->
</body>
</html>
 