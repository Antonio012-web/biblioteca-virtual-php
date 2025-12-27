<?php
// Incluir el archivo de configuración que contiene la conexión a la base de datos
include 'config.php';

// Definir el número de registros que se mostrarán en cada página
$registrosPorPagina = 10;

// Ejecutar una consulta para obtener el número total de reservas en la base de datos
$queryTotal = "SELECT COUNT(*) as total FROM reservas"; 
$resultTotal = $conn->query($queryTotal);
// Extraer el total de reservas desde el resultado de la consulta
$totalReservas = $resultTotal->fetch_assoc()['total'];

// Calcular el número total de páginas necesarias para mostrar todos los registros
$totalPaginas = ceil($totalReservas / $registrosPorPagina);

// Obtener la página actual desde el parámetro GET 'pagina'; si no se especifica, se asume la página 1
$paginaActual = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
// Validar que la página actual esté dentro del rango permitido (entre 1 y el total de páginas)
$paginaActual = max(1, min($totalPaginas, $paginaActual));

// Calcular el desplazamiento (offset) para la consulta SQL según la página actual
$offset = ($paginaActual - 1) * $registrosPorPagina;

// Obtener el filtro de ordenación desde la solicitud GET; si no se especifica, se utiliza 'recientes' por defecto
$orden = isset($_GET['orden']) ? $_GET['orden'] : 'recientes';

// Definir la cláusula ORDER BY según el filtro de ordenación seleccionado
$orderByClause = ($orden === 'recientes')
    ? 'ORDER BY r.fechaReserva DESC'
    : 'ORDER BY r.fechaReserva ASC';

// Consulta SQL para obtener las reservas, uniendo la tabla 'reservas' con 'libros' para obtener el título del libro
// Se aplica paginación y ordenación según lo especificado
$query = "SELECT r.id, r.nombre, r.fechaReserva, r.estado, l.titulo AS tituloLibro 
          FROM reservas r 
          JOIN libros l ON r.idLibro = l.id 
          $orderByClause
          LIMIT $registrosPorPagina OFFSET $offset";
// Ejecutar la consulta y almacenar el resultado
$result = $conn->query($query);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <!-- Definición de la codificación de caracteres -->
    <meta charset="UTF-8">
    <!-- Configuración del viewport para asegurar la responsividad -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Título de la página -->
    <title>Gestión de Reservas - Biblioteca Virtual</title>
    <!-- Hoja de estilos personalizada para la gestión de reservas -->
    <link rel="stylesheet" href="css/gestion_reservas.css">
    <!-- Hoja de estilos de SweetAlert2 para los mensajes emergentes -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
    <!-- Font Awesome para el uso de íconos en la interfaz -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!-- Se eliminó moment.js; se usará getCurrentDateTime('America/Mexico_City') en su lugar -->
    <!-- Librerías para la generación de PDF -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.70/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.70/vfs_fonts.js"></script>
    <!-- Librería XLSX para exportar/importar datos en Excel -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js"></script>
</head>
<body> 
    <!-- Contenedor principal de la interfaz -->
    <div class="container">
        <!-- Cabecera con título e ícono de información para mostrar instrucciones -->
        <header class="header-info">
            <h2>Gestión de reservas</h2>
            <i class="fas fa-info-circle info-icon" id="infoIcon" title="Ver instrucciones"></i>
        </header>
        <main>
            <!-- Barra superior que muestra el total de registros y opciones de ordenación -->
            <div class="top-bar">
                <div class="total-registros">
                    <!-- Ícono y total de registros obtenidos de la consulta -->
                    <span><i class="fas fa-list-alt"></i> Total de registros: <?= $totalReservas ?></span>
                </div>
                <div class="filtros">
                    <!-- Selector para elegir el orden en que se muestran las reservas -->
                    <label for="orden"><i class="fa-solid fa-arrow-up-short-wide"></i> Ordenar por:</label>
                    <select id="orden">
                        <option value="recientes" <?= $orden === 'recientes' ? 'selected' : '' ?>>Más recientes</option>
                        <option value="antiguos" <?= $orden === 'antiguos' ? 'selected' : '' ?>>Más antiguos</option>
                    </select>
                </div>
            </div>
            <!-- Campo de búsqueda para filtrar reservas por nombre o título del libro -->
            <input type="text" id="searchBar" placeholder="Buscar por nombre o título del libro...">
            <!-- Acciones masivas: exportar a PDF, imprimir y cambiar el estado o eliminar reservas -->
            <div class="acciones-masivas">
                <button id="exportPDFButton" class="btn export-btn grow"><i class="fas fa-file-pdf"></i> Exportar a PDF</button>
                <button id="printButton" class="btn print-btn grow"><i class="fas fa-print"></i> Imprimir</button>
                <button id="confirmarMasivo" class="btn-masiva estado-confirmada grow"><i class="fas fa-check"></i> Confirmar</button>
                <button id="pendienteMasivo" class="btn-masiva estado-pendiente grow"><i class="fas fa-clock"></i> Pendiente</button>
                <button id="cancelarMasivo" class="btn-masiva estado-cancelada grow"><i class="fas fa-times"></i> Cancelar</button>
                <button id="eliminarMasivo" class="btn-masiva eliminar-masivo grow"><i class="fas fa-trash-alt"></i> Eliminar</button>
            </div>
            <!-- Tabla que muestra las reservas con columnas para selección, datos y acciones -->
            <table class="reservas-table">
                <thead>
                    <tr>
                        <th><input type="checkbox" id="selectAll"></th>
                        <th>#</th>
                        <th>Nombre</th>
                        <th>Libro</th>
                        <th>Fecha de Reserva</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="reservasBody">
                <?php
                // Si se encontraron reservas, iterar y mostrarlas en la tabla
                if ($result->num_rows > 0) {
                    // Inicializar contador para numerar las filas, iniciando en función del offset
                    $numeroRegistro = $offset + 1;
                    while ($fila = $result->fetch_assoc()) {
                        echo '<tr data-id="' . $fila["id"] . '">';
                        // Checkbox para seleccionar individualmente la reserva
                        echo '<td><input type="checkbox" class="select-row" value="' . $fila["id"] . '"></td>';
                        // Número consecutivo del registro
                        echo '<td>' . $numeroRegistro++ . '</td>';
                        // Mostrar el nombre del usuario que realizó la reserva
                        echo '<td class="truncate-text">' . $fila["nombre"] . '</td>';
                        // Mostrar el título del libro reservado
                        echo '<td class="truncate-text">' . $fila["tituloLibro"] . '</td>';
                        // Mostrar la fecha de reserva (solo la fecha, sin la hora)
                        echo '<td>' . substr($fila["fechaReserva"], 0, 10) . '</td>';
                        // Mostrar el estado de la reserva (ej. Confirmada, Pendiente, Cancelada)
                        echo '<td>' . $fila["estado"] . '</td>';
                        // Columna de acciones con un botón para ver detalles de la reserva
                        echo '<td class="acciones-columna">';
                        echo '<button class="btn ver grow" data-id="' . $fila["id"] . '" data-nombre="' . htmlspecialchars($fila["nombre"]) . '" data-titulo="' . htmlspecialchars($fila["tituloLibro"]) . '" data-fecha="' . $fila["fechaReserva"] . '" data-estado="' . $fila["estado"] . '"><i class="fas fa-eye"></i> Ver</button>';
                        echo '</td>';
                        echo '</tr>';
                    }
                } else {
                    // Si no se encontraron reservas, mostrar un mensaje en la tabla
                    echo '<tr class="no-registros"><td colspan="7">No se encontraron reservas.</td></tr>';
                }
                ?>
                </tbody>
            </table>
            <!-- Sección de paginación con estilo “1 2 3 4 5 … 20” -->
            <div class="pagination">
            <?php
            if ($totalPaginas >= 1):
                echo '<ul class="pagination-list">';
    
                // Botón « para ir a la página anterior
                if ($paginaActual > 1) {
                    $prevPage = $paginaActual - 1;
                    // Usar ícono de flecha izquierda de Font Awesome
                    echo '<li><a class="page-link" data-page="' . $prevPage . '" data-orden="' . $orden . '"><i class="fas fa-chevron-left"></i></a></li>';
                } else {
                    // Si no hay página anterior, mostrar el ícono deshabilitado
                    echo '<li><a class="page-link disabled"><i class="fas fa-chevron-left"></i></a></li>';
                }
    
                // Si el total de páginas es 5 o menos, se muestran todas las páginas
                if ($totalPaginas <= 5) {
                    for ($i = 1; $i <= $totalPaginas; $i++) {
                        $activeClass = ($i == $paginaActual) ? 'active' : '';
                        echo '<li><a class="page-link ' . $activeClass . '" data-page="' . $i . '" data-orden="' . $orden . '">' . $i . '</a></li>';
                    }
                } else {
                    // Si hay más de 5 páginas, mostrar las primeras 5, un ellipsis y la última página
                    for ($i = 1; $i <= 5; $i++) {
                        $activeClass = ($i == $paginaActual) ? 'active' : '';
                        echo '<li><a class="page-link ' . $activeClass . '" data-page="' . $i . '" data-orden="' . $orden . '">' . $i . '</a></li>';
                    }
                    echo '<li>...</li>';
                    $activeClass = ($totalPaginas == $paginaActual) ? 'active' : '';
                    echo '<li><a class="page-link ' . $activeClass . '" data-page="' . $totalPaginas . '" data-orden="' . $orden . '">' . $totalPaginas . '</a></li>';
                }
    
                // Botón » para ir a la página siguiente
                if ($paginaActual < $totalPaginas) {
                    $nextPage = $paginaActual + 1;
                    echo '<li><a class="page-link" data-page="' . $nextPage . '" data-orden="' . $orden . '"><i class="fas fa-chevron-right"></i></a></li>';
                } else {
                    echo '<li><a class="page-link disabled"><i class="fas fa-chevron-right"></i></a></li>';
                }
                echo '</ul>';
            endif;
            ?>
            </div>
        </main>
        <footer>
            <p>&copy; 2025 Biblioteca Virtual Escolar. Todos los derechos reservados.</p>
        </footer>
    </div>
    
    <!-- Incluir SweetAlert2 para alertas y confirmaciones -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js"></script>
    <!-- Incluir el script principal que contiene la lógica para la gestión de reservas -->
    <script src="js/gestion_reservas.js"></script>
</body>
</html>
