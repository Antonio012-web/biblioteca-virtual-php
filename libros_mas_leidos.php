<?php
// Se incluye el archivo de configuración que establece la conexión a la base de datos.
require_once 'config.php';


// Consulta SQL para obtener los 5 libros con mayor tiempo de lectura.
// Se asume que la tabla historiallectura tiene la columna "idLibro" para identificar el libro.
$query = "
    SELECT l.id, l.titulo, l.categoria, l.imagen_libro,
           SUM(h.tiempoLectura) AS total_minutos
    FROM historiallectura h
    JOIN libros l ON h.idLibro = l.id
    GROUP BY l.id
    ORDER BY total_minutos DESC
    LIMIT 5
";
 
// Se ejecuta la consulta.
$result = mysqli_query($conn, $query);

// Se comprueba si se obtuvieron resultados.
if ($result && mysqli_num_rows($result) > 0) {
    echo '
    <section class="most-read-books swiper-leidos">
        <h2>Libros más leídos</h2>
        <!-- Contenedor principal para las diapositivas de Swiper -->
        <div class="swiper-wrapper">
    ';

    // Se recorre cada registro obtenido y se muestra como una diapositiva en el carrusel.
    while ($row = mysqli_fetch_assoc($result)) {
        echo '<div class="swiper-slide book-item">';
            echo '<div class="book-cover">';
                echo '<img src="' . $row['imagen_libro'] . '" alt="Portada del libro" style="max-width: 250px;">';
            echo '</div>';
            echo '<div class="book-info">';
                echo '<h3>' . $row['titulo'] . '</h3>';
                echo '<p class="book-meta"><strong>Categoría:</strong> ' . $row['categoria'] . '</p>';
                //echo '<p class="book-meta"><strong>Minutos leídos:</strong> ' . $row['total_minutos'] . '</p>';
            echo '</div>';
        echo '</div>';
    }

    echo '
        </div> <!-- fin swiper-wrapper -->
        <!-- Controles de navegación para Swiper -->
        <div class="swiper-button-next"></div>
        <div class="swiper-button-prev"></div>
    </section>
    ';
} else {
    // Mensaje en caso de que no se encuentren registros.
    echo '
    <section class="most-read-books">
        <h2>Libros más leídos</h2>
        <p>No hay registros de lectura todavía.</p>
    </section>
    ';
}
?>
