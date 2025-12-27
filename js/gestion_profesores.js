// Función para obtener la fecha y hora actual en formato "Sáb, 2025-03-01 01:14:08"
function getCurrentDateTime(timeZone = 'America/Mexico_City') { // Define la función que recibe opcionalmente una zona horaria (por defecto 'America/Mexico_City')
    const now = new Date(); // Crea un objeto Date con la fecha y hora actuales
    const weekday = now.toLocaleDateString('es-ES', { // Convierte la fecha actual a una cadena en formato local para 'es-ES'
      timeZone: timeZone, // Especifica la zona horaria para la conversión
      weekday: 'short' // Solicita el día de la semana en formato abreviado (por ejemplo, "sáb")
    }).replace(/\./g, ''); // Elimina cualquier punto (".") que pudiera aparecer en el nombre del día
    const day = now.toLocaleDateString('es-ES', { timeZone: timeZone, day: '2-digit' }); // Extrae el día en formato de dos dígitos (ej.: "01")
    const month = now.toLocaleDateString('es-ES', { timeZone: timeZone, month: '2-digit' }); // Extrae el mes en formato de dos dígitos (ej.: "03")
    const year = now.toLocaleDateString('es-ES', { timeZone: timeZone, year: 'numeric' }); // Extrae el año en formato numérico completo (ej.: "2025")
    const timeString = now.toLocaleTimeString('es-ES', { // Obtiene la hora en formato local para 'es-ES'
      timeZone: timeZone, // Usa la zona horaria especificada para la conversión
      hour: '2-digit', // Formatea las horas con dos dígitos
      minute: '2-digit', // Formatea los minutos con dos dígitos
      second: '2-digit', // Formatea los segundos con dos dígitos
      hour12: false // Fuerza el uso del formato 24 horas, sin indicador AM/PM
    });
    const formattedWeekday = weekday + ','; // Concatena una coma al día abreviado para obtener el formato deseado
    return `${formattedWeekday} ${year}-${month}-${day} ${timeString}`; // Retorna la cadena completa con el formato "Día, YYYY-MM-DD HH:mm:ss"
}

// (Opcional) Convierte fechas usando la lógica local
function formatDateTime(dateInput, timeZone = 'America/Mexico_City') { // Define la función que recibe una fecha (dateInput) y opcionalmente una zona horaria
  const date = new Date(dateInput); // Crea un objeto Date a partir del input proporcionado
  if (isNaN(date)) return dateInput; // Si el input no se puede convertir a una fecha válida, retorna el input original
  const weekday = date.toLocaleDateString('es-ES', { // Convierte la fecha a una cadena local para 'es-ES'
    timeZone: timeZone, // Especifica la zona horaria para la conversión
    weekday: 'short' // Solicita el día de la semana en formato abreviado
  }).replace(/\./g, ''); // Elimina los puntos que pudieran estar en el nombre del día
  const day = date.toLocaleDateString('es-ES', { timeZone: timeZone, day: '2-digit' }); // Extrae el día con dos dígitos
  const month = date.toLocaleDateString('es-ES', { timeZone: timeZone, month: '2-digit' }); // Extrae el mes con dos dígitos
  const year = date.toLocaleDateString('es-ES', { timeZone: timeZone, year: 'numeric' }); // Extrae el año en formato numérico completo
  const timeString = date.toLocaleTimeString('es-ES', { // Obtiene la hora en formato local para 'es-ES'
    timeZone: timeZone, // Usa la zona horaria especificada
    hour: '2-digit', // Formatea las horas con dos dígitos
    minute: '2-digit', // Formatea los minutos con dos dígitos
    second: '2-digit', // Formatea los segundos con dos dígitos
    hour12: false // Fuerza el formato de 24 horas
  });
  // Capitaliza la primera letra del día y concatena una coma al final
  const formattedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1) + ',';
  return `${formattedWeekday} ${year}-${month}-${day} ${timeString}`; // Retorna la cadena con el formato "Día, YYYY-MM-DD HH:mm:ss"
}

function initializeGestionProfesores() { // Función principal para inicializar la gestión de profesores
    // Verifica que jQuery esté cargado
    if (typeof $ === 'undefined') { // Comprueba si la variable $ (jQuery) está definida
        console.error("jQuery no se ha cargado correctamente."); // Imprime un error en la consola si jQuery no está disponible
        Swal.fire('Error', 'jQuery no se ha cargado correctamente.', 'error'); // Muestra una alerta de error al usuario
        return; // Termina la ejecución de la función si jQuery no está cargado
    }

    // Inicializa dos dropdowns personalizados para horarios de entrada y salida
    initCustomDropdown('dropdownEntrada', 'horarioEntrada'); // Inicializa el dropdown para el horario de entrada, vinculándolo a un input oculto
    initCustomDropdown('dropdownSalida', 'horarioSalida'); // Inicializa el dropdown para el horario de salida, vinculándolo a un input oculto

    // Asigna variables utilizando jQuery para seleccionar elementos del DOM
    const form              = $("#profesorForm"); // Selecciona el formulario de profesores
    const profesoresTable   = $("#profesoresTable"); // Selecciona la tabla donde se mostrarán los profesores
    const searchInput       = $("#searchInput"); // Selecciona el campo de búsqueda
    const profesorModal     = $("#profesorModal"); // Selecciona el modal para agregar o editar profesores
    const closeModal        = $(".close"); // Selecciona los elementos con clase "close" para cerrar modales
    const totalRecordsSpan  = $("#totalRecords"); // Selecciona el elemento que muestra el total de registros
    const exportPDFButton   = $("#exportPDFButton"); // Selecciona el botón para exportar la lista a PDF
    const printButton       = $("#printButton"); // Selecciona el botón para imprimir el PDF
    const sortOrderSelect   = $("#sortOrder"); // Selecciona el elemento select para el ordenamiento de registros
    const paginationContainer = $('.pagination-container'); // Selecciona el contenedor para la paginación

    // Variables relacionadas con dropdowns personalizados para horarios
    const hiddenEntrada     = $("#horarioEntrada"); // Selecciona el input oculto que almacena el horario de entrada
    const hiddenSalida      = $("#horarioSalida"); // Selecciona el input oculto que almacena el horario de salida
    const verProfesorModal  = $("#verProfesorModal"); // Selecciona el modal para ver detalles del profesor
    const closeVerModal     = $(".close-ver-modal"); // Selecciona el elemento para cerrar el modal de ver profesor

    // Variables para paginación y datos
    let currentPage         = 1; // Página actual de la tabla
    const recordsPerPage    = 10; // Número de registros a mostrar por página
    let totalRecordsCount   = 0; // Contador total de registros
    let profesoresData      = []; // Array que contendrá todos los datos de profesores
    let filteredData        = []; // Array para almacenar datos filtrados (por búsqueda u ordenamiento)
    let isEditMode          = false; // Bandera para indicar si se está editando un registro (true) o creando uno nuevo (false)

    // Leer el orden guardado en localStorage y asignarlo al select de ordenamiento
    const savedSortOrder = localStorage.getItem("sortOrder") || "recientes"; // Obtiene el orden guardado o usa "recientes" por defecto
    if (sortOrderSelect.length) { // Verifica que el select exista
        sortOrderSelect.val(savedSortOrder); // Asigna el valor obtenido al select
    }

    // Función para inicializar un dropdown personalizado
    function initCustomDropdown(dropdownId, hiddenInputId) { // Recibe el id del dropdown y el id del input oculto asociado
        const dropdown = document.getElementById(dropdownId); // Obtiene el elemento del dropdown usando su id
        const selected = dropdown.querySelector('.dropdown-selected'); // Obtiene el elemento que muestra la opción seleccionada
        const list = dropdown.querySelector('.dropdown-list'); // Obtiene la lista de opciones del dropdown
        const hiddenInput = document.getElementById(hiddenInputId); // Obtiene el input oculto que almacenará el valor seleccionado

        selected.addEventListener('click', function(e) { // Agrega un evento de clic al elemento seleccionado
            e.stopPropagation(); // Previene que el clic se propague a otros elementos
            list.style.display = (list.style.display === 'block') ? 'none' : 'block'; // Alterna la visibilidad de la lista de opciones
        });
        const items = list.querySelectorAll('.dropdown-item'); // Selecciona todos los elementos de la lista que representan opciones
        items.forEach(function(item) { // Itera sobre cada opción del dropdown
            item.addEventListener('click', function() { // Agrega un evento de clic a cada opción
                hiddenInput.value = this.getAttribute('data-value'); // Asigna el valor de la opción al input oculto
                selected.textContent = this.getAttribute('data-value'); // Actualiza el texto del elemento seleccionado con el valor elegido
                list.style.display = 'none'; // Oculta la lista de opciones después de seleccionar
            });
        });
        document.addEventListener('click', function() { // Agrega un evento de clic al documento
            list.style.display = 'none'; // Oculta la lista de opciones si se hace clic fuera del dropdown
        });
    }

    // Evento para cerrar el modal de profesores al hacer clic en el botón de cerrar
    closeModal.on("click", function () {
        profesorModal.hide(); // Oculta el modal de profesores
        form.trigger("reset"); // Resetea el formulario (limpia los datos)
    });
    // Evento para cerrar el modal al hacer clic fuera del contenido del modal
    $(window).on("click", function (event) {
        if ($(event.target).is(profesorModal)) { // Si el clic se realiza sobre el modal (fuera del contenido)
            profesorModal.hide(); // Oculta el modal
            form.trigger("reset"); // Resetea el formulario
        }
        if ($(event.target).is(verProfesorModal)) { // Si se hace clic fuera del modal de ver profesor
            verProfesorModal.hide(); // Oculta el modal de ver profesor
        }
    });
    // Evento para cerrar el modal de ver profesor usando el botón específico
    if (closeVerModal.length) {
        closeVerModal.on("click", function () {
            verProfesorModal.hide(); // Oculta el modal de ver profesor
        });
    }

    // Función para validar que se hayan seleccionado ambos horarios y que la hora de salida sea mayor que la de entrada
    function validarInputFinal() {
        const horarioEntrada = hiddenEntrada.val(); // Obtiene el valor del input oculto para el horario de entrada
        const horarioSalida = hiddenSalida.val(); // Obtiene el valor del input oculto para el horario de salida

        if (!horarioEntrada || !horarioSalida) { // Si alguno de los horarios está vacío
            Swal.fire('Error', 'Por favor, selecciona ambos horarios.', 'error'); // Muestra un mensaje de error
            return false; // Retorna false para indicar que la validación falló
        }
        if (horarioEntrada >= horarioSalida) { // Si el horario de entrada es igual o mayor que el de salida
            Swal.fire('Error', 'La hora de salida debe ser posterior a la de entrada.', 'error'); // Muestra un mensaje de error
            return false; // Retorna false ya que la validación no es correcta
        }
        return true; // Si todo es correcto, retorna true
    }

    // Función para manejar el envío del formulario de profesor (crear o actualizar)
    function handleProfesorFormSubmit(event) {
        event.preventDefault(); // Previene el envío tradicional del formulario (evita recargar la página)
        if (!validarInputFinal()) return; // Llama a la validación de horarios y detiene el proceso si falla

        const formData   = new FormData(form[0]); // Crea un objeto FormData a partir del formulario
        const profesorId = $("#profesorId").val(); // Obtiene el valor del campo oculto que identifica al profesor

        // Combina los horarios de entrada y salida en un solo campo "horarioTrabajo"
        formData.set('horarioTrabajo', `${hiddenEntrada.val()} - ${hiddenSalida.val()}`);
        const diasTrabajo = $('#diasTrabajo').val() || []; // Obtiene los días de trabajo seleccionados; si no hay, usa un array vacío
        formData.set('diasTrabajo', diasTrabajo.join(',')); // Convierte el array de días a una cadena separada por comas y la asigna al FormData

        const action = profesorId ? 'update' : 'create'; // Define la acción: actualizar si existe un profesorId, o crear uno nuevo
        if (profesorId) {
            formData.set('id', profesorId); // Si es actualización, añade el id del profesor al FormData
        }

        // Envía los datos al servidor mediante fetch
        fetch(`crud_profesores.php?action=${action}`, {
            method: 'POST', // Utiliza el método POST
            body: formData // Envía el objeto FormData
        })
        .then(response => response.json()) // Convierte la respuesta del servidor a JSON
        .then(data => { // Procesa el objeto JSON recibido
            if (data.success) { // Si la operación fue exitosa
                Swal.fire('Éxito', data.message, 'success'); // Muestra un mensaje de éxito
                loadProfesores(false); // Recarga la lista de profesores sin reiniciar la paginación
                form.trigger("reset"); // Resetea el formulario
                profesorModal.hide(); // Oculta el modal de profesores
            } else {
                Swal.fire('Error', data.message, 'error'); // Muestra un mensaje de error con la información recibida
            }
        })
        .catch(error => { // Captura cualquier error en la solicitud fetch
            console.error('Error:', error); // Imprime el error en la consola
            Swal.fire('Error', 'Ocurrió un error: ' + error.message, 'error'); // Muestra una alerta de error al usuario
        });
    }
    if (form.length) { // Verifica que el formulario exista
        form.on("submit", handleProfesorFormSubmit); // Asocia la función de envío del formulario al evento submit
    }

    // Función para renderizar la tabla de profesores
    function renderTable(data) {
        if (!profesoresTable.length) return; // Si la tabla no existe, finaliza la función
        const startIndex = (currentPage - 1) * recordsPerPage; // Calcula el índice de inicio para la página actual
        const endIndex   = startIndex + recordsPerPage; // Calcula el índice final para la página actual
        const pageData   = data.slice(startIndex, endIndex); // Extrae la porción de datos que se mostrará en la página actual

        profesoresTable.empty(); // Limpia el contenido actual de la tabla
        pageData.forEach((profesor, index) => { // Itera sobre cada profesor de la página actual
            profesoresTable.append(` 
                <tr>
                    <td><input type="checkbox" data-id="${profesor.IdUsuario}"></td> <!-- Checkbox para seleccionar el profesor -->
                    <td>${startIndex + index + 1}</td> <!-- Número secuencial del registro -->
                    <td>${profesor.Nombre || ''}</td> <!-- Muestra el nombre del profesor o cadena vacía si no existe -->
                    <td>${profesor.ApPaterno || ''}</td> <!-- Muestra el apellido paterno -->
                    <td>${profesor.ApMaterno || ''}</td> <!-- Muestra el apellido materno -->
                    <td>${profesor.Salon || ''}</td> <!-- Muestra el salón asignado -->
                    <td>${profesor.HorarioTrabajo || ''}</td> <!-- Muestra el horario de trabajo -->
                    <td>${profesor.DiasTrabajo || ''}</td> <!-- Muestra los días de trabajo -->
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-view view-button grow" data-id="${profesor.IdUsuario}">
                                <i class="fas fa-eye"></i> Ver
                            </button> <!-- Botón para ver detalles del profesor -->
                        </div>
                    </td>
                </tr>
            `); // Agrega una fila a la tabla con los datos del profesor
        });

        // Asigna el evento "click" al botón "Ver" para mostrar los detalles del profesor
        $(".view-button").off("click").on("click", function() {
            const id = $(this).data("id"); // Obtiene el id del profesor a ver desde el atributo data-id
            verProfesor(id); // Llama a la función verProfesor pasándole el id
        });

        if (totalRecordsSpan.length) { // Verifica que el elemento para mostrar el total de registros exista
            totalRecordsSpan.text(`Total de registros: ${data.length}`); // Actualiza el texto con el número total de registros
        }

        // Evento para "Select All" (seleccionar todos los checkboxes de la tabla)
        $("#selectAll").off("change").on("change", function() {
            const isChecked = $(this).is(":checked"); // Determina si el checkbox "select all" está marcado
            $("#profesoresTable input[type='checkbox']").prop("checked", isChecked); // Asigna el mismo estado a todos los checkboxes de la tabla
        });

        // Evento para el botón "Editar" que permite editar un solo registro
        $("#editProfesorButton").off("click").on("click", function() {
            const selectedCheckboxes = $("#profesoresTable input[type='checkbox']:checked"); // Obtiene todos los checkboxes seleccionados
            if (selectedCheckboxes.length !== 1) { // Si no se ha seleccionado exactamente un registro
                Swal.fire("Información", "Por favor, seleccione un único registro para editar.", "info"); // Muestra un mensaje informativo
            } else {
                const id = selectedCheckboxes.first().data("id"); // Obtiene el id del primer (y único) checkbox seleccionado
                editProfesor(id); // Llama a la función para editar el profesor con ese id
            }
        });

        // Evento para el botón "Resetear" que reinicia los valores de los profesores seleccionados
        $("#resetProfesorButton").off("click").on("click", function() {
            const selectedCheckboxes = $("#profesoresTable input[type='checkbox']:checked"); // Obtiene los checkboxes seleccionados
            if (selectedCheckboxes.length === 0) { // Si no hay registros seleccionados
                Swal.fire("Información", "Seleccione al menos un registro para resetear.", "info"); // Muestra un mensaje informativo
                return;
            }
            const selectedIds = []; // Array para almacenar los ids de los profesores seleccionados
            selectedCheckboxes.each(function() { // Itera sobre cada checkbox seleccionado
                selectedIds.push($(this).data("id")); // Agrega el id al array
            });

            // Muestra una alerta de confirmación para resetear los profesores seleccionados
            Swal.fire({
                title: 'Confirmación',
                text: `¿Realmente deseas resetear ${selectedIds.length} profesor(es)?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, resetear',
                cancelButtonText: 'Cancelar'
            }).then((result) => { // Procesa la respuesta del usuario
                if (result.isConfirmed) { // Si el usuario confirma
                    const formData = new FormData(); // Crea un objeto FormData vacío
                    formData.append('ids', JSON.stringify(selectedIds)); // Agrega los ids seleccionados como una cadena JSON
                    fetch('crud_profesores.php?action=resetSelected', { // Envía una petición para resetear los registros
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json()) // Convierte la respuesta a JSON
                    .then(data => { // Procesa la respuesta
                        if (data.success) { // Si la operación es exitosa
                            Swal.fire('Éxito', data.message, 'success'); // Muestra un mensaje de éxito
                            $("#selectAll").prop("checked", false); // Desmarca el checkbox "Select All"
                            loadProfesores(false); // Recarga la lista de profesores sin reiniciar la paginación
                        } else {
                            Swal.fire('Error', data.message, 'error'); // Muestra un mensaje de error
                        }
                    })
                    .catch(error => { // Captura cualquier error en la solicitud
                        console.error('Error:', error); // Imprime el error en la consola
                        Swal.fire('Error', 'Ocurrió un error: ' + error.message, 'error'); // Muestra una alerta de error
                    });
                }
            });
        });

        // Se invoca la nueva paginación y se actualiza según la cantidad total de registros
        updatePagination(data.length);
    }

    // NUEVA paginación con estilo “1 2 3 4 5 … 20”
    function updatePagination(totalRecords) {
        if (!paginationContainer.length) return; // Si el contenedor de paginación no existe, termina la función
        paginationContainer.empty(); // Limpia el contenido previo del contenedor

        const totalPages = Math.ceil(totalRecords / recordsPerPage); // Calcula el número total de páginas necesarias

        // Crea un elemento <ul> para alojar los botones de paginación
        const ul = $('<ul class="pagination"></ul>');

        // Botón "«" (Anterior) con icono
        const prevLi = $('<li></li>'); // Crea un elemento <li> para el botón anterior
        const prevA  = $('<a></a>').html('<i class="fas fa-chevron-left"></i>'); // Crea un enlace que contiene un icono de flecha izquierda
        if (currentPage === 1) { // Si estamos en la primera página
            prevA.addClass('disabled').css('pointer-events', 'none'); // Deshabilita el botón (sin eventos de clic)
        } else {
            prevA.on('click', function() { // Si no es la primera página, asigna un evento para ir a la página anterior
                if (currentPage > 1) {
                    currentPage--; // Decrementa la página actual
                    renderTable(filteredData.length ? filteredData : profesoresData); // Renderiza la tabla con los datos filtrados o completos
                }
            });
        }
        prevLi.append(prevA); // Inserta el enlace en el <li>
        ul.append(prevLi); // Agrega el <li> al <ul>

        if (totalPages <= 5) { // Si el número total de páginas es 5 o menos
            // Mostrar todas las páginas
            for (let i = 1; i <= totalPages; i++) { // Itera desde la primera hasta la última página
                const li = $('<li></li>'); // Crea un elemento <li> para cada número de página
                const a  = $('<a></a>').text(i); // Crea un enlace con el número de página como texto
                if (i === currentPage) { // Si es la página actual
                    a.addClass('active'); // Marca el enlace como activo
                } else {
                    a.on('click', function() { // Asigna un evento de clic para cambiar a la página seleccionada
                        currentPage = i;
                        renderTable(filteredData.length ? filteredData : profesoresData);
                    });
                }
                li.append(a); // Inserta el enlace en el <li>
                ul.append(li); // Agrega el <li> al <ul>
            }
        } else { // Si hay más de 5 páginas
            // Mostramos las primeras 5 páginas
            for (let i = 1; i <= 5; i++) { // Itera para crear botones para las primeras 5 páginas
                const li = $('<li></li>');
                const a  = $('<a></a>').text(i);
                if (i === currentPage) {
                    a.addClass('active'); // Marca la página actual
                } else {
                    a.on('click', function() { // Asigna el evento de cambio de página
                        currentPage = i;
                        renderTable(filteredData.length ? filteredData : profesoresData);
                    });
                }
                li.append(a);
                ul.append(li);
            }
            // Agrega un elemento de elipsis para indicar que hay más páginas entre medias
            const ellipsisLi = $('<li></li>').text('...');
            ul.append(ellipsisLi);

            // Agrega el botón para la última página
            const lastLi = $('<li></li>');
            const lastA  = $('<a></a>').text(totalPages);
            if (currentPage === totalPages) {
                lastA.addClass('active'); // Si estamos en la última página, la marca como activa
            } else {
                lastA.on('click', function() { // Asigna el evento de clic para cambiar a la última página
                    currentPage = totalPages;
                    renderTable(filteredData.length ? filteredData : profesoresData);
                });
            }
            lastLi.append(lastA);
            ul.append(lastLi);
        }

        // Botón "»" (Siguiente) con icono
        const nextLi = $('<li></li>'); // Crea un elemento <li> para el botón siguiente
        const nextA  = $('<a></a>').html('<i class="fas fa-chevron-right"></i>'); // Crea un enlace con un icono de flecha derecha
        if (currentPage === totalPages || totalPages === 0) { // Si estamos en la última página o no hay páginas
            nextA.addClass('disabled').css('pointer-events', 'none'); // Deshabilita el botón
        } else {
            nextA.on('click', function() { // Si hay página siguiente, asigna el evento para avanzar
                if (currentPage < totalPages) {
                    currentPage++;
                    renderTable(filteredData.length ? filteredData : profesoresData);
                }
            });
        }
        nextLi.append(nextA);
        ul.append(nextLi);

        // Inserta la lista de paginación en el contenedor correspondiente
        paginationContainer.append(ul);
    }

    // Función para cargar la lista de profesores desde el servidor
    function loadProfesores(resetPage = true) {
        const sortOrder = localStorage.getItem("sortOrder") || "recientes"; // Obtiene el orden de clasificación guardado en localStorage o usa "recientes"
        fetch(`crud_profesores.php?action=read&sortOrder=${sortOrder}`) // Realiza una petición al servidor para obtener los profesores, enviando el orden de clasificación
        .then(response => response.json()) // Convierte la respuesta a JSON
        .then(data => { // Procesa el objeto JSON recibido
            profesoresData = data.profesores; // Almacena los datos de profesores en el array
            filteredData   = profesoresData; // Inicialmente, los datos filtrados son los mismos que los completos
            totalRecordsCount = profesoresData.length; // Actualiza el contador total de registros
            if (resetPage) currentPage = 1; // Si se requiere reiniciar la paginación, establece la página actual a 1
            renderTable(profesoresData); // Llama a la función para renderizar la tabla con los datos de profesores
        })
        .catch(error => { // Captura cualquier error en la solicitud
            console.error('Error:', error); // Imprime el error en la consola
            Swal.fire('Error', 'Ocurrió un error al cargar los profesores: ' + error.message, 'error'); // Muestra una alerta de error al usuario
        });
    }

    // Evento para cambiar el orden de clasificación usando el select
    if (sortOrderSelect.length) {
        sortOrderSelect.on("change", function() {
            const valor = $(this).val(); // Obtiene el nuevo valor seleccionado
            localStorage.setItem("sortOrder", valor); // Guarda el nuevo orden en localStorage
            loadProfesores(); // Recarga la lista de profesores con el nuevo orden
        });
    }

    // Evento para realizar búsquedas en la lista de profesores
    if (searchInput.length) {
        searchInput.on("input", function(event) {
            const term = $(this).val().toLowerCase(); // Convierte el término de búsqueda a minúsculas
            filteredData = profesoresData.filter(prof => { // Filtra la lista de profesores según el término de búsqueda
                const nombre = (prof.Nombre || '').toLowerCase();
                const apP    = (prof.ApPaterno || '').toLowerCase();
                const apM    = (prof.ApMaterno || '').toLowerCase();
                const salon  = (prof.Salon || '').toLowerCase();
                const dias   = (prof.DiasTrabajo || '').toLowerCase();
                return (
                    nombre.includes(term) ||
                    apP.includes(term)    ||
                    apM.includes(term)    ||
                    salon.includes(term)  ||
                    dias.includes(term)
                ); // Retorna true si el término aparece en alguno de los campos
            });
            currentPage = 1; // Reinicia la paginación a la primera página
            renderTable(filteredData); // Renderiza la tabla con los datos filtrados
        });
    }

    // Función global para editar un profesor; se invoca con el id del profesor a editar
    window.editProfesor = function(id) {
        isEditMode = true; // Activa el modo de edición
        fetch(`crud_profesores.php?action=read&id=${id}`) // Realiza una petición para obtener los datos del profesor
        .then(response => response.json()) // Convierte la respuesta a JSON
        .then(data => { // Procesa la respuesta
            if (data.profesor) { // Si se encontró el profesor
                $("#profesorId").val(data.profesor.IdUsuario || ''); // Carga el id del profesor en el input oculto
                $("#salon").val(data.profesor.Salon || ''); // Carga el salón asignado
                const horario = data.profesor.HorarioTrabajo ? data.profesor.HorarioTrabajo.split(' - ') : ['', '']; // Separa el horario de trabajo en entrada y salida
                $("#dropdownEntrada .dropdown-selected").text(horario[0] || "09:00"); // Muestra la hora de entrada en el dropdown personalizado
                $("#horarioEntrada").val(horario[0] || "09:00"); // Asigna la hora de entrada al input oculto
                $("#dropdownSalida .dropdown-selected").text(horario[1] || "14:00"); // Muestra la hora de salida en el dropdown personalizado
                $("#horarioSalida").val(horario[1] || "14:00"); // Asigna la hora de salida al input oculto
                const diasTrabajo = data.profesor.DiasTrabajo ? data.profesor.DiasTrabajo.split(',') : []; // Separa los días de trabajo en un array
                $('#diasTrabajo').val(diasTrabajo).trigger('change'); // Asigna los días de trabajo al select y dispara el evento change
                $("#nombreEdit").text(`${data.profesor.Nombre || ''} ${data.profesor.ApPaterno || ''} ${data.profesor.ApMaterno || ''}`.trim()); // Muestra el nombre completo del profesor en el modal de edición
                profesorModal.show(); // Muestra el modal para editar el profesor
                profesorModal.scrollTop(0); // Asegura que el modal se muestre desde el inicio (scroll en 0)
            } else {
                Swal.fire('Error', 'Profesor no encontrado', 'error'); // Muestra un mensaje de error si el profesor no existe
            }
        })
        .catch(error => { // Captura errores en la solicitud
            console.error('Error:', error); // Imprime el error en la consola
            Swal.fire('Error', 'Ocurrió un error al cargar el profesor', 'error'); // Muestra un mensaje de error al usuario
        });
    };

    // Función global para resetear (eliminar) un profesor
    window.resetProfesor = function(id) {
        Swal.fire({ // Muestra una alerta de confirmación
            title: 'Confirmación',
            text: '¿Realmente deseas resetear los valores del profesor?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, resetear',
            cancelButtonText: 'Cancelar'
        }).then((result) => { // Procesa la respuesta del usuario
            if (result.isConfirmed) { // Si el usuario confirma la acción
                fetch(`crud_profesores.php?action=delete&id=${id}`) // Realiza una petición para eliminar (resetear) el profesor
                .then(response => response.json()) // Convierte la respuesta a JSON
                .then(data => { // Procesa la respuesta
                    if (data.success) { // Si la operación es exitosa
                        Swal.fire('Éxito', data.message, 'success'); // Muestra un mensaje de éxito
                        loadProfesores(false); // Recarga la lista de profesores sin reiniciar la paginación
                    } else {
                        Swal.fire('Error', data.message, 'error'); // Muestra un mensaje de error en caso de fallo
                    }
                })
                .catch(error => { // Captura errores en la solicitud
                    console.error('Error:', error); // Imprime el error en la consola
                    Swal.fire('Error', 'Ocurrió un error: ' + error.message, 'error'); // Muestra una alerta de error
                });
            }
        });
    };

    // Función global para ver los detalles de un profesor
    window.verProfesor = function(id) {
        fetch(`crud_profesores.php?action=read&id=${id}`) // Realiza una petición para obtener los datos del profesor
        .then(response => response.json()) // Convierte la respuesta a JSON
        .then(data => { // Procesa la respuesta
            if (data.profesor) { // Si se encontró el profesor
                const nombreCompleto = `${data.profesor.Nombre || ''} ${data.profesor.ApPaterno || ''} ${data.profesor.ApMaterno || ''}`.trim(); // Combina el nombre y apellidos para formar el nombre completo
                $("#verNombreCompleto").text(nombreCompleto); // Muestra el nombre completo en el modal de ver profesor
                const horarioStr = data.profesor.HorarioTrabajo || ' - '; // Obtiene el string de horario de trabajo
                const [entrada, salida] = horarioStr.split(' - '); // Separa el horario en entrada y salida
                $("#verSalon").text(data.profesor.Salon || ''); // Muestra el salón asignado
                $("#verEntrada").text(entrada || ''); // Muestra la hora de entrada
                $("#verSalida").text(salida || ''); // Muestra la hora de salida
                $("#verDias").text(data.profesor.DiasTrabajo || ''); // Muestra los días de trabajo
                verProfesorModal.show(); // Muestra el modal con los detalles del profesor
            } else {
                Swal.fire('Error', 'Profesor no encontrado', 'error'); // Muestra un mensaje de error si no se encuentra el profesor
            }
        })
        .catch(error => { // Captura errores en la solicitud
            console.error('Error:', error); // Imprime el error en la consola
            Swal.fire('Error', 'Ocurrió un error al cargar los detalles del profesor', 'error'); // Muestra una alerta de error
        });
    };

    // Función para exportar o imprimir la lista de profesores en formato PDF
    function exportToPDF(print = false) { // Recibe un parámetro para determinar si se debe imprimir (true) o descargar (false)
        if (typeof pdfMake === 'undefined') { // Verifica si la librería pdfMake está cargada
            Swal.fire('Error', 'No se pudo cargar pdfMake.', 'error'); // Muestra un error si pdfMake no está disponible
            return; // Termina la función
        }
        const totalRegistros = profesoresData.length; // Calcula el total de registros de profesores
        const currentDateTime = getCurrentDateTime('America/Mexico_City'); // Obtiene la fecha y hora actual en el formato definido
        const docDefinition = { // Define la estructura del documento PDF
            header: { // Encabezado del PDF
                columns: [ // Define columnas en el encabezado
                    {
                        text: 'Primaria Manuel Del Mazo Villasante - Gestión de Profesores',
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
            footer: function(currentPage, pageCount) { // Función para el pie de página, que muestra el número de página
                return {
                    text: `Página ${currentPage} de ${pageCount}`,
                    alignment: 'center',
                    margin: [0, 10]
                };
            },
            content: [ // Contenido principal del PDF
                {
                    table: { // Se inserta una tabla
                        headerRows: 1, // La primera fila será el encabezado de la tabla
                        widths: ['auto','auto','auto','auto','auto','auto','auto'], // Anchos automáticos para las columnas
                        body: [ // Cuerpo de la tabla
                            [
                                { text: '#', bold: true, alignment: 'center' },
                                { text: 'Nombre', bold: true, alignment: 'center' },
                                { text: 'Apellido Paterno', bold: true, alignment: 'center' },
                                { text: 'Apellido Materno', bold: true, alignment: 'center' },
                                { text: 'Salón', bold: true, alignment: 'center' },
                                { text: 'Horario de Trabajo', bold: true, alignment: 'center' },
                                { text: 'Día de Trabajo', bold: true, alignment: 'center' }
                            ],
                            ...profesoresData.map((prof, index) => [ // Mapea cada profesor a una fila de la tabla
                                { text: index + 1, alignment: 'center' },
                                { text: prof.Nombre || '', alignment: 'center' },
                                { text: prof.ApPaterno || '', alignment: 'center' },
                                { text: prof.ApMaterno || '', alignment: 'center' },
                                { text: prof.Salon || '', alignment: 'center' },
                                { text: prof.HorarioTrabajo || '', alignment: 'center' },
                                { text: prof.DiasTrabajo || '', alignment: 'center' }
                            ])
                        ]
                    },
                    layout: 'lightHorizontalLines' // Define un diseño con líneas horizontales ligeras para la tabla
                }
            ],
            pageMargins: [40, 60, 40, 60], // Define los márgenes de la página
            pageSize: 'A4', // Define el tamaño de la página como A4
            pageOrientation: 'landscape' // Establece la orientación de la página como horizontal
        };
        const pdfDoc = pdfMake.createPdf(docDefinition); // Crea el documento PDF usando pdfMake
        if (print) { // Si se desea imprimir en lugar de descargar
            pdfDoc.getDataUrl((dataUrl) => { // Obtiene la URL de datos del PDF
                const printWindow = window.open('', '_blank'); // Abre una nueva ventana para la impresión
                printWindow.document.write(`<iframe width="100%" height="100%" src="${dataUrl}"></iframe>`); // Inserta el PDF en un iframe para imprimir
            });
        } else { // Si se desea descargar el PDF
            pdfDoc.download("profesores.pdf"); // Descarga el PDF con el nombre "profesores.pdf"
        }
    }
    if (exportPDFButton.length) { // Verifica que el botón para exportar a PDF exista
        exportPDFButton.on("click", function() {
            exportToPDF(false); // Asocia el evento para descargar el PDF
        });
    }
    if (printButton.length) { // Verifica que el botón para imprimir exista
        printButton.on("click", function() {
            exportToPDF(true); // Asocia el evento para imprimir el PDF
        });
    }

    loadProfesores();  // Llama a la función para cargar la lista de profesores al iniciar
}
