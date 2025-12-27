<?php
// Incluir el archivo de conexión a la base de datos
include 'config.php'; 
// Aquí se definen las credenciales y la variable $conn necesaria para interactuar con la base de datos

session_start();
// Inicia (o reanuda) la sesión en el servidor para poder usar $_SESSION si fuese requerido

header('Content-Type: application/json');
// Todas las respuestas se enviarán en formato JSON; útil para peticiones AJAX del front-end

// Lista de palabras obscenas
$palabrasObscenas = [
    'APAÑAR', 'ARRABALERA', 'ASESINAR', 'ASESINO', 'ASSHOLE', 'BABOSA', 'BEARNER', 'BITCH', 'BLOWJOB', 'BOCATUBO',
    'BOLUDO', 'BUBIS', 'CABRON', 'CACHAPERAS', 'CAGADA', 'CAGANTE', 'CAGAR', 'CAGON', 'CARAJO', 'CHINGA TU MADRE',
    'CHINGADA', 'CHINGADAS', 'CHINGADAZO', 'CHINGADERA', 'CHINGADO', 'CHINGADOS', 'CHINGAR', 'CHINGASAVEINTE',
    'CHIRINGANDO', 'CHUPABOLAS', 'CHUPAMEDIDAS', 'CLITORIS', 'COCAINA', 'COHECHO', 'COJO', 'COJONES', 'COLOFOX',
    'COÑO', 'COOK', 'CULADOTE', 'CULEADA', 'CULERA', 'CULERISIMO', 'CULERO', 'CULO', 'CULOTE', 'DICK', 'DROGAS',
    'DU BISET EIN WEIBCHEN', 'DUMBASS', 'ENVERGADO', 'ESTUPIDO', 'ESVASTICA', 'FACISMO', 'FAGGOT', 'FLIGIO DI PUTANA',
    'FODASE (JODASE)', 'FOLLADOR', 'FOLLADOTA', 'FOLLAR', 'FORNICAR', 'FRIGGIN', 'FRIJOLERO', 'FUCK', 'FUCKER',
    'FUCKIN', 'GARANTIA', 'GARGAJO', 'GILIPOLLAS', 'GOLFA', 'GUBERNAMENTAL', 'GÜEVO', 'HIJODEPUTA', 'HORE', 'HUEVON',
    'HUEVUDO', 'IJUEPUTA', 'INMIGRANTES', 'JACK OFF', 'JETON', 'JODER', 'JOTO', 'JUEZ', 'KU KLUX KLAN', 'LADRONES',
    'LAMEHUEVOS', 'LEGIONARIO', 'LENON', 'MAMADA', 'MAMADOTA', 'MAMAR', 'MAMERTO', 'MAMON', 'MANFLORA', 'MARICA',
    'MARICON', 'MARIGUANA', 'MARIMACHO', 'MENTECATO', 'MERDA', 'MERDE', 'MIERDA', 'MIERDOTA', 'MOTHEFUCKER',
    'MUERDE ALMOHADAS', 'NARCO', 'NAZISMO', 'NECROFILIA', 'OJETE', 'OPIO', 'PANOCHA', 'PANOCHON', 'PASON', 'PEDO',
    'PELOTUDO', 'PENDEJA', 'PENDEJAZO', 'PENDEJETE', 'PENDEJISIMA', 'PENDEJISIMO', 'PENDEJO', 'PERVERSO', 'PHAT ASS',
    'PINCHE', 'PINCHES', 'PINCHISIMA', 'PINCHISIMO', 'PIPE', 'PIRUJA', 'PITO', 'PITOTE', 'POOP', 'PUCHA', 'PUSSY',
    'PUTA', 'PUTERA', 'PUTISIMA', 'PUTISIMO', 'PUTITA', 'PUTITO', 'PUTO', 'PUTODEMIERDA', 'PUTON', 'PUTOTA', 'PUTOTE',
    'RACK', 'RAMERAS', 'RATERO', 'RATONEAR', 'SADICO', 'SHIT', 'SHON DES WEIBCHENS', 'SICARIO', 'SUASTICA', 'SUICIDIO',
    'TACHA', 'TARADO', 'TONTEJO', 'TRAGALECHE', 'VERGA', 'VERGAMOTA', 'VERGASOS', 'VERGASTE', 'VERGOTA', 'VERGOTOTOTA',
    'VERGUITA', 'VERIJA', 'VERIJON', 'WEY', 'WHIMPY', 'ZORRIPUTA', 'ABORRECER', 'AHORCADO', 'AHORCAR', 'AMPUTAR',
    'ANIQUILAR', 'ANO', 'APENDEJAR', 'APUÑALAR', 'ASESINATO', 'ASESINOS', 'ASFIXIAR', 'ASHOLE', 'ASHOLES', 'ASSHOLES',
    'ATENTADO', 'BELTRAN LEYVA', 'BIN LADEN', 'BLOWJOBS', 'CAGATINTA', 'CAMPO DE CONCENTRACION', 'CHAPO', 'CHINGADAZOS',
    'CHINGADERAS', 'CHINGADÍSIMO', 'CHINGADÍSIMOS', 'CHINGARSE', 'CHINGARSES', 'CHINGO', 'CHUPAMEDIAS', 'COÑOS',
    'CULADERO', 'CULAZO', 'CULEADO', 'CULEARSE', 'CULEARSES', 'CULEI', 'CULEIS', 'CULERÍSIMO', 'CULERÍSIMOS', 'CULEROS',
    'CULÍSIMO', 'CULÍSIMOS', 'CULOS', 'DICKS', 'DROGA', 'ESVASTICAS', 'GENOCIDIO', 'GUBERNAMENTALES', 'GUERRA', 'HITLER',
    'HOLOCAUSTO', 'MALCOGIDA', 'MALDITA', 'MALDITO', 'MALDOSO', 'MALPARIDO', 'MARIHUANA', 'MUTILAR', 'NARCOTRAFICO',
    'NAZI', 'ODIO', 'OSAMA', 'OSSAMA', 'PENDEJADA', 'PENDEJAS', 'PENDEJEAR', 'PENDEJERA', 'PENDEJITA', 'PENDEJITAS',
    'PENDEJITO', 'PENDEJITOS', 'PENDEJOS', 'PEPAZO', 'PERESOZA', 'PERESOZOS', 'PEREZOSAS', 'PEREZOSO', 'PERSECUCIÓN',
    'PROSTITUCIÓN', 'PUCHAS', 'PUNJETAS', 'PUÑETA', 'PUÑETAS', 'PUÑETERIA', 'PUSSYS', 'PUTAMADRE', 'PUTAMADRES',
    'PUTARRÓN', 'PUTAS', 'PUTATIVO', 'PUTAZO', 'PUTAZOS', 'PUTEADA', 'PUTEAR', 'PUTEARS', 'PUTEARSE', 'PUTEARSES',
    'PUTERIAS', 'PUTERIO', 'PUTESA', 'PUTIFERA', 'PUTIMAS', 'PUTIN', 'PUTÍSIMAS', 'PUTÍSIMOS', 'PUTITAS', 'PUTÓN',
    'PUTOS', 'QULO', 'RE-PUTA', 'RE-PUTAS', 'SICARIOS', 'SIDOSO', 'SIDOSOS', 'SIFILÍTICO', 'SIFILÍTICOS',
    'SOCIALDEMOCRACIA', 'SOCIALISTA', 'SOHN DES WEIBCHENS', 'SOPLANUCAS', 'SUASTICAS', 'SUICIDIOS', 'TERRORISMO',
    'TERRORISTA', 'TESTICULOS', 'VAGINA', 'ABUSAR', 'AGRAVIAR', 'AGREDIR', 'AMATAR', 'ASALTAR', 'ASESINARS', 'BIOLAR',
    'DAÑAR', 'GOLPEAR', 'HERIR', 'INSULTAR', 'INSULTO', 'LASTIMAR', 'MALTRATAR', 'MATAR', 'MATARS', 'OFENDER',
    'VIOLACIÓN', 'VIOLAR', 'CACA', 'kk', 'PTO', 'NALGA', 'HDPM'
];
// Array que contiene palabras restringidas para validar que no aparezcan en campos como 'nombre' y 'mensaje'.

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Solo procesamos el formulario si se envía mediante POST

    // Capturar los datos del formulario aplicando trim() y htmlspecialchars() para mayor seguridad
    $nombre = trim(htmlspecialchars($_POST['nombre']));
    $correo = trim(htmlspecialchars($_POST['correo']));
    $mensaje = trim(htmlspecialchars($_POST['mensaje']));

    // Validar que los campos no estén vacíos
    if (empty($nombre) || empty($correo) || empty($mensaje)) {
        echo json_encode(['status' => 'error', 'message' => 'Por favor, completa todos los campos.']);
        exit();
    }

    // Validar formato de correo electrónico
    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['status' => 'error', 'message' => 'Por favor, ingresa un correo electrónico válido.']);
        exit();
    }

    // Validar que el nombre solo contenga letras, acentos y espacios
    if (!preg_match("/^[a-zA-ZÀ-ÿ\s]+$/", $nombre)) {
        // Si se detectan caracteres no permitidos, se envía un error al front-end en formato JSON
        echo json_encode(['status' => 'error', 'message' => 'El nombre solo debe contener letras, espacios y acentos.']);
        exit();
    }

    // Validar que el mensaje solo contenga caracteres alfanuméricos, acentos, signos de puntuación básicos, etc.
    if (!preg_match("/^[a-zA-Z0-9À-ÿ\s.,()¡!¿?\/-]+$/", $mensaje)) {
        echo json_encode(['status' => 'error', 'message' => 'El mensaje contiene caracteres no permitidos.']);
        exit();
    }

    // Función para verificar si el texto contiene palabras obscenas
    function contienePalabrasObscenas($texto, $palabrasObscenas) {
        foreach ($palabrasObscenas as $palabra) {
            // stripos() busca la primera aparición de la palabra en el texto, sin distinguir mayúsculas
            if (stripos($texto, $palabra) !== false) {
                return true; 
            }
        }
        return false;
    }

    // Verificar que el nombre no contenga palabras prohibidas
    if (contienePalabrasObscenas($nombre, $palabrasObscenas)) {
        echo json_encode(['status' => 'error', 'message' => 'El nombre contiene palabras no permitidas.']);
        exit();
    }

    // Verificar que el mensaje no contenga palabras prohibidas
    if (contienePalabrasObscenas($mensaje, $palabrasObscenas)) {
        echo json_encode(['status' => 'error', 'message' => 'El mensaje contiene palabras no permitidas.']);
        exit();
    }

    // Verificar si el nombre y el correo coinciden en la tabla usuarios
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE correo = ? AND nombre = ?");
    $stmt->bind_param("ss", $correo, $nombre);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        // Si hay una fila, se extrae el ID del usuario
        $stmt->bind_result($idUsuario);
        $stmt->fetch();
    } else {
        // Si no se encuentra el usuario, se asigna null
        $idUsuario = null;
    }
    $stmt->close();

    // Preparar la consulta para insertar el mensaje en la base de datos
    if ($idUsuario !== null) {
        // Si existe el usuario, guardamos el idUsuario en la tabla 'mensajes_contacto'
        $stmt = $conn->prepare("INSERT INTO mensajes_contacto (nombre, correo, mensaje, idUsuario) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("sssi", $nombre, $correo, $mensaje, $idUsuario);
    } else {
        // Si no existe, se inserta sin idUsuario
        $stmt = $conn->prepare("INSERT INTO mensajes_contacto (nombre, correo, mensaje) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $nombre, $correo, $mensaje);
    }

    // Ejecutar la inserción en la tabla mensajes_contacto
    if ($stmt->execute()) {
        // Insertar notificación de que se ha recibido un nuevo mensaje de contacto
        if ($idUsuario === null) {
            // Para usuarios no registrados
            $queryNotificacion = "INSERT INTO notificaciones (idUsuario, tipo, mensaje, fecha) VALUES (NULL, ?, ?, NOW())";
            $stmtNot = $conn->prepare($queryNotificacion);
            if ($stmtNot) {
                $tipo = 'contacto';
                $mensajeNot = "Nuevo mensaje de contacto de $nombre.";
                // Se usa idUsuario = NULL en la notificación
                $stmtNot->bind_param("ss", $tipo, $mensajeNot);
                $stmtNot->execute();
            }
        } else {
            // Para usuarios registrados
            $queryNotificacion = "INSERT INTO notificaciones (idUsuario, tipo, mensaje, fecha) VALUES (?, ?, ?, NOW())";
            $stmtNot = $conn->prepare($queryNotificacion);
            if ($stmtNot) {
                $tipo = 'contacto';
                $mensajeNot = "Nuevo mensaje de contacto de $nombre.";
                // Se registra el idUsuario correspondiente en la notificación
                $stmtNot->bind_param("iss", $idUsuario, $tipo, $mensajeNot);
                $stmtNot->execute();
            }
        }
        // Si todo va bien, se envía un JSON de éxito
        echo json_encode(['status' => 'success', 'message' => 'Mensaje enviado.']);
    } else {
        // Si ocurre un error al ejecutar la inserción, se envía un JSON de error
        echo json_encode(['status' => 'error', 'message' => 'Error al enviar el mensaje: ' . $stmt->error]);
    }

    // Cerrar el statement e igual para la conexión
    $stmt->close();
    $conn->close();
} else {
    // Si se intenta acceder al archivo sin usar el método POST
    echo json_encode(['status' => 'error', 'message' => 'Error en el envío del formulario.']);
}
?>
