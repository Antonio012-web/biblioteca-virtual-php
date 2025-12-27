function initializeEstadisticas() { // Inicia la función que configura y maneja el módulo de estadísticas
    // Obtiene la referencia al elemento <select> para elegir el tipo de estadística (general, usuario, libros, etc.)
    const typeSelect = document.getElementById('type'); 
    // Obtiene la referencia al <select> para elegir un usuario (se utiliza solo cuando el tipo es "user")
    const userSelect = document.getElementById('user'); 
    // Obtiene la referencia al <select> para elegir el intervalo de tiempo (por ejemplo, "day")
    const timeframeSelect = document.getElementById('timeframe'); 
    // Obtiene la referencia al contenedor (div) que alberga los inputs para una fecha personalizada, si es necesario
    const customDateDiv = document.getElementById('custom-date'); 
    // Obtiene la referencia al botón que, al hacer clic, genera la estadística
    const generateButton = document.getElementById('generate'); 
    // Obtiene la referencia al botón de imprimir/exportar la estadística (nuevo elemento en el DOM)
    const printButton = document.getElementById('printButton'); 
    // Obtiene la referencia al contenedor con clase "stats-left", donde se insertará el canvas del gráfico
    const chartContainer = document.querySelector('.stats-left'); 
    // Obtiene la referencia al contenedor con id "user-books", donde se mostrarán los libros y su tiempo de lectura (para estadísticas por usuario)
    const userBooksDiv = document.getElementById('user-books'); 

    // Obtiene la referencia al input para seleccionar la fecha (usado para estadísticas "por día")
    const startDateInput = document.getElementById('start-date'); 
    // const endDateInput = document.getElementById('end-date'); // Línea comentada: referencia a un input de fecha final, no se usa actualmente

    // Crea un objeto Date con la fecha y hora actuales
    const today = new Date(); 
    // Extrae el año actual (por ejemplo, 2025)
    const currentYear = today.getFullYear(); 
    // Ajusta la fecha actual para obtener la hora local exacta, compensando el desfase de la zona horaria
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000); 
    // Formatea la fecha actual en el formato "YYYY-MM-DD" usando la localización 'en-CA'
    const formattedToday = today.toLocaleDateString('en-CA'); 
    // Establece el valor mínimo permitido para el input de fecha al 1 de enero del año actual
    startDateInput.setAttribute('min', `${currentYear}-01-01`); 
    // Establece el valor máximo permitido para el input de fecha a la fecha actual
    startDateInput.setAttribute('max', formattedToday); 

    // Se reasignan nuevamente los atributos "min" y "max" para garantizar la configuración de límites
    startDateInput.setAttribute('min', `${currentYear}-01-01`);
    startDateInput.setAttribute('max', formattedToday);
    // La referencia al input end-date se comenta ya que no se utiliza en este contexto

    // Previene que la rueda del mouse (scroll) modifique el valor del input de fecha
    startDateInput.addEventListener('wheel', function(e) {
        e.preventDefault(); // Evita el comportamiento por defecto del scroll sobre el input
    });
  
    // Al cambiar el valor del input de fecha, se valida que no se seleccione una fecha cuyo año sea mayor al actual
    startDateInput.addEventListener('change', function() {
        const selectedDate = new Date(startDateInput.value); // Convierte el valor seleccionado en un objeto Date
        if (selectedDate.getFullYear() > currentYear) { // Si el año de la fecha seleccionada es mayor al año actual
            startDateInput.value = formattedToday; // Reestablece el valor a la fecha actual formateada
        }
    });
  
    // Variable para almacenar la instancia del gráfico; se inicializa en null ya que aún no se ha creado
    let chart = null; 
    // Variable para llevar el seguimiento de la página actual en la paginación (inicia en la página 1)
    let currentPage = 1; 
    // Define cuántos registros (libros) se mostrarán por cada página
    const recordsPerPage = 10; 
    
    // Variables que se utilizarán para configurar la impresión o exportación de la estadística
    let printTitle = "Estadística"; // Título principal que se mostrará en la impresión/exportación
    let printSubTitle = ""; // Subtítulo que se actualizará según la estadística (por ejemplo, el nombre de un usuario)
    let printDatetime = ""; // Cadena que contendrá la fecha y hora de cuando se genera la impresión/exportación
    
    // -------------------------------------------------------------------
    // Función: loadUsers
    // -------------------------------------------------------------------
    // Carga la lista de usuarios desde el servidor para rellenar el selector de usuarios
    function loadUsers() {
        fetch('estadistica_lectura.php?action=load_users') // Realiza una petición al servidor solicitando cargar usuarios
            .then(response => {
                // Si la respuesta no es satisfactoria, procesa el error
                if (!response.ok) {
                    return response.json().then(error => {
                        throw new Error(error.error); // Lanza un error con el mensaje proporcionado
                    });
                }
                return response.json(); // Convierte la respuesta a JSON si es correcta
            })
            .then(data => {
                // Limpia el contenido del selector y agrega una opción predeterminada
                userSelect.innerHTML = '<option value="">Seleccionar Usuario</option>';
                // Itera sobre cada usuario recibido y crea un elemento <option> para cada uno
                data.users.forEach(user => {
                    const option = document.createElement('option'); // Crea un nuevo elemento <option>
                    option.value = user.id; // Establece el valor de la opción con el id del usuario
                    // Establece el texto de la opción combinando nombre y apellidos
                    option.textContent = `${user.nombre} ${user.apPaterno} ${user.apMaterno}`;
                    userSelect.appendChild(option); // Añade la opción al selector
                });
            })
            .catch(error => { // En caso de error, lo muestra en la consola y alerta al usuario con SweetAlert
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message,
                });
            });
    }
    
    // -------------------------------------------------------------------
    // Función: loadGeneralStats
    // -------------------------------------------------------------------
    // Solicita y muestra estadísticas generales (como total de usuarios, libros, etc.) en el dashboard
    function loadGeneralStats() {
        fetch('estadistica_lectura.php?action=general_stats') // Realiza una petición al servidor con la acción "general_stats"
            .then(response => response.json()) // Convierte la respuesta en formato JSON
            .then(data => {
                // Actualiza cada uno de los elementos del DOM con los datos recibidos
                document.getElementById('total-users').textContent = data.totalUsers; // Muestra el total de usuarios
                document.getElementById('total-books').textContent = data.totalBooks; // Muestra el total de libros
                document.getElementById('total-reading-time').textContent = `${data.totalReadingTime} min`; // Muestra el tiempo total de lectura con la etiqueta "min"
                document.getElementById('most-read-books').textContent = data.mostReadBooks; // Muestra los libros más leídos
                document.getElementById('least-read-books').textContent = data.leastReadBooks || 'N/A'; // Muestra los libros menos leídos o 'N/A' si no hay datos
            })
            .catch(error => { // Maneja cualquier error durante la petición
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error', 
                    title: 'Error',
                    text: error.message,
                });
            });
    }
    
    // -------------------------------------------------------------------
    // Función: displayPage
    // -------------------------------------------------------------------
    // Muestra una página específica de la lista de libros y su tiempo de lectura en el DOM
    function displayPage(userBooks, page, totalTime) {
        // Calcula el índice de inicio y final basado en la página actual y el número de registros por página
        const startIndex = (page - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        // Extrae la porción del arreglo correspondiente a la página actual
        const paginatedBooks = userBooks.slice(startIndex, endIndex);
    
        // Limpia el contenedor "userBooksDiv" y añade un encabezado
        userBooksDiv.innerHTML = '<h3>Tiempo de lectura por libro:</h3>';
        const list = document.createElement('ul'); // Crea una lista no ordenada para los libros
        // Para cada libro en la página actual, crea un elemento <li> que muestre el nombre y tiempo de lectura
        paginatedBooks.forEach(book => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<span>${book.libro}</span>: ${book.tiempo} minutos`;
            list.appendChild(listItem);
        });
        userBooksDiv.appendChild(list); // Agrega la lista al contenedor
    
        // Crea un div para mostrar el total del tiempo de lectura y lo agrega al contenedor
        const totalTimeDiv = document.createElement('div');
        totalTimeDiv.id = 'total-time';
        totalTimeDiv.innerHTML = `<h3>Total tiempo de lectura: ${totalTime} minutos</h3>`;
        userBooksDiv.appendChild(totalTimeDiv);
    
        // Llama a la función que genera la paginación (botones de página)
        displayPagination(userBooks, page, totalTime);
    }
    
    // -------------------------------------------------------------------
    // Función: displayPagination
    // -------------------------------------------------------------------
    // Crea y muestra botones de paginación basados en la cantidad total de registros
    function displayPagination(userBooks, page, totalTime) {
        // Calcula el total de páginas dividiendo el número total de libros entre el número de registros por página y redondeando hacia arriba
        const totalPages = Math.ceil(userBooks.length / recordsPerPage);
        const paginationDiv = document.createElement('div');
        paginationDiv.classList.add('pagination'); // Agrega la clase "pagination" para aplicar estilos
    
        // Itera desde la página 1 hasta la última página
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button'); // Crea un botón para la página i
            pageButton.textContent = i; // El texto del botón es el número de la página
            pageButton.classList.add('page-button'); // Se añade una clase para el estilo de botones de página
            if (i === page) { // Si el botón corresponde a la página actual
                pageButton.classList.add('active'); // Se añade la clase "active" para resaltarlo
            }
            // Al hacer clic en el botón, se llama a displayPage para mostrar la página correspondiente
            pageButton.addEventListener('click', () => {
                displayPage(userBooks, i, totalTime);
            });
            paginationDiv.appendChild(pageButton); // Se añade el botón al contenedor de paginación
        }
    
        // Se añade el contenedor de paginación al div de libros
        userBooksDiv.appendChild(paginationDiv);
    }
    
    // -------------------------------------------------------------------
    // Función: printChart
    // -------------------------------------------------------------------
    // Permite al usuario imprimir la gráfica o exportarla a PDF
    function printChart() {
        // Obtiene la referencia al canvas donde se dibuja el gráfico (id "chart")
        const chartCanvas = document.getElementById('chart');
        if (!chartCanvas) { // Si el canvas no existe, muestra una alerta de error
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No hay gráfica para imprimir.'
            });
            return; // Termina la ejecución de la función
        }
    
        // Convierte el contenido del canvas en una imagen en formato base64 (PNG)
        const chartImage = chartCanvas.toDataURL("image/png");
    
        // Utiliza SweetAlert2 para ofrecer al usuario dos opciones: Exportar PDF o Imprimir
        Swal.fire({
            title: '¿Qué acción desea realizar?',
            text: 'Presione "Exportar PDF" para exportar o "Imprimir" para imprimir la estadística.',
            icon: 'question',
            showCancelButton: true, // Muestra el botón de cancelar
            confirmButtonText: 'Exportar PDF', // Texto del botón de confirmación
            cancelButtonText: 'Imprimir' // Texto del botón de cancelación
        }).then((result) => {
            if (result.isConfirmed) { // Si el usuario elige exportar a PDF
                // Define la estructura y estilos del documento PDF usando pdfmake
                var docDefinition = {
                    content: [
                        { text: printTitle, style: 'header' },
                        { text: printSubTitle, style: 'subheader' },
                        { text: printDatetime, style: 'datetime' },
                        { image: chartImage, width: 500, alignment: 'center', margin: [0, 20, 0, 20] },
                        { text: "© 2025 Biblioteca Virtual Escolar. Todos los derechos reservados.", style: 'footer' }
                    ],
                    styles: {
                        header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
                        subheader: { fontSize: 14, alignment: 'center', margin: [0, 0, 0, 5] },
                        datetime: { fontSize: 10, alignment: 'center', margin: [0, 0, 0, 10] },
                        footer: { fontSize: 10, alignment: 'center', margin: [0, 20, 0, 0] }
                    }
                };
                // Crea el PDF y lo descarga con el nombre "estadistica.pdf"
                pdfMake.createPdf(docDefinition).download('estadistica.pdf');
            } else if (result.dismiss === Swal.DismissReason.cancel) { // Si el usuario opta por imprimir
                // Abre una nueva ventana para mostrar el contenido formateado para impresión
                const printWindow = window.open('', '_blank', 'width=800,height=600');
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Imprimir Estadística</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                .header { text-align: center; margin-bottom: 20px; }
                                .header h1 { margin: 0; }
                                .header h2 { margin: 5px 0 0 0; font-weight: normal; }
                                .datetime { text-align: center; margin-bottom: 20px; font-size: 0.9em; }
                                .chart-container { text-align: center; }
                                .footer { text-align: center; margin-top: 20px; font-size: 0.8em; color: #555; }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>${printTitle}</h1>
                                <h2>${printSubTitle}</h2>
                            </div>
                            <div class="datetime">
                                <p>${printDatetime}</p>
                            </div>
                            <div class="chart-container">
                                <img id="chartImg" src="${chartImage}" alt="Gráfica de estadísticas">
                            </div>
                            <div class="footer">
                                <p>© 2025 Biblioteca Virtual Escolar. Todos los derechos reservados.</p>
                            </div>
                        </body>
                    </html>
                `);
                printWindow.document.close(); // Cierra el documento para que se renderice correctamente
                // Espera a que la imagen en la ventana de impresión se cargue para iniciar el proceso de impresión
                printWindow.document.getElementById("chartImg").onload = function() {
                    printWindow.focus();
                    printWindow.print(); // Abre el diálogo de impresión del navegador
                    printWindow.close(); // Cierra la ventana de impresión una vez finalizado el proceso
                };
            }
        });
    }
    // Fin de la función printChart

    // -------------------------------------------------------------------
    // Evento: Cuando cambia el selector de tipo de estadística
    // -------------------------------------------------------------------
    typeSelect.addEventListener('change', function() {
        // Si existe un gráfico previamente generado, se destruye para limpiar la visualización
        if (chart) {
            chart.destroy();
            chart = null;
        }
        // Busca el canvas existente (si lo hay) y lo elimina del DOM
        const oldCanvas = document.getElementById('chart');
        if (oldCanvas) {
            oldCanvas.parentNode.removeChild(oldCanvas);
        }
        // Limpia el contenedor de libros para eliminar datos anteriores
        userBooksDiv.innerHTML = "";
    
        // Si se selecciona el tipo "user", se muestra el filtro de usuario y se carga la lista de usuarios
        if (typeSelect.value === 'user') {
            document.getElementById('user-filter').style.display = 'flex';
            loadUsers();
        } else {
            // En otros casos, se oculta el filtro de usuario
            document.getElementById('user-filter').style.display = 'none';
        }
    });
    
    // -------------------------------------------------------------------
    // Evento: Cuando cambia el selector del timeframe (intervalo de tiempo)
    // -------------------------------------------------------------------
    timeframeSelect.addEventListener('change', function() {
        // Muestra u oculta el bloque de fecha personalizada según si el valor es "day" o no
        customDateDiv.style.display = timeframeSelect.value === 'day' ? 'block' : 'none';
    });
    
    // -------------------------------------------------------------------
    // Configuración del botón de imprimir/exportar: se asigna su evento si existe; en caso contrario, se registra un error en la consola
    // -------------------------------------------------------------------
    if (printButton) {
        printButton.addEventListener('click', printChart);
    } else {
        console.error("El botón con id='printButton' no existe en el DOM.");
    }
    
    // -------------------------------------------------------------------
    // Evento: Cuando se hace clic en el botón "Generate" para generar la estadística
    // -------------------------------------------------------------------
    generateButton.addEventListener('click', function() {
        // Obtiene los valores de los distintos filtros
        const type = typeSelect.value; // Tipo de estadística (general, user, books)
        const userId = userSelect.value; // ID del usuario seleccionado (si aplica)
        const timeframe = timeframeSelect.value; // Intervalo de tiempo seleccionado
        const startDate = startDateInput.value; // Fecha seleccionada para timeframe "day"
        // Se ignora endDate ya que solo se utiliza startDate en este caso
    
        // Validación: Si se selecciona estadísticas por usuario, se debe elegir un usuario
        if (type === 'user' && !userId) {
            Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Por favor, seleccione un usuario.'
            });
            return; // Detiene la ejecución si la validación falla
        }
    
        // Validación: Si el timeframe es "day", se debe seleccionar una fecha
        if (timeframe === 'day') {
            if (!startDate) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Atención',
                    text: 'Por favor, seleccione la fecha.'
                });
                return; // Detiene la ejecución si la fecha no está seleccionada
            }
            // Los límites de fecha ya se validan en los atributos del input
        }
    
        // Construcción de la URL para solicitar la generación de la estadística, añadiendo parámetros según los filtros
        let url = `estadistica_lectura.php?action=generate&type=${type}&timeframe=${timeframe}`;
        if (type === 'user' && userId) {
            url += `&user=${userId}`;
        }
        if (timeframe === 'day') {
            url += `&start_date=${startDate}`;
        }
    
        // Realiza la petición al servidor con la URL construida
        fetch(url)
            .then(response => {
                if (!response.ok) { // Si la respuesta HTTP es errónea, procesa el error
                    return response.json().then(error => {
                        throw new Error(error.error);
                    });
                }
                return response.json(); // Convierte la respuesta a JSON si es correcta
            })
            .then(data => {
                // Si ya existe una gráfica, se destruye y elimina para hacer espacio a la nueva
                if (chart) {
                    chart.destroy();
                    chart = null;
                }
                const oldCanvas = document.getElementById('chart');
                if (oldCanvas) {
                    oldCanvas.parentNode.removeChild(oldCanvas);
                }
                // Crea un nuevo elemento canvas, lo asigna el id "chart" y lo añade al contenedor
                const newCanvas = document.createElement('canvas');
                newCanvas.id = 'chart';
                chartContainer.appendChild(newCanvas);
                // Obtiene el contexto 2D del canvas para poder dibujar la gráfica con Chart.js
                const newCtx = newCanvas.getContext('2d');
    
                // Crea la gráfica de barras usando Chart.js, utilizando los datos y etiquetas proporcionados por el servidor
                chart = new Chart(newCtx, {
                    type: 'bar', // Define el tipo de gráfica como de barras
                    data: {
                        labels: data.labels, // Etiquetas para el eje X
                        datasets: data.datasets // Datos para las barras
                    },
                    options: {
                        responsive: true, // Hace que la gráfica se adapte a diferentes tamaños de pantalla
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: data.xTitle // Título del eje X
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: data.yTitle // Título del eje Y
                                }
                            }
                        }
                    }
                });
    
                // Si el tipo de estadística es "user", se muestra la lista paginada de libros y tiempos de lectura
                if (type === 'user') {
                    displayPage(data.userBooks, currentPage, data.totalTime);
                    // Actualiza el subtítulo de impresión con el nombre completo del usuario seleccionado
                    printSubTitle = "Alumno(a): " + userSelect.options[userSelect.selectedIndex].textContent;
                } else if (type === 'books') { // Si el tipo es "books", se limpia el contenedor de libros y se actualiza el subtítulo
                    userBooksDiv.innerHTML = '';
                    printSubTitle = "Libros";
                } else { // Para estadísticas generales
                    userBooksDiv.innerHTML = '';
                    printSubTitle = "General";
                }
                // Se asigna la fecha y hora actual para usarla en la impresión/exportación
                printDatetime = new Date().toLocaleString();
    
                // Habilita el botón de imprimir, en caso de haber sido deshabilitado previamente
                if (printButton) {
                    printButton.disabled = false;
                }
            })
            .catch(error => { // Maneja y muestra errores en caso de fallo en la petición
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message,
                });
            });
    });
    
    // -------------------------------------------------------------------
    // Evento: Se ajusta el tamaño de la gráfica cuando cambia el tamaño de la ventana
    // -------------------------------------------------------------------
    window.addEventListener('resize', function() {
        if (chart) { // Si existe un gráfico, se llama al método resize para que se adapte al nuevo tamaño
            chart.resize();
        }
    });
    
    // Se cargan las estadísticas generales (totales) en el dashboard
    loadGeneralStats();
    // Se dispara el evento 'change' en el selector de timeframe para actualizar la visibilidad del bloque de fecha personalizado
    timeframeSelect.dispatchEvent(new Event('change'));
}
