// Se comprueba el estado del DOM y se ejecuta init() en consecuencia
if (document.readyState === "loading") { // Si el documento aún se está cargando...
    document.addEventListener("DOMContentLoaded", init); // ...espera a que termine de cargar y luego ejecuta la función init()
} else { // Si el documento ya está completamente cargado...
    init(); // ...ejecuta inmediatamente la función init()
}

function init() { // Función principal que inicializa la aplicación
    initializeStaticEventListeners(); // Inicializa los event listeners de elementos estáticos
    initializeDynamicEventListeners(); // Inicializa los event listeners de elementos dinámicos (que se reconfiguran tras actualizar la tabla)
    // INICIO CAMBIO: Se agrega aquí el listener para el ícono de información
    setupInfoIcon(); // Configura el event listener del ícono de información para mostrar instrucciones
    // FIN CAMBIO
}

// Función que asigna event listeners a elementos estáticos (se ejecuta solo una vez)
function initializeStaticEventListeners() {
    const exportPDFButton = document.getElementById('exportPDFButton'); // Obtiene el botón para exportar a PDF
    const printButton = document.getElementById('printButton'); // Obtiene el botón para imprimir

    if (exportPDFButton) { // Verifica que exista el botón de exportar a PDF
      exportPDFButton.addEventListener('click', () => { // Asigna un listener para el clic en el botón de exportar
        exportToPDF(false); // Llama a la función exportToPDF con el parámetro false (no imprimir, solo exportar)
      });
    }
    if (printButton) { // Verifica que exista el botón de imprimir
      printButton.addEventListener('click', () => { // Asigna un listener para el clic en el botón de imprimir
        exportToPDF(true); // Llama a la función exportToPDF con el parámetro true (para imprimir)
      });
    }
}

// Función que asigna event listeners a elementos dinámicos (se re-inicializan tras actualizar la tabla)
function initializeDynamicEventListeners() {
    const searchBar = document.getElementById('searchBar'); // Obtiene la barra de búsqueda
    const ordenSelect = document.getElementById('orden'); // Obtiene el selector de ordenación de registros
    const selectAll = document.getElementById('selectAll'); // Obtiene el checkbox para seleccionar todas las filas
    const confirmarMasivo = document.getElementById('confirmarMasivo'); // Obtiene el botón para confirmar acción masiva
    const pendienteMasivo = document.getElementById('pendienteMasivo'); // Obtiene el botón para marcar como pendiente en acción masiva
    const cancelarMasivo = document.getElementById('cancelarMasivo'); // Obtiene el botón para cancelar acción masiva
    const eliminarMasivo = document.getElementById('eliminarMasivo'); // Obtiene el botón para eliminar en acción masiva
    
    // NOTA: la paginación se ha modificado, así que buscaremos .pagination-list a y no .pagination .page-link
    const paginationLinks = document.querySelectorAll('.pagination-list .page-link'); // Obtiene todos los enlaces de paginación dentro de .pagination-list

    // Si alguno de estos elementos no existe, se termina la función sin asignar los listeners
    if (!searchBar || !ordenSelect || !selectAll || !confirmarMasivo || !pendienteMasivo || !cancelarMasivo || !eliminarMasivo) {
        return;
    }

    // Filtrar filas en la tabla en tiempo real: al escribir en la barra de búsqueda
    searchBar.addEventListener('input', () => {
        const searchTerm = searchBar.value.toLowerCase(); // Convierte el valor ingresado a minúsculas
        filterRows(searchTerm); // Llama a la función filterRows para filtrar las filas que coincidan
    });

    // Cambiar la ordenación de los registros al seleccionar una opción del dropdown
    ordenSelect.addEventListener('change', () => {
        const orden = ordenSelect.value; // Obtiene el valor seleccionado
        loadReservas(1, orden); // Carga la página 1 de reservas con el orden especificado
    });

    // Seleccionar o deseleccionar todas las filas al cambiar el estado del checkbox principal
    selectAll.addEventListener('change', () => {
        const checkboxes = document.querySelectorAll('.select-row'); // Obtiene todos los checkboxes de las filas
        checkboxes.forEach(checkbox => checkbox.checked = selectAll.checked); // Igual que el checkbox principal
    });

    // Asigna acciones masivas a los botones correspondientes
    confirmarMasivo.addEventListener('click', () => accionMasiva('confirmada')); // Cambia estado a "confirmada" para registros seleccionados
    pendienteMasivo.addEventListener('click', () => accionMasiva('pendiente')); // Cambia estado a "pendiente" para registros seleccionados
    cancelarMasivo.addEventListener('click', () => accionMasiva('cancelada')); // Cambia estado a "cancelada" para registros seleccionados
    eliminarMasivo.addEventListener('click', () => eliminarReservasMasivo()); // Elimina reservas seleccionadas de forma masiva

    // Asigna event listeners a cada enlace de paginación (se re-inicializan cada vez que se actualiza la tabla)
    paginationLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Previene la acción por defecto del enlace
            if (link.classList.contains('disabled')) return; // Si el enlace está deshabilitado, no hace nada
            const page = link.dataset.page; // Obtiene el número de página desde data-page
            const orden = link.dataset.orden; // Obtiene el orden desde data-orden (si existe)
            loadReservas(page, orden); // Carga las reservas de la página y orden indicados
        });
    });

    // Asigna un listener al contenedor de la tabla de reservas para manejar eventos de botones en cada registro
    document.getElementById('reservasBody').addEventListener('click', (event) => {
        const target = event.target.closest('button'); // Obtiene el botón más cercano al elemento clickeado
        if (target) { // Si se hizo clic en un botón
            const id = target.dataset.id; // Obtiene el id de la reserva desde el atributo data-id
            if (target.classList.contains('ver')) { // Si el botón es de "ver" detalles
                mostrarDetallesReserva(target); // Muestra los detalles de la reserva
            } else if (target.classList.contains('estado-confirmada') ||
                       target.classList.contains('estado-pendiente') ||
                       target.classList.contains('estado-cancelada')) { // Si es un botón para actualizar el estado
                const estado = target.classList.contains('estado-pendiente') ? 'pendiente' :
                               target.classList.contains('estado-confirmada') ? 'confirmada' :
                               'cancelada'; // Determina el nuevo estado según la clase del botón
                actualizarEstadoReserva(id, estado); // Actualiza el estado de la reserva con el id dado
            } else if (target.classList.contains('eliminar')) { // Si el botón es para eliminar la reserva
                eliminarReserva(id); // Elimina la reserva con el id correspondiente
            }
        }
    });

    // Asegura que todos los botones "eliminar" muestren el texto "Eliminar"
    document.querySelectorAll('button.eliminar').forEach(button => {
        if (!button.innerText.includes('Eliminar')) { // Si el texto actual no contiene "Eliminar"
            button.innerHTML = button.innerHTML + ' Eliminar'; // Agrega "Eliminar" al contenido del botón
        }
    });
}

// INICIO CAMBIO: Función para configurar el ícono de información
function setupInfoIcon() {
    const infoIcon = document.getElementById('infoIcon'); // Obtiene el elemento con id "infoIcon"
    if (!infoIcon) return; // Si no existe el ícono, termina la función

    // Asigna un listener para el clic en el ícono de información
    infoIcon.addEventListener('click', () => {
        // Muestra una alerta con instrucciones usando SweetAlert
        Swal.fire({
            title: 'Instrucciones para la Gestión de Reservas', // Título de la alerta
            html: ` 
            <div style="text-align:left;">
              <p><strong>1. Visualización de las Reservas:</strong><br>
                 - La tabla contiene los siguientes campos:<br>
                 &nbsp;&nbsp;• Nombre del alumno(a).<br>
                 &nbsp;&nbsp;• Nombre del libro reservado.<br>
                 &nbsp;&nbsp;• Fecha de reserva.<br>
                 &nbsp;&nbsp;• Estado de la reserva (confirmada, pendiente, cancelada).</p>
              
              <p><strong>2. Interpretación del Estado de la Reserva:</strong><br>
                 - <em>Confirmada:</em> La reserva ha sido aprobada.<br>
                 - <em>Pendiente:</em> La reserva está en espera de revisión.<br>
                 - <em>Cancelada:</em> La reserva ha sido rechazada o ha caducado.</p>

              <p><strong>3. Cambiar el Estado de una Reserva:</strong><br>
                 - Usa los botones superiores (Confirmar, Pendiente, Cancelar).</p>
              
              <p><strong>4. Cancelación Automática:</strong><br>
                 - Las reservas se cancelan automáticamente tras 30 minutos sin acción.</p>

              <p><strong>5. Eliminar una Reserva:</strong><br>
                 - Selecciona el registro y pulsa "Eliminar".</p>

              <p><strong>6. Impresión y Exportación:</strong><br>
                 - Puedes imprimir o exportar a PDF con los botones superiores.</p>
            </div>
            `,
            icon: 'info', // Muestra el icono de información
            showCloseButton: true, // Permite cerrar la alerta con un botón
            confirmButtonText: 'Cerrar' // Texto del botón de confirmación
        });
    });
}
// FIN CAMBIO

// Función para filtrar las filas de la tabla de reservas según el término de búsqueda
function filterRows(searchTerm) {
    const rows = document.querySelectorAll('#reservasBody tr'); // Obtiene todas las filas (<tr>) de la tabla de reservas
    rows.forEach(row => {
        const nombre = row.cells[2].textContent.toLowerCase(); // Extrae el texto del nombre (celda 2) y lo convierte a minúsculas
        const tituloLibro = row.cells[3].textContent.toLowerCase(); // Extrae el texto del título del libro (celda 3) y lo convierte a minúsculas
        // Muestra la fila si el nombre o el título contienen el término buscado; si no, oculta la fila
        row.style.display = (nombre.includes(searchTerm) || tituloLibro.includes(searchTerm)) ? '' : 'none';
    });
}

// Función para ejecutar acciones masivas sobre las reservas (cambiar estado)
function accionMasiva(estado) {
    const checkboxes = document.querySelectorAll('.select-row:checked'); // Obtiene todos los checkboxes seleccionados de las filas
    const ids = Array.from(checkboxes).map(checkbox => checkbox.value); // Extrae los valores (IDs) de los checkboxes seleccionados
    if (ids.length === 0) { // Si no hay registros seleccionados
        Swal.fire({ icon: 'info', title: 'Información', text: 'Seleccione al menos un registro para realizar esta acción' });
        return; // Termina la función sin realizar ninguna acción
    }
    // Envía una petición POST para actualizar el estado de las reservas seleccionadas de forma masiva
    fetch('reservas_libros1.php?action=actualizarEstadoMasivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `ids=${JSON.stringify(ids)}&estado=${estado}` // Envía los IDs y el nuevo estado en el body
    })
    .then(response => response.json()) // Convierte la respuesta a JSON
    .then(data => {
        if (data.error) { // Si la respuesta indica un error
            Swal.fire({ icon: 'error', title: 'Error', text: data.error });
        } else {
            Swal.fire({ icon: 'success', title: 'Éxito', text: data.message })
            .then(() => {
                checkboxes.forEach(checkbox => checkbox.checked = false); // Desmarca todos los checkboxes seleccionados
                const mainCheckbox = document.getElementById('selectAll'); // Obtiene el checkbox principal
                if (mainCheckbox) mainCheckbox.checked = false; // Desmarca el checkbox principal si existe
                loadReservas(); // Recarga la lista de reservas
                actualizarTotalRegistros(); // Actualiza el contador total de registros
            });
        }
    })
    .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'Error al actualizar el estado' })); // Maneja errores en la petición
}

// Función para eliminar una reserva individual
function eliminarReserva(id) {
    // Muestra una alerta de confirmación para eliminar la reserva
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Sí, eliminarlo!'
    }).then(result => {
        if (result.isConfirmed) { // Si el usuario confirma la eliminación
            // Envía una petición POST para eliminar la reserva con el id especificado
            fetch('reservas_libros1.php?action=eliminar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `id=${id}` // Envía el id en el body de la petición
            })
            .then(response => response.json()) // Convierte la respuesta a JSON
            .then(data => {
                if (data.error) { // Si hay un error al eliminar
                    Swal.fire({ icon: 'error', title: 'Error', text: data.error });
                } else {
                    Swal.fire({ icon: 'success', title: 'Eliminado!', text: 'La reserva ha sido eliminada.' })
                    .then(() => {
                        loadReservas(); // Recarga la lista de reservas
                        actualizarTotalRegistros(); // Actualiza el contador total de registros
                    });
                }
            })
            .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'Error al eliminar la reserva' })); // Maneja errores en la petición
        }
    });
}

// Función para eliminar reservas de forma masiva
function eliminarReservasMasivo() {
    const checkboxes = document.querySelectorAll('.select-row:checked'); // Obtiene todos los checkboxes seleccionados
    const ids = Array.from(checkboxes).map(checkbox => checkbox.value); // Extrae los IDs de los checkboxes seleccionados

    if (ids.length === 0) { // Si no se ha seleccionado ninguna reserva
        Swal.fire({ icon: 'info', title: 'Información', text: 'Seleccione al menos un registro para eliminar' });
        return; // Termina la función sin hacer nada
    }

    // Muestra una alerta de confirmación para eliminar las reservas de forma masiva
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Sí, eliminar!'
    }).then(result => {
        if (result.isConfirmed) { // Si el usuario confirma la eliminación
            // Envía una petición POST para eliminar masivamente las reservas seleccionadas
            fetch('reservas_libros1.php?action=eliminarMasivo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `ids=${JSON.stringify(ids)}` // Envía los IDs en el body de la petición
            })
            .then(response => response.json()) // Convierte la respuesta a JSON
            .then(data => {
                if (data.error) { // Si hay un error en la respuesta
                    Swal.fire({ icon: 'error', title: 'Error', text: data.error });
                } else {
                    Swal.fire({ icon: 'success', title: 'Eliminado!', text: 'Las reservas han sido eliminadas.' })
                    .then(() => {
                        checkboxes.forEach(checkbox => checkbox.checked = false); // Desmarca todos los checkboxes seleccionados
                        const mainCheckbox = document.getElementById('selectAll'); // Obtiene el checkbox principal
                        if (mainCheckbox) mainCheckbox.checked = false; // Desmarca el checkbox principal
                        loadReservas(false); // Recarga la lista de reservas (sin parámetros adicionales)
                        actualizarTotalRegistros(); // Actualiza el contador total de registros
                    });
                }
            })
            .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'Error al eliminar las reservas' })); // Maneja errores en la petición
        }
    });
}

// Función para actualizar el estado de una reserva individual
function actualizarEstadoReserva(id, estado) {
    // Envía una petición POST para actualizar el estado de la reserva identificada por id
    fetch('reservas_libros1.php?action=actualizarEstado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${id}&estado=${estado}` // Envía el id y el nuevo estado en el body de la petición
    })
    .then(response => response.json()) // Convierte la respuesta a JSON
    .then(data => {
        if (data.error) { // Si hay un error en la actualización
            Swal.fire({ icon: 'error', title: 'Error', text: data.error });
        } else {
            Swal.fire({ icon: 'success', title: 'Éxito', text: data.message })
            .then(() => loadReservas()); // Recarga la lista de reservas tras la actualización
        }
    })
    .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'Error al actualizar el estado' })); // Maneja errores en la petición
}

// Función para cargar la tabla de reservas y la paginación
function loadReservas(page = 1, orden = 'recientes') {
    // Envía una petición GET a "gestion_reservas.php" con la página y orden especificados como parámetros
    fetch(`gestion_reservas.php?pagina=${page}&orden=${orden}`)
        .then(response => response.text()) // Convierte la respuesta a texto HTML
        .then(html => {
            const newDoc = new DOMParser().parseFromString(html, 'text/html'); // Parsea el HTML recibido en un nuevo documento
            const newBody = newDoc.getElementById('reservasBody').innerHTML; // Extrae el contenido del cuerpo de la tabla de reservas del nuevo documento
            // At. se ha modificado la paginación a estilo "1 2 3 4 5 … 20"
            const newPagination = newDoc.querySelector('.pagination').innerHTML; // Extrae el HTML de la paginación del nuevo documento

            document.getElementById('reservasBody').innerHTML = newBody; // Actualiza el contenido del cuerpo de la tabla con el nuevo HTML
            document.querySelector('.pagination').innerHTML = newPagination; // Actualiza la paginación con el nuevo HTML

            initializeDynamicEventListeners(); // Re-inicializa los event listeners de elementos dinámicos tras actualizar la tabla
            actualizarTotalRegistros(); // Actualiza el contador total de registros
        })
        .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cargar las reservas' })); // Muestra un error en caso de fallo en la carga
}

// Función para actualizar el contador total de registros mostrados
function actualizarTotalRegistros() {
    const totalRegistrosElement = document.querySelector('.total-registros span'); // Obtiene el elemento donde se muestra el total de registros
    const rows = document.querySelectorAll('#reservasBody tr'); // Obtiene todas las filas de la tabla de reservas
    let totalRegistrosActuales = 0; // Inicializa el contador de registros en cero
    rows.forEach(row => {
        if (!row.classList.contains('no-registros')) { // Si la fila no tiene la clase "no-registros" (es decir, es una fila válida de datos)
            totalRegistrosActuales++; // Incrementa el contador
        }
    });
    // Actualiza el elemento con el total de registros, incluyendo un ícono
    totalRegistrosElement.innerHTML = `<i class="fas fa-list-alt"></i> Total de registros: ${totalRegistrosActuales}`;
}

// Función para exportar o imprimir la tabla de reservas en formato PDF
function exportToPDF(print = false) {
    if (!window.pdfMake) { // Verifica que pdfMake esté cargado
        Swal.fire('Error', 'No se pudo cargar pdfMake.', 'error'); // Muestra un error si pdfMake no está disponible
        return;
    }
    const rows = document.querySelectorAll('#reservasBody tr'); // Obtiene todas las filas de la tabla de reservas
    const totalRegistros = rows.length; // Calcula el total de registros (número de filas)
    // Se reemplaza el uso de moment.js por getCurrentDateTime('America/Mexico_City') para obtener la fecha y hora actual
    const currentDateTime = getCurrentDateTime('America/Mexico_City');
    // Mapea cada fila a un arreglo de objetos que representan las celdas para construir la tabla del PDF
    const reservasData = Array.from(rows).map((row, index) => {
        const cells = row.querySelectorAll('td'); // Obtiene todas las celdas (<td>) de la fila
        return [
            { text: index + 1, alignment: 'center' }, // Número de registro
            { text: cells[2].textContent.trim(), alignment: 'center' }, // Nombre (asumido en la celda 2)
            { text: cells[3].textContent.trim(), alignment: 'center' }, // Libro (celda 3)
            { text: cells[4].textContent.trim(), alignment: 'center' }, // Fecha de reserva (celda 4)
            { text: cells[5].textContent.trim(), alignment: 'center' }  // Estado (celda 5)
        ];
    });
    // Define la estructura del documento PDF: encabezado, pie de página y contenido (tabla de reservas)
    const docDefinition = {
        header: {
            columns: [
                {
                    text: 'Primaria Manuel Del Mazo Villasante - Reservas de Libros',
                    alignment: 'left',
                    margin: [10, 10],
                    fontSize: 10
                },
                { text: `Fecha y hora: ${currentDateTime}`, alignment: 'center', margin: [10, 10], fontSize: 10 },
                {
                    text: `Total de registros: ${totalRegistros}`,
                    alignment: 'right',
                    margin: [10, 10],
                    fontSize: 10
                }
            ]
        },
        // Función que define el pie de página del PDF con la numeración de páginas
        footer: function(currentPage, pageCount) {
            return {
                text: `Página ${currentPage} de ${pageCount}`,
                alignment: 'center',
                margin: [0, 10]
            };
        },
        content: [
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', 'auto', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            { text: '#', bold: true, alignment: 'center' },
                            { text: 'Nombre', bold: true, alignment: 'center' },
                            { text: 'Libro', bold: true, alignment: 'center' },
                            { text: 'Fecha de Reserva', bold: true, alignment: 'center' },
                            { text: 'Estado', bold: true, alignment: 'center' }
                        ],
                        ...reservasData // Inserta los datos de cada reserva en la tabla
                    ]
                },
                layout: 'lightHorizontalLines' // Aplica un diseño con líneas horizontales ligeras
            }
        ],
        pageMargins: [40, 60, 40, 60], // Define los márgenes de la página
        pageSize: 'A4', // Tamaño de la página A4
        pageOrientation: 'landscape', // Orientación horizontal de la página
    };

    if (print) { // Si se desea imprimir en lugar de descargar
        pdfMake.createPdf(docDefinition).getDataUrl((dataUrl) => {
            const printWindow = window.open('', '_blank'); // Abre una nueva ventana
            printWindow.document.write('<iframe width="100%" height="100%" src="' + dataUrl + '"></iframe>'); // Inserta un iframe con el PDF para imprimir
        });
    } else { // Si se desea descargar el PDF
        pdfMake.createPdf(docDefinition).download("reservas_libros.pdf"); // Descarga el PDF con el nombre indicado
    }
}

// Función para mostrar detalles de la reserva en una alerta (modal) usando SweetAlert
function mostrarDetallesReserva(target) {
    const nombre = target.dataset.nombre; // Obtiene el nombre del alumno desde data-nombre
    const titulo = target.dataset.titulo; // Obtiene el título del libro desde data-titulo
    const fecha = target.dataset.fecha; // Obtiene la fecha de reserva desde data-fecha
    const estado = target.dataset.estado; // Obtiene el estado de la reserva desde data-estado

    // Determina el color del ícono según el estado de la reserva
    let colorEstado;
    switch (estado.toLowerCase()) { // Compara el estado en minúsculas
        case 'pendiente':
            colorEstado = '#f39c12'; // Amarillo para "pendiente"
            break;
        case 'confirmada':
        case 'confirmado':
            colorEstado = '#27ae60'; // Verde para "confirmada" o "confirmado"
            break;
        case 'cancelada':
        case 'cancelado':
            colorEstado = '#e74c3c'; // Rojo para "cancelada" o "cancelado"
            break;
        default:
            colorEstado = '#7f8c5d'; // Gris para cualquier otro caso
    }

    // Construye el contenido HTML con los detalles de la reserva
    const htmlContent = `
        <div class="detalles-reserva">
            <p style="text-align: left; color: rgb(61, 61, 61);">
                <i class="fas fa-user" style="color:rgb(44, 128, 184);"></i> 
                <strong>Nombre:</strong> ${nombre}
            </p>
            <p style="text-align: left; color: rgb(61, 61, 61);">
                <i class="fas fa-book" style="color: rgb(44, 128, 184);"></i> 
                <strong>Libro:</strong> ${titulo}
            </p>
            <p style="text-align: left; color: rgb(61, 61, 61);">
                <i class="fas fa-calendar-alt" style="color: rgb(44, 128, 184);"></i> 
                <strong>Fecha y hora de reserva:</strong> ${fecha}
            </p>
            <p style="text-align: left;">
                <i class="fas fa-info-circle" style="color: ${colorEstado};"></i>
                <strong>Estado:</strong>
                <span style="color: ${colorEstado}; font-weight: bold;">${estado}</span>
            </p>
        </div>
    `;

    // Muestra una alerta con los detalles de la reserva usando SweetAlert
    Swal.fire({
        title: '<div style="text-align: left; color:rgb(23, 23, 24);">Detalles de reserva</div>', // Título personalizado con estilo
        html: htmlContent, // Contenido HTML con la información de la reserva
        showCloseButton: true, // Muestra el botón para cerrar la alerta
        focusConfirm: false, // No establece el foco en el botón de confirmación
        confirmButtonText: 'Cerrar', // Texto del botón de confirmación
        customClass: {
            title: 'swal2-title-center' // Clase CSS personalizada para centrar el título
        },
        showClass: { popup: '' }, // Configuración de animación de aparición (vacía)
        hideClass: { popup: '' } // Configuración de animación de desaparición (vacía)
    });
}
