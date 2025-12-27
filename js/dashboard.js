// Función para obtener la fecha y hora actual en formato "Sáb, 2025-03-01 01:14:08" sin moment.js
// Esta función recibe un parámetro 'timezone' y utiliza las funciones nativas de JavaScript para formatear la fecha y hora
function getCurrentDateTime(timezone) {
    const now = new Date(); // Se obtiene la fecha y hora actual
    // Se obtiene el nombre abreviado del día de la semana en español (por ejemplo, "Sáb") usando la zona horaria indicada
    // Se elimina el punto que podría agregar el método toLocaleDateString en algunos entornos
    const weekday = now.toLocaleDateString('es-es', {
      timeZone: timezone,
      weekday: 'short'
    }).replace(/\./g, '');
    
    // Se obtiene el día del mes con dos dígitos (ejemplo: "01")
    const day = now.toLocaleDateString('es-ES', {
      timeZone: timezone,
      day: '2-digit'
    });
    // Se obtiene el mes con dos dígitos (ejemplo: "03")
    const month = now.toLocaleDateString('es-ES', {
      timeZone: timezone,
      month: '2-digit'
    });
    // Se obtiene el año en formato numérico completo (ejemplo: "2025")
    const year = now.toLocaleDateString('es-ES', {
      timeZone: timezone,
      year: 'numeric'
    });
    // Se obtiene la hora, minutos y segundos en formato de 24 horas con dos dígitos cada uno
    const timeString = now.toLocaleTimeString('es-ES', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const formattedWeekday = weekday + ','; // Se agrega una coma al día abreviado para el formato deseado
    // Se retorna la cadena completa en el formato "Día, AAAA-MM-DD HH:MM:SS"
    return `${formattedWeekday} ${year}-${month}-${day} ${timeString}`;
}
  
// Se espera a que todo el contenido del documento esté cargado antes de ejecutar el resto del script
document.addEventListener('DOMContentLoaded', function() {
    // Se elimina la clase "nofouc" (posiblemente para evitar flickering de contenido) del elemento raíz
    document.documentElement.classList.remove('nofouc');

    // ================================
    // Elementos principales de la interfaz
    // ================================
    const closeBtn = document.querySelector('.close-btn'); // Botón para cerrar la sidebar o modal
    const floatBtn = document.getElementById('floatBtn'); // Botón flotante que se podrá arrastrar

    // ================================
    // NUEVO: Elementos del DROPDOWN de notificaciones
    // ================================
    const notificationsDropdown = document.getElementById('notificationsDropdown'); // Contenedor del dropdown de notificaciones
    const notificationsListDropdown = document.getElementById('notificationsListDropdown'); // Lista donde se mostrarán las notificaciones
    const markAllReadBtnDropdown = document.getElementById('markAllReadBtnDropdown'); // Botón para marcar todas las notificaciones como leídas
    const clearNotificationsBtnDropdown = document.getElementById('clearNotificationsBtnDropdown'); // Botón para limpiar (eliminar) todas las notificaciones

    // ================================
    // Código del Modal (comentado)
    // ================================
    /*
    const notificationContainer = document.querySelector('.notification-container');
    const notificationsModal = document.getElementById('notificationsModal');
    const notificationsList = document.getElementById('notificationsList');
    const closeNotifications = document.querySelector('.close-notifications');
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    const clearNotificationsBtn = document.getElementById('clearNotificationsBtn');
    */

    // ======================================
    // Función para cargar notificaciones en el dropdown
    // ======================================
    function loadNotificationsDropdown() {
        // Se hace una petición al servidor para obtener las notificaciones en formato JSON
        fetch('get_notifications.php')
            .then(response => response.json())
            .then(data => {
                let html = '';
                // Si hay notificaciones, se construye el HTML correspondiente para cada una
                if (data.length > 0) {
                    data.forEach(notification => {
                        html += `
                          <div class="notification-item" data-id="${notification.id}">
                              <p>${notification.mensaje}</p>
                              <small>${notification.fecha}</small>
                              ${notification.leido == 0 
                                ? `<button class="mark-read-btn" data-id="${notification.id}">Marcar como leído</button>` 
                                : ''
                              }
                          </div>
                          <hr>
                        `;
                    });
                } else {
                    // Si no hay notificaciones, se muestra un mensaje indicándolo
                    html = '<p>No hay notificaciones.</p>'; 
                }
                // Se actualiza el contenido del dropdown con el HTML generado
                notificationsListDropdown.innerHTML = html;

                // Se asigna un evento a cada botón "Marcar como leído" para que, al hacer clic, se notifique al servidor
                document.querySelectorAll('.mark-read-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const notifId = this.getAttribute('data-id'); // Se obtiene el ID de la notificación
                        // Se envía una petición POST para marcar la notificación como leída
                        fetch('mark_notification_read.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: `id=${notifId}`
                        })
                        .then(response => response.json())
                        .then(result => {
                            // Si la operación fue exitosa, se recarga la lista de notificaciones y se actualiza el contador
                            if (result.status === 'success'){
                                loadNotificationsDropdown();
                                updateNotificationCount();
                            } else {
                                alert(result.message); // Muestra un mensaje en caso de error
                            }
                        })
                        .catch(error => console.error('Error:', error));
                    });
                });
            })
            .catch(error => console.error('Error fetching notifications:', error));
    }

    // ======================================
    // Evento para abrir/ocultar el dropdown al hacer clic en la campanita de notificaciones
    // ======================================
    const notificationContainerNew = document.querySelector('.notification-container'); // Contenedor que agrupa la campanita y contador
    if (notificationContainerNew) {
        notificationContainerNew.addEventListener('click', function(e) {
            e.stopPropagation(); // Se evita que el clic se propague y active otros eventos
            loadNotificationsDropdown(); // Se carga o recarga la lista de notificaciones
            // Se alterna la clase 'active' para mostrar u ocultar el dropdown
            notificationsDropdown.classList.toggle('active');
        });
    }

    // ======================================
    // Cerrar el dropdown de notificaciones si se hace clic fuera de él
    // ======================================
    document.addEventListener('click', function(e) {
        // Si el dropdown está activo y el clic no se realizó dentro del dropdown ni en el contenedor de la campanita, se oculta
        if (
            notificationsDropdown.classList.contains('active') &&
            !notificationsDropdown.contains(e.target) && 
            !notificationContainerNew.contains(e.target)
        ) {
            notificationsDropdown.classList.remove('active');
        }
    });

    // ======================================
    // Botón "Marcar todo como leído" dentro del dropdown
    // ======================================
    markAllReadBtnDropdown.addEventListener('click', function() {
        // Se envía una petición POST para marcar todas las notificaciones como leídas
        fetch('mark_all_notifications_read.php', { method: 'POST' })
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success'){
                loadNotificationsDropdown(); // Se recarga el dropdown
                updateNotificationCount(); // Se actualiza el contador
            } else {
                alert(result.message);
            }
        })
        .catch(error => console.error('Error:', error));
    });

    // ======================================
    // Botón "Limpiar notificaciones" dentro del dropdown
    // ======================================
    clearNotificationsBtnDropdown.addEventListener('click', function() {
        // Se envía una petición POST para eliminar todas las notificaciones
        fetch('clear_notifications.php', { method: 'POST' })
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success'){
                loadNotificationsDropdown(); // Se recarga el dropdown
                updateNotificationCount(); // Se actualiza el contador
            } else {
                alert(result.message);
            }
        })
        .catch(error => console.error('Error:', error));
    });

    // ======================================
    // Código del Modal de notificaciones (actualmente comentado)
    // ======================================
    /*
    notificationContainer.addEventListener('click', function() {
        loadNotifications();
        notificationsModal.style.display = 'block';
    });

    closeNotifications.addEventListener('click', function() {
        notificationsModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == notificationsModal) {
            notificationsModal.style.display = 'none';
        }
    });
    */

    // ============================
    // Sidebar y botón flotante
    // ============================
    // Se asignan eventos al botón para cerrar la sidebar y al botón flotante para hacerlo arrastrable
    if (closeBtn) {
        closeBtn.addEventListener('click', toggleSidebar);
    }
    if (floatBtn) {
        makeDraggable(floatBtn);
    }

    // ============================
    // Reloj en tiempo real
    // ============================
    // Se asigna la función global 'updateClock' para actualizar el elemento del reloj cada segundo
    window.updateClock = function() {
        const clockElement = document.getElementById('clock');
        if (clockElement) {
            // Se obtiene la fecha y hora actual en la zona horaria de "America/Mexico_City" utilizando la función definida anteriormente
            clockElement.textContent = getCurrentDateTime('America/Mexico_City');
        }
    }
    updateClock(); // Primera actualización inmediata
    setInterval(updateClock, 1000); // Se actualiza cada 1 segundo

    // ============================
    // Carrusel de libros utilizando Slick jQuery plugin
    // ============================
    $(document).ready(function(){
        $('.carousel-libros').slick({
            infinite: true, // El carrusel es cíclico
            slidesToShow: 3, // Se muestran 3 elementos a la vez
            slidesToScroll: 1, // Se desplaza 1 elemento por vez
            autoplay: true, // Autoplay activado
            autoplaySpeed: 3000, // Cambia de slide cada 3 segundos
            arrows: true, // Se muestran flechas de navegación
            dots: true, // Se muestran puntos indicadores
            responsive: [
                {
                    breakpoint: 768, // Para pantallas menores a 768px
                    settings: {
                        slidesToShow: 1 // Muestra 1 slide en lugar de 3
                    }
                }
            ]
        });
    });
  
    // ============================
    // Actualizar el conteo de notificaciones en la campanita
    // ============================
    function updateNotificationCount() {
        // Se consulta al servidor el número de notificaciones no leídas
        fetch('get_notifications_count.php')
            .then(response => response.json())
            .then(data => {
                const countElem = document.getElementById('notificationCount');
                if (data.count !== undefined) {
                    // Se actualiza el contenido del contador con el valor obtenido
                    countElem.textContent = data.count;
                }
            })
            .catch(error => {
                console.error('Error fetching notification count:', error);
            });
    }
    updateNotificationCount(); // Primera actualización
    setInterval(updateNotificationCount, 10000); // Se actualiza cada 10 segundos

    // ============================
    // Función para toggle de la sidebar
    // ============================
    // Alterna la visibilidad de la sidebar y ajusta el contenido principal y el botón flotante
    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const content = document.getElementById('content');
        const floatBtn = document.getElementById('floatBtn');
    
        if (sidebar && content && floatBtn) {
            // Si la sidebar está oculta, se muestra y se ajusta el contenido
            if (sidebar.classList.contains('sidebar-hidden')) {
                sidebar.classList.remove('sidebar-hidden');
                content.classList.remove('content-full');
                floatBtn.classList.remove('show');
            } else {
                // Si la sidebar está visible, se oculta y se expande el contenido
                sidebar.classList.add('sidebar-hidden');
                content.classList.add('content-full');
                floatBtn.classList.add('show');
            }
        }
    }

    // ============================
    // Overlay (si se utiliza)
    // ============================
    // Funciones para mostrar y ocultar una capa superpuesta, útil para indicar carga o bloquear la interacción
    function showOverlay() {
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.style.display = 'block';
        }
    }
    function hideOverlay() {
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
  
    // ============================
    // Carga dinámica de contenido en el dashboard
    // ============================
    // Esta función carga el contenido de una página interna sin recargar todo el dashboard
    function loadContent(page) {
        // Se cierra el dropdown de notificaciones al navegar a otra sección
        notificationsDropdown.classList.remove('active');
 
        showOverlay(); // Muestra el overlay mientras se carga el contenido
        // Se remueve la clase 'active' de todos los enlaces de la sidebar para actualizar el estado
        const sidebarLinks = document.querySelectorAll('.sidebar-content a');
        sidebarLinks.forEach(link => link.classList.remove('active'));
        // Se marca como activo el enlace correspondiente a la página que se va a cargar
        const activeLink = document.querySelector(`.sidebar-content a[onclick="loadContent('${page}')"]`);
        if (activeLink) activeLink.classList.add('active');
  
        const pageContent = document.getElementById('pageContent');
        pageContent.style.visibility = 'hidden'; // Se oculta temporalmente el contenido durante la carga
  
        // Se realiza la petición para cargar el contenido de la página solicitada
        fetch(`dashboard_back.php?page=${page}`)
            .then(response => response.text())
            .then(data => {
                pageContent.innerHTML = data; // Se actualiza el contenedor con el nuevo contenido
                updateBreadcrumb(page); // Se actualiza la ruta de navegación (breadcrumb)
  
                // Se busca cualquier script presente en el contenido cargado para ejecutarlo
                const scripts = pageContent.getElementsByTagName('script');
                let loadedScripts = 0;
                const totalScripts = scripts.length;
  
                // Función auxiliar que inicializa eventos una vez que todos los scripts se han cargado
                const checkAndInitialize = () => {
                    if (loadedScripts === totalScripts) {
                        initializeEvents();
                    }
                };
  
                // Se recorren los scripts y se añaden al documento para ejecutarlos
                for (let script of scripts) {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        newScript.src = script.src;
                        newScript.onload = () => {
                            loadedScripts++;
                            checkAndInitialize();
                        };
                    } else {
                        newScript.textContent = script.textContent;
                        loadedScripts++;
                        checkAndInitialize();
                    }
                    document.body.appendChild(newScript);
                }
  
                if (totalScripts === 0) {
                    initializeEvents();
                }
            })
            .catch(error => {
                console.error('Error loading page:', error);
                pageContent.innerHTML = '<p>Error al cargar la página. Intenta nuevamente.</p>';
            })
            .finally(() => {
                hideOverlay(); // Se oculta el overlay
                pageContent.style.visibility = 'visible'; // Se vuelve a mostrar el contenido
            });
    }
  
    // ============================
    // Actualización de migas de pan (breadcrumb) y rebind de notificaciones
    // ============================
    function updateBreadcrumb(page) {
        // Mapeo de nombres de archivo a etiquetas para mostrar en el breadcrumb
        const breadcrumbMapping = {
            'dashboard.php': 'Inicio',
            'gestion_libros.php': 'Libros',
            'gestion_usuarios.php': 'Usuarios',
            'gestion_profesores.php': 'Control Docentes',
            'gestion_acceso.php': 'Accesos',
            'gestion_reservas.php': 'Reservas',
            'gestion_multimedia.php': 'Multimedia',
            'gestion_lectura.php': 'Lectura',
            'estadisticas.php': 'Estadísticas',
            'gestion_reseñas.php': 'Reseñas',
            'gestion_contacto.php': 'Mensajes'
        };
  
        // Se construye el HTML del breadcrumb incluyendo la campanita de notificaciones y el reloj
        let breadcrumbHTML = '<div class="notification-container"><i class="fas fa-bell"></i> <span class="badge" id="notificationCount">0</span></div>';
        breadcrumbHTML += '<span id="clock"></span>';
        breadcrumbHTML += '<a href="dashboard.php" onclick="loadContent(\'dashboard.php\')">Inicio</a>';
        const label = breadcrumbMapping[page] || '';
        if (page !== 'dashboard.php' && label) {
            breadcrumbHTML += ' <span class="breadcrumb-separator">&gt;</span> <span class="breadcrumb-current">' + label + '</span>';
        }
        // Se actualiza el contenedor del breadcrumb con el HTML generado
        document.getElementById('breadcrumb-container').innerHTML = breadcrumbHTML;
        updateClock(); // Se actualiza el reloj
        updateNotificationCount(); // Se actualiza el contador de notificaciones

        // ¡Rebind! Se asigna nuevamente el evento de clic a la campanita para abrir el dropdown de notificaciones
        const newNotificationContainer = document.querySelector('.notification-container');
        if (newNotificationContainer) {
            newNotificationContainer.addEventListener('click', function(e) {
                e.stopPropagation();
                loadNotificationsDropdown();
                notificationsDropdown.classList.toggle('active');
            });
        }
    }
  
    // ============================
    // Inicialización de eventos de módulos (funciones específicas de cada sección)
    // ============================
    function initializeEvents() {
        if (typeof initializeGestionLibros === 'function') {
            waitForElement('#bookForm', initializeGestionLibros);
        }
        if (typeof initializeGestionUsuarios === 'function') {
            waitForElement('#userForm', initializeGestionUsuarios);
        }
        if (typeof initializeGestionReservas === 'function') {
            waitForElement('#searchBar', initializeGestionReservas);
        }
        if (typeof initializeGestionMultimedia === 'function') {
            waitForElement('#multimediaForm', initializeGestionMultimedia);
        }
        if (typeof initializeGestionLectura === 'function') {
            waitForElement('#lectura_table', initializeGestionLectura);
        }
        if (typeof initializeEstadisticas === 'function') {
            waitForElement('#chart', initializeEstadisticas);
        }
        if (typeof initializeGestionReseñas === 'function') {
            waitForElement('#reseñas_table', initializeGestionReseñas);
        }
        if (typeof initializeGestionContacto === 'function') {
            waitForElement('#contactTableBody', initializeGestionContacto);
        }
        if (typeof initializeGestionAcceso === 'function') {
            waitForElement('#accesoTable', initializeGestionAcceso);
        }
    }
  
    // Función de ayuda que espera a que un elemento exista en el DOM antes de ejecutar un callback
    function waitForElement(selector, callback) {
        const element = document.querySelector(selector);
        if (element) {
            callback();
        } else {
            setTimeout(() => waitForElement(selector, callback), 100);
        }
    }
  
    // ============================
    // Función para hacer que un elemento sea arrastrable
    // ============================
    function makeDraggable(el) {
        let isMouseDown = false; // Bandera para saber si el mouse está presionado sobre el elemento
        let offsetX = 0, offsetY = 0, startX = 0, startY = 0; // Variables para calcular la posición
        let dragged = false; // Indica si el elemento fue movido
        const threshold = 5; // Distancia mínima para considerar que se ha arrastrado el elemento
  
        // Se asigna el evento mousedown para iniciar el arrastre
        el.addEventListener('mousedown', function(e) {
            isMouseDown = true;
            dragged = false;
            startX = e.clientX;
            startY = e.clientY;
            offsetX = e.clientX - el.offsetLeft;
            offsetY = e.clientY - el.offsetTop;
            e.preventDefault(); // Previene comportamientos por defecto
        });
  
        // Evento mousemove para mover el elemento mientras se mantiene presionado
        document.addEventListener('mousemove', function(e) {
            if (!isMouseDown) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
                dragged = true; // Si se supera el umbral, se considera que se está arrastrando
            }
            let newLeft = e.clientX - offsetX;
            let newTop = e.clientY - offsetY;
  
            // Se limita el movimiento para que el elemento no salga de la ventana
            const minX = 0;
            const minY = 0;
            const maxX = window.innerWidth - el.offsetWidth;
            const maxY = window.innerHeight - el.offsetHeight;
  
            newLeft = Math.max(minX, Math.min(newLeft, maxX));
            newTop = Math.max(minY, Math.min(newTop, maxY));
  
            el.style.left = newLeft + 'px';
            el.style.top = newTop + 'px';
        });
  
        // Al soltar el botón del mouse, se finaliza el arrastre
        document.addEventListener('mouseup', function() {
            isMouseDown = false;
        });
  
        // Evento click para distinguir entre un clic normal y un arrastre
        el.addEventListener('click', function(e) {
            if (dragged) {
                e.preventDefault();
                e.stopPropagation();
                dragged = false;
            } else {
                toggleSidebar(); // Si no se arrastró, se ejecuta la función para alternar la sidebar
            }
        });
  
        // ============================
        // Gestión del tiempo de inactividad para mostrar alerta y terminar sesión
        // ============================
        let idleTime = 0;
        const maxIdleTime = 60; // Tiempo máximo de inactividad en minutos
  
        // Función para reiniciar el contador de inactividad
        function resetInactivityTimer() {
            idleTime = 0;
        }
  
        // Se asignan eventos para reiniciar el temporizador con cualquier actividad
        document.addEventListener('mousemove', resetInactivityTimer);
        document.addEventListener('keydown', resetInactivityTimer);
        document.addEventListener('click', resetInactivityTimer);
        document.addEventListener('scroll', resetInactivityTimer);
  
        // Se establece un intervalo que incrementa el contador de inactividad cada minuto
        setInterval(() => {
            idleTime++;
            if (idleTime >= maxIdleTime) {
                showInactivityAlert(); // Muestra la alerta si se supera el tiempo permitido
            }
        }, 60000);
  
        // Función para mostrar la alerta de inactividad y redirigir al logout
        function showInactivityAlert() {
            // Se eliminan los eventos para que el usuario no pueda reactivar el temporizador
            document.removeEventListener('mousemove', resetInactivityTimer);
            document.removeEventListener('keydown', resetInactivityTimer);
            document.removeEventListener('click', resetInactivityTimer);
            document.removeEventListener('scroll', resetInactivityTimer);
  
            // Se utiliza Swal.fire para mostrar una alerta modal
            Swal.fire({
                title: 'Sesión finalizada por inactividad',
                text: 'Ha transcurrido 1 hora sin actividad. Por favor, inicia sesión nuevamente.',
                icon: 'warning',
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then((result) => {
                if (result.isConfirmed) {
                    // Redirige al usuario a logout con un parámetro que indica que la sesión expiró por inactividad
                    window.location.href = 'logout.php?session_timeout=1';
                }
            });
        }
    }
  
    // <<-- Se asigna globalmente la función loadContent para que pueda ser utilizada en otras partes del código -->
    window.loadContent = loadContent;
});
