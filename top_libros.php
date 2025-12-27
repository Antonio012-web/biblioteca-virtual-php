<?php
// Se incluye el archivo de configuración que establece la conexión a la base de datos.
// Asegúrate de que la ruta al archivo 'config.php' sea correcta según la estructura de tu proyecto.
require_once 'config.php';


// Se define una consulta SQL que realiza las siguientes operaciones:
// 1. Selecciona los campos del libro: id, título, categoría e imagen de portada, desde la tabla 'libros' (alias l).
// 2. Cuenta cuántos registros (likes) existen en la tabla 'reseñas' (alias r) para cada libro, considerando solo aquellos donde 'Puntuacion' es 1.
// 3. Se realiza un JOIN entre la tabla 'reseñas' y 'libros' para relacionar cada reseña con el libro correspondiente (r.idLibro = l.id).
// 4. Se agrupa el resultado por el id del libro (GROUP BY l.id) para que el COUNT se aplique a cada grupo individualmente.
// 5. Se ordena el resultado de manera descendente (DESC) en función del número total de likes (total_likes),
//    de modo que los libros con más likes aparezcan primero.
// 6. Se limita el resultado a los 5 libros con mayor cantidad de likes.
$query = "
    SELECT l.id, l.titulo, l.categoria, l.imagen_libro,
    COUNT(r.id) AS total_likes
    FROM reseñas r
    JOIN libros l ON r.idLibro = l.id
    WHERE r.Puntuacion = 1
    GROUP BY l.id
    ORDER BY total_likes DESC
    LIMIT 5
"; 

// Se ejecuta la consulta utilizando mysqli_query, la cual toma como parámetros la conexión ($conn) y la consulta SQL ($query).
// El resultado se almacena en la variable $result.
$result = mysqli_query($conn, $query);

// Se comprueba si la consulta se ejecutó correctamente y si se obtuvieron registros.
// mysqli_num_rows($result) devuelve el número de filas en el conjunto de resultados.
if ($result && mysqli_num_rows($result) > 0) {
    // Si se encontraron resultados, se inicia la salida de HTML para la sección "Libros más valorados".
    // Se utiliza un contenedor <section> con clases "top-rated-books" y "swiper" para integrar la funcionalidad de Swiper.
    echo '
    <section class="top-rated-books swiper-valorados">
        <h2>Libros más valorados</h2>
        <!-- Contenedor principal para las diapositivas de Swiper -->
        <div class="swiper-wrapper">';
    
    // Se recorre cada fila del resultado utilizando mysqli_fetch_assoc, que devuelve un arreglo asociativo con los datos de cada libro.
    while ($row = mysqli_fetch_assoc($result)) {
        // Cada libro se muestra como una diapositiva individual en el carrusel Swiper.
        echo '<div class="swiper-slide book-item">';
        
            // Se crea un contenedor para la portada del libro.
            echo '<div class="book-cover">';
                // Se inserta la imagen del libro, utilizando el campo 'imagen_libro' del registro.
                // Se aplica un estilo en línea para limitar la anchura máxima de la imagen a 250px.
                echo '<img src="' . $row['imagen_libro'] . '" alt="Portada del libro" style="max-width: 250px;">';
            echo '</div>'; // Fin del contenedor de la portada.
          
            // Se crea un contenedor para la información del libro.
            echo '<div class="book-info">';
                // Se muestra el título del libro dentro de una etiqueta <h3>.
                echo '<h3>' . $row['titulo'] . '</h3>';
                // Se muestra la categoría del libro en un párrafo (<p>) con la clase "book-meta", donde la etiqueta "Categoría:" se resalta en negrita.
                echo '<p class="book-meta"><strong>Categoría:</strong> ' . $row['categoria'] . '</p>';
                // Se muestra la cantidad de "likes" (total_likes) junto con un ícono de corazón.
                echo '<p class="book-meta">';
                    // Se utiliza un ícono de corazón de Font Awesome con estilos en línea para definir su color y tamaño.
                    echo '<i class="fa-solid fa-heart" style="color:rgba(255, 0, 0, 0.84); font-size: 16px;"></i>';
                    // Se muestra el número total de likes en negrita.
                    echo ' <strong>' . $row['total_likes'] . '</strong>';
                echo '</p>';
            echo '</div>'; // Fin del contenedor de información del libro.
        echo '</div>'; // Fin de la diapositiva (swiper-slide) para el libro actual.
    }
    
    // Se cierra el contenedor "swiper-wrapper" que agrupa todas las diapositivas.
    echo '
        </div> <!-- fin swiper-wrapper -->

        <!-- Controles de navegación de Swiper (opcional): permiten avanzar y retroceder entre diapositivas -->
        <div class="swiper-button-next"></div>
        <div class="swiper-button-prev"></div>
        <!-- Paginación de Swiper (opcional): se pueden usar para indicar el número de diapositivas y la posición actual -->
       <!-- <div class="swiper-pagination"></div> -->
    </section>';
} else {
    // Si la consulta no devolvió resultados (por ejemplo, si aún no hay libros con likes), se muestra un mensaje informativo.
    echo '
    <section class="top-rated-books">
        <h2>Libros más valorados</h2>
        <p>No hay libros con likes todavía.</p>
    </section>';
}
?>
