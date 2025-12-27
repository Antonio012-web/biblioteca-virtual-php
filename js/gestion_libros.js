// Función para obtener la fecha y hora actual en formato "Sáb, 2025-03-01 01:14:08"
function getCurrentDateTime(timeZone = 'America/Mexico_City') { // Define la función y asigna 'America/Mexico_City' como zona horaria predeterminada
    const now = new Date(); // Crea un objeto Date con la fecha y hora actual
    // Obtenemos el día de la semana en formato corto en español y removemos puntos
    const weekday = now.toLocaleDateString('es-ES', { // Convierte la fecha actual a una cadena en español según la configuración regional 'es-ES'
      timeZone: timeZone, // Usa la zona horaria pasada como argumento
      weekday: 'short' // Solicita el nombre corto del día (ej.: "sáb")
    }).replace(/\./g, ''); // Reemplaza todos los puntos en la cadena resultante por nada (eliminándolos)
    // Obtenemos día, mes y año con dos dígitos y número completo respectivamente
    const day = now.toLocaleDateString('es-ES', { timeZone: timeZone, day: '2-digit' }); // Extrae el día en formato de dos dígitos (ej.: "01")
    const month = now.toLocaleDateString('es-ES', { timeZone: timeZone, month: '2-digit' }); // Extrae el mes en formato de dos dígitos (ej.: "03")
    const year = now.toLocaleDateString('es-ES', { timeZone: timeZone, year: 'numeric' }); // Extrae el año en formato numérico completo (ej.: "2025")
    // Obtenemos la hora en formato 24 horas con dos dígitos
    const timeString = now.toLocaleTimeString('es-ES', { // Convierte la hora actual a una cadena de tiempo según 'es-ES'
      timeZone: timeZone, // Aplica la zona horaria especificada
      hour: '2-digit', // Formatea las horas a dos dígitos
      minute: '2-digit', // Formatea los minutos a dos dígitos
      second: '2-digit', // Formatea los segundos a dos dígitos
      hour12: false // Fuerza el formato de 24 horas (sin AM/PM)
    });
    // Formateamos el día de la semana (capitalizamos y agregamos una coma)
    const formattedWeekday = weekday + ','; // Concatena una coma al nombre corto del día para el formato deseado
    return `${formattedWeekday} ${year}-${month}-${day} ${timeString}`; // Retorna la cadena completa en el formato "Día, YYYY-MM-DD HH:mm:ss"
}

// Genera fecha/hora en formato "YYYY-MM-DD HH:mm:ss"
function getCurrentDateTimeDB(timeZone = 'America/Mexico_City') { // Define la función para generar fecha y hora en formato de base de datos
    const now = new Date(); // Crea un objeto Date con la fecha y hora actual
    const year  = now.getFullYear(); // Obtiene el año actual (ej.: 2025)
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Obtiene el mes (recordando que getMonth() es 0-indexado), lo convierte a cadena y se asegura de que tenga dos dígitos
    const day   = String(now.getDate()).padStart(2, '0'); // Obtiene el día del mes, lo convierte a cadena y lo rellena a dos dígitos si es necesario
    const hours = String(now.getHours()).padStart(2, '0'); // Obtiene las horas en formato 24h y lo formatea a dos dígitos
    const mins  = String(now.getMinutes()).padStart(2, '0'); // Obtiene los minutos y lo formatea a dos dígitos
    const secs  = String(now.getSeconds()).padStart(2, '0'); // Obtiene los segundos y lo formatea a dos dígitos
    
    return `${year}-${month}-${day} ${hours}:${mins}:${secs}`; // Retorna la cadena en el formato "YYYY-MM-DD HH:mm:ss"
}

// -------------------------------------------------------------------------
// Funciones para la barra de progreso (mostrar, ocultar y actualizar)
// -------------------------------------------------------------------------
function showProgressModal() { // Función para mostrar el modal de progreso
    const progressModal = document.getElementById("progressModal"); // Obtiene el elemento del DOM con id "progressModal"
    progressModal.style.display = "block"; // Cambia su estilo para hacerlo visible
    updateProgressBar(0); // Inicializa la barra de progreso al 0%
}

function hideProgressModal() { // Función para ocultar el modal de progreso
    const progressModal = document.getElementById("progressModal"); // Obtiene el elemento "progressModal"
    progressModal.style.display = "none"; // Cambia su estilo para ocultarlo
}

function updateProgressBar(percent) { // Función que actualiza la barra de progreso con el porcentaje dado
    const progressFill = document.getElementById("progressFill"); // Obtiene el elemento que representa el relleno de la barra
    const progressText = document.getElementById("progressText"); // Obtiene el elemento que muestra el porcentaje en texto
    progressFill.style.width = percent + "%"; // Ajusta el ancho del relleno de la barra según el porcentaje
    progressText.textContent = percent + "%"; // Actualiza el texto con el porcentaje actual
}
// -------------------------------------------------------------------------

function inicializarGestionLibros() { // Función principal para inicializar la gestión de libros
    // 1. Variables / Referencias del DOM
    const form                = document.getElementById("bookForm"); // Obtiene el formulario donde se gestionan los libros
    const booksTable          = document.getElementById("booksTable"); // Obtiene la tabla donde se listan los libros
    const searchInput         = document.getElementById("searchBar"); // Obtiene la barra de búsqueda
    const addBookButton       = document.getElementById("addBookButton"); // Obtiene el botón para agregar un libro
    const bookModal           = document.getElementById("bookModal"); // Obtiene el modal para agregar/editar libros
    const closeModal          = document.querySelector(".close"); // Obtiene el elemento que cierra el modal principal
    const closeViewModal      = document.getElementById("closeViewModal"); // Obtiene el elemento que cierra el modal de ver libro
    const recordCount         = document.getElementById("totalRegistros"); // Obtiene el elemento que muestra el total de registros
    const exportExcelButton   = document.getElementById("exportExcelButton"); // Obtiene el botón para exportar la lista a Excel
    const exportPDFButton     = document.getElementById("exportPDFButton"); // Obtiene el botón para exportar la lista a PDF
    const printButton         = document.getElementById("printButton"); // Obtiene el botón para imprimir el PDF
    const importExcelButton   = document.getElementById("importExcelButton"); // Obtiene el botón para importar un archivo Excel
    const importExcelInput    = document.getElementById("importExcelInput"); // Obtiene el input (oculto) para seleccionar el archivo Excel
    const sortSelect          = document.getElementById("sortSelect"); // Obtiene el select para ordenar la lista de libros
    const deleteMassiveButton = document.getElementById("deleteMassiveButton"); // Obtiene el botón para eliminar registros de forma masiva

    let currentPage      = 1; // Inicializa la página actual en 1
    const recordsPerPage = 10; // Define el número de registros a mostrar por página
    let booksData        = []; // Array que almacenará todos los libros obtenidos del servidor
    let filteredBooksData= []; // Array que almacenará los libros filtrados (por búsqueda u ordenamiento)
    let isEditMode       = false; // Bandera para determinar si se está en modo de edición (true) o de creación (false)

    // 2. Abrir Modal "Agregar Libro"
    if (addBookButton) { // Verifica que el botón para agregar libro exista
        addBookButton.addEventListener("click", () => { // Agrega un evento de clic al botón
            isEditMode = false; // Se asegura que se esté en modo agregar (no edición)
            document.getElementById("modalTitle").textContent = "Agregar Libro"; // Cambia el título del modal a "Agregar Libro"
            if (form) form.reset(); // Resetea el formulario si existe
            document.getElementById("bookId").value = ''; // Limpia el campo oculto que contiene el id del libro

            // Generar fecha/hora actual usando función nativa
            const fechaActual = getCurrentDateTime('America/Mexico_City'); // Obtiene la fecha y hora formateada según la zona horaria especificada
            document.getElementById("añoPublicacion").value = getCurrentDateTimeDB('America/Mexico_City'); // Asigna la fecha/hora en formato BD al campo correspondiente

            bookModal.style.display = "block"; // Muestra el modal para agregar el libro
        });
    }

    // 3. Cerrar Modal principal
    if (closeModal) { // Verifica que el elemento de cerrar modal exista
        closeModal.addEventListener("click", () => { // Agrega un evento de clic para cerrar el modal principal
            bookModal.style.display = "none"; // Oculta el modal
            if (form) form.reset(); // Resetea el formulario para limpiar cualquier dato ingresado
        });
    }

    // 4. Cerrar Modal "Ver Libro"
    if (closeViewModal) { // Verifica que el botón para cerrar el modal de ver libro exista
        closeViewModal.addEventListener("click", () => { // Agrega un evento de clic para cerrar este modal
            document.getElementById("viewBookModal").style.display = "none"; // Oculta el modal de ver detalles del libro
        });
    }

    // 5. Evitar cierre modal al hacer click fuera
    window.addEventListener('click', function(event) { // Agrega un evento de clic a nivel de ventana
        if (event.target === bookModal) { // Si el clic se da sobre el modal (fuera de su contenido)
            event.stopPropagation(); // Evita que el clic cierre el modal
        }
    });

    // 6. Validaciones de texto en inputs
    function validateTextInput(event) { // Función para validar el contenido ingresado en ciertos inputs
        const input = event.target; // Obtiene el input que disparó el evento
        const id = input.id; // Obtiene el id del input para identificarlo
    
        // Para los inputs de título, autor, categoría y grado se permite solo una lista específica de caracteres
        if (id === "titulo" || id === "autor" || id === "categoria" || id === "grado") {
            input.value = input.value.replace(/[^a-zA-Z0-9.,()\sáéíóúÁÉÍÓÚñÑ]/g, ''); // Reemplaza caracteres no permitidos por una cadena vacía
        } else if (id === "descripcion") { // Para la descripción se permite además signos de interrogación y exclamación
            input.value = input.value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ.,!?¡¿\s]/g, ''); // Realiza el reemplazo para la descripción
        }
    }    

    const tituloInput      = document.getElementById("titulo"); // Obtiene el input para el título del libro
    const autorInput       = document.getElementById("autor"); // Obtiene el input para el autor
    const categoriaInput   = document.getElementById("categoria"); // Obtiene el input para la categoría
    const gradoInput       = document.getElementById("grado"); // Obtiene el input para el grado
    const descripcionInput = document.getElementById("descripcion"); // Obtiene el input para la descripción
    if (tituloInput)      tituloInput.addEventListener("input", validateTextInput); // Asocia la función de validación al input de título
    if (autorInput)       autorInput.addEventListener("input", validateTextInput); // Asocia la validación al input de autor
    if (categoriaInput)   categoriaInput.addEventListener("input", validateTextInput); // Asocia la validación al input de categoría
    if (gradoInput)       gradoInput.addEventListener("input", validateTextInput); // Asocia la validación al input de grado
    if (descripcionInput) descripcionInput.addEventListener("input", validateTextInput); // Asocia la validación al input de descripción

    // 7. Funciones para checar URL y convertir enlaces de Drive
    function isValidURL(url) { // Función que valida si una cadena es una URL con formato correcto
        const pattern = new RegExp('^(https?:\\/\\/)?'+ // Define el patrón regex para el protocolo (opcional)
            '((([a-zA-Z0-9\\-]+\\.)+[a-zA-Z]{2,})|'+ // Define el patrón para un dominio (ej.: ejemplo.com)
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // Alternativamente, permite una dirección IP
            '(\\:\\d+)?(\\/[-a-zA-Z0-9%_.~+]*)*'+ // Permite un puerto opcional y rutas
            '(\\?[;&a-zA-Z0-9%_.~+=-]*)?'+ // Permite parámetros de consulta opcionales
            '(\\#[-a-zA-Z0-9_]*)?$','i'); // Permite un fragmento de URL opcional, ignora mayúsculas/minúsculas
        return !!pattern.test(url); // Retorna true si la URL coincide con el patrón; de lo contrario, false
    }
    function generateDirectLink(driveUrl) { // Función que convierte un enlace de Google Drive a un enlace directo de visualización
        const fileIdMatch = driveUrl.match(/[-\w]{25,}/); // Busca el ID del archivo en la URL usando una expresión regular
        if (fileIdMatch) { // Si se encuentra un ID
            const fileId = fileIdMatch[0]; // Asigna el primer resultado (el ID del archivo)
            return `https://drive.google.com/uc?export=view&id=${fileId}`; // Retorna el enlace directo utilizando el ID extraído
        } else {
            return driveUrl; // Si no se encuentra un ID, retorna la URL original sin modificar
        }
    }

    // 8. Submit del form (crear/actualizar libro)
    if (form) { // Verifica que el formulario exista
        form.addEventListener("submit", function(event) { // Agrega un evento de envío al formulario
            event.preventDefault(); // Previene que el formulario se envíe de manera tradicional (evita recargar la página)

            // Se recogen los valores de los inputs y se eliminan espacios en blanco al inicio y final
            const tituloVal       = tituloInput.value.trim(); // Obtiene y limpia el valor del título
            const autorVal        = autorInput.value.trim(); // Obtiene y limpia el valor del autor
            const categoriaVal    = categoriaInput.value.trim(); // Obtiene y limpia el valor de la categoría
            const gradoVal        = gradoInput.value.trim(); // Obtiene y limpia el valor del grado
            const descripcionVal  = descripcionInput.value.trim(); // Obtiene y limpia la descripción
            const urlDescargaInput= document.getElementById("urlDescarga"); // Obtiene el input para la URL de descarga
            const imagenLibroInput= document.getElementById("imagen_libro"); // Obtiene el input para la URL de la imagen del libro
            let urlDescarga       = urlDescargaInput.value.trim(); // Obtiene y limpia la URL de descarga
            let imagenLibro       = imagenLibroInput.value.trim(); // Obtiene y limpia la URL de la imagen

            // Se valida que todos los campos obligatorios estén llenos
            if (!tituloVal || !autorVal || !categoriaVal || !gradoVal || !descripcionVal) {
                Swal.fire('Error', 'Todos los campos deben ser llenados correctamente.', 'error'); // Muestra un mensaje de error si falta algún dato
                return; // Termina la ejecución de la función
            }
            // Se valida que la URL de descarga sea válida
            if (!urlDescarga || !isValidURL(urlDescarga)) {
                Swal.fire('Error', 'Debe proporcionar una URL de descarga válida.', 'error'); // Muestra error si la URL de descarga no es válida
                return; // Termina la ejecución
            }
            // Convierte la URL de descarga a un enlace directo si es un enlace de Google Drive
            urlDescarga = generateDirectLink(urlDescarga);
            urlDescargaInput.value = urlDescarga; // Actualiza el input con la URL convertida

            // Se valida que la URL de la imagen del libro sea válida
            if (!imagenLibro || !isValidURL(imagenLibro)) {
                Swal.fire('Error', 'Debe proporcionar una URL válida para la imagen del libro.', 'error'); // Muestra error si la URL de la imagen no es válida
                return; // Termina la ejecución
            }

            // Se verifica que no exista otro libro en memoria con el mismo título o URL de descarga (evitando duplicados)
            const bookIdField = document.getElementById("bookId"); // Obtiene el campo oculto que almacena el id del libro (si existe)
            const bookId = bookIdField.value; // Obtiene el valor actual del id
            const isDuplicateFront = booksData.some(book => 
                (book.titulo === tituloVal || book.urlDescarga === urlDescarga) && book.id != bookId
            ); // Verifica si ya existe algún libro con el mismo título o URL (exceptuando el actual en edición)
            if (isDuplicateFront) {
                Swal.fire('Error', 'El título o la URL de descarga ya existen (en memoria).', 'error'); // Muestra error si se detecta duplicado
                return; // Termina la ejecución
            }

            // Se crea un objeto FormData con los datos del formulario para enviarlos al servidor
            const formData = new FormData(form);
            let action = 'create'; // Se asume la acción de creación por defecto
            if (bookId) { // Si existe un id, se trata de una actualización de un libro existente
                formData.append('id', bookId); // Añade el id al FormData
                action = 'update'; // Cambia la acción a "update" (actualización)
            }

            // Se envía la solicitud al servidor usando fetch, pasando la acción (create o update)
            fetch(`crud_libros.php?action=${action}`, {
                method: 'POST', // Utiliza el método POST para enviar los datos
                body: formData // Envía los datos del formulario
            })
            .then(response => { // Procesa la respuesta del servidor
                if (!response.ok) { // Si la respuesta no es satisfactoria
                    throw new Error('Error en la respuesta del servidor'); // Lanza un error para ser capturado en el catch
                }
                return response.json(); // Convierte la respuesta en JSON
            })
            .then(data => { // Procesa el objeto JSON obtenido
                if (data.success) { // Si la respuesta indica éxito
                    Swal.fire('Éxito', data.message, 'success'); // Muestra una alerta de éxito con el mensaje del servidor
                    loadBooks(false); // Recarga la lista de libros sin reiniciar la paginación
                    form.reset(); // Resetea el formulario para limpiar los datos ingresados
                    bookModal.style.display = "none"; // Oculta el modal de agregar/editar libro
                } else {
                    Swal.fire('Error', data.message, 'error'); // Muestra alerta de error si el servidor indica fallo
                }
            })
            .catch(error => { // Captura cualquier error ocurrido durante la solicitud
                console.error('Error:', error); // Imprime el error en la consola
                Swal.fire('Error', 'Ocurrió un error al procesar la solicitud', 'error'); // Muestra alerta de error genérica
            });
        });
    }

    // 9. Renderizar tabla con paginación (se invoca en loadBooks)
    function renderTable() { // Función para renderizar la tabla que muestra los libros
        if (!booksTable) return; // Si la tabla no existe, finaliza la función
        const start = (currentPage - 1) * recordsPerPage; // Calcula el índice de inicio para la página actual
        const end = start + recordsPerPage; // Calcula el índice final para la página actual
        const paginatedBooks = filteredBooksData.slice(start, end); // Obtiene los libros que se mostrarán en la página actual

        booksTable.innerHTML = ''; // Limpia el contenido actual de la tabla

        // Se definen los encabezados de la tabla, incluyendo un checkbox para seleccionar todos
        const headers = [
            '<input type="checkbox" id="selectAll">',
            '#',
            'Título',
            'Autor',
            'Categoría',
            'Grado',
            'Fecha de Publicación',
            'Disponibilidad',
            'Imagen',
            'Acciones'
        ];
        const thead = document.createElement("thead"); // Crea el elemento <thead> para los encabezados
        const headerRow = document.createElement("tr"); // Crea una fila para los encabezados
        headers.forEach(header => { // Itera sobre cada encabezado definido en el array
            const th = document.createElement("th"); // Crea una celda de encabezado (<th>)
            th.innerHTML = header; // Asigna el contenido HTML o texto al encabezado
            headerRow.appendChild(th); // Añade la celda a la fila de encabezados
        });
        thead.appendChild(headerRow); // Añade la fila completa al <thead>
        booksTable.appendChild(thead); // Inserta el <thead> en la tabla

        const tbody = document.createElement("tbody"); // Crea el elemento <tbody> para contener las filas de datos

        if (paginatedBooks.length === 0) { // Si no hay libros para mostrar en la página actual
            const row = document.createElement("tr"); // Crea una fila para mostrar el mensaje
            const cell = document.createElement("td"); // Crea una celda para el mensaje
            cell.colSpan = headers.length; // Configura la celda para que ocupe todas las columnas
            cell.textContent = "No se encontraron registros."; // Establece el mensaje que se mostrará
            row.appendChild(cell); // Añade la celda a la fila
            tbody.appendChild(row); // Añade la fila al <tbody>
        } else { // Si hay libros para mostrar
            paginatedBooks.forEach((book, index) => { // Itera sobre cada libro de la página actual
                const row = document.createElement("tr"); // Crea una nueva fila para el libro

                const cellCheckbox = document.createElement("td"); // Crea una celda para el checkbox de selección
                cellCheckbox.innerHTML = `<input type="checkbox" class="select-book" data-id="${book.id}">`; // Inserta el checkbox y asigna el id del libro en un atributo data
                row.appendChild(cellCheckbox); // Añade la celda a la fila

                const cellIndex = document.createElement("td"); // Crea una celda para el índice (número de registro)
                cellIndex.textContent = start + index + 1; // Calcula y asigna el número de registro basado en la paginación
                row.appendChild(cellIndex); // Añade la celda a la fila

                const cellTitulo = document.createElement("td"); // Crea una celda para el título
                cellTitulo.textContent = book.titulo; // Asigna el título del libro a la celda
                row.appendChild(cellTitulo); // Añade la celda a la fila

                const cellAutor = document.createElement("td"); // Crea una celda para el autor
                cellAutor.textContent = book.autor; // Asigna el autor del libro
                row.appendChild(cellAutor); // Añade la celda a la fila

                const cellCategoria = document.createElement("td"); // Crea una celda para la categoría
                cellCategoria.textContent = book.categoria; // Asigna la categoría del libro
                row.appendChild(cellCategoria); // Añade la celda a la fila

                const cellGrado = document.createElement("td"); // Crea una celda para el grado
                cellGrado.textContent = book.grado; // Asigna el grado del libro
                row.appendChild(cellGrado); // Añade la celda a la fila

                const cellFecha = document.createElement("td"); // Crea una celda para la fecha de publicación
                cellFecha.textContent = book.añoPublicacion; // Asigna la fecha de publicación
                row.appendChild(cellFecha); // Añade la celda a la fila

                const cellDisp = document.createElement("td"); // Crea una celda para la disponibilidad
                cellDisp.textContent = book.disponibilidad; // Asigna la disponibilidad del libro
                row.appendChild(cellDisp); // Añade la celda a la fila

                const cellImagen = document.createElement("td"); // Crea una celda para la imagen del libro
                const img = document.createElement("img"); // Crea un elemento <img>
                img.src = book.imagen_libro; // Asigna la URL de la imagen
                img.alt = book.titulo; // Establece un texto alternativo utilizando el título del libro
                img.style.width = "50px"; // Define el ancho de la imagen a 50 píxeles
                img.style.height = "auto"; // Mantiene la relación de aspecto de la imagen
                cellImagen.appendChild(img); // Inserta la imagen en la celda
                row.appendChild(cellImagen); // Añade la celda a la fila

                const actionsCell = document.createElement("td"); // Crea una celda para las acciones (ver, editar, eliminar)
                actionsCell.innerHTML = `
                  <div class="action-wrapper">
                    <button class="btn btn-view grow" data-id="${book.id}">
                      <i class="fas fa-eye"></i> Ver
                    </button>
                  </div>
                `; // Inserta el botón para ver detalles, asignando el id del libro en data-id
                row.appendChild(actionsCell); // Añade la celda de acciones a la fila
                tbody.appendChild(row); // Añade la fila completa al <tbody>
            });
        }
        booksTable.appendChild(tbody); // Inserta el <tbody> en la tabla

        // Actualizamos el total de registros mostrado en el contador
        if (recordCount) {
            recordCount.textContent = `Total de registros: ${filteredBooksData.length}`; // Muestra el número total de registros filtrados
        }

        // Generamos la paginación (se invoca la función que crea los botones de paginación)
        updatePagination();

        // Manejar "selectAll" en la tabla (selecciona o deselecciona todos los checkboxes)
        const selectAllCheckbox = document.getElementById("selectAll"); // Obtiene el checkbox "selectAll"
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener("change", (event) => { // Agrega evento de cambio al checkbox
                const isChecked = event.target.checked; // Determina si el checkbox fue marcado
                document.querySelectorAll(".select-book").forEach(checkbox => { // Itera sobre cada checkbox de los libros
                    checkbox.checked = isChecked; // Asigna el mismo estado (marcado o desmarcado)
                });
            });
        }

        // Manejar el botón "Editar" (para edición masiva, se requiere seleccionar un único registro)
        const editBookButton = document.getElementById("editBookButton"); // Obtiene el botón para editar libro(s)
        if (editBookButton) {
            editBookButton.addEventListener("click", () => { // Agrega evento de clic al botón
                const selectedCheckboxes = document.querySelectorAll('#booksTable tbody .select-book:checked'); // Obtiene todos los checkboxes seleccionados en la tabla
                if (selectedCheckboxes.length !== 1) { // Verifica que se haya seleccionado exactamente un registro
                    Swal.fire("Información", "Por favor, seleccione un único registro para editar.", "info"); // Muestra mensaje informativo si no se cumple la condición
                } else {
                    const id = selectedCheckboxes[0].dataset.id; // Obtiene el id del único registro seleccionado
                    editBook(id); // Llama a la función de edición pasando el id del libro
                }
            });
        }

        // Botones "Ver", "Editar", "Eliminar" directos en la tabla
        document.querySelectorAll('.btn-view').forEach(button => { // Selecciona todos los botones con la clase btn-view
            button.addEventListener('click', (event) => { // Agrega evento de clic a cada botón
                const id = event.currentTarget.getAttribute('data-id'); // Obtiene el id del libro del atributo data-id
                viewBook(id); // Llama a la función para ver los detalles del libro
            });
        });
    }

    // 10. NUEVA paginación estilo "1 2 3 4 5 ... 20"
    function updatePagination() { // Función para actualizar los controles de paginación
        const paginationContainer = document.querySelector('.pagination'); // Obtiene el contenedor donde se mostrarán los botones de paginación
        if (!paginationContainer) return; // Si no existe el contenedor, finaliza la función
        paginationContainer.innerHTML = ''; // Limpia el contenido previo del contenedor

        const totalRecords = filteredBooksData.length; // Calcula el total de registros a partir de los libros filtrados
        const totalPages = Math.ceil(totalRecords / recordsPerPage); // Calcula el número total de páginas

        // Botón "«" (anterior)
        const prevLi = document.createElement('li'); // Crea un elemento <li> para el botón anterior
        const prevA = document.createElement('a'); // Crea un enlace (<a>) para el botón anterior
        prevA.innerHTML = '<i class="fas fa-chevron-left"></i>'; // Inserta un icono de flecha izquierda en el enlace
        if (currentPage === 1) { // Si la página actual es la primera
            prevA.classList.add('disabled'); // Añade la clase 'disabled' para indicar que no se puede usar
            prevA.style.pointerEvents = 'none'; // Deshabilita los eventos de clic
        } else {
            prevA.addEventListener('click', () => { // Si no es la primera página, añade un evento de clic para retroceder
                currentPage--; // Decrementa el número de la página actual
                renderTable(); // Vuelve a renderizar la tabla con la nueva página
            });
        }
        prevLi.appendChild(prevA); // Añade el enlace al elemento <li>
        paginationContainer.appendChild(prevLi); // Inserta el botón anterior en el contenedor de paginación

        if (totalPages <= 5) { // Si el número total de páginas es 5 o menos
            // Mostrar todas las páginas
            for (let i = 1; i <= totalPages; i++) { // Itera desde la página 1 hasta la última
                const li = document.createElement('li'); // Crea un elemento <li> para cada número de página
                const a = document.createElement('a'); // Crea un enlace para la página
                a.textContent = i; // Asigna el número de la página como texto
                if (i === currentPage) { // Si es la página actual
                    a.classList.add('active'); // Añade la clase 'active'
                } else {
                    a.addEventListener('click', () => { // Si no es la página actual, añade evento para cambiar de página
                        currentPage = i; // Actualiza el número de la página actual
                        renderTable(); // Renderiza la tabla para la nueva página
                    });
                }
                li.appendChild(a); // Inserta el enlace en el <li>
                paginationContainer.appendChild(li); // Añade el <li> al contenedor
            }
        } else { // Si hay más de 5 páginas
            // Se muestran las primeras 5 páginas
            for (let i = 1; i <= 5; i++) { // Itera desde la página 1 hasta la 5
                const li = document.createElement('li'); // Crea un elemento <li> para cada página
                const a = document.createElement('a'); // Crea un enlace para la página
                a.textContent = i; // Asigna el número de la página como texto
                if (i === currentPage) { // Si es la página actual
                    a.classList.add('active'); // Marca el enlace como activo
                } else {
                    a.addEventListener('click', () => { // Añade evento de clic para cambiar de página
                        currentPage = i; // Actualiza el número de la página actual
                        renderTable(); // Renderiza la tabla para la nueva página
                    });
                }
                li.appendChild(a); // Añade el enlace al <li>
                paginationContainer.appendChild(li); // Inserta el <li> en el contenedor
            }

            // Agregamos el "..." para indicar páginas intermedias no mostradas
            const ellipsisLi = document.createElement('li'); // Crea un <li> para el elipsis
            ellipsisLi.textContent = '...'; // Asigna el texto "..."
            paginationContainer.appendChild(ellipsisLi); // Inserta el elipsis en el contenedor

            // Agregamos la última página
            const lastLi = document.createElement('li'); // Crea un <li> para la última página
            const lastA = document.createElement('a'); // Crea un enlace para la última página
            lastA.textContent = totalPages; // Asigna el número total de páginas como texto
            if (currentPage === totalPages) { // Si la página actual es la última
                lastA.classList.add('active'); // Marca el enlace como activo
            } else {
                lastA.addEventListener('click', () => { // Si no, añade evento para cambiar a la última página
                    currentPage = totalPages; // Actualiza la página actual al total de páginas
                    renderTable(); // Renderiza la tabla para la nueva página
                });
            }
            lastLi.appendChild(lastA); // Inserta el enlace en el <li>
            paginationContainer.appendChild(lastLi); // Añade el <li> al contenedor
        }

        // Botón "»" (siguiente)
        const nextLi = document.createElement('li'); // Crea un <li> para el botón siguiente
        const nextA = document.createElement('a'); // Crea un enlace para el botón siguiente
        nextA.innerHTML = '<i class="fas fa-chevron-right"></i>'; // Inserta un icono de flecha derecha en el enlace
        if (currentPage === totalPages || totalPages === 0) { // Si estamos en la última página o no hay páginas
            nextA.classList.add('disabled'); // Añade la clase 'disabled' para deshabilitar el botón
            nextA.style.pointerEvents = 'none'; // Desactiva los eventos de clic
        } else {
            nextA.addEventListener('click', () => { // Si hay página siguiente, añade evento para avanzar
                currentPage++; // Incrementa el número de la página actual
                renderTable(); // Renderiza la tabla para la nueva página
            });
        }
        nextLi.appendChild(nextA); // Inserta el enlace en el <li>
        paginationContainer.appendChild(nextLi); // Añade el botón siguiente al contenedor de paginación
    }

    // 11. Ver Detalle
    window.viewBook = function(id) { // Función global para ver los detalles de un libro, recibe el id del libro
        fetch(`crud_libros.php?action=read&id=${id}`) // Realiza una petición al servidor para obtener los datos del libro con el id especificado
        .then(response => response.json()) // Convierte la respuesta en formato JSON
        .then(data => { // Procesa el objeto JSON obtenido
            if (data.success) { // Si la respuesta indica éxito
                const book = data.book; // Extrae el objeto 'book' de la respuesta
                const modalTitle = document.getElementById("viewBookTitle"); // Obtiene el elemento que mostrará el título en el modal
                modalTitle.textContent = book.titulo; // Asigna el título del libro al elemento

                const detailsList = document.getElementById("viewBookDetails"); // Obtiene el elemento donde se mostrarán los detalles del libro
                detailsList.innerHTML = `
                    <li><i class="fas fa-book"></i><strong>Título:</strong> ${book.titulo}</li>
                    <li><i class="fas fa-user"></i><strong>Autor:</strong> ${book.autor}</li>
                    <li><i class="fas fa-list-ul"></i><strong>Categoría:</strong> ${book.categoria}</li>
                    <li><i class="fa-solid fa-graduation-cap"></i><strong>Grado:</strong> ${book.grado}</li>
                    <li><i class="fas fa-calendar"></i><strong>Fecha de Publicación:</strong> ${book.añoPublicacion}</li>
                    <li><i class="fas fa-file-alt"></i><strong>Descripción:</strong><br>${book.descripcion}</li>
                    <li><i class="fas fa-check"></i><strong>Disponibilidad:</strong> ${book.disponibilidad}</li>
                    <li><i class="fas fa-link"></i><strong>URL Descarga:</strong> 
                        <a href="${book.urlDescarga}" target="_blank" rel="noopener noreferrer">Descargar aquí</a>
                    </li>
                    <li><i class="fas fa-image"></i><strong>Imagen:</strong><br>
                        <img src="${book.imagen_libro}" alt="Imagen del Libro" style="max-width:150px; margin-top:5px;">
                    </li>
                `; // Inserta en el modal una lista con todos los detalles del libro, utilizando la información obtenida

                document.getElementById("viewBookModal").style.display = "block"; // Muestra el modal que contiene los detalles del libro
            } else { // Si la respuesta indica error
                Swal.fire('Error', data.message, 'error'); // Muestra una alerta de error con el mensaje recibido
            }
        })
        .catch(error => { // Captura cualquier error en la petición
            console.error('Error:', error); // Imprime el error en la consola
            Swal.fire('Error', 'Ocurrió un error al cargar los detalles del libro', 'error'); // Muestra una alerta de error genérica
        });
    };

    // 12. Editar
    window.editBook = function(id) { // Función global para editar un libro, recibe el id del libro a editar
        isEditMode = true; // Activa el modo de edición
        document.getElementById("modalTitle").textContent = "Editar Libro"; // Cambia el título del modal a "Editar Libro"
        fetch(`crud_libros.php?action=read&id=${id}`) // Realiza una petición al servidor para obtener los datos del libro
        .then(response => response.json()) // Convierte la respuesta a formato JSON
        .then(data => { // Procesa el objeto JSON obtenido
            if (data.success) { // Si la respuesta es exitosa
                const book = data.book; // Extrae la información del libro
                document.getElementById("bookId").value         = book.id; // Asigna el id del libro al campo oculto
                document.getElementById("titulo").value         = book.titulo; // Carga el título en el input correspondiente
                document.getElementById("autor").value          = book.autor; // Carga el autor en el input correspondiente
                document.getElementById("categoria").value      = book.categoria; // Carga la categoría en el input correspondiente
                document.getElementById("grado").value          = book.grado.trim().toLowerCase(); // Carga el grado en el input, procesado a minúsculas y sin espacios extra
                document.getElementById("añoPublicacion").value = getCurrentDateTimeDB('America/Mexico_City'); // Actualiza la fecha de publicación con la fecha/hora actual en formato BD
                document.getElementById("descripcion").value    = book.descripcion; // Carga la descripción del libro
                document.getElementById("disponibilidad").value = book.disponibilidad; // Carga la disponibilidad del libro
                document.getElementById("urlDescarga").value    = book.urlDescarga; // Carga la URL de descarga del libro
                document.getElementById("imagen_libro").value   = book.imagen_libro; // Carga la URL de la imagen del libro
                bookModal.style.display = "block"; // Muestra el modal con los datos cargados para edición
            } else { // Si la respuesta no es exitosa
                Swal.fire('Error', data.message, 'error'); // Muestra alerta de error con el mensaje recibido
            }
        })
        .catch(error => { // Captura errores en la petición
            console.error('Error:', error); // Imprime el error en la consola
            Swal.fire('Error', 'Ocurrió un error al cargar el libro', 'error'); // Muestra alerta de error genérica
        });
    };

    // 13. Eliminar
    window.deleteBook = function(id) { // Función global para eliminar un libro, recibe el id del libro a eliminar
        Swal.fire({ // Muestra una alerta de confirmación antes de eliminar
            title: '¿Estás seguro?', // Título de la alerta
            text: "¡No podrás revertir esto!", // Mensaje de advertencia
            icon: 'warning', // Icono de advertencia
            showCancelButton: true, // Muestra el botón para cancelar la acción
            confirmButtonColor: '#d33', // Define el color del botón de confirmación
            cancelButtonColor: '#3085d6', // Define el color del botón de cancelación
            cancelButtonText: 'Cancelar', // Texto del botón de cancelar
            confirmButtonText: 'Sí, eliminarlo!' // Texto del botón de confirmar eliminación
        }).then((result) => { // Procesa la respuesta del usuario
            if (result.isConfirmed) { // Si el usuario confirma la eliminación
                fetch(`crud_libros.php?action=delete&id=${id}`) // Realiza una petición al servidor para eliminar el libro con el id especificado
                .then(response => response.json()) // Convierte la respuesta a JSON
                .then(data => { // Procesa el objeto JSON obtenido
                    if (data.success) { // Si la eliminación fue exitosa
                        Swal.fire('Eliminado!', 'El libro ha sido eliminado.', 'success'); // Muestra alerta de éxito
                        loadBooks(false); // Recarga la lista de libros
                        // Desmarcar checkboxes
                        const selectAllCheckbox = document.getElementById("selectAll"); // Obtiene el checkbox "selectAll"
                        if (selectAllCheckbox) {
                            selectAllCheckbox.checked = false; // Desmarca el checkbox
                        }
                        const checkboxes = document.querySelectorAll('#booksTable input[type="checkbox"]'); // Obtiene todos los checkboxes de la tabla
                        checkboxes.forEach(checkbox => { // Itera sobre cada checkbox
                            checkbox.checked = false; // Los desmarca
                        });
                    } else { // Si la respuesta indica error
                        Swal.fire('Error', data.message, 'error'); // Muestra alerta de error con el mensaje del servidor
                    }
                })
                .catch(error => { // Captura cualquier error en la petición
                    console.error('Error:', error); // Imprime el error en la consola
                    Swal.fire('Error', 'Ocurrió un error al eliminar el libro', 'error'); // Muestra alerta de error genérica
                });
            }
        });
    };

    // 14. Eliminar Masivo
    if (deleteMassiveButton) { // Verifica que el botón para eliminar registros masivos exista
        deleteMassiveButton.addEventListener("click", () => { // Agrega un evento de clic al botón
            // Se obtienen los IDs de los libros seleccionados para eliminar
            const selectedIds = Array.from(document.querySelectorAll('#booksTable tbody input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.dataset.id); // Crea un array con los ids de los libros seleccionados
            if (selectedIds.length > 0) { // Si hay al menos un libro seleccionado
                Swal.fire({ // Muestra una alerta de confirmación para eliminar masivamente
                    title: '¿Estás seguro?', // Título de la alerta
                    text: `Eliminar ${selectedIds.length} libro(s) seleccionado(s)`, // Mensaje indicando cuántos libros serán eliminados
                    icon: 'warning', // Icono de advertencia
                    showCancelButton: true, // Muestra opción para cancelar la acción
                    confirmButtonColor: '#d33', // Color del botón de confirmación
                    cancelButtonColor: '#3085d6', // Color del botón de cancelación
                    cancelButtonText: 'Cancelar', // Texto del botón cancelar
                    confirmButtonText: 'Sí, eliminar!' // Texto del botón de confirmar eliminación
                }).then((result) => { // Procesa la respuesta del usuario
                    if (result.isConfirmed) { // Si el usuario confirma la eliminación masiva
                        Promise.all(selectedIds.map(id =>  // Ejecuta una petición de eliminación para cada id seleccionado
                            fetch(`crud_libros.php?action=delete&id=${id}`)
                            .then(response => response.json())
                        ))
                        .then(results => { // Procesa el array de respuestas
                            const successCount = results.filter(r => r.success).length; // Cuenta cuántas eliminaciones fueron exitosas
                            Swal.fire('Eliminados!', `${successCount} libros han sido eliminados.`, 'success'); // Muestra una alerta con el número de libros eliminados
                            loadBooks(false); // Recarga la lista de libros
                            const selectAllCheckbox = document.getElementById("selectAll"); // Obtiene el checkbox "selectAll"
                            if (selectAllCheckbox) {
                                selectAllCheckbox.checked = false; // Desmarca el checkbox
                            }
                            const checkboxes = document.querySelectorAll('#booksTable input[type="checkbox"]'); // Obtiene todos los checkboxes de la tabla
                            checkboxes.forEach(checkbox => { // Itera sobre cada uno
                                checkbox.checked = false; // Los desmarca
                            });
                        })
                        .catch(error => { // Captura errores en la petición masiva
                            console.error('Error:', error); // Imprime el error en la consola
                            Swal.fire('Error', 'Ocurrió un error al eliminar los libros', 'error'); // Muestra una alerta de error
                        });
                    }
                });
            } else { // Si no hay libros seleccionados
                Swal.fire('Información', 'Seleccione al menos un registro para realizar esta acción', 'info'); // Muestra un mensaje informativo
            }
        });
    }

    // 15. Cargar libros (read)
    function loadBooks(resetPage = true) { // Función para cargar la lista de libros desde el servidor; el parámetro resetPage indica si se reinicia la paginación
        fetch('crud_libros.php?action=read') // Realiza una petición al servidor para obtener los libros
        .then(response => response.text()) // Obtiene la respuesta en formato de texto
        .then(text => { // Procesa el texto recibido
            try {
                const data = JSON.parse(text); // Intenta convertir el texto en un objeto JSON
                if (data.success) { // Si la respuesta es exitosa
                    booksData = data.books; // Asigna el array de libros obtenido a booksData
                    filteredBooksData = [...booksData]; // Clona el array de libros para aplicar filtrados sin modificar el original
                    const sortBy = localStorage.getItem('sortBy') || 'recent'; // Obtiene el criterio de ordenamiento almacenado o usa "recent" por defecto
                    applySort(sortBy); // Aplica el ordenamiento a los libros filtrados
                    if (resetPage) currentPage = 1; // Si se solicita reiniciar la paginación, se establece la página actual a 1
                    renderTable(); // Llama a la función para renderizar la tabla con los libros obtenidos
                } else {
                    Swal.fire('Error', data.message, 'error'); // Si la respuesta indica fallo, muestra un mensaje de error
                }
            } catch (error) { // Captura errores al convertir el texto a JSON
                console.error('Error parsing JSON:', error, text); // Imprime el error y el texto recibido en la consola
                Swal.fire('Error', 'Ocurrió un error al procesar la respuesta del servidor', 'error'); // Muestra una alerta de error
            }
        })
        .catch(error => { // Captura errores en la petición fetch
            console.error('Error:', error); // Imprime el error en la consola
            Swal.fire('Error', 'Ocurrió un error al cargar los libros', 'error'); // Muestra una alerta de error
        });
    }

    // 16. Exportar a Excel
    function exportToExcel() { // Función para exportar la lista de libros a un archivo Excel
        const exportData = filteredBooksData.map(book => ({ // Mapea cada libro a un objeto con las propiedades a exportar
            "Titulo": book.titulo || "", // Título del libro (o cadena vacía si no existe)
            "Autor": book.autor || "", // Autor del libro
            "Categoria": book.categoria || "", // Categoría del libro
            "Grado": book.grado|| "", // Grado del libro
            "Descripcion": book.descripcion || "", // Descripción del libro
            "Disponibilidad": book.disponibilidad || "", // Disponibilidad del libro
            "URL de descarga": book.urlDescarga || "", // URL de descarga del libro
            "Imagen del Libro (URL)": book.imagen_libro || "" // URL de la imagen del libro
        }));

        const wb = XLSX.utils.book_new(); // Crea un nuevo libro de Excel
        const ws = XLSX.utils.json_to_sheet(exportData); // Convierte el array de objetos a una hoja de Excel
        XLSX.utils.book_append_sheet(wb, ws, "Libros"); // Añade la hoja al libro con el nombre "Libros"
        XLSX.writeFile(wb, "libros.xlsx"); // Genera y descarga el archivo Excel con el nombre "libros.xlsx"
    }

    // 17. Exportar / Imprimir PDF
    function exportToPDF(print = false) { // Función para exportar o imprimir la lista de libros en formato PDF; el parámetro "print" determina la acción
        if (!window.pdfMake) { // Verifica si la librería pdfMake está disponible
            Swal.fire('Error', 'No se pudo cargar pdfMake.', 'error'); // Muestra un mensaje de error si pdfMake no está cargado
            return; // Termina la función
        }
        const totalRegistros = filteredBooksData.length; // Calcula el número total de registros (libros) a exportar
        const currentDateTime = getCurrentDateTime('America/Mexico_City'); // Obtiene la fecha y hora actual en el formato definido

        const docDefinition = { // Define la estructura del documento PDF
            header: { // Define el encabezado del PDF
                columns: [ // Usa un arreglo de columnas para el encabezado
                    { text: 'Primaria Manuel Del Mazo Villasante - Libros', alignment: 'left', margin: [10, 10], fontSize: 12 },
                    { text: `Fecha y hora: ${currentDateTime}`, alignment: 'center', margin: [10, 10], fontSize: 10 },
                    { text: `Total de registros: ${totalRegistros}`, alignment: 'right', margin: [10, 10], fontSize: 12 }
                ]
            },
            footer: function(currentPage, pageCount) { // Función que define el pie de página, mostrando la página actual y el total de páginas
                return { text: `Página ${currentPage} de ${pageCount}`, alignment: 'center', margin: [0, 10] };
            },
            content: [ // Define el contenido principal del PDF
                {
                    table: { // Inserta una tabla en el PDF
                        headerRows: 1, // Indica que la primera fila es el encabezado de la tabla
                        widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'], // Define anchos automáticos para las columnas
                        body: [ // Define el cuerpo de la tabla
                            [ // Primera fila (encabezado) con celdas en negrita y centradas
                                { text: '#', bold: true, alignment: 'center' },
                                { text: 'Título', bold: true, alignment: 'center' },
                                { text: 'Autor', bold: true, alignment: 'center' },
                                { text: 'Categoría', bold: true, alignment: 'center' },
                                { text: 'Grado', bold: true, alignment: 'center' },
                                { text: 'Fecha de Publicación', bold: true, alignment: 'center' },
                                { text: 'Disponibilidad', bold: true, alignment: 'center' }
                            ],
                            ...filteredBooksData.map((book, index) => [ // Agrega una fila por cada libro en los datos filtrados
                                { text: index + 1, alignment: 'center' }, // Muestra el número de fila (índice + 1)
                                { text: book.titulo, alignment: 'center' }, // Muestra el título del libro
                                { text: book.autor, alignment: 'center' }, // Muestra el autor del libro
                                { text: book.categoria, alignment: 'center' }, // Muestra la categoría del libro
                                { text: book.grado, alignment: 'center' }, // Muestra el grado del libro
                                { text: book.añoPublicacion, alignment: 'center' }, // Muestra la fecha de publicación
                                { text: book.disponibilidad, alignment: 'center' } // Muestra la disponibilidad del libro
                            ])
                        ]
                    },
                    layout: 'lightHorizontalLines' // Define el diseño de la tabla con líneas horizontales ligeras
                }
            ],
            pageMargins: [40, 60, 40, 60], // Define los márgenes de la página
            pageSize: 'A4', // Establece el tamaño de la página como A4
            pageOrientation: 'landscape' // Establece la orientación de la página como horizontal (landscape)
        };

        if (print) { // Si se ha indicado la opción de imprimir en lugar de descargar
            pdfMake.createPdf(docDefinition).getDataUrl((dataUrl) => { // Crea el PDF y obtiene la URL de datos
                const printWindow = window.open('', '_blank'); // Abre una nueva ventana para la impresión
                printWindow.document.write('<iframe width="100%" height="100%" src="' + dataUrl + '"></iframe>'); // Inserta el PDF en un iframe para poder imprimirlo
            });
        } else { // Si se desea descargar el PDF
            pdfMake.createPdf(docDefinition).download("libros.pdf"); // Descarga el PDF con el nombre "libros.pdf"
        }
    }

    // 18. Importar Excel
    function handleImportExcelChange(event) { // Función para manejar el cambio en el input de archivo Excel
        const file = event.target.files[0]; // Obtiene el primer archivo seleccionado
        if (!file) return; // Si no se ha seleccionado ningún archivo, termina la función

        // Se definen las extensiones permitidas para archivos Excel
        const allowedExtensions = ['.xls', '.xlsx'];
        const lowerFileName = file.name.toLowerCase(); // Convierte el nombre del archivo a minúsculas para compararlo
        if (!allowedExtensions.some(ext => lowerFileName.endsWith(ext))) { // Verifica si el nombre termina con alguna extensión permitida
            Swal.fire('Error', 'El archivo debe ser .xls o .xlsx', 'error'); // Muestra un mensaje de error si la extensión no es válida
            importExcelInput.value = ""; // Reinicia el input para permitir nueva selección
            return; // Termina la función
        }
        // Se verifica el tipo MIME del archivo para confirmar que corresponde a una hoja de cálculo
        if (
            file.type &&
            !file.type.includes('spreadsheet') &&
            !file.type.includes('excel') &&
            !file.type.includes('sheet')
        ) {
            Swal.fire('Error', 'El tipo de archivo no parece ser Excel.', 'error'); // Muestra error si el tipo de archivo no es el esperado
            importExcelInput.value = ""; // Reinicia el input
            return; // Termina la función
        }

        const reader = new FileReader(); // Crea un objeto FileReader para leer el archivo
        reader.onload = function(e) { // Define la función que se ejecutará cuando la lectura se complete
            const data = new Uint8Array(e.target.result); // Convierte el resultado de la lectura a un array de bytes
            const workbook = XLSX.read(data, { type: 'array' }); // Lee el array de bytes y lo interpreta como un libro de Excel
            const sheetName = workbook.SheetNames[0]; // Obtiene el nombre de la primera hoja del libro
            const worksheet = workbook.Sheets[sheetName]; // Obtiene la primera hoja del libro
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Convierte la hoja a un array JSON (cada fila es un array)
            if (jsonData.length <= 1) { // Si el archivo solo contiene la cabecera o está vacío
                Swal.fire('Aviso', 'El archivo Excel no contiene datos.', 'info'); // Muestra un aviso indicando que no hay datos
                return; // Termina la función
            }

            const rowsToImport = []; // Inicializa un array para almacenar las filas válidas a importar
            for (let i = 1; i < jsonData.length; i++) { // Itera sobre cada fila del Excel, omitiendo la primera (cabecera)
                const row = jsonData[i]; // Obtiene la fila actual
                if (!row || row.length < 8) continue; // Si la fila está vacía o tiene menos de 8 columnas, la omite

                // Extrae y limpia cada valor de la fila, convirtiéndolo a cadena y eliminando espacios adicionales
                const titulo         = (row[0] || "").toString().trim();
                const autor          = (row[1] || "").toString().trim();
                const categoria      = (row[2] || "").toString().trim();
                const grado          = (row[3] || "").toString().trim();
                const descripcion    = (row[4] || "").toString().trim();
                const disponibilidad = (row[5] || "").toString().trim();
                const urlDescarga    = (row[6] || "").toString().trim();
                const imagenLibro    = (row[7] || "").toString().trim();

                if (!titulo || !autor || !categoria || !grado || !descripcion || !disponibilidad || !urlDescarga || !imagenLibro) {
                    console.warn(`Fila ${i+1} con datos insuficientes, se omite.`); // Imprime una advertencia en la consola si la fila no tiene todos los datos
                    continue; // Omite esta fila y continúa con la siguiente
                }

                const fechaActual = getCurrentDateTimeDB('America/Mexico_City'); // Obtiene la fecha/hora actual para asignarla a la fila
                rowsToImport.push({
                    titulo,
                    autor,
                    categoria,
                    grado,
                    descripcion,
                    disponibilidad,
                    urlDescarga,
                    imagen_libro: imagenLibro,
                    añoPublicacion: fechaActual
                }); // Agrega la fila procesada al array de filas a importar
            }

            if (rowsToImport.length === 0) { // Si después de procesar no se encontró ninguna fila válida
                Swal.fire('Aviso', 'No se encontraron filas válidas en el Excel.', 'info'); // Muestra un aviso indicando la ausencia de datos válidos
                return; // Termina la función
            }

            // -----------------------------
            // MOSTRAR BARRA DE PROGRESO
            // -----------------------------
            showProgressModal(); // Muestra el modal con la barra de progreso
            let fakeProgress = 0; // Inicializa una variable para simular el progreso
            const intervalId = setInterval(() => { // Crea un intervalo para actualizar la barra de progreso cada 100ms
                if (fakeProgress < 90) { // Mientras el progreso simulado sea menor a 90%
                    fakeProgress++; // Incrementa el progreso
                    updateProgressBar(fakeProgress); // Actualiza la barra de progreso con el nuevo valor
                } else {
                    clearInterval(intervalId); // Cuando alcanza 90%, detiene el intervalo
                }
            }, 100);

            // Envía la data importada al servidor mediante una petición fetch
            fetch('crud_libros.php?action=import', {
                method: 'POST', // Usa el método POST para enviar los datos
                headers: { 'Content-Type': 'application/json' }, // Especifica que el contenido enviado es JSON
                body: JSON.stringify({ booksData: rowsToImport }) // Convierte el array de filas a JSON y lo envía en el cuerpo de la petición
            })
            .then(response => response.text()) // Obtiene la respuesta en formato de texto
            .then(text => { // Procesa el texto recibido
                let data;
                try {
                    data = JSON.parse(text); // Intenta convertir el texto en un objeto JSON
                } catch (err) { // Si ocurre un error al parsear
                    console.error('Error parseando JSON:', text); // Imprime el error y el texto original en la consola
                    Swal.fire('Error', 'Ocurrió un error al importar los libros', 'error'); // Muestra un mensaje de error
                    return; // Termina la función
                }

                if (data.success) { // Si la importación fue exitosa
                    let omittedDetails = []; // Inicializa un array para almacenar detalles de filas que fueron omitidas
                    if (data.detalles && Array.isArray(data.detalles)) { // Si la respuesta incluye detalles de filas omitidas
                        data.detalles.forEach(det => { // Itera sobre cada detalle
                            if (!det.exito) { // Si la fila no fue importada exitosamente
                                omittedDetails.push(det); // Agrega el detalle al array
                            }
                        });
                    }

                    let mainMessage = data.message;  // Guarda el mensaje principal de la respuesta
                    if (omittedDetails.length > 0) { // Si existen filas omitidas
                        let errorList = omittedDetails
                            .map(det => `<li>Fila ${det.fila}: ${det.motivo}</li>`)
                            .join(''); // Crea una lista HTML con los detalles de cada fila omitida
                        mainMessage += `
                          <br><br>
                          <strong>Detalles de omitidos:</strong>
                          <div style="max-height:300px; overflow-y:auto;">
                            <ul>${errorList}</ul>
                          </div>
                        `; // Agrega la lista de errores al mensaje principal
                    }

                    Swal.fire({
                        title: 'Resultado de la Importación',
                        html: mainMessage,
                        icon: omittedDetails.length > 0 ? 'warning' : 'success'
                    }); // Muestra una alerta con el resultado de la importación, indicando si hubo filas omitidas

                    loadBooks(false); // Recarga la lista de libros sin reiniciar la paginación
                } else {
                    Swal.fire('Error', data.message, 'error'); // Si la importación falla, muestra el mensaje de error del servidor
                }
            })
            .catch(error => { // Captura cualquier error en la petición de importación
                console.error('Error:', error); // Imprime el error en la consola
                Swal.fire('Error', 'Ocurrió un error al importar los libros', 'error'); // Muestra un mensaje de error genérico
            })
            .finally(() => { // Independientemente del resultado, se ejecuta este bloque
                clearInterval(intervalId); // Detiene el intervalo de progreso
                updateProgressBar(100); // Actualiza la barra de progreso al 100%
                setTimeout(() => { // Espera 500ms antes de ocultar el modal de progreso
                    hideProgressModal(); // Oculta el modal de progreso
                }, 500);
                importExcelInput.value = ""; // Reinicia el input de archivo Excel para permitir futuras importaciones
            });
        };
        reader.readAsArrayBuffer(file); // Lee el archivo seleccionado como un ArrayBuffer
    }

    // 19. Eventos de Exportar / Imprimir / Importar
    if (exportExcelButton) { // Verifica que el botón para exportar a Excel exista
        exportExcelButton.addEventListener("click", exportToExcel); // Asocia el evento de clic para exportar a Excel
    }
    if (exportPDFButton) { // Verifica que el botón para exportar a PDF exista
        exportPDFButton.addEventListener("click", () => exportToPDF(false)); // Asocia el evento de clic para exportar a PDF sin imprimir
    }
    if (printButton) { // Verifica que el botón para imprimir exista
        printButton.addEventListener("click", () => exportToPDF(true)); // Asocia el evento de clic para imprimir el PDF
    }
    if (importExcelButton) { // Verifica que el botón para importar Excel exista
        importExcelButton.addEventListener("click", () => {
            importExcelInput.click(); // Simula un clic en el input de archivo para abrir el selector de archivos
        });
    }
    if (importExcelInput) { // Verifica que el input para importar Excel exista
        importExcelInput.addEventListener("change", handleImportExcelChange); // Asocia el evento de cambio para manejar la importación cuando se seleccione un archivo
    }

    // 20. Búsqueda
    if (searchInput) { // Verifica que la barra de búsqueda exista
        searchInput.addEventListener("input", function(event) { // Asocia un evento de entrada (input) para capturar cambios en tiempo real
            const searchTerm = event.target.value.toLowerCase(); // Convierte el término de búsqueda a minúsculas para comparación
            filteredBooksData = booksData.filter(book =>  // Filtra los libros en base a si el término aparece en alguno de sus campos
                book.titulo.toLowerCase().includes(searchTerm) ||
                book.autor.toLowerCase().includes(searchTerm) ||
                book.categoria.toLowerCase().includes(searchTerm) ||
                book.grado.toLowerCase().includes(searchTerm) ||
                book.disponibilidad.toLowerCase().includes(searchTerm)
            );
            const sortBy = sortSelect.value; // Obtiene el criterio de ordenamiento actual
            applySort(sortBy); // Aplica el ordenamiento a los libros filtrados
            currentPage = 1; // Reinicia la paginación a la primera página
            renderTable(); // Renderiza la tabla con los resultados filtrados
        });
    }

    // 21. Ordenar (sort)
    if (sortSelect) { // Verifica que exista el select para ordenar
        sortSelect.addEventListener("change", function(event) { // Asocia un evento de cambio para actualizar el orden
            const sortBy = event.target.value; // Obtiene el valor seleccionado para el ordenamiento
            localStorage.setItem('sortBy', sortBy); // Guarda el criterio de ordenamiento en localStorage para persistencia
            applySort(sortBy); // Aplica el ordenamiento a los datos filtrados
            currentPage = 1; // Reinicia la paginación a la primera página
            renderTable(); // Renderiza la tabla con el nuevo orden
        });
    }

    function applySort(sortBy) { // Función que ordena los libros filtrados según el criterio seleccionado
        if (sortBy === "recent") { // Si se selecciona ordenar por los más recientes
            filteredBooksData.sort((a, b) => b.id - a.id); // Ordena de forma descendente según el id (suponiendo que ids mayores son más recientes)
        } else if (sortBy === "oldest") { // Si se selecciona ordenar por los más antiguos
            filteredBooksData.sort((a, b) => a.id - b.id); // Ordena de forma ascendente según el id
        }
    }

    // 22. Cargar la lista al inicio
    loadBooks(); // Llama a la función loadBooks para obtener y mostrar la lista de libros al iniciar
}
