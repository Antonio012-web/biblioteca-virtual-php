<!DOCTYPE html>
<html lang="es">
<!-- 
  Este documento HTML permite la administración de libros en la Biblioteca Virtual Escolar.
  Incluye funcionalidades para agregar, editar, eliminar, exportar e importar información de libros,
  además de mostrar detalles y gestionar la paginación de los registros.
-->
<head>
    <!-- Define la codificación de caracteres para soportar el idioma español y caracteres especiales -->
    <meta charset="UTF-8">
    <!-- Título de la página que aparece en la pestaña del navegador -->
    <title>Administrar Libros</title>
    <!-- Vinculación a la hoja de estilos específica para la gestión de libros -->
    <link rel="stylesheet" href="css/gestion_libros.css">
    
    <!-- Librerías necesarias -->
    <!-- Inclusión de Font Awesome para usar íconos en la interfaz -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    
    <!-- Inclusión de SweetAlert2 para mostrar alertas y diálogos emergentes -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    
    <!-- Se han eliminado Moment.js y sus complementos para optimizar el rendimiento -->
    <!--
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/locale/es.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.34/moment-timezone-with-data.min.js"></script>
    -->
    
    <!-- Otras librerías -->
    <!-- Inclusión de la librería XLSX para la importación y exportación de archivos Excel -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js"></script>
    <!-- Inclusión de pdfmake para la generación de documentos PDF -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.70/pdfmake.min.js"></script>
    <!-- Inclusión de las fuentes virtuales necesarias para pdfmake -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.70/vfs_fonts.js"></script>
    
    <!-- Configuración del viewport para asegurar la correcta visualización en dispositivos móviles -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <!-- Contenedor principal que engloba todo el contenido de la página -->
    <div class="container">
        <header>
            <!-- Encabezado principal de la sección de administración de libros -->
            <h2>Administrar libros</h2> 
        </header>
 
        <!-- Barra superior que muestra el total de registros y opciones de ordenamiento -->
        <div class="top-bar">
            <!-- Sección que muestra el total de libros registrados -->
            <div class="total-registros">
                <!-- Ícono representativo de libro -->
                <i class="fa-solid fa-book"></i>
                <!-- Elemento que muestra el número total de registros; se actualizará dinámicamente -->
                <span id="totalRegistros">0</span>
            </div>
            <!-- Sección de filtros para ordenar los libros -->
            <div class="filtros">
                <!-- Etiqueta con ícono que describe el selector de ordenamiento -->
                <label for="sortSelect"><i class="fa-solid fa-arrow-up-short-wide"></i> Ordenar por:</label>
                <!-- Menú desplegable que permite seleccionar el criterio de ordenamiento:
                     'Recientes' para los libros más nuevos y 'Antiguos' para los más antiguos -->
                <select id="sortSelect">
                    <option value="recent">Recientes</option>
                    <option value="oldest">Antiguos</option>
                </select>
            </div>
        </div> 

        <!-- Barra de búsqueda que permite filtrar los libros por título, autor, categoría o disponibilidad -->
        <div class="search-bar">
            <input type="text" id="searchBar" placeholder="Buscar por título, autor, categoría, disponibilidad...">
        </div>

        <!-- Sección de acciones de la tabla que incluye botones para diversas operaciones -->
        <div class="table-actions">
            <!-- Botón para abrir el modal y agregar un nuevo libro -->
            <button class="btn grow" id="addBookButton"><i class="fas fa-plus"></i> Agregar Libro</button>
            <!-- Botón para editar la información del libro seleccionado -->
            <button class="btn grow" id="editBookButton"><i class="fas fa-edit"></i> Editar</button>
            <!-- Botón para exportar los registros de libros a un archivo Excel -->
            <button id="exportExcelButton" class="btn grow"><i class="fas fa-file-excel"></i> Exportar a Excel</button>
            <!-- Botón para exportar los registros de libros a un archivo PDF -->
            <button id="exportPDFButton" class="btn grow"><i class="fas fa-file-pdf"></i> Exportar a PDF</button>
            <!-- Botón para imprimir los registros de libros -->
            <button id="printButton" class="btn grow"><i class="fas fa-print"></i> Imprimir</button>
            <!-- Botón para importar registros de libros desde un archivo Excel -->
            <button id="importExcelButton" class="btn grow"><i class="fas fa-file-import"></i> Importar Excel</button>
            <!-- Botón para eliminar de forma masiva los libros seleccionados -->
            <button class="btn btn-delete-massive grow" id="deleteMassiveButton"><i class="fas fa-trash-alt"></i> Eliminar</button>
            <!-- Input oculto para seleccionar archivos Excel, activado al hacer clic en el botón de importar -->
            <input type="file" id="importExcelInput" style="display:none" accept=".xlsx, .xls" /> 
        </div>

        <!-- Contenedor que aloja la tabla con los registros de libros -->
        <div class="table-container">
            <table class="reservas-table" id="booksTable">
                <thead>
                    <tr>
                        <!-- Checkbox para selección masiva de registros -->
                        <th><input type="checkbox" id="selectAll"></th>
                        <!-- Columna para el número o índice del registro -->
                        <th>#</th>
                        <!-- Columna que muestra el título del libro -->
                        <th>Título</th>
                        <!-- Columna que muestra el autor del libro -->
                        <th>Autor</th>
                        <!-- Columna que muestra la categoría a la que pertenece el libro -->
                        <th>Categoría</th>
                        <!-- Columna que indica el grado (nivel educativo) asociado al libro -->
                        <th>Grado</th>
                        <!-- Columna que muestra la fecha de publicación del libro -->
                        <th>Fecha de Publicación</th>
                        <!-- Columna que indica si el libro está disponible o no -->
                        <th>Disponibilidad</th>
                        <!-- Columna que muestra la imagen del libro (usualmente una URL de la imagen) -->
                        <th>Imagen</th>
                        <!-- Columna para las acciones individuales sobre cada libro (ver, editar, eliminar, etc.) -->
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Aquí se inyectará dinámicamente el contenido de la tabla con los registros de libros -->
                </tbody>
            </table>
        </div>

        <!-- Contenedor para la paginación que permite navegar entre las páginas de registros -->
        <div class="pagination">
            <!-- La paginación se generará dinámicamente para mostrar números de página o controles de navegación -->
        </div>

        <footer>
            <!-- Pie de página que muestra la información de derechos de autor -->
            © 2025 Biblioteca Virtual Escolar. Todos los derechos reservados.
        </footer>
    </div>

    <!-- Modal para Agregar/Editar Libro -->
    <div id="bookModal" class="modal">
        <div class="modal-content">
            <!-- Botón para cerrar el modal -->
            <span class="close">&times;</span>
            <!-- Formulario para agregar o editar la información de un libro -->
            <form id="bookForm">
                <!-- Título del modal que cambia según la acción (Agregar o Editar) -->
                <h2 id="modalTitle">Agregar Libro</h2>
                <!-- Campo oculto para almacenar el ID del libro al editar -->
                <input type="hidden" id="bookId" name="id">

                <!-- Grupo de formulario para el título del libro -->
                <div class="form-group">
                    <label for="titulo">Título:</label>
                    <input type="text" id="titulo" name="titulo" required placeholder="Ingrese el Título" autocomplete="off">
                </div>

                <!-- Grupo de formulario para el autor del libro -->
                <div class="form-group">
                    <label for="autor">Autor:</label>
                    <input type="text" id="autor" name="autor" required placeholder="Ingrese el Autor" autocomplete="off">
                </div>

                <!-- Grupo de formulario para seleccionar la categoría del libro -->
                <div class="form-group">
                    <label for="categoria">Categoría:</label>
                    <select id="categoria" name="categoria" required>
                        <option value="cuento">Cuento</option>
                        <option value="fabula">Fábula</option>
                        <option value="aventura">Aventura</option>
                        <option value="historieta">Historieta</option>
                        <option value="interactivos">Interactivos</option>
                        <option value="ciencia">Ciencia y Naturaleza</option>
                        <option value="saberes">Saberes y Pensamientos</option>
                    </select>
                </div> 

                <!-- Grupo de formulario para seleccionar el grado o nivel educativo asociado al libro -->
                <div class="form-group">
                    <label for="grado">Grado:</label>
                    <select id="grado" name="grado" required>
                        <option value="primero">Primero</option>
                        <option value="segundo">Segundo</option>
                        <option value="tercero">Tercero</option>
                        <option value="cuarto">Cuarto</option>
                        <option value="quinto">Quinto</option>
                        <option value="sexto">Sexto</option>
                    </select>
                </div> 

                <!-- Campo oculto para almacenar la fecha de publicación; se llenará mediante JavaScript o en el servidor -->
                <input type="hidden" id="añoPublicacion" name="añoPublicacion" required>

                <!-- Grupo de formulario para ingresar la descripción del libro -->
                <div class="form-group">
                    <label for="descripcion">Descripción:</label>
                    <textarea id="descripcion" placeholder="Ingrese una Descripción" name="descripcion" required autocomplete="off"></textarea>
                </div>

                <!-- Grupo de formulario para seleccionar la disponibilidad del libro -->
                <div class="form-group">
                    <label for="disponibilidad">Disponibilidad:</label>
                    <select id="disponibilidad" name="disponibilidad" required>
                        <option value="disponible">Disponible</option>
                        <option value="no disponible">No Disponible</option>
                    </select>
                </div>

                <!-- Grupo de formulario para ingresar la URL de descarga del libro -->
                <div class="form-group">
                    <label for="urlDescarga">URL de Descarga:</label>
                    <input type="text" id="urlDescarga" name="urlDescarga" required autocomplete="off" placeholder="http://ejemplo.com">
                </div>

                <!-- Grupo de formulario para ingresar la URL de la imagen del libro -->
                <div class="form-group">
                    <label for="imagen_libro">URL de Imagen del Libro:</label>
                    <input type="text" id="imagen_libro" name="imagen_libro" required autocomplete="off" placeholder="http://ejemplo.com">
                </div>

                <!-- Botón para enviar el formulario y guardar los cambios o el nuevo libro -->
                <button type="submit" class="btn">Guardar</button>
            </form>
        </div>
    </div>
 
    <!-- Modal para ver detalles del libro -->
    <div id="viewBookModal" class="modal">
        <div class="modal-content">
            <!-- Botón para cerrar el modal de visualización -->
            <span class="close" id="closeViewModal">&times;</span>
            <!-- Título del modal para indicar que se mostrarán los detalles del libro -->
            <h2 id="viewBookTitle">Detalle del libro</h2>
            <div class="modal-body">
                <!-- Lista que se llenará dinámicamente con los detalles del libro -->
                <ul id="viewBookDetails"></ul>
            </div>
        </div>
    </div>

    <!-- Modal para Barra de Progreso (importación) -->
    <div id="progressModal" class="modal">
        <div class="modal-content">
            <!-- Título del modal que informa sobre el proceso de importación -->
            <h2 id="progressTitle">Importando Excel...</h2>
            <div class="progress-bar-container">
                <!-- Barra de progreso que muestra el avance de la importación -->
                <div id="progressBar" class="progress-bar">
                    <div id="progressFill" class="progress-fill"></div>
                </div>
                <!-- Texto que muestra el porcentaje completado de la importación -->
                <span id="progressText">0%</span>
            </div>
        </div>
    </div>

    <!-- Script principal que contiene la lógica para la gestión de libros, incluyendo operaciones CRUD,
         importación/exportación y manejo de modales -->
    <script src="js/gestion_libros.js"></script>

    <!-- Llamada a la función de inicialización para configurar la gestión de libros al cargar la página -->
    <script>
      inicializarGestionLibros();
    </script>

</body> 
</html>
