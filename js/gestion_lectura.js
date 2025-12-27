// Función principal que inicializa la gestión de lecturas
function initializeGestionLectura() {
    // Se obtiene el input de búsqueda por su id "searchBar"
    const searchInput = document.getElementById('searchBar');
    // Se obtiene el select de filtro por su id "filter"
    const filterSelect = document.getElementById('filter');
    // Se obtiene el botón para eliminar registros seleccionados por su id "delete_selected"
    const deleteSelectedButton = document.getElementById('delete_selected');
    // Se obtiene el checkbox principal que permite seleccionar o deseleccionar todas las filas, mediante su id "select_all"
    const selectAllCheckbox = document.getElementById('select_all');
    // Se obtiene el cuerpo (tbody) de la tabla de lecturas; se asume que la tabla tiene id "lectura_table"
    const tableBody = document.querySelector('#lectura_table tbody');
    // Se obtiene el div que mostrará el total de registros, mediante su id "total_records"
    const totalRecordsDiv = document.getElementById('total_records');
    // Se obtiene el contenedor de la paginación por su id "pagination"
    const paginationDiv = document.getElementById('pagination');

    // Se inicializa la variable currentPage con el valor 1 para indicar la primera página
    let currentPage = 1;
    // Se define la cantidad de registros que se mostrarán por página (10 en este caso)
    const recordsPerPage = 10;

    // -------------------------------------------------------------------------
    // Función interna para cargar las lecturas vía AJAX, según la página solicitada.
    function loadLecturas(page = 1) {
        // Se obtiene el valor actual del input de búsqueda
        const searchQuery = searchInput.value;
        // Se obtiene el valor seleccionado en el select de filtro
        const filter = filterSelect.value;
        
        // Se realiza una petición fetch a "crud_lecturas.php" con la acción "read" y se envían los parámetros:
        // - search: término de búsqueda,
        // - filter: criterio de filtro,
        // - page: número de página a cargar,
        // - records_per_page: cantidad de registros por página.
        fetch(`crud_lecturas.php?action=read&search=${searchQuery}&filter=${filter}&page=${page}&records_per_page=${recordsPerPage}`)
            .then(response => {
                // Si la respuesta HTTP no es OK, se procesa el error convirtiéndolo a JSON y lanzando una excepción.
                if (!response.ok) {
                    return response.json().then(error => {
                        throw new Error(error.error);
                    });
                }
                // Si la respuesta es correcta, se convierte a JSON.
                return response.json();
            })
            .then(data => {
                // Se limpia el contenido actual del cuerpo de la tabla para actualizar la lista
                tableBody.innerHTML = '';
                // Si el arreglo "lecturas" está vacío, es decir, no se encontraron lecturas
                if (data.lecturas.length === 0) {
                    // Se crea una nueva fila <tr>
                    const row = document.createElement('tr');
                    // Se crea una celda <td> que ocupará 7 columnas (colSpan = 7)
                    const cell = document.createElement('td');
                    cell.colSpan = 7;
                    // Se centra el texto dentro de la celda
                    cell.style.textAlign = 'center';
                    // Se asigna el mensaje "No se encontraron lecturas" a la celda
                    cell.textContent = 'No se encontraron lecturas';
                    // Se añade la celda a la fila
                    row.appendChild(cell);
                    // Se añade la fila al cuerpo de la tabla
                    tableBody.appendChild(row);
            
                    // Se actualiza el div de total de registros mostrando "0"
                    totalRecordsDiv.textContent = 'Total de registros: 0';
                    // Se limpia la paginación ya que no hay registros
                    paginationDiv.innerHTML = '';
                    // Se termina la ejecución de loadLecturas ya que no hay datos
                    return;
                }

                // Si se encontraron lecturas, se recorre cada una del arreglo "lecturas"
                data.lecturas.forEach((lectura, index) => {
                    // Se crea una nueva fila <tr> para cada lectura
                    const row = document.createElement('tr');
                    // Se construye el contenido HTML de la fila mediante una plantilla:
                    // • Primer <td>: checkbox para seleccionar la fila, con atributo data-id con el id de la lectura.
                    // • Segundo <td>: número secuencial calculado según la página y el índice.
                    // • Tercer <td>: nombre completo del usuario (concatenando nombre, apellido paterno y materno).
                    // • Cuarto <td>: título del libro.
                    // • Quinto <td>: fecha de inicio de lectura.
                    // • Sexto <td>: tiempo de lectura en minutos, seguido de " min".
                    // • Séptimo <td>: botón "Ver" para ver detalles, con atributo data-id.
                    row.innerHTML = `
                        <td><input type="checkbox" class="select_row" data-id="${lectura.id}"></td>
                        <td>${(page - 1) * recordsPerPage + index + 1}</td>
                        <td>${lectura.nombreUsuario} ${lectura.apPaterno} ${lectura.apMaterno}</td>
                        <td>${lectura.tituloLibro}</td>
                        <td>${lectura.fechaInicioLectura}</td>
                        <td>${lectura.tiempoLectura} min</td>
                        <td>
                            <div class="acciones-container">
                                <button class="btn ver grow" data-id="${lectura.id}">
                                    <i class="fas fa-eye"></i> Ver
                                </button>
                            </div>
                        </td>
                    `;
                    // Se agrega la fila creada al cuerpo de la tabla
                    tableBody.appendChild(row);
                });
    
                // Se actualiza el div que muestra el total de registros con el valor recibido en data.total
                totalRecordsDiv.textContent = `Total de registros: ${data.total}`;
                // Se llama a la función renderPagination para generar la paginación, pasando el total de registros y la página actual
                renderPagination(data.total, page);
    
                // Se fuerza el desmarcado del checkbox principal para que ningún registro quede seleccionado
                if (selectAllCheckbox) {
                    selectAllCheckbox.checked = false;
                }
            })
            .catch(error => {
                // Si ocurre algún error en la petición, se muestra en la consola y se alerta al usuario mediante SweetAlert
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message,
                });
            });
    }

    // ---------------------------------------------------------------------------
    // Función para renderizar la paginación con estilo “1 2 3 4 5 … 20”
    function renderPagination(totalRecords, currentPage) {
        // Se limpia el contenido actual del div de paginación
        paginationDiv.innerHTML = '';
        // Se calcula el número total de páginas dividiendo el total de registros entre el número de registros por página y redondeando hacia arriba
        const totalPages = Math.ceil(totalRecords / recordsPerPage);
        // Si no hay al menos una página (totalPages < 1), se termina la función sin mostrar nada
        if (totalPages < 1) return;

        // Se crea un elemento <ul> y se le asigna la clase "pagination-list" para aplicar estilos
        const ul = document.createElement('ul');
        ul.classList.add('pagination-list');

        // --- Botón "«" para retroceder ---
        // Se crea una lista (<li>) para el botón de retroceso
        const prevLi = document.createElement('li');
        // Se crea un enlace (<a>) que contendrá el icono de retroceso
        const prevA  = document.createElement('a');
        // Se asigna el icono de retroceso mediante Font Awesome
        prevA.innerHTML = '<i class="fas fa-chevron-left"></i>';
        // Si la página actual es la primera, se deshabilita el botón
        if (currentPage === 1) {
            prevA.classList.add('disabled');
            prevA.style.pointerEvents = 'none';
        } else {
            // De lo contrario, se asigna el número de la página anterior al atributo data-page
            prevA.dataset.page = currentPage - 1;
        }
        // Se añade el enlace a la lista y la lista al <ul>
        prevLi.appendChild(prevA);
        ul.appendChild(prevLi);

        // --- Páginas a mostrar ---
        if (totalPages <= 5) {
            // Si el total de páginas es 5 o menor, se muestran todas las páginas
            for (let i = 1; i <= totalPages; i++) {
                // Se crea un <li> y un enlace <a> para cada número de página
                const li = document.createElement('li');
                const a  = document.createElement('a');
                // El texto del enlace es el número de la página
                a.textContent = i;
                // Si la página es la actual, se marca con la clase "active"
                if (i === currentPage) {
                    a.classList.add('active');
                } else {
                    // Si no, se asigna el número de página al atributo data-page
                    a.dataset.page = i;
                }
                li.appendChild(a);
                ul.appendChild(li);
            }
        } else {
            // Si hay más de 5 páginas, se muestran las primeras 5 páginas
            for (let i = 1; i <= 5; i++) {
                const li = document.createElement('li');
                const a  = document.createElement('a');
                a.textContent = i;
                if (i === currentPage) {
                    a.classList.add('active');
                } else {
                    a.dataset.page = i;
                }
                li.appendChild(a);
                ul.appendChild(li);
            }
            // Se agrega un elemento <li> con el texto "..." para indicar la omisión de páginas intermedias
            const ellipsisLi = document.createElement('li');
            ellipsisLi.textContent = '...';
            ul.appendChild(ellipsisLi);

            // Se añade el botón para la última página
            const lastLi = document.createElement('li');
            const lastA  = document.createElement('a');
            // El texto del enlace es el número total de páginas
            lastA.textContent = totalPages;
            if (currentPage === totalPages) {
                lastA.classList.add('active');
            } else {
                lastA.dataset.page = totalPages;
            }
            lastLi.appendChild(lastA);
            ul.appendChild(lastLi);
        }

        // --- Botón "»" para avanzar ---
        const nextLi = document.createElement('li');
        const nextA  = document.createElement('a');
        // Se asigna el icono de avance mediante Font Awesome
        nextA.innerHTML = '<i class="fas fa-chevron-right"></i>';
        if (currentPage === totalPages) {
            // Si ya se está en la última página, se deshabilita el botón
            nextA.classList.add('disabled');
            nextA.style.pointerEvents = 'none';
        } else {
            // De lo contrario, se asigna el número de la siguiente página al atributo data-page
            nextA.dataset.page = currentPage + 1;
        }
        nextLi.appendChild(nextA);
        ul.appendChild(nextLi);

        // Se inserta el <ul> completo en el div de paginación
        paginationDiv.appendChild(ul);

        // Se asigna un evento "click" a cada enlace dentro del <ul> para cargar la página correspondiente
        ul.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', event => {
                // Se previene la acción por defecto del enlace (navegación)
                event.preventDefault();
                // Si el enlace tiene un atributo data-page, se llama a loadLecturas con ese número de página
                if (link.dataset.page) {
                    loadLecturas(parseInt(link.dataset.page));
                }
            });
        });
    }

    // ---------------------------------------------------------------------------
    // Evento: Búsqueda en tiempo real
    // Cada vez que el usuario escribe en el input de búsqueda se recarga la lista de lecturas
    searchInput.addEventListener('input', function() {
        loadLecturas(1);
    });

    // ---------------------------------------------------------------------------
    // Evento: Cambio en el select de filtro (orden)
    // Cuando se cambia el filtro, se recarga la lista de lecturas comenzando desde la primera página
    filterSelect.addEventListener('change', function() {
        loadLecturas(1);
    });

    // ---------------------------------------------------------------------------
    // Evento: Eliminación masiva de registros
    // Al hacer clic en el botón "delete_selected", se recopilan los IDs de los registros seleccionados
    deleteSelectedButton.addEventListener('click', function() {
        // Se crea un arreglo con los valores del atributo data-id de cada checkbox seleccionado
        const selectedIds = Array.from(document.querySelectorAll('.select_row:checked'))
            .map(checkbox => checkbox.dataset.id);
        
        // Si se ha seleccionado al menos un registro...
        if (selectedIds.length > 0) {
            // Se muestra una alerta de confirmación con SweetAlert2
            Swal.fire({
                title: '¿Estás seguro?',
                text: "No podrás revertir esto",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                cancelButtonText: 'Cancelar',
                confirmButtonText: 'Sí, eliminar'
            }).then((result) => {
                // Si el usuario confirma la eliminación...
                if (result.isConfirmed) {
                    // Se realiza una petición fetch a "crud_lecturas.php" con la acción "delete" enviando los IDs en formato JSON
                    fetch('crud_lecturas.php?action=delete', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ ids: selectedIds })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Si la eliminación fue exitosa, se muestra una alerta de éxito
                            Swal.fire({
                                icon: 'success',
                                title: 'Eliminado',
                                text: 'Los registros han sido eliminados correctamente',
                            })
                            .then(() => {
                                // Se desmarcan los checkboxes seleccionados
                                document.querySelectorAll('.select_row:checked')
                                    .forEach(checkbox => { checkbox.checked = false; });
    
                                // Se desmarca el checkbox principal
                                if (selectAllCheckbox) {
                                    selectAllCheckbox.checked = false;
                                }
    
                                // Se recarga la lista de lecturas manteniendo la página actual
                                loadLecturas(currentPage);
                            });
                        } else {
                            // Si hubo un error, se muestra una alerta de error
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Hubo un problema al eliminar los registros',
                            });
                        }
                    }).catch(error => {
                        console.error('Error:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Hubo un problema al eliminar los registros',
                        });
                    });
                }
            });
        } else {
            // Si no se seleccionó ningún registro, se muestra una alerta informativa
            Swal.fire({
                icon: 'info',
                title: 'Información',
                text: 'Seleccione al menos un registro para eliminar',
            });
        }
    });

    // ---------------------------------------------------------------------------
    // Evento: Seleccionar/Deseleccionar todos los registros
    // Se asigna un evento "change" al checkbox principal para marcar o desmarcar todos los checkboxes individuales
    selectAllCheckbox.addEventListener('change', function() {
        // Se seleccionan todos los checkboxes con la clase "select_row" y se iguala su estado al del checkbox principal
        document.querySelectorAll('.select_row').forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    }); 

    // ---------------------------------------------------------------------------
    // Evento: Delegación de eventos en el cuerpo de la tabla para manejar acciones en cada fila
    tableBody.addEventListener('click', function(event) {
        // -----------------------------
        // Caso: Eliminar una fila individual
        if (event.target.closest('.eliminar')) {
            // Se obtiene el id del registro a eliminar desde el atributo data-id del botón "eliminar"
            const id = event.target.closest('.eliminar').dataset.id;
            // Se muestra una alerta de confirmación con SweetAlert2
            Swal.fire({
                title: '¿Estás seguro?',
                text: "No podrás revertir esto",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                cancelButtonText: 'Cancelar',
                confirmButtonText: 'Sí, eliminar'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Se envía una petición para eliminar el registro individual, enviando el id en formato JSON
                    fetch(`crud_lecturas.php?action=delete`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ ids: [id] })
                    }).then(response => response.json())
                      .then(data => {
                          if (data.success) {
                              // Si la eliminación es exitosa, se muestra una alerta de éxito y se recarga la lista de lecturas
                              Swal.fire({
                                  icon: 'success',
                                  title: 'Eliminado',
                                  text: 'El registro ha sido eliminado correctamente',
                              });
                              loadLecturas(currentPage);
                          } else {
                              Swal.fire({
                                  icon: 'error',
                                  title: 'Error',
                                  text: 'Hubo un problema al eliminar el registro',
                              });
                          }
                      }).catch(error => {
                          console.error('Error:', error);
                          Swal.fire({
                              icon: 'error',
                              title: 'Error',
                              text: 'Hubo un problema al eliminar el registro',
                          });
                      });
                }
            });
        }
        // -----------------------------
        // Caso: Ver detalles de un registro
        if (event.target.closest('.ver')) {
            // Se obtiene el botón "ver" y luego la fila que lo contiene
            const btnVer = event.target.closest('.ver');
            const row = btnVer.closest('tr');
            // Se extraen los datos de las celdas correspondientes:
            // • Celda 3: nombre del usuario
            // • Celda 4: libro
            // • Celda 5: fecha de inicio
            // • Celda 6: tiempo de lectura
            const nombre = row.cells[2].textContent;
            const libro = row.cells[3].textContent;
            const fecha = row.cells[4].textContent;
            const tiempo = row.cells[5].textContent;
            // Se muestra un modal con los detalles formateados usando SweetAlert2
            Swal.fire({
                title: '<div style="text-align: left; color:rgb(23, 23, 24);">Detalles de Lectura</div>',
                html: `
                    <p style="text-align: left; color: rgb(32, 32, 32);">
                        <i class="fas fa-user" style="color:rgb(44, 128, 184);"></i> 
                        <strong>Nombre:</strong> ${nombre}
                    </p>
                    <p style="text-align: left; color: rgb(32, 32, 32);">
                        <i class="fas fa-book" style="color:rgb(44, 128, 184);"></i> 
                        <strong>Libro:</strong> ${libro}
                    </p>
                    <p style="text-align: left; color: rgb(32, 32, 32);">
                        <i class="fas fa-calendar-alt" style="color:rgb(44, 128, 184);"></i> 
                        <strong>Fecha:</strong> ${fecha}
                    </p>
                    <p style="text-align: left; color: rgb(32, 32, 32);">
                        <i class="fas fa-clock" style="color:rgb(44, 128, 184);"></i> 
                        <strong>Tiempo de Lectura:</strong> ${tiempo}
                    </p>
                `,
                showCloseButton: true, // Muestra un botón de cierre en el modal
                confirmButtonText: 'Cerrar', // Texto del botón de confirmación
                showClass: { popup: '' }, // Sin animaciones de entrada
                hideClass: { popup: '' }  // Sin animaciones de salida
            });
        }
    });

    // ---------------------------------------------------------------------------
    // Llamada inicial: se carga la lista de lecturas (página actual)
    loadLecturas();
}

// ---------------------------------------------------------------------------
// Se inicializa la gestión de lecturas cuando el documento ha cargado
document.addEventListener('DOMContentLoaded', function() {
    initializeGestionLectura();
});

// ---------------------------------------------------------------------------
// Asignación de eventos para exportar e imprimir PDF de lecturas
// Se asigna un evento "click" al botón con id "download_pdf" para exportar a PDF
document.getElementById('download_pdf').addEventListener('click', function() {
    exportToPDF();
});
// Se asigna un evento "click" al botón con id "print_pdf" para imprimir el PDF
document.getElementById('print_pdf').addEventListener('click', function() {
    exportToPDF(true);
});

// ---------------------------------------------------------------------------
// Función para exportar a PDF o imprimir, según el parámetro "print"
// Si print es true, se abre una ventana para imprimir; de lo contrario, se descarga el PDF
function exportToPDF(print = false) {
    // Se verifica que pdfMake esté cargado; de lo contrario, se muestra un error
    if (!window.pdfMake) {
        Swal.fire('Error', 'No se pudo cargar pdfMake.', 'error');
        return;
    }
    // Se obtiene el valor actual del filtro
    const filter = document.getElementById('filter').value;

    // Se realiza una petición fetch al script "crud_lecturas.php" con la acción "read_all" y el filtro seleccionado
    fetch(`crud_lecturas.php?action=read_all&filter=${filter}`)
        .then(response => {
            // Si la respuesta no es OK, se lanza un error
            if (!response.ok) {
                throw new Error('Error al obtener los registros');
            }
            return response.json();
        })
        .then(data => {
            // Se extraen los datos de lecturas y se calcula el total de registros
            const lecturasData = data.lecturas;
            const totalRegistros = lecturasData.length;
            // Se obtiene la fecha y hora actual formateada utilizando getCurrentDateTime
            const currentDateTime = getCurrentDateTime('America/Mexico_City');
            const body = []; // Array que contendrá las filas de la tabla para el PDF

            // Se definen los encabezados del PDF
            const headers = ['#', 'Nombre', 'Libro', 'Fecha Inicio', 'Tiempo de Lectura (min)'];
            // Se formatean los encabezados para que aparezcan en negrita y centrados, y se agregan al cuerpo
            body.push(headers.map(header => ({ text: header, bold: true, alignment: 'center' })));

            // Por cada lectura, se crea una fila con los datos formateados:
            lecturasData.forEach((lectura, index) => {
                // Se crea el nombre completo concatenando el nombre y los apellidos
                const nombreCompleto = `${lectura.nombreUsuario} ${lectura.apPaterno} ${lectura.apMaterno}`;
                const dataRow = [
                    { text: index + 1, alignment: 'center' },
                    { text: nombreCompleto, alignment: 'center' },
                    { text: lectura.tituloLibro, alignment: 'center' },
                    { text: lectura.fechaInicioLectura, alignment: 'center' },
                    { text: `${lectura.tiempoLectura} min`, alignment: 'center' }
                ];
                // Se agrega la fila al array "body"
                body.push(dataRow);
            });

            // Se define el documento PDF con encabezado, contenido (tabla) y pie de página
            const docDefinition = {
                header: {
                    columns: [
                        {
                            text: 'Primaria Manuel Del Mazo Villsante - Gestión de Lecturas',
                            alignment: 'left',
                            margin: [10, 10],
                            fontSize: 10
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
                            fontSize: 10
                        }
                    ]
                },
                // Se define el pie de página mostrando la página actual y total
                footer: function(currentPage, pageCount) {
                    return {
                        text: `Página ${currentPage} de ${pageCount}`,
                        alignment: 'center',
                        margin: [0, 10]
                    };
                },
                // El contenido es una tabla que usa los datos almacenados en "body"
                content: [
                    {
                        table: {
                            headerRows: 1,
                            // Se define que cada columna tendrá ancho automático, basado en la cantidad de encabezados
                            widths: Array(headers.length).fill('auto'),
                            body: body
                        },
                        layout: 'lightHorizontalLines' // Se utiliza un layout con líneas horizontales claras
                    }
                ],
                // Se definen los márgenes de la página, el tamaño (A4) y la orientación (horizontal)
                pageMargins: [40, 60, 40, 60],
                pageSize: 'A4',
                pageOrientation: 'landscape'
            };

            // Se crea el PDF con pdfMake a partir de la definición anterior
            const pdfDoc = pdfMake.createPdf(docDefinition);
            if (print) {
                // Si se ha pasado el parámetro "print" como true, se obtiene el PDF como DataURL y se abre en una nueva ventana para imprimirlo
                pdfDoc.getDataUrl((dataUrl) => {
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write('<iframe width="100%" height="100%" src="' + dataUrl + '"></iframe>');
                });
            } else {
                // Si no, se descarga el PDF con el nombre "lecturas.pdf"
                pdfDoc.download("lecturas.pdf");
            }
        })
        .catch(error => {
            // Si ocurre un error en la obtención de los registros, se muestra en consola y se alerta al usuario
            console.error('Error al obtener los registros:', error);
            Swal.fire('Error', 'Hubo un problema al obtener los registros.', 'error');
        });
}

// ---------------------------------------------------------------------------
// Función auxiliar para obtener la fecha y hora actual en el formato "Sáb, 2025-03-01 01:14:08"
// Esta función se utiliza en la exportación e impresión de PDF
function getCurrentDateTime(timeZone = 'America/Mexico_City') {
    const now = new Date(); // Crea un objeto Date con la fecha y hora actual
    // Obtiene el día de la semana en formato abreviado y elimina puntos
    const weekday = now.toLocaleDateString('es-ES', {
      timeZone: timeZone,
      weekday: 'short'
    }).replace(/\./g, '');
    // Obtiene el día en formato de 2 dígitos
    const day = now.toLocaleDateString('es-ES', { timeZone: timeZone, day: '2-digit' });
    // Obtiene el mes en formato de 2 dígitos
    const month = now.toLocaleDateString('es-ES', { timeZone: timeZone, month: '2-digit' });
    // Obtiene el año en formato numérico
    const year = now.toLocaleDateString('es-ES', { timeZone: timeZone, year: 'numeric' });
    // Obtiene la hora, minutos y segundos en formato de 24 horas con 2 dígitos cada uno
    const timeString = now.toLocaleTimeString('es-ES', {
      timeZone: timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    // Se concatena el día de la semana con una coma
    const formattedWeekday = weekday + ',';
    // Se retorna la cadena formateada
    return `${formattedWeekday} ${year}-${month}-${day} ${timeString}`;
}
