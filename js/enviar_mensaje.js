// ====================================================
// Lista de palabras obscenas
// ====================================================
// Esta lista contiene palabras que se consideran inapropiadas o no permitidas.
// Se utiliza para evitar que el usuario ingrese contenido ofensivo en el formulario.
const palabrasObscenas = ['APAÑAR', 'ARRABALERA', 'ASESINAR', 'ASESINO', 'ASSHOLE', 'BABOSA', 'BEARNER', 'BITCH', 'BLOWJOB', 'BOCATUBO', 
    'BOLUDO', 'BUBIS', 'CABRON', 'CACHAPERAS', 'CAGADA', 'CAGANTE', 'CAGAR', 'CAGON', 'CARAJO', 'CHINGA TU MADRE', 
    'CHINGADA', 'CHINGADAS', 'CHINGADAZO', 'CHINGADERA', 'CHINGADO', 'CHINGADOS', 'CHINGAR', 'CHINGASAVEINTE', 
    'CHIRINGANDO', 'CHUPABOLAS', 'CHUPAMEDIDAS', 'CLITORIS', 'COCAINA', 'COHECHO', 'COJO', 'COJONES', 'COLOFOX', 
    'COÑO', 'COOK', 'CULADOTE', 'CULEADA', 'CULERA', 'CULERISIMO', 'CULERO', 'CULO', 'CULOTE', 'DICK', 'DROGAS', 
    'DU BISET EIN WEIBCHEN', 'DUMBASS', 'ENVERGADO', 'ESTUPIDO', 'ESVASTICA', 'FACISMO', 'FAGGOT', 'FLIGIO DI PUTANA', 
    'FODASE (JODASE)', 'FOLLADOR', 'FOLLADOTA', 'FOLLAR', 'FORNICAR', 'FRIGGIN', 'FRIJOLERO', 'FUCK', 'FUCKER', 
    'FUCKIN', 'GARANTIA', 'GARGAJO', 'GILIPOLLAS', 'GOLFA', 'GUBERNAMENTAL', 'GÜEVO', 'HIJODEPUTA', 'HORE', 'HUEVON', 
    'HUEVUDO', 'IJUEPUTA', 'INMIGRANTES', 'JACK OFF', 'JETON', 'JODER', 'JOTO', 'JUEZ', 'KU KLUX KLAN', 'LADRONES', 
    'LAMEHUEVOS', 'LEGIONARIO', 'LENON', 'MAMADA', 'MAMADOTA', 'MAMAR', 'MAMERTO', 'MAMON', 'MANFLORA', 'MARICA', 
    'MARICON', 'MARIGUANA', 'MARIMACHO', 'MENTECATO', 'MERDA', 'MERDE', 'MIERDA', 'MIERDOTA', 'MOTHEFUCKER', 
    'MUERDE ALMOHADAS', 'NARCO', 'NAZISMO', 'NECROFILIA', 'OJETE', 'OPIO', 'PANOCHA', 'PANOCHON', 'PASON', 'PEDO', 
    'PELOTUDO', 'PENDEJA', 'PENDEJAZO', 'PENDEJETE', 'PENDEJISIMA', 'PENDEJISIMO', 'PENDEJO', 'PERVERSO', 'PHAT ASS', 
    'PINCHE', 'PINCHES', 'PINCHISIMA', 'PINCHISIMO', 'PIPE', 'PIRUJA', 'PITO', 'PITOTE', 'POOP', 'PUCHA', 'PUSSY', 
    'PUTA', 'PUTERA', 'PUTISIMA', 'PUTISIMO', 'PUTITA', 'PUTITO', 'PUTO', 'PUTODEMIERDA', 'PUTON', 'PUTOTA', 'PUTOTE', 
    'RACK', 'RAMERAS', 'RATERO', 'RATONEAR', 'SADICO', 'SHIT', 'SHON DES WEIBCHENS', 'SICARIO', 'SUASTICA', 'SUICIDIO', 
    'TACHA', 'TARADO', 'TONTEJO', 'TRAGALECHE', 'VERGA', 'VERGAMOTA', 'VERGASOS', 'VERGASTE', 'VERGOTA', 'VERGOTOTOTA', 
    'VERGUITA', 'VERIJA', 'VERIJON', 'WEY', 'WHIMPY', 'ZORRIPUTA', 'ABORRECER', 'AHORCADO', 'AHORCAR', 'AMPUTAR', 
    'ANIQUILAR', 'ANO', 'APENDEJAR', 'APUÑALAR', 'ASESINATO', 'ASESINOS', 'ASFIXIAR', 'ASHOLE', 'ASHOLES', 'ASSHOLES', 
    'ATENTADO', 'BELTRAN LEYVA', 'BIN LADEN', 'BLOWJOBS', 'CAGATINTA', 'CAMPO DE CONCENTRACION', 'CHAPO', 'CHINGADAZOS', 
    'CHINGADERAS', 'CHINGADÍSIMO', 'CHINGADÍSIMOS', 'CHINGARSE', 'CHINGARSES', 'CHINGO', 'CHUPAMEDIAS', 'COÑOS', 
    'CULADERO', 'CULAZO', 'CULEADO', 'CULEARSE', 'CULEARSES', 'CULEI', 'CULEIS', 'CULERÍSIMO', 'CULERÍSIMOS', 'CULEROS', 
    'CULÍSIMO', 'CULÍSIMOS', 'CULOS', 'DICKS', 'DROGA', 'ESVASTICAS', 'GENOCIDIO', 'GUBERNAMENTALES', 'GUERRA', 'HITLER', 
    'HOLOCAUSTO', 'MALCOGIDA', 'MALDITA', 'MALDITO', 'MALDOSO', 'MALPARIDO', 'MARIHUANA', 'MUTILAR', 'NARCOTRAFICO', 
    'NAZI', 'ODIO', 'OSAMA', 'OSSAMA', 'PENDEJADA', 'PENDEJAS', 'PENDEJEAR', 'PENDEJERA', 'PENDEJITA', 'PENDEJITAS', 
    'PENDEJITO', 'PENDEJITOS', 'PENDEJOS', 'PEPAZO', 'PERESOZA', 'PERESOZOS', 'PEREZOSAS', 'PEREZOSO', 'PERSECUCIÓN', 
    'PROSTITUCIÓN', 'PUCHAS', 'PUNJETAS', 'PUÑETA', 'PUÑETAS', 'PUÑETERIA', 'PUSSYS', 'PUTAMADRE', 'PUTAMADRES', 
    'PUTARRÓN', 'PUTAS', 'PUTATIVO', 'PUTAZO', 'PUTAZOS', 'PUTEADA', 'PUTEAR', 'PUTEARS', 'PUTEARSE', 'PUTEARSES', 
    'PUTERIAS', 'PUTERIO', 'PUTESA', 'PUTIFERA', 'PUTIMAS', 'PUTIN', 'PUTÍSIMAS', 'PUTÍSIMOS', 'PUTITAS', 'PUTÓN', 
    'PUTOS', 'QULO', 'RE-PUTA', 'RE-PUTAS', 'SICARIOS', 'SIDOSO', 'SIDOSOS', 'SIFILÍTICO', 'SIFILÍTICOS', 
    'SOCIALDEMOCRACIA', 'SOCIALISTA', 'SOHN DES WEIBCHENS', 'SOPLANUCAS', 'SUASTICAS', 'SUICIDIOS', 'TERRORISMO', 
    'TERRORISTA', 'TESTICULOS', 'VAGINA', 'ABUSAR', 'AGRAVIAR', 'AGREDIR', 'AMATAR', 'ASALTAR', 'ASESINARS', 'BIOLAR', 
    'DAÑAR', 'GOLPEAR', 'HERIR', 'INSULTAR', 'INSULTO', 'LASTIMAR', 'MALTRATAR', 'MATAR', 'MATARS', 'OFENDER', 
    'VIOLACIÓN', 'VIOLAR', 'CACA', 'kk', 'PTO', 'NALGA', 'HDPM']; // Se pueden agregar más palabras según sea necesario

// ====================================================
// Función para validar el formulario
// ====================================================
// Esta función valida los campos "nombre", "correo" y "mensaje" usando expresiones regulares
// y comprueba que no contengan palabras obscenas.
function validarFormulario() {
// Se obtienen los valores de los campos eliminando espacios al inicio y al final
var nombre = document.getElementById('nombre').value.trim();
var correo = document.getElementById('correo').value.trim();
var mensaje = document.getElementById('mensaje').value.trim();

// ====================================================
// Expresiones regulares para la validación:
// - nombrePattern: Solo permite letras (mayúsculas y minúsculas), acentos y espacios.
// - correoPattern: Valida un formato básico de correo electrónico.
// - mensajePattern: Permite letras, números y algunos caracteres especiales comunes en mensajes.
// ====================================================
var nombrePattern = /^[a-zA-ZÀ-ÿ\s]+$/;
var correoPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
var mensajePattern = /^[a-zA-Z0-9À-ÿ\s.,()¡!¿?\/-]+$/;

// ====================================================
// Validación del campo "nombre"
// Se comprueba que el nombre no esté vacío y que solo contenga los caracteres permitidos.
// ====================================================
if (!nombrePattern.test(nombre) || nombre.length === 0) {
    Swal.fire({
        title: 'Error en el nombre',
        text: 'El nombre solo debe contener letras, espacios y acentos. No puede estar vacío.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#d33'
    });
    return false;
}

// ====================================================
// Validación del campo "correo"
// Se verifica que el correo cumpla con el formato básico definido.
// ====================================================
if (!correoPattern.test(correo)) {
    Swal.fire({
        title: 'Correo inválido',
        text: 'Por favor, ingresa un correo electrónico válido.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#d33'
    });
    return false;
}

// ====================================================
// Validación del campo "mensaje"
// Se comprueba que el mensaje no esté vacío y que solo contenga caracteres permitidos.
// ====================================================
if (!mensajePattern.test(mensaje) || mensaje.length === 0) {
    Swal.fire({
        title: 'Error en el mensaje',
        text: 'El mensaje contiene caracteres no permitidos o está vacío.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#d33'
    });
    return false;
}

// ====================================================
// Verificar que el campo "nombre" no contenga palabras obscenas
// ====================================================
if (contienePalabrasObscenas(nombre)) {
    Swal.fire({
        title: 'Nombre no permitido',
        text: 'El nombre contiene palabras no permitidas.',
        icon: 'warning',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#f39c12'
    });
    return false;
}

// ====================================================
// Verificar que el campo "mensaje" no contenga palabras obscenas
// ====================================================
if (contienePalabrasObscenas(mensaje)) {
    Swal.fire({
        title: 'Mensaje no permitido',
        text: 'El mensaje contiene palabras no permitidas.',
        icon: 'warning',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#f39c12'
    });
    return false;
}

// Si todas las validaciones se cumplen, retorna true para permitir el envío del formulario
return true;
}

// ====================================================
// Función para verificar si un texto contiene palabras obscenas
// ====================================================
// Recorre la lista de palabras obscenas y comprueba si alguna aparece en el texto (ignorando mayúsculas/minúsculas).
function contienePalabrasObscenas(texto) {
for (let palabra of palabrasObscenas) {
    // Convierte ambos textos a minúsculas para hacer una comparación insensible a mayúsculas/minúsculas
    if (texto.toLowerCase().includes(palabra.toLowerCase())) {
        return true; // Si encuentra una coincidencia, retorna true
    }
}
return false; // Si no encuentra ninguna, retorna false
}

// ====================================================
// Función para enviar el formulario mediante AJAX usando Fetch API
// ====================================================
// Esta función se encarga de prevenir el envío por defecto, validar el formulario y enviar los datos al servidor.
function enviarFormulario(event) {
event.preventDefault(); // Evita el envío tradicional del formulario y la recarga de la página

// Solo se envía el formulario si la validación es exitosa
if (validarFormulario()) {
    var form = document.getElementById('formularioContacto'); // Se obtiene el formulario por su ID
    var formData = new FormData(form); // Se crea un objeto FormData con todos los campos del formulario

    // Se envían los datos al servidor mediante una petición POST a "enviar_mensaje.php"
    fetch('enviar_mensaje.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json()) // Se interpreta la respuesta como JSON
    .then(data => {
        if (data.status === 'success') {
            // Si el servidor devuelve éxito, se muestra una alerta de éxito con SweetAlert
            Swal.fire({
                title: '¡Mensaje Enviado!',
                text: data.message,
                icon: 'success',
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#28a745',
                timer: 3000,  // La alerta se cerrará automáticamente después de 3 segundos
                timerProgressBar: true
            });
            form.reset(); // Se limpia el formulario tras el envío exitoso
        } else {
            // Si el servidor devuelve error, se muestra una alerta con el mensaje correspondiente
            Swal.fire({
                title: 'Error',
                text: data.message,
                icon: 'error',
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#d33'
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // En caso de error en la conexión, se muestra una alerta informativa
        Swal.fire({
            title: 'Error de Conexión',
            text: 'Hubo un problema al conectar con el servidor.',
            icon: 'error',
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#d33'
        });
    });
}
}

// ====================================================
// Asignación del evento "submit" al formulario al cargar el documento
// ====================================================
document.addEventListener('DOMContentLoaded', function() {
var form = document.getElementById('formularioContacto'); // Se obtiene el formulario por su ID
// Se asigna la función "enviarFormulario" al evento "submit" del formulario
form.addEventListener('submit', enviarFormulario);
});
