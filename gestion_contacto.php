<?php
// Incluir la configuración de la base de datos (config.php contiene las credenciales y ajustes)
include 'config.php';

// Definir el número de registros que se mostrarán por página
$registros_por_pagina = 10;
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8"> <!-- Define la codificación de caracteres -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> <!-- Hace el sitio responsive -->
    <title>Gestión de Mensajes de Contacto</title>
    <!-- Enlaza la hoja de estilos específica para la gestión de contacto -->
    <link rel="stylesheet" href="css/gestion_contacto.css">
    <!-- Incluir Font Awesome desde un CDN para usar íconos -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <!-- Incluir SweetAlert desde un CDN para mostrar alertas estilizadas -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- Incluir jQuery (dos fuentes, asegurando compatibilidad o redundancia) -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <!-- Incluir pdfMake para la generación de documentos PDF -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.70/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.70/vfs_fonts.js"></script>
</head>
<body>
    <div class="container">
        <header>
            <!-- Título principal de la sección de gestión de mensajes -->
            <h2>Gestión de mensajes de contacto</h2>
        </header>

        <!-- Barra superior: muestra el total de registros a la izquierda y filtros a la derecha -->
        <div class="top-bar">
            <div class="total-registros">
                <!-- Ícono representativo y espacio para mostrar el total de registros (se actualizará dinámicamente) -->
                <i class="fa-brands fa-rocketchat"></i> Total registros: <span id="totalRegistros"></span>
            </div>
            <div class="filtros">
                <!-- Etiqueta e ícono para el filtro de ordenamiento -->
                <label for="ordenarPor"><i class="fa-solid fa-arrow-up-short-wide"></i> Ordenar por:</label>
                <!-- Menú desplegable para seleccionar el criterio de ordenación; llama a la función ordenarTabla() al cambiar -->
             <select id="ordenarPor" onchange="ordenarTabla()">
               <option value="mas_reciente">Más reciente</option>
               <option value="mas_antiguo">Más antiguo</option>
             </select>
            </div>
        </div>
 
        <!-- Campo de búsqueda para filtrar mensajes -->
        <input type="text" id="searchBar" placeholder="Buscar mensajes...">

        <!-- Sección de botones para acciones masivas (exportar PDF, imprimir, eliminar) -->
        <div class="acciones-masivas botones-derecha">
            <button id="download_pdf" class="btn-masiva down-lectura grow">
                <i class="fas fa-file-pdf"></i> Exportar PDF
            </button>
            <button id="print_pdf" class="btn-masiva print-lectura grow">
                <i class="fas fa-print"></i> Imprimir
            </button>
            <button class="btn-masiva eliminar-masivo grow" onclick="eliminarSeleccionados()">
                <i class="fas fa-trash-alt"></i> Eliminar
            </button>
        </div>

        <!-- Tabla que mostrará los mensajes de contacto -->
        <table class="reservas-table">
            <thead>
                <tr>
                    <!-- Columna para selección masiva con checkbox -->
                    <th><input type="checkbox" id="selectAll" onclick="seleccionarTodos()"></th>
                    <th>#</th> <!-- Columna para número consecutivo -->
                    <th>Nombre de Contacto</th>
                    <th>Correo</th>
                    <th>Mensaje</th>
                    <th>Fecha</th>
                    <th>Acciones</th> <!-- Columna para botones de acción individual -->
                </tr>
            </thead>
            <tbody id="contactTableBody">
                <!-- Aquí se inyectará dinámicamente el contenido mediante AJAX -->
            </tbody>
        </table>

        <!-- Sección de paginación (los controles se generarán dinámicamente con estilo de círculos) -->
        <div class="pagination">
            <!-- Controles de paginación se insertarán aquí -->
        </div>
        <footer>
            <!-- Pie de página con derechos de autor -->
            © 2025 Biblioteca Virtual Escolar. Todos los derechos reservados.
        </footer>
    </div>

    <!-- Modal para mostrar los detalles completos de un mensaje de contacto -->
    <div id="modalMensaje" class="modal">
        <div class="modal-content">
            <!-- Botón para cerrar el modal, llama a la función cerrarModal() -->
            <span class="close" onclick="cerrarModal()">&times;</span>
            <!-- Título del modal -->
            <h3 class="modal-title">Detalles del Mensaje</h3>
            
            <div class="modal-body">
                <!-- Sección con información básica del mensaje -->
                <div class="modal-info">
                    <p><i class="fas fa-user"></i> <strong>Nombre:</strong> <span id="modalNombre"></span></p>
                    <p><i class="fas fa-envelope"></i> <strong>Correo:</strong> <span id="modalCorreo"></span></p>
                    <p><i class="fas fa-calendar-alt"></i> <strong>Fecha-Hora:</strong> <span id="modalFecha"></span></p>
                </div>
                <!-- Sección para mostrar el mensaje completo con opción de expandir -->
                <div class="modal-message">
                    <p><i class="fas fa-comment-alt"></i> <strong>Mensaje:</strong></p>
                    <p id="modalMensajeTexto"></p>
                    <!-- Botón "Leer más" que se mostrará si el mensaje está truncado -->
                    <button id="expandirMensaje" style="display: none;" onclick="expandirMensaje()">Leer más</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Se incluye el archivo JavaScript con la lógica para gestionar los mensajes -->
    <script src="js/gestion_contacto.js"></script>
</body>
</html>
