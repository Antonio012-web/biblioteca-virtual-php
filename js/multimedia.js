(function() {
  // Al inicio, removemos cualquier evento previamente asignado en el namespace ".multimedia"
  $(document).off('.multimedia'); // Elimina todos los eventos jQuery asociados con el namespace ".multimedia" en el documento

  // Reiniciamos los flags globales
  window.exportPDFInProgress = false; // Flag global para controlar si la exportación a PDF (descarga) está en progreso
  window.printPDFInProgress = false;  // Flag global para controlar si la impresión a PDF está en progreso

  // Función auxiliar para formatear la fecha y hora en formato "YYYY-MM-DD HH:MM:SS" usando hora local
  function formatFechaHora(dateString) {
    let localString = dateString.replace(/-/g, '/'); // Reemplaza los guiones por barras para mejorar la compatibilidad con el constructor Date
    let date = new Date(localString); // Crea un objeto Date usando la cadena modificada
    const year = date.getFullYear(); // Obtiene el año en formato de 4 dígitos
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Obtiene el mes (agrega 1 porque es 0-indexado) y lo formatea a dos dígitos
    const day = ('0' + date.getDate()).slice(-2); // Obtiene el día del mes y lo formatea a dos dígitos
    const hours = ('0' + date.getHours()).slice(-2); // Obtiene la hora (formato 24h) y la formatea a dos dígitos
    const minutes = ('0' + date.getMinutes()).slice(-2); // Obtiene los minutos y los formatea a dos dígitos
    const seconds = ('0' + date.getSeconds()).slice(-2); // Obtiene los segundos y los formatea a dos dígitos
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // Retorna la fecha y hora formateadas
  }

  // Función principal para inicializar la gestión de contenido multimedia
  function initializeGestionMultimedia() {
    // Verifica que el formulario de multimedia exista en el DOM
    const form = document.getElementById('multimediaForm');
    if (!form) return; // Si no existe, sale de la función

    // Selecciona los elementos clave de la sección multimedia
    const tableBody = document.querySelector('#multimediaTable tbody'); // Cuerpo de la tabla donde se muestran los registros
    const modal = document.getElementById('multimediaModal'); // Modal para agregar/editar contenido multimedia
    const modalTitle = document.getElementById('modalTitle'); // Elemento para el título del modal
    const addButton = document.getElementById('addButton'); // Botón para agregar nuevo contenido
    const closeButton = document.querySelector('.close:not(.view-close)'); // Botón para cerrar el modal, excluyendo aquellos con clase "view-close"
    const searchInput = document.getElementById('searchBar'); // Input de búsqueda para filtrar contenido
    const sortSelect = document.getElementById('sortSelect'); // Selector para ordenar el contenido
    const deleteMassiveButton = document.getElementById('deleteMassiveButton'); // Botón para eliminar registros de forma masiva
    const selectAllCheckbox = document.getElementById('selectAll'); // Checkbox para seleccionar todos los registros
    const editMultimediaButton = document.getElementById('editMultimediaButton'); // Botón para editar contenido multimedia
    const importExcelButton = document.getElementById('importExcelButton'); // Botón para importar contenido desde un archivo Excel
    const importExcelInput = document.getElementById('importExcelInput'); // Input oculto para seleccionar el archivo Excel
    const exportExcelButton = document.getElementById('exportExcelButton'); // Botón para exportar a Excel
    const exportPDFButton = document.getElementById('exportPDFButton'); // Botón para exportar a PDF (descarga)
    const printButton = document.getElementById('printButton'); // Botón para imprimir a PDF

    let multimediaData = []; // Array para almacenar los registros multimedia

    // Paginación: Variables para la página actual y número de registros por página
    let currentPage = 1;              // Página actual
    const recordsPerPage = 10;        // Registros a mostrar por página

    /**
     * Función para renderizar la paginación en el contenedor ".pagination"
     * @param {Array} data - Array de registros
     * @param {number} currentPage - Página actual a mostrar
     * @param {number} perPage - Número de registros por página
     */
    function renderPagination(data, currentPage, perPage) {
      const paginationContainer = document.querySelector('.pagination'); // Selecciona el contenedor de paginación
      paginationContainer.innerHTML = ''; // Limpia la paginación previa

      const totalRecords = data.length; // Calcula el total de registros
      const totalPages = Math.ceil(totalRecords / perPage); // Calcula el total de páginas

      // Botón "«" (anterior)
      const prevLi = document.createElement('li'); // Crea un elemento <li> para el botón anterior
      const prevA = document.createElement('a'); // Crea un elemento <a> para el botón anterior
      prevA.innerHTML = '<i class="fas fa-chevron-left"></i>'; // Establece el icono del botón anterior

      if (currentPage === 1) { // Si ya se está en la primera página
          prevA.classList.add('disabled'); // Deshabilita el botón
          prevA.style.pointerEvents = 'none'; // Desactiva los eventos de clic
      } else {
          prevA.addEventListener('click', () => { // Si no, asigna un evento para mostrar la página anterior
              showPage(currentPage - 1);
          });
      }
      prevLi.appendChild(prevA); // Añade el enlace al <li>
      paginationContainer.appendChild(prevLi); // Añade el <li> al contenedor de paginación

      // Botones numéricos de página
      if (totalPages <= 5) { // Si hay 5 páginas o menos, muestra todas
          for (let i = 1; i <= totalPages; i++) {
              const li = document.createElement('li'); // Crea un <li> para cada página
              const a = document.createElement('a'); // Crea un <a> para cada número de página
              a.textContent = i; // Asigna el número de página
              if (i === currentPage) {
                  a.classList.add('active'); // Marca la página actual con la clase "active"
              } else {
                  a.addEventListener('click', () => { // Asigna evento para cambiar a la página i
                      showPage(i);
                  });
              }
              li.appendChild(a); // Añade el enlace al <li>
              paginationContainer.appendChild(li); // Añade el <li> al contenedor de paginación
          }
      } else {
          // Si hay más de 5 páginas, muestra las primeras 5 páginas
          for (let i = 1; i <= 5; i++) {
              const li = document.createElement('li');
              const a = document.createElement('a');
              a.textContent = i;
              if (i === currentPage) {
                  a.classList.add('active');
              } else {
                  a.addEventListener('click', () => {
                      showPage(i);
                  });
              }
              li.appendChild(a);
              paginationContainer.appendChild(li);
          }

          // Agrega un elemento "..." para indicar que existen más páginas
          const ellipsisLi = document.createElement('li');
          ellipsisLi.textContent = '...';
          paginationContainer.appendChild(ellipsisLi);

          // Agrega el botón para la última página (ej. página 20)
          const lastLi = document.createElement('li');
          const lastA = document.createElement('a');
          lastA.textContent = totalPages;
          if (currentPage === totalPages) {
              lastA.classList.add('active');
          } else {
              lastA.addEventListener('click', () => {
                  showPage(totalPages);
              });
          }
          lastLi.appendChild(lastA);
          paginationContainer.appendChild(lastLi);
      }

      // Botón "»" (siguiente)
      const nextLi = document.createElement('li');
      const nextA = document.createElement('a');
      nextA.innerHTML = '<i class="fas fa-chevron-right"></i>';
  
      if (currentPage === totalPages || totalPages === 0) { // Si está en la última página o no hay páginas
          nextA.classList.add('disabled');
          nextA.style.pointerEvents = 'none';
      } else {
          nextA.addEventListener('click', () => { // Asigna evento para mostrar la siguiente página
              showPage(currentPage + 1);
          });
      }
      nextLi.appendChild(nextA);
      paginationContainer.appendChild(nextLi);
    }
  
    /**
     * Función para mostrar la página especificada en la tabla.
     * @param {number} page - Número de página a mostrar.
     */
    function showPage(page) {
      currentPage = page; // Actualiza la variable currentPage con la página a mostrar
      const filtered = getFilteredData(); // Obtiene los datos filtrados (o todos si no hay filtro)
      renderTable(filtered, currentPage, recordsPerPage); // Renderiza la tabla con los registros correspondientes a la página
      renderPagination(filtered, currentPage, recordsPerPage); // Actualiza la paginación con los nuevos datos
    }
  
    /**
     * Función para obtener los registros filtrados según el término de búsqueda.
     * Si no hay término de búsqueda, retorna todos los registros multimedia.
     */
    function getFilteredData() {
      const searchTerm = (document.getElementById('searchBar')?.value || '').toLowerCase(); // Obtiene el término de búsqueda en minúsculas
      if (!searchTerm) { // Si no hay término, retorna todos los datos
          return multimediaData;
      }
      // Filtra multimediaData: devuelve solo los registros cuyo título, tipo o nivel educativo contengan el término de búsqueda
      return multimediaData.filter(item => {
          return (
              item.titulo.toLowerCase().includes(searchTerm) ||
              item.tipo.toLowerCase().includes(searchTerm) ||
              item.nivel_educativo.toLowerCase().includes(searchTerm)
          );
      });
    }
  
    // Obtiene la fecha actual formateada usando la función getCurrentDateTime para la zona "America/Mexico_City"
    const currentDate = getCurrentDateTime('America/Mexico_City');
    // Obtiene el campo de fecha de publicación del formulario por su id "fecha_publicacion"
    const fechaPublicacionField = document.getElementById('fecha_publicacion');
    // Establece el valor, mínimo y máximo del campo de fecha a la fecha actual
    fechaPublicacionField.value = currentDate;
    fechaPublicacionField.min = currentDate;
    fechaPublicacionField.max = currentDate;
  
    // Configura el botón de editar contenido multimedia usando jQuery y el namespace ".multimedia"
    $(editMultimediaButton).off('click.multimedia').on('click.multimedia', function () {
      const selectedCheckboxes = document.querySelectorAll('#multimediaTable tbody input[type="checkbox"]:checked'); // Obtiene los checkboxes seleccionados
      if (selectedCheckboxes.length !== 1) { // Si no se selecciona exactamente un registro...
        Swal.fire('Información', 'Seleccione un único registro para editar.', 'info'); // Muestra un mensaje informativo
      } else {
        const id = selectedCheckboxes[0].dataset.id; // Obtiene el id del registro seleccionado
        editMultimedia(id); // Llama a la función para editar el registro con ese id
      }
    });
  
    // Configura el botón de cerrar del modal de vista de multimedia usando jQuery
    const viewModal = document.getElementById('viewMultimediaModal'); // Obtiene el modal de vista
    $(viewModal.querySelector('.view-close')).off('click.multimedia').on('click.multimedia', function () {
      viewModal.style.display = 'none'; // Al hacer clic, oculta el modal de vista
    });
  
    // Manejo del envío del formulario de multimedia (crear o actualizar) usando jQuery
    $(form).off('submit.multimedia').on('submit.multimedia', function (event) {
      event.preventDefault(); // Previene el envío por defecto del formulario
      // Obtiene y recorta los valores de los campos del formulario
      const titulo = document.getElementById('titulo').value.trim();
      const descripcion = document.getElementById('descripcion').value.trim();
      const autor = document.getElementById('autor').value.trim();
      const etiquetas = document.getElementById('etiquetas').value.trim();
      const url = document.getElementById('url').value.trim();
      const id = document.getElementById('id').value;
  
      // Define patrones de validación para los campos de texto y URL
      const validTextPattern = /^[A-Z][a-zA-Z0-9áéíóúÁÉÍÓÚüÜñÑ,. ]*$/;
      const validAutorEtiquetasPattern = /^[A-Z][a-zA-ZáéíóúÁÉÍÓÚüÜñÑ,. ]*$/;
      const validUrlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
  
      // Valida que el Título cumpla con el patrón (debe comenzar con mayúscula y solo contener caracteres permitidos)
      if (!validTextPattern.test(titulo)) {
        Swal.fire('Error', 'El campo Título debe comenzar con mayúscula y no puede contener caracteres no permitidos.', 'error');
        return;
      }
      // Valida que la Descripción no esté vacía
      if (descripcion === '') {
        Swal.fire('Error', 'El campo Descripción no puede estar vacío.', 'error');
        return;
      }
      // Valida que el Autor cumpla con el patrón
      if (!validAutorEtiquetasPattern.test(autor)) {
        Swal.fire('Error', 'El campo Autor debe comenzar con mayúscula y no puede contener caracteres no permitidos.', 'error');
        return;
      }
      // Si se ingresaron Etiquetas, las valida con el mismo patrón
      if (etiquetas && !validAutorEtiquetasPattern.test(etiquetas)) {
        Swal.fire('Error', 'El campo Etiquetas debe comenzar con mayúscula y no puede contener caracteres no permitidos.', 'error');
        return;
      }
      // Valida que la URL sea válida usando el patrón definido
      if (!validUrlPattern.test(url)) {
        Swal.fire('Error', 'El campo URL debe contener una URL válida.', 'error');
        return;
      }
  
      // Verificación de duplicados: Envía una petición para comprobar si ya existe un registro con el mismo Título o URL
      fetch('crud_multimedia.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=check_duplicate&titulo=${encodeURIComponent(titulo)}&url=${encodeURIComponent(url)}&id=${id}`
      })
      .then(response => response.text())
      .then(text => {
        let data;
        try {
          data = text ? JSON.parse(text) : { success: true }; // Intenta parsear la respuesta a JSON
        } catch (e) {
          data = { success: true }; // Si falla, asume que no hay duplicado
        }
        if (!data.success) { // Si la respuesta indica duplicado
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.message || 'Un registro con el mismo Título o URL ya existe.'
          });
          return Promise.reject("Duplicate"); // Rechaza la promesa para detener la ejecución
        }
        return data;
      })
      .then(() => {
        // Si no se encontró duplicado, crea un objeto FormData con los datos del formulario
        const formData = new FormData(form);
        const actionType = id ? 'update' : 'create'; // Determina si se trata de una actualización o creación
        formData.append('action', actionType);
        // Envía la petición para crear o actualizar el registro multimedia
        return fetch('crud_multimedia.php', {
          method: 'POST',
          body: formData
        });
      })
      .then(response => response.text())
      .then(resultText => {
        let result;
        try {
          result = JSON.parse(resultText); // Intenta parsear la respuesta a JSON
        } catch (e) {
          result = null;
        }
        if (result && result.success === false) { // Si la operación no fue exitosa
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: result.message
          });
          return;
        }
        // Si la operación fue exitosa, muestra un mensaje de éxito
        let message = (result && result.message) ? result.message : resultText;
        Swal.fire({
          title: 'Éxito',
          text: message,
          icon: 'success'
        });
        form.reset(); // Resetea el formulario
        fechaPublicacionField.value = getCurrentDateTime('America/Mexico_City'); // Restaura la fecha actual
        modal.style.display = 'none'; // Oculta el modal
        loadMultimedia(); // Recarga el contenido multimedia
      })
      .catch(err => {
        if (err !== "Duplicate") { // Si el error no es por duplicado
          console.error("Error en la solicitud:", err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al procesar la solicitud.'
          });
        }
      });
    });
  
    // Configura el botón de agregar contenido multimedia para abrir el modal en modo "Agregar"
    $(addButton).off('click.multimedia').on('click.multimedia', function () {
      form.reset(); // Resetea el formulario
      document.getElementById('id').value = ''; // Limpia el campo id (para indicar creación)
      fechaPublicacionField.value = getCurrentDateTime('America/Mexico_City'); // Establece la fecha actual
      modalTitle.textContent = 'Agregar Contenido Multimedia'; // Establece el título del modal
      modal.style.display = 'block'; // Muestra el modal
    });
  
    // Configura el botón de cierre (closeButton) para ocultar el modal
    $(closeButton).off('click.multimedia').on('click.multimedia', function () {
      modal.style.display = 'none'; // Oculta el modal
    });
  
    // Configura el evento de búsqueda en tiempo real para filtrar registros en la tabla
    $(searchInput).off('input.multimedia').on('input.multimedia', function () {
      showPage(1); // Muestra la primera página de resultados
      const searchTerm = this.value.toLowerCase(); // Convierte el término de búsqueda a minúsculas
      // Itera sobre cada fila del cuerpo de la tabla
      Array.from(tableBody.children).forEach(row => {
        if (row.children.length < 10) return; // Si la fila no tiene al menos 10 celdas, la omite
        // Obtiene el texto de la tercera, quinta y décima celda, asumiendo título, tipo y nivel
        const title = row.children[2].textContent.toLowerCase();
        const type = row.children[4].textContent.toLowerCase();
        const level = row.children[9].textContent.toLowerCase();
        // Muestra la fila si alguno de esos textos incluye el término de búsqueda; de lo contrario, la oculta
        row.style.display = (title.includes(searchTerm) || type.includes(searchTerm) || level.includes(searchTerm)) ? '' : 'none';
      });
    });
  
    // Configura el selector de orden para recargar el contenido multimedia al cambiar la opción
    $(sortSelect).off('change.multimedia').on('change.multimedia', function () {
      const sortValue = this.value;
      loadMultimedia(sortValue); // Llama a loadMultimedia con el criterio de orden seleccionado
    });
  
    // Configura el botón de eliminación masiva de registros multimedia
    $(deleteMassiveButton).off('click.multimedia').on('click.multimedia', function () {
      const selectedIds = [];
      // Itera sobre cada checkbox seleccionado dentro del cuerpo de la tabla
      $('#multimediaTable tbody input[type="checkbox"]:checked').each(function () {
        if (this !== selectAllCheckbox) { // Excluye el checkbox de "select all"
          selectedIds.push(this.dataset.id); // Agrega el id del registro seleccionado al array
        }
      });
      if (selectedIds.length > 0) { // Si hay registros seleccionados
        Swal.fire({
          title: '¿Estás seguro?',
          text: `Eliminar ${selectedIds.length} registro(s) seleccionado(s)`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Sí, eliminar!'
        }).then((result) => {
          if (result.isConfirmed) {
            // Envía una petición POST para eliminar los registros seleccionados
            fetch('crud_multimedia.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: `action=deleteMassive&ids=${selectedIds.join(',')}`
            })
            .then(response => response.text())
            .then(data => {
              // Muestra un mensaje de éxito y luego reinicia los checkboxes y recarga el contenido multimedia
              Swal.fire('Eliminado!', data, 'success')
              .then(() => {
                $('#multimediaTable tbody input[type="checkbox"]').prop('checked', false);
                $(selectAllCheckbox).prop('checked', false);
                loadMultimedia();
              });
            });
          }
        });
      } else {
        // Si no hay registros seleccionados, muestra un mensaje informativo
        Swal.fire('Información', 'Seleccione al menos un registro para eliminar', 'info');
      }
    });
  
    // Configura el checkbox "selectAll" para seleccionar o deseleccionar todos los registros de la tabla
    $(selectAllCheckbox).off('change.multimedia').on('change.multimedia', function () {
      $('#multimediaTable tbody input[type="checkbox"]').prop('checked', this.checked);
    });
  
    // Función global para ver los detalles de un registro multimedia
    window.viewMultimedia = function (id) {
      // Envía una petición POST para obtener los datos del registro con el id especificado
      fetch('crud_multimedia.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=read&id=${id}`
      })
      .then(response => response.json())
      .then(data => {
        const viewModal = document.getElementById('viewMultimediaModal'); // Obtiene el modal de vista
        if (data.length > 0) { // Si se obtuvieron datos
          const item = data[0]; // Toma el primer elemento
          let iconTipo = ''; // Variable para almacenar el icono según el tipo
          if (item.tipo === 'Video') {
            iconTipo = '<i class="fas fa-video"></i>';
          } else if (item.tipo === 'Audiolibro') {
            iconTipo = '<i class="fas fa-headphones-alt"></i>';
          } else if (item.tipo === 'Pdf') {
            iconTipo = '<i class="fas fa-file-pdf"></i>';
          }
          // Construye el HTML con los detalles del registro multimedia
          const detailsHTML = `
            <div><i class="fas fa-heading"></i> <strong>Título:</strong> ${item.titulo}</div>
            <div><i class="fas fa-align-left"></i> <strong>Descripción:</strong> ${item.descripcion}</div>
            <div>${iconTipo} <strong>Tipo:</strong> ${item.tipo}</div>
            <div><i class="fas fa-link"></i> <strong>URL:</strong> <a href="${item.url}" target="_blank">${item.url}</a></div>
            <div><i class="fas fa-user"></i> <strong>Autor:</strong> ${item.autor}</div>
            <div><i class="fas fa-calendar-alt"></i> <strong>Fecha de Publicación:</strong> ${formatFechaHora(item.fecha_publicacion)}</div>
            <div><i class="fas fa-tags"></i> <strong>Etiquetas:</strong> ${item.etiquetas}</div>
            <div><i class="fas fa-graduation-cap"></i> <strong>Nivel Educativo:</strong> ${item.nivel_educativo}</div>
          `;
          // Inserta el HTML de detalles en el elemento con id "multimediaDetails"
          document.getElementById('multimediaDetails').innerHTML = detailsHTML;
          // Muestra el modal de vista estableciendo su display a "flex"
          viewModal.style.display = 'flex';
        } else {
          // Si no se obtuvieron datos, muestra un mensaje de error
          Swal.fire('Error', 'No se pudieron obtener los datos para mostrar', 'error');
        }
      })
      .catch(error => {
        Swal.fire('Error', 'No se pudieron obtener los datos para mostrar', 'error');
      });
    };
  
    // Función global para editar un registro multimedia
    window.editMultimedia = function (id) {
      // Envía una petición POST para obtener los datos del registro multimedia con el id especificado
      fetch('crud_multimedia.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=read&id=${id}`
      })
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) { // Si se obtuvieron datos
          const item = data[0];
          // Rellena los campos del formulario con los datos obtenidos
          document.getElementById('id').value = item.id || '';
          document.getElementById('titulo').value = item.titulo || '';
          document.getElementById('descripcion').value = item.descripcion || '';
          document.getElementById('tipo').value = item.tipo || '';
          document.getElementById('url').value = item.url || '';
          document.getElementById('autor').value = item.autor || '';
          document.getElementById('fecha_publicacion').value = item.fecha_publicacion || getCurrentDateTime('America/Mexico_City');
          document.getElementById('etiquetas').value = item.etiquetas || '';
          document.getElementById('nivel_educativo').value = item.nivel_educativo || '';
          // Actualiza el título del modal a "Editar Contenido Multimedia"
          modalTitle.textContent = 'Editar Contenido Multimedia';
          // Muestra el modal
          modal.style.display = 'block';
        } else {
          Swal.fire('Error', 'No se pudieron obtener los datos para la edición', 'error');
        }
      })
      .catch(error => {
        Swal.fire('Error', 'No se pudieron obtener los datos para la edición', 'error');
      });
    };
  
    // Función para renderizar la tabla de registros multimedia
    // Parámetros: data (array de registros), page (número de página), perPage (registros por página)
    function renderTable(data, page = 1, perPage = 10) {
      tableBody.innerHTML = ''; // Limpia el contenido actual de la tabla
  
      // Calcula el índice de inicio y fin para los registros de la página actual
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const pageData = data.slice(startIndex, endIndex); // Extrae los registros correspondientes a la página
  
      // Si no hay registros para mostrar, muestra un mensaje informativo
      if (pageData.length === 0) {
          const row = document.createElement('tr');
          const cell = document.createElement('td');
          cell.colSpan = 11;
          cell.style.textAlign = 'center';
          cell.textContent = 'No hay contenido multimedia';
          row.appendChild(cell);
          tableBody.appendChild(row);
          return;
      }
  
      // Itera sobre los registros de la página actual y crea una fila por cada uno
      pageData.forEach((item, index) => {
          const row = document.createElement('tr');
          // Inserta el HTML de la fila con los datos del registro multimedia
          row.innerHTML = `
            <td><input type="checkbox" data-id="${item.id}"></td>
            <td>${startIndex + index + 1}</td>
            <td>${item.titulo}</td>
            <td>${item.descripcion}</td>
            <td>${item.tipo}</td>
            <td>${item.url}</td>
            <td>${item.autor}</td>
            <td>${item.fecha_publicacion}</td>
            <td>${item.etiquetas}</td>
            <td>${item.nivel_educativo}</td>
            <td>
              <button class="btn btn-view grow" onclick="viewMultimedia(${item.id})">
                <i class="fas fa-eye"></i> Ver
              </button>
            </td>
          `;
          tableBody.appendChild(row); // Agrega la fila a la tabla
      });
    }
  
    // Función para cargar los datos multimedia desde el servidor
    // Parámetro opcional sortValue para ordenar los registros
    function loadMultimedia(sortValue = 'recent') {
      fetch('crud_multimedia.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `action=read&sort=${sortValue}` // Envía la acción "read" y el criterio de orden
      })
      .then(response => response.json())
      .then(data => {
        multimediaData = data; // Almacena los datos en multimediaData
        renderTable(multimediaData); // Renderiza la tabla con los registros
        document.getElementById('totalRegistros').textContent = multimediaData.length; // Actualiza el contador total de registros
        showPage(1); // Muestra la primera página de registros
      });
    }
  
    // Función para exportar los datos multimedia a un archivo Excel
    function exportToExcel() {
      // Mapea cada registro multimedia a un objeto con las columnas deseadas
      const exportData = multimediaData.map(item => ({
        "Título": item.titulo || "",
        "Descripción": item.descripcion || "",
        "Tipo": item.tipo || "",
        "URL": item.url || "",
        "Autor": item.autor || "",
        "Etiquetas": item.etiquetas || "",
        "Nivel Educativo": item.nivel_educativo || ""
      }));
  
      const wb = XLSX.utils.book_new(); // Crea un nuevo libro de Excel
      const ws = XLSX.utils.json_to_sheet(exportData); // Convierte los datos a una hoja de Excel
      XLSX.utils.book_append_sheet(wb, ws, "Multimedia"); // Añade la hoja al libro con el nombre "Multimedia"
      XLSX.writeFile(wb, "multimedia.xlsx"); // Descarga el archivo Excel
    }
  
    window.printWindow = null; // Variable global para almacenar la ventana de impresión
  
    // Función para exportar a PDF o imprimir el contenido multimedia
    function exportToPDF(print = false) {
      if (print) {
        if (window.printPDFInProgress) { // Si ya hay una impresión en progreso, evita ejecutar otra
          console.log("exportToPDF (print) ya se está ejecutando");
          return;
        }
        window.printPDFInProgress = true; // Marca que se está en proceso de imprimir a PDF
      } else {
        if (window.exportPDFInProgress) { // Si ya hay una exportación a PDF en progreso, evita ejecutar otra
          console.log("exportToPDF (download) ya se está ejecutando");
          return;
        }
        window.exportPDFInProgress = true; // Marca que se está en proceso de exportar a PDF
      }
  
      if (!window.pdfMake) { // Verifica que la librería pdfMake esté disponible
        Swal.fire('Error', 'No se pudo cargar pdfMake.', 'error');
        if (print) {
          window.printPDFInProgress = false;
        } else {
          window.exportPDFInProgress = false;
        }
        return;
      }
  
      const totalRegistros = multimediaData.length; // Total de registros multimedia
      const currentDateTime = getCurrentDateTime('America/Mexico_City'); // Fecha y hora actual formateadas
      // Define la estructura del documento PDF
      const docDefinition = {
        header: {
          columns: [
            { text: 'Biblioteca Virtual Escolar - Contenido Multimedia', alignment: 'left', margin: [10, 10], fontSize: 12 },
            { text: `Fecha y hora: ${currentDateTime}`, alignment: 'center', margin: [10, 10], fontSize: 10 },
            { text: `Total de registros: ${totalRegistros}`, alignment: 'right', margin: [10, 10], fontSize: 12 }
          ]
        },
        footer: function(currentPage, pageCount) {
          return { text: `Página ${currentPage} de ${pageCount}`, alignment: 'center', margin: [0, 10] };
        },
        content: [
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: '#', bold: true, alignment: 'center' },
                  { text: 'Título', bold: true, alignment: 'center' },
                  { text: 'Descripción', bold: true, alignment: 'center' },
                  { text: 'Tipo', bold: true, alignment: 'center' },
                  { text: 'URL', bold: true, alignment: 'center' },
                  { text: 'Autor', bold: true, alignment: 'center' },
                  { text: 'Fecha de Publicación', bold: true, alignment: 'center' },
                  { text: 'Nivel Educativo', bold: true, alignment: 'center' }
                ],
                // Agrega cada registro multimedia mapeado a una fila de la tabla
                ...multimediaData.map((item, index) => [
                  { text: index + 1, alignment: 'center' },
                  { text: item.titulo, alignment: 'center' },
                  { text: item.descripcion, alignment: 'center' },
                  { text: item.tipo, alignment: 'center' },
                  { text: item.url, alignment: 'center' },
                  { text: item.autor, alignment: 'center' },
                  { text: formatFechaHora(item.fecha_publicacion), alignment: 'center' },
                  { text: item.nivel_educativo, alignment: 'center' }
                ])
              ]
            },
            layout: 'lightHorizontalLines' // Aplica un layout con líneas horizontales ligeras a la tabla
          }
        ],
        pageMargins: [40, 60, 40, 60], // Define los márgenes de la página
        pageSize: 'A4', // Define el tamaño de la página
        pageOrientation: 'landscape' // Define la orientación horizontal de la página
      };
  
      // Establece un timeout de 10 segundos para resetear los flags en caso de que la operación tarde demasiado
      let timeoutHandle = setTimeout(() => {
        if (print) {
          window.printPDFInProgress = false;
          console.warn("Timeout: se reseteó printPDFInProgress");
        } else {
          window.exportPDFInProgress = false;
          console.warn("Timeout: se reseteó exportPDFInProgress");
        }
      }, 10000);
  
      if (print) {
        // Si se está imprimiendo, cierra la ventana anterior de impresión si existe y está abierta
        if (window.printWindow && !window.printWindow.closed) {
          window.printWindow.close();
        }
        // Genera el PDF y obtiene la URL de datos
        pdfMake.createPdf(docDefinition).getDataUrl(function(dataUrl) {
          clearTimeout(timeoutHandle); // Cancela el timeout
          window.printWindow = window.open('', '_blank'); // Abre una nueva ventana para la impresión
          window.printWindow.document.write('<iframe width="100%" height="100%" src="' + dataUrl + '"></iframe>'); // Inserta un iframe con el PDF
          window.printPDFInProgress = false; // Resetea el flag de impresión
        });
      } else {
        // Si se descarga el PDF, lo descarga y resetea el flag de exportación
        pdfMake.createPdf(docDefinition).download("multimedia.pdf");
        clearTimeout(timeoutHandle);
        window.exportPDFInProgress = false;
      }
    }
  
    // Función para manejar la importación de un archivo Excel
    function handleImportExcelChange(event) {
      const file = event.target.files[0]; // Obtiene el primer archivo seleccionado
      if (!file) return; // Si no hay archivo, sale de la función
  
      const allowedExtensions = ['.xls', '.xlsx']; // Define las extensiones permitidas
      const lowerFileName = file.name.toLowerCase(); // Convierte el nombre del archivo a minúsculas
      // Verifica si el nombre del archivo termina con alguna de las extensiones permitidas
      if (!allowedExtensions.some(ext => lowerFileName.endsWith(ext))) {
        Swal.fire('Error', 'El archivo debe ser .xls o .xlsx', 'error'); // Muestra un error
        event.target.value = ""; // Reinicia el input
        return;
      }
  
      const reader = new FileReader(); // Crea un FileReader para leer el archivo
      reader.onload = function(e) {
        const data = new Uint8Array(e.target.result); // Convierte el resultado a un Uint8Array
        const workbook = XLSX.read(data, { type: 'array' }); // Lee el archivo Excel como un workbook
        const sheetName = workbook.SheetNames[0]; // Obtiene el nombre de la primera hoja
        const worksheet = workbook.Sheets[sheetName]; // Obtiene la hoja de Excel
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Convierte la hoja a JSON (array de arrays)
        if (jsonData.length <= 1) { // Si el Excel no tiene datos (solo encabezado o vacío)
          Swal.fire('Aviso', 'El archivo Excel no contiene datos.', 'info');
          return;
        }
  
        const rowsToImport = []; // Array para almacenar las filas válidas a importar
        for (let i = 1; i < jsonData.length; i++) { // Itera desde la segunda fila (índice 1), omitiendo el encabezado
          const row = jsonData[i];
          // Se esperan 7 columnas: Título, Descripción, Tipo, URL, Autor, Etiquetas y Nivel Educativo
          if (!row || row.length < 7) continue;
  
          // Extrae y limpia cada campo de la fila
          const titulo = (row[0] || "").toString().trim();
          const descripcion = (row[1] || "").toString().trim();
          const tipo = (row[2] || "").toString().trim();
          const url = (row[3] || "").toString().trim();
          const autor = (row[4] || "").toString().trim();
          const etiquetas = (row[5] || "").toString().trim();
          const nivel_educativo = (row[6] || "").toString().trim();
          // Asigna automáticamente la fecha/hora de importación
          const fecha_publicacion = getCurrentDateTime('America/Mexico_City');
  
          // Si falta algún campo obligatorio, omite la fila y muestra una advertencia en la consola
          if (!titulo || !descripcion || !tipo || !url || !autor || !nivel_educativo) {
            console.warn(`Fila ${i+1} con datos insuficientes, se omite.`);
            continue;
          }
          // Agrega el objeto con los datos de la fila al array de filas a importar
          rowsToImport.push({
            titulo,
            descripcion,
            tipo,
            url,
            autor,
            fecha_publicacion,
            etiquetas,
            nivel_educativo
          });
        }
  
        if (rowsToImport.length === 0) { // Si no se encontraron filas válidas
          Swal.fire('Aviso', 'No se encontraron filas válidas en el Excel.', 'info');
          return;
        }
  
        // -------------------------------------
        // MOSTRAR BARRA DE PROGRESO (FAKE)
        // -------------------------------------
        showProgressModal(); // Muestra el modal de progreso
        let fakeProgress = 0; // Inicializa el progreso simulado en 0%
        const intervalId = setInterval(() => { // Inicia un intervalo para simular el avance de la barra de progreso
          if (fakeProgress < 90) { // Mientras el progreso sea menor al 90%
            fakeProgress++; // Incrementa el progreso
            updateProgressBar(fakeProgress); // Actualiza la barra de progreso con el nuevo valor
          } else {
            clearInterval(intervalId); // Detiene el intervalo al llegar al 90%
          }
        }, 100);
        // -------------------------------------
  
        // Envía una petición POST para importar los datos al servidor
        fetch('crud_multimedia.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'import', multimediaData: rowsToImport })
        })
        .then(response => response.json()) // Convierte la respuesta a JSON
        .then(data => {
          if (data.success) { // Si la importación fue exitosa
            // Filtra los registros que no fueron importados correctamente
            const omitidos = data.detalles.filter(det => !det.exito);
            let detailsMessage = "";
            if (omitidos.length > 0) { // Si hay registros omitidos
              detailsMessage += "<br><br><strong>Detalles de omitidos:</strong>";
              // Define el estilo del contenedor de detalles, con scroll si hay muchos detalles
              const containerStyle = (omitidos.length > 5)
                ? "max-height:150px;overflow-y:auto;margin-top:10px;"
                : "margin-top:10px;";
              const maxDetalles = 20; // Número máximo de detalles a mostrar
              const omitidosAMostrar = omitidos.slice(0, maxDetalles);
              let omittedHtml = "<ul style='list-style-type: disc; padding-left:20px;'>";
              omitidosAMostrar.forEach(detalle => { // Itera sobre los registros omitidos a mostrar
                omittedHtml += `<li>Fila ${detalle.fila}: ${detalle.motivo}</li>`;
              });
              omittedHtml += "</ul>";
              detailsMessage += `<div style="${containerStyle}">${omittedHtml}</div>`;
              if (omitidos.length > maxDetalles) { // Si hay más detalles que el máximo permitido
                detailsMessage += `<br>Y ${omitidos.length - maxDetalles} registros omitidos adicionales.`;
              }
            }
            // Muestra un mensaje de advertencia si no se insertó ningún registro, o de éxito si se insertaron registros
            if (data.insertados === 0) {
              Swal.fire({
                icon: 'warning',
                title: 'Resultado de la Importación',
                html: data.message + detailsMessage
              });
            } else {
              Swal.fire({
                icon: 'success',
                title: 'Resultado de la Importación',
                html: data.message + detailsMessage
              });
            }
            loadMultimedia(); // Recarga el contenido multimedia tras la importación
          } else {
            Swal.fire('Error', data.message, 'error'); // Muestra un error si la importación falló
          }
        })
        .catch(error => {
          console.error("Error en la importación:", error);
          Swal.fire('Error', 'Ocurrió un error al importar los datos', 'error');
        })
        .finally(() => {
          // -------------------------------------
          // CERRAR BARRA DE PROGRESO
          // -------------------------------------
          clearInterval(intervalId); // Detiene el intervalo de progreso
          updateProgressBar(100); // Actualiza la barra al 100%
          setTimeout(() => {
            hideProgressModal(); // Oculta el modal de progreso después de 500ms
          }, 500);
          event.target.value = ""; // Reinicia el valor del input de Excel
        });
      };
      reader.readAsArrayBuffer(file); // Lee el archivo Excel como un ArrayBuffer
    }
  
    // Configura el botón para exportar a Excel con jQuery y el namespace ".multimedia"
    $(exportExcelButton).off('click.multimedia').on('click.multimedia', exportToExcel);
    // Configura el botón para exportar a PDF (descarga) con jQuery
    $(exportPDFButton).off('click.multimedia').on('click.multimedia', () => exportToPDF(false));
    // Configura el botón para imprimir a PDF con jQuery
    $(printButton).off('click.multimedia').on('click.multimedia', () => exportToPDF(true));
    // Configura el botón para importar Excel; al hacer clic, se simula el clic en el input oculto
    $(importExcelButton).off('click.multimedia').on('click.multimedia', () => { $(importExcelInput).click(); });
    // Configura el evento de cambio en el input de Excel para manejar la importación
    $(importExcelInput).off('change.multimedia').on('change.multimedia', handleImportExcelChange);
  
    loadMultimedia(); // Carga el contenido multimedia al inicializar la gestión
  }
  
  // Cuando el documento esté listo, utiliza jQuery para esperar que el elemento "#multimediaForm" exista antes de inicializar la gestión multimedia
  $(document).ready(function() {
    waitForElement('#multimediaForm', initializeGestionMultimedia);
  });
  
  // Función para esperar a que un elemento esté presente en el DOM antes de ejecutar un callback
  function waitForElement(selector, callback) {
    const element = document.querySelector(selector); // Intenta obtener el elemento mediante el selector proporcionado
    if (element) {
      callback(); // Si el elemento existe, ejecuta el callback
    } else {
      setTimeout(() => waitForElement(selector, callback), 100); // Si no existe, vuelve a intentarlo después de 100ms
    }
  }
})();
