<!DOCTYPE html>
<html lang="es">
<!-- 
  Este documento HTML presenta la interfaz para mostrar estadísticas de lecturas.
  Se estructura en secciones para visualizar datos clave, aplicar filtros y generar reportes.
-->
<head>
    <!-- Definición de la codificación de caracteres para soportar el idioma español -->
    <meta charset="UTF-8">
    <!-- Configuración para que la página sea responsiva en dispositivos móviles -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Título de la página que aparece en la pestaña del navegador -->
    <title>Estadísticas de lecturas</title>
    <!-- Vinculación a la hoja de estilos personalizada para el diseño de la página -->
    <link rel="stylesheet" href="css/estadisticas.css">
    <!-- Inclusión de Font Awesome para utilizar íconos vectoriales -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!-- Inclusión de Chart.js para la representación gráfica de datos -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- Inclusión de pdfmake para la generación de documentos PDF directamente en el navegador -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.72/pdfmake.min.js"></script>
    <!-- Inclusión de las fuentes virtuales requeridas por pdfmake -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.72/vfs_fonts.js"></script>
    <!-- Inclusión de SweetAlert2 para mostrar mensajes y alertas personalizadas al usuario -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
    <!-- Contenedor principal que agrupa todo el contenido de la aplicación -->
    <div class="container">
        <!-- Encabezado principal donde se indica el propósito de la página -->
        <header>
            <h2>Estadísticas de lecturas</h2>
        </header>
        <!-- Sección que contiene las tarjetas de resumen con las estadísticas clave -->
        <div class="cards">
            <!-- Tarjeta que muestra el total de usuarios -->
            <div class="card total-users"> 
                <div class="card-content">
                    <!-- Ícono representativo para usuarios -->
                    <i class="fas fa-users"></i>
                    <!-- Título descriptivo de la estadística -->
                    <h3>Total usuarios</h3>
                    <!-- Valor inicial, el cual será actualizado dinámicamente -->
                    <p id="total-users">0</p>
                </div>
            </div>
            <!-- Tarjeta que muestra el total de libros -->
            <div class="card total-books">
                <div class="card-content">
                    <!-- Ícono representativo para libros -->
                    <i class="fas fa-book"></i>
                    <!-- Título descriptivo -->
                    <h3>Total libros</h3>
                    <!-- Valor inicial del total de libros -->
                    <p id="total-books">0</p>
                </div>
            </div>
            <!-- Tarjeta que muestra el total de tiempo invertido en lecturas -->
            <div class="card total-reading-time">
                <div class="card-content">
                    <!-- Ícono de reloj para representar el tiempo -->
                    <i class="fas fa-clock"></i>
                    <!-- Título descriptivo -->
                    <h3>Total tiempo de lectura</h3>
                    <!-- Valor inicial del tiempo en minutos -->
                    <p id="total-reading-time">0 min</p>
                </div>
            </div>
            <!-- Tarjeta para mostrar la cantidad de libros más leídos -->
            <div class="card most-read-books">
                <div class="card-content">
                    <!-- Ícono que simboliza la lectura frecuente -->
                    <i class="fas fa-book-reader"></i>
                    <!-- Título descriptivo -->
                    <h3>Libros más leídos</h3> 
                    <!-- Valor inicial, se actualizará según los datos obtenidos -->
                    <p id="most-read-books">0</p>
                </div> 
            </div>
            <!-- Tarjeta para mostrar la cantidad de libros menos leídos -->
            <div class="card least-read-books">
                <div class="card-content">
                    <!-- Ícono que representa libros con baja frecuencia de lectura -->
                    <i class="fas fa-book-dead"></i>
                    <!-- Título descriptivo -->
                    <h3>Libros menos leídos</h3>
                    <!-- Valor inicial que se mostrará cuando no existan datos o no se aplique el filtro -->
                    <p id="least-read-books">N/A</p>
                </div> 
            </div>
        </div>
        <!-- Sección de filtros para personalizar la consulta de estadísticas -->
        <div class="filters">
            <!-- Filtro para seleccionar el tipo de estadísticas -->
            <div class="filter-item">
                <!-- Etiqueta que incluye un ícono y una descripción -->
                <label for="type"><i class="fas fa-chart-pie"></i> Tipo de estadísticas:</label>
                <!-- Menú desplegable para elegir entre estadísticas generales, por usuario o por libros -->
                <select id="type">
                    <option value="general">General</option>
                    <option value="user">Por usuario</option>
                    <option value="books">Libros</option>
                </select>
            </div>
            <!-- Filtro que aparece dinámicamente si se selecciona el tipo 'Por usuario' -->
            <div class="filter-item" id="user-filter" style="display: none;">
                <!-- Etiqueta con ícono para identificar la selección de usuario -->
                <label for="user"><i class="fas fa-user"></i></label>
                <!-- Menú desplegable que se llenará con la lista de usuarios disponibles -->
                <select id="user">
                    <!-- Los usuarios se cargarán dinámicamente mediante JavaScript -->
                </select>
            </div>
            <!-- Filtro para seleccionar el periodo de tiempo a analizar -->
            <div class="filter-item">
                <label for="timeframe"><i class="fas fa-calendar-alt"></i> Periodo de tiempo:</label>
                <!-- Menú desplegable para elegir entre día, semana, mes o año -->
                <select id="timeframe">
                    <option value="day">Día</option>
                    <option value="week">Semana</option>
                    <option value="month">Mes</option>
                    <option value="year">Año</option>
                </select>
            </div>
            <!-- Filtro de fecha personalizado, se muestra solo si se necesita una fecha específica -->
            <div class="filter-item" id="custom-date" style="display: none;">
                <!-- Etiqueta para indicar el selector de fecha -->
                <label for="start-date">Fecha:</label>
                <!-- Selector de fecha para elegir un día específico -->
                <input type="date" id="start-date">
                <!-- Este input opcional para la fecha fin se encuentra comentado, se puede descomentar si se requiere un rango de fechas -->
                <!-- <label for="end-date">Fecha fin:</label>
                <input type="date" id="end-date"> -->
            </div>
            <!-- Grupo de botones para activar la generación de estadísticas y reportes -->
            <div class="filter-item button-group">
                <!-- Botón para generar estadísticas basado en los filtros seleccionados -->
                <button id="generate" class="btn grow">
                    <i class="fa-solid fa-chart-column"></i> Generar estadísticas
                </button>
                <!-- Botón para generar un reporte en PDF; inicialmente deshabilitado hasta que se generen estadísticas -->
                <button id="printButton" class="btn grow" disabled>
                    <i class="fa-solid fa-file-export"></i> Generar reporte
                </button>
            </div>
        </div>
        <!-- Sección principal de visualización de estadísticas -->
        <div class="stats">
            <!-- Área izquierda que contiene el canvas para el gráfico -->
            <div class="stats-left">
                <!-- Elemento canvas donde Chart.js dibujará el gráfico interactivo -->
                <canvas id="chart"></canvas>
            </div>
            <!-- Área derecha para mostrar información adicional, como las lecturas por usuario -->
            <div class="stats-right">
                <!-- Contenedor que se actualizará dinámicamente con detalles de lecturas del usuario -->
                <div id="user-books">
                    <!-- Aquí se mostrarán las lecturas específicas según el usuario seleccionado -->
                </div>
            </div>
        </div>
        <!-- Pie de página con la información de derechos de autor y marca de la institución -->
        <footer>
            © 2025 Biblioteca Virtual Escolar. Todos los derechos reservados.
        </footer>
    </div>
    
    <!-- Inclusión del archivo JavaScript que maneja la lógica de la aplicación:
         carga de datos, generación de gráficos y reportes, y manejo de interacciones con el usuario -->
    <script src="js/estadisticas.js"></script> 
</body>
</html>
