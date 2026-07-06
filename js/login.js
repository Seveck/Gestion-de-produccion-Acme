const form = document.querySelector('.login-form');
const errorMsg = document.getElementById('error');
const URL_BASE = "https://acme-4fa52-default-rtdb.firebaseio.com/";

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.style.color = "red";
    errorMsg.textContent = "";

    const fd = new FormData(form);
    const username = fd.get("username").trim();
    const rol = fd.get("rol");
    const contrasena = fd.get("password");

    try {
        const respuesta = await fetch(`${URL_BASE}usuarios/${username}.json`);
        
        if (!respuesta.ok) {
            errorMsg.textContent = "Error de conexión con la base de datos";
            return;
        }

        const usuario = await respuesta.json();

        if (usuario === null) {
            errorMsg.textContent = "El usuario no se encuentra registrado";
            return;
        }

        if (usuario.contrasena !== contrasena) {
            errorMsg.textContent = "Contraseña incorrecta";
            return;
        }

        if (usuario.rol !== rol) {
            errorMsg.textContent = "El rol seleccionado no coincide";
            return;
        }
        
        localStorage.setItem("user", usuario);

        errorMsg.style.color = "green";
        errorMsg.textContent = "Ingreso exitoso. Redireccionando...";
        form.reset();

        setTimeout(() => {
            window.location.href = 'principal.html';
        }, 1500);

    } catch (error) {
        console.error(error);
        errorMsg.textContent = "Ocurrió un error al intentar iniciar sesión";
    }
});

async function formlogin(usuario) {
    const res = await fetch(`${URL_BASE}usuarios/${username}.json`);
    return await res.json();
}