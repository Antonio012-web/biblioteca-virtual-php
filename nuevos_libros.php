<?php
// Se incluye el archivo de configuración que establece la conexión a la base de datos.
// Asegúrate de que la ruta al archivo 'config.php' sea la correcta según la estructura de tu proyecto.
include('config.php'); // Ajusta la ruta según tu proyecto

// Se define la consulta SQL para obtener los 5 libros más nuevos de la tabla 'libros'.
// La consulta selecciona las columnas clave: id, título, autor, categoría, imagen de la portada y año de publicación.
// El uso de "ORDER BY l.añoPublicacion DESC" asegura que los libros se ordenen de forma descendente, mostrando primero los más recientes.
// La cláusula "LIMIT 5" restringe el resultado a un máximo de 5 registros.
$query = "
    SELECT l.id,
           l.titulo,
           l.autor,
           l.categoria,
           l.imagen_libro,
           l.añoPublicacion
    FROM libros l
    ORDER BY l.añoPublicacion DESC
    LIMIT 5
";

// Se ejecuta la consulta SQL utilizando la función mysqli_query.
// Se le pasa la conexión ($conn) y la consulta ($query) como parámetros.
// El resultado se almacena en la variable $result, la cual será un objeto de resultados o false si ocurre un error.
$result = mysqli_query($conn, $query);

// Se verifica que la consulta se haya ejecutado correctamente y que se hayan obtenido registros.
// La función mysqli_num_rows($result) devuelve el número de filas en el resultado.
// Si $result es verdadero y tiene al menos una fila, se procede a generar la salida HTML.
if ($result && mysqli_num_rows($result) > 0) {
    // Se inicia la generación de la salida HTML para mostrar los libros recién agregados.
    // Se utiliza una etiqueta <section> con clases "new-books" y "swiper-new".
    // La clase "swiper-new" permite diferenciar este carrusel de otros (por ejemplo, "Libros más valorados").
    echo '
    <section class="new-books swiper-new">
      <h2>Libros recién agregados</h2>
      <div class="swiper-wrapper">
    ';

    // Se inicializa un contador ($i) para llevar registro del número de libros mostrados.
    $i = 0;
    
    // Se recorre el objeto $result fila por fila utilizando un bucle while.
    // La función mysqli_fetch_assoc($result) extrae cada fila como un arreglo asociativo,
    // donde las claves corresponden a los nombres de las columnas en la base de datos.
    while ($row = mysqli_fetch_assoc($result)) {
      $i++; // Incrementa el contador por cada libro procesado.
      
      // Se crea un contenedor <div> para cada libro con las clases "swiper-slide" y "book-item".
      // Esto integra cada libro como una diapositiva en el carrusel de Swiper.
      echo '<div class="swiper-slide book-item">';
      
        // Se crea un contenedor para la portada del libro con la clase "book-cover".
        // Se establece "position: relative" para permitir la colocación de elementos adicionales (por ejemplo, la etiqueta "Nuevo").
        echo '<div class="book-cover" style="position: relative;">';
          
          // Si el contador $i es menor o igual a 5, se muestra una etiqueta "Nuevo".
          // Esto resalta que el libro es reciente, ya que estamos mostrando solo 5 libros.
          if ($i <= 5) {
            echo '<span class="new-badge">Nuevo</span>';
          } 
          
          // Se genera el elemento <img> para mostrar la imagen de la portada del libro.
          // La URL de la imagen se obtiene del campo 'imagen_libro' del registro.
          // El atributo alt se utiliza para describir la imagen en caso de que no se pueda cargar.
          echo '<img src="' . $row['imagen_libro'] . '" alt="Portada" />';
        echo '</div>'; // Fin del contenedor de la portada
      
        // Se crea un contenedor <div> para la información del libro con la clase "book-info".
        echo '<div class="book-info">';
          // Se muestra el título del libro dentro de una etiqueta <h3>.
          echo '<h3>' . $row['titulo'] . '</h3>';
          // Se muestra el autor del libro en un párrafo (<p>) con la clase "book-meta".
          // Se utiliza la etiqueta <strong> para resaltar la palabra "Autor:".
          echo '<p class="book-meta"><strong>Autor:</strong> ' . $row['autor'] . '</p>';
          // Se muestra la categoría del libro, utilizando un formato similar.
          echo '<p class="book-meta"><strong>Categoría:</strong> ' . $row['categoria'] . '</p>';
          // Se muestra el año de publicación del libro, resaltado también con un <strong> para la etiqueta "Fecha:".
          echo '<p class="book-meta"><strong>Fecha:</strong> ' . $row['añoPublicacion'] . '</p>';
        echo '</div>'; // Fin del contenedor de información del libro
      
      // Se cierra el contenedor de la diapositiva para el libro actual.
      echo '</div>'; // fin swiper-slide
    }

    // Se cierra el contenedor "swiper-wrapper" que agrupa todas las diapositivas.
    echo '
      </div> <!-- fin swiper-wrapper -->

      <!-- Flechas de navegación (opcional): permiten al usuario avanzar o retroceder entre las diapositivas -->
      <div class="swiper-button-next"></div>
      <div class="swiper-button-prev"></div>
      
      <!-- Paginación (opcional): permite visualizar la posición actual dentro del carrusel -->
       <!-- <div class="swiper-pagination"></div> -->
    </section>';
} else {
    // Si no se encontraron libros o la consulta no devolvió ningún resultado, se muestra un mensaje alternativo.
    // Se utiliza una sección simple para informar que no hay libros o que no se han registrado las fechas.
    echo '
    <section class="new-books">
      <h2>Libros recién agregados</h2>
      <p>No hay libros o aún no se han registrado las fechas.</p>
    </section>';
}
?> 
