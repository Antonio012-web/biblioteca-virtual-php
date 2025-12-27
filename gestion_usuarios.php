<!DOCTYPE html>
<html lang="es">
<!-- 
  Este documento HTML está diseñado para la administración de usuarios en la Biblioteca Virtual Escolar.
  Permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre los usuarios, así como importar y exportar información,
  cambiar contraseñas, y visualizar detalles de cada usuario.
  La interfaz incluye un sistema de búsqueda, ordenación, selección múltiple y paginación para facilitar la gestión.
-->
<head>
    <!-- Se define la codificación de caracteres para asegurar el correcto manejo de acentos y caracteres especiales en español -->
    <meta charset="UTF-8">
    <!-- Título que aparecerá en la pestaña del navegador -->
    <title>Administrar Usuarios</title>
    <!-- Enlace a la hoja de estilos que contiene las reglas de diseño y presentación específicas para la gestión de usuarios -->
    <link rel="stylesheet" href="css/gestion_usuarios.css">

    <!-- Inclusión de SweetAlert2 para mostrar mensajes, alertas y confirmaciones de manera interactiva -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- Inclusión de la librería XLSX para la importación y exportación de archivos Excel; permite procesar datos tabulares -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js"></script>
    <!-- Inclusión de pdfmake y sus fuentes virtuales para la generación de documentos PDF desde la aplicación -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.70/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.70/vfs_fonts.js"></script>
    <!-- Inclusión de Font Awesome para utilizar íconos vectoriales que enriquecen la interfaz de usuario -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

    <!-- Configuración del viewport para que la página se adapte correctamente a diferentes tamaños de pantalla (responsive design) -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>  
    <!-- Contenedor principal de la aplicación, que agrupa todos los elementos de la interfaz -->
    <div class="container">
        <!-- Sección de cabecera con el título principal de la página -->
        <header>
            <!-- Título principal de la interfaz, que indica la función de administrar usuarios -->
            <h2>Administrar usuarios</h2>
        </header>
        
        <!-- Barra superior que muestra información resumida y opciones para ordenar la lista de usuarios -->
        <div class="top-bar">
            <!-- Sección que muestra el total de registros (usuarios) con un ícono representativo -->
            <div class="total-registros" id="recordCount">
                <i class="fas fa-users"></i>
                <!-- El span con id "totalRecords" se actualizará dinámicamente para reflejar el número total de usuarios -->
                <span id="totalRecords">0</span>
            </div>
            <!-- Sección de filtros para ordenar la lista de usuarios según criterios como "recientes" o "antiguos" -->
            <div class="filtros">
                <!-- Ícono para dar un toque visual al selector de ordenación -->
                <i class="fa-solid fa-arrow-up-short-wide"></i> 
                <!-- Etiqueta descriptiva para el selector -->
                <label for="sortOrder">Ordenar por:</label>
                <!-- Menú desplegable que permite seleccionar el criterio de ordenación -->
                <select id="sortOrder">
                    <!-- Opción para mostrar los usuarios que se han agregado más recientemente -->
                    <option value="recientes">Recientes</option>
                    <!-- Opción para mostrar los usuarios en orden cronológico inverso (los más antiguos primero) -->
                    <option value="antiguos">Antiguos</option>
                </select>
            </div>
        </div>
        
        <!-- Barra de búsqueda para filtrar usuarios. El usuario puede escribir términos de búsqueda para encontrar coincidencias en nombre, apellido, correo o tipo de usuario -->
        <div class="search-bar">
            <input type="text" id="searchInput" placeholder="Buscar por nombre, apllido, correo o tipo..." autocomplete="off">
        </div>
        
        <!-- Conjunto de botones de acciones masivas. Permite realizar operaciones sobre múltiples usuarios simultáneamente -->
        <div class="table-actions">
            <!-- Botón para abrir el formulario modal y agregar un nuevo usuario -->
            <button id="addUserButton" class="btn grow">
                <i class="fas fa-plus"></i> Agregar Usuario
            </button>
            <!-- Botón para editar la información del usuario seleccionado -->
            <button id="editUserButton" class="btn grow">
               <i class="fas fa-edit"></i> Editar
            </button>
            <!-- Botón para cambiar la contraseña del usuario seleccionado -->
            <button id="changePasswordButton" class="btn grow">
               <i class="fas fa-key"></i> Cambiar Contraseña
            </button>
            <!-- Botón para exportar la lista de usuarios a un archivo Excel -->
            <button id="exportExcelButton" class="btn grow">
                <i class="fas fa-file-excel"></i> Exportar a Excel
            </button>
            <!-- Botón para exportar la lista de usuarios a un archivo PDF -->
            <button id="exportPDFButton" class="btn grow">
                <i class="fas fa-file-pdf"></i> Exportar a PDF
            </button>
            <!-- Botón para imprimir la lista de usuarios -->
            <button id="printButton" class="btn grow">
                <i class="fas fa-print"></i> Imprimir
            </button>
            <!-- Botón para importar usuarios desde un archivo Excel -->
            <button id="importExcelButton" class="btn grow">
                <i class="fas fa-file-import"></i> Importar Excel
            </button>
            <!-- Input de tipo file oculto que se activará al pulsar el botón de importar -->
            <input type="file" id="importExcelInput" style="display:none" accept=".xlsx, .xls">
            <!-- Botón para eliminar de forma masiva los usuarios seleccionados -->
            <button id="deleteSelectedButton" class="btn btn-delete-massive grow">
                <i class="fas fa-trash-alt"></i> Eliminar 
            </button>
        </div>
        
        <!-- Contenedor de la tabla que muestra los datos de los usuarios -->
        <div class="table-container">
            <table class="reservas-table">
                <thead>
                    <tr>
                        <!-- Checkbox para selección masiva de filas; permite seleccionar todos los usuarios -->
                        <th><input type="checkbox" id="selectAll"></th>
                        <!-- Columna para el número de registro, que ayuda a identificar la posición del usuario en la lista -->
                        <th>#</th>
                        <!-- Columna para el nombre del usuario -->
                        <th>Nombre</th>
                        <!-- Columna para el apellido paterno -->
                        <th>Apellido Paterno</th>
                        <!-- Columna para el apellido materno -->
                        <th>Apellido Materno</th>
                        <!-- Columna para la dirección física del usuario -->
                        <th>Dirección</th>
                        <!-- Columna para el correo electrónico, que es un dato clave para la comunicación -->
                        <th>Correo</th>
                        <!-- Columna para el número de teléfono del usuario -->
                        <th>Teléfono</th>
                        <!-- Columna que indica el tipo de usuario (por ejemplo: estudiante, profesor, administrador) -->
                        <th>Tipo</th>
                        <!-- Columna para las acciones disponibles para cada usuario (como ver detalles, editar, etc.) -->
                        <th>Acciones</th>
                    </tr>
                </thead>
                <!-- El cuerpo de la tabla se llenará dinámicamente con los datos de los usuarios -->
                <tbody id="usersTable">
                    <!-- Aquí se llenarán los datos mediante peticiones AJAX o JavaScript -->
                </tbody>
            </table>
        </div>
        
        <!-- Contenedor destinado a la paginación, que permitirá navegar entre las páginas de resultados -->
        <div class="pagination-container">
            <!-- La paginación se generará e inyectará dinámicamente a través de JavaScript -->
        </div>
        
        <!-- Pie de página con información de derechos de autor y créditos institucionales -->
        <footer>
            &copy; 2025 Biblioteca Virtual Escolar. Todos los derechos reservados.
        </footer>
    </div>

    <!-- Modal para mostrar el progreso de la importación de archivos Excel.
         Este modal se muestra mientras se realiza el proceso de importación, dando retroalimentación visual al usuario -->
    <div id="progressModal" class="modal" style="display: none;">
      <div class="modal-content">
        <!-- Título del modal que informa sobre la acción en curso -->
        <h2 id="progressTitle">Importando Excel...</h2>
        <!-- Contenedor que incluye la barra de progreso y el porcentaje completado -->
        <div class="progress-bar-container">
          <div id="progressBar" class="progress-bar">
            <!-- Indicador interno que se rellena conforme avanza la importación -->
            <div id="progressFill" class="progress-fill"></div>
          </div>
          <!-- Texto que muestra el porcentaje de progreso -->
          <span id="progressText">0%</span>
        </div>
      </div>
    </div>
    
    <!-- Modal para agregar o editar un usuario.
         Este modal contiene un formulario con todos los campos necesarios para crear o actualizar la información del usuario -->
    <div id="userModal" class="modal">
        <div class="modal-content">
            <!-- Botón para cerrar el modal -->
            <span class="close">&times;</span>
            <!-- Título del modal que cambiará según la acción (Agregar o Editar) -->
            <h2 id="modalTitle">Agregar Usuario</h2>
            <!-- Formulario para ingresar los datos del usuario; el atributo autocomplete="off" previene autocompletados no deseados -->
            <form id="userForm" autocomplete="off">
                <!-- Campo oculto para almacenar el ID del usuario en caso de edición; no se muestra en el formulario -->
                <input type="hidden" id="userId" name="id">
                <!-- Grupo de formulario para el nombre; se requiere completar este campo -->
                <div class="form-group">
                    <label for="nombre">Nombre:</label>
                    <input type="text" id="nombre" name="nombre" required autocomplete="off" placeholder="Ingrese el Nombre de usuario">
                </div>
                <!-- Grupo de formulario para el apellido paterno -->
                <div class="form-group">
                    <label for="apPaterno">Apellido Paterno:</label>
                    <input type="text" id="apPaterno" name="apPaterno" required autocomplete="new-apPaterno" placeholder="Ingrese el Apallido Paterno">
                </div>
                <!-- Grupo de formulario para el apellido materno -->
                <div class="form-group">
                    <label for="apMaterno">Apellido Materno:</label>
                    <input type="text" id="apMaterno" name="apMaterno" required autocomplete="new-apMaterno" placeholder="Ingrese el Apallido Materno">
                </div>
                <!-- Grupo de formulario para la dirección, usando un textarea para permitir múltiples líneas -->
                <div class="form-group">
                    <label for="direccion">Dirección:</label>
                    <textarea id="direccion" name="direccion" required placeholder="Ingrese la Dirección"></textarea>
                </div>
                <!-- Grupo de formulario para el correo electrónico, utilizando el tipo "email" para validación automática -->
                <div class="form-group">
                    <label for="correo">Correo:</label>
                    <input type="email" id="correo" name="correo" required placeholder="Ingrese el Correo Elctrónico">
                </div>
                <!-- Grupo de formulario para el número de teléfono, utilizando el tipo "tel" -->
                <div class="form-group">
                    <label for="numTelefono">Teléfono:</label>
                    <input type="tel" id="numTelefono" name="numTelefono" required placeholder="Ingrese el Número de Teléfono a 10 dígitos">
                </div>
                <!-- Grupo de formulario para seleccionar el tipo de usuario mediante un menú desplegable -->
                <div class="form-group">
                    <label for="tipoUsuario">Tipo de Usuario:</label>
                    <select id="tipoUsuario" name="tipoUsuario" required>
                        <!-- Opciones disponibles: Estudiante, Profesor y Administrador -->
                        <option value="estudiante">Estudiante</option>
                        <option value="profesor">Profesor</option>
                        <option value="administrador">Administrador</option>
                    </select>
                </div>
                <!-- Grupo de formulario para la contraseña.
                     Este campo es obligatorio solo al crear un nuevo usuario, y puede ocultarse al editar -->
                <div class="form-group" id="passwordContainer">
                    <label for="password">Contraseña:</label>
                    <input type="password" id="password" name="password" required placeholder="Ingrese la contraseña de almenos 6 caracteres">
                </div>
                <!-- Contenedor para el botón de envío del formulario -->
                <div class="button-container">
                    <button type="submit">Guardar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal para cambiar la contraseña de un usuario.
         Este modal contiene un formulario simple para ingresar la nueva contraseña -->
    <div id="passwordModal" class="modal">
        <div class="modal-content">
            <!-- Botón para cerrar el modal -->
            <span class="close">&times;</span>
            <h2>Cambiar Contraseña</h2>
            <!-- Formulario para ingresar la nueva contraseña; incluye un campo oculto para el ID del usuario -->
            <form id="passwordForm">
                <input type="hidden" id="userIdPassword" name="id">
                <div class="form-group">
                    <label for="newPassword">Nueva Contraseña:</label>
                    <input type="password" id="newPassword" name="newPassword" required autocomplete="new-password">
                </div>
                <div class="button-container">
                    <button type="submit">Guardar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal para mostrar información detallada de un usuario.
         Se utiliza para mostrar los datos completos en una lista, con íconos que representan cada campo -->
    <div id="infoModal" class="modal">
      <div class="modal-content">
        <!-- Botón para cerrar el modal de información -->
        <span class="close">&times;</span>
        <h2>Información del Usuario <i class="fas fa-user-circle"></i></h2>
        <div class="modal-body">
          <ul>
            <!-- Cada elemento de la lista muestra un campo del usuario -->
            <li><i class="fas fa-user"></i> <strong>Nombre:</strong> <span id="infoNombre"></span></li>
            <li><i class="fas fa-user"></i> <strong>Apellido Paterno:</strong> <span id="infoApPaterno"></span></li>
            <li><i class="fas fa-user"></i> <strong>Apellido Materno:</strong> <span id="infoApMaterno"></span></li>
            <li><i class="fas fa-map-marker-alt"></i> <strong>Dirección:</strong> <span id="infoDireccion"></span></li>
            <li><i class="fas fa-envelope"></i> <strong>Correo:</strong> <span id="infoCorreo"></span></li>
            <li><i class="fas fa-phone-alt"></i> <strong>Teléfono:</strong> <span id="infoNumTelefono"></span></li>
            <li><i class="fas fa-user-tag"></i> <strong>Tipo:</strong> <span id="infoTipoUsuario"></span></li>
            <li><i class="fas fa-calendar-alt"></i> <strong>Fecha y Hora de Registro:</strong> <span id="infoFechaRegistro"></span></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Inclusión del script principal que contiene la lógica de la interfaz de gestión de usuarios -->
    <script src="js/gestion_usuarios.js"></script>

    <!-- Llamada a la función de inicialización para configurar la interfaz de usuarios al cargar la página -->
    <script>
      inicializarGestionUsuarios();
    </script>
</body>
</html>
