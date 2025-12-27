<!DOCTYPE html>
<html lang="es">
<!-- 
  Documento HTML para la gestión de accesos en la Biblioteca Virtual Escolar.
  Este archivo define la estructura y elementos para visualizar, filtrar y gestionar
  los registros de acceso de los usuarios, permitiendo además acciones masivas como
  exportar a PDF, imprimir y eliminar registros.
-->
<head>
  <!-- Definición de la codificación de caracteres para soportar el español -->
  <meta charset="UTF-8" />
  <!-- Configuración del viewport para que el diseño sea responsivo en distintos dispositivos -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <!-- Título que se muestra en la pestaña del navegador -->
  <title>Gestión de Accesos</title>
  
  <!-- Hoja de estilos principal que contiene las reglas CSS para este módulo -->
  <link rel="stylesheet" href="css/gestion_acceso.css" />
  
  <!-- Importación de Font Awesome para el uso de iconos en la interfaz -->
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
  />

  <!-- Importación de SweetAlert2 para mostrar alertas y mensajes interactivos -->
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <!-- Se elimina Moment.js para optimizar el rendimiento; el script está comentado -->
  <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/locale/es.min.js"></script> -->

  <!-- Importación de pdfmake y sus fuentes virtuales para exportar e imprimir documentos en formato PDF -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.72/pdfmake.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.72/vfs_fonts.js"></script>
</head>
<body>
  <!-- Contenedor principal de toda la aplicación -->
  <div class="container">
    <header>
      <!-- Encabezado principal que indica el propósito de la página -->
      <h2>Gestión de accesos</h2>
    </header>

    <!-- Barra superior que agrupa el resumen de registros, filtros y la barra de búsqueda -->
    <div class="top-bar">
      <!-- Sección que muestra el total de registros o accesos -->
      <div class="total-registros">
        <!-- Icono representativo de identificación -->
        <i class="fa-regular fa-id-card"></i>
        <!-- Texto que indica el total de registros, donde el número se actualizará dinámicamente -->
        <span id="total_records">
          Total registros: <span id="totalAccesos"></span>
        </span>
      </div>

      <!-- Sección de filtros para ordenar los registros -->
      <div class="filtros">
        <!-- Etiqueta con ícono que describe el propósito del filtro de ordenamiento -->
        <label for="filter">
        <i class="fa-solid fa-arrow-up-short-wide"></i>  Ordenar por:
        </label>
        <!-- Menú desplegable que permite seleccionar entre registros "Más recientes" o "Más antiguos" -->
        <select id="filter">
          <option value="reciente">Más recientes</option>
          <option value="antiguo">Más antiguos</option>
        </select>
      </div>

      <!-- Barra de búsqueda centrada que permite filtrar registros por nombre de usuario -->
      <div class="barra-busqueda">
        <!-- Campo de texto para ingresar el criterio de búsqueda, sin autocompletar para mayor control -->
        <input
          type="text"
          id="searchBar"
          placeholder="Buscar por nombre..."
          autocomplete="off"
        />
      </div>
    </div>

    <!-- Sección de acciones masivas que permite realizar operaciones sobre múltiples registros -->
    <div class="acciones-masivas">
      <!-- Botón para exportar la tabla de accesos a un archivo PDF -->
      <button id="download_pdf" class="btn-masiva down-lectura grow">
        <i class="fas fa-file-pdf"></i> Exportar PDF
      </button>
      <!-- Botón para imprimir la información directamente desde la interfaz -->
      <button id="print_pdf" class="btn-masiva print-lectura grow">
        <i class="fas fa-print"></i> Imprimir
      </button>
      <!-- Botón para eliminar de forma masiva los registros seleccionados -->
      <button id="delete_selected" class="btn-masiva eliminar-masivo grow">
        <i class="fas fa-trash-alt"></i> Eliminar
      </button>
    </div>

    <!-- Contenedor de la tabla que muestra todos los registros de acceso -->
    <div class="table-container">
      <table id="accesos_table" class="accesos-table">
        <thead>
          <!-- Encabezado de la tabla que define las columnas de información -->
          <tr>
            <!-- Columna con un checkbox para seleccionar todos los registros -->
            <th><input type="checkbox" id="select_all" /></th>
            <!-- Columna para el número o índice del registro -->
            <th>#</th>
            <!-- Columna que muestra el nombre del usuario -->
            <th>Usuario</th>
            <!-- Columna que muestra la fecha y hora del acceso -->
            <th>Fecha y Hora</th>
            <!-- Columna que indica la cantidad de intentos fallidos de acceso -->
            <th>Intentos Fallidos</th>
            <!-- Columna que indica si el usuario se encuentra bloqueado -->
            <th>Bloqueado</th>
            <!-- Columna que muestra el tiempo de bloqueo aplicado -->
            <th>Tiempo de Bloqueo</th> 
            <!-- Columna para las acciones individuales (ver detalles, eliminar, etc.) -->
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="accesosList">
          <!-- Se cargan dinámicamente los registros de acceso mediante AJAX -->
        </tbody>
      </table>

      <!-- Pie de página dentro del contenedor de la tabla que muestra la información de derechos de autor -->
      <footer>
        © 2025 Biblioteca Virtual Escolar. Todos los derechos reservados.
      </footer>
    </div>

    <!-- Sección para la paginación, que permite navegar entre diferentes páginas de registros -->
    <div class="pagination">
      <!-- Aquí se generarán dinámicamente los controles de paginación según la cantidad de registros -->
    </div>
  </div>

  <!-- Modal para mostrar los detalles completos de un acceso cuando se selecciona un registro -->
  <div id="modalAcceso" class="modal">
    <div class="modal-content">
      <!-- Botón para cerrar el modal; llama a la función cerrarModalAcceso() -->
      <span class="close" onclick="cerrarModalAcceso()">&times;</span>
      <!-- Título del modal que informa sobre el contenido mostrado -->
      <h3 class="modal-title">Detalles del Acceso</h3>
      <div class="modal-body">
        <!-- Sección que organiza la información detallada del acceso -->
        <div class="modal-info">
          <!-- Detalle del usuario que realizó el acceso -->
          <p>
            <i class="fas fa-user"></i>
            <strong>Usuario:</strong> <span id="modalUsuario"></span>
          </p>
          <!-- Detalle de la fecha y hora en que se realizó el acceso -->
          <p>
            <i class="fas fa-calendar-alt"></i>
            <strong>Fecha y Hora:</strong> <span id="modalFecha"></span>
          </p>
          <!-- Detalle del número de intentos fallidos en el acceso -->
          <p>
            <i class="fas fa-times-circle"></i>
            <strong>Intentos Fallidos:</strong> <span id="modalIntentos"></span>
          </p>
          <!-- Indicación de si el acceso fue bloqueado -->
          <p>
            <i class="fas fa-lock"></i>
            <strong>Bloqueado:</strong> <span id="modalBloqueado"></span>
          </p>
          <!-- Detalle del tiempo que duró el bloqueo del usuario -->
          <p>
            <i class="fas fa-hourglass-half"></i>
            <strong>Tiempo de Bloqueo:</strong>
            <span id="modalTiempoBloqueo"></span>
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Inclusión del archivo JavaScript principal que contiene la lógica de interacción:
       carga de datos, manejo de eventos, control de la paginación y gestión del modal -->
  <script src="js/gestion_acceso.js"></script>
</body>
</html>
