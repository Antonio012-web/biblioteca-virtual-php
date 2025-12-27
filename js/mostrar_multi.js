// Espera a que el documento HTML se cargue completamente antes de ejecutar la función callback
document.addEventListener("DOMContentLoaded", function () {
    // Inicializa un objeto para controlar la página actual de cada tipo de contenido (Video, AudioLibro, PDF)
    let currentPage = { 'Video': 1, 'AudioLibro': 1, 'PDF': 1 };
    // Inicializa un objeto para almacenar el total de páginas disponibles para cada tipo de contenido
    let totalPages = { 'Video': 1, 'AudioLibro': 1, 'PDF': 1 };
    // Bandera para indicar si se debe mostrar contenido extendido (más elementos) en lugar de la vista reducida
    let mostrarExtendido = false;

    // Obtiene el elemento del filtro de nivel por su id "filtro-nivel"
    const nivelSelect = document.getElementById('filtro-nivel');
    // Obtiene el elemento del filtro de fecha por su id "filtro-fecha"
    const fechaSelect = document.getElementById('filtro-fecha');
    // Obtiene el elemento del filtro de tipo por su id "filtro-tipo"
    const tipoSelect = document.getElementById('filtro-tipo');
    // Obtiene el elemento de entrada para la búsqueda por su id "filtro-busqueda"
    const busquedaInput = document.getElementById('filtro-busqueda');

    // Función para transformar una URL de Google Drive de compartir a una URL de vista previa
    function getDrivePreviewUrl(url) {
        // Verifica si la URL contiene la cadena "/view"
        if (url.includes("/view")) {
            // Reemplaza "/view" por "/preview" y retorna la nueva URL
            return url.replace("/view", "/preview");
        }
        // Si no contiene "/view", retorna la URL original
        return url;
    }

    // Función para extraer el ID de un video de YouTube a partir de su URL
    function extraerIDYouTube(url) {
        let videoId = ""; // Inicializa una variable vacía para almacenar el ID
        try {
            // Si la URL contiene "youtube.com"
            if (url.includes("youtube.com")) {
                const urlObj = new URL(url); // Crea un objeto URL a partir de la cadena
                videoId = urlObj.searchParams.get("v"); // Extrae el valor del parámetro "v" (ID del video)
            } else if (url.includes("youtu.be")) { // Si la URL es del formato corto de YouTube
                videoId = url.split("youtu.be/")[1]; // Extrae la parte de la URL después de "youtu.be/"
            }
        } catch (e) {
            // Si ocurre algún error, lo imprime en la consola
            console.error("Error extrayendo ID de YouTube:", e);
        }
        // Retorna el ID del video, o una cadena vacía si no se pudo extraer
        return videoId;
    }

    // Función para mostrar u ocultar secciones de contenido según el filtro de tipo seleccionado
    function mostrarSeccionesPorTipo(tipo) {
        // Define un arreglo con los nombres de las secciones permitidas
        const secciones = ['Video', 'AudioLibro', 'PDF'];
        // Itera sobre cada sección en el arreglo
        secciones.forEach(seccion => {
            // Obtiene el contenedor de la sección usando el id formado por el nombre de la sección en minúsculas más "-section"
            const contenedor = document.getElementById(seccion.toLowerCase() + '-section');
            // Si el filtro es "Todos" o está vacío, muestra todas las secciones
            if (tipo === 'Todos' || tipo === '') {
                contenedor.style.display = 'block';
            } else if (tipo === seccion) { // Si el filtro coincide con el nombre de la sección, muestra esa sección
                contenedor.style.display = 'block';
            } else { // De lo contrario, oculta la sección
                contenedor.style.display = 'none';
            }
        });
    }

    // Función para cargar contenido multimedia desde el servidor
    // Parámetros: tipo (Video, AudioLibro, PDF), cantidad (número de elementos a cargar), pagina, append (si se añade al contenido existente)
    function cargarContenido(tipo, cantidad = 5, pagina = 1, append = false) {
        // Obtiene el valor del filtro de nivel o utiliza 'Todos' si no se ha seleccionado nada
        const nivel = nivelSelect ? nivelSelect.value : 'Todos';
        // Obtiene el valor del filtro de fecha o utiliza 'Todos' si no se ha seleccionado nada
        const fecha = fechaSelect ? fechaSelect.value : 'Todos';

        // Verifica que el tipo de contenido sea uno válido
        if (!['Video', 'AudioLibro', 'PDF'].includes(tipo)) {
            console.error(`Tipo no válido: ${tipo}`);
            return;
        }

        // Construye la URL para la petición incluyendo el tipo, cantidad y página
        let url = `mostrar_multi.php?tipo=${tipo}&cantidad=${cantidad}&page=${pagina}`;
        // Si el filtro de nivel no es "Todos", añade el parámetro nivel a la URL
        if (nivel !== 'Todos') { url += `&nivel=${nivel}`; }
        // Si el filtro de fecha no es "Todos", añade el parámetro fecha a la URL
        if (fecha !== 'Todos') { url += `&fecha=${fecha}`; }

        // Realiza la petición fetch a la URL construida
        return fetch(url)
            .then(response => response.json()) // Convierte la respuesta a JSON
            .then(data => {
                // Actualiza el total de páginas para el tipo de contenido en el objeto totalPages
                totalPages[tipo] = data.total_pages;
                // Llama a la función para mostrar el contenido en tarjetas; si append es false, se reemplaza el contenido actual
                mostrarContenido(tipo, data.data, append);
                // Llama a la función que maneja la visibilidad de "Ver más", "Mostrar menos" y la paginación
                manejarVerMasYPaginacion(tipo, data.total_records, cantidad, data.total_pages, pagina);
                // Llama a la función que asigna eventos a las tarjetas para interacción
                aplicarEventosTarjetas();
            })
            .catch(error => console.error('Error al cargar contenido:', error)); // Muestra en consola si ocurre un error
    }

    // Función para renderizar las tarjetas de contenido en el DOM
    // Parámetros: tipo (Video, AudioLibro, PDF), multimedia (datos a mostrar), append (si se añade al contenido existente)
    function mostrarContenido(tipo, multimedia, append = false) {
        // Obtiene el contenedor donde se agregarán las tarjetas, basado en el tipo en minúscula + "-content"
        const contenedor = document.getElementById(tipo.toLowerCase() + '-content');
        // Si no se debe agregar al contenido existente, limpia el contenedor
        if (!append) { contenedor.innerHTML = ''; }
    
        // Itera sobre cada objeto en el arreglo multimedia
        multimedia.forEach(item => {
            // Crea un nuevo elemento div para representar la tarjeta
            const tarjeta = document.createElement('div');
            // Añade la clase "card" al elemento para estilos
            tarjeta.classList.add('card');
            // Define varios atributos de datos en la tarjeta para almacenar información del contenido
            tarjeta.setAttribute('data-tipo', tipo);
            tarjeta.setAttribute('data-titulo', item.titulo);
            tarjeta.setAttribute('data-descripcion', item.descripcion);
            tarjeta.setAttribute('data-autor', item.autor);
            tarjeta.setAttribute('data-etiquetas', item.etiquetas);
            tarjeta.setAttribute('data-nivel', item.nivel_educativo);
            tarjeta.setAttribute('data-url', item.url);
    
            // Inicialmente, establece la opacidad de la tarjeta a 0 (invisible)
            tarjeta.style.opacity = 0;
            // Define una transición suave para la opacidad en 0.5 segundos
            tarjeta.style.transition = "opacity 0.5s ease-in-out";
    
            // Inicializa variables para la imagen de portada y el contenido HTML que se mostrará en la tarjeta
            let imagenPortada = "";
            let contenidoTarjeta = "";
    
            // Si el tipo de contenido es "Video"
            if (tipo === "Video") {
                // Define una imagen por defecto para videos
                imagenPortada = "img/default_video.gif";
                // Construye el contenido HTML que incluye la imagen, título, autor y fecha de publicación
                contenidoTarjeta = `
                    <img src="${imagenPortada}" onerror="this.onerror=null; this.src='img/default_video.gif';" alt="${item.titulo}" class="cover-image">
                    <h3>${item.titulo}</h3>
                    <p><strong>Autor:</strong> ${item.autor}</p>
                    <p><strong>Publicado:</strong> ${item.fecha_publicacion}</p>
                `;
            } else if (tipo === "AudioLibro") { // Si el tipo es "AudioLibro"
                // Define una imagen por defecto para audiolibros
                imagenPortada = "img/default_audio.gif";
                // Construye el contenido HTML para audiolibros
                contenidoTarjeta = `
                    <img src="${imagenPortada}" onerror="this.onerror=null; this.src='img/default_audio.gif';" alt="${item.titulo}" class="cover-image">
                    <h3>${item.titulo}</h3>
                    <p><strong>Autor:</strong> ${item.autor}</p>
                    <p><strong>Publicado:</strong> ${item.fecha_publicacion}</p>
                `;
            } else if (tipo === "PDF") { // Si el tipo es "PDF"
                // Define una imagen por defecto para archivos PDF
                imagenPortada = "img/default_pdf.gif";
                // Construye el contenido HTML para PDFs
                contenidoTarjeta = `
                    <img src="${imagenPortada}" onerror="this.onerror=null; this.src='img/default_pdf.gif';" alt="${item.titulo}" class="cover-image">
                    <h3>${item.titulo}</h3>
                    <p><strong>Autor:</strong> ${item.autor}</p>
                    <p><strong>Publicado:</strong> ${item.fecha_publicacion}</p>
                `;
            }
    
            // Asigna el contenido HTML construido al interior de la tarjeta
            tarjeta.innerHTML = contenidoTarjeta;
            // Agrega la tarjeta al contenedor de contenido multimedia
            contenedor.appendChild(tarjeta);
            // Utiliza un temporizador para cambiar la opacidad a 1 (efecto fade-in) después de 100ms
            setTimeout(() => { tarjeta.style.opacity = 1; }, 100);
        });
        // Llama a la función que aplica eventos a las tarjetas (por ejemplo, abrir un modal al hacer clic)
        aplicarEventosTarjetas();
    }
    
    // Función para filtrar las tarjetas en tiempo real según el término de búsqueda ingresado
    function filtrarContenidoBusqueda() {
        // Convierte el valor del input de búsqueda a minúsculas para comparación insensible a mayúsculas/minúsculas
        const query = busquedaInput.value.toLowerCase();
        // Selecciona todas las tarjetas con la clase "card"
        const tarjetas = document.querySelectorAll('.card');
        // Para cada tarjeta...
        tarjetas.forEach(tarjeta => {
            // Obtiene el título almacenado en el atributo data-titulo y lo convierte a minúsculas
            const titulo = tarjeta.getAttribute('data-titulo').toLowerCase();
            // Obtiene el autor almacenado en el atributo data-autor y lo convierte a minúsculas
            const autor = tarjeta.getAttribute('data-autor').toLowerCase();
            // Si el título o el autor incluyen el término de búsqueda, se muestra la tarjeta; de lo contrario, se oculta
            tarjeta.style.display = (titulo.includes(query) || autor.includes(query)) ? 'block' : 'none';
        });
    }
    // Asigna el evento 'input' al campo de búsqueda para que se ejecute el filtrado en tiempo real
    busquedaInput.addEventListener('input', filtrarContenidoBusqueda);

    // Función para manejar la visibilidad de botones "Ver más", "Mostrar menos" y la paginación según el estado de mostrarExtendido
    function manejarVerMasYPaginacion(tipo, totalRecords, cantidad, totalPages, currentPage) {
        // Obtiene el botón "Ver más" para el tipo de contenido (id basado en el tipo en minúsculas)
        const botonVerMas = document.getElementById('ver-mas-' + tipo.toLowerCase());
        // Obtiene el botón "Mostrar menos" para el tipo de contenido
        const botonMostrarMenos = document.getElementById('mostrar-menos-' + tipo.toLowerCase());
        // Obtiene el contenedor de paginación para el tipo de contenido
        const paginacion = document.getElementById(tipo.toLowerCase() + '-pagination');

        // Si el total de registros es menor o igual a 5, oculta el botón "Ver más"; de lo contrario, lo muestra
        botonVerMas.style.display = (totalRecords <= 5) ? 'none' : 'block';

        // Si se debe mostrar contenido extendido (mostrarExtendido es true)
        if (mostrarExtendido) {
            botonVerMas.style.display = 'none'; // Oculta el botón "Ver más"
            botonMostrarMenos.style.display = 'block'; // Muestra el botón "Mostrar menos"
            // Si hay más de una página de contenido, muestra el contenedor de paginación y actualiza sus botones
            if (totalPages > 1) {
                paginacion.style.display = 'block';
                actualizarPaginacion(tipo, totalPages, currentPage);
            }
        } else {
            // Si no se está mostrando contenido extendido, oculta el botón "Mostrar menos" y el contenedor de paginación
            botonMostrarMenos.style.display = 'none';
            paginacion.style.display = 'none';
        }
    }

    // Función para actualizar la paginación (botones de navegación) para un tipo de contenido específico
    function actualizarPaginacion(tipo, totalPages, currentPage) {
        // Obtiene el contenedor de paginación para el tipo, basado en el id
        const paginacion = document.getElementById(tipo.toLowerCase() + '-pagination');
        // Limpia el contenido actual del contenedor de paginación
        paginacion.innerHTML = '';

        // Crea el botón "Primera" para ir a la primera página
        const btnPrimera = document.createElement('button');
        btnPrimera.textContent = 'Primera'; // Establece el texto del botón
        // Deshabilita el botón si ya se encuentra en la primera página
        btnPrimera.disabled = currentPage === 1;
        // Asigna un evento para cargar la primera página al hacer clic
        btnPrimera.addEventListener('click', () => { cargarContenido(tipo, 10, 1); });
        // Agrega el botón al contenedor de paginación
        paginacion.appendChild(btnPrimera);

        // Crea el botón "Anterior" para ir a la página anterior
        const btnAnterior = document.createElement('button');
        btnAnterior.textContent = 'Anterior';
        btnAnterior.disabled = currentPage === 1; // Deshabilita si ya se está en la primera página
        // Asigna un evento para cargar la página anterior al hacer clic
        btnAnterior.addEventListener('click', () => {
            if (currentPage > 1) { cargarContenido(tipo, 10, currentPage - 1); }
        });
        paginacion.appendChild(btnAnterior);

        // Crea un elemento <span> para mostrar el estado actual de la paginación (página actual de total de páginas)
        const spanPagina = document.createElement('span');
        spanPagina.textContent = `Página ${currentPage} de ${totalPages}`;
        paginacion.appendChild(spanPagina);

        // Crea el botón "Siguiente" para avanzar a la página siguiente
        const btnSiguiente = document.createElement('button');
        btnSiguiente.textContent = 'Siguiente';
        btnSiguiente.disabled = currentPage === totalPages; // Deshabilita si ya está en la última página
        // Asigna un evento para cargar la siguiente página al hacer clic
        btnSiguiente.addEventListener('click', () => {
            if (currentPage < totalPages) { cargarContenido(tipo, 10, currentPage + 1); }
        });
        paginacion.appendChild(btnSiguiente);

        // Crea el botón "Última" para ir a la última página
        const btnUltima = document.createElement('button');
        btnUltima.textContent = 'Última';
        btnUltima.disabled = currentPage === totalPages; // Deshabilita si ya se encuentra en la última página
        // Asigna un evento para cargar la última página al hacer clic
        btnUltima.addEventListener('click', () => { cargarContenido(tipo, 10, totalPages); });
        paginacion.appendChild(btnUltima);
    }

    // Función para realizar un scroll suave hasta una sección específica identificada por su id
    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId); // Obtiene la sección del DOM mediante su id
        if (section) {
            // Llama al método scrollIntoView con opciones para un scroll suave y alineación al inicio
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Inicializa la carga de contenido multimedia para cada tipo: Video, AudioLibro y PDF, mostrando 5 elementos cada uno
    cargarContenido('Video', 5);
    cargarContenido('AudioLibro', 5);
    cargarContenido('PDF', 5);

    // Asigna un evento "click" al botón "Ver más" de la sección de Video
    document.getElementById('ver-mas-video').addEventListener('click', function () {
        mostrarExtendido = true; // Activa el modo extendido para mostrar más contenido
        cargarContenido('Video', 10); // Carga 10 elementos de video
    });
    // Asigna un evento "click" al botón "Mostrar menos" de la sección de Video
    document.getElementById('mostrar-menos-video').addEventListener('click', function () {
        mostrarExtendido = false; // Desactiva el modo extendido
        cargarContenido('Video', 5); // Carga 5 elementos de video
        scrollToSection('video-section'); // Realiza un scroll suave hasta la sección de video
    });
    // Asigna un evento "click" al botón "Ver más" de la sección de AudioLibro
    document.getElementById('ver-mas-audiolibro').addEventListener('click', function () {
        mostrarExtendido = true; // Activa el modo extendido para audiolibros
        cargarContenido('AudioLibro', 10); // Carga 10 elementos de audiolibro
    });
    // Asigna un evento "click" al botón "Mostrar menos" de la sección de AudioLibro
    document.getElementById('mostrar-menos-audiolibro').addEventListener('click', function () {
        mostrarExtendido = false; // Desactiva el modo extendido para audiolibro
        cargarContenido('AudioLibro', 5); // Carga 5 elementos de audiolibro
        scrollToSection('audiolibro-section'); // Realiza scroll hasta la sección de audiolibro
    });
    // Asigna un evento "click" al botón "Ver más" de la sección de PDF
    document.getElementById('ver-mas-pdf').addEventListener('click', function () {
        mostrarExtendido = true; // Activa el modo extendido para PDFs
        cargarContenido('PDF', 10); // Carga 10 elementos de PDF
    });
    // Asigna un evento "click" al botón "Mostrar menos" de la sección de PDF
    document.getElementById('mostrar-menos-pdf').addEventListener('click', function () {
        mostrarExtendido = false; // Desactiva el modo extendido para PDF
        cargarContenido('PDF', 5); // Carga 5 elementos de PDF
        scrollToSection('pdf-section'); // Realiza scroll hasta la sección de PDF
    });

    // Asigna el evento "change" al filtro de nivel para recargar el contenido cuando cambia
    document.getElementById('filtro-nivel').addEventListener('change', recargarContenido);
    // Asigna el evento "change" al filtro de fecha para recargar el contenido cuando cambia
    document.getElementById('filtro-fecha').addEventListener('change', recargarContenido);
    // Asigna el evento "change" al filtro de tipo; al cambiar, muestra u oculta secciones y recarga contenido
    document.getElementById('filtro-tipo').addEventListener('change', function () {
        const tipoSeleccionado = tipoSelect.value; // Obtiene el tipo seleccionado
        mostrarSeccionesPorTipo(tipoSeleccionado); // Muestra las secciones correspondientes al tipo seleccionado
        recargarContenido(); // Recarga el contenido en función de los filtros
    });

    // Función para recargar el contenido según los filtros actualmente seleccionados
    function recargarContenido() {
        // Obtiene el valor del filtro de tipo o utiliza una cadena vacía si no está definido
        const tipoSeleccionado = tipoSelect ? tipoSelect.value : '';
        // Obtiene el valor del filtro de nivel o utiliza 'Todos' por defecto
        const nivelSeleccionado = nivelSelect ? nivelSelect.value : 'Todos';
        // Obtiene el valor del filtro de fecha o utiliza 'Todos' por defecto
        const fechaSeleccionada = fechaSelect ? fechaSelect.value : 'Todos';

        // Si no se ha seleccionado un tipo específico o se ha seleccionado "Todos"
        if (tipoSeleccionado === '' || tipoSeleccionado === 'Todos') {
            mostrarSeccionesPorTipo('Todos'); // Muestra todas las secciones
            cargarContenido('Video', 5); // Carga contenido de Video (5 elementos)
            cargarContenido('AudioLibro', 5); // Carga contenido de AudioLibro (5 elementos)
            cargarContenido('PDF', 5); // Carga contenido de PDF (5 elementos)
        } else {
            // Si se ha seleccionado un tipo específico, carga solo ese tipo de contenido
            cargarContenido(tipoSeleccionado, 5);
        }

        // Si el filtro de nivel o fecha está activo (diferente de "Todos"), recarga todos los tipos de contenido
        if (nivelSeleccionado !== 'Todos' || fechaSeleccionada !== 'Todos') {
            cargarContenido('Video', 5);
            cargarContenido('AudioLibro', 5);
            cargarContenido('PDF', 5);
        }
    }

    // Función para abrir un modal y mostrar contenido personalizado
    function abrirModal(contenido) {
        // Obtiene el elemento modal por su id "modal"
        const modal = document.getElementById("modal");
        // Obtiene el cuerpo del modal donde se insertará el contenido
        const modalBody = document.getElementById("modal-body");
        // Inserta el contenido recibido en el cuerpo del modal
        modalBody.innerHTML = contenido;
        // Muestra el modal estableciendo su display a "flex"
        modal.style.display = "flex";
        // Desactiva el scroll del body para evitar desplazamiento mientras el modal está abierto
        document.body.style.overflow = "hidden";
    }
    // Obtiene el primer elemento con la clase "close", que actuará como botón para cerrar el modal
    const closeModal = document.getElementsByClassName("close")[0];
    // Asigna una función al evento onclick del botón de cierre del modal
    closeModal.onclick = function () {
        // Obtiene el modal por su id "modal"
        const modal = document.getElementById("modal");
        // Oculta el modal estableciendo su display a "none"
        modal.style.display = "none";
        // Limpia el contenido del cuerpo del modal
        document.getElementById("modal-body").innerHTML = "";
        // Restaura el scroll del body
        document.body.style.overflow = "auto";
    };

    // Función para aplicar eventos a las tarjetas (cards) para abrir el modal al hacer clic
    function aplicarEventosTarjetas() {
        // Selecciona todas las tarjetas con la clase "card"
        document.querySelectorAll(".card").forEach(card => {
            // Asigna un evento "click" a cada tarjeta
            card.addEventListener("click", function () {
                // Obtiene el tipo de contenido almacenado en el atributo data-tipo
                const tipo = this.getAttribute("data-tipo");
                // Obtiene el título de la tarjeta desde data-titulo
                const titulo = this.getAttribute("data-titulo");
                // Obtiene la descripción desde data-descripcion
                const descripcion = this.getAttribute("data-descripcion");
                // Obtiene el autor desde data-autor
                const autor = this.getAttribute("data-autor");
                // Obtiene las etiquetas desde data-etiquetas
                const etiquetas = this.getAttribute("data-etiquetas");
                // Obtiene el nivel educativo desde data-nivel
                const nivel = this.getAttribute("data-nivel");
                // Obtiene la URL del contenido desde data-url
                let url = this.getAttribute("data-url");
                // Inicializa una variable para almacenar el contenido HTML que se mostrará en el modal
                let contenidoModal = "";

                // Si el tipo de contenido es "Video"
                if (tipo === "Video") {
                    // Verifica si la URL proviene de Google Drive
                    if (url.includes("drive.google.com")) {
                        // Transforma la URL de compartir a una URL de vista previa
                        url = getDrivePreviewUrl(url);
                        // Construye el contenido HTML para el modal usando un iframe para video de Google Drive
                        contenidoModal = `
                            <h2>${titulo}</h2>
                            <iframe width="100%" height="360" 
                                src="${url}" frameborder="0" allow="autoplay"></iframe>
                            <p><strong>Descripción:</strong> ${descripcion}</p>
                            <p><strong>Autor:</strong> ${autor}</p>
                            <p><strong>Etiquetas:</strong> ${etiquetas}</p>
                            <p><strong>Nivel Educativo:</strong> ${nivel}</p>
                        `;
                    } else {
                        // Si la URL no es de Google Drive, usa un elemento video para reproducir el contenido
                        contenidoModal = `
                            <h2>${titulo}</h2>
                            <video controls src="${url}" style="width:100%;"></video>
                            <p><strong>Descripción:</strong> ${descripcion}</p>
                            <p><strong>Autor:</strong> ${autor}</p>
                            <p><strong>Etiquetas:</strong> ${etiquetas}</p>
                            <p><strong>Nivel Educativo:</strong> ${nivel}</p>
                        `;
                    }
                } else if (tipo === "AudioLibro") { // Si el contenido es de tipo "AudioLibro"
                    // Si la URL es de Google Drive, la transforma a vista previa
                    if (url.includes("drive.google.com")) {
                        url = getDrivePreviewUrl(url);
                        // Construye el contenido HTML para audiolibros usando un iframe
                        contenidoModal = `
                            <h2>${titulo}</h2>
                            <iframe width="100%" height="160" 
                                src="${url}" frameborder="0" allow="autoplay"></iframe>
                            <p><strong>Descripción:</strong> ${descripcion}</p>
                            <p><strong>Autor:</strong> ${autor}</p>
                            <p><strong>Etiquetas:</strong> ${etiquetas}</p>
                            <p><strong>Nivel Educativo:</strong> ${nivel}</p>
                        `;
                    } else {
                        // Si no es de Google Drive, usa un elemento audio para reproducir el contenido
                        contenidoModal = `
                            <h2>${titulo}</h2>
                            <audio controls src="${url}" style="width:100%;"></audio>
                            <p><strong>Descripción:</strong> ${descripcion}</p>
                            <p><strong>Autor:</strong> ${autor}</p>
                            <p><strong>Etiquetas:</strong> ${etiquetas}</p>
                            <p><strong>Nivel Educativo:</strong> ${nivel}</p>
                        `;
                    }
                } else if (tipo === "PDF") { // Si el contenido es de tipo "PDF"
                    // Si la URL proviene de Google Drive, la transforma a vista previa
                    if (url.includes("drive.google.com")) {
                        url = getDrivePreviewUrl(url);
                    }
                    // Construye el contenido HTML para PDFs utilizando un iframe
                    contenidoModal = `
                        <h2>${titulo}</h2>
                        <iframe id="pdf-frame" src="${url}" style="width:100%; height:500px;" frameborder="0"></iframe>
                        <p><strong>Descripción:</strong> ${descripcion}</p>
                        <p><strong>Autor:</strong> ${autor}</p>
                        <p><strong>Etiquetas:</strong> ${etiquetas}</p>
                        <p><strong>Nivel Educativo:</strong> ${nivel}</p>
                    `;
                } else {
                    // Si el tipo de contenido no coincide con ninguno de los esperados, muestra un mensaje de error
                    contenidoModal = "<p>Error: Tipo de contenido no reconocido.</p>";
                }
                // Llama a la función abrirModal pasando el contenido HTML para que se muestre en un modal
                abrirModal(contenidoModal);
            });
        });
    }
    // Aplica los eventos de clic a todas las tarjetas actualmente presentes en el DOM
    aplicarEventosTarjetas();
});
