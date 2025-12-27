<!DOCTYPE html>
<html lang="es">
<!-- 
  Documento HTML para la gestión de lecturas en la Biblioteca Virtual Escolar.
  Este archivo permite administrar los registros de lecturas de los usuarios, 
  ofreciendo funcionalidades como búsqueda, ordenamiento, paginación, exportación a PDF, 
  impresión y eliminación de registros.
-->
<head>
    <!-- Define la codificación de caracteres para garantizar la correcta visualización de acentos y caracteres especiales -->
    <meta charset="UTF-8">
    <!-- Configura el viewport para que la página sea responsiva y se adapte a dispositivos móviles -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Título que se muestra en la pestaña del navegador -->
    <title>Gestionar Lecturas</title>
    <!-- Vinculación a la hoja de estilos específica para la gestión de lecturas -->
    <link rel="stylesheet" href="css/gestion_lectura.css">
    <!-- Vinculación a la hoja de estilos de SweetAlert2 para estilizar las alertas emergentes -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
    <!-- Vinculación a Font Awesome para el uso de íconos en la interfaz -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!-- Se ha eliminado la librería Moment.js; en su lugar se usará la función getCurrentDateTime('America/Mexico_City') -->
    <!-- Inclusión de pdfmake para la generación de documentos PDF -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.72/pdfmake.min.js"></script>
    <!-- Inclusión de las fuentes virtuales requeridas por pdfmake -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.72/vfs_fonts.js"></script>
</head>
<body> 
    <!-- Contenedor principal que envuelve todo el contenido de la página -->
    <div class="container"> 
        <!-- Encabezado principal con el título de la sección -->
        <header>
            <h2>Gestionar lecturas</h2>
        </header>
        <!-- Barra superior que agrupa la información de registros y los filtros de ordenamiento -->
        <div class="top-bar">
            <!-- Muestra el total de registros de lecturas; el número se actualizará dinámicamente -->
            <div class="total-registros">  
                <i class="fas fa-book-reader"></i>
                <span id="total_records">Total de registros: 0</span>
            </div>
            <!-- Filtros para ordenar los registros de lecturas -->
            <div class="filtros">
                <!-- Etiqueta con ícono que describe el selector de orden -->
                <label for="filter"><i class="fa-solid fa-arrow-up-short-wide"></i> Ordenar por:</label>
                <!-- Menú desplegable para elegir el criterio de ordenamiento: por mayor o menor tiempo de lectura -->
                <select id="filter">
                    <option value="most_time">Más tiempo de lectura</option>
                    <option value="least_time">Menos tiempo de lectura</option>
                </select>
            </div>
        </div>
        <!-- Campo de búsqueda que permite filtrar registros por nombre del usuario o título del libro -->
        <input type="text" id="searchBar" placeholder="Buscar por nombre o título del libro...">
        <!-- Sección de acciones masivas que permite realizar operaciones sobre múltiples registros simultáneamente -->
        <div class="acciones-masivas">
            <!-- Botón para exportar los registros de lecturas a un archivo PDF -->
            <button id="download_pdf" class="btn-masiva down-lectura grow">
                <i class="fas fa-file-pdf"></i> Exportar PDF
            </button>
            <!-- Botón para imprimir los registros de lecturas -->
            <button id="print_pdf" class="btn-masiva print-lectura grow">
                <i class="fas fa-print"></i> Imprimir
            </button>
            <!-- Botón para eliminar los registros seleccionados de forma masiva -->
            <button id="delete_selected" class="btn-masiva eliminar-masivo grow">
                <i class="fas fa-trash-alt"></i> Eliminar
            </button>
        </div>
        <!-- Contenedor de la tabla donde se mostrarán los registros de lecturas -->
        <div class="table-container">
            <table id="lectura_table" class="reservas-table">
                <thead>
                    <tr>
                        <!-- Columna con checkbox para selección masiva de registros -->
                        <th><input type="checkbox" id="select_all"></th>
                        <!-- Columna para el número o índice del registro -->
                        <th>#</th>
                        <!-- Columna que muestra el nombre del usuario -->
                        <th>Nombre</th>
                        <!-- Columna que muestra el título del libro leído -->
                        <th>Libro</th>
                        <!-- Columna que muestra la fecha en que se realizó la lectura -->
                        <th>Fecha</th>
                        <!-- Columna que indica el tiempo invertido en la lectura, en minutos -->
                        <th>Tiempo de Lectura (min)</th>
                        <!-- Columna para las acciones individuales (como ver, editar o eliminar el registro) -->
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Aquí se llenarán dinámicamente los registros de lecturas a través de JavaScript -->
                </tbody>
            </table>
        </div>

        <!-- Sección de paginación para navegar entre las diferentes páginas de registros -->
        <div class="pagination" id="pagination">
            <!-- Se inyectará dinámicamente la paginación con estilo de números o círculos (ej.: “1 2 3 4 5 … 20”) -->
        </div>

        <!-- Pie de página con información de derechos de autor y marca institucional -->
        <footer>
            © 2025 Biblioteca Virtual Escolar. Todos los derechos reservados.
        </footer>
    </div>
    <!-- Inclusión del archivo JavaScript que contiene la lógica para gestionar las lecturas:
         carga de datos, búsqueda, filtrado, paginación, exportación a PDF, impresión y eliminación -->
    <script src="js/gestion_lectura.js"></script>
    <!-- Inclusión de SweetAlert2 para mostrar alertas interactivas (se vuelve a cargar para asegurar funcionalidad en este contexto) -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</body>
</html>
