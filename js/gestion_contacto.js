// Función para exportar los mensajes de contacto a PDF
// Se ejecuta cuando el documento está listo, gracias a jQuery
$(document).ready(function () {
    // Se asigna un evento "click" al botón con id "download_pdf"
    document.getElementById('download_pdf').addEventListener('click', function() {
        const body = []; // Array que almacenará las filas de la tabla que se incluirán en el PDF

        // -------------------------------------------------------------------------
        // Añadir encabezados de la tabla al PDF
        // Se definen los títulos de cada columna
        const headers = ['#', 'Nombre de Contacto', 'Correo', 'Mensaje', 'Fecha'];
        // Se mapea el arreglo de encabezados y se formatea cada uno para que aparezca en negrita y centrado
        body.push(headers.map(header => ({ text: header, bold: true, alignment: 'center' })));

        // -------------------------------------------------------------------------
        // Obtener los datos de la tabla
        // Se seleccionan todas las filas (<tr>) del cuerpo de la tabla con id "contactTableBody"
        const mensajesData = Array.from(document.querySelectorAll('#contactTableBody tr')).map((row, index) => {
            const celdas = row.querySelectorAll('td'); // Se obtienen todas las celdas (<td>) de la fila
            // Se retorna un objeto con los datos que se extraen de cada celda:
            return {
                numero: index + 1, // Número de fila (empezando en 1)
                nombre: celdas[2].textContent.trim(), // Nombre de contacto (tercera celda)
                correo: celdas[3].textContent.trim(), // Correo (cuarta celda)
                mensaje: celdas[4].textContent.trim(), // Mensaje (quinta celda)
                fecha: celdas[5].textContent.trim() // Fecha (sexta celda)
            };
        });

        // -------------------------------------------------------------------------
        // Añadir filas de datos al PDF
        // Para cada mensaje se construye una fila de datos en el formato requerido
        mensajesData.forEach((mensaje) => {
            const dataRow = [
                { text: mensaje.numero, alignment: 'center' },
                { text: mensaje.nombre, alignment: 'center' },
                { text: mensaje.correo, alignment: 'center' },
                // En el mensaje se establece un tamaño de fuente de 12 y un margen vertical de 5
                { text: mensaje.mensaje, alignment: 'center', fontSize: 12, margin: [0, 5, 0, 5] },
                { text: mensaje.fecha, alignment: 'center' }
            ];
            body.push(dataRow); // Se agrega la fila al cuerpo de la tabla
        });

        // Se obtiene el total de registros mediante la longitud del arreglo mensajesData
        const totalRegistros = mensajesData.length;
        // Se obtiene la fecha y hora actual formateada usando la función getCurrentDateTime (debe estar definida en otro lugar)
        const currentDateTime = getCurrentDateTime('America/Mexico_City');

        // -------------------------------------------------------------------------
        // Definición del documento PDF utilizando pdfMake
        const docDefinition = {
            // Se define el encabezado del PDF con tres columnas
            header: {
                columns: [
                    {
                        text: 'Gestión de Mensajes de Contacto',
                        alignment: 'left',
                        margin: [10, 10],
                        fontSize: 12
                    },
                    {
                        text: `Fecha y hora: ${currentDateTime}`,
                        alignment: 'center',
                        margin: [10, 10],
                        fontSize: 10
                    },
                    {
                        text: `Total de registros: ${totalRegistros}`,
                        alignment: 'right',
                        margin: [10, 10],
                        fontSize: 12
                    }
                ]
            },
            // Se define el pie de página mediante una función que muestra la página actual y total
            footer: function(currentPage, pageCount) {
                return {
                    text: `Página ${currentPage} de ${pageCount}`,
                    alignment: 'center',
                    margin: [0, 10]
                };
            },
            // Se define el contenido principal del PDF, que consiste en una tabla
            content: [
                {
                    table: {
                        headerRows: 1, // La primera fila se trata como encabezado
                        widths: ['auto', 'auto', 'auto', '*', 'auto'], // Ancho de cada columna; '*' significa ajustar automáticamente
                        body: body // Los datos de la tabla que se generaron previamente
                    },
                    layout: 'lightHorizontalLines' // Se utiliza un layout con líneas horizontales ligeras
                }
            ],
            pageMargins: [40, 60, 40, 60], // Márgenes de la página
            pageSize: 'A4', // Tamaño de página A4
            pageOrientation: 'landscape' // Orientación horizontal
        };

        // Se crea y descarga el PDF con el nombre "mensajes_contacto.pdf"
        pdfMake.createPdf(docDefinition).download("mensajes_contacto.pdf");
    });

    // -------------------------------------------------------------------------
    // Función para imprimir los mensajes de contacto
    // Se asigna un evento "click" al botón con id "print_pdf"
    document.getElementById('print_pdf').addEventListener('click', function() {
        const body = []; // Array para almacenar las filas de la tabla

        // Se definen los encabezados de la tabla
        const headers = ['#', 'Nombre de Contacto', 'Correo', 'Mensaje', 'Fecha'];
        // Se agregan los encabezados al array, formateándolos en negrita y centrados
        body.push(headers.map(header => ({ text: header, bold: true, alignment: 'center' })));

        // Se obtienen los datos de la tabla de mensajes
        const mensajesData = Array.from(document.querySelectorAll('#contactTableBody tr')).map((row, index) => {
            const celdas = row.querySelectorAll('td'); // Obtiene las celdas de cada fila
            return {
                numero: index + 1,
                nombre: celdas[2].textContent.trim(),
                correo: celdas[3].textContent.trim(),
                mensaje: celdas[4].textContent.trim(),
                fecha: celdas[5].textContent.trim()
            };
        });

        // Se agregan los datos de cada mensaje al array "body" como filas formateadas
        mensajesData.forEach((mensaje) => {
            const dataRow = [
                { text: mensaje.numero, alignment: 'center' },
                { text: mensaje.nombre, alignment: 'center' },
                { text: mensaje.correo, alignment: 'center' },
                { text: mensaje.mensaje, alignment: 'center', fontSize: 10, margin: [0, 5, 0, 5] },
                { text: mensaje.fecha, alignment: 'center' }
            ];
            body.push(dataRow);
        });

        // Se obtiene el total de registros y la fecha/hora actual
        const totalRegistros = mensajesData.length;
        const currentDateTime = getCurrentDateTime('America/Mexico_City');

        // Definición del documento PDF para impresión, similar a la exportación
        const docDefinition = {
            header: {
                columns: [
                    {
                        text: 'Gestión de Mensajes de Contacto',
                        alignment: 'left',
                        margin: [10, 10],
                        fontSize: 12
                    },
                    {
                        text: `Fecha y hora: ${currentDateTime}`,
                        alignment: 'center',
                        margin: [10, 10],
                        fontSize: 10
                    },
                    {
                        text: `Total de registros: ${totalRegistros}`,
                        alignment: 'right',
                        margin: [10, 10],
                        fontSize: 12
                    }
                ]
            },
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
                        widths: ['auto', 'auto', 'auto', '*', 'auto'],
                        body: body
                    },
                    layout: 'lightHorizontalLines'
                }
            ],
            pageMargins: [40, 60, 40, 60],
            pageSize: 'A4',
            pageOrientation: 'landscape'
        };

        // Se crea el PDF y se obtiene como DataURL
        const pdfDoc = pdfMake.createPdf(docDefinition);
        pdfDoc.getDataUrl((dataUrl) => {
            // Se abre una nueva ventana y se inyecta un iframe que contiene el PDF para imprimirlo
            const printWindow = window.open('', '_blank');
            printWindow.document.write('<iframe width="100%" height="100%" src="' + dataUrl + '"></iframe>');
        });
    });
});

// -----------------------------------------------------------------------------
// Función para ordenar la tabla de mensajes
function ordenarTabla() {
    const ordenarPor = document.getElementById('ordenarPor').value;
    const filas = Array.from(document.querySelectorAll('#contactTableBody tr'));
    
    filas.sort((a, b) => {
        // Usamos la sexta columna (td:nth-child(6)) para la fecha
        const fechaA = new Date(a.querySelector('td:nth-child(6)').textContent.trim());
        const fechaB = new Date(b.querySelector('td:nth-child(6)').textContent.trim());
        
        if (ordenarPor === 'mas_reciente') {
            // Orden descendente: fecha más reciente primero
            return fechaB - fechaA;
        } else if (ordenarPor === 'mas_antiguo') {
            // Orden ascendente: fecha más antigua primero
            return fechaA - fechaB;
        }
    });
    
    // Reinsertamos las filas ordenadas en el cuerpo de la tabla
    filas.forEach(fila => document.getElementById('contactTableBody').appendChild(fila));
}


// -----------------------------------------------------------------------------
// Función para filtrar mensajes según el término de búsqueda
document.getElementById('searchBar').addEventListener('keyup', function () {
    const searchTerm = this.value.toLowerCase(); // Obtiene el término de búsqueda y lo convierte a minúsculas
    // Selecciona todas las filas de la tabla de mensajes
    const rows = document.querySelectorAll('#contactTableBody tr');
    rows.forEach(row => {
        // Obtiene el contenido de las celdas de nombre, correo y mensaje en minúsculas
        const nombre = row.cells[2].textContent.toLowerCase();
        const correo = row.cells[3].textContent.toLowerCase();
        const mensaje = row.cells[4].textContent.toLowerCase();
        
        // Si alguno de los campos incluye el término de búsqueda, la fila se muestra; de lo contrario, se oculta
        if (nombre.includes(searchTerm) || correo.includes(searchTerm) || mensaje.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// -----------------------------------------------------------------------------
// Función para seleccionar o deseleccionar todos los mensajes
function seleccionarTodos() {
    const selectAllCheckbox = document.getElementById('selectAll'); // Checkbox principal
    const checkboxes = document.querySelectorAll('.selectMessage'); // Todos los checkboxes individuales
    // Se establece el estado de cada checkbox igual al del checkbox principal
    checkboxes.forEach(checkbox => checkbox.checked = selectAllCheckbox.checked);
}

// -----------------------------------------------------------------------------
// Función para eliminar mensajes seleccionados
function eliminarSeleccionados() {
    // Obtiene los valores de los checkboxes que están seleccionados
    const seleccionados = Array.from(document.querySelectorAll('.selectMessage:checked'))
        .map(cb => cb.value);

    if (seleccionados.length > 0) {
        // Muestra una alerta de confirmación utilizando SweetAlert2
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Realiza una petición POST en formato JSON al script 'crud_contacto.php' para eliminar los mensajes seleccionados
                fetch('crud_contacto.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ ids: seleccionados, action: 'deleteSelected' })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Muestra una alerta de éxito y, al confirmar, desmarca y elimina las filas correspondientes
                        Swal.fire('¡Eliminado!', 'Los mensajes seleccionados han sido eliminados.', 'success')
                        .then(() => {
                            // 1) Desmarca las casillas seleccionadas
                            seleccionados.forEach(id => {
                                const checkbox = document.querySelector(`.selectMessage[value="${id}"]`);
                                if (checkbox) checkbox.checked = false;
                            });

                            // 2) Desmarca la casilla principal (si existe)
                            const mainCheckbox = document.getElementById('selectAll');
                            if (mainCheckbox) {
                                mainCheckbox.checked = false;
                            }

                            // 3) Elimina las filas de la tabla correspondientes a los mensajes eliminados
                            seleccionados.forEach(id => {
                                const fila = document.querySelector(`.selectMessage[value="${id}"]`)?.closest('tr');
                                if (fila) fila.remove();
                            });

                            // 4) Verifica si ya no quedan mensajes en la tabla
                            verificarRegistros();
                        });

                    } else {
                        Swal.fire('Error', 'No se pudieron eliminar los mensajes seleccionados.', 'error');
                    }
                })
                .catch(error => console.error('Error:', error));
            }
        });
    } else {
        // Si no hay mensajes seleccionados, muestra una alerta informativa
        Swal.fire('Información', 'Selecciona al menos un registro para eliminar.', 'info');
    }
}

// -----------------------------------------------------------------------------
// Función para actualizar el total de registros mostrados en la página
function actualizarTotalRegistros() {
    // Cuenta cuántas filas (<tr>) hay en el cuerpo de la tabla de mensajes
    const totalRegistros = document.querySelectorAll('#contactTableBody tr').length;
    // Actualiza el elemento con id "totalRegistros" con el número obtenido
    document.getElementById('totalRegistros').textContent = totalRegistros;
}

// -----------------------------------------------------------------------------
// Función para verificar si la tabla tiene registros; si no, muestra un mensaje indicativo
function verificarRegistros() {
    const filasRestantes = document.querySelectorAll('#contactTableBody tr').length;
    if (filasRestantes === 0) {
        // Crea una fila de tabla con un mensaje centralizado que indica que no se encontraron mensajes
        const noDataRow = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px;">
                    No se encontraron mensajes.
                </td>
            </tr>
        `;
        // Inserta la fila en el cuerpo de la tabla
        document.getElementById('contactTableBody').innerHTML = noDataRow;
    }
}

/* 
   ============================================================================
   Cargar y paginar con estilo de círculos (tipo "1 2 3 4 5 … 20")
   ============================================================================
*/
$(document).ready(function () {
    // Al cargar la página, se carga la primera página de registros
    cargarPagina(1);

    // -------------------------------------------------------------------------
    // Función para cargar una página de registros mediante AJAX
    function cargarPagina(pagina) {
        $.ajax({
            url: 'crud_contacto.php', // Script que gestiona la consulta de mensajes
            type: 'POST',
            data: { pagina: pagina }, // Se envía el número de página como parámetro
            dataType: 'json',
            success: function (response) {
                // Se extraen los datos de la respuesta JSON
                const mensajes = response.mensajes;
                const totalPaginas = response.totalPaginas;
                const paginaActual = response.paginaActual;
                const totalRegistros = response.totalRegistros;

                // Actualiza el total de registros mostrado en el elemento con id "totalRegistros"
                $('#totalRegistros').text(totalRegistros);

                // Limpia el cuerpo de la tabla de mensajes
                $('#contactTableBody').empty();

                // Verifica si existen mensajes; de lo contrario, muestra un mensaje "No se encontraron mensajes"
                if (mensajes.length === 0) {
                    const noDataRow = `
                        <tr>
                            <td colspan="7" style="text-align: center; padding: 20px;">
                                No se encontraron mensajes.
                            </td>
                        </tr>
                    `;
                    $('#contactTableBody').append(noDataRow);
                } else {
                    // Para cada mensaje, construye una fila de la tabla y la agrega al cuerpo de la tabla
                    mensajes.forEach(function (mensaje, index) {
                        const fila = `
                            <tr>
                                <td><input type="checkbox" class="selectMessage" value="${mensaje.id}"></td>
                                <td>${(paginaActual - 1) * 10 + (index + 1)}</td>
                                <td>${mensaje.contacto_nombre}</td>
                                <td>${mensaje.correo}</td>
                                <td>${mensaje.mensaje}</td>
                                <td>${mensaje.fecha}</td>
                                <td>
                                    <div class="acciones">
                                        <button class="btn ver grow" onclick="abrirModal('${mensaje.contacto_nombre}', '${mensaje.correo}', '${mensaje.fecha}', '${mensaje.mensaje}')">
                                            <i class="fas fa-eye"></i> Ver
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                        $('#contactTableBody').append(fila);
                    });
                }

                // Actualiza la paginación con la función "actualizarPaginacion"
                actualizarPaginacion(paginaActual, totalPaginas);
            }
        });
    }

    // -------------------------------------------------------------------------
    // Función para actualizar la paginación con estilo “1 2 3 4 5 … 20”
    function actualizarPaginacion(paginaActual, totalPaginas) {
        const paginationDiv = $('.pagination'); // Selecciona el contenedor de la paginación
        paginationDiv.empty(); // Limpia el contenido previo

        // Si hay al menos una página, se genera la lista de paginación
        if (totalPaginas >=1) {
            // Crea un elemento <ul> para contener los botones de paginación y asigna una clase para estilos
            let paginationList = $('<ul class="pagination-list"></ul>');

            // ---------------------------------------------------------------------
            // Botón de retroceso («)
            if (paginaActual > 1) {
                let prevPage = paginaActual - 1;
                paginationList.append(`<li><a href="#" class="pagina" data-pagina="${prevPage}"><i class="fas fa-chevron-left"></i></a></li>`);
            } else {
                // Si está en la primera página, el botón se muestra deshabilitado
                paginationList.append(`<li><a class="pagina disabled"><i class="fas fa-chevron-left"></i></a></li>`);
            }

            // ---------------------------------------------------------------------
            // Mostrar páginas: si el total es 5 o menos, se muestran todas
            if (totalPaginas <= 5) {
                for (let i = 1; i <= totalPaginas; i++) {
                    let activeClass = (i === paginaActual) ? 'active' : '';
                    paginationList.append(`<li><a href="#" class="pagina ${activeClass}" data-pagina="${i}">${i}</a></li>`);
                }
            } else {
                // Si hay más de 5 páginas, se muestran las primeras 5
                for (let i = 1; i <= 5; i++) {
                    let activeClass = (i === paginaActual) ? 'active' : '';
                    paginationList.append(`<li><a href="#" class="pagina ${activeClass}" data-pagina="${i}">${i}</a></li>`);
                }
                // Se agrega un elipsis para indicar que hay más páginas
                paginationList.append(`<li>...</li>`);
                // Se agrega el botón para la última página
                let activeClass = (totalPaginas === paginaActual) ? 'active' : '';
                paginationList.append(`<li><a href="#" class="pagina ${activeClass}" data-pagina="${totalPaginas}">${totalPaginas}</a></li>`);
            }

            // ---------------------------------------------------------------------
            // Botón de avance (»)
            if (paginaActual < totalPaginas) {
                let nextPage = paginaActual + 1;
                paginationList.append(`<li><a href="#" class="pagina" data-pagina="${nextPage}"><i class="fas fa-chevron-right"></i></a></li>`);
            } else {
                paginationList.append(`<li><a class="pagina disabled"><i class="fas fa-chevron-right"></i></a></li>`);
            }

            // Se inyecta la lista de paginación en el contenedor
            paginationDiv.append(paginationList);
        }
    }

    // -------------------------------------------------------------------------
    // Delegar eventos de clic en los botones de paginación usando delegación de eventos
    $(document).on('click', '.pagina', function (e) {
        e.preventDefault(); // Previene la acción por defecto del enlace
        const pagina = $(this).data('pagina'); // Obtiene el número de página del atributo data-pagina
        cargarPagina(pagina); // Carga la página correspondiente
    });
});

// -----------------------------------------------------------------------------
// Función para abrir el modal de visualización de un mensaje
function abrirModal(nombre, correo, fecha, mensaje) {
    // Se asigna el nombre al elemento con id "modalNombre", o "No disponible" si no existe
    document.getElementById("modalNombre").textContent = nombre || "No disponible";
    // Se asigna el correo al elemento con id "modalCorreo"
    document.getElementById("modalCorreo").textContent = correo || "No disponible";
    // Se asigna la fecha al elemento con id "modalFecha"
    document.getElementById("modalFecha").textContent = fecha || "No disponible";
    
    // Se obtiene el mensaje completo y se establece un máximo de caracteres a mostrar inicialmente
    const mensajeCompleto = mensaje || "No hay mensaje disponible.";
    const maxChars = 200;

    // Si el mensaje supera el máximo de caracteres, se muestra un resumen seguido de "..."
    if (mensajeCompleto.length > maxChars) {
        document.getElementById("modalMensajeTexto").textContent = mensajeCompleto.substring(0, maxChars) + '...';
        // Se muestra el botón para expandir el mensaje completo
        document.getElementById("expandirMensaje").style.display = "inline";
        // Se guarda el mensaje completo en un atributo para su uso posterior
        document.getElementById("expandirMensaje").setAttribute("data-mensaje-completo", mensajeCompleto);
    } else {
        // Si el mensaje es corto, se muestra completo y se oculta el botón de expandir
        document.getElementById("modalMensajeTexto").textContent = mensajeCompleto;
        document.getElementById("expandirMensaje").style.display = "none";
    }

    // Se muestra el modal cambiando su estilo a "block"
    document.getElementById("modalMensaje").style.display = "block";
}

// -----------------------------------------------------------------------------
// Función para expandir el mensaje y mostrar su contenido completo
function expandirMensaje() {
    // Se obtiene el mensaje completo almacenado en el atributo "data-mensaje-completo"
    const mensajeCompleto = document.getElementById("expandirMensaje").getAttribute("data-mensaje-completo");
    // Se actualiza el contenido del modal para mostrar el mensaje completo
    document.getElementById("modalMensajeTexto").textContent = mensajeCompleto;
    // Se oculta el botón de expandir ya que no es necesario
    document.getElementById("expandirMensaje").style.display = "none";
}

// -----------------------------------------------------------------------------
// Función para cerrar el modal de mensaje
function cerrarModal() {
    // Se oculta el modal cambiando su estilo a "none"
    document.getElementById("modalMensaje").style.display = "none";
}

// -----------------------------------------------------------------------------
// Evento: Cerrar el modal al hacer clic fuera del contenido del modal
window.onclick = function(event) {
    const modal = document.getElementById("modalMensaje"); // Se obtiene el modal
    // Si el clic ocurre fuera del modal, se llama a la función cerrarModal
    if (event.target === modal) {
        cerrarModal();
    }
};

// -----------------------------------------------------------------------------
// Captura de clics en botones "Eliminar" y "Ver" a nivel del documento
document.addEventListener('click', function(event) {
    // -----------------------------
    // Caso: Eliminar un mensaje individual
    // -----------------------------
    if (event.target.closest('.eliminar-mensaje')) { // Si el clic se realizó en un elemento con clase "eliminar-mensaje"
        const button = event.target.closest('.eliminar-mensaje'); // Se obtiene el botón específico
        const id = button.getAttribute('data-id'); // Se extrae el ID del mensaje
        // Se muestra una alerta de confirmación usando SweetAlert2
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar!',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Si se confirma, se llama a la función eliminarMensaje pasando el ID
                eliminarMensaje(id);
            }
        });
    }
});

// -----------------------------------------------------------------------------
// Función que carga los mensajes de contacto (con paginación) desde la base de datos
function cargarPagina(pagina) {
    $.ajax({
        url: 'crud_contacto.php', // URL del script que gestiona los mensajes
        type: 'POST',
        data: { pagina: pagina }, // Se envía el número de página a cargar
        dataType: 'json',
        success: function (response) {
            const mensajes = response.mensajes; // Se extraen los mensajes del JSON de respuesta
            const totalPaginas = response.totalPaginas; // Número total de páginas
            const paginaActual = response.paginaActual; // Página actual
            const totalRegistros = response.totalRegistros; // Total de registros

            // Actualiza el total de registros mostrado en el elemento con id "totalRegistros"
            $('#totalRegistros').text(totalRegistros);

            // Limpia el cuerpo de la tabla de mensajes
            $('#contactTableBody').empty();

            // Verifica si se han recibido mensajes
            if (mensajes.length === 0) {
                // Si no hay mensajes, se muestra una fila que indica que no se encontraron mensajes
                const noDataRow = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 20px;">
                            No se encontraron mensajes.
                        </td>
                    </tr>
                `;
                $('#contactTableBody').append(noDataRow);
            } else {
                // Para cada mensaje recibido, se crea una fila de tabla y se inserta en el cuerpo de la tabla
                mensajes.forEach(function (mensaje, index) {
                    const fila = `
                        <tr>
                            <td><input type="checkbox" class="selectMessage" value="${mensaje.id}"></td>
                            <td>${(paginaActual - 1) * 10 + (index + 1)}</td>
                            <td>${mensaje.contacto_nombre}</td>
                            <td>${mensaje.correo}</td>
                            <td>${mensaje.mensaje}</td>
                            <td>${mensaje.fecha}</td>
                            <td>
                                <div class="acciones">
                                    <button class="btn ver grow" onclick="abrirModal('${mensaje.contacto_nombre}', '${mensaje.correo}', '${mensaje.fecha}', '${mensaje.mensaje}')">
                                        <i class="fas fa-eye"></i> Ver
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                    $('#contactTableBody').append(fila);
                });
            }

            // Actualiza la paginación con la función actualizarPaginacion, pasando la página actual y total de páginas
            actualizarPaginacion(paginaActual, totalPaginas);
        }
    });
}

// -----------------------------------------------------------------------------
// Función para actualizar la paginación con estilo de círculos (tipo "1 2 3 4 5 … 20")
function actualizarPaginacion(paginaActual, totalPaginas) {
    const paginationDiv = $('.pagination'); // Selecciona el contenedor de la paginación
    paginationDiv.empty(); // Limpia el contenido anterior

    // Sólo si hay al menos una página, se genera la lista de paginación
    if (totalPaginas >=1) {
        // Crea un elemento <ul> con la clase "pagination-list" para contener los botones
        let paginationList = $('<ul class="pagination-list"></ul>');

        // ---------------------------------------------------------------------
        // Botón "«" para retroceder
        if (paginaActual > 1) {
            let prevPage = paginaActual - 1;
            paginationList.append(`<li><a href="#" class="pagina" data-pagina="${prevPage}"><i class="fas fa-chevron-left"></i></a></li>`);
        } else {
            paginationList.append(`<li><a class="pagina disabled"><i class="fas fa-chevron-left"></i></a></li>`);
        }

        // ---------------------------------------------------------------------
        // Si el total de páginas es 5 o menos, se muestran todas las páginas
        if (totalPaginas <= 5) {
            for (let i = 1; i <= totalPaginas; i++) {
                let activeClass = (i === paginaActual) ? 'active' : '';
                paginationList.append(`<li><a href="#" class="pagina ${activeClass}" data-pagina="${i}">${i}</a></li>`);
            }
        } else {
            // Si hay más de 5 páginas, se muestran las primeras 5, luego un elipsis y la última página
            for (let i = 1; i <= 5; i++) {
                let activeClass = (i === paginaActual) ? 'active' : '';
                paginationList.append(`<li><a href="#" class="pagina ${activeClass}" data-pagina="${i}">${i}</a></li>`);
            }
            // Se añade un elemento de elipsis
            paginationList.append(`<li>...</li>`);
            // Se añade el botón para la última página
            let activeClass = (totalPaginas === paginaActual) ? 'active' : '';
            paginationList.append(`<li><a href="#" class="pagina ${activeClass}" data-pagina="${totalPaginas}">${totalPaginas}</a></li>`);
        }

        // ---------------------------------------------------------------------
        // Botón "»" para avanzar
        if (paginaActual < totalPaginas) {
            let nextPage = paginaActual + 1;
            paginationList.append(`<li><a href="#" class="pagina" data-pagina="${nextPage}"><i class="fas fa-chevron-right"></i></a></li>`);
        } else {
            paginationList.append(`<li><a class="pagina disabled"><i class="fas fa-chevron-right"></i></a></li>`);
        }

        // Se inserta la lista de paginación en el contenedor
        paginationDiv.append(paginationList);
    }
}

// -----------------------------------------------------------------------------
// Delegar eventos de clic en los botones de paginación usando delegación de eventos jQuery
$(document).on('click', '.pagina', function (e) {
    e.preventDefault(); // Previene la acción por defecto del enlace
    const pagina = $(this).data('pagina'); // Obtiene el número de página del atributo data-pagina
    cargarPagina(pagina); // Llama a la función para cargar la página correspondiente
});

// -----------------------------------------------------------------------------
// Función para abrir el modal de mensajes de contacto
function abrirModal(nombre, correo, fecha, mensaje) {
    // Se asigna el contenido a cada uno de los elementos del modal,
    // comprobando que existan valores y asignando "No disponible" si no los hay
    document.getElementById("modalNombre").textContent = nombre || "No disponible";
    document.getElementById("modalCorreo").textContent = correo || "No disponible";
    document.getElementById("modalFecha").textContent = fecha || "No disponible";
    
    // Se gestiona el mensaje: si es demasiado largo se recorta y se ofrece opción de expandir
    const mensajeCompleto = mensaje || "No hay mensaje disponible.";
    const maxChars = 200;

    if (mensajeCompleto.length > maxChars) {
        // Muestra solo los primeros 200 caracteres seguidos de "..."
        document.getElementById("modalMensajeTexto").textContent = mensajeCompleto.substring(0, maxChars) + '...';
        // Se muestra el botón para expandir el mensaje completo
        document.getElementById("expandirMensaje").style.display = "inline";
        // Se guarda el mensaje completo en un atributo data para poder expandirlo luego
        document.getElementById("expandirMensaje").setAttribute("data-mensaje-completo", mensajeCompleto);
    } else {
        // Si el mensaje es corto, se muestra completo y se oculta el botón de expandir
        document.getElementById("modalMensajeTexto").textContent = mensajeCompleto;
        document.getElementById("expandirMensaje").style.display = "none";
    }

    // Se muestra el modal cambiando su estilo a "block"
    document.getElementById("modalMensaje").style.display = "block";
}

// -----------------------------------------------------------------------------
// Función para expandir el mensaje y mostrar su contenido completo
function expandirMensaje() {
    // Obtiene el mensaje completo del atributo data-mensaje-completo del botón de expandir
    const mensajeCompleto = document.getElementById("expandirMensaje").getAttribute("data-mensaje-completo");
    // Actualiza el contenido del elemento del modal para mostrar el mensaje completo
    document.getElementById("modalMensajeTexto").textContent = mensajeCompleto;
    // Oculta el botón de expandir ya que el mensaje ya está completo
    document.getElementById("expandirMensaje").style.display = "none";
}

// -----------------------------------------------------------------------------
// Función para cerrar el modal de mensajes de contacto
function cerrarModal() {
    // Cambia el estilo del modal a "none" para ocultarlo
    document.getElementById("modalMensaje").style.display = "none";
}

// -----------------------------------------------------------------------------
// Evento: Cerrar el modal si se hace clic fuera del contenido del modal
window.onclick = function(event) {
    const modal = document.getElementById("modalMensaje"); // Obtiene el modal
    if (event.target === modal) { // Si el clic se realizó fuera del contenido
        cerrarModal(); // Cierra el modal
    }
};
