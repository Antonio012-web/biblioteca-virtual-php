<?php 
session_start(); // Inicia la sesión al comienzo, necesaria para gestionar variables de sesión y token CSRF
include 'config.php'; // Incluye archivo de configuración de la base de datos (credenciales y conexión)

// Generar token CSRF si no existe
if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    // random_bytes(32) genera 32 bytes aleatorios, que luego se convierten en una cadena hexadecimal.
    // Esto previene ataques CSRF al verificar que el formulario sea enviado desde la propia sesión.
}

// Paginación
$registros_por_pagina = 10; // Número de resultados a mostrar por página
$pagina_actual = isset($_GET['page']) ? (int)$_GET['page'] : 1; 
// Toma el valor de 'page' de la URL, si no existe, se asume página 1
$inicio = ($pagina_actual - 1) * $registros_por_pagina; 
// Calcula el índice inicial para la consulta (usado en LIMIT)

// Recibir parámetros de búsqueda y filtros
$searchTerm           = $_GET['search']           ?? '';
$filterAutor          = $_GET['autor']            ?? '';
$filterGrado          = $_GET['grado']            ?? '';
$orderTitle           = $_GET['order']            ?? '';
$filterDisponibilidad = $_GET['disponibilidad']   ?? '';
$filterAgregados      = $_GET['agregados']        ?? '';
$filterCategoria      = $_GET['categoria']        ?? '';
// La sintaxis ?? '' devuelve cadena vacía si no existe la clave en $_GET.

// Construir consulta principal
$query = "SELECT id, titulo, autor, grado, categoria, añoPublicacion, descripcion, disponibilidad, urlDescarga, imagen_libro FROM libros";
$conditions = [];    // Arreglo para ir acumulando condiciones WHERE
$params = [];        // Valores que se enlazarán a la consulta preparada
$param_types = '';   // Tipos de datos para bind_param (s = string, i = int, etc.)

// Condición de búsqueda (título, autor o categoría)
if ($searchTerm) {
    $conditions[] = "(titulo LIKE ? OR autor LIKE ? OR categoria LIKE ?)";
    $searchParam = '%' . $searchTerm . '%';
    $params[] = $searchParam;
    $params[] = $searchParam;
    $params[] = $searchParam;
    $param_types .= 'sss'; // Tres strings
}

// Filtro por autor
if ($filterAutor !== '') {
    $conditions[] = "autor = ?";
    $params[] = $filterAutor;
    $param_types .= 's';
}

// Filtro por grado
if ($filterGrado !== '') {
    $conditions[] = "grado = ?";
    $params[] = $filterGrado;
    $param_types .= 's';
}

// Filtro por disponibilidad
if ($filterDisponibilidad !== '') {
    $conditions[] = "disponibilidad = ?";
    $params[] = $filterDisponibilidad;
    $param_types .= 's';
}

// Filtro por categoría
if ($filterCategoria !== '') {
    $conditions[] = "categoria = ?";
    $params[] = $filterCategoria;
    $param_types .= 's';
}

// Filtro por agregados (nuevos o antiguos): solo afecta el orden (ORDER BY), no se añade al WHERE
if ($filterAgregados !== '') {
    if ($filterAgregados === 'nuevos') {
        $orderByAgregados = "añoPublicacion DESC";
    } elseif ($filterAgregados === 'antiguos') {
        $orderByAgregados = "añoPublicacion ASC";
    }
}

// Construimos la sentencia WHERE si hay condiciones
if (count($conditions) > 0) {
    $query .= " WHERE " . implode(" AND ", $conditions);
    // implode() une cada elemento del array con el operador AND
}

// Ordenar: si se filtra por agregados, ordena por la fecha de publicación.
// De lo contrario, ordena por título según sea ascendente o descendente.
if ($filterAgregados !== '') {
    $query .= " ORDER BY " . $orderByAgregados;
} elseif ($orderTitle !== '') {
    if ($orderTitle === 'asc') {
        $query .= " ORDER BY titulo ASC";
    } elseif ($orderTitle === 'desc') {
        $query .= " ORDER BY titulo DESC";
    }
}

// Se añade el LIMIT para la paginación
$query .= " LIMIT ?, ?";
$params[] = $inicio;
$params[] = $registros_por_pagina;
$param_types .= 'ii'; // Tipos de datos para los límites (enteros)

// Preparar y ejecutar la consulta principal
$stmt = $conn->prepare($query);
$stmt->bind_param($param_types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

// Consulta para obtener el total de registros (sin condicionar por agregados, 
// porque "agregados" solo define orden, no cantidad real de libros)
$total_query = "SELECT COUNT(*) as total FROM libros";
$total_conditions = [];
$total_params = [];
$total_param_types = '';

// Se repite la lógica de los filtros para contar cuántos registros coinciden
if ($searchTerm) {
    $total_conditions[] = "(titulo LIKE ? OR autor LIKE ? OR categoria LIKE ?)";
    $searchParam = '%' . $searchTerm . '%';
    $total_params[] = $searchParam;
    $total_params[] = $searchParam;
    $total_params[] = $searchParam;
    $total_param_types .= 'sss';
}
if ($filterAutor !== '') {
    $total_conditions[] = "autor = ?";
    $total_params[] = $filterAutor;
    $total_param_types .= 's';
}
if ($filterGrado !== '') {
    $total_conditions[] = "grado = ?";
    $total_params[] = $filterGrado;
    $total_param_types .= 's';
}
if ($filterDisponibilidad !== '') {
    $total_conditions[] = "disponibilidad = ?";
    $total_params[] = $filterDisponibilidad;
    $total_param_types .= 's';
}
if ($filterCategoria !== '') {
    $total_conditions[] = "categoria = ?";
    $total_params[] = $filterCategoria;
    $total_param_types .= 's';
}

if (count($total_conditions) > 0) {
    $total_query .= " WHERE " . implode(" AND ", $total_conditions);
}

$stmt_total = $conn->prepare($total_query);
if (count($total_params) > 0) {
    $stmt_total->bind_param($total_param_types, ...$total_params);
}
$stmt_total->execute();
$total_result = $stmt_total->get_result();

// Número total de registros y páginas
$total_registros = $total_result->fetch_assoc()['total'];
$total_paginas = ceil($total_registros / $registros_por_pagina);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <!-- Define la codificación de caracteres como UTF-8 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- Hace que la página se ajuste al ancho de pantalla del dispositivo -->
    <title>Catálogo de Libros - Biblioteca Virtual</title>
    <!-- Título que aparece en la pestaña del navegador -->
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/catalogo.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
    <!-- SweetAlert2: para mostrar alertas más llamativas -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <!-- FontAwesome: colección de íconos -->
</head>
<body>
    <div class="container">
        <nav>
            <!-- Sección de navegación (menú principal) -->
            <div class="logo">
                <img src="img/logoP.png" alt="Logo de la Escuela">
                <!-- El atributo alt describe la imagen si esta no puede mostrarse -->
                <h1>Escuela Primaria Manuel Del Mazo Villasante</h1>
                <!-- Nombre de la escuela -->
            </div>
            <div class="nav-links">
                <!-- Links de navegación que llevan a diferentes secciones del sitio -->
                <a href="index.php"><i class="fa-solid fa-house"></i> Inicio</a>
                <a class="nav-link active" href="catalogo.php"><i class="fa-solid fa-book"></i> Catálogo</a>
                <a href="contenido.php"><i class="fa-solid fa-photo-film"></i> Multimedia</a>
                <a href="contacto.php"><i class="fa-solid fa-message"></i> Contacto</a>
                <a href="inicio_sesion.php" class="login"><i class="fa-solid fa-right-to-bracket"></i> Inicio de sesión</a>
            </div>
        </nav>

        <main>
            <!-- Contenido principal de la página -->
            <h2>Catálogo de Libros</h2>

            <!-- Sección de Buscador y Filtros -->
            <div class="search-filters">
                <!-- Barra de búsqueda -->
                <input type="text" id="searchBar" placeholder="Buscar por título, categoría o autor..." value="<?php echo htmlspecialchars($searchTerm); ?>">
                <!-- htmlspecialchars previene inyección de HTML -->

                <!-- Filtros estructurados (autor, grado, título, disponibilidad, etc.) -->
                <div class="filters">
                    <div class="filter-item">
                        <i class="fa-solid fa-user"></i>
                        <label for="filterAutor">Filtrar por Autor</label>
                        <select id="filterAutor" name="autor">
                            <option value="">Todos</option>
                            <?php
                            // Consulta para obtener todos los autores distintos en la base
                            $authorsResult = $conn->query("SELECT DISTINCT autor FROM libros");
                            while ($row = $authorsResult->fetch_assoc()) {
                                $selected = ($filterAutor == $row['autor']) ? 'selected' : '';
                                echo '<option value="' . $row['autor'] . '" ' . $selected . '>' . $row['autor'] . '</option>';
                            }
                            ?>
                        </select>
                    </div>
                    <div class="filter-item">
                        <i class="fa-solid fa-graduation-cap"></i>
                        <label for="filterGrado">Filtrar por Grado</label>
                        <select id="filterGrado" name="grado">
                            <option value="">Todos</option>
                            <option value="primero" <?php if($filterGrado=='primero') echo 'selected'; ?>>Primero</option>
                            <option value="segundo" <?php if($filterGrado=='segundo') echo 'selected'; ?>>Segundo</option>
                            <option value="tercero" <?php if($filterGrado=='tercero') echo 'selected'; ?>>Tercero</option>
                            <option value="cuarto" <?php if($filterGrado=='cuarto') echo 'selected'; ?>>Cuarto</option>
                            <option value="quinto" <?php if($filterGrado=='quinto') echo 'selected'; ?>>Quinto</option>
                            <option value="sexto" <?php if($filterGrado=='sexto') echo 'selected'; ?>>Sexto</option>
                        </select>
                    </div>
                    <div class="filter-item">
                        <i class="fa-solid fa-sort"></i>
                        <label for="filterTitulo">Ordenar por Título</label>
                        <select id="filterTitulo" name="order">
                            <option value="">Todos</option>
                            <option value="asc" <?php if($orderTitle=='asc') echo 'selected'; ?>>A - Z</option>
                            <option value="desc" <?php if($orderTitle=='desc') echo 'selected'; ?>>Z - A</option>
                        </select>
                    </div>
                    <div class="filter-item">
                        <i class="fa-solid fa-check-circle"></i>
                        <label for="filterDisponibilidad">Filtrar por Disponibilidad</label>
                        <select id="filterDisponibilidad" name="disponibilidad">
                            <option value="">Todos</option>
                            <option value="disponible" <?php if($filterDisponibilidad=='disponible') echo 'selected'; ?>>Disponible</option>
                            <option value="no disponible" <?php if($filterDisponibilidad=='no disponible') echo 'selected'; ?>>No Disponible</option>
                        </select>
                    </div>
                    <div class="filter-item">
                        <i class="fa-solid fa-clock"></i>
                        <label for="filterAgregados">Filtrar por Agregados</label>
                        <select id="filterAgregados" name="agregados">
                            <option value="">Todos</option>
                            <option value="nuevos" <?php if($filterAgregados=='nuevos') echo 'selected'; ?>>Recientes</option>
                            <option value="antiguos" <?php if($filterAgregados=='antiguos') echo 'selected'; ?>>Antiguos</option>
                        </select>
                    </div>
                    <div class="filter-item">
                        <i class="fa-solid fa-list-alt"></i>
                        <label for="filterCategoria">Filtrar por Categoría</label>
                        <select id="filterCategoria" name="categoria">
                            <option value="">Todos</option>
                            <option value="cuento" <?php if($filterCategoria=='cuento') echo 'selected'; ?>>Cuento</option>
                            <option value="fabula" <?php if($filterCategoria=='fabula') echo 'selected'; ?>>Fábula</option>
                            <option value="aventura" <?php if($filterCategoria=='aventura') echo 'selected'; ?>>Aventura</option>
                            <option value="historieta" <?php if($filterCategoria=='historieta') echo 'selected'; ?>>Historieta</option>
                            <option value="interactivos" <?php if($filterCategoria=='interactivos') echo 'selected'; ?>>Interactivos</option>
                            <option value="ciencia" <?php if($filterCategoria=='ciencia') echo 'selected'; ?>>Ciencia y Naturaleza</option>
                            <option value="saberes" <?php if($filterCategoria=='saberes') echo 'selected'; ?>>Saberes y Pensamientos</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Contenedor de Tarjetas de Libros -->
            <div class="book-catalog" id="bookCatalog">
                <?php
                // Verifica si hay resultados en la consulta principal
                if ($result->num_rows > 0) {
                    while ($fila = $result->fetch_assoc()) {
                        // Determinar el estado del libro
                        $estado = $fila["disponibilidad"];
                        // Desactivar el botón de reservar si el libro NO está disponible
                        $reservar_disabled = ($estado !== 'disponible') ? 'disabled' : '';
                        // Cambia la clase del botón según el estado
                        $button_class = ($estado !== 'disponible') ? 'btn-unavailable' : 'btn-success';

                        // Verifica si el usuario (idUsuario) tiene una reserva confirmada para este libro
                        $queryReservaConfirmada = "SELECT * FROM reservas WHERE idUsuario = ? AND idLibro = ? AND estado = 'confirmada'";
                        $stmtReservaConfirmada = $conn->prepare($queryReservaConfirmada);
                        $stmtReservaConfirmada->bind_param("ii", $_SESSION['user_id'], $fila["id"]);
                        $stmtReservaConfirmada->execute();
                        $resultReservaConfirmada = $stmtReservaConfirmada->get_result();
                        $reservaConfirmada = $resultReservaConfirmada->num_rows > 0;

                        echo '<div class="book-card" data-id="' . $fila["id"] . '">';
                            // Imagen del libro
                            echo '<img src="' . $fila["imagen_libro"] . '" alt="' . $fila["titulo"] . '">';
                            
                            // Sección de íconos (like, comentar) solo disponible si reserva está confirmada
                            echo '<div class="book-icons">';
                                if ($reservaConfirmada) {
                                    // Verificar si ya dio "me gusta" a este libro
                                    $queryLikeCheck = "SELECT id FROM reseñas WHERE idUsuario = ? AND idLibro = ? AND Puntuacion = 1";
                                    $stmtLikeCheck = $conn->prepare($queryLikeCheck);
                                    $stmtLikeCheck->bind_param("ii", $_SESSION['user_id'], $fila["id"]);
                                    $stmtLikeCheck->execute();
                                    $resultLikeCheck = $stmtLikeCheck->get_result();
                                    $liked = $resultLikeCheck->num_rows > 0;

                                    // Contar total de "me gusta" para este libro
                                    $queryLikes = "SELECT COUNT(*) as totalLikes FROM reseñas WHERE idLibro = ? AND Puntuacion = 1";
                                    $stmtLikes = $conn->prepare($queryLikes);
                                    $stmtLikes->bind_param("i", $fila["id"]);
                                    $stmtLikes->execute();
                                    $resultLikes = $stmtLikes->get_result();
                                    $totalLikes = $resultLikes->fetch_assoc()['totalLikes'];

                                    // Mostrar ícono de corazón lleno si ya le dio "like", si no, corazón contorneado
                                    if ($liked) {
                                        echo '<i class="fa-solid fa-heart like-icon liked" data-id="' . $fila["id"] . '" data-action="like"></i>';
                                    } else {
                                        echo '<i class="fa-regular fa-heart like-icon" data-id="' . $fila["id"] . '" data-action="like"></i>';
                                    }
                                    // Muestra número total de "likes"
                                    echo '<span class="like-counter">' . $totalLikes . '</span>';

                                    // Ícono de comentario
                                    echo '<i class="fa-regular fa-comment comment-icon" data-id="' . $fila["id"] . '" data-action="comment"></i>';
                                } else {
                                    // Si no hay reserva confirmada, los íconos aparecen desactivados
                                    echo '<i class="fa-regular fa-heart like-icon disabled" data-id="' . $fila["id"] . '" data-action="like" title="Debes reservar el libro para dar me gusta"></i>';
                                    echo '<span class="like-counter">0</span>';
                                    echo '<i class="fa-regular fa-comment comment-icon disabled" data-id="' . $fila["id"] . '" data-action="comment" title="Debes reservar el libro para comentar"></i>';
                                }
                            echo '</div>';

                            // Información y botones de acciones
                            echo '<div class="book-info">';
                                echo '<h3>' . $fila["titulo"] . '</h3>';
                                echo '<p>Estado: ' . $fila["disponibilidad"] . '</p>';
                                echo '<div class="book-actions">';
                                    echo '<div class="row">';
                                        // Botón "Ver detalles"
                                        echo '<button class="btn btn-primary ver-detalles" data-id="' . $fila["id"] . '">Ver detalles</button>';
                                        // Botón "Reservar" (desactivado si no está disponible)
                                        echo '<button class="btn ' . $button_class . ' reservar" data-id="' . $fila["id"] . '" ' . $reservar_disabled . '>Reservar</button>';
                                    echo '</div>';
                                    echo '<div class="row">';
                                        // Botón "Leer" para abrir el PDF en un modal
                                        echo '<button class="btn btn-warning leer-pdf" data-id="' . $fila["id"] . '" data-url="' . $fila["urlDescarga"] . '">Leer</button>';
                                        // Botón "Descargar" para descargar el PDF
                                        echo '<button class="btn btn-danger descargar-pdf" data-id="' . $fila["id"] . '" data-url="' . $fila["urlDescarga"] . '">Descargar</button>';
                                    echo '</div>';
                                echo '</div>';
                            echo '</div>';
                        echo '</div>';
                    }
                } else {
                    // Si no hay resultados según los filtros
                    echo "No se encontraron libros disponibles.";
                }
                ?>
            </div>

            <!-- Paginación con íconos de flechas y numeración -->
            <?php
            // Extraer todos los parámetros GET excepto 'page' para no perder los filtros al cambiar de página
            $filters = $_GET;
            unset($filters['page']);
            ?>
            <ul class="pagination-circles">
                <?php
                // Configuración del enlace a la página anterior
                $leftDisabled = ($pagina_actual <= 1 || $total_paginas <= 1);
                $prevPage = $pagina_actual - 1;
                $filters['page'] = $prevPage;
                $prevLink = 'catalogo.php?' . http_build_query($filters);
                ?>
                <li>
                    <a href="<?php echo !$leftDisabled ? $prevLink : '#'; ?>"
                       class="prev<?php echo $leftDisabled ? ' disabled' : ''; ?>">
                       <i class="fa-solid fa-angle-left"></i>
                    </a>
                </li>

                <!-- Números de página -->
                <?php for ($i = 1; $i <= $total_paginas; $i++):
                    $filters['page'] = $i;
                    $pageLink = 'catalogo.php?' . http_build_query($filters);
                ?>
                <li>
                    <a href="<?php echo $pageLink; ?>"
                       class="<?php echo ($i == $pagina_actual) ? 'active' : ''; ?>">
                       <?php echo $i; ?>
                    </a>
                </li>
                <?php endfor; ?>

                <?php
                // Configuración del enlace a la página siguiente
                $rightDisabled = ($pagina_actual >= $total_paginas || $total_paginas <= 1);
                $nextPage = $pagina_actual + 1;
                $filters['page'] = $nextPage;
                $nextLink = 'catalogo.php?' . http_build_query($filters);
                ?>
                <li>
                    <a href="<?php echo !$rightDisabled ? $nextLink : '#'; ?>"
                       class="next<?php echo $rightDisabled ? ' disabled' : ''; ?>">
                       <i class="fa-solid fa-angle-right"></i>
                    </a>
                </li>
            </ul>
        </main>

        <footer>
            <!-- Pie de página con información de derechos de autor -->
            <p>&copy; 2025 Biblioteca Virtual Escolar. Todos los derechos reservados.</p>
        </footer>
    </div>

    <!-- Modal Ver Detalles: se muestra al hacer clic en "Ver detalles" -->
    <div id="modalVerDetalles" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <div class="modal-body">
                <img id="detalleImagen" src="" alt="Imagen del libro">
                <div class="detalle-info">
                    <h3 id="detalleTitulo"></h3>
                    <p><strong>Autor:</strong> <span id="detalleAutor"></span></p>
                    <p><strong>Categoría:</strong> <span id="detalleCategoria"></span></p>
                    <p><strong>Fecha de publicación:</strong> <span id="detalleFecha"></span></p>
                    <p><strong>Descripción:</strong> <span id="detalleDescripcion"></span></p>
                    <p><strong>Estado:</strong> <span id="detalleDisponibilidad"></span></p>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Reservar: se muestra al hacer clic en "Reservar" -->
    <div id="modalReservar" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <form id="formReservar">
                <h3>Reservar Libro</h3>
                <div class="form-group">
                    <label for="nombreEstudiante">Nombre del Estudiante:</label>
                    <input type="text" id="nombreEstudiante" name="nombreEstudiante" required autocomplete="off">
                </div>
                <div class="form-group">
                    <label for="tituloLibro">Título del Libro:</label>
                    <input type="text" id="tituloLibro" name="tituloLibro" readonly>
                </div>
                <div class="form-group">
                    <label for="password">Contraseña:</label>
                    <div class="password-container">
                        <input type="password" id="password" name="password" required autocomplete="new-password">
                        <span class="toggle-password"><i class="fa-regular fa-eye"></i></span>
                        <!-- Botón/ícono para mostrar/ocultar la contraseña -->
                    </div>
                </div>
                <input type="hidden" id="csrfToken" name="csrfToken" value="<?php echo $_SESSION['csrf_token']; ?>">
                <!-- Se envía el token CSRF al formulario para mayor seguridad -->
                <input type="hidden" id="idLibro" name="idLibro">
                <!-- Campo oculto para almacenar el ID del libro que se está reservando -->
                <button type="submit" class="btn btn-primary">Reservar</button>
            </form>
        </div>
    </div>

    <!-- Modal para ver PDF: se muestra al hacer clic en "Leer" -->
    <div id="modalVerPDF" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <iframe id="pdfViewer" width="100%" height="600px"></iframe>
            <!-- iFrame para visualizar el PDF dentro de la misma página -->
        </div>
    </div>

    <!-- Scripts: jQuery, SweetAlert2 y archivos JS personalizados -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.js"></script>
    <script src="js/catalogo.js"></script>
    <script src="js/reseñas.js"></script>
</body>
</html>
