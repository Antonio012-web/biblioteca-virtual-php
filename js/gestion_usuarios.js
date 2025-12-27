// Función para mostrar el modal de progreso
function showProgressModal() {
    // Obtiene el elemento del modal de progreso mediante su id "progressModal"
    const progressModal = document.getElementById("progressModal");
    // Cambia el estilo display del modal a "block" para hacerlo visible
    progressModal.style.display = "block";
    // Inicializa la barra de progreso en 0%
    updateProgressBar(0);
}

// Función para ocultar el modal de progreso
function hideProgressModal() {
    // Obtiene el elemento del modal de progreso mediante su id "progressModal"
    const progressModal = document.getElementById("progressModal");
    // Cambia el estilo display del modal a "none" para ocultarlo
    progressModal.style.display = "none";
}

// Función para actualizar la barra de progreso con un porcentaje dado
function updateProgressBar(percent) {
    // Obtiene el elemento que representa el relleno (fill) de la barra de progreso
    const progressFill = document.getElementById("progressFill");
    // Obtiene el elemento donde se muestra el texto del progreso
    const progressText = document.getElementById("progressText");
    // Actualiza el ancho del elemento de relleno al porcentaje indicado
    progressFill.style.width = percent + "%";
    // Actualiza el texto que muestra el porcentaje
    progressText.textContent = percent + "%";
}

// --------------------------
// Función para obtener la fecha y hora actual en formato "Sáb, 2025-03-01 01:14:08"
// Se puede especificar la zona horaria (por defecto 'America/Mexico_City')
function getCurrentDateTime(timeZone = 'America/Mexico_City') {
    // Crea un objeto Date con la fecha y hora actuales
    const now = new Date();
    // Obtiene el día de la semana en formato corto en español, según la zona horaria, y elimina puntos
    const weekday = now.toLocaleDateString('es-ES', {
      timeZone: timeZone,
      weekday: 'short'
    }).replace(/\./g, '');
    // Obtiene el día en formato de dos dígitos
    const day = now.toLocaleDateString('es-ES', { timeZone: timeZone, day: '2-digit' });
    // Obtiene el mes en formato de dos dígitos
    const month = now.toLocaleDateString('es-ES', { timeZone: timeZone, month: '2-digit' });
    // Obtiene el año en formato numérico
    const year = now.toLocaleDateString('es-ES', { timeZone: timeZone, year: 'numeric' });
    // Obtiene la hora, minutos y segundos en formato de dos dígitos sin AM/PM (hora 24h)
    const timeString = now.toLocaleTimeString('es-ES', {
      timeZone: timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    // Agrega una coma al día de la semana
    const formattedWeekday = weekday + ',';
    // Retorna la fecha y hora formateada en el formato deseado
    return `${formattedWeekday} ${year}-${month}-${day} ${timeString}`;
}

// (Opcional) Función para formatear una fecha dada en el mismo formato que getCurrentDateTime
function formatDateTime(dateInput, timeZone = 'America/Mexico_City') {
  // Crea un objeto Date a partir de la entrada
  const date = new Date(dateInput);
  // Si la fecha no es válida, retorna la entrada sin modificar
  if (isNaN(date)) return dateInput;
  // Obtiene el día de la semana en formato corto en español, según la zona horaria, y elimina puntos
  const weekday = date.toLocaleDateString('es-ES', {
    timeZone: timeZone,
    weekday: 'short'
  }).replace(/\./g, '');
  // Obtiene el día en formato de dos dígitos
  const day = date.toLocaleDateString('es-ES', { timeZone: timeZone, day: '2-digit' });
  // Obtiene el mes en formato de dos dígitos
  const month = date.toLocaleDateString('es-ES', { timeZone: timeZone, month: '2-digit' });
  // Obtiene el año en formato numérico
  const year = date.toLocaleDateString('es-ES', { timeZone: timeZone, year: 'numeric' });
  // Obtiene la hora, minutos y segundos en formato de dos dígitos sin AM/PM (hora 24h)
  const timeString = date.toLocaleTimeString('es-ES', {
    timeZone: timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  // Capitaliza la primera letra del día de la semana y agrega una coma
  const formattedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1) + ',';
  // Retorna la fecha y hora formateada
  return `${formattedWeekday} ${year}-${month}-${day} ${timeString}`;
}

// Función para inicializar la gestión de usuarios y configurar eventos y referencias del DOM
function inicializarGestionUsuarios() {
  // 1. Referencias a elementos del DOM (obtención de elementos mediante sus ids o selectores)
  const form                  = document.getElementById("userForm");
  const passwordForm          = document.getElementById("passwordForm");
  const usersTable            = document.getElementById("usersTable");
  const searchInput           = document.getElementById("searchInput");
  const addUserButton         = document.getElementById("addUserButton");
  const deleteSelectedButton  = document.getElementById("deleteSelectedButton");
  const userModal             = document.getElementById("userModal");
  const passwordModal         = document.getElementById("passwordModal");
  const closeModal            = document.querySelectorAll(".close");
  const recordCount           = document.getElementById("totalRecords");
  const exportExcelButton     = document.getElementById("exportExcelButton");
  const exportPDFButton       = document.getElementById("exportPDFButton");
  const printButton           = document.getElementById("printButton");
  const importExcelButton     = document.getElementById("importExcelButton");
  const importExcelInput      = document.getElementById("importExcelInput");
  const sortOrder             = document.getElementById("sortOrder");
  const selectAllCheckbox     = document.getElementById("selectAll");
  const paginationContainer   = document.querySelector('.pagination-container');

  const nombreInput       = document.getElementById("nombre");
  const apPaternoInput    = document.getElementById("apPaterno");
  const apMaternoInput    = document.getElementById("apMaterno");
  const direccionInput    = document.getElementById("direccion");
  const correoInput       = document.getElementById("correo");
  const numTelefonoInput  = document.getElementById("numTelefono");
  const passwordInput     = document.getElementById("password");
  const newPasswordInput  = document.getElementById("newPassword");

  let currentPage      = 1; // Página actual para paginación
  const recordsPerPage = 10; // Cantidad de registros a mostrar por página
  let totalRecordsCount   = 0; // Contador de registros totales (inicialmente 0)
  let usersData        = []; // Arreglo para almacenar los datos completos de usuarios
  let filteredData     = []; // Arreglo para almacenar los datos filtrados según búsqueda u orden
  let isEditMode       = false; // Bandera para indicar si se está editando un usuario existente

  // 2. Listeners para los botones de exportar
  if (exportExcelButton) {
      // Al hacer clic en el botón de exportar a Excel, se ejecuta la función exportToExcel
      exportExcelButton.addEventListener("click", exportToExcel);
  }
  if (exportPDFButton) {
      // Al hacer clic en el botón de exportar a PDF, se llama a exportToPDF con print = false (descarga)
      exportPDFButton.addEventListener("click", () => exportToPDF(false));
  }
  if (printButton) {
      // Al hacer clic en el botón de imprimir, se llama a exportToPDF con print = true (impresión)
      printButton.addEventListener("click", () => exportToPDF(true));
  }

  // 3. Cerrar modales con la X
  if (closeModal) {
      // Se asigna el evento a cada elemento con la clase "close" para cerrar los modales
      closeModal.forEach(element => {
          element.addEventListener("click", () => {
              // Oculta el modal de usuario
              userModal.style.display        = "none";
              // Oculta el modal de cambio de contraseña
              passwordModal.style.display    = "none";
              // Oculta el modal de información
              document.getElementById("infoModal").style.display = "none";
              // Resetea el formulario de usuario si existe
              if (form)         form.reset();
              // Resetea el formulario de contraseña si existe
              if (passwordForm) passwordForm.reset();
          });
      });
  }

  // 4. Botón "Agregar Usuario"
  if (addUserButton) {
      addUserButton.addEventListener("click", () => {
          isEditMode = false; // Se establece el modo de edición en falso para agregar un nuevo usuario
          if (form) form.reset(); // Resetea el formulario de usuario
          // Limpia el campo oculto de id del usuario
          document.getElementById('userId').value = '';  
          // Hace que la contraseña sea requerida (ya que es nuevo usuario)
          passwordInput.required = true;
          // Muestra el contenedor de contraseña en el formulario
          document.getElementById('passwordContainer').style.display = 'block';
          // Cambia el título del modal a "Agregar Usuario"
          document.getElementById('modalTitle').textContent = 'Agregar Usuario';  
          // Muestra el modal de usuario
          userModal.style.display = "block";  
      });
  } 

  // 5. Validaciones rápidas en el cliente para el formulario de usuario
  function validateInput() {
      // Expresión regular para validar nombres (letras, tildes, ñ y espacios)
      const nameRegex       = /^[A-Za-zÁÉÍÓÚÑáéíóúñ]+(?:\s[A-Za-zÁÉÍÓÚÑáéíóúñ]+)*$/;
      // Expresión regular para validar direcciones y correos permitiendo letras, números y ciertos caracteres especiales
      const addressEmailRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ0-9\s@.,_/-]+$/; 
      // Expresión regular para validar teléfonos de 10 dígitos
      const phoneRegex      = /^\d{10}$/;
      // Expresión regular para validar contraseñas (mínimo 6 caracteres, al menos una mayúscula, un dígito y un carácter especial)
      const passwordRegex   = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/;

      // Validación del campo Nombre: no vacío y cumple la expresión regular
      if (!nombreInput.value.trim()) {
          Swal.fire('Error', 'El campo Nombre es obligatorio.', 'error');
          return false;
      }
      if (!nameRegex.test(nombreInput.value)) {
          Swal.fire('Error', 'Nombre solo debe contener letras y espacios (incl. tildes, ñ).', 'error');
          return false;
      }
      // Validación del campo Apellido Paterno
      if (!apPaternoInput.value.trim()) {
          Swal.fire('Error', 'El campo Apellido Paterno es obligatorio.', 'error');
          return false;
      }
      if (!nameRegex.test(apPaternoInput.value)) {
          Swal.fire('Error', 'Apellido Paterno solo debe contener letras y espacios.', 'error');
          return false;
      }
      // Validación del campo Apellido Materno
      if (!apMaternoInput.value.trim()) {
          Swal.fire('Error', 'El campo Apellido Materno es obligatorio.', 'error');
          return false;
      }
      if (!nameRegex.test(apMaternoInput.value)) {
          Swal.fire('Error', 'Apellido Materno solo debe contener letras y espacios.', 'error');
          return false;
      }
      // Validación del campo Dirección (mínimo 5 caracteres)
      if (!direccionInput.value.trim() || direccionInput.value.trim().length < 5) {
          Swal.fire('Error', 'La dirección debe tener al menos 5 caracteres.', 'error');
          return false;
      }
      if (!addressEmailRegex.test(direccionInput.value)) {
          Swal.fire('Error', 'La dirección contiene caracteres no permitidos.', 'error');
          return false;
      }
      // Validación del campo Correo
      if (!correoInput.value.trim()) {
          Swal.fire('Error', 'El campo Correo es obligatorio.', 'error');
          return false;
      }
      if (!addressEmailRegex.test(correoInput.value)) {
          Swal.fire('Error', 'El correo contiene caracteres no permitidos.', 'error');
          return false;
      }
      // Validación del campo Teléfono
      if (!numTelefonoInput.value.trim()) {
          Swal.fire('Error', 'El campo Teléfono es obligatorio.', 'error');
          return false;
      }
      if (!phoneRegex.test(numTelefonoInput.value)) {
          Swal.fire('Error', 'El teléfono debe contener exactamente 10 dígitos.', 'error');
          return false;
      }
      // Validación de la contraseña: si es creación o si se ingresa una nueva contraseña en edición
      if (!isEditMode || passwordInput.value.trim()) {
          if (!passwordRegex.test(passwordInput.value)) {
              Swal.fire('Error', 'Contraseña debe tener mínimo 6 caract., incl. mayúscula, número y especial.', 'error');
              return false;
          }
      }
      // Si todas las validaciones pasan, retorna true
      return true;
  }

  // 6. Función para manejar el envío del formulario (creación o actualización de usuario)
  function handleFormSubmit(event) {
      // Previene el comportamiento por defecto del formulario (recargar la página)
      event.preventDefault();
      // Valida los campos del formulario; si falla, se detiene la ejecución
      if (!validateInput()) return;

      // Obtiene el valor del campo oculto "userId" para determinar si es edición o creación
      const userId = document.getElementById("userId").value.trim();
      // Define la acción: 'update' si existe un id, de lo contrario 'create'
      const action = userId ? 'update' : 'create';  
      // Crea un objeto FormData a partir del formulario
      const formData = new FormData(form);

      // Realiza una petición POST a "crud_usuarios.php" pasando la acción correspondiente
      fetch(`crud_usuarios.php?action=${action}`, {
          method: 'POST',
          body: formData
      })
      .then(handleResponse) // Procesa la respuesta
      .then(data => {
          if (data.success) { // Si la operación fue exitosa
              Swal.fire('Éxito', data.message, 'success');
              loadUsers(false); // Recarga la lista de usuarios sin resetear la página
              userModal.style.display = "none";  // Cierra el modal de usuario
          } else {
              Swal.fire('Error', data.message, 'error');
          }
      })
      .catch(error => {
          console.error('Error:', error);
          Swal.fire('Error', 'Ocurrió un error al procesar la solicitud', 'error');
      });
  }
  // Asigna el listener al formulario de usuario, si existe
  if (form) {
      form.addEventListener("submit", handleFormSubmit);
  }

  // 7. Funciones para cambiar la contraseña
  // Función para validar el nuevo password según la expresión regular
  function validatePassword() {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/;
      if (!passwordRegex.test(newPasswordInput.value)) {
          Swal.fire('Error', 'Contraseña debe tener al menos 6 caracteres, con mayúscula, número y especial.', 'error');
          return false;
      }
      return true;
  }
  // Función para manejar el envío del formulario de cambio de contraseña
  function handlePasswordFormSubmit(event) {
      event.preventDefault();
      if (!validatePassword()) return;

      // Crea un objeto FormData a partir del formulario de contraseña
      const formData = new FormData(passwordForm);
      // Envía una petición POST a "crud_usuarios.php?action=updatePassword" para actualizar la contraseña
      fetch('crud_usuarios.php?action=updatePassword', {
          method: 'POST',
          body: formData
      })
      .then(handleResponse)
      .then(data => {
          if (data.success) {
              Swal.fire('Éxito', data.message, 'success');
              passwordModal.style.display = 'none'; // Cierra el modal de contraseña
              passwordForm.reset(); // Resetea el formulario de contraseña
          } else {
              Swal.fire('Error', data.message, 'error');
          }
      })
      .catch(error => {
          console.error('Error:', error);
          Swal.fire('Error', 'Ocurrió un error al procesar la solicitud', 'error');
      });
  }
  // Asigna el listener al formulario de contraseña, si existe
  if (passwordForm) {
      passwordForm.addEventListener("submit", handlePasswordFormSubmit);
  }

  // 8. Función para parsear la respuesta del servidor a JSON
  function handleResponse(response) {
      return response.text().then(text => {
          try {
              return JSON.parse(text);
          } catch (error) {
              console.error('Error al parsear JSON:', error);
              console.error('Respuesta recibida:', text);
              Swal.fire('Error', 'La respuesta del servidor no es válida.', 'error');
              throw new Error('Invalid JSON response');
          }
      });
  }

  // 9. Función para exportar datos a Excel
  function exportToExcel() {
      // Mapea los datos filtrados a un formato JSON con las columnas deseadas
      const exportData = filteredData.map((user) => ({
          "Nombre": user.nombre || '',
          "Apellido Paterno": user.apPaterno || '',
          "Apellido Materno": user.apMaterno || '',
          "Direccion": user.direccion || '',
          "Correo": user.correo || '',
          "Numero de Telefono": user.numTelefono || '',
          "Tipo de usuario": user.tipoUsuario || '',
          "Contraseña": "No disponible por seguridad"
      }));
      // Crea un nuevo libro de Excel
      const wb = XLSX.utils.book_new();
      // Convierte los datos a una hoja de Excel
      const ws = XLSX.utils.json_to_sheet(exportData);
      // Añade la hoja al libro con el nombre "Usuarios"
      XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
      // Escribe el archivo Excel con el nombre "usuarios.xlsx"
      XLSX.writeFile(wb, "usuarios.xlsx");
  }

  // 10. Función para exportar a PDF o imprimir
  function exportToPDF(print = false) {
      // Verifica que pdfMake esté disponible en la ventana
      if (!window.pdfMake) {
          Swal.fire('Error', 'No se pudo cargar pdfMake.', 'error');
          return;
      }
      // Obtiene el total de registros a exportar (según los datos filtrados)
      const totalRegistros = filteredData.length;
      // Obtiene la fecha y hora actual en la zona 'America/Mexico_City'
      const currentDateTime = getCurrentDateTime('America/Mexico_City');

      // Define la estructura del documento PDF (encabezado, pie y contenido)
      const docDefinition = {
          header: {
              columns: [
                  { text: 'Primaria Manuel Del Mazo Villasente - Usuarios', alignment: 'left', margin: [10, 10], fontSize: 12 },
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
                      widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                      body: [
                          [
                              { text: '#', bold: true, alignment: 'center' },
                              { text: 'Nombre', bold: true, alignment: 'center' },
                              { text: 'Apellido Paterno', bold: true, alignment: 'center' },
                              { text: 'Apellido Materno', bold: true, alignment: 'center' },
                              { text: 'Dirección', bold: true, alignment: 'center' },
                              { text: 'Correo', bold: true, alignment: 'center' },
                              { text: 'Teléfono', bold: true, alignment: 'center' },
                              { text: 'Tipo', bold: true, alignment: 'center' }
                          ],
                          // Se agregan las filas de datos mapeados de filteredData
                          ...filteredData.map((user, index) => [
                              { text: index + 1, alignment: 'center' },
                              { text: user.nombre, alignment: 'center' },
                              { text: user.apPaterno, alignment: 'center' },
                              { text: user.apMaterno, alignment: 'center' },
                              { text: user.direccion, alignment: 'center' },
                              { text: user.correo, alignment: 'center' },
                              { text: user.numTelefono, alignment: 'center' },
                              { text: user.tipoUsuario, alignment: 'center' }
                          ])
                      ]
                  },
                  layout: 'lightHorizontalLines'
              }
          ],
          pageMargins: [40, 60, 40, 60],
          pageSize: 'A4',
          pageOrientation: 'landscape'
      };

      // Crea el documento PDF usando pdfMake
      const pdfDoc = pdfMake.createPdf(docDefinition);
      if (print) {
          // Si se desea imprimir, obtiene la URL de los datos del PDF y lo muestra en un iframe en una nueva ventana
          pdfDoc.getDataUrl((dataUrl) => {
              const printWindow = window.open('', '_blank');
              printWindow.document.write('<iframe width="100%" height="100%" src="' + dataUrl + '"></iframe>');
          });
      } else {
          // Si no, descarga el PDF con el nombre "usuarios.pdf"
          pdfDoc.download("usuarios.pdf");
      }
  }

  // 11. Importar Excel con DETALLES
  if (importExcelButton) {
      // Al hacer clic en el botón de importar Excel, se simula el clic en el input oculto de Excel
      importExcelButton.addEventListener("click", () => {
          importExcelInput.click();
      });
  }
  if (importExcelInput) {
      // Al cambiar el valor del input de Excel, se llama a la función handleImportExcelChange
      importExcelInput.addEventListener("change", handleImportExcelChange);
  }

  // Función para manejar la importación del archivo Excel
  function handleImportExcelChange(event) {
      // Obtiene el primer archivo seleccionado
      const file = event.target.files[0];
      if (!file) return;

      // Define las extensiones permitidas para el archivo Excel
      const allowedExtensions = ['.xls', '.xlsx'];
      const lowerFileName = file.name.toLowerCase();
      // Verifica que el nombre del archivo termine en una de las extensiones permitidas
      if (!allowedExtensions.some(ext => lowerFileName.endsWith(ext))) {
          Swal.fire('Error', 'El archivo debe ser .xls o .xlsx', 'error');
          importExcelInput.value = "";
          return;
      }
      // Verifica que el tipo MIME del archivo corresponda a un Excel (opcional)
      if (
          file.type &&
          !file.type.includes('spreadsheet') &&
          !file.type.includes('excel') &&
          !file.type.includes('sheet')
      ) {
          Swal.fire('Error', 'El tipo de archivo no parece ser Excel.', 'error');
          importExcelInput.value = "";
          return;
      }

      // Crea un objeto FileReader para leer el contenido del archivo
      const reader = new FileReader();
      reader.onload = function(e) {
          // Convierte el resultado a un Uint8Array
          const data = new Uint8Array(e.target.result);
          // Lee el contenido del Excel usando XLSX
          const workbook = XLSX.read(data, { type: 'array' });
          // Obtiene el nombre de la primera hoja del libro
          const sheetName = workbook.SheetNames[0];
          // Obtiene la hoja correspondiente
          const worksheet = workbook.Sheets[sheetName];
          // Convierte la hoja a un arreglo JSON, usando la primera fila como encabezado
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (jsonData.length <= 1) {
              Swal.fire('Aviso', 'El archivo Excel no contiene datos.', 'info');
              return;
          }

          const rowsToImport = [];
          // Itera desde la segunda fila (índice 1) para omitir el encabezado
          for (let i = 1; i < jsonData.length; i++) {
              const row = jsonData[i];
              if (!row || row.length < 8) continue; // Omite filas con datos insuficientes

              // Extrae y limpia cada campo de la fila
              const nombre       = (row[0] || "").toString().trim();
              const apPaterno    = (row[1] || "").toString().trim();
              const apMaterno    = (row[2] || "").toString().trim();
              const direccion    = (row[3] || "").toString().trim();
              const correo       = (row[4] || "").toString().trim();
              const numTelefono  = (row[5] || "").toString().trim();
              const tipoUsuario  = (row[6] || "").toString().trim();
              const password     = (row[7] || "").toString().trim();

              // Si alguno de los campos es vacío, muestra una advertencia en la consola y omite la fila
              if (!nombre || !apPaterno || !apMaterno || !direccion || !correo || !numTelefono || !tipoUsuario || !password) {
                  console.warn(`Fila ${i+1} con datos insuficientes. Se omite.`);
                  continue;
              }

              // Agrega la fila válida al arreglo de filas a importar
              rowsToImport.push({
                  nombre,
                  apPaterno,
                  apMaterno,
                  direccion,
                  correo,
                  numTelefono,
                  tipoUsuario,
                  password
              });
          }

          // Si no se encontró ninguna fila válida, muestra un aviso y termina la función
          if (rowsToImport.length === 0) {
              Swal.fire('Aviso', 'No se encontraron filas válidas en el Excel.', 'info');
              return;
          }

          // Muestra el modal de progreso
          showProgressModal();
          let fakeProgress = 0;
          // Inicia un intervalo para simular progreso (hasta llegar al 90%)
          const intervalId = setInterval(() => {
              if (fakeProgress < 90) {
                  fakeProgress++;
                  updateProgressBar(fakeProgress);
              } else {
                  clearInterval(intervalId);
              }
          }, 100);

          // Envía una petición POST para importar los datos a "crud_usuarios.php?action=import"
          fetch('crud_usuarios.php?action=import', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userData: rowsToImport })
          })
          .then(response => response.text())
          .then(text => {
              let data;
              try {
                  data = JSON.parse(text);
              } catch (err) {
                  console.error('Error parseando JSON:', text);
                  Swal.fire('Error', 'Ocurrió un error al importar el Excel', 'error');
                  return;
              }

              if (data.success) {
                  let omittedDetails = [];
                  // Si se proporcionan detalles de filas omitidas, se procesan y muestran en la alerta
                  if (data.detalles && Array.isArray(data.detalles)) {
                      data.detalles.forEach(det => {
                          if (!det.exito) {
                              omittedDetails.push(det);
                          }
                          console.log(`Fila ${det.fila}: ${det.exito ? "Insertado" : "Omitido"} => ${det.motivo}`);
                      });
                  }

                  let mainMessage = data.message; 
                  if (omittedDetails.length > 0) {
                      let errorList = omittedDetails
                          .map(det => `<li>Fila ${det.fila}: ${det.motivo}</li>`)
                          .join('');

                      mainMessage += `
                        <br><br>
                        <strong>Detalles de omitidos:</strong>
                        <div style="max-height: 300px; overflow-y: auto;">
                          <ul>${errorList}</ul>
                        </div>
                      `;
                  }

                  Swal.fire({
                      title: 'Resultado de la Importación',
                      html: mainMessage,
                      icon: omittedDetails.length > 0 ? 'warning' : 'success'
                  });

                  // Recarga la lista de usuarios
                  loadUsers(true);

              } else {
                  Swal.fire('Error', data.message, 'error');
              }

          })
          .catch(error => {
              console.error('Error:', error);
              Swal.fire('Error', 'Ocurrió un error al importar el Excel', 'error');
          })
          .finally(() => {
              // Al finalizar la importación, se detiene el intervalo y se actualiza la barra a 100%
              clearInterval(intervalId);
              updateProgressBar(100);
              // Después de medio segundo, se oculta el modal de progreso
              setTimeout(() => {
                  hideProgressModal();
              }, 500);
              // Limpia el input de Excel
              importExcelInput.value = "";
          });
      };
      // Lee el archivo Excel como un ArrayBuffer
      reader.readAsArrayBuffer(file);
  }

  // 12. Seleccionar todos: asigna un listener al checkbox principal para seleccionar/deseleccionar todos los checkboxes de la tabla
  if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', () => {
          // Obtiene todos los checkboxes dentro de la tabla de usuarios
          const checkboxes = document.querySelectorAll('#usersTable input[type="checkbox"]');
          // Establece el estado de cada checkbox igual al del checkbox principal
          checkboxes.forEach(checkbox => {
              checkbox.checked = selectAllCheckbox.checked;
          });
      });
  }

  // 13. Función para manejar el clic en "Eliminar seleccionados"
  function handleDeleteSelectedClick() {
      const selectedIds = [];
      // Obtiene todos los checkboxes marcados dentro de la tabla de usuarios
      const checkboxes = document.querySelectorAll('#usersTable input[type="checkbox"]:checked');
      // Extrae el atributo data-id de cada checkbox seleccionado y lo agrega al arreglo
      checkboxes.forEach(checkbox => {
          selectedIds.push(checkbox.dataset.id);
      });
  
      // Si no se ha seleccionado ningún registro, muestra una alerta informativa
      if (selectedIds.length === 0) {
          Swal.fire('Información', 'Seleccione al menos un registro para eliminar', 'info');
          return;
      }
  
      // Muestra una alerta de confirmación antes de eliminar
      Swal.fire({
          title: '¿Estás seguro?',
          text: "¡No podrás revertir esto!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, eliminarlo!',
          cancelButtonText: 'Cancelar'
      }).then((result) => {
          if (result.isConfirmed) {
              // Crea un objeto FormData y añade los IDs seleccionados en formato JSON
              const formData = new FormData();
              formData.append('ids', JSON.stringify(selectedIds));
  
              // Envía una petición POST a "crud_usuarios.php?action=deleteSelected" para eliminar los usuarios seleccionados
              fetch('crud_usuarios.php?action=deleteSelected', {
                  method: 'POST',
                  body: formData
              })
              .then(handleResponse)
              .then(data => {
                  if (data.success) {
                      Swal.fire('Eliminados!', 'Los usuarios han sido eliminados.', 'success');
                      loadUsers(false); // Recarga la lista de usuarios
                      // Deselecciona el checkbox principal y todos los checkboxes de la tabla
                      const selectAllCheckbox = document.getElementById("selectAll");
                      if (selectAllCheckbox) {
                          selectAllCheckbox.checked = false;
                      }
                      const checkboxes = document.querySelectorAll('#usersTable input[type="checkbox"]');
                      checkboxes.forEach(checkbox => {
                          checkbox.checked = false;
                      });
                  } else {
                      Swal.fire('Error', data.message, 'error');
                  }
              })
              .catch(error => {
                  console.error('Error:', error);
                  Swal.fire('Error', 'Ocurrió un error al eliminar los usuarios', 'error');
              });
          }
      });
  }
  
  // Asigna el listener al botón "Eliminar seleccionados" si existe
  if (deleteSelectedButton) {
      deleteSelectedButton.addEventListener("click", handleDeleteSelectedClick);
  }

  // 14. Función para renderizar la tabla de usuarios con paginación
  function renderTable() {
      // Calcula el índice inicial y final según la página actual y la cantidad de registros por página
      const start = (currentPage - 1) * recordsPerPage;
      const end = start + recordsPerPage;
      // Obtiene los usuarios a mostrar en la página actual a partir de filteredData
      const paginatedUsers = filteredData.slice(start, end);

      // Limpia el contenido actual de la tabla
      usersTable.innerHTML = '';

      // Si no hay usuarios en la página actual, muestra un mensaje de "No se encontraron usuarios"
      if (paginatedUsers.length === 0) {
          const row = document.createElement('tr');
          const cell = document.createElement('td');
          cell.colSpan = 10; 
          cell.style.textAlign = 'center';
          cell.textContent = 'No se encontraron usuarios';
          row.appendChild(cell);
          usersTable.appendChild(row);
          recordCount.textContent = 'Total de registros: 0';
          return;
      }
  
      // Para cada usuario en la página actual, se crea una fila en la tabla
      paginatedUsers.forEach((user, index) => {
          const row = document.createElement("tr");

          // Crea la celda con checkbox para seleccionar el usuario
          const checkboxCell = document.createElement("td");
          checkboxCell.innerHTML = `<input type="checkbox" data-id="${user.id}">`;
          row.appendChild(checkboxCell);

          // Crea la celda que muestra el índice (número de registro)
          const cellIndex = document.createElement("td");
          cellIndex.textContent = start + index + 1;
          row.appendChild(cellIndex);

          // Crea y agrega la celda con el nombre del usuario
          const cellNombre = document.createElement("td");
          cellNombre.textContent = user.nombre || '';
          row.appendChild(cellNombre);

          // Crea y agrega la celda con el apellido paterno
          const cellApPaterno = document.createElement("td");
          cellApPaterno.textContent = user.apPaterno || '';
          row.appendChild(cellApPaterno);

          // Crea y agrega la celda con el apellido materno
          const cellApMaterno = document.createElement("td");
          cellApMaterno.textContent = user.apMaterno || '';
          row.appendChild(cellApMaterno);

          // Crea y agrega la celda con la dirección
          const cellDireccion = document.createElement("td");
          cellDireccion.textContent = user.direccion || '';
          row.appendChild(cellDireccion);

          // Crea y agrega la celda con el correo
          const cellCorreo = document.createElement("td");
          cellCorreo.textContent = user.correo || '';
          row.appendChild(cellCorreo);

          // Crea y agrega la celda con el número de teléfono
          const cellTelefono = document.createElement("td");
          cellTelefono.textContent = user.numTelefono || '';
          row.appendChild(cellTelefono);

          // Crea y agrega la celda con el tipo de usuario
          const cellTipo = document.createElement("td");
          cellTipo.textContent = user.tipoUsuario || '';
          row.appendChild(cellTipo);

          // Crea la celda con los botones de acción (en este caso, solo un botón "Ver")
          const actionsCell = document.createElement("td");
          actionsCell.innerHTML = `
              <div class="action-buttons">
                  <button class="btn btn-view view-button grow" data-id="${user.id}">
                      <i class="fas fa-eye"></i> Ver
                  </button>
              </div>
          `;
          row.appendChild(actionsCell);

          // Agrega la fila completa a la tabla
          usersTable.appendChild(row);
      });

      // Actualiza el contador de registros mostrados
      recordCount.textContent = `Total de registros: ${filteredData.length}`;

      // Asigna los listeners para los botones de editar, eliminar, cambiar contraseña y ver (si existen)
      document.querySelectorAll('.edit-button').forEach(button => {
          button.addEventListener('click', (event) => {
              const id = event.target.closest('.edit-button').dataset.id;
              editUser(id);
          });
      });
      document.querySelectorAll('.delete-button').forEach(button => {
          button.addEventListener('click', (event) => {
              const id = event.target.closest('.delete-button').dataset.id;
              deleteUser(id);
          });
      });
      document.querySelectorAll('.password-button').forEach(button => {
          button.addEventListener('click', (event) => {
              const id = event.target.closest('.password-button').dataset.id;
              changePassword(id);
          });
      });
      document.querySelectorAll('.view-button').forEach(button => {
          button.addEventListener('click', (event) => {
              const id = event.target.closest('.view-button').dataset.id;
              viewUser(id);
          });
      });

      // Asigna el listener al botón "Editar Usuario" para editar el usuario seleccionado
      const editUserButton = document.getElementById("editUserButton");
      if (editUserButton) {
          editUserButton.addEventListener("click", () => {
              const selectedCheckboxes = document.querySelectorAll('#usersTable input[type="checkbox"]:checked');
              if (selectedCheckboxes.length !== 1) {
                  Swal.fire("Información", "Por favor, seleccione un único registro para editar.", "info");
              } else {
                  const id = selectedCheckboxes[0].dataset.id;
                  editUser(id);
              }
          });
      }
      // Asigna el listener al botón "Cambiar Contraseña" para el usuario seleccionado
      const changePasswordButton = document.getElementById("changePasswordButton");
      if (changePasswordButton) {
          changePasswordButton.addEventListener("click", () => {
              const selectedCheckboxes = document.querySelectorAll('#usersTable input[type="checkbox"]:checked');
              if (selectedCheckboxes.length !== 1) {
                  Swal.fire("Información", "Por favor, seleccione un único registro para cambiar la contraseña.", "info");
              } else {
                  const id = selectedCheckboxes[0].dataset.id;
                  changePassword(id);
              }
          });
      }
  }

  // 15. NUEVA paginación estilo “1 2 3 4 5 … 20”
  function updatePagination() {
      if (!paginationContainer) return; // Si no existe el contenedor de paginación, termina la función
      paginationContainer.innerHTML = ''; // Limpia el contenido actual del contenedor

      const totalRecords = filteredData.length; // Total de registros según los datos filtrados
      const totalPages   = Math.ceil(totalRecords / recordsPerPage); // Calcula el número total de páginas

      // Crea un elemento <ul> para contener los elementos de paginación
      const ul = document.createElement('ul');
      ul.classList.add('pagination'); // Asigna la clase "pagination" para aplicar estilos

      // Botón "«" (anterior)
      const prevLi = document.createElement('li');
      const prevA = document.createElement('a');
      prevA.innerHTML = '<i class="fas fa-chevron-left"></i>'; // Ícono para ir a la página anterior
      if (currentPage === 1) {
          // Si ya está en la primera página, deshabilita el botón
          prevA.classList.add('disabled');
          prevA.style.pointerEvents = 'none';
      } else {
          // Si no, asigna un listener para decrementar la página
          prevA.addEventListener('click', () => {
              currentPage--;
              renderTable();
              updatePagination();
          });
      }
      prevLi.appendChild(prevA);
      ul.appendChild(prevLi);

      if (totalPages <= 5) {
          // Si hay 5 o menos páginas, muestra todas
          for (let i = 1; i <= totalPages; i++) {
              const li = document.createElement('li');
              const a = document.createElement('a');
              a.textContent = i;
              if (i === currentPage) {
                  a.classList.add('active');
              } else {
                  a.addEventListener('click', () => {
                      currentPage = i;
                      renderTable();
                      updatePagination();
                  });
              }
              li.appendChild(a);
              ul.appendChild(li);
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
                      currentPage = i;
                      renderTable();
                      updatePagination();
                  });
              }
              li.appendChild(a);
              ul.appendChild(li);
          }

          // Agrega un elemento con "..." para indicar omisión de páginas intermedias
          const ellipsisLi = document.createElement('li');
          ellipsisLi.textContent = '...';
          ul.appendChild(ellipsisLi);

          // Agrega la última página como opción
          const lastLi = document.createElement('li');
          const lastA = document.createElement('a');
          lastA.textContent = totalPages;
          if (currentPage === totalPages) {
              lastA.classList.add('active');
          } else {
              lastA.addEventListener('click', () => {
                  currentPage = totalPages;
                  renderTable();
                  updatePagination();
              });
          }
          lastLi.appendChild(lastA);
          ul.appendChild(lastLi);
      }

      // Botón "»" (siguiente)
      const nextLi = document.createElement('li');
      const nextA = document.createElement('a');
      nextA.innerHTML = '<i class="fas fa-chevron-right"></i>';
      if (currentPage === totalPages || totalPages === 0) {
          nextA.classList.add('disabled');
          nextA.style.pointerEvents = 'none';
      } else {
          nextA.addEventListener('click', () => {
              currentPage++;
              renderTable();
              updatePagination();
          });
      }
      nextLi.appendChild(nextA);
      ul.appendChild(nextLi);

      // Agrega el elemento <ul> completo al contenedor de paginación
      paginationContainer.appendChild(ul);
  }

  // 16. Función para cargar los usuarios (operación de lectura)
  function loadUsers(resetPage = true) {
      // Realiza una petición GET a "crud_usuarios.php?action=read" para obtener los usuarios
      fetch('crud_usuarios.php?action=read')
      .then(handleResponse)
      .then(data => {
          // Almacena los usuarios en usersData y convierte la fecha de registro a objeto Date
          usersData     = data.users.map(user => ({
              ...user,
              fechaRegistro: new Date(user.fechaRegistro)
          }));
          // Inicialmente, los datos filtrados son todos los usuarios
          filteredData  = usersData;
          totalRecordsCount = usersData.length;
          if (resetPage) currentPage = 1; // Reinicia la página si se indica

          // Obtiene el orden de clasificación guardado en localStorage o usa 'recientes' por defecto
          const savedSortOrder = localStorage.getItem('sortOrder') || 'recientes';
          sortOrder.value = savedSortOrder;
          // Aplica el orden de clasificación
          applySortOrder(savedSortOrder);
          renderTable(); // Renderiza la tabla con los datos actuales
          updatePagination(); // Actualiza la paginación
      })
      .catch(error => {
          console.error('Error:', error);
          Swal.fire('Error', 'Ocurrió un error al cargar los usuarios', 'error');
      });
  }

  // 17. Función para ordenar los datos según el orden seleccionado
  function applySortOrder(order) {
      if (order === 'recientes') {
          // Ordena de forma descendente por id
          filteredData.sort((a, b) => b.id - a.id);
      } else if (order === 'antiguos') {
          // Ordena de forma ascendente por id
          filteredData.sort((a, b) => a.id - b.id);
      }
      renderTable(); // Renderiza la tabla con el nuevo orden
      updatePagination(); // Actualiza la paginación
  }
  // Asigna el listener al select de orden si existe
  if (sortOrder) {
      sortOrder.addEventListener("change", function(event) {
          const sortBy = event.target.value;
          localStorage.setItem('sortOrder', sortBy); // Guarda el orden seleccionado en localStorage
          applySortOrder(sortBy);
      });
  }

  // 18. Función para la búsqueda en tiempo real
  if (searchInput) {
      searchInput.addEventListener("input", function(event) {
          const searchTerm = event.target.value.toLowerCase();
          if (!searchTerm) {
              // Si la búsqueda está vacía, muestra todos los usuarios
              filteredData = usersData;
          } else {
              // Filtra los usuarios según si alguno de sus campos contiene el término de búsqueda
              filteredData = usersData.filter(user => 
                  user.nombre.toLowerCase().includes(searchTerm) ||
                  user.apPaterno.toLowerCase().includes(searchTerm) ||
                  user.apMaterno.toLowerCase().includes(searchTerm) ||
                  user.correo.toLowerCase().includes(searchTerm) ||
                  user.tipoUsuario.toLowerCase().includes(searchTerm)
              );
          }
          currentPage = 1; // Reinicia la página
          renderTable(); // Renderiza la tabla con los datos filtrados
          updatePagination(); // Actualiza la paginación
      });
  }

  // 19. Carga inicial de usuarios
  loadUsers();

  // 20. Funciones globales para Editar, Eliminar, Cambiar Pass y Ver usuarios

  // Función global para editar un usuario; se asigna a window para que sea accesible globalmente
  window.editUser = function(id) {
      isEditMode = true; // Establece el modo de edición
      passwordInput.required = false; // En edición, la contraseña no es obligatoria
      // Oculta el contenedor de contraseña en el formulario
      document.getElementById('passwordContainer').style.display = 'none';
      // Cambia el título del modal a "Editar Usuario"
      document.getElementById('modalTitle').textContent = 'Editar Usuario';  

      // Realiza una petición GET para obtener los datos del usuario a editar
      fetch(`crud_usuarios.php?action=read&id=${id}`)
      .then(handleResponse)
      .then(data => {
          // Rellena los campos del formulario con los datos del usuario
          document.getElementById("userId").value        = data.user.id || '';
          nombreInput.value      = data.user.nombre || '';
          apPaternoInput.value   = data.user.apPaterno || '';
          apMaternoInput.value   = data.user.apMaterno || '';
          direccionInput.value   = data.user.direccion || '';
          correoInput.value      = data.user.correo || '';
          numTelefonoInput.value = data.user.numTelefono || '';
          document.getElementById("tipoUsuario").value = data.user.tipoUsuario || '';

          // Muestra el modal de usuario para editar
          userModal.style.display = "block";
      })
      .catch(error => {
          console.error('Error:', error);
          Swal.fire('Error', 'Ocurrió un error al cargar el usuario', 'error');
      });
  };

  // Función global para eliminar un usuario
  window.deleteUser = function(id) {
      // Muestra una alerta de confirmación para eliminar el usuario
      Swal.fire({
          title: '¿Estás seguro?',
          text: "¡No podrás revertir esto!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          cancelButtonText: 'Cancelar',
          confirmButtonText: 'Sí, eliminarlo!'
      }).then((result) => {
          if (result.isConfirmed) {
              // Realiza una petición GET para eliminar el usuario con el id especificado
              fetch(`crud_usuarios.php?action=delete&id=${id}`)
              .then(handleResponse)
              .then(data => {
                  if (data.success) {
                      Swal.fire('Eliminado!', 'El usuario ha sido eliminado.', 'success');
                      loadUsers(false);
                  } else {
                      Swal.fire('Error', data.message, 'error');
                  }
              })
              .catch(error => {
                  console.error('Error:', error);
                  Swal.fire('Error', 'Ocurrió un error al eliminar el usuario', 'error');
              });
          }
      });
  };

  // Función global para cambiar la contraseña de un usuario
  window.changePassword = function(id) {
      // Establece el id del usuario en un campo oculto para el formulario de contraseña
      document.getElementById("userIdPassword").value = id;
      // Muestra el modal de cambio de contraseña
      passwordModal.style.display = "flex";
  };

  // Función global para ver los detalles de un usuario
  window.viewUser = function(id) {
      // Obtiene las referencias a los elementos que mostrarán la información del usuario
      const infoModal         = document.getElementById("infoModal");
      const infoNombre        = document.getElementById("infoNombre");
      const infoApPaterno     = document.getElementById("infoApPaterno");
      const infoApMaterno     = document.getElementById("infoApMaterno");
      const infoDireccion     = document.getElementById("infoDireccion");
      const infoCorreo        = document.getElementById("infoCorreo");
      const infoNumTelefono   = document.getElementById("infoNumTelefono");
      const infoTipoUsuario   = document.getElementById("infoTipoUsuario");
      const infoFechaRegistro = document.getElementById("infoFechaRegistro");

      // Realiza una petición GET para obtener los datos del usuario a ver
      fetch(`crud_usuarios.php?action=read&id=${id}`)
      .then(handleResponse)
      .then(data => {
          if (data.user) {
              // Rellena los campos del modal de información con los datos del usuario
              infoNombre.textContent      = data.user.nombre || '';
              infoApPaterno.textContent   = data.user.apPaterno || '';
              infoApMaterno.textContent   = data.user.apMaterno || '';
              infoDireccion.textContent   = data.user.direccion || '';
              infoCorreo.textContent      = data.user.correo || '';
              infoNumTelefono.textContent = data.user.numTelefono || '';
              infoTipoUsuario.textContent = data.user.tipoUsuario || '';
              infoFechaRegistro.textContent = data.user.fechaRegistro || '';
              
              // Muestra el modal de información
              infoModal.style.display = "flex";
          } else {
              Swal.fire('Error', 'No se encontró el usuario.', 'error');
          }
      })
      .catch(error => {
          console.error('Error:', error);
          Swal.fire('Error', 'Ocurrió un error al cargar el usuario', 'error');
      });
  };
} // Fin de la función inicializarGestionUsuarios

