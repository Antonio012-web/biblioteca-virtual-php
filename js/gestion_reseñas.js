// Función para actualizar el total de reseñas en la página
function actualizarTotalReseñas() {
    // Selecciona todos los elementos <tr> dentro de la tabla con id "reseñasList" y cuenta cuántos hay
    const totalReseñas = document.querySelectorAll('#reseñasList tr').length;
    // Busca el elemento con id "totalReseñas" y asigna como contenido de texto el total obtenido
    document.getElementById('totalReseñas').textContent = totalReseñas;
}

// Función para verificar si la tabla tiene reseñas, si no mostrar "No se encontraron reseñas"
function verificarReseñas() {
    // Cuenta el número de filas (<tr>) dentro de la tabla "reseñasList"
    const filasRestantes = document.querySelectorAll('#reseñasList tr').length;

    // Si el número de filas es 0 (no hay reseñas)
    if (filasRestantes === 0) {
        // Define una cadena con código HTML que representa una fila con mensaje de "No se encontraron reseñas"
        const noDataRow = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px;">
                    No se encontraron reseñas.
                </td>
            </tr>
        `;
        // Reemplaza el contenido HTML del elemento con id "reseñasList" por el mensaje definido
        document.getElementById('reseñasList').innerHTML = noDataRow;
    }

    // Llama a la función para actualizar el contador total de reseñas mostrado en la página
    actualizarTotalReseñas();
}

// Delegación de eventos para el contenedor de la tabla "reseñasList"
document.getElementById('reseñasList').addEventListener('click', function(event) {
    // Si el clic ocurrió en un elemento o dentro de uno que tenga la clase "ver-reseña"
    if (event.target.closest('.ver-reseña')) {
        // Obtiene el botón "Ver" haciendo uso de closest para asegurar que se capture el elemento correcto
        const button = event.target.closest('.ver-reseña');
        // Extrae el atributo "data-usuario" que contiene el nombre del usuario de la reseña
        const usuario = button.getAttribute('data-usuario');
        // Extrae el atributo "data-libro" que contiene el título del libro reseñado
        const libro = button.getAttribute('data-libro');
        // Extrae el atributo "data-puntuacion" que contiene la puntuación asignada en la reseña
        const puntuacion = button.getAttribute('data-puntuacion');
        // Extrae el atributo "data-reseña" que contiene el texto completo de la reseña
        const reseña = button.getAttribute('data-reseña');
        // Extrae el atributo "data-fecha" que contiene la fecha en la que se realizó la reseña
        const fecha = button.getAttribute('data-fecha');

        // Asigna el valor de "usuario" al elemento del modal identificado como "modalUsuario"
        document.getElementById('modalUsuario').textContent = usuario;
        // Asigna el valor de "libro" al elemento del modal identificado como "modalLibro"
        document.getElementById('modalLibro').textContent = libro;
        // Asigna el valor de "puntuacion" al elemento del modal identificado como "modalPuntuacion"
        document.getElementById('modalPuntuacion').textContent = puntuacion;
        // Asigna el texto de la reseña al elemento del modal identificado como "modalReseñaTexto"
        document.getElementById('modalReseñaTexto').textContent = reseña;
        // Asigna la fecha al elemento del modal identificado como "modalFecha"
        document.getElementById('modalFecha').textContent = fecha;

        // Muestra el modal de reseña estableciendo su propiedad display a 'block'
        document.getElementById('modalReseña').style.display = 'block';
    } else if (event.target.closest('.eliminar-reseña')) {
        // Si el clic ocurrió en el botón "Eliminar" (o en su contenedor)
        // Obtiene el botón "Eliminar" usando closest para capturar el elemento con la clase "eliminar-reseña"
        const button = event.target.closest('.eliminar-reseña');
        // Extrae el atributo "data-id" que contiene el identificador de la reseña a eliminar
        const id = button.getAttribute('data-id');
        // Llama a SweetAlert para mostrar un mensaje de confirmación antes de eliminar
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¡Esta acción no se puede deshacer!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            // Si el usuario confirma la acción (result.isConfirmed es true)
            if (result.isConfirmed) {
                // Llama a la función para eliminar la reseña pasando el id correspondiente
                eliminarReseña(id);
            }
        });
    }
});

// Cuando el documento haya cargado completamente (evento DOMContentLoaded)
document.addEventListener('DOMContentLoaded', function () {
    // Carga la primera página de reseñas llamando a la función cargarReseñas con el parámetro 1
    cargarReseñas(1);
});

// Función para abrir el modal con los datos completos de la reseña (alternativa a la delegación anterior)
function abrirModalReseña(usuario, libro, puntuacion, reseña, fecha) {
    // Asigna el nombre del usuario al campo del modal; si no existe, muestra "No disponible"
    document.getElementById('modalUsuario').textContent = usuario || 'No disponible';
    // Asigna el nombre del libro al campo del modal; si no existe, muestra "No disponible"
    document.getElementById('modalLibro').textContent = libro || 'No disponible';
    // Asigna la puntuación al campo del modal; si no existe, muestra "No disponible"
    document.getElementById('modalPuntuacion').textContent = puntuacion || 'No disponible';
    // Asigna el texto de la reseña al campo del modal; si no existe, muestra "No disponible"
    document.getElementById('modalReseñaTexto').textContent = reseña || 'No disponible';
    // Asigna la fecha de la reseña al campo del modal; si no existe, muestra "No disponible"
    document.getElementById('modalFecha').textContent = fecha || 'No disponible';

    // Muestra el modal de reseña estableciendo el display en 'block'
    document.getElementById('modalReseña').style.display = 'block';
}

// Función para cerrar el modal de reseña
function cerrarModalReseña() {
    // Oculta el modal de reseña estableciendo su propiedad display en 'none'
    document.getElementById('modalReseña').style.display = 'none';
}

// Asigna un evento al botón con la clase "close" para cerrar el modal al hacer clic
document.querySelector('.close').addEventListener('click', function() {
    // Llama a la función para cerrar el modal
    cerrarModalReseña();
});

// Asigna un evento al objeto window para detectar clics fuera del contenido del modal
window.onclick = function(event) {
    // Selecciona el elemento modal usando su id
    const modal = document.getElementById('modalReseña');
    // Si el clic ocurrió en el fondo del modal (el propio modal)
    if (event.target === modal) {
        // Llama a la función para cerrar el modal
        cerrarModalReseña();
    }
};

// Función para cargar reseñas de una página específica
function cargarReseñas(pagina) {
    // Realiza una petición GET a "gestion_reseñas.php" enviando como parámetro el número de página
    fetch(`gestion_reseñas.php?page=${pagina}`, {
        method: 'GET',
        headers: {
            // Se indica que la petición es realizada vía AJAX
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    // Convierte la respuesta a formato JSON
    .then(response => response.json())
    .then(data => {
        // Selecciona el contenedor de reseñas con id "reseñasList"
        const reseñasList = document.getElementById('reseñasList');
        // Limpia el contenido HTML previo del contenedor
        reseñasList.innerHTML = '';

        // Verifica si el arreglo "reseñas" de la respuesta tiene elementos
        if (data.reseñas.length > 0) {
            // Itera sobre cada reseña y su índice
            data.reseñas.forEach((reseña, index) => {
                // Crea una cadena con la estructura HTML para una fila (<tr>) que representa la reseña
                let row = `
                    <tr data-id="${reseña.id}">
                        <td><input type="checkbox" class="select_row"></td>
                        <td>${index + 1}</td>
                        <td>${reseña.Usuario}</td>
                        <td>${reseña.Libro}</td>
                        <td>${reseña.Puntuacion}</td>
                        <td>${reseña.Reseña.substring(0, 50)}...</td>
                        <td>${reseña.FechaReseña}</td>
                        <td class="acciones">
                            <button class="btn ver-reseña" data-id="${reseña.id}" data-usuario="${reseña.Usuario}" data-libro="${reseña.Libro}" data-puntuacion="${reseña.Puntuacion}" data-reseña="${reseña.Reseña}" data-fecha="${reseña.FechaReseña}"><i class="fa-solid fa-eye"></i>Ver</button>
                            <button class="btn eliminar-reseña" data-id="${reseña.id}"><i class="fa-solid fa-trash-can"></i> Eliminar</button>
                        </td>
                    </tr>
                `;
                // Inserta la fila generada al final del contenedor "reseñasList"
                reseñasList.insertAdjacentHTML('beforeend', row);
            });
            // Llama a la función que muestra la barra de paginación
            mostrarPaginacion();
        } else {
            // Si no se encontraron reseñas, inserta una fila informativa en el contenedor
            reseñasList.innerHTML = '<tr><td colspan="8">No se encontraron reseñas.</td></tr>';
            // Llama a la función que oculta la barra de paginación
            ocultarPaginacion();
        }

        // Actualiza los botones de paginación con los datos de total de páginas y la página actual
        actualizarBotonesPaginacion(data.total_pages, data.current_page);
        // Actualiza el contador total de reseñas mostrado en la página
        actualizarTotalReseñas();
    })
    // En caso de error en la petición, lo muestra en la consola
    .catch(error => console.error('Error al cargar reseñas:', error));
}

// Función para actualizar los botones de paginación
function actualizarBotonesPaginacion(total_pages, current_page) {
    // Selecciona el contenedor de la paginación mediante la clase "pagination"
    const paginacionDiv = document.querySelector('.pagination');
    // Limpia cualquier contenido previo del contenedor
    paginacionDiv.innerHTML = '';

    // Si la página actual es mayor a 1, crea un enlace para la página anterior
    if (current_page > 1) {
        paginacionDiv.innerHTML += `<a href="#" class="pagination-link" data-page="${current_page - 1}">&laquo; Anterior</a>`;
    }

    // Bucle que crea un enlace para cada página disponible (de 1 hasta total_pages)
    for (let i = 1; i <= total_pages; i++) {
        // Determina si la página en el bucle es la actual para aplicar la clase "active"
        let activeClass = (i === current_page) ? 'active' : '';
        // Agrega el enlace de la página con su número y la clase activa si corresponde
        paginacionDiv.innerHTML += `<a href="#" class="pagination-link ${activeClass}" data-page="${i}">${i}</a>`;
    }

    // Si la página actual es menor que el total de páginas, crea un enlace para la página siguiente
    if (current_page < total_pages) {
        paginacionDiv.innerHTML += `<a href="#" class="pagination-link" data-page="${current_page + 1}">Siguiente &raquo;</a>`;
    }

    // Asigna los eventos de clic a cada uno de los enlaces de paginación generados
    asignarEventosPaginacion();
}

function ordenarReseñas() {
    const ordenarPor = document.getElementById('ordenarReseñas').value;
    // Se obtienen todas las filas (<tr>) de la tabla de reseñas
    const filas = Array.from(document.querySelectorAll('#reseñasList tr'));
    
    filas.sort((a, b) => {
        // Convertir el contenido de la séptima columna a objetos Date
        const fechaA = new Date(a.querySelector('td:nth-child(7)').textContent.trim());
        const fechaB = new Date(b.querySelector('td:nth-child(7)').textContent.trim());
        
        // Si se selecciona "Más reciente", se ordena de mayor a menor (descendente)
        if (ordenarPor === 'mas_reciente') {
            return fechaB - fechaA;
        }
        // Si se selecciona "Más antiguo", se ordena de menor a mayor (ascendente)
        else if (ordenarPor === 'mas_antiguo') {
            return fechaA - fechaB;
        }
    });
    
    // Se reinserta la lista de filas ordenadas en el contenedor de la tabla
    filas.forEach(fila => document.getElementById('reseñasList').appendChild(fila));
}


// Función para asignar eventos de clic a los botones de paginación
function asignarEventosPaginacion() {
    // Selecciona todos los enlaces que tienen la clase "pagination-link"
    const paginationLinks = document.querySelectorAll('.pagination-link');
    // Para cada enlace, se asigna un evento que impide la acción por defecto y carga la página correspondiente
    paginationLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            // Previene el comportamiento por defecto del enlace (evitar recargar la página)
            event.preventDefault();
            // Obtiene el número de página del atributo "data-page" del enlace clickeado
            const page = this.getAttribute('data-page');
            // Llama a la función cargarReseñas pasando la página seleccionada
            cargarReseñas(page);
        });
    });
}

// Asigna un evento al botón con id "download_pdf" para exportar las reseñas a PDF
document.getElementById('download_pdf').addEventListener('click', function() {
    // Inicializa un arreglo vacío que se usará para construir las filas de la tabla en el PDF
    const body = [];

    // Define los encabezados de la tabla a exportar
    const headers = ['#', 'Usuario', 'Libro', 'Puntuación', 'Reseña', 'Fecha'];
    // Agrega la fila de encabezados al arreglo "body", con formato de negrita y centrado
    body.push(headers.map(header => ({ text: header, bold: true, alignment: 'center' })));

    // Convierte todas las filas (<tr>) de la tabla de reseñas en un arreglo y extrae la información necesaria
    const reseñasData = Array.from(document.querySelectorAll('#reseñasList tr')).map((row, index) => {
        // Obtiene el texto completo de la reseña desde el atributo "data-reseña" del botón "Ver"
        const reseñaCompleta = row.querySelector('.ver-reseña').getAttribute('data-reseña');
        // Retorna un objeto con la información extraída de cada columna de la fila
        return {
            usuario: row.cells[2].textContent,
            libro: row.cells[3].textContent,
            puntuacion: row.cells[4].textContent,
            reseña: reseñaCompleta,
            fecha: row.cells[6].textContent
        };
    });

    // Por cada reseña, crea una fila de datos para la tabla del PDF
    reseñasData.forEach((reseña, index) => {
        // Define la estructura de cada celda en la fila, con formateo y centrado
        const dataRow = [
            { text: index + 1, alignment: 'center' },
            { text: reseña.usuario, alignment: 'center' },
            { text: reseña.libro, alignment: 'center' },
            { text: reseña.puntuacion, alignment: 'center' },
            { text: reseña.reseña, alignment: 'center', fontSize: 10, margin: [0, 5, 0, 5] },
            { text: reseña.fecha, alignment: 'center' }
        ];
        // Agrega la fila de datos al arreglo "body"
        body.push(dataRow);
    });

    // Obtiene el total de registros a exportar (número de reseñas)
    const totalRegistros = reseñasData.length;
    // Obtiene la fecha y hora actual formateada para la zona horaria de "America/Mexico_City"
    const currentDateTime = getCurrentDateTime('America/Mexico_City');

    // Define la estructura del documento PDF, incluyendo encabezado, pie de página, y contenido (tabla)
    const docDefinition = {
        header: {
            columns: [
                {
                    text: 'Biblioteca Virtual - Gestión de Reseñas',
                    alignment: 'left',
                    margin: [10, 10],
                    fontSize: 12
                },
                { text: `Fecha y hora: ${currentDateTime}`, alignment: 'center', margin: [10, 10], fontSize: 10 },
                {
                    text: `Total de registros: ${totalRegistros}`,
                    alignment: 'right',
                    margin: [10, 10],
                    fontSize: 12
                }
            ]
        },
        // Función que define el pie de página, mostrando la página actual y el total de páginas
        footer: function(currentPage, pageCount) {
            return {
                text: `Página ${currentPage} de ${pageCount}`,
                alignment: 'center',
                margin: [0, 10]
            };
        },
        // Define el contenido principal del PDF: una tabla con los datos
        content: [
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', 'auto', 'auto', 'auto', '*', 'auto'],
                    body: body
                },
                layout: 'lightHorizontalLines'
            }
        ],
        // Define los márgenes, tamaño y orientación de la página del PDF
        pageMargins: [40, 60, 40, 60],
        pageSize: 'A4',
        pageOrientation: 'landscape'
    };

    // Crea el PDF usando pdfMake y lo descarga con el nombre "reseñas.pdf"
    pdfMake.createPdf(docDefinition).download("reseñas.pdf");
});

// Asigna un evento al botón con id "print_pdf" para imprimir las reseñas en PDF
document.getElementById('print_pdf').addEventListener('click', function() {
    // Inicializa el arreglo "body" que contendrá las filas para la tabla del PDF a imprimir
    const body = [];

    // Define los encabezados de la tabla que se imprimirán
    const headers = ['#', 'Usuario', 'Libro', 'Puntuación', 'Reseña', 'Fecha'];
    // Agrega la fila de encabezados al arreglo "body" con formato
    body.push(headers.map(header => ({ text: header, bold: true, alignment: 'center' })));

    // Convierte cada fila (<tr>) de la tabla en un objeto con la información necesaria
    const reseñasData = Array.from(document.querySelectorAll('#reseñasList tr')).map((row, index) => {
        // Obtiene el texto completo de la reseña desde el atributo "data-reseña" del botón "Ver"
        const reseñaCompleta = row.querySelector('.ver-reseña').getAttribute('data-reseña');
        // Retorna un objeto con los datos extraídos de la fila
        return {
            usuario: row.cells[2].textContent,
            libro: row.cells[3].textContent,
            puntuacion: row.cells[4].textContent,
            reseña: reseñaCompleta,
            fecha: row.cells[6].textContent
        };
    });

    // Por cada reseña, se construye una fila de datos para el PDF
    reseñasData.forEach((reseña, index) => {
        // Define cada celda de la fila con su respectivo formato
        const dataRow = [
            { text: index + 1, alignment: 'center' },
            { text: reseña.usuario, alignment: 'center' },
            { text: reseña.libro, alignment: 'center' },
            { text: reseña.puntuacion, alignment: 'center' },
            { text: reseña.reseña, alignment: 'center', fontSize: 10, margin: [0, 5, 0, 5] },
            { text: reseña.fecha, alignment: 'center' }
        ];
        // Agrega la fila construida al arreglo "body"
        body.push(dataRow);
    });

    // Obtiene el total de registros (número de reseñas)
    const totalRegistros = reseñasData.length;
    // Obtiene la fecha y hora actual formateada para la zona horaria "America/Mexico_City"
    const currentDateTime = getCurrentDateTime('America/Mexico_City');

    // Define la estructura del documento PDF a imprimir, similar a la exportación
    const docDefinition = {
        header: {
            columns: [
                {
                    text: 'Biblioteca Virtual - Gestión de Reseñas',
                    alignment: 'left',
                    margin: [10, 10],
                    fontSize: 12
                },
                { text: `Fecha y hora: ${currentDateTime}`, alignment: 'center', margin: [10, 10], fontSize: 10 },
                {
                    text: `Total de registros: ${totalRegistros}`,
                    alignment: 'right',
                    margin: [10, 10],
                    fontSize: 12
                }
            ]
        },
        // Pie de página que muestra la numeración de páginas
        footer: function(currentPage, pageCount) {
            return {
                text: `Página ${currentPage} de ${pageCount}`,
                alignment: 'center',
                margin: [0, 10]
            };
        },
        // Contenido principal del PDF: una tabla con los datos
        content: [
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', 'auto', 'auto', 'auto', '*', 'auto'],
                    body: body
                },
                layout: 'lightHorizontalLines'
            }
        ],
        // Configura los márgenes, tamaño y orientación de la página del PDF a imprimir
        pageMargins: [40, 60, 40, 60],
        pageSize: 'A4',
        pageOrientation: 'landscape'
    };

    // Crea el PDF y obtiene la URL de los datos para abrirlo en una nueva ventana con un iframe
    const pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getDataUrl((dataUrl) => {
        // Abre una nueva ventana y escribe un iframe que carga el PDF para impresión
        const printWindow = window.open('', '_blank');
        printWindow.document.write('<iframe width="100%" height="100%" src="' + dataUrl + '"></iframe>');
    });
});

// Evento para seleccionar o deseleccionar todas las reseñas con un solo checkbox
document.getElementById('select_all').addEventListener('change', function() {
    // Selecciona todos los checkboxes que tienen la clase "select_row"
    let checkboxes = document.querySelectorAll('.select_row');
    // Para cada checkbox, asigna su propiedad "checked" según el estado del checkbox principal
    checkboxes.forEach(checkbox => checkbox.checked = this.checked);
});

// Evento para la barra de búsqueda en tiempo real
document.getElementById('searchBar').addEventListener('input', function() {
    // Convierte el valor del input a minúsculas para realizar una búsqueda insensible a mayúsculas/minúsculas
    let searchTerm = this.value.toLowerCase();
    // Selecciona todas las filas (<tr>) de la tabla "reseñasList"
    let reseñas = document.querySelectorAll('#reseñasList tr');
    
    // Para cada fila, obtiene su contenido de texto en minúsculas y determina si contiene el término de búsqueda
    reseñas.forEach(function(reseña) {
        let texto = reseña.textContent.toLowerCase();
        // Si el texto contiene el término, muestra la fila; si no, la oculta
        reseña.style.display = texto.includes(searchTerm) ? '' : 'none';
    });
});

// Evento para el botón "Eliminar seleccionados" que elimina reseñas marcadas
document.getElementById('delete_selected').addEventListener('click', function () {
    // Selecciona todos los checkboxes marcados dentro de las filas de reseñas
    const selectedCheckboxes = document.querySelectorAll('.select_row:checked');
    // Extrae los IDs de cada reseña seleccionada buscando el atributo "data-id" en el <tr> contenedor
    const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.closest('tr').dataset.id);

    // Si se seleccionó al menos una reseña
    if (selectedIds.length > 0) {
        // Muestra un mensaje de confirmación usando SweetAlert para eliminar múltiples reseñas
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¡Esta acción no se puede deshacer!',
            icon: 'warning',
            showCancelButton: true, 
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            // Si el usuario confirma la eliminación
            if (result.isConfirmed) {
                // Llama a la función para eliminar reseñas de forma masiva, pasando los IDs y los checkboxes seleccionados
                eliminarReseñasMasivas(selectedIds, selectedCheckboxes);
            }
        });
    } else {
        // Si no se seleccionó ninguna reseña, muestra una alerta informativa
        Swal.fire('Información', 'Selecciona al menos un registro para eliminar.', 'info');
    }
});

// Función para eliminar múltiples reseñas de forma masiva
function eliminarReseñasMasivas(ids, selectedCheckboxes) {
    // Realiza una petición POST a "crud_reseñas.php" enviando la acción "eliminar_masivo" y los IDs a eliminar
    fetch('crud_reseñas.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        // Se construye el body con los parámetros requeridos
        body: new URLSearchParams({
            'action': 'eliminar_masivo',
            'ids': JSON.stringify(ids)
        })
    })
    // Convierte la respuesta en formato JSON
    .then(response => response.json())
    .then(data => {
        // Si la respuesta indica éxito en la eliminación
        if (data.success) {
            // Desmarca cada uno de los checkboxes que estaban seleccionados
            selectedCheckboxes.forEach(checkbox => { checkbox.checked = false; });
            // Selecciona el checkbox principal para "select_all"
            const mainCheckbox = document.getElementById('select_all');
            // Si existe el checkbox principal, se desmarca también
            if (mainCheckbox) {
                mainCheckbox.checked = false;
            }
            // Para cada ID eliminado, busca y elimina la fila (<tr>) correspondiente en la tabla
            ids.forEach(id => {
                const row = document.querySelector(`tr[data-id='${id}']`);
                if (row) row.remove();
            });
            // Muestra un mensaje de éxito usando SweetAlert
            Swal.fire('¡Eliminado!', 'Las reseñas seleccionadas han sido eliminadas.', 'success');
            // Actualiza el contador total de reseñas y verifica si quedan reseñas
            actualizarTotalReseñas();
            verificarReseñas();
        } else {
            // Si la eliminación falla, muestra un mensaje de error
            Swal.fire('Error', 'Hubo un problema al eliminar las reseñas', 'error');
        }
    })
    // En caso de error en la petición, lo muestra en la consola
    .catch(error => console.error('Error:', error));
}

// Función para eliminar una reseña individual
function eliminarReseña(id) {
    // Realiza una petición POST a "crud_reseñas.php" enviando la acción "eliminar" y el id de la reseña a eliminar
    fetch('crud_reseñas.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        // Se construye el body con los parámetros necesarios
        body: new URLSearchParams({
            'action': 'eliminar',
            'id': id
        })
    })
    // Convierte la respuesta a JSON
    .then(response => response.json())
    .then(data => {
        // Si la respuesta indica éxito en la eliminación
        if (data.success) {
            // Elimina la fila (<tr>) que contiene la reseña eliminada, identificada por su "data-id"
            document.querySelector(`tr[data-id='${id}']`).remove();
            // Muestra un mensaje de éxito con SweetAlert
            Swal.fire('¡Eliminado!', 'La reseña ha sido eliminada.', 'success');
            // Actualiza el contador de reseñas y verifica si quedan reseñas en la tabla
            actualizarTotalReseñas();
            verificarReseñas();
        } else {
            // Si ocurre un error, muestra un mensaje de error
            Swal.fire('Error', 'Hubo un problema al eliminar la reseña', 'error');
        }
    })
    // En caso de error en la petición, lo muestra en la consola
    .catch(error => console.error('Error:', error));
}

// Función para actualizar el total de reseñas en la página consultando el servidor
function actualizarTotalReseñas() {
    // Realiza una petición GET a "crud_reseñas.php" con la acción "contar" para obtener el total de reseñas
    fetch('crud_reseñas.php?action=contar', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    // Convierte la respuesta a formato JSON
    .then(response => response.json())
    .then(data => {
        // Extrae el total de registros de la respuesta
        const totalRecords = data.total;
        // Actualiza el contenido del elemento con id "total_records" para mostrar el total obtenido
        document.getElementById('total_records').textContent = `Total de registros: ${totalRecords}`;
    })
    // En caso de error, lo muestra en la consola
    .catch(error => console.error('Error al actualizar el total de reseñas:', error));
}

// Función para verificar si quedan reseñas y, en caso de no haber, mostrar el mensaje "No se encontraron reseñas"
function verificarReseñas() {
    // Cuenta el número de filas (<tr>) presentes en la tabla "reseñasList"
    const filasRestantes = document.querySelectorAll('#reseñasList tr').length;

    // Si no quedan filas (es decir, no hay reseñas)
    if (filasRestantes === 0) {
        // Define una cadena con código HTML que representa una fila con el mensaje de "No se encontraron reseñas"
        const noDataRow = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px;">
                    No se encontraron reseñas.
                </td>
            </tr>
        `;
        // Reemplaza el contenido del contenedor "reseñasList" por el mensaje definido
        document.getElementById('reseñasList').innerHTML = noDataRow;
        // Oculta la barra de paginación ya que no hay registros que paginar
        ocultarPaginacion();
    } else {
        // Si existen reseñas, se asegura de que la barra de paginación se muestre
        mostrarPaginacion();
    }

    // Actualiza el contador total de reseñas mostrado en la interfaz
    actualizarTotalReseñas();
}

// Función para ocultar la barra de paginación
function ocultarPaginacion() {
    // Selecciona el contenedor de la paginación usando la clase "pagination"
    const paginacionDiv = document.querySelector('.pagination');
    // Si el contenedor existe, se establece su propiedad display en "none" para ocultarlo
    if (paginacionDiv) {
        paginacionDiv.style.display = 'none';
    }
}

// Función para mostrar la barra de paginación
function mostrarPaginacion() {
    // Selecciona el contenedor de la paginación mediante la clase "pagination"
    const paginacionDiv = document.querySelector('.pagination');
    // Si el contenedor existe, se establece su propiedad display en "flex" para mostrarlo
    if (paginacionDiv) {
        paginacionDiv.style.display = 'flex';
    }
}

// Función para cargar reseñas de una página específica y gestionar la paginación
function cargarReseñas(pagina) {
    // Realiza una petición GET a "gestion_reseñas.php", enviando el número de página solicitado como parámetro
    fetch(`gestion_reseñas.php?page=${pagina}`, {
        method: 'GET',
        headers: {
            // Indica que se trata de una petición AJAX
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    // Convierte la respuesta a formato JSON
    .then(response => response.json())
    .then(data => {
        // Selecciona el contenedor de reseñas con id "reseñasList"
        const reseñasList = document.getElementById('reseñasList');
        // Limpia el contenido HTML previo del contenedor
        reseñasList.innerHTML = '';

        // Si se encuentran reseñas en la respuesta
        if (data.reseñas.length > 0) {
            // Itera sobre cada reseña, generando una fila para la tabla
            data.reseñas.forEach((reseña, index) => {
                // Construye la cadena HTML para la fila (<tr>) que contiene la información de la reseña
                let row = `
                    <tr data-id="${reseña.id}">
                        <td><input type="checkbox" class="select_row"></td>
                        <td>${index + 1}</td>
                        <td>${reseña.Usuario}</td>
                        <td>${reseña.Libro}</td>
                        <td>${reseña.Puntuacion}</td>
                        <td>${reseña.Reseña.substring(0, 50)}...</td>
                        <td>${reseña.FechaReseña}</td>
                        <td class="acciones">
                            <button class="btn ver-reseña" data-id="${reseña.id}" data-usuario="${reseña.Usuario}" data-libro="${reseña.Libro}" data-puntuacion="${reseña.Puntuacion}" data-reseña="${reseña.Reseña}" data-fecha="${reseña.FechaReseña}"><i class="fa-solid fa-eye"></i>Ver</button>
                            <button class="btn eliminar-reseña" data-id="${reseña.id}"><i class="fa-solid fa-trash-can"></i> Eliminar</button>
                        </td>
                    </tr>
                `;
                // Inserta la fila generada al final del contenedor "reseñasList"
                reseñasList.insertAdjacentHTML('beforeend', row);
            });
            // Muestra la barra de paginación al haber reseñas que paginar
            mostrarPaginacion();
        } else {
            // Si no se encontraron reseñas, inserta una fila con el mensaje informativo
            reseñasList.innerHTML = '<tr><td colspan="8">No se encontraron reseñas.</td></tr>';
            // Oculta la barra de paginación ya que no hay reseñas
            ocultarPaginacion();
        }

        // Actualiza los botones de paginación con la información de total de páginas y la página actual
        actualizarBotonesPaginacion(data.total_pages, data.current_page);
        // Actualiza el contador total de reseñas mostrado en la interfaz
        actualizarTotalReseñas();
    })
    // En caso de error en la carga, lo muestra en la consola
    .catch(error => console.error('Error al cargar reseñas:', error));
}

// Función para actualizar los botones de paginación
function actualizarBotonesPaginacion(total_pages, current_page) {
    // Selecciona el contenedor de paginación con la clase "pagination"
    const paginacionDiv = document.querySelector('.pagination');
    // Limpia el contenido HTML previo del contenedor de paginación
    paginacionDiv.innerHTML = '';

    // Si hay más de una página (total_pages > 1)
    if (total_pages > 1) {
        // Si la página actual es mayor que 1, agrega el enlace para ir a la página anterior
        if (current_page > 1) {
            paginacionDiv.innerHTML += `<a href="#" class="pagination-link" data-page="${current_page - 1}">&laquo; Anterior</a>`;
        }

        // Itera desde 1 hasta el total de páginas para crear un enlace para cada una
        for (let i = 1; i <= total_pages; i++) {
            // Determina si la página en el bucle es la actual para asignarle la clase "active"
            let activeClass = (i === current_page) ? 'active' : '';
            // Agrega el enlace de la página con su número y la clase activa si corresponde
            paginacionDiv.innerHTML += `<a href="#" class="pagination-link ${activeClass}" data-page="${i}">${i}</a>`;
        }

        // Si la página actual es menor que el total, agrega el enlace para la página siguiente
        if (current_page < total_pages) {
            paginacionDiv.innerHTML += `<a href="#" class="pagination-link" data-page="${current_page + 1}">Siguiente &raquo;</a>`;
        }

        // Muestra el contenedor de paginación
        mostrarPaginacion();
    } else {
        // Si solo hay una página, oculta la paginación
        ocultarPaginacion();
    }

    // Asigna los eventos de clic a los botones de paginación generados
    asignarEventosPaginacion();
}

// Función para asignar eventos a los botones de paginación
function asignarEventosPaginacion() {
    // Selecciona todos los elementos con la clase "pagination-link"
    const paginationLinks = document.querySelectorAll('.pagination-link');
    // Para cada enlace de paginación, se añade un listener que previene el comportamiento por defecto y carga la página seleccionada
    paginationLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            // Previene la acción por defecto del enlace (evitar recargar la página)
            event.preventDefault();
            // Obtiene el número de página del atributo "data-page" del enlace clickeado
            const page = this.getAttribute('data-page');
            // Llama a la función cargarReseñas pasando la página seleccionada
            cargarReseñas(page);
        });
    });
}

// Evento para el botón "Eliminar seleccionados" en la sección de paginación (segunda instancia)
document.getElementById('delete_selected').addEventListener('click', function () {
    // Selecciona todos los checkboxes que están marcados y pertenecen a las filas de reseñas
    const selectedCheckboxes = document.querySelectorAll('.select_row:checked');
    // Extrae los IDs de cada reseña seleccionada buscando el atributo "data-id" en el contenedor <tr> de cada checkbox
    const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.closest('tr').dataset.id);

    // Si se ha seleccionado al menos una reseña
    if (selectedIds.length > 0) {
        // Muestra un mensaje de confirmación para eliminar los registros seleccionados
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¡Esta acción no se puede deshacer!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            // Si el usuario confirma la eliminación
            if (result.isConfirmed) {
                // Llama a la función para eliminar las reseñas de forma masiva pasando los IDs y los checkboxes seleccionados
                eliminarReseñasMasivas(selectedIds, selectedCheckboxes);
            }
        });
    } else {
        // Si no se ha seleccionado ninguna reseña, muestra una alerta informativa usando SweetAlert
        Swal.fire({
            icon: 'info',
            title: 'Información',
            text: 'Seleccione al menos un registro para eliminar',
        });
    }
});

// Función para eliminar múltiples reseñas (masiva)
function eliminarReseñasMasivas(ids, selectedCheckboxes) {
    // Realiza una petición POST a "crud_reseñas.php" enviando la acción "eliminar_masivo" y los IDs a eliminar
    fetch('crud_reseñas.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        // Construye el body de la petición usando URLSearchParams con los datos requeridos
        body: new URLSearchParams({
            'action': 'eliminar_masivo',
            'ids': JSON.stringify(ids)
        })
    })
    // Convierte la respuesta a JSON
    .then(response => response.json())
    .then(data => {
        // Si la respuesta indica éxito en la eliminación
        if (data.success) {
            // Para cada checkbox seleccionado, lo desmarca
            selectedCheckboxes.forEach(checkbox => { checkbox.checked = false; });
            // Selecciona el checkbox principal "select_all"
            const mainCheckbox = document.getElementById('select_all');
            // Si el checkbox principal existe, se desmarca
            if (mainCheckbox) {
                mainCheckbox.checked = false;
            }
            // Para cada ID de reseña eliminada, busca y elimina la fila correspondiente en la tabla
            ids.forEach(id => {
                const row = document.querySelector(`tr[data-id='${id}']`);
                if (row) row.remove();
            });
            // Muestra un mensaje de éxito mediante SweetAlert
            Swal.fire('¡Eliminado!', 'Las reseñas seleccionadas han sido eliminadas.', 'success');
            // Actualiza el contador total de reseñas y verifica la existencia de reseñas en la tabla
            actualizarTotalReseñas();
            verificarReseñas();
        } else {
            // Si ocurre un error, muestra un mensaje de error mediante SweetAlert
            Swal.fire('Error', 'Hubo un problema al eliminar las reseñas', 'error');
        }
    })
    // En caso de error en la petición, lo muestra en la consola
    .catch(error => console.error('Error:', error));
}

// Función para eliminar una reseña individual (segunda instancia)
function eliminarReseña(id) {
    // Realiza una petición POST a "crud_reseñas.php" enviando la acción "eliminar" junto con el id de la reseña
    fetch('crud_reseñas.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        // Construye el body de la petición con el id y la acción correspondiente
        body: new URLSearchParams({
            'action': 'eliminar',
            'id': id
        })
    })
    // Convierte la respuesta a JSON
    .then(response => response.json())
    .then(data => {
        // Si la eliminación fue exitosa
        if (data.success) {
            // Elimina la fila (<tr>) de la reseña eliminada usando el id
            document.querySelector(`tr[data-id='${id}']`).remove();
            // Muestra un mensaje de éxito con SweetAlert
            Swal.fire('¡Eliminado!', 'La reseña ha sido eliminada.', 'success');
            // Actualiza el contador de reseñas y verifica la existencia de reseñas en la tabla
            actualizarTotalReseñas();
            verificarReseñas();
        } else {
            // Si falla la eliminación, muestra un mensaje de error
            Swal.fire('Error', 'Hubo un problema al eliminar la reseña', 'error');
        }
    })
    // En caso de error, lo muestra en la consola
    .catch(error => console.error('Error:', error));
}

// Evento para la barra de búsqueda en tiempo real (segunda instancia)
document.getElementById('searchBar').addEventListener('input', function() {
    // Convierte el valor ingresado en el input a minúsculas para comparación
    let searchTerm = this.value.toLowerCase();
    // Selecciona todas las filas (<tr>) de la tabla "reseñasList"
    let reseñas = document.querySelectorAll('#reseñasList tr');
    
    // Para cada fila, obtiene el texto y lo convierte a minúsculas, luego verifica si contiene el término de búsqueda
    reseñas.forEach(function(reseña) {
        let texto = reseña.textContent.toLowerCase();
        // Si el texto contiene el término, la fila se muestra; si no, se oculta
        reseña.style.display = texto.includes(searchTerm) ? '' : 'none';
    });
});
