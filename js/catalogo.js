// Espera a que el documento se cargue completamente para asegurar que todos los elementos HTML estén disponibles antes de ejecutar cualquier script
document.addEventListener('DOMContentLoaded', () => {

    // ====================================================
    // === Obtención de elementos del DOM para los modales, visor de PDF y botones de cierre ===
    // ====================================================
    const modalVerDetalles = document.getElementById("modalVerDetalles"); // Modal para ver los detalles de un libro
    const modalReservar = document.getElementById("modalReservar"); // Modal para realizar la reserva de un libro
    const modalVerPDF = document.getElementById("modalVerPDF"); // Modal que contiene el visor de PDF para leer el libro
    const pdfViewer = document.getElementById("pdfViewer"); // IFrame o elemento que muestra el PDF embebido
    const closeButtons = document.querySelectorAll(".close"); // Todos los botones con clase "close" para cerrar los modales

    // ====================================================
    // === Elementos que muestran los detalles del libro seleccionado ===
    // ====================================================
    const detalleImagen = document.getElementById("detalleImagen"); // Imagen del libro
    const detalleTitulo = document.getElementById("detalleTitulo"); // Título del libro
    const detalleAutor = document.getElementById("detalleAutor"); // Autor del libro
    const detalleCategoria = document.getElementById("detalleCategoria"); // Categoría del libro
    const detalleFecha = document.getElementById("detalleFecha"); // Fecha o año de publicación
    const detalleDescripcion = document.getElementById("detalleDescripcion"); // Descripción breve del libro
    const detalleDisponibilidad = document.getElementById("detalleDisponibilidad"); // Información sobre la disponibilidad del libro

    // ====================================================
    // === Elementos del formulario de reserva ===
    // ====================================================
    const formReservar = document.getElementById("formReservar"); // Formulario que se utiliza para realizar la reserva del libro
    const nombreEstudiante = document.getElementById("nombreEstudiante"); // Campo donde se ingresa el nombre del estudiante
    const tituloLibro = document.getElementById("tituloLibro"); // Campo que muestra el título del libro seleccionado (de solo lectura)
    const idLibroInput = document.getElementById("idLibro"); // Campo oculto o de solo lectura para almacenar el ID del libro
    const password = document.getElementById("password"); // Campo de contraseña para autenticar la reserva
    const csrfToken = document.getElementById("csrfToken"); // Token CSRF para prevenir ataques de falsificación de solicitudes

    // ====================================================
    // === Variables de control para inactividad, reserva y seguimiento de lectura ===
    // ====================================================
    let inactivityTimeout; // Referencia al temporizador para detectar inactividad
    let isInactividadHandled = false; // Indicador para saber si la inactividad ya fue gestionada
    let reservaRealizada = false; // Bandera que indica si la reserva ya se realizó
    let idUsuario; // Almacenará el ID del usuario tras realizar una reserva o iniciar sesión
    let idLibro; // Almacenará el ID del libro en curso (para lectura, descarga, etc.)
    let checkInterval; // Intervalo para realizar verificaciones periódicas (por ejemplo, para actualizar el estado de reserva)

    let fechaInicioLectura; // Variable global para almacenar la fecha y hora en que se inicia la lectura del libro

    // ====================================================
    // === Función: Obtener la fecha y hora local en formato "YYYY-MM-DD HH:MM:SS" ===
    // ====================================================
    function getLocalDateTimeString() {
        const now = new Date(); // Obtiene el momento actual
        const year = now.getFullYear(); // Año actual en 4 dígitos
        const month = ('0' + (now.getMonth() + 1)).slice(-2); // Mes actual con dos dígitos (se suma 1 ya que getMonth() inicia en 0)
        const day = ('0' + now.getDate()).slice(-2); // Día actual con dos dígitos
        const hours = ('0' + now.getHours()).slice(-2); // Hora actual en formato 24 horas con dos dígitos
        const minutes = ('0' + now.getMinutes()).slice(-2); // Minutos actuales con dos dígitos
        const seconds = ('0' + now.getSeconds()).slice(-2); // Segundos actuales con dos dígitos
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // Retorna la fecha y hora formateada
    }

    // ====================================================
    // === Validación del nombre del estudiante utilizando una expresión regular ===
    // ====================================================
    // La expresión exige que el nombre inicie con una letra mayúscula (incluyendo letras acentuadas) seguido de minúsculas.
    // Permite nombres compuestos separados por espacio o guion.
    const nombreRegex = /^[A-ZÑÁÉÍÓÚÜ][a-zñáéíóúü]+(?:[\s-][A-ZÑÁÉÍÓÚÜ][a-zñáéíóúü]+)*$/;

    // ====================================================
    // === Función: Validar los campos del formulario de reserva ===
    // ====================================================
    function validateForm() {
        // Verifica que el nombre del estudiante no esté vacío
        if (!nombreEstudiante.value.trim()) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'El nombre del estudiante es obligatorio.' });
            return false;
        }
        // Verifica que el nombre cumpla con el formato definido en la expresión regular
        if (!nombreRegex.test(nombreEstudiante.value.trim())) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'El nombre del estudiante no es válido. Debe comenzar con una mayúscula y cada palabra debe contener al menos una vocal.' });
            return false;
        }
        // Verifica que la contraseña no esté vacía
        if (!password.value.trim()) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'La contraseña es obligatoria.' });
            return false;
        }
        return true; // Si todas las validaciones pasan, retorna true
    }

    // ====================================================
    // === Función asíncrona: Obtener el ID del usuario mediante la reserva del libro ===
    // ====================================================
    async function getUserIdByReserva(idLibro) {
        try {
            // Se realiza una petición al servidor para obtener detalles de la reserva, incluyendo el ID del usuario
            const response = await fetch(`reservas_libros.php?action=detalles&id=${idLibro}`);
            const data = await response.json(); // Se convierte la respuesta a JSON
            return data.idUsuario || null; // Retorna el ID de usuario o null si no se encuentra
        } catch (error) {
            console.error('Error al obtener el ID del usuario:', error);
            return null; // En caso de error, retorna null
        }
    }

    // ====================================================
    // === Función: Reiniciar el formulario de reserva ===
    // ====================================================
    // Limpia los campos del formulario y restablece los valores relacionados
    function resetReservarForm() {
        formReservar.reset(); // Reinicia todos los campos del formulario
        tituloLibro.value = ''; // Limpia el campo del título del libro
        idLibroInput.value = ''; // Limpia el campo del ID del libro
    }

    // ====================================================
    // === Función asíncrona: Abrir el visor de PDF y registrar el inicio de la lectura ===
    // ====================================================
    async function openPdf(url, idLibroParam) {
        // Asigna la fecha y hora de inicio de lectura
        fechaInicioLectura = getLocalDateTimeString();
        idLibro = idLibroParam; // Actualiza la variable global del ID del libro
        // Obtiene el ID del usuario asociado a la reserva del libro
        idUsuario = await getUserIdByReserva(idLibro);
        if (idUsuario) {
            // Construye la URL para embeber el PDF usando el visor de Google
            const viewerUrl = `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(url)}`;
            pdfViewer.src = viewerUrl; // Asigna la URL embebida al visor
            try {
                // Envía una petición POST para registrar el inicio de la lectura en el servidor
                const response = await fetch('reservas_libros.php?action=insert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `idUsuario=${idUsuario}&idLibro=${idLibro}&fechaInicioLectura=${encodeURIComponent(fechaInicioLectura)}&csrfToken=${csrfToken.value}`
                });
                const data = await response.json(); // Procesa la respuesta del servidor
                if (data.error) {
                    // Si hay error, muestra un mensaje y cierra el modal de PDF
                    Swal.fire({ icon: 'error', title: 'Error', text: data.error });
                    modalVerPDF.style.display = "none";
                    pdfViewer.src = '';
                } else {
                    // Si no hay error, muestra el modal del visor de PDF
                    modalVerPDF.style.display = "flex";
                }
            } catch (error) {
                // Manejo de errores en caso de fallo en la petición
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al registrar el inicio de la lectura' });
                modalVerPDF.style.display = "none";
                pdfViewer.src = '';
            }
        } else {
            // Si el usuario no tiene reserva, informa que es necesaria la reserva para leer o descargar
            Swal.fire({ icon: 'info', title: 'Información', text: 'Para Leer o Descargar un libro, debes realizar la Reserva.' });
            pdfViewer.src = '';
            modalVerPDF.style.display = "none";
        }
    }

    // ====================================================
    // === Función: Cerrar todos los modales abiertos y registrar el fin de la lectura (si se cierra el visor PDF) ===
    // ====================================================
    function closeModals() {
        modalVerDetalles.style.display = "none"; // Cierra el modal de detalles
        modalReservar.style.display = "none"; // Cierra el modal de reserva
        if (modalVerPDF.style.display === "flex") {
            // Si el modal del PDF está abierto, se procede a cerrar y registrar el fin de la lectura
            modalVerPDF.style.display = "none";
            // Se obtiene la fecha y hora en que se cierra el visor (fin de lectura)
            let fechaFinLectura = getLocalDateTimeString();
            // Calcula el tiempo de lectura en minutos
            let tiempoLectura = Math.round((new Date(fechaFinLectura) - new Date(fechaInicioLectura)) / 60000);
            if (idUsuario) {
                // Envía la información al servidor para registrar el fin de la lectura
                fetch('reservas_libros.php?action=update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `idUsuario=${idUsuario}&idLibro=${idLibro}&fechaFinLectura=${encodeURIComponent(fechaFinLectura)}&tiempoLectura=${tiempoLectura}&csrfToken=${csrfToken.value}`
                })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        // Muestra mensaje de error si el servidor devuelve algún problema
                        Swal.fire({ icon: 'error', title: 'Error', text: data.error });
                    }
                })
                .catch(error => {
                    // Maneja errores en la actualización del fin de la lectura
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Error al registrar el fin de la lectura' });
                });
            }
        }
        // Limpia el visor de PDF para evitar que se mantenga la última imagen cargada
        pdfViewer.src = '';
    }

    // ====================================================
    // === Función: Asignar eventos de cierre a los modales ===
    // ====================================================
    function attachModalCloseEventListeners() {
        // Asigna el evento 'click' a cada botón de cierre para llamar a closeModals()
        closeButtons.forEach(button => { button.addEventListener('click', closeModals); });
        // También cierra los modales si se hace clic fuera del contenido del modal (en el fondo)
        window.addEventListener('click', (event) => {
            if (event.target === modalVerDetalles || event.target === modalReservar || event.target === modalVerPDF) {
                closeModals();
            }
        });
    }

    // ====================================================
    // === Función: Obtener detalles de un libro desde el servidor ===
    // ====================================================
    // Recibe un ID y una función callback para procesar la respuesta
    function fetchBookDetails(id, callback) {
        fetch(`reservas_libros.php?action=detalles&id=${id}`)
            .then(response => response.json())
            .then(data => { callback(data); })
            .catch(error => {
                console.error('Error al obtener los detalles del libro:', error);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al obtener los detalles del libro' });
            });
    }

    // ====================================================
    // === Función asíncrona: Actualizar los iconos de "me gusta" y comentarios según el estado de la reserva ===
    // ====================================================
    async function updateLikeAndCommentIcons(bookCard, idLibro, reservaConfirmada) {
        const likeIcon = bookCard.querySelector('.like-icon'); // Icono para "me gusta"
        const commentIcon = bookCard.querySelector('.comment-icon'); // Icono para comentarios
        const likeCounter = bookCard.querySelector('.like-counter'); // Elemento que muestra el número de "me gusta"
        try {
            // Se envía una petición para verificar la reserva y obtener el número total de "me gusta"
            const response = await fetch(`reservas_libros.php?action=check_reserva`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `idLibro=${idLibro}`
            });
            const data = await response.json();
            // Actualiza el contador de "me gusta" si la respuesta lo provee
            if (data.totalLikes !== undefined) {
                likeCounter.textContent = data.totalLikes;
            }
            // Habilita o deshabilita los iconos dependiendo de si la reserva fue confirmada
            if (reservaConfirmada) {
                likeIcon.classList.remove('disabled');
                likeIcon.setAttribute('title', 'Puedes dar "Me gusta"');
                commentIcon.classList.remove('disabled');
                commentIcon.setAttribute('title', 'Puedes comentar este libro');
            } else {
                likeIcon.classList.add('disabled');
                likeIcon.setAttribute('title', 'Debes reservar el libro para dar me gusta');
                commentIcon.classList.add('disabled');
                commentIcon.setAttribute('title', 'Debes reservar el libro para comentar');
            }
        } catch (error) {
            console.error('Error al verificar la reserva o actualizar los iconos:', error);
        }
    }

    // ====================================================
    // === Función asíncrona: Verificar el estado de "me gusta" y comentarios para todas las tarjetas de libro ===
    // ====================================================
    async function checkLikeAndCommentStatus() {
        // Selecciona todas las tarjetas de libros disponibles en la interfaz
        const bookCards = document.querySelectorAll('.book-card');
        // Para cada tarjeta, obtiene el ID del libro y verifica si existe una reserva asociada
        bookCards.forEach(async (bookCard) => {
            const idLibro = bookCard.getAttribute('data-id');
            const reservaConfirmada = await getUserIdByReserva(idLibro);
            updateLikeAndCommentIcons(bookCard, idLibro, !!reservaConfirmada);
        });
    }

    // ====================================================
    // === Función: Asignar eventos a los botones de la interfaz ===
    // ====================================================
    function attachEventListeners() {
        // Evento para ver detalles del libro
        document.querySelectorAll('.ver-detalles').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id'); // Se obtiene el ID del libro del atributo 'data-id'
                fetchBookDetails(id, data => {
                    if (data.error) {
                        Swal.fire({ icon: 'error', title: 'Error', text: data.error });
                    } else {
                        // Actualiza la tarjeta del libro según si la reserva fue confirmada
                        const bookCard = document.querySelector(`.book-card[data-id="${id}"]`);
                        const reservaConfirmada = data.usuarioRegistrado;
                        updateLikeAndCommentIcons(bookCard, id, reservaConfirmada);
                        // Se actualizan los elementos de detalle con la información recibida del servidor
                        detalleImagen.src = data.imagen_libro;
                        detalleTitulo.textContent = data.titulo;
                        detalleAutor.textContent = data.autor;
                        detalleCategoria.textContent = data.categoria;
                        detalleFecha.textContent = data.añoPublicacion;
                        detalleDescripcion.textContent = data.descripcion;
                        detalleDisponibilidad.textContent = data.disponibilidad;
                        closeModals(); // Se cierran otros modales abiertos para evitar conflictos
                        modalVerDetalles.style.display = "flex"; // Se muestra el modal de detalles
                    }
                });
            });
        });

        // Evento para iniciar el proceso de reserva del libro
        document.querySelectorAll('.reservar').forEach(button => {
            button.addEventListener('click', () => {
                resetReservarForm(); // Limpia el formulario antes de cargar nuevos datos
                const id = button.getAttribute('data-id'); // Obtiene el ID del libro seleccionado
                fetchBookDetails(id, data => {
                    if (data.error) {
                        Swal.fire({ icon: 'error', title: 'Error', text: data.error });
                    } else {
                        // Pre-carga los datos del libro en el formulario de reserva
                        tituloLibro.value = data.titulo;
                        idLibroInput.value = data.id;
                        closeModals(); // Cierra cualquier modal abierto
                        modalReservar.style.display = "flex"; // Muestra el modal de reserva
                    }
                });
            });
        });

        // Evento para leer el PDF del libro
        document.querySelectorAll('.leer-pdf').forEach(button => {
            button.addEventListener('click', async () => {
                const idLibro = button.getAttribute('data-id'); // Obtiene el ID del libro
                const idUsuarioReserva = await getUserIdByReserva(idLibro); // Verifica si existe una reserva
                // Si el botón está deshabilitado o no hay reserva, se muestra un mensaje informativo
                if (button.classList.contains('disabled') || !idUsuarioReserva) {
                    Swal.fire({ icon: 'info', title: 'Información', text: 'Para Leer o Descargar un libro, debes realizar la Reserva.' });
                } else {
                    const url = button.getAttribute('data-url'); // URL del PDF
                    closeModals(); // Cierra otros modales antes de abrir el visor
                    openPdf(url, idLibro); // Llama a la función para abrir el PDF y registrar la lectura
                }
            });
        });

        // Evento para descargar el PDF del libro
        document.querySelectorAll('.descargar-pdf').forEach(button => {
            button.addEventListener('click', async () => {
                const idLibro = button.getAttribute('data-id');
                const idUsuarioReserva = await getUserIdByReserva(idLibro);
                // Verifica si se cumple la condición de tener reserva para poder descargar
                if (!idUsuarioReserva) {
                    Swal.fire({ icon: 'info', title: 'Información', text: 'Para Leer o Descargar un libro, debes realizar la Reserva.' });
                } else if (button.classList.contains('disabled')) {
                    Swal.fire({ icon: 'info', title: 'Información', text: 'Para Leer o Descargar un libro, debes realizar la Reserva.' });
                } else {
                    const url = button.getAttribute('data-url');
                    // Crea un enlace temporal para iniciar la descarga del PDF
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = '';
                    a.click(); // Se simula un clic para iniciar la descarga
                }
            });
        });

        // Evento para dar "me gusta" a un libro
        document.querySelectorAll('.like-icon').forEach(function(button) {
            button.addEventListener('click', function() {
                const likeButton = this;
                const idLibro = likeButton.getAttribute('data-id');
                const likeCounter = likeButton.nextElementSibling; // Elemento que muestra la cantidad de "me gusta"
                // Si el botón está deshabilitado, muestra un aviso
                if (likeButton.classList.contains('disabled')) {
                    Swal.fire({ icon: 'warning', title: 'Acción no permitida', text: 'Debes reservar el libro para poder dar "Me gusta".' });
                } else {
                    // Envía la petición para registrar el "me gusta" en el servidor
                    fetch('like.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: `idLibro=${idLibro}&idUsuario=${idUsuario}`
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.totalLikes !== undefined) {
                            likeCounter.textContent = data.totalLikes; // Actualiza el contador visualmente
                            // Cambia la apariencia del botón según se añada o quite el "me gusta"
                            if (data.message.indexOf("removido") !== -1) {
                                likeButton.classList.remove('liked');
                            } else {
                                likeButton.classList.add('liked');
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error al registrar el "me gusta":', error);
                    });
                }
            });
        });

        // Evento para comentar un libro: muestra un modal con un textarea para ingresar el comentario
        document.querySelectorAll('.comment-icon').forEach(button => {
            button.addEventListener('click', function() {
                const idLibro = this.getAttribute('data-id');
                if (this.classList.contains('disabled')) {
                    // Si el botón está deshabilitado, se muestra un mensaje indicando que se debe reservar
                    Swal.fire({ icon: 'warning', title: 'Acción no permitida', text: 'Debes reservar el libro para poder comentar.' });
                } else {
                    // Muestra un input modal para que el usuario escriba su comentario
                    Swal.fire({
                        title: 'Escribe tu comentario',
                        input: 'textarea',
                        showCancelButton: true,
                        confirmButtonText: 'Enviar',
                        cancelButtonText: 'Cancelar'
                    }).then(result => {
                        // Si el usuario ingresa un comentario y tiene un ID de usuario asignado, se envía al servidor
                        if (result.value && idUsuario) {
                            const reseña = result.value;
                            fetch('comment.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                body: `idLibro=${idLibro}&idUsuario=${idUsuario}&reseña=${reseña}`
                            })
                            .then(response => response.json())
                            .then(data => {
                                Swal.fire('Éxito', 'Gracias por tu comentario :)', 'success');
                            })
                            .catch(error => {
                                console.error('Error al enviar el comentario:', error);
                            });
                        }
                    });
                }
            });
        });
    }

    // ====================================================
    // === Evento del formulario de reserva ===
    // ====================================================
    // Intercepta el envío del formulario para validarlo, enviar los datos al servidor y actualizar la interfaz según la respuesta
    formReservar.addEventListener('submit', (event) => {
        event.preventDefault(); // Previene el comportamiento por defecto de envío del formulario (recargar la página)
        if (!validateForm()) return; // Valida los campos y detiene el proceso si hay errores
        const nombre = nombreEstudiante.value.trim(); // Se obtiene y limpia el nombre ingresado (aunque no se usa en el envío, puede ser para fines de depuración)
        const passwordValue = password.value.trim(); // Se obtiene y limpia el valor de la contraseña
        const formData = new FormData(formReservar); // Crea un objeto FormData con los campos del formulario
        formData.append('password', passwordValue); // Asegura que la contraseña se envíe correctamente
        formData.append('csrfToken', csrfToken.value); // Agrega el token CSRF para seguridad
        // Envía la petición al servidor para realizar la reserva
        fetch('reservas_libros.php?action=reservar', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Manejo de errores o mensajes según la respuesta del servidor
            if (data.error) {
                Swal.fire({ icon: 'error', title: 'Error', text: data.error });
            } else if (data.registrado === false) {
                Swal.fire({ icon: 'error', title: 'No registrado', text: 'Lo Sentimos. No eres apto para realizar la reserva' });
            } else if (data.password_incorrecta) {
                Swal.fire({ icon: 'error', title: 'Contraseña Incorrecta', text: 'La contraseña ingresada no es correcta. Por favor, inténtalo nuevamente.' });
            } else {
                // Si la reserva es exitosa, muestra un mensaje de éxito y actualiza la interfaz
                Swal.fire({ icon: 'success', title: 'Éxito', text: data.message })
                .then(() => {
                    // Se dispara un evento personalizado para notificar que la reserva ha sido confirmada, pasando el ID del usuario
                    document.dispatchEvent(new CustomEvent('reservaConfirmada', { detail: { idUsuario: data.idUsuario } }));
                    // Actualiza la tarjeta del libro para habilitar las acciones de "me gusta" y comentarios
                    const bookCard = document.querySelector(`.book-card[data-id="${data.idLibro}"]`);
                    if (bookCard) {
                        const likeIcon = bookCard.querySelector('.like-icon');
                        const commentIcon = bookCard.querySelector('.comment-icon');
                        likeIcon.classList.remove('disabled');
                        likeIcon.setAttribute('title', 'Puedes dar "Me gusta"');
                        commentIcon.classList.remove('disabled');
                        commentIcon.setAttribute('title', 'Puedes comentar este libro');
                    }
                    reservaRealizada = true; // Marca que se ha realizado una reserva
                    resetInactividadTimeout(); // Reinicia el temporizador de inactividad
                    resetReservarForm(); // Limpia el formulario para futuros usos
                    closeModals(); // Cierra todos los modales abiertos
                    checkReservaStatus(); // Inicia la verificación periódica del estado de reserva
                });
            }
        })
        .catch(error => {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al realizar la reserva' });
        });
    });

    // ====================================================
    // === Función: Verificar periódicamente el estado de la reserva ===
    // ====================================================
    // Esta función consulta al servidor para actualizar el estado de reserva de cada libro en la interfaz
    function checkReservaStatus() {
        if (!reservaRealizada) {
            clearInterval(checkInterval); // Si no hay reserva, se detiene la verificación periódica
            return;
        }
        fetch('reservas_libros.php?action=check_status')
        .then(response => response.json())
        .then(data => {
            if (data.confirmed) {
                // Para cada reserva confirmada, actualiza los botones de lectura y descarga en la tarjeta correspondiente
                data.confirmed.forEach(reserva => {
                    const bookCard = document.querySelector(`.book-card[data-id="${reserva.idLibro}"]`);
                    if (bookCard) {
                        bookCard.querySelector('.leer-pdf').classList.remove('disabled');
                        bookCard.querySelector('.descargar-pdf').classList.remove('disabled');
                        updateLikeAndCommentIcons(bookCard, reserva.idLibro, true);
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error al verificar el estado de las reservas:', error);
        });
    }

    // Se configura un intervalo para verificar el estado de la reserva cada 6 segundos
    checkInterval = setInterval(checkReservaStatus, 6000);
    checkReservaStatus(); // Llamada inicial para establecer el estado correcto de inmediato
    checkLikeAndCommentStatus(); // Verifica el estado de "me gusta" y comentarios en las tarjetas

    // ====================================================
    // === Funciones para gestionar la persistencia del estado de inactividad ===
    // ====================================================
    // Guarda el estado actual (si se realizó una reserva y el ID del libro) en localStorage para persistir la sesión
    function persistInactividadState() {
        const inactividadState = {
            reservaRealizada: reservaRealizada,
            idLibro: idLibro,
            inicioInactividad: new Date().getTime(), // Guarda el tiempo actual en milisegundos
            alertaMostrada: false
        };
        localStorage.setItem('inactividadState', JSON.stringify(inactividadState));
    }

    // Restaura el estado de inactividad guardado previamente y reestablece el temporizador si es necesario
    function restoreInactividadState() {
        const inactividadState = JSON.parse(localStorage.getItem('inactividadState'));
        if (inactividadState && inactividadState.reservaRealizada) {
            reservaRealizada = inactividadState.reservaRealizada;
            idLibro = inactividadState.idLibro;
            // Si ha pasado más de 6 segundos desde que se inició la inactividad, se podría cancelar la reserva (funcionalidad comentada)
            if (new Date().getTime() - inactividadState.inicioInactividad > 6000) {
                // cancelarReservaPorInactividad(); // Función opcional para cancelar la reserva por inactividad
            } else {
                resetInactividadTimeout(); // Si no se cumplió el tiempo, reinicia el temporizador
            }
        }
    }

    restoreInactividadState(); // Intenta restaurar el estado al cargar la página

    // Reinicia el temporizador de inactividad y actualiza el estado guardado
    function resetInactividadTimeout() {
        clearTimeout(inactivityTimeout); // Limpia el temporizador anterior
        persistInactividadState(); // Guarda el nuevo estado de inactividad
    }

    // ====================================================
    // === Asignación de eventos para detectar actividad del usuario ===
    // ====================================================
    // Cualquier movimiento del mouse, pulsación de tecla o clic reiniciará el temporizador de inactividad
    document.addEventListener('mousemove', resetInactividadTimeout);
    document.addEventListener('keydown', resetInactividadTimeout);
    document.addEventListener('click', resetInactividadTimeout);

    // ====================================================
    // === Elementos del buscador y catálogo de libros ===
    // ====================================================
    const searchBar = document.getElementById('searchBar'); // Campo para ingresar términos de búsqueda
    const bookCatalog = document.getElementById('bookCatalog'); // Contenedor donde se muestran los libros

    // ====================================================
    // === Función: Aplicar filtros en tiempo real para actualizar el catálogo sin recargar la página ===
    // ====================================================
    function applyFiltersRealTime() {
        let searchTerm = document.getElementById('searchBar').value.trim(); // Término de búsqueda
        let autor = document.getElementById('filterAutor').value; // Filtro por autor
        let grado = document.getElementById('filterGrado').value; // Filtro por grado o nivel
        let order = document.getElementById('filterTitulo').value; // Ordenamiento (por título)
        let disponibilidad = document.getElementById('filterDisponibilidad').value; // Filtro por disponibilidad
        let agregados = document.getElementById('filterAgregados').value; // Filtro por fecha de agregado o similar
        let categoria = document.getElementById('filterCategoria').value; // Filtro por categoría
        
        // Construye los parámetros para la URL de consulta
        let params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (autor) params.set('autor', autor);
        if (grado) params.set('grado', grado);
        if (order) params.set('order', order);
        if (disponibilidad) params.set('disponibilidad', disponibilidad);
        if (agregados) params.set('agregados', agregados);
        if (categoria) params.set('categoria', categoria);
        params.set('page', 1); // Se establece la página 1 para cada nueva consulta
        
        // Realiza la petición al servidor para obtener el catálogo filtrado
        fetch("catalogo.php?" + params.toString())
        .then(response => response.text())
        .then(data => {
            // Se utiliza DOMParser para convertir el HTML recibido en un documento manipulable
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            const newCatalog = doc.getElementById('bookCatalog').innerHTML; // Extrae el contenido del catálogo
            bookCatalog.innerHTML = newCatalog; // Actualiza el catálogo en la página
            attachEventListeners(); // Reasigna los eventos a los nuevos elementos generados
            checkLikeAndCommentStatus(); // Revisa el estado de "me gusta" y comentarios en el nuevo catálogo
        })
        .catch(error => {
            console.error("Error al actualizar los filtros", error);
        });
    }

    // ====================================================
    // === Asignación de eventos "input" y "change" para los filtros ===
    // ====================================================
    searchBar.addEventListener('input', applyFiltersRealTime);
    document.getElementById('filterAutor').addEventListener('change', applyFiltersRealTime);
    document.getElementById('filterGrado').addEventListener('change', applyFiltersRealTime);
    document.getElementById('filterTitulo').addEventListener('change', applyFiltersRealTime);
    document.getElementById('filterDisponibilidad').addEventListener('change', applyFiltersRealTime);
    document.getElementById('filterAgregados').addEventListener('change', applyFiltersRealTime);
    document.getElementById('filterCategoria').addEventListener('change', applyFiltersRealTime);

    // Se asignan los eventos a los botones y modales del DOM
    attachEventListeners();
    attachModalCloseEventListeners();

    // ====================================================
    // === Función: Asignar eventos a los enlaces de paginación ===
    // ====================================================
    // Permite cambiar de página en el catálogo sin recargar toda la página
    function attachPaginationEventListeners() {
        const paginationLinks = document.querySelectorAll('.pagination a');
        paginationLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault(); // Previene la navegación por defecto
                const pageUrl = link.getAttribute('href'); // Obtiene la URL de la página de resultados
                fetch(pageUrl)
                .then(response => response.text())
                .then(data => {
                    // Utiliza DOMParser para actualizar el catálogo con la nueva página de resultados
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(data, 'text/html');
                    const newCatalog = doc.getElementById('bookCatalog').innerHTML;
                    bookCatalog.innerHTML = newCatalog;
                    attachEventListeners(); // Reasigna los eventos a los nuevos elementos
                    checkLikeAndCommentStatus(); // Actualiza el estado de los iconos de "me gusta" y comentarios
                    attachPaginationEventListeners(); // Reasigna los eventos de paginación para la nueva página
                })
                .catch(error => {
                    console.error('Error al cargar la nueva página de resultados:', error);
                });
            });
        });
    }

    attachPaginationEventListeners();

    // ====================================================
    // === Toggle para mostrar/ocultar la contraseña en el formulario ===
    // ====================================================
    // Permite al usuario alternar entre ver u ocultar la contraseña ingresada
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            // Verifica el tipo actual del campo de contraseña y lo alterna
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            // Alterna el ícono entre un ojo abierto y uno cerrado para dar feedback visual
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }
});
