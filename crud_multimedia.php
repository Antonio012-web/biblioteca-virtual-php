<?php
include 'config.php';
// Se incluye el archivo de configuración que contiene la conexión a la base de datos

function validate_input($data) {
    // Limpia y normaliza los datos recibidos para mayor seguridad:
    // 1) trim() elimina espacios en blanco al inicio y final.
    // 2) stripslashes() elimina las barras invertidas de escape.
    // 3) htmlspecialchars() convierte caracteres especiales a entidades HTML.
    return htmlspecialchars(stripslashes(trim($data)));
}

// Se obtiene la acción desde $_POST, $_GET o desde el JSON en el cuerpo de la petición
$action = $_POST['action'] ?? $_GET['action'] ?? '';

// Lee el cuerpo de la petición en bruto (posiblemente JSON) y lo decodifica
$raw = file_get_contents('php://input');
$data_json = json_decode($raw, true);

// Si la data decodificada es un arreglo y existe una clave 'action', se sobreescribe la acción
if (is_array($data_json) && isset($data_json['action'])) {
    $action = $data_json['action'];
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Procesamos las solicitudes que llegan por método POST

    if($action == 'create' || $action == 'update'){
        // Tanto 'create' como 'update' requieren estos campos
        $id                 = isset($_POST['id']) ? validate_input($_POST['id']) : '';
        $titulo            = validate_input($_POST['titulo']);
        $descripcion       = validate_input($_POST['descripcion']);
        $tipo              = validate_input($_POST['tipo']);
        $url               = validate_input($_POST['url']);
        $autor             = validate_input($_POST['autor']);
        $fecha_publicacion = validate_input($_POST['fecha_publicacion']);
        $etiquetas         = validate_input($_POST['etiquetas']);
        $nivel_educativo   = validate_input($_POST['nivel_educativo']);

        if($action == 'create' || $action == 'update'){
            // Re-asignación de variables para asegurarnos de que estén limpias
            $id    = isset($_POST['id']) ? validate_input($_POST['id']) : '';
            $titulo = validate_input($_POST['titulo']);
            $descripcion = validate_input($_POST['descripcion']);
            $tipo = validate_input($_POST['tipo']);
            $url = validate_input($_POST['url']);
            $autor = validate_input($_POST['autor']);
        
            // Procesar la fecha para eliminar el día de la semana si existe (ej. "Monday, 12 Jan 2025")
            $fecha_publicacion_raw = validate_input($_POST['fecha_publicacion']);
            if(strpos($fecha_publicacion_raw, ',') !== false) {
                // Si contiene una coma, se parte la cadena por ", " 
                $parts = explode(', ', $fecha_publicacion_raw);
                if(count($parts) > 1) {
                    // Se asume que la parte posterior es la fecha real
                    $fecha_publicacion_raw = $parts[1];
                }
            }
            // Se convierte la fecha bruta a un formato de fecha/hora (YYYY-mm-dd HH:ii:ss)
            $fecha_publicacion = date('Y-m-d H:i:s', strtotime($fecha_publicacion_raw));
            
            $etiquetas = validate_input($_POST['etiquetas']);
            $nivel_educativo = validate_input($_POST['nivel_educativo']);
        
            // Se verifica que todos los campos requeridos estén presentes
            if(!$titulo || !$descripcion || !$tipo || !$url || !$autor || !$fecha_publicacion || !$nivel_educativo) {
                echo json_encode(['success' => false, 'message' => 'Faltan campos obligatorios.']);
                mysqli_close($conn);
                exit;
            }
        
            // VALIDACIÓN DE DUPLICADOS
            // Si la acción es 'create', se verifica si ya existe un registro con el mismo título o URL
            // Si es 'update', se verifica que no exista otro registro distinto con los mismos campos únicos
            if($action == 'create'){
                $sqlCheck = "SELECT id FROM multimedia WHERE titulo='$titulo' OR url='$url'";
            } else {
                $sqlCheck = "SELECT id FROM multimedia WHERE (titulo='$titulo' OR url='$url') AND id!='$id'";
            }
            $resCheck = mysqli_query($conn, $sqlCheck);
            if(mysqli_num_rows($resCheck) > 0){
                echo json_encode([
                    'success' => false, 
                    'message' => 'Un registro con el mismo Título o URL ya existe.'
                ]);
                mysqli_close($conn);
                exit;
            }
            
            // Sentencia SQL distinta según si es create (INSERT) o update (UPDATE)
            if($action == 'create'){
                $sql = "INSERT INTO multimedia (titulo, descripcion, tipo, url, autor, fecha_publicacion, etiquetas, nivel_educativo) 
                        VALUES ('$titulo', '$descripcion', '$tipo', '$url', '$autor', '$fecha_publicacion', '$etiquetas', '$nivel_educativo')";
            } else {
                $sql = "UPDATE multimedia SET 
                        titulo='$titulo', descripcion='$descripcion', tipo='$tipo', url='$url', 
                        autor='$autor', fecha_publicacion='$fecha_publicacion', etiquetas='$etiquetas', nivel_educativo='$nivel_educativo' 
                        WHERE id='$id'";
            }
        
            // Ejecutar la consulta y verificar el resultado
            if (mysqli_query($conn, $sql)) {
                echo json_encode(['success' => true, 'message' => 'Registro guardado con éxito']);
            } else {
                echo json_encode(['success' => false, 'message' => "Error en la consulta: " . mysqli_error($conn)]);
            }
            mysqli_close($conn);
            exit;
        }
    }
    
    if($action == 'read'){
        // Lee uno o varios registros multimedia
        $id = isset($_POST['id']) ? validate_input($_POST['id']) : '';
        if($id){
            // Si se especifica un ID, se obtiene solo ese registro
            $sql = "SELECT * FROM multimedia WHERE id='$id'";
            $result = mysqli_query($conn, $sql);
            $data = mysqli_fetch_all($result, MYSQLI_ASSOC);
            echo json_encode($data);
        } else {
            // De lo contrario, se obtienen todos los registros, con posibilidad de ordenar por fecha
            $sort = validate_input($_POST['sort'] ?? 'recent');
            // Si sort = 'oldest', ordena por fecha_publicacion ASC; si no, DESC
            $order_by = ($sort === 'oldest') ? 'fecha_publicacion ASC' : 'fecha_publicacion DESC';
            $sql = "SELECT * FROM multimedia ORDER BY $order_by";
            $result = mysqli_query($conn, $sql);
            $data = mysqli_fetch_all($result, MYSQLI_ASSOC);
            echo json_encode($data);
        }
        mysqli_close($conn);
        exit;
    }
    
    if($action == 'delete'){
        // Elimina un registro único (por id)
        $id = validate_input($_POST['id']);
        $sql = "DELETE FROM multimedia WHERE id='$id'";
        if(mysqli_query($conn, $sql)){
            echo "Registro eliminado con éxito";
        } else {
            echo "Error al eliminar el registro: " . mysqli_error($conn);
        }
        mysqli_close($conn);
        exit;
    }
    
    if($action == 'deleteMassive'){
        // Elimina varios registros a la vez
        $ids = explode(',', validate_input($_POST['ids']));
        foreach($ids as $id){
            $sql = "DELETE FROM multimedia WHERE id='$id'";
            if(!mysqli_query($conn, $sql)){
                echo "Error al eliminar el registro: " . mysqli_error($conn);
                exit;
            }
        }
        echo "Registros eliminados con éxito";
        mysqli_close($conn);
        exit;
    }
    
    if($action == 'import'){
        // Procesa la importación de datos de multimedia desde un JSON
        if (!isset($data_json['multimediaData']) || !is_array($data_json['multimediaData'])) {
            echo json_encode(['success' => false, 'message' => 'No se recibieron datos de multimedia.']);
            exit;
        }
        $multimediaData = $data_json['multimediaData'];
        $contadorInsertados = 0;
        $contadorOmitidos = 0;
        $detalles = [];
        
        // Valores permitidos para nivel_educativo (definidos en tu enum o requeridos en tu base de datos)
        $allowedNiveles = ['Primero','Segundo','Tercero','Cuarto','Quinto','Sexto'];
        
        foreach($multimediaData as $index => $row){
            // Limpieza de cada campo antes de armar la consulta
            $titulo = mysqli_real_escape_string($conn, trim($row['titulo'] ?? ''));
            $descripcion = mysqli_real_escape_string($conn, trim($row['descripcion'] ?? ''));
            $tipo = mysqli_real_escape_string($conn, trim($row['tipo'] ?? ''));
            $url = mysqli_real_escape_string($conn, trim($row['url'] ?? ''));
            $autor = mysqli_real_escape_string($conn, trim($row['autor'] ?? ''));
            
            // Procesar la fecha para quitar el día de la semana si existe (ej. "Lunes, 2025-01-12 10:00:00")
            $fecha_publicacion_raw = trim($row['fecha_publicacion'] ?? '');
            if(strpos($fecha_publicacion_raw, ',') !== false) {
                $parts = explode(', ', $fecha_publicacion_raw);
                if(count($parts) > 1) {
                    $fecha_publicacion_raw = $parts[1];
                }
            }
            // Convertimos la fecha bruta en un formato válido para MySQL
            $fecha_publicacion_formatted = date('Y-m-d H:i:s', strtotime($fecha_publicacion_raw));
            $fecha_publicacion = mysqli_real_escape_string($conn, $fecha_publicacion_formatted);
            
            // Validar el valor de 'nivel_educativo' contra la lista de valores permitidos
            $nivel_educativo_raw = trim($row['nivel_educativo'] ?? '');
            if (!in_array($nivel_educativo_raw, $allowedNiveles)) {
                $contadorOmitidos++;
                $detalles[] = [
                    'fila' => $index+1,
                    'exito' => false,
                    'motivo' => "Nivel Educativo '$nivel_educativo_raw' no es válido. Valores permitidos: " . implode(', ', $allowedNiveles)
                ];
                continue;
            }
            $nivel_educativo = mysqli_real_escape_string($conn, $nivel_educativo_raw);
            
            $etiquetas = mysqli_real_escape_string($conn, trim($row['etiquetas'] ?? ''));
            
            // Validación de campos obligatorios
            if(!$titulo || !$descripcion || !$tipo || !$url || !$autor || !$fecha_publicacion || !$nivel_educativo){
                $contadorOmitidos++;
                $detalles[] = [
                    'fila' => $index+1,
                    'exito' => false,
                    'motivo' => 'Campos obligatorios vacíos o datos inválidos.'
                ];
                continue;
            }
            
            // Verifica duplicados por título o URL
            $sqlCheck = "SELECT id FROM multimedia WHERE titulo = '$titulo' OR url = '$url'";
            $resCheck = mysqli_query($conn, $sqlCheck);
            if(mysqli_num_rows($resCheck) > 0){
                $contadorOmitidos++;
                $detalles[] = [
                    'fila' => $index+1,
                    'exito' => false,
                    'motivo' => 'Título o URL duplicados.'
                ];
                continue;
            }
            
            // Si todo es correcto, se procede a insertar el registro
            $sqlInsert = "INSERT INTO multimedia (titulo, descripcion, tipo, url, autor, fecha_publicacion, etiquetas, nivel_educativo)
                          VALUES ('$titulo', '$descripcion', '$tipo', '$url', '$autor', '$fecha_publicacion', '$etiquetas', '$nivel_educativo')";
            if(mysqli_query($conn, $sqlInsert)){
                $contadorInsertados++;
                $detalles[] = [
                    'fila' => $index+1,
                    'exito' => true,
                    'motivo' => 'Insertado correctamente.'
                ];
            } else {
                $contadorOmitidos++;
                $detalles[] = [
                    'fila' => $index+1,
                    'exito' => false,
                    'motivo' => 'Error en la inserción: ' . mysqli_error($conn)
                ];
            }
        }
        
        // Se retorna un informe de la operación de importación (cuántos insertados y cuántos omitidos)
        echo json_encode([
            'success' => true,
            'insertados' => $contadorInsertados,
            'omitidos' => $contadorOmitidos,          
            'message' => "Importación completada: $contadorInsertados insertados, $contadorOmitidos omitidos.",
            'detalles' => $detalles
        ]);
        mysqli_close($conn);
        exit;
    }

    // Aquí se podrían agregar otras acciones (por ejemplo, check_duplicate) si fuera necesario.
} else {
    // Si no se recibe una solicitud por POST, simplemente indicamos que el método no está soportado
    echo "Método no soportado";
    exit;
}
?>
