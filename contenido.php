<!DOCTYPE html>
<!-- 
    Indica que este documento está escrito en HTML5.
    Ayuda a los navegadores a interpretar correctamente la estructura del sitio.
-->
<html lang="es">
<head>
    <meta charset="UTF-8">
    <!--
        Define la codificación de caracteres como UTF-8 
        para que se muestren caracteres especiales, acentos, etc.
    -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!--
        Ajusta la escala del contenido al ancho del dispositivo,
        facilitando la visualización en pantallas móviles.
    -->
    <title>Contenido Virtual - Biblioteca Virtual</title>
    <!--
        Título que aparece en la pestaña del navegador y en motores de búsqueda.
    -->
    <link rel="stylesheet" href="css/styles.css">
    <!--
        Archivo de estilos generales para el sitio.
    -->
    <link rel="stylesheet" href="css/mostrar_multi.css">
    <!-- 
        Archivo de estilos específico para las tarjetas de contenido multimedia.
        Separa el diseño del contenido multimedia del resto de la página.
    -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!--
        Integración de íconos Font Awesome, usados en los enlaces y filtros.
    -->
</head>
<body>
    <nav>
        <!--
            Barra de navegación principal, presente en la parte superior de la página.
        -->
        <div class="logo">
            <img src="img/logoP.png" alt="Logo de la Escuela">
            <!-- 
                Muestra el logo de la escuela. 
                El atributo alt describe la imagen para usuarios con lectores de pantalla.
            -->
            <h1>Escuela Primaria Manuel Del Mazo Villasante</h1>
            <!--
                Encabezado que indica el nombre oficial de la escuela.
            -->
        </div>
        <div class="nav-links">
            <!--
                Sección de enlaces que permiten moverse por diferentes páginas del sitio.
            -->
            <a href="index.php"><i class="fa-solid fa-house"></i> Inicio</a>
            <a href="catalogo.php"><i class="fa-solid fa-book"></i> Catálogo</a>
            <a class="nav-link active" href="contenido.php"><i class="fa-solid fa-photo-film"></i> Multimedia</a>
            <!--
                La clase "active" resalta que el usuario está en la página actual (Multimedia).
            -->
            <a href="contacto.php"><i class="fa-solid fa-message"></i> Contacto</a>
            <a href="inicio_sesion.php" class="login"><i class="fa-solid fa-right-to-bracket"></i> Inicio de Sesión</a>
        </div>
    </nav>

    <main>
        <!--
            Zona principal de contenido. 
        -->
        <h2>Contenido virtual multimedia</h2>
        <!--
            Título principal de la sección de contenido multimedia.
        -->

        <div class="filtros">
            <!--
                Contenedor para agrupar la barra de búsqueda y los selectores de filtros.
            -->

            <!-- Barra de búsqueda centrada -->
            <label for="filtro-busqueda"></label>
            <input type="text" id="filtro-busqueda" placeholder="Buscar por título o autor...">
            <!--
                Permite buscar contenido multimedia por su título o por el autor.
                El label se deja vacío para propósitos de accesibilidad si se requiere.
            -->

            <!-- Contenedor para los filtros alineados horizontalmente -->
            <div class="filtros-grupo">
                <!-- Filtro por nivel (grado) -->
                <div>
                    <label for="filtro-nivel">
                        <i class="fa-solid fa-graduation-cap filter-icon"></i> 
                        Filtrar por nivel:
                    </label>
                    <select id="filtro-nivel">
                        <option value="">Todos</option>
                        <option value="Primero">Primero</option>
                        <option value="Segundo">Segundo</option>
                        <option value="Tercero">Tercero</option>
                        <option value="Cuarto">Cuarto</option>
                        <option value="Quinto">Quinto</option>
                        <option value="Sexto">Sexto</option>
                    </select>
                </div>

                <!-- Filtro por fecha de subida (ascendente o descendente) -->
                <div>
                    <label for="filtro-fecha">
                        <i class="fa-solid fa-calendar filter-icon"></i> 
                        Filtrar por fecha:
                    </label>
                    <select id="filtro-fecha">
                        <option value="">Todos</option>
                        <option value="asc">Antiguos</option>
                        <option value="desc">Recientes</option>
                    </select>
                </div>

                <!-- Filtro por tipo de contenido multimedia -->
                <div>
                    <label for="filtro-tipo">
                        <i class="fa-solid fa-filter filter-icon"></i> 
                        Filtrar por tipo:
                    </label>
                    <select id="filtro-tipo">
                        <option value="">Todos</option>
                        <option value="Video">Videos</option>
                        <option value="AudioLibro">Audiolibros</option>
                        <option value="PDF">PDFs</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Sección de Videos -->
        <section id="video-section">
            <h3>Videos</h3>
            <!--
                El título describe la sección donde se muestran los recursos en formato de video.
            -->
            <div id="video-content" class="multimedia-row">
                <!--
                    Contiene las tarjetas de videos disponibles.
                    Se usa la clase "multimedia-row" para exhibirlos en un formato flexible o en cuadrícula.
                -->

                <!-- Tarjeta de ejemplo -->
                <div class="card" 
                     data-tipo="Video" 
                     data-titulo="Título del Video" 
                     data-descripcion="Descripción del video" 
                     data-autor="Autor del video" 
                     data-etiquetas="Etiqueta1, Etiqueta2" 
                     data-nivel="Primero" 
                     data-url="#">
                    <h3>Título del Video</h3>
                </div>
                <!--
                    data-tipo, data-titulo, etc., son atributos personalizados
                    que pueden utilizarse con JavaScript para filtrar o mostrar detalles.
                -->
            </div>
            <!-- Botones para ver más resultados y mostrar menos en la misma sección -->
            <button id="ver-mas-video" class="btn-ver-mas">Ver más Videos</button>
            <button id="mostrar-menos-video" class="btn-mostrar-menos" style="display: none;">Mostrar menos</button>
            <!-- 
                Sección de paginación para videos, inicialmente oculta 
                hasta que el script la haga visible si es necesario.
            -->
            <div id="video-pagination" class="pagination" style="display: none;"></div>
        </section>

        <!-- Sección de Audiolibros -->
        <section id="audiolibro-section">
            <h3>Audiolibros</h3>
            <div id="audiolibro-content" class="multimedia-row">
                <!-- Tarjeta de ejemplo -->
                <div class="card" 
                     data-tipo="AudioLibro" 
                     data-titulo="Título del Audiolibro" 
                     data-descripcion="Descripción del audiolibro" 
                     data-autor="Autor del audiolibro" 
                     data-etiquetas="Etiqueta1, Etiqueta2" 
                     data-nivel="Segundo" 
                     data-url="https://www.example.com/audio.mp3">
                    <h3>Título del Audiolibro</h3>
                </div>
            </div>
            <button id="ver-mas-audiolibro" class="btn-ver-mas">Ver más Audiolibros</button>
            <button id="mostrar-menos-audiolibro" class="btn-mostrar-menos" style="display: none;">Mostrar menos</button>
            <div id="audiolibro-pagination" class="pagination" style="display: none;"></div>
        </section>

        <!-- Sección de PDFs -->
        <section id="pdf-section">
            <h3>PDFs</h3>
            <div id="pdf-content" class="multimedia-row">
                <!-- Tarjeta de ejemplo -->
                <div class="card" 
                     data-tipo="PDF" 
                     data-titulo="Título del PDF" 
                     data-descripcion="Descripción del PDF" 
                     data-autor="Autor del PDF" 
                     data-etiquetas="Etiqueta1, Etiqueta2" 
                     data-nivel="Cuarto" 
                     data-url="https://www.example.com/documento.pdf">
                    <h3>Título del PDF</h3>
                </div>
            </div>
            <button id="ver-mas-pdf" class="btn-ver-mas">Ver más PDFs</button>
            <button id="mostrar-menos-pdf" class="btn-mostrar-menos" style="display: none;">Mostrar menos</button>
            <div id="pdf-pagination" class="pagination" style="display: none;"></div>
        </section>
    </main>

    <!-- Modal para ver contenido (video, audio o PDF) en detalle -->
    <div id="modal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <!--
                Botón (ícono) de cierre del modal.
            -->
            <div id="modal-body">
                <!-- Aquí se mostrará el contenido del modal dinámicamente -->
                <div id="pdf-container" style="display:none;">
                    <!-- Contenedor específico para mostrar PDFs -->
                    <iframe id="pdf-frame" src="" style="width:100%; height:500px;" frameborder="0"></iframe>
                </div>
            </div>
        </div>
    </div>

    <!-- Importar archivos JavaScript -->
    <script src="js/mostrar_multi.js"></script>
    <!-- 
        Script personalizado que maneja el filtrado, la paginación y la visualización de los contenidos.
    -->
    <script src="https://www.youtube.com/iframe_api"></script>
    <!--
        Permite usar la API de YouTube para incrustar y controlar videos si es necesario.
    -->

    <footer>
        <!-- Pie de página con información de derechos de autor -->
        <p>&copy; 2025 Biblioteca Virtual Escolar. Todos los derechos reservados.</p>
    </footer>
</body>
</html>
