<?php
include 'config.php';
// Incluye el archivo config.php que contiene la conexión a la base de datos ($conn).

// Desactivar la visualización de errores para evitar salida HTML no deseada
ini_set('display_errors', 0);
error_reporting(E_ALL);
// Se decide no mostrar errores en pantalla (display_errors=0), 
// aunque sí se registren internamente (E_ALL).

header('Content-Type: application/json');
// Todas las respuestas se enviarán en formato JSON, 
// ideal para peticiones AJAX desde el frontend.

$action = $_GET['action'] ?? '';
// Se obtiene el parámetro 'action' a través de la URL (GET). 
// Si no existe, se asigna cadena vacía por defecto.

try {
    if ($action == 'load_users') {
        // Acción para cargar la lista completa de usuarios.

        // Consulta SQL para obtener el ID y nombre completo de cada usuario.
        $query = "SELECT id, nombre, apPaterno, apMaterno FROM usuarios";
        $result = $conn->query($query);

        if (!$result) {
            // Si la consulta falla, se arroja una excepción con el mensaje de error.
            throw new Exception("Error al ejecutar la consulta: " . $conn->error);
        }

        // Se prepara un array para almacenar todos los usuarios.
        $users = [];
        // Se recorre el resultado y se añaden las filas al array $users.
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }

        // Se responde con un objeto JSON que contiene el array 'users'.
        echo json_encode(['users' => $users]);

    } elseif ($action == 'general_stats') {
        // Acción para obtener estadísticas generales: 
        // 1) Total de usuarios
        // 2) Total de libros
        // 3) Suma total del tiempo de lectura (minutos, horas, etc.)
        // 4) Libro más leído
        // 5) Libro menos leído (con menos de 3 lecturas)

        // 1) Total de Usuarios
        $totalUsersQuery = "SELECT COUNT(id) as totalUsers FROM usuarios";
        $totalUsersResult = $conn->query($totalUsersQuery);
        if (!$totalUsersResult) {
            throw new Exception("Error al ejecutar la consulta de totalUsers: " . $conn->error);
        }
        // Se extrae la fila resultante y se lee la columna 'totalUsers'
        $totalUsersRow = $totalUsersResult->fetch_assoc();
        $totalUsers = isset($totalUsersRow['totalUsers']) ? $totalUsersRow['totalUsers'] : 0;

        // 2) Total de Libros
        $totalBooksQuery = "SELECT COUNT(id) as totalBooks FROM libros";
        $totalBooksResult = $conn->query($totalBooksQuery);
        if (!$totalBooksResult) {
            throw new Exception("Error al ejecutar la consulta de totalBooks: " . $conn->error);
        }
        $totalBooksRow = $totalBooksResult->fetch_assoc();
        $totalBooks = isset($totalBooksRow['totalBooks']) ? $totalBooksRow['totalBooks'] : 0;

        // 3) Tiempo de Lectura (suma total del campo 'tiempoLectura' en la tabla 'historiallectura')
        $totalReadingTimeQuery = "SELECT SUM(tiempoLectura) as totalReadingTime FROM historiallectura";
        $totalReadingTimeResult = $conn->query($totalReadingTimeQuery);
        if (!$totalReadingTimeResult) {
            throw new Exception("Error al ejecutar la consulta de totalReadingTime: " . $conn->error);
        }
        $totalReadingTimeRow = $totalReadingTimeResult->fetch_assoc();
        $totalReadingTime = isset($totalReadingTimeRow['totalReadingTime']) ? $totalReadingTimeRow['totalReadingTime'] : 0;

        // 4) Libro más leído
        // Definimos la consulta SQL que obtendrá el libro más leído
        $mostReadBooksQuery = " 
            SELECT l.titulo,                      // Selecciona el título del libro
            COUNT(hl.id) as totalLecturas         // Cuenta cuántas veces aparece el libro en el historial de lectura
            FROM historiallectura hl             // Tabla que registra cada lectura realizada
            JOIN libros l ON hl.idLibro = l.id   // Une la tabla historial con libros para acceder al título
            GROUP BY l.titulo                    // Une la tabla historial con libros para acceder al título
            ORDER BY totalLecturas DESC         // Ordena de mayor a menor número de lecturas
            LIMIT 1                            // Devuelve solo el libro con más lecturas
        ";

        //Ejecutamos la consulta en la conexión activa ($conn)
        $mostReadBooksResult = $conn->query($mostReadBooksQuery);
        // Verificamos que la consulta se haya ejecutado correctamente
         // y que haya al menos un resultado devuelto
        if ($mostReadBooksResult && $mostReadBooksResult->num_rows > 0) {
            // Recuperamos la primera (y única) fila como arreglo asociativo
            $mostReadBooksRow = $mostReadBooksResult->fetch_assoc();
            // Si existe la clave 'titulo', asignamos su valor a $mostReadBooks;
            // de lo contrario, asignamos 'N/A' como valor predeterminado
            $mostReadBooks = isset($mostReadBooksRow['titulo']) ? $mostReadBooksRow['titulo'] : 'N/A';
        } else {
            // Si no hay resultados, se asigna 'N/A'
            $mostReadBooks = 'N/A';
        }

        // 5) Libro menos leído
        // Se filtra por aquellos con totalLecturas < 3 y se ordena de menor a mayor
        $leastReadBooksQuery = "
            SELECT l.titulo,                      // Seleccionamos el título del libro
            COUNT(hl.id) as totalLecturas         // Contamos cuántas lecturas tiene cada libro
            FROM historiallectura hl             // De la tabla historiallectura (alias hl) que guarda cada lectura realizada
            JOIN libros l ON hl.idLibro = l.id   // Unimos (JOIN) con la tabla libros (alias l) para acceder al título
            GROUP BY l.titulo                    // Agrupamos por título para sumar las lecturas por libro
            HAVING totalLecturas < 3             // HAVING filtra los que tienen menos de 3 lecturas
            ORDER BY totalLecturas ASC           // Ordenamos ascendentemente para que el que menos lecturas tenga aparezca primero
            LIMIT 1                              // LIMIT 1 devuelve sólo el registro con menor número de lecturas
        ";

        // Ejecutamos la consulta sobre la conexión activa ($conn)
        $leastReadBooksResult = $conn->query($leastReadBooksQuery);
         //  Validamos si la consulta devolvió al menos 1 fila
        if ($leastReadBooksResult && $leastReadBooksResult->num_rows > 0) {
            // Obtenemos la primera (y única) fila como arreglo asociativo
            $leastReadBooksRow = $leastReadBooksResult->fetch_assoc();
             // Si existe la clave 'titulo', asignamos su valor; de lo contrario usamos 'N/A'
            $leastReadBooks = isset($leastReadBooksRow['titulo']) ? $leastReadBooksRow['titulo'] : 'N/A';
        } else {
             // Si no hubo resultados o la consulta falló, asignamos 'N/A'
            $leastReadBooks = 'N/A'; 
        }

        // Se devuelve un objeto JSON con las estadísticas encontradas
        echo json_encode([
            'totalUsers' => $totalUsers,
            'totalBooks' => $totalBooks,
            'totalReadingTime' => $totalReadingTime,
            'mostReadBooks' => $mostReadBooks,
            'leastReadBooks' => $leastReadBooks
        ]);

    } elseif ($action == 'generate') {
        // Acción para generar estadísticas detalladas según parámetros:
        // type => 'user', 'books', 'general'
        // timeframe => 'day', 'week', 'month', 'year'
        // user => id de usuario (opcional)
        // start_date => fecha específica (opcional)

        $type = $_GET['type'] ?? 'general';
        $timeframe = $_GET['timeframe'] ?? 'month';
        $userId = $_GET['user'] ?? '';
        $startDate = $_GET['start_date'] ?? '';

        // Aquí se construye el WHERE dinámico según los parámetros recibidos
        $where = '';

        // Si se piden estadísticas de un usuario en concreto
        if ($type == 'user' && !empty($userId)) {
            $where .= " AND hl.idUsuario = $userId";
        }

        // Validación para la opción "día": 
        // si timeframe=day y hay una fecha de inicio, se filtra por fechaInicioLectura = esa fecha
        if ($timeframe == 'day' && !empty($startDate)) {
            $where .= " AND DATE(hl.fechaInicioLectura) = '$startDate'";
        }

        // Se definen las consultas específicas según el valor de 'type'
        if ($type == 'user') {
            // Consulta para un usuario específico: 
            // - Muestra cada libro y su tiempoLectura
            $query = "
                SELECT l.titulo as libro, hl.tiempoLectura
                FROM historiallectura hl
                JOIN libros l ON hl.idLibro = l.id
                WHERE 1=1 $where AND hl.tiempoLectura > 0
                ORDER BY l.titulo, hl.fechaInicioLectura ASC
            ";

            // Consulta adicional para sumar el tiempo total de lectura de ese usuario
            $totalTimeQuery = "
                SELECT SUM(hl.tiempoLectura) as totalTiempoLectura
                FROM historiallectura hl
                WHERE hl.idUsuario = $userId AND hl.tiempoLectura > 0
            ";

        } elseif ($type == 'books') {
            // Consulta para mostrar cuántas veces se ha leído cada libro
            $query = "
                SELECT l.titulo as libro, COUNT(hl.id) as totalLecturas
                FROM historiallectura hl
                JOIN libros l ON hl.idLibro = l.id
                WHERE 1=1 $where
                GROUP BY l.titulo
                ORDER BY totalLecturas DESC
            ";

        } else {
            // Estadísticas generales, agrupadas por un período (día, semana, mes o año)
            // Se define el formato de la fecha según 'timeframe'
            switch ($timeframe) {
                case 'day':
                    $dateFormat = '%Y-%m-%d';
                    break;
                case 'week':
                    $dateFormat = '%Y-%v'; 
                    // %v corresponde a la semana en calendario ISO (1-53).
                    break;
                case 'month':
                    $dateFormat = '%Y-%m'; 
                    break;
                case 'year':
                    $dateFormat = '%Y'; 
                    break;
                default:
                    // Si no coincide, se asume 'month'
                    $dateFormat = '%Y-%m'; 
                    break;
            }

            // Se agrupa por 'period' definido como el DATE_FORMAT según $dateFormat
            // y se suman los tiempos de lectura en 'totalTiempoLectura'
            $query = "
                SELECT DATE_FORMAT(hl.fechaInicioLectura, '$dateFormat') as period, SUM(hl.tiempoLectura) as totalTiempoLectura
                FROM historiallectura hl
                JOIN libros l ON hl.idLibro = l.id
                WHERE 1=1 $where
                GROUP BY period
                ORDER BY period ASC
            ";
        }

        // Ejecutar la consulta final construida
        $result = $conn->query($query);
        if (!$result) {
            throw new Exception("Error al ejecutar la consulta: " . $conn->error);
        }

        // Estructuras para Chart.js
        $labels = [];   // Etiquetas del eje X
        $data = [];     // Valores asociados a dichas etiquetas
        $userBooks = []; // Información detallada para el tipo 'user'
        $totalTime = 0; // Tiempo total de lectura para el tipo 'user'

        if ($type == 'user') {
            // Se obtienen los libros y su tiempo de lectura asociado
            while ($row = $result->fetch_assoc()) {
                $labels[] = $row['libro'];         // Nombre del libro
                $data[] = $row['tiempoLectura'];   // Tiempo de lectura en minutos (o la unidad que manejes)
                // Se almacena también en un array auxiliar para mostrar datos detallados
                $userBooks[] = [
                    'libro' => $row['libro'], 
                    'tiempo' => $row['tiempoLectura']
                ];
            }

            // Ejecutar consulta adicional para sumar todo el tiempoLectura de este usuario
            if (isset($totalTimeQuery)) {
                $totalTimeResult = $conn->query($totalTimeQuery);
                if ($totalTimeResult) {
                    $totalTimeRow = $totalTimeResult->fetch_assoc();
                    $totalTime = isset($totalTimeRow['totalTiempoLectura']) ? $totalTimeRow['totalTiempoLectura'] : 0;
                }
            }

            // Se construye el array $datasets para Chart.js, definiendo apariencia de las barras o líneas
            $datasets = [
                [
                    'label' => 'Tiempo de Lectura',
                    'data' => $data,
                    'backgroundColor' => 'rgba(54, 162, 235, 0.2)',
                    'borderColor' => 'rgba(54, 162, 235, 1)',
                    'borderWidth' => 1
                ]
            ];

            // Respuesta en formato JSON, incluyendo las etiquetas, datasets, los libros por usuario y el tiempo total
            echo json_encode([
                'labels' => $labels,
                'datasets' => $datasets,
                'xTitle' => 'Libros',
                'yTitle' => 'Tiempo de Lectura (minutos)',
                'userBooks' => $userBooks,
                'totalTime' => $totalTime
            ]);

        } elseif ($type == 'books') {
            // Se muestran libros y cuántas veces fueron leídos
            while ($row = $result->fetch_assoc()) {
                $labels[] = $row['libro'];
                $data[] = $row['totalLecturas'];
            }
            // Se define el dataset para mostrar cuántas lecturas tuvo cada libro
            $datasets = [
                [
                    'label' => 'Total de Lecturas',
                    'data' => $data,
                    'backgroundColor' => 'rgba(54, 162, 235, 0.2)',
                    'borderColor' => 'rgba(54, 162, 235, 1)',
                    'borderWidth' => 1
                ]
            ];
            // Se retorna la respuesta con la información necesaria para crear la gráfica
            echo json_encode([
                'labels' => $labels,
                'datasets' => $datasets,
                'xTitle' => 'Libros',
                'yTitle' => 'Total de Lecturas'
            ]);

        } else {
            // Para estadísticas generales, se agrupa por periodo (day, week, month, year)
            // y se suman los tiempos de lectura
            while ($row = $result->fetch_assoc()) {
                $labels[] = $row['period'];
                $data[] = $row['totalTiempoLectura'];
            }
            $datasets = [
                [
                    'label' => 'Tiempo de Lectura',
                    'data' => $data,
                    'backgroundColor' => 'rgba(54, 162, 235, 0.2)',
                    'borderColor' => 'rgba(54, 162, 235, 1)',
                    'borderWidth' => 1 
                ]
            ];
            // Se especifican las etiquetas para el eje X y Y, y se envían los datasets
            echo json_encode([
                'labels' => $labels,
                'datasets' => $datasets,
                'xTitle' => 'Periodo',
                'yTitle' => 'Tiempo de Lectura (minutos)'
            ]);
        }
    } else {
        // Si $action no coincide con 'load_users', 'general_stats' ni 'generate'
        throw new Exception("Acción no válida");
    }
} catch (Exception $e) {
    // Si ocurre cualquier excepción, se responde con un error 500 y un mensaje en JSON
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
