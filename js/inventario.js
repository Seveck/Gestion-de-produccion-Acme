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
                    <li><a href="principal.html">Principal</a></li>
                    <li><a href="produccion.html">Producción</a></li>
                    <li><a href="inventario.html" class="active">Inventario</a></li>
                </ul>
            </nav>
        `;
    }
}
customElements.define('nav-acme', NavAcme);

verificarSesion();

const URL_BASE = "https://acme-4fa52-default-rtdb.firebaseio.com/";
const form = document.getElementById('registroProductos');
const tablaBody = document.getElementById('tablaProductosBody');
const errorMsg = document.getElementById('error');
const selectTipo = document.getElementById('tipo');
const modal = document.getElementById('modalProducto');
const buscador = document.getElementById('buscador');

let editando = false;

function abrirModal() { modal.style.display = "flex"; }
function cerrarModal() { 
    modal.style.display = "none"; 
    form.reset(); 
    document.getElementById('codigo').disabled = false;
    errorMsg.textContent = "";
    editando = false;
}

document.getElementById('btnNuevoProducto').addEventListener('click', abrirModal);
document.querySelector('.close-modal').addEventListener('click', cerrarModal);

async function cargarInventario() {
    try {
        const res = await fetch(URL_BASE + "productos.json");
        const productos = await res.json();
        tablaBody.innerHTML = "";

        if (productos) {
            for (const id in productos) {
                if (id === "undefined" || id === "error" || !productos[id]) continue;
                const p = productos[id];
                
                const tr = document.createElement('tr');
                tr.innerHTML = "<td><strong>" + id + "</strong></td><td>" + p.nombreProducto + "</td><td>" + p.tipo + "</td><td>" + p.cantidad + " u</td><td><button class='btn-edit' data-id='" + id + "'>Editar</button> <button class='btn-delete' data-id='" + id + "'>Eliminar</button></td>";
                tablaBody.appendChild(tr);
            }

            document.querySelectorAll('.btn-edit').forEach(b => b.addEventListener('click', (e) => prepararEdicion(e.target.dataset.id, productos)));
            document.querySelectorAll('.btn-delete').forEach(b => b.addEventListener('click', (e) => eliminarItem(e.target.dataset.id)));
        }
    } catch (error) {
        console.error(error);
    }
}

function prepararEdicion(id, productos) {
    const p = productos[id];
    document.getElementById('codigo').value = id;
    document.getElementById('codigo').disabled = true;
    document.getElementById('nombreProducto').value = p.nombreProducto;
    selectTipo.value = p.tipo;
    document.getElementById('cantidad').value = p.cantidad;

    editando = true;
    abrirModal();
}

async function eliminarItem(id) {
    if (confirm("¿Eliminar " + id + "?")) {
        await fetch(URL_BASE + "productos/" + id + ".json", { method: 'DELETE' });
        cargarInventario();
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";

    const codigo = document.getElementById('codigo').value.trim().toUpperCase();
    const nombreProducto = document.getElementById('nombreProducto').value.trim();
    const tipo = selectTipo.value;
    const cantidad = parseInt(document.getElementById('cantidad').value);

    const datos = { codigo: codigo, nombreProducto: nombreProducto, tipo: tipo, cantidad: cantidad };

    try {
        if (!editando) {
            const check = await fetch(URL_BASE + "productos/" + codigo + ".json");
            const existe = await check.json();
            if (existe !== null) {
                errorMsg.textContent = "El código ya existe.";
                return;
            }
        }

        await fetch(URL_BASE + "productos/" + codigo + ".json", {
            method: 'PUT',
            body: JSON.stringify(datos),
            headers: { 'Content-Type': 'application/json' }
        });

        cerrarModal();
        cargarInventario();
    } catch (err) {
        errorMsg.textContent = "Error de conexión.";
    }
});

buscador.addEventListener('input', () => {
    const texto = buscador.value.toLowerCase();
    const filas = tablaBody.getElementsByTagName('tr');

    for (let i = 0; i < filas.length; i++) {
        const textoFila = filas[i].textContent.toLowerCase();
        if (textoFila.indexOf(texto) > -1) {
            filas[i].style.display = '';
        } else {
            filas[i].style.display = 'none';
        }
    }
});

document.getElementById('btnSalir').addEventListener('click', cerrarSesion);
cargarInventario();