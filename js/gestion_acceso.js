// -----------------------------------------------------------------------------
// Función para obtener la fecha y hora actual en formato "Sáb, 2025-03-01 01:14:08"
// Usa la zona horaria especificada (por defecto 'America/Mexico_City')
function getCurrentDateTime(timeZone = 'America/Mexico_City') {
  const now = new Date(); // Crea un objeto Date con la fecha y hora actual
  // Obtiene el día de la semana en formato abreviado en español y elimina puntos (p.ej., "Sáb.")
  const weekday = now.toLocaleDateString('es-ES', {
    timeZone: timeZone,
    weekday: 'short'
  }).replace(/\./g, '');
  // Obtiene el día del mes en formato de 2 dígitos según la zona horaria
  const day = now.toLocaleDateString('es-ES', { timeZone: timeZone, day: '2-digit' });
  // Obtiene el mes en formato de 2 dígitos según la zona horaria
  const month = now.toLocaleDateString('es-ES', { timeZone: timeZone, month: '2-digit' });
  // Obtiene el año en formato numérico completo según la zona horaria
  const year = now.toLocaleDateString('es-ES', { timeZone: timeZone, year: 'numeric' });
  // Obtiene la hora, minutos y segundos en formato de 24 horas, con cada valor de 2 dígitos
  const timeString = now.toLocaleTimeString('es-ES', {
    timeZone: timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  // Añade una coma al día de la semana para el formato deseado
  const formattedWeekday = weekday + ',';
  // Retorna la cadena formateada en el formato: "Día, AAAA-MM-DD HH:MM:SS"
  return `${formattedWeekday} ${year}-${month}-${day} ${timeString}`;
}

// -----------------------------------------------------------------------------
// Función (Opcional) para formatear una fecha/hora a partir de un valor de entrada
// Usa la lógica local para formatear la fecha según la zona horaria especificada (por defecto 'America/Mexico_City')
function formatDateTime(dateInput, timeZone = 'America/Mexico_City') {
  const date = new Date(dateInput); // Crea un objeto Date a partir del valor de entrada
  if (isNaN(date)) return dateInput; // Si el valor no es una fecha válida, retorna el valor original
  // Obtiene el día de la semana en formato abreviado en español, y elimina puntos
  const weekday = date.toLocaleDateString('es-ES', {
    timeZone: timeZone,
    weekday: 'short'
  }).replace(/\./g, '');
  // Obtiene el día en formato de 2 dígitos
  const day = date.toLocaleDateString('es-ES', { timeZone: timeZone, day: '2-digit' });
  // Obtiene el mes en formato de 2 dígitos
  const month = date.toLocaleDateString('es-ES', { timeZone: timeZone, month: '2-digit' });
  // Obtiene el año en formato numérico
  const year = date.toLocaleDateString('es-ES', { timeZone: timeZone, year: 'numeric' });
  // Obtiene la hora, minutos y segundos en formato de 24 horas con 2 dígitos cada uno
  const timeString = date.toLocaleTimeString('es-ES', {
    timeZone: timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  // Asegura que el día de la semana comience en mayúscula y le añade una coma
  const formattedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1) + ',';
  // Retorna la cadena formateada con el formato "Día, AAAA-MM-DD HH:MM:SS"
  return `${formattedWeekday} ${year}-${month}-${day} ${timeString}`;
}

// -----------------------------------------------------------------------------
// Función para eliminar un acceso individual
function eliminarAcceso(id) {
  // Realiza una petición POST al script "crud_acceso.php" para eliminar el acceso con el ID especificado
  fetch('crud_acceso.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    // Se envían los parámetros 'action' con valor 'eliminar' y el 'id' del acceso a eliminar
    body: new URLSearchParams({ action: 'eliminar', id: id })
  })
  .then(response => response.json()) // Convierte la respuesta en formato JSON
  .then(data => {
    // Si la eliminación fue exitosa, muestra una alerta de éxito y recarga la lista de accesos en la página 1
    if (data.success) {
      Swal.fire('¡Eliminado!', 'El acceso ha sido eliminado.', 'success');
      cargarAccesos(1);
    } else {
      // Si hubo algún problema, muestra una alerta de error
      Swal.fire('Error', 'Hubo un problema al eliminar el acceso.', 'error');
    }
  })
  .catch(error => console.error('Error al eliminar el acceso:', error)); // Registra en consola cualquier error
}

// -----------------------------------------------------------------------------
// Función para eliminar múltiples accesos de forma masiva
function eliminarAccesosMasivos(ids) {
  // Realiza una petición POST a "crud_acceso.php" con la acción 'eliminar_masivo'
  fetch('crud_acceso.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    // Envía los parámetros 'action' y 'ids' (convertidos a JSON) para la eliminación masiva
    body: new URLSearchParams({
      action: 'eliminar_masivo',
      ids: JSON.stringify(ids)
    })
  })
  .then(response => response.json()) // Convierte la respuesta a JSON
  .then(data => {
    if (data.success) { // Si la eliminación fue exitosa
      Swal.fire('¡Eliminado!', 'Los accesos seleccionados han sido eliminados.', 'success')
      .then(() => {
        // Desmarca todos los checkboxes seleccionados
        const checkboxes = document.querySelectorAll('.select_row:checked');
        checkboxes.forEach(checkbox => (checkbox.checked = false));
        // Desmarca el checkbox principal (seleccionar todos)
        const mainCheckbox = document.getElementById('select_all');
        if (mainCheckbox) {
          mainCheckbox.checked = false;
        }
        // Recarga la lista de accesos en la página 1
        cargarAccesos(1);
      });
    } else {
      // Muestra una alerta de error si ocurre algún problema
      Swal.fire('Error', 'Hubo un problema al eliminar los accesos.', 'error');
    }
  })
  .catch(error => console.error('Error al eliminar accesos:', error)); // Registra errores en la consola
}

// -----------------------------------------------------------------------------
// Función para mostrar el modal de detalles de acceso
function abrirModalAcceso() {
  // Cambia el estilo del elemento con id 'modalAcceso' para hacerlo visible
  document.getElementById('modalAcceso').style.display = 'block';
}
// Función para cerrar el modal de detalles de acceso
function cerrarModalAcceso() {
  // Cambia el estilo del elemento con id 'modalAcceso' para ocultarlo
  document.getElementById('modalAcceso').style.display = 'none';
}

// -----------------------------------------------------------------------------
// Evento global para cerrar el modal de acceso al hacer clic fuera de él
window.onclick = function(event) {
  const modal = document.getElementById('modalAcceso'); // Obtiene la referencia del modal
  // Si el clic ocurrió en el área exterior del modal, lo cierra
  if (event.target === modal) {
    cerrarModalAcceso();
  }
};

// -----------------------------------------------------------------------------
// Evento global para capturar clics en botones "Eliminar" y "Ver" dentro del documento
document.addEventListener('click', function(event) {
  // -----------------------------
  // Caso: Eliminar un acceso individual
  // -----------------------------
  if (event.target.closest('.eliminar-acceso')) { // Verifica si el clic ocurrió en un botón con la clase 'eliminar-acceso'
    const button = event.target.closest('.eliminar-acceso'); // Obtiene el botón específico
    const id = button.getAttribute('data-id'); // Extrae el ID del acceso del atributo data-id
    // Muestra una alerta de confirmación usando SweetAlert2
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¡Esta acción no se puede deshacer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      // Si el usuario confirma, se llama a la función eliminarAcceso con el ID correspondiente
      if (result.isConfirmed) {
        eliminarAcceso(id);
      }
    });
  }
  // -----------------------------
  // Caso: Ver detalles de un acceso
  // -----------------------------
  if (event.target.closest('.ver-acceso')) { // Verifica si el clic ocurrió en un botón con la clase 'ver-acceso'
    const button = event.target.closest('.ver-acceso'); // Obtiene el botón específico
    // Extrae los datos necesarios (usuario, fecha, intentos, estado de bloqueo y tiempo de bloqueo) de los atributos data del botón
    const usuario = button.getAttribute('data-usuario');
    const fecha = button.getAttribute('data-fecha');
    const intentos = button.getAttribute('data-intentos');
    const bloqueado = button.getAttribute('data-bloqueado') === '1' ? 'Sí' : 'No';
    const tiempo = button.getAttribute('data-tiempo') || 'N/A';
    
    // Asigna los valores extraídos a los elementos del modal para mostrarlos al usuario
    document.getElementById('modalUsuario').textContent = usuario;
    document.getElementById('modalFecha').textContent   = fecha;
    document.getElementById('modalIntentos').textContent= intentos;
    document.getElementById('modalBloqueado').textContent= bloqueado;
    document.getElementById('modalTiempoBloqueo').textContent= tiempo;
    // Abre el modal de acceso para mostrar los detalles
    abrirModalAcceso();
  }
});

// -----------------------------------------------------------------------------
// Función que carga los accesos (paginados) desde la base de datos
// Los parámetros son: página actual (por defecto 1), filtro (cadena de búsqueda) y orden (por defecto 'reciente')
function cargarAccesos(pagina = 1, filtro = '', orden = 'reciente') {
  // Realiza una petición GET al script 'crud_acceso.php' con los parámetros necesarios
  fetch(`crud_acceso.php?action=obtener_accesos&page=${pagina}&filtro=${filtro}&orden=${orden}`, {
    method: 'GET',
    headers: { 'X-Requested-With': 'XMLHttpRequest' } // Se indica que la petición es AJAX
  })
  .then(response => response.json()) // Convierte la respuesta en formato JSON
  .then(data => {
    const accesosList = document.getElementById('accesosList'); // Obtiene el contenedor donde se listarán los accesos
    accesosList.innerHTML = ''; // Limpia el contenido previo
    if (data.accesos && data.accesos.length > 0) {
      // Para cada acceso recibido, se construye una fila de tabla (<tr>) con sus datos
      data.accesos.forEach((acceso, index) => {
        let row = `
          <tr data-id="${acceso.ID}">
            <td><input type="checkbox" class="select_row"></td>
            <td>${index + 1}</td>
            <td>${acceso.Usuario}</td>
            <td>${acceso.FechaHoraAcceso}</td>
            <td>${acceso.intentos_fallidos}</td>
            <td>${acceso.bloqueado ? 'Sí' : 'No'}</td>
            <td>${acceso.tiempo_bloqueo}</td>
            <td>
              <div class="acciones">
                <button 
                  class="btn ver-acceso grow"
                  data-id="${acceso.ID}"
                  data-usuario="${acceso.Usuario}"
                  data-fecha="${acceso.FechaHoraAcceso}"
                  data-intentos="${acceso.intentos_fallidos}"
                  data-bloqueado="${acceso.bloqueado}"
                  data-tiempo="${acceso.tiempo_bloqueo}"
                >
                  <i class="fa-solid fa-eye"></i> Ver
                </button>
              </div>
            </td>
          </tr>
        `;
        // Inserta la fila en el contenedor de accesos
        accesosList.insertAdjacentHTML('beforeend', row);
      });
      // Actualiza el elemento que muestra el total de accesos
      document.getElementById('totalAccesos').textContent = data.total;
      // Actualiza los botones de paginación según el total de páginas y la página actual
      actualizarBotonesPaginacion(data.total_pages, data.current_page);
    } else {
      // Si no se encontraron accesos, muestra un mensaje indicativo en una fila de tabla
      accesosList.innerHTML = `<tr><td colspan="8">No se encontraron accesos.</td></tr>`;
      document.getElementById('totalAccesos').textContent = '0';
      actualizarBotonesPaginacion(0, 1);
    }
  })
  .catch(error => console.error('Error al cargar accesos:', error)); // Registra errores en la consola
}

// -----------------------------------------------------------------------------
// Función que asigna eventos a los botones de paginación
function asignarEventosPaginacion() {
  const links = document.querySelectorAll('.pagination .pagination-button'); // Selecciona todos los botones de paginación
  links.forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault(); // Previene la acción por defecto del enlace
      const page = parseInt(this.getAttribute('data-page')); // Obtiene el número de página desde el atributo data-page
      const searchTerm = document.getElementById('searchBar').value.toLowerCase(); // Obtiene el término de búsqueda (convertido a minúsculas)
      const orden = document.getElementById('filter').value; // Obtiene el orden seleccionado
      cargarAccesos(page, searchTerm, orden); // Carga la página correspondiente de accesos
    });
  });
}

// -----------------------------------------------------------------------------
// Función para actualizar la paginación en formato "1 2 3 4 5 … 20"
// Se construye dinámicamente la lista de botones de paginación
function actualizarBotonesPaginacion(totalPages, currentPage) {
  const paginationDiv = document.querySelector('.pagination'); // Obtiene el contenedor de la paginación
  paginationDiv.innerHTML = ''; // Limpia el contenido anterior

  // Si no hay páginas o solo hay 1, no se muestra nada
  if (totalPages < 1) return;

  const ul = document.createElement('ul'); // Crea una lista no ordenada para los botones
  ul.classList.add('pagination-list'); // Agrega una clase para los estilos

  // Botón "«" para retroceder
  const prevLi = document.createElement('li');
  const prevA  = document.createElement('a');
  prevA.innerHTML = '<i class="fas fa-chevron-left"></i>'; // Icono de retroceso
  prevA.classList.add('pagination-button');
  if (currentPage === 1) { // Si estamos en la primera página, deshabilita el botón
    prevA.classList.add('disabled');
    prevA.style.pointerEvents = 'none';
  } else {
    prevA.setAttribute('data-page', currentPage - 1); // Define la página anterior
  }
  prevLi.appendChild(prevA);
  ul.appendChild(prevLi);

  if (totalPages <= 5) {
    // Si hay 5 páginas o menos, se muestran todas las páginas
    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement('li');
      const a  = document.createElement('a');
      a.classList.add('pagination-button');
      a.textContent = i;
      if (i === currentPage) {
        a.classList.add('active'); // Resalta la página actual
      } else {
        a.setAttribute('data-page', i); // Asigna el número de página
      }
      li.appendChild(a);
      ul.appendChild(li);
    }
  } else {
    // Si hay más de 5 páginas, se muestran las primeras 5, luego un elipsis, y la última página
    for (let i = 1; i <= 5; i++) {
      const li = document.createElement('li');
      const a  = document.createElement('a');
      a.classList.add('pagination-button');
      a.textContent = i;
      if (i === currentPage) {
        a.classList.add('active');
      } else {
        a.setAttribute('data-page', i);
      }
      li.appendChild(a);
      ul.appendChild(li);
    }
    // Se añade un elemento de elipsis
    const ellipsisLi = document.createElement('li');
    ellipsisLi.textContent = '...';
    ul.appendChild(ellipsisLi);

    // Se añade el botón para la última página
    const lastLi = document.createElement('li');
    const lastA  = document.createElement('a');
    lastA.classList.add('pagination-button');
    lastA.textContent = totalPages;
    if (currentPage === totalPages) {
      lastA.classList.add('active');
    } else {
      lastA.setAttribute('data-page', totalPages);
    }
    lastLi.appendChild(lastA);
    ul.appendChild(lastLi);
  }

  // Botón "»" para avanzar
  const nextLi = document.createElement('li');
  const nextA  = document.createElement('a');
  nextA.innerHTML = '<i class="fas fa-chevron-right"></i>'; // Icono de avance
  nextA.classList.add('pagination-button');
  if (currentPage === totalPages || totalPages === 0) {
    nextA.classList.add('disabled'); // Deshabilita si ya está en la última página
    nextA.style.pointerEvents = 'none';
  } else {
    nextA.setAttribute('data-page', currentPage + 1); // Define la siguiente página
  }
  nextLi.appendChild(nextA);
  ul.appendChild(nextLi);

  // Se agrega la lista completa al contenedor de paginación
  paginationDiv.appendChild(ul);
  // Se asignan eventos de clic a los botones de paginación
  asignarEventosPaginacion();
}

// -----------------------------------------------------------------------------
// Función para exportar la lista de accesos a PDF
function exportarAccesosPDF() {
  const body = []; // Array que contendrá los datos de la tabla para el PDF
  const headers = [
    '#',
    'Usuario',
    'Fecha y Hora',
    'Intentos Fallidos',
    'Bloqueado',
    'Tiempo de Bloqueo'
  ];
  // Se agrega la fila de encabezados, formateados con texto en negrita y centrado
  body.push(headers.map(header => ({ text: header, bold: true, alignment: 'center' })));

  // Selecciona todas las filas de la tabla que contiene los accesos
  const rows = Array.from(document.querySelectorAll('#accesosList tr'));
  // Mapea cada fila para extraer la información necesaria
  const accesosData = rows.map((row, index) => ({
    numero: index + 1,
    usuario: row.cells[2].textContent,
    fecha: row.cells[3].textContent,
    intentos: row.cells[4].textContent,
    bloqueado: row.cells[5].textContent,
    tiempo: row.cells[6].textContent
  }));
  // Por cada acceso, se construye una fila de datos para el PDF
  accesosData.forEach(a => {
    const dataRow = [
      { text: a.numero, alignment: 'center' },
      { text: a.usuario, alignment: 'center' },
      { text: a.fecha, alignment: 'center' },
      { text: a.intentos, alignment: 'center' },
      { text: a.bloqueado, alignment: 'center' },
      { text: a.tiempo, alignment: 'center' }
    ];
    body.push(dataRow);
  });

  // Obtiene la fecha y hora actual formateada usando la función getCurrentDateTime
  const currentDateTime = getCurrentDateTime('America/Mexico_City');
  // Define el documento PDF con encabezado, contenido (tabla) y pie de página
  const docDefinition = {
    header: {
      columns: [
        { text: 'Gestión de Accesos - Biblioteca Virtual', alignment: 'left', margin: [10, 10], fontSize: 12 },
        { text: `Fecha y hora: ${currentDateTime}`, alignment: 'center', margin: [10, 10], fontSize: 10 },
        { text: `Total de registros: ${accesosData.length}`, alignment: 'right', margin: [10, 10], fontSize: 12 }
      ]
    },
    // El pie de página muestra el número de página actual y total
    footer: function(currentPage, pageCount) {
      return { text: `Página ${currentPage} de ${pageCount}`, alignment: 'center', margin: [0, 10] };
    },
    content: [
      {
        table: {
          headerRows: 1, // La primera fila se considera encabezado
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'], // Ancho automático para cada columna
          body: body // Cuerpo de la tabla con los datos
        },
        layout: 'lightHorizontalLines' // Estilo de la tabla con líneas horizontales claras
      }
    ],
    pageSize: 'A4', // Tamaño de página A4
    pageOrientation: 'landscape' // Orientación de la página: horizontal
  };
  // Crea y descarga el PDF con el nombre "accesos.pdf" utilizando pdfMake
  pdfMake.createPdf(docDefinition).download('accesos.pdf');
}

// -----------------------------------------------------------------------------
// Función para imprimir la lista de accesos en formato PDF en una nueva ventana
function imprimirAccesosPDF() {
  const body = []; // Array para almacenar los datos de la tabla
  const headers = [
    '#',
    'Usuario',
    'Fecha y Hora',
    'Intentos Fallidos',
    'Bloqueado',
    'Tiempo de Bloqueo'
  ];
  // Se agregan los encabezados formateados con negrita y centrados
  body.push(headers.map(header => ({ text: header, bold: true, alignment: 'center' })));

  // Selecciona todas las filas de la tabla de accesos
  const rows = Array.from(document.querySelectorAll('#accesosList tr'));
  // Mapea cada fila para extraer los datos de cada acceso
  const accesosData = rows.map((row, index) => ({
    numero: index + 1,
    usuario: row.cells[2].textContent,
    fecha: row.cells[3].textContent,
    intentos: row.cells[4].textContent,
    bloqueado: row.cells[5].textContent,
    tiempo: row.cells[6].textContent
  }));
  // Por cada acceso, crea una fila de datos para la tabla del PDF
  accesosData.forEach(a => {
    const dataRow = [
      { text: a.numero, alignment: 'center' },
      { text: a.usuario, alignment: 'center' },
      { text: a.fecha, alignment: 'center' },
      { text: a.intentos, alignment: 'center' },
      { text: a.bloqueado, alignment: 'center' },
      { text: a.tiempo, alignment: 'center' }
    ];
    body.push(dataRow);
  });

  // Obtiene la fecha y hora actual formateada
  const currentDateTime = getCurrentDateTime('America/Mexico_City');
  // Define el documento PDF para impresión, similar al método de exportación
  const docDefinition = {
    header: {
      columns: [
        { text: 'Gestión de Accesos - Biblioteca Virtual', alignment: 'left', margin: [10, 10], fontSize: 12 },
        { text: `Fecha y hora: ${currentDateTime}`, alignment: 'center', margin: [10, 10], fontSize: 10 },
        { text: `Total de registros: ${accesosData.length}`, alignment: 'right', margin: [10, 10], fontSize: 12 }
      ]
    },
    footer: function(currentPage, pageCount) {
      return { text: `Página ${currentPage} de ${pageCount}`, alignment: 'center', margin: [0, 10] };
    },
    content: [
      {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: body
        },
        layout: 'lightHorizontalLines'
      }
    ],
    pageSize: 'A4',
    pageOrientation: 'landscape'
  };

  // Crea el PDF y lo obtiene como DataURL
  const pdfDoc = pdfMake.createPdf(docDefinition);
  pdfDoc.getDataUrl(dataUrl => {
    // Abre una nueva ventana e inserta un iframe que contiene el PDF para imprimir
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<iframe width="100%" height="100%" src="${dataUrl}"></iframe>`);
  });
}

// -----------------------------------------------------------------------------
// Función que inicializa la gestión de accesos
function inicializarGestionAccesos() {
  // Carga la primera página de accesos
  cargarAccesos(1);

  // Asigna el evento de "input" al campo de búsqueda para filtrar accesos en tiempo real
  document.getElementById('searchBar').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase(); // Convierte el término a minúsculas
    const orden = document.getElementById('filter').value; // Obtiene el orden seleccionado
    cargarAccesos(1, searchTerm, orden); // Carga la página 1 con el filtro aplicado
  });

  // Asigna el evento para seleccionar o deseleccionar todos los checkboxes en la lista de accesos
  document.getElementById('select_all').addEventListener('change', function() {
    let checkboxes = document.querySelectorAll('.select_row'); // Selecciona todos los checkboxes
    checkboxes.forEach(cb => (cb.checked = this.checked)); // Establece su estado según el checkbox principal
  });

  // Asigna el evento para exportar los accesos a PDF al hacer clic en el botón correspondiente
  document.getElementById('download_pdf').addEventListener('click', exportarAccesosPDF);
  // Asigna el evento para imprimir el PDF de accesos
  document.getElementById('print_pdf').addEventListener('click', imprimirAccesosPDF);

  // Asigna el evento para ordenar los accesos cuando se cambia el filtro de orden
  document.getElementById('filter').addEventListener('change', function() {
    const searchTerm = document.getElementById('searchBar').value.toLowerCase();
    const orden = this.value;
    cargarAccesos(1, searchTerm, orden);
  });

  // Asigna el evento para eliminar accesos seleccionados al hacer clic en el botón "delete_selected"
  document.getElementById('delete_selected').addEventListener('click', function() {
    let selectedCheckboxes = document.querySelectorAll('.select_row:checked'); // Obtiene los checkboxes seleccionados
    // Crea un arreglo con los IDs de las filas seleccionadas
    let selectedIds = Array.from(selectedCheckboxes).map(
      cb => cb.closest('tr').dataset.id
    );
    if (selectedIds.length > 0) { // Si hay al menos un acceso seleccionado
      // Muestra una alerta de confirmación para eliminar los accesos seleccionados
      Swal.fire({
        title: '¿Estás seguro?',
        text: '¡Esta acción no se puede deshacer!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then(result => {
        if (result.isConfirmed) { // Si se confirma, llama a la función eliminarAccesosMasivos
          eliminarAccesosMasivos(selectedIds);
        }
      });
    } else {
      // Si no hay accesos seleccionados, muestra una alerta informativa
      Swal.fire('Información', 'Selecciona al menos un acceso para eliminar.', 'info');
    }
  });
}

// -----------------------------------------------------------------------------
// Se inicia la lógica de gestión de accesos llamando a la función inicializadora
inicializarGestionAccesos();
