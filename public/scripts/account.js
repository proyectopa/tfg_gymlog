

const formulario = document.querySelector('form')
const emailError = document.querySelector('.email.error')
const passwordError = document.querySelector('.password.error')

formulario.addEventListener('submit', function(event) {
    event.preventDefault()
    emailError.textContent = ''
    passwordError.textContent = ''
    
})


const btnActualizarEmail = document.querySelector('#actualizar-email')
const btnActualizarContrasena = document.querySelector('#actualizar-contrasena')

btnActualizarContrasena.addEventListener('click', async function() {
    let password = document.querySelector('#input-password').value
    try {
        const response = await fetch(`/update-account-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })

        });
        
        if (!response.ok) {
            let data = await response.json()
            passwordError.textContent = data.errors.password
            throw new Error('Error al actualizar la contraseña');
        }
        
        // eliminar sesión, redirigir /home
        // window.location.href = '/account';
        
        document.querySelector('#input-password').value = ""
        showToast('Éxito', 'Tu contraseña se ha actualizado correctamente')
    } catch (error) {
        showToast('Error', 'Ha habido un error al cambiar tu contraseña')
        // Mostrar un mensaje de error al usuario
    }

})



btnActualizarEmail.addEventListener('click', async function() {
    
    let email = document.querySelector('#input-email').value.toLowerCase()
    try {
        const response = await fetch(`/update-account-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })

        });
        
        if (!response.ok) {
            let data = await response.json()
            emailError.textContent = data.errors.email
            throw new Error('Error al actualizar el correo');
        }
        
        // eliminar sesión, redirigir /home
        // window.location.href = '/account';
        
        document.querySelector('#input-email').placeholder = email
        document.querySelector('#input-email').value = ""

        showToast('Éxito', 'Tu correo se ha actualizado correctamente')

    } catch (error) {
        showToast('Error', 'Ha habido un error al cambiar tu correo')
        // Mostrar un mensaje de error al usuario
    }

})











let myToast;

document.addEventListener('DOMContentLoaded', () => {
    const myToastEl = document.getElementById('myToast');
    myToast = new bootstrap.Toast(myToastEl, {
        autohide: true,
        delay: 5000
    });
    
    
    myToastEl.querySelector('.btn-close').addEventListener('click', () => {
        myToast.hide();
    });
});

function showToast(title, message) {
    document.getElementById('toastTitle').innerText = title;
    document.getElementById('toastBody').innerText = message;
    myToast.show();
}





// confirm
// ------------------------

const confirmDeleteButton = document.getElementById('confirmDelete');
const confirmModalElement = document.getElementById('confirmModal');
const confirmModal = new bootstrap.Modal(confirmModalElement);

confirmDeleteButton.addEventListener('click', async function () {
    try {
        const response = await fetch(`/delete-account`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar la cuenta');
        }
        
        // eliminar sesión, redirigir /home
        window.location.href = '/logout';
        
        // Ocultar el modal
        confirmModal.hide();
    } catch (error) {
        showToast('Error', 'Ha habido un error al eliminar la cuenta')
    }
    
});


btnBorrarCuenta = document.querySelector('#eliminar-cuenta')
btnBorrarCuenta.addEventListener('click', function (event) {
    confirmModal.show();
});


