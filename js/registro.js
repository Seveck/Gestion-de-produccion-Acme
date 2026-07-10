const form = document.querySelector('.login-form');
const errorMsg = document.getElementById('error');
const URL_BASE = "https://acme-4fa52-default-rtdb.firebaseio.com/";

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.style.color = "red";
    errorMsg.textContent = "";

    const fd = new FormData(form);
    const username = fd.get("username").trim();
    const nombre = fd.get("nombre");
    const contrasena = fd.get("password");
    const validarContrasena = fd.get("passwordConfirm");
    const rol = fd.get("rol");

    if (contrasena !== validarContrasena) {
        errorMsg.textContent = "Las contraseñas no coinciden";
        return;
    }

    if (!rol) {
        errorMsg.textContent = "Debe seleccionar un rol";
        return;
    }

    try {
        const respuestaCheck = await fetch(`${URL_BASE}usuarios/${username}.json`);
        
        if (!respuestaCheck.ok) {
            errorMsg.textContent = "Error de permisos en Firebase. Revisa las Reglas (Rules).";
            return;
        }

        const usuarioExistente = await respuestaCheck.json();

        if (usuarioExistente !== null) {
            errorMsg.textContent = "El usuario ya se encuentra registrado";
            return;
        }

        const datos = {
            username: username,
            nombre: nombre,
            contrasena: contrasena,
            rol: rol
        };

        const respuestaRegistro = await fetch(`${URL_BASE}usuarios/${username}.json`, {
            method: 'PUT',
            body: JSON.stringify(datos),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        localStorage.setItem("user", usuario.nombre);

        if (respuestaRegistro.ok) {
            errorMsg.style.color = "green";
            errorMsg.textContent = "Registrado con éxito. Redireccionando...";
            form.reset();
            
            setTimeout(() => {
                window.location.href = 'principal.html';
            }, 1500);
        } else {
            errorMsg.textContent = "Error al intentar guardar en la base de datos";
        }

    } catch (error) {
        console.error(error);
        errorMsg.textContent = "Ocurrió un error de conexión con el servidor";
    }
});