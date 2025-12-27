<?php
// Se incluye el archivo de configuración, que contiene la conexión a la base de datos ($conn).
include 'config.php';

// Establecer la hora límite para considerar una reserva como vencida.
// En este ejemplo, se define que las reservas "confirmadas" con fechaReserva anterior a 3 horas desde ahora se eliminarán.
$horaLimite = date('Y-m-d H:i:s', strtotime('-3 hours'));

// Consulta para eliminar reservas que cumplan con la condición:
//  - estado = 'confirmada'
//  - fechaReserva < la hora límite calculada
$query = "DELETE FROM reservas WHERE estado = 'confirmada' AND fechaReserva < ?";

// Se prepara la consulta usando sentencias preparadas (para mayor seguridad)
$stmt = $conn->prepare($query);
if (!$stmt) {
    // Si falla la preparación de la consulta, se detiene la ejecución
    die("Error al preparar la consulta: " . $conn->error);
}

// Se enlaza el parámetro ($horaLimite) a la consulta preparada
$stmt->bind_param("s", $horaLimite);

// Se ejecuta la consulta y se verifica si tuvo éxito
if ($stmt->execute()) {
    echo "Reservas vencidas eliminadas con éxito.";
} else {
    // Si ocurre un error al ejecutar, se muestra el mensaje correspondiente
    echo "Error al eliminar reservas vencidas: " . $stmt->error;
}
?>
