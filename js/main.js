import { verificarSesion, cerrarSesion } from "./authentication.js";

class NavAcme extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = `
            <nav>
                <h4>ACME</h4>
                <ul>
                    <li><a href="principal.html" class="active">Principal</a></li>
                    <li><a href="produccion.html">Producción</a></li>
                    <li><a href="inventario.html">Inventario</a></li>
                </ul>
            </nav>
        `;
    }
}
customElements.define('nav-acme', NavAcme);

verificarSesion();

const URL_BASE = "https://acme-4fa52-default-rtdb.firebaseio.com/";
const form = document.getElementById('registroUsuarios');
const tablaBody = document.getElementById('tablaUsuariosBody');
const errorMsg = document.getElementById('error');
const btnGuardar = document.getElementById('btnGuardar');
const formTitulo = document.getElementById('form-titulo');
const inputUsername = document.getElementById('username');

const modal = document.getElementById('modalUsuario');
const btnNuevoUsuario = document.getElementById('btnNuevoUsuario');
const btnCerrarModal = document.querySelector('.close-modal');

let editando = false;

function abrirModal() {
    modal.style.display = "flex";
}

function cerrarModal() {
    modal.style.display = "none";
    form.reset();
    inputUsername.disabled = false;
    errorMsg.textContent = "";
    formTitulo.textContent = "Registro de usuarios";
    btnGuardar.textContent = "Guardar Usuario";
    editando = false;
}

btnNuevoUsuario.addEventListener('click', abrirModal);
btnCerrarModal.addEventListener('click', cerrarModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) cerrarModal();
});

async function cargarUsuarios() {
    try {
        const respuesta = await fetch(`${URL_BASE}usuarios.json`);
        const usuarios = await respuesta.json();
        tablaBody.innerHTML = "";

        if (usuarios) {
            Object.keys(usuarios).forEach(id => {
                const u = usuarios[id];
                if (!u) return;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${u.username}</td>
                    <td>${u.nombre}</td>
                    <td>${u.rol}</td>
                    <td class="actions-cell">
                        <button class="btn-edit" data-id="${u.username}">Editar</button>
                        <button class="btn-delete" data-id="${u.username}">Eliminar</button>
                    </td>
                `;
                tablaBody.appendChild(tr);
            });

            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', (e) => prepararEdicion(e.target.dataset.id, usuarios));
            });

            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', (e) => eliminarUsuario(e.target.dataset.id));
            });
        }
    } catch (error) {
        console.error("Error al cargar usuarios:", error);
    }
}

function prepararEdicion(username, usuarios) {
    const u = usuarios[username];
    if (!u) return;

    document.getElementById('nombre').value = u.nombre;
    inputUsername.value = u.username;
    inputUsername.disabled = true; 
    document.getElementById('cargo').value = u.rol;
    document.getElementById('password').value = u.contrasena;

    formTitulo.textContent = "Modificar usuario";
    btnGuardar.textContent = "Actualizar Usuario";
    editando = true;
    abrirModal();
}

async function eliminarUsuario(username) {
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario con identificación ${username}?`)) {
        try {
            const respuesta = await fetch(`${URL_BASE}usuarios/${username}.json`, {
                method: 'DELETE'
            });

            if (respuesta.ok) {
                cargarUsuarios();
            } else {
                alert("Error al intentar eliminar el usuario");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        }
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";

    const fd = new FormData(form);
    const username = inputUsername.value.trim();
    const nombre = fd.get("nombre");
    const rol = fd.get("rol");
    const contrasena = fd.get("password");

    const datos = { username, nombre, rol, contrasena };

    try {
        if (!editando) {
            const respuestaCheck = await fetch(`${URL_BASE}usuarios/${username}.json`);
            const usuarioExistente = await respuestaCheck.json();
            if (usuarioExistente !== null) {
                errorMsg.textContent = "El número de identificación ya está registrado";
                return;
            }
        }

        const respuestaSave = await fetch(`${URL_BASE}usuarios/${username}.json`, {
            method: 'PUT',
            body: JSON.stringify(datos),
            headers: { 'Content-Type': 'application/json' }
        });

        if (respuestaSave.ok) {
            cerrarModal();
            cargarUsuarios();
        } else {
            errorMsg.textContent = "Error al guardar en la base de datos";
        }
    } catch (error) {
        console.error(error);
        errorMsg.textContent = "Error de conexión con el servidor";
    }
});

const btn_salir = document.getElementById('btnSalir');
if (btn_salir) {
    btn_salir.addEventListener('click', () => {
        cerrarSesion();
    });
}

cargarUsuarios();