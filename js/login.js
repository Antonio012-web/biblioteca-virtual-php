// Cuando todo el DOM haya sido cargado completamente, se ejecuta la función callback
document.addEventListener('DOMContentLoaded', function() {
    // Obtiene la referencia al campo de entrada del nombre de usuario mediante su id "username"
    const usernameInput = document.getElementById('username');
    // Obtiene la referencia al campo de entrada de la contraseña mediante su id "password"
    const passwordInput = document.getElementById('password');
    // Obtiene el elemento donde se mostrará el mensaje de error para el nombre de usuario
    const usernameError = document.getElementById('usernameError');
    // Obtiene el elemento donde se mostrará el mensaje de error para la contraseña
    const passwordError = document.getElementById('passwordError');
    // Obtiene el formulario de inicio de sesión mediante su id "loginForm"
    const form = document.getElementById('loginForm');

    // Asigna un evento 'input' al campo de nombre de usuario para validar su contenido en tiempo real
    usernameInput.addEventListener('input', validateUsername);
    // Asigna un evento 'input' al campo de contraseña para validar su contenido en tiempo real
    passwordInput.addEventListener('input', validatePassword);

    // Al enviar el formulario se valida que ambos campos sean correctos
    form.addEventListener('submit', function(event) {
        // Si alguna validación falla, se previene el envío del formulario
        if (!validateUsername() || !validatePassword()) {
            event.preventDefault();
        }
    });

    // Función que valida el campo de nombre de usuario
    function validateUsername() {
        // Obtiene el valor del campo y elimina espacios al inicio y al final
        const username = usernameInput.value.trim();
        // Si el nombre de usuario tiene menos de 3 caracteres...
        if (username.length < 3) {
            // Se establece el mensaje de error correspondiente en el elemento usernameError
            usernameError.textContent = 'El nombre de usuario debe tener al menos 3 caracteres.';
            // Se hace visible el mensaje de error
            usernameError.style.display = 'block';
            // Se agrega la clase 'invalid' al contenedor del campo para marcar visualmente el error
            usernameInput.parentElement.classList.add('invalid');
            // Retorna false para indicar que la validación falló
            return false;
        } else {
            // Si la validación es exitosa, se limpia el mensaje de error
            usernameError.textContent = '';
            // Se oculta el mensaje de error
            usernameError.style.display = 'none';
            // Se elimina la clase 'invalid' del contenedor del campo
            usernameInput.parentElement.classList.remove('invalid');
            // Retorna true para indicar que la validación fue exitosa
            return true;
        }
    }

    // Función que valida el campo de contraseña
    function validatePassword() {
        // Obtiene el valor del campo de contraseña y elimina espacios al inicio y final
        const password = passwordInput.value.trim();
        // Si la contraseña tiene menos de 6 caracteres...
        if (password.length < 6) {
            // Se establece el mensaje de error correspondiente en el elemento passwordError
            passwordError.textContent = 'La contraseña debe tener al menos 6 caracteres.';
            // Se hace visible el mensaje de error
            passwordError.style.display = 'block';
            // Se agrega la clase 'invalid' al contenedor del campo para indicar el error
            passwordInput.parentElement.classList.add('invalid');
            // Retorna false para indicar que la validación falló
            return false;
        } else {
            // Si la contraseña cumple la longitud mínima, se limpia el mensaje de error
            passwordError.textContent = '';
            // Se oculta el mensaje de error
            passwordError.style.display = 'none';
            // Se elimina la clase 'invalid' del contenedor del campo
            passwordInput.parentElement.classList.remove('invalid');
            // Retorna true para indicar que la validación fue exitosa
            return true;
        }
    }
});
