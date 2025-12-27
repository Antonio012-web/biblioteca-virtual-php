<!DOCTYPE html>
<html lang="es">
<!-- 
  Este documento HTML gestiona la información de los profesores (docentes) en la Biblioteca Virtual Escolar.
  Permite visualizar, buscar, ordenar y realizar acciones (editar, resetear, exportar, imprimir) sobre los registros de docentes.
-->
<head>
    <!-- Define la codificación de caracteres para asegurar la correcta visualización de textos en español -->
    <meta charset="UTF-8"> 
    <!-- Título que se muestra en la pestaña del navegador -->
    <title>Gestión de Profesores</title>
    <!-- Configuración del viewport para asegurar una visualización responsiva en dispositivos móviles -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Hoja de estilos personalizada para la gestión de profesores -->
    <link rel="stylesheet" href="css/gestion_profesores.css">
    
    <!-- Inclusión de jQuery (necesario para el funcionamiento de scripts) -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    
    <!-- Librerías para importación/exportación de datos (Excel y PDF) -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.70/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.70/vfs_fonts.js"></script>
    
    <!-- SweetAlert2 para mostrar alertas interactivas y confirmaciones -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    
    <!-- Font Awesome para el uso de íconos en la interfaz -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    <!-- Contenedor principal que agrupa todos los elementos de la interfaz -->
    <div class="container">
        <header>
            <!-- Encabezado principal de la sección de gestión docente -->
            <h2>Gestión docentes</h2> 
        </header>

        <!-- Barra superior que muestra el total de registros y opciones para ordenar la lista -->
        <div class="top-bar">
            <!-- Muestra el total de registros de profesores, con un ícono representativo -->
            <div class="total-registros" id="recordCount">
                <i class="fa-solid fa-chalkboard-user"></i>
                <span id="totalRecords">0</span>
            </div>
            <!-- Sección de filtros para ordenar los registros por fecha (recientes o antiguos) -->
            <div class="filtros">
                <i class="fa-solid fa-arrow-up-short-wide"></i> 
                <label for="sortOrder">Ordenar por:</label>
                <select id="sortOrder">
                    <option value="recientes">Recientes</option>
                    <option value="antiguos">Antiguos</option>
                </select>
            </div>
        </div>

        <!-- Barra de búsqueda para filtrar profesores por nombre, salón o días de trabajo -->
        <div class="search-bar">
            <input type="text" id="searchInput" placeholder="Buscar por nombre, salón o días de trabajo...">
        </div>

        <!-- Acciones disponibles para modificar o exportar la información de los profesores -->
        <div class="table-actions">
            <!-- Botón para editar la información del profesor seleccionado -->
            <button id="editProfesorButton" class="btn grow">
                <i class="fas fa-edit"></i> Editar
            </button>
            <!-- Botón para resetear la información del profesor (acción de reinicio) -->
            <button id="resetProfesorButton" class="btn grow">
                <i class="fas fa-redo"></i> Resetear
            </button>
            <!-- Botón para exportar la información a un archivo PDF -->
            <button id="exportPDFButton" class="btn grow">
                <i class="fas fa-file-pdf"></i> Exportar a PDF
            </button> 
            <!-- Botón para imprimir la información de los profesores -->
            <button id="printButton" class="btn grow">
                <i class="fas fa-print"></i> Imprimir
            </button>
        </div>

        <!-- Contenedor de la tabla que muestra la lista de profesores -->
        <div class="table-container">
            <table class="reservas-table">
                <thead>
                    <tr>
                        <!-- Checkbox para seleccionar todos los registros -->
                        <th><input type="checkbox" id="selectAll"></th>
                        <!-- Columna para el número de registro -->
                        <th>#</th>
                        <!-- Columnas para la información personal y laboral de cada profesor -->
                        <th>Nombre</th>
                        <th>Apellido Paterno</th>
                        <th>Apellido Materno</th>
                        <th>Salón</th>
                        <th>Horario de Trabajo</th>
                        <th>Días de Trabajo</th>
                        <!-- Columna para las acciones individuales sobre cada registro -->
                        <th>Acciones</th>
                    </tr>
                </thead>
                <!-- Cuerpo de la tabla, se llenará dinámicamente con datos de profesores -->
                <tbody id="profesoresTable">
                    <!-- Se llena dinámicamente -->
                </tbody>
            </table>
        </div>

        <!-- Contenedor para la paginación, donde se generarán los controles para navegar entre páginas -->
        <div class="pagination-container">
            <!-- Aquí inyectaremos la paginación dinámica -->
        </div>

        <!-- Pie de página con información de derechos de autor -->
        <footer>
            &copy; 2025 Biblioteca Virtual Escolar. Todos los derechos reservados.
        </footer>
    </div>

    <!-- Modal para Editar la información de un profesor -->
    <div id="profesorModal" class="modal">
        <div class="modal-content">
            <!-- Botón para cerrar el modal -->
            <span class="close">&times;</span>
            <!-- Título del modal que indica la acción actual (editar) -->
            <h2 class="modalTitle">Editar Profesor</h2>
            <!-- Muestra el nombre del profesor que se está editando -->
            <p id="nombreEdit"></p>
            <!-- Formulario para editar los datos del profesor -->
            <form id="profesorForm" autocomplete="off">
                <!-- Campo oculto para almacenar el ID del profesor a editar -->
                <input type="hidden" id="profesorId" name="id">
                <!-- Campo para seleccionar el salón asignado al profesor -->
                <div class="form-group">
                    <label for="salon">Salón:</label>
                    <select id="salon" name="salon" required>
                        <option value="1°A">1°A</option>
                        <option value="1°B">1°B</option>
                        <option value="2°A">2°A</option>
                        <option value="2°B">2°B</option>
                        <option value="3°A">3°A</option>
                        <option value="3°B">3°B</option>
                        <option value="4°A">4°A</option>
                        <option value="4°B">4°B</option>
                        <option value="5°A">5°A</option>
                        <option value="5°B">5°B</option>
                        <option value="5°C">5°C</option>
                        <option value="6°A">6°A</option>
                        <option value="6°B">6°B</option>
                    </select>
                </div>

                <!-- Fila para seleccionar los horarios de entrada y salida con menús desplegables personalizados -->
                <div class="form-row">
                    <!-- Campo para el horario de entrada -->
                    <div class="form-group half">
                        <label for="horarioEntrada">Horario de Entrada:</label>
                        <div class="custom-dropdown" id="dropdownEntrada">
                            <div class="dropdown-selected">09:00</div>
                            <div class="dropdown-list">
                                <div class="dropdown-item" data-value="09:00">09:00</div>
                                <div class="dropdown-item" data-value="09:15">09:15</div>
                                <div class="dropdown-item" data-value="09:30">09:30</div>
                                <div class="dropdown-item" data-value="09:45">09:45</div>
                                <div class="dropdown-item" data-value="10:00">10:00</div>
                                <div class="dropdown-item" data-value="10:15">10:15</div>
                                <div class="dropdown-item" data-value="10:30">10:30</div>
                                <div class="dropdown-item" data-value="10:45">10:45</div>
                                <div class="dropdown-item" data-value="11:00">11:00</div>
                                <div class="dropdown-item" data-value="11:15">11:15</div>
                                <div class="dropdown-item" data-value="11:30">11:30</div>
                                <div class="dropdown-item" data-value="11:45">11:45</div>
                                <div class="dropdown-item" data-value="12:00">12:00</div>
                                <div class="dropdown-item" data-value="12:15">12:15</div>
                                <div class="dropdown-item" data-value="12:30">12:30</div>
                                <div class="dropdown-item" data-value="12:45">12:45</div>
                                <div class="dropdown-item" data-value="13:00">13:00</div>
                                <div class="dropdown-item" data-value="13:15">13:15</div>
                                <div class="dropdown-item" data-value="13:30">13:30</div>
                                <div class="dropdown-item" data-value="13:45">13:45</div>
                            </div>
                        </div>
                        <!-- Campo oculto que almacena el valor seleccionado para el horario de entrada -->
                        <input type="hidden" id="horarioEntrada" name="horarioEntrada" value="09:00">
                    </div>
                    <!-- Campo para el horario de salida -->
                    <div class="form-group half">
                        <label for="horarioSalida">Horario de Salida:</label>
                        <div class="custom-dropdown" id="dropdownSalida">
                            <div class="dropdown-selected">14:00</div>
                            <div class="dropdown-list">
                                <div class="dropdown-item" data-value="09:15">09:15</div>
                                <div class="dropdown-item" data-value="09:30">09:30</div>
                                <div class="dropdown-item" data-value="09:45">09:45</div>
                                <div class="dropdown-item" data-value="10:00">10:00</div>
                                <div class="dropdown-item" data-value="10:15">10:15</div>
                                <div class="dropdown-item" data-value="10:30">10:30</div>
                                <div class="dropdown-item" data-value="10:45">10:45</div>
                                <div class="dropdown-item" data-value="11:00">11:00</div>
                                <div class="dropdown-item" data-value="11:15">11:15</div>
                                <div class="dropdown-item" data-value="11:30">11:30</div>
                                <div class="dropdown-item" data-value="11:45">11:45</div>
                                <div class="dropdown-item" data-value="12:00">12:00</div>
                                <div class="dropdown-item" data-value="12:15">12:15</div>
                                <div class="dropdown-item" data-value="12:30">12:30</div>
                                <div class="dropdown-item" data-value="12:45">12:45</div>
                                <div class="dropdown-item" data-value="13:00">13:00</div>
                                <div class="dropdown-item" data-value="13:15">13:15</div>
                                <div class="dropdown-item" data-value="13:30">13:30</div>
                                <div class="dropdown-item" data-value="13:45">13:45</div>
                                <div class="dropdown-item" data-value="14:00">14:00</div>
                            </div>
                        </div>
                        <!-- Campo oculto que almacena el valor seleccionado para el horario de salida -->
                        <input type="hidden" id="horarioSalida" name="horarioSalida" value="14:00">
                    </div>
                </div>

                <!-- Campo para seleccionar los días de trabajo (permite selección múltiple) -->
                <div class="form-group">
                    <label for="diasTrabajo">Día de Trabajo:</label>
                    <select id="diasTrabajo" name="diasTrabajo[]" multiple required>
                        <option value="Lunes">Lunes</option>
                        <option value="Martes">Martes</option>
                        <option value="Miércoles">Miércoles</option>
                        <option value="Jueves">Jueves</option>
                        <option value="Viernes">Viernes</option>
                    </select>
                </div>
                <!-- Contenedor para el botón de envío del formulario -->
                <div class="button-container">
                    <button type="submit">Guardar</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal para ver los detalles del profesor (solo para visualización) -->
    <div id="verProfesorModal" class="modal">
        <div class="modal-content">
            <!-- Botón para cerrar el modal de detalles -->
            <span class="close-ver-modal">&times;</span>
            <!-- Título del modal -->
            <h2 class="modal-title">Detalles del Profesor</h2>
            <!-- Sección que muestra los detalles completos del profesor con íconos representativos -->
            <div class="ver-detalles">
                <p><i class="fas fa-id-badge"></i> <strong>Nombre:</strong> <span id="verNombreCompleto"></span></p>
                <p><i class="fas fa-chalkboard-teacher"></i> <strong>Salón:</strong> <span id="verSalon"></span></p>
                <p><i class="fas fa-clock"></i> <strong>Horario de Entrada:</strong> <span id="verEntrada"></span></p>
                <p><i class="fas fa-clock"></i> <strong>Horario de Salida:</strong> <span id="verSalida"></span></p>
                <p><i class="fas fa-calendar-alt"></i> <strong>Día de Trabajo:</strong> <span id="verDias"></span></p>
            </div>
        </div>
    </div>

    <!-- Inclusión del script principal que contiene la lógica para la gestión de profesores -->
    <script src="js/gestion_profesores.js"></script>
    <!-- Inicialización de la gestión de profesores al cargar la página -->
    <script>
        initializeGestionProfesores();
    </script>
</body>
</html>
