// Cuando el documento esté completamente listo, se ejecuta la función callback de jQuery
$(document).ready(function() {
    // Recupera el idUsuario almacenado en localStorage; si no existe, asigna null
    let idUsuario = localStorage.getItem('idUsuario') || null; 
    // Declara una variable para almacenar el timeout que se usará para detectar inactividad
    let inactivityTimeout; 
    // Declara una bandera para indicar si la reserva está activa (inicialmente es false)
    let reservaActiva = false; 

    // Escucha el evento personalizado 'reservaConfirmada'
    document.addEventListener('reservaConfirmada', function(event) {
        // Al activarse el evento, captura el idUsuario del objeto 'detail' del evento
        idUsuario = event.detail.idUsuario; 
       
        // Guarda el idUsuario en localStorage para mantenerlo entre sesiones
        localStorage.setItem('idUsuario', idUsuario);

        // Marca que la reserva está activa
        reservaActiva = true;
        // Reinicia el temporizador de inactividad, de modo que se cuente desde el último movimiento
        resetInactivityTimeout(); 
    });

    // Función para verificar el estado de la reserva y actualizar los iconos de "Me gusta" en cada tarjeta de libro
    function checkReservaStatus() {
        // Itera sobre cada elemento con la clase 'book-card'
        $('.book-card').each(function() {
            const bookCard = $(this); // Guarda la tarjeta actual en una variable jQuery
            const idLibro = bookCard.data('id'); // Obtiene el id del libro asociado a la tarjeta
            const likeIcon = bookCard.find('.like-icon'); // Selecciona el icono de "Me gusta" dentro de la tarjeta
            const commentIcon = bookCard.find('.comment-icon'); // Selecciona el icono de "Comentar" dentro de la tarjeta
            const likeCounter = bookCard.find('.like-counter'); // Selecciona el contador de "Me gusta" dentro de la tarjeta

            // Realiza una petición AJAX POST a 'reservas_libros.php' con la acción 'check_reserva'
            $.post('reservas_libros.php?action=check_reserva', { idLibro: idLibro }, function(response) {
                // Si la respuesta indica que la reserva está confirmada
                if (response.reservaConfirmada) {
                    // Habilita el icono de "Me gusta" removiendo la clase 'disabled' y establece un tooltip adecuado
                    likeIcon.removeClass('disabled').attr('title', 'Puedes dar "Me gusta"');
                    // Habilita el icono de "Comentar" removiendo la clase 'disabled' y establece un tooltip adecuado
                    commentIcon.removeClass('disabled').attr('title', 'Puedes comentar este libro');
                    // Actualiza el contador de "Me gusta" con el total recibido en la respuesta
                    likeCounter.text(response.totalLikes);
                } else {
                    // Si la reserva no está confirmada, deshabilita el icono de "Me gusta" y establece un mensaje informativo
                    likeIcon.addClass('disabled').attr('title', 'Debes reservar el libro para dar me gusta');
                    // Deshabilita el icono de "Comentar" y establece un mensaje informativo similar
                    commentIcon.addClass('disabled').attr('title', 'Debes reservar el libro para comentar');
                    // Actualiza el contador de "Me gusta" (aunque no cambie el valor)
                    likeCounter.text(response.totalLikes);
                }
            }, 'json')
            // Si ocurre un error en la solicitud AJAX, lo imprime en la consola
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error('Error en la solicitud AJAX de checkReservaStatus:', textStatus, errorThrown);
            });
        });
    }

    // Función para reiniciar el temporizador de inactividad
    function resetInactivityTimeout() {
        // Limpia cualquier timeout que esté previamente asignado
        clearTimeout(inactivityTimeout);
        // Si la reserva está activa, se reiniciaría el timeout para cancelar la reserva
        // (El código para cancelar la reserva está comentado, por lo que no se ejecuta)
        if (reservaActiva) {
            // inactivityTimeout = setTimeout(cancelarReservaPorInactividad, 6000); // 1 minuto de inactividad (deshabilitado)
        }
    }

    // Detecta cualquier actividad del usuario (movimiento del mouse, pulsación de teclas o clic)
    $(document).on('mousemove keydown click', function() {
        // Si la reserva está activa, reinicia el timeout de inactividad
        if (reservaActiva) {
            resetInactivityTimeout();
        }
    });

    // Al cargar la página, verifica el estado de reserva para actualizar los iconos de "Me gusta" y "Comentar"
    checkReservaStatus();

    // Función para asignar o reasignar eventos a ciertos elementos después de recargar el catálogo
    function attachEventListeners() {
        // Asigna un evento 'click' a cualquier elemento con la clase 'like-icon'
        $(document).on('click', '.like-icon', function() {
            var likeButton = $(this); // Guarda el botón de "Me gusta" en una variable
            const idLibro = likeButton.data('id'); // Obtiene el id del libro asociado
            const likeCounter = likeButton.siblings('.like-counter'); // Obtiene el contador de "Me gusta" relacionado
            
            console.log("Se hizo click en like-icon, idLibro:", idLibro);
        
            // Si el botón de "Me gusta" tiene la clase 'disabled', muestra una alerta y sale
            if (likeButton.hasClass('disabled')) {
                Swal.fire({
                    icon: 'info',
                    title: 'Información',
                    text: 'Debes reservar el libro para poder dar "Me gusta".',
                });
                return;
            }
            
            // Si no hay un idUsuario asignado, muestra una advertencia y sale
            if (!idUsuario) {
                Swal.fire('Advertencia', 'Debes reservar el libro para dar me gusta', 'warning');
                return;
            }
        
            // Envía una petición AJAX POST al script 'like.php' con el id del libro y el idUsuario
            $.post('like.php', { idLibro: idLibro, idUsuario: idUsuario }, function(response) {
                console.log("Respuesta del servidor:", response);
                if (response.message) {
                    // Actualiza el contador de "Me gusta" en el DOM con el total recibido
                    likeCounter.text(response.totalLikes);
                    // Si el mensaje del servidor indica que se ha removido el "like"
                    if (response.message.indexOf("removido") !== -1) {
                        // Remueve las clases 'liked' y 'fa-solid' y añade 'fa-regular' para cambiar el icono
                        likeButton.removeClass('liked fa-solid').addClass('fa-regular');
                        console.log("Se remueve la clase 'liked'");
                    } else {
                        // Si el like se ha añadido, realiza la operación inversa para marcarlo visualmente
                        likeButton.addClass('liked fa-solid').removeClass('fa-regular');
                        console.log("Se agrega la clase 'liked'");
                    }
                    // Muestra una alerta de éxito con el mensaje recibido
                    Swal.fire('Éxito', response.message, 'success');
                } else {
                    // Si no se recibió un mensaje exitoso, muestra una alerta informativa con el error
                    Swal.fire('Información', response.error, 'info');
                }
            }, 'json')
            // Si falla la solicitud AJAX, imprime el error en la consola
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error('Error en la solicitud AJAX de "Me gusta":', textStatus, errorThrown);
            });
        });
        
        // Asigna un evento 'click' a los elementos con la clase 'comment-icon'
        $('.comment-icon').off('click').on('click', function() {
            const idLibro = $(this).data('id'); // Obtiene el id del libro asociado al comentario
            // Si el icono de comentar está deshabilitado, muestra una alerta informativa
            if ($(this).hasClass('disabled')) {
                Swal.fire({
                    icon: 'info',
                    title: 'Información',
                    text: 'Debes reservar el libro para poder comentar.',
                });
            } else {
                // Muestra un modal de SweetAlert que permite al usuario escribir un comentario
                Swal.fire({
                    title: 'Escribe tu comentario',
                    input: 'textarea',
                    showCancelButton: true,
                    confirmButtonText: 'Enviar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    // Si el usuario ingresó un comentario y hay un idUsuario asignado
                    if (result.value && idUsuario) {
                        const reseña = result.value; // Guarda el comentario en la variable reseña
                        // Envía una petición AJAX POST al script 'comment.php' con el id del libro, idUsuario y el comentario
                        $.post('comment.php', { idLibro: idLibro, idUsuario: idUsuario, reseña: reseña }, function(response) {
                            if (response.message) {
                                // Si la respuesta es exitosa, muestra una alerta de éxito
                                Swal.fire('Éxito', response.message, 'success');
                            } else {
                                // Si hay un error, muestra una alerta de error
                                Swal.fire('Error', response.error, 'error');
                            }
                        }, 'json')
                        // Si falla la solicitud, imprime el error en la consola
                        .fail(function(jqXHR, textStatus, errorThrown) {
                            console.error('Error en la solicitud AJAX de comentario:', textStatus, errorThrown);
                        });
                    }
                });
            }
        });
    }
  
    // Llama a attachEventListeners para asignar los eventos anteriormente definidos a los elementos pertinentes
    attachEventListeners();
  
    // Función para refrescar el catálogo: vuelve a verificar el estado de reserva y reasigna los eventos
    function refreshCatalog() {
        checkReservaStatus(); // Actualiza el estado de los iconos de "Me gusta" y "Comentar"
        attachEventListeners(); // Reasigna los eventos a los elementos (en caso de que se hayan recargado)
    }
});
