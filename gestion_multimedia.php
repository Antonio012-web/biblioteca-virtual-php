<!DOCTYPE html>
<html lang="es">
<!-- 
  Este documento HTML administra el contenido multimedia en la Biblioteca Virtual Escolar.
  Proporciona funcionalidades para agregar, editar, eliminar, exportar e importar registros multimedia,
  además de permitir la búsqueda, el filtrado, la ordenación y la paginación de los registros.
-->
<head>
    <!-- Define la codificación de caracteres para asegurar la correcta visualización de textos en español -->
    <meta charset="UTF-8">
    <!-- Título que se muestra en la pestaña del navegador -->
    <title>Administrar Contenido Multimedia</title>
    <!-- Hoja de estilos personalizada para la sección de multimedia -->
    <link rel="stylesheet" href="css/multimedia.css">
    <!-- Hoja de estilos de SweetAlert2 para dar formato a las alertas emergentes -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
    <!-- Font Awesome para el uso de íconos vectoriales en la interfaz -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!-- Se eliminó moment.js y moment-timezone; se usará getCurrentDateTime('America/Mexico_City') en su lugar -->
    <!--
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/locale/es.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.34/moment-timezone-with-data.min.js"></script>
    -->
    <!-- Librería XLSX para la importación y exportación de archivos Excel -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js"></script>
    <!-- pdfmake para la generación de documentos PDF -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.70/pdfmake.min.js"></script>
    <!-- Fuentes virtuales requeridas por pdfmake -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.70/vfs_fonts.js"></script>
    <!-- jQuery para facilitar la manipulación del DOM y las peticiones AJAX -->
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <!-- SweetAlert2 para mostrar mensajes interactivos y confirmaciones -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
    <!-- Contenedor principal que engloba toda la interfaz de administración multimedia -->
    <div class="container">
        <!-- Encabezado de la sección -->
        <header>
            <h2>Administrar contenido multimedia</h2> 
        </header> 

        <!-- Barra superior que muestra información resumida y opciones de ordenamiento -->
        <div class="top-bar">
            <!-- Sección que muestra el total de registros multimedia; el número se actualizará dinámicamente -->
            <div class="total-registros">
                <i class="fas fa-photo-video"></i> Total de registros: <span id="totalRegistros">0</span>
            </div>
            <!-- Sección de filtros para ordenar los registros -->
            <div class="filtros">
                <!-- Etiqueta con ícono que indica la función del selector de orden -->
                <label for="sortSelect"><i class="fa-solid fa-arrow-up-short-wide"></i> Ordenar por:</label>
                <!-- Menú desplegable para seleccionar el orden de los registros: "Más recientes" o "Más antiguos" -->
                <select id="sortSelect">
                    <option value="recent">Más recientes</option>
                    <option value="oldest">Más antiguos</option>
                </select>
            </div>
        </div>

        <!-- Barra de búsqueda que permite filtrar registros por título, tipo o nivel educativo -->
        <div class="search-bar">
            <input type="text" id="searchBar" placeholder="Buscar por título, tipo o nivel educativo...">
        </div>

        <!-- Sección de acciones masivas para operaciones en múltiples registros -->
        <div class="table-actions">
            <!-- Botón para abrir el modal y agregar un nuevo registro multimedia -->
            <button class="btn grow" id="addButton"><i class="fas fa-plus"></i> Agregar Multimedia</button>
            <!-- Botón para editar el registro multimedia seleccionado -->
            <button class="btn grow" id="editMultimediaButton"><i class="fas fa-edit"></i> Editar</button>
            <!-- Botón para exportar los registros a un archivo Excel -->
            <button class="btn grow" id="exportExcelButton"><i class="fas fa-file-excel"></i> Exportar a Excel</button>
            <!-- Botón para exportar los registros a un archivo PDF -->
            <button class="btn grow" id="exportPDFButton"><i class="fas fa-file-pdf"></i> Exportar a PDF</button>
            <!-- Botón para imprimir los registros multimedia -->
            <button class="btn grow" id="printButton"><i class="fas fa-print"></i> Imprimir</button>
            <!-- Botón para importar registros desde un archivo Excel -->
            <button class="btn grow" id="importExcelButton"><i class="fas fa-file-import"></i> Importar Excel</button>
            <!-- Input oculto para seleccionar el archivo Excel a importar -->
            <input type="file" id="importExcelInput" style="display:none" accept=".xlsx, .xls" />
            <!-- Botón para eliminar de forma masiva los registros seleccionados -->
            <button class="btn btn-delete-massive grow" id="deleteMassiveButton"><i class="fas fa-trash-alt"></i> Eliminar</button>
        </div>

        <!-- Contenedor de la tabla que muestra los registros multimedia -->
        <div class="table-container">
            <table class="reservas-table" id="multimediaTable">
                <thead>
                    <tr>
                        <!-- Checkbox para selección masiva de registros -->
                        <th><input type="checkbox" id="selectAll"></th>
                        <!-- Columna para el número de registro -->
                        <th>#</th>
                        <!-- Columna que muestra el título del contenido multimedia -->
                        <th>Título</th>
                        <!-- Columna que muestra la descripción del contenido -->
                        <th>Descripción</th>
                        <!-- Columna que indica el tipo de contenido (Video, Audiolibro, Pdf) -->
                        <th>Tipo</th>
                        <!-- Columna que muestra la URL del recurso -->
                        <th>URL</th>
                        <!-- Columna que indica el autor del contenido multimedia -->
                        <th>Autor</th>
                        <!-- Columna que muestra la fecha de publicación del contenido -->
                        <th>Fecha de Publicación</th>
                        <!-- Columna que muestra las etiquetas asociadas al contenido -->
                        <th>Etiquetas</th>
                        <!-- Columna que indica el nivel educativo relacionado -->
                        <th>Nivel Educativo</th>
                        <!-- Columna para acciones individuales (ver, editar, eliminar) -->
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- El contenido de la tabla se cargará dinámicamente mediante AJAX -->
                </tbody>
            </table>
        </div>

        <!-- Sección de paginación para navegar entre páginas de registros -->
        <div class="pagination">
            <!-- Los botones de paginación se inyectarán dinámicamente aquí -->
        </div>

        <!-- Pie de página con información de derechos de autor -->
        <footer>
            © 2025 Biblioteca Virtual Escolar. Todos los derechos reservados.
        </footer>
    </div>
 
    <!-- Modal para mostrar el progreso durante la importación de un archivo Excel -->
    <div id="progressModal" class="modal" style="display:none;">
      <div class="modal-content">
        <!-- Título del modal que indica el proceso de importación -->
        <h2 id="progressTitle">Importando Excel...</h2>
        <!-- Contenedor de la barra de progreso con estilos inline para centrar y dar formato -->
        <div class="progress-bar-container" style="margin:20px 0;text-align:center;">
          <!-- Barra de progreso que visualiza el avance de la importación -->
          <div id="progressBar" class="progress-bar" style="width:100%;height:20px;background-color:#ddd;overflow:hidden;border-radius:5px;display:inline-block;vertical-align:middle;">
            <!-- Indicador interno que se llena conforme avanza el proceso -->
            <div id="progressFill" class="progress-fill" style="height:100%;width:0%;transition:width 0.3s ease;background-color:#4caf50;border-radius:5px;"></div>
          </div>
          <!-- Texto que muestra el porcentaje completado de la importación -->
          <span id="progressText" style="display:inline-block;margin-left:8px;font-weight:bold;">0%</span>
        </div>
      </div>
    </div>
    <!-- Fin del modal de progreso -->

    <!-- Modal para agregar o editar registros multimedia; inicialmente oculto -->
    <div id="multimediaModal" class="modal" style="display: none;">
        <div class="modal-content">
            <!-- Botón para cerrar el modal -->
            <span class="close">&times;</span>
            <!-- Formulario para ingresar o editar la información del contenido multimedia -->
            <form id="multimediaForm">
                <!-- Título del modal que se adapta según la acción (Agregar o Editar) -->
                <h2 id="modalTitle">Agregar Contenido Multimedia</h2>
                <!-- Campo oculto para almacenar el ID del registro al editar -->
                <input type="hidden" id="id" name="id">
                <!-- Grupo de formulario para el título -->
                <div class="form-group"> 
                    <label for="titulo">Título:</label>
                    <input type="text" id="titulo" name="titulo" required placeholder="Ingrese un Título">
                </div>
                <!-- Grupo de formulario para la descripción -->
                <div class="form-group">
                    <label for="descripcion">Descripción:</label>
                    <textarea id="descripcion" name="descripcion" required placeholder="Ingrese una Descripción"></textarea>
                </div>
                <!-- Grupo de formulario para seleccionar el tipo de contenido multimedia -->
                <div class="form-group">
                    <label for="tipo">Tipo:</label>
                    <select id="tipo" name="tipo" required>
                        <option value="Video">Video</option>
                        <option value="Audiolibro">Audiolibro</option>
                        <option value="Pdf">Pdf</option>
                    </select>
                </div>
                <!-- Grupo de formulario para ingresar la URL del recurso -->
                <div class="form-group">
                    <label for="url">URL:</label>
                    <input type="text" id="url" name="url" required placeholder="Ingrese el URL. http://ejemplo.com">
                </div>
                <!-- Grupo de formulario para ingresar el autor del contenido -->
                <div class="form-group">
                    <label for="autor">Autor:</label>
                    <input type="text" id="autor" name="autor" required placeholder="Ingrese el Autor">
                </div>
                <!-- Grupo de formulario oculto para la fecha de publicación, que se establecerá automáticamente -->
                <div class="form-group" style="display:none;">
                    <input type="hidden" id="fecha_publicacion" name="fecha_publicacion" required>
                </div>
                <!-- Grupo de formulario para ingresar etiquetas relacionadas con el contenido -->
                <div class="form-group">
                    <label for="etiquetas">Etiquetas:</label>
                    <input type="text" id="etiquetas" name="etiquetas" placeholder="Ingrese etiquetas. Ejemplo: Música, Varios, Audio, etc.">
                </div>
                <!-- Grupo de formulario para seleccionar el nivel educativo asociado -->
                <div class="form-group">
                    <label for="nivel_educativo">Nivel Educativo:</label>
                    <select id="nivel_educativo" name="nivel_educativo" required>
                        <option value="Primero">Primero</option>
                        <option value="Segundo">Segundo</option>
                        <option value="Tercero">Tercero</option>
                        <option value="Cuarto">Cuarto</option>
                        <option value="Quinto">Quinto</option>
                        <option value="Sexto">Sexto</option>
                    </select>
                </div>
                <!-- Botón para enviar el formulario y guardar el registro -->
                <button type="submit" class="btn">Guardar</button>
            </form>
        </div>
    </div>

    <!-- Modal para ver los detalles de un registro multimedia; inicialmente oculto -->
    <div id="viewMultimediaModal" class="modal" style="display: none;">
        <div class="modal-content">
            <!-- Botón para cerrar el modal de detalles -->
            <span class="close view-close">&times;</span>
            <!-- Título centrado del modal que indica la visualización de detalles -->
            <h2 style="text-align: center;">Detalles Multimedia</h2>
            <!-- Contenedor que se llenará dinámicamente con los detalles del registro multimedia -->
            <div id="multimediaDetails" class="multimedia-details">
                <!-- Los detalles se inyectarán dinámicamente aquí -->
            </div>
        </div>
    </div>

    <!-- Inclusión del script principal con la lógica para gestionar el contenido multimedia:
         carga de datos, búsqueda, filtrado, paginación, importación/exportación, edición y eliminación -->
    <script src="js/multimedia.js"></script>
</body>
</html>
