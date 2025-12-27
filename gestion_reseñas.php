<?php
// Incluir la configuración de la base de datos (parámetros de conexión, etc.)
include('config.php'); // Conexión a la base de datos

// Verificamos si la conexión a la base de datos fue exitosa
if (!$conn) {
    // Si la conexión falla, detenemos la ejecución y mostramos un mensaje de error
    die("Error en la conexión a la base de datos: " . mysqli_connect_error());
}

// Parámetros de paginación
$limit = 10; // Número de registros a mostrar por página
// Se obtiene la página actual a través del parámetro 'page' en la URL; si no existe, se usa 1
$page = isset($_GET['page']) ? intval($_GET['page']) : 1; 
if ($page < 1) $page = 1; // Aseguramos que la página mínima sea 1

// Calculamos el offset (desplazamiento) para la consulta SQL según la página actual
$offset = ($page - 1) * $limit;
if ($offset < 0) $offset = 0; // Nos aseguramos de que el offset no sea negativo

// Consulta para contar el total de reseñas en la base de datos
$total_query = "SELECT COUNT(*) as total FROM reseñas";
$total_result = mysqli_query($conn, $total_query);
$total_row = mysqli_fetch_assoc($total_result);
$total_records = $total_row['total'];
 
// Calcular el número total de páginas a partir del total de registros y el límite por página
$total_pages = ceil($total_records / $limit);

// Consulta para extraer las reseñas junto con información relacionada (usuario y libro) usando paginación
$query = "SELECT r.id, r.idUsuario, r.idLibro, r.Puntuacion, r.Reseña, r.FechaReseña, 
                 u.nombre AS Usuario, l.titulo AS Libro 
          FROM reseñas r
          JOIN usuarios u ON r.idUsuario = u.id
          JOIN libros l ON r.idLibro = l.id
          LIMIT $limit OFFSET $offset";
$result = mysqli_query($conn, $query);

// Si la consulta falla, detenemos la ejecución y mostramos el error
if (!$result) {
    die('Error en la consulta: ' . mysqli_error($conn));
}

// Si se detecta que la solicitud es AJAX, devolvemos los datos en formato JSON
if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
    $reseñas = [];
    // Recorrer cada registro y agregarlo a un array
    while ($row = mysqli_fetch_assoc($result)) {
        $reseñas[] = $row;
    }
    // Establecer el encabezado de respuesta a JSON y enviar los datos junto con información de paginación
    header('Content-Type: application/json');
    echo json_encode([
        'reseñas' => $reseñas,
        'total_pages' => $total_pages,
        'current_page' => $page
    ]);
    exit();
}
?>

<!DOCTYPE html>
<html lang="es"> 
<head>
    <meta charset="UTF-8">
    <!-- Configuración del viewport para asegurar una visualización responsiva -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Reseñas</title>
    <!-- Hoja de estilos personalizada para la gestión de reseñas -->
    <link rel="stylesheet" href="css/gestion_reseñas.css">
    <!-- Font Awesome para el uso de íconos -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!-- Se ha eliminado la carga de moment.js para optimizar el rendimiento -->
    <!-- SweetAlert2 para alertas y diálogos interactivos -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- pdfmake y sus fuentes virtuales para la generación de reportes en PDF -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.72/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.72/vfs_fonts.js"></script>
</head>
<body>

<!-- Contenedor principal de la interfaz de gestión de reseñas -->
<div class="container">
    <header>
        <h2>Gestión de reseñas</h2>
    </header>

    <!-- Barra superior con resumen de registros y opciones de ordenamiento -->
    <div class="top-bar">
        <div class="total-registros">
            <!-- Ícono representativo y total de registros -->
            <i class="fa-regular fa-star-half-stroke"></i>
            <span id="total_records">Total de registros: 
                <?php echo $total_records; ?>
            </span>
        </div>
        <div class="filtros">
            <!-- Selector para ordenar las reseñas (más recientes o más antiguas) -->
            <label for="ordenarReseñas"><i class="fa-solid fa-arrow-up-short-wide"></i> Ordenar reseñas por:</label>
<select id="ordenarReseñas" onchange="ordenarReseñas()">
    <option value="mas_reciente">Más reciente</option>
    <option value="mas_antiguo">Más antiguo</option>
</select>

        </div>
    </div>

    <!-- Campo de búsqueda para filtrar reseñas por nombre de usuario o título del libro -->
    <input type="text" id="searchBar" placeholder="Buscar por nombre o título del libro..." autocomplete="off"> 

    <!-- Acciones masivas para exportar, imprimir o eliminar registros -->
    <div class="acciones-masivas">
        <button id="download_pdf" class="btn-masiva down-lectura grow">
            <i class="fas fa-file-pdf"></i> Exportar PDF
        </button>
        <button id="print_pdf" class="btn-masiva print-lectura grow">
            <i class="fas fa-print"></i> Imprimir
        </button>
        <button id="delete_selected" class="btn-masiva eliminar-masivo grow">
            <i class="fas fa-trash-alt"></i> Eliminar
        </button>
    </div>

    <!-- Contenedor de la tabla que muestra las reseñas -->
    <div class="table-container">
        <table id="reseñas_table" class="reservas-table">
            <thead>
                <tr>
                    <!-- Checkbox para selección masiva de filas -->
                    <th><input type="checkbox" id="select_all"></th>
                    <th>#</th>
                    <th>Usuario</th>
                    <th>Libro</th>
                    <th>Puntuación</th>
                    <th>Reseña</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="reseñasList">
                <?php 
                // Verificamos si existen registros y los mostramos en la tabla
                if ($result && mysqli_num_rows($result) > 0) {
                    // Variable para numerar cada registro según el offset
                    $i = 1 + $offset;
                    // Iteramos sobre cada fila obtenida de la consulta
                    while ($row = mysqli_fetch_assoc($result)): ?>
                    <tr data-id="<?php echo $row['id']; ?>">
                        <td><input type="checkbox" class="select_row"></td>
                        <td><?php echo $i++; ?></td>
                        <td><?php echo $row['Usuario']; ?></td>
                        <td><?php echo $row['Libro']; ?></td>
                        <td><?php echo $row['Puntuacion']; ?></td>
                        <!-- Mostramos un fragmento de la reseña (primeros 50 caracteres) seguido de puntos suspensivos -->
                        <td><?php echo substr($row['Reseña'], 0, 50) . '...'; ?></td>
                        <td><?php echo $row['FechaReseña']; ?></td>
                        <td class="acciones">
                            <!-- Botón para ver la reseña completa con atributos de datos para facilitar su uso en JavaScript -->
                            <button class="btn ver-reseña grow"
                                    data-id="<?php echo $row['id']; ?>"
                                    data-numero="<?php echo $i; ?>"
                                    data-usuario="<?php echo $row['Usuario']; ?>"
                                    data-libro="<?php echo $row['Libro']; ?>"
                                    data-puntuacion="<?php echo $row['Puntuacion']; ?>"
                                    data-reseña="<?php echo htmlspecialchars($row['Reseña']); ?>"
                                    data-fecha="<?php echo $row['FechaReseña']; ?>">
                                <i class="fa-solid fa-eye"></i>Ver
                            </button>
                        </td>
                    </tr>
                    <?php endwhile; 
                } else {
                    // Si no se encuentran reseñas, mostramos un mensaje en la tabla
                    echo "<tr><td colspan='8'>No se encontraron reseñas.</td></tr>";
                }
                ?>
            </tbody>
        </table>
    </div>

    <!-- Sección de paginación con estilo "1 2 3 4 5 … 20" -->
    <div class="pagination">
        <?php 
        // Solo si existe al menos una página, generamos la paginación
        if ($total_pages >= 1):
            echo '<ul class="pagination-list">';

            // Flecha izquierda («) para ir a la página anterior
            if ($page > 1) {
                $prev = $page - 1;
                // Icono de flecha izquierda usando Font Awesome
                echo "<li><a class='pagination-link' data-page='{$prev}'><i class='fas fa-chevron-left'></i></a></li>";
            } else {
                echo "<li><a class='pagination-link disabled'><i class='fas fa-chevron-left'></i></a></li>";
            }

            // Si el total de páginas es 5 o menos, mostramos todas las páginas
            if ($total_pages <= 5) {
                for ($i = 1; $i <= $total_pages; $i++) {
                    $active = ($i == $page) ? 'active' : '';
                    echo "<li><a class='pagination-link {$active}' data-page='{$i}'>{$i}</a></li>";
                }
            } else {
                // Si hay más de 5 páginas, mostramos las primeras 5, un ellipsis y la última página
                for ($i = 1; $i <= 5; $i++) {
                    $active = ($i == $page) ? 'active' : '';
                    echo "<li><a class='pagination-link {$active}' data-page='{$i}'>{$i}</a></li>";
                }
                echo "<li>...</li>";
                $active = ($total_pages == $page) ? 'active' : '';
                echo "<li><a class='pagination-link {$active}' data-page='{$total_pages}'>{$total_pages}</a></li>";
            }

            // Flecha derecha (») para ir a la siguiente página
            if ($page < $total_pages) {
                $next = $page + 1;
                echo "<li><a class='pagination-link' data-page='{$next}'><i class='fas fa-chevron-right'></i></a></li>";
            } else {
                echo "<li><a class='pagination-link disabled'><i class='fas fa-chevron-right'></i></a></li>";
            }

            echo '</ul>';
        endif;
        ?>
    </div>

    <footer>
        © 2025 Biblioteca Virtual Escolar. Todos los derechos reservados.
    </footer>
</div>

<!-- Modal para mostrar la reseña completa -->
<div id="modalReseña" class="modal">
    <div class="modal-content">
        <!-- Botón para cerrar el modal, que llama a la función cerrarModalReseña() definida en JavaScript -->
        <span class="close" onclick="cerrarModalReseña()">&times;</span>
        <h3 class="modal-title">Reseña Completa</h3>
        
        <div class="modal-body">
            <!-- Sección con información de la reseña -->
            <div class="modal-info">
                <p><i class="fas fa-user"></i> <strong>Usuario:</strong> <span id="modalUsuario"></span></p>
                <p><i class="fas fa-book"></i> <strong>Libro:</strong> <span id="modalLibro"></span></p>
                <p><i class="fas fa-star"></i> <strong>Puntuación:</strong> <span id="modalPuntuacion"></span></p>
                <p><i class="fas fa-calendar-alt"></i> <strong>Fecha:</strong> <span id="modalFecha"></span></p>
            </div>
            <!-- Sección que muestra el contenido completo de la reseña -->
            <div class="modal-message">
                <p><i class="fas fa-comment-alt"></i> <strong>Reseña:</strong></p>
                <p id="modalReseñaTexto"></p>
            </div>
        </div>
    </div>
</div>

<!-- Cargar el script JavaScript que contiene la lógica para la gestión de reseñas -->
<script src="js/gestion_reseñas.js"></script>
</body>
</html>
