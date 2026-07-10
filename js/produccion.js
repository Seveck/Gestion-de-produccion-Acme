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
                    <li><a href="produccion.html" class="active">Producción</a></li>
                    <li><a href="inventario.html">Inventario</a></li>
                </ul>
            </nav>
        `;
    }
}
customElements.define('nav-acme', NavAcme);

verificarSesion();

const URL = "https://acme-4fa52-default-rtdb.firebaseio.com/";
const form = document.getElementById('registroProduccion');
const tabla = document.getElementById('tablaProduccionBody');
const errorMsg = document.getElementById('errorProduccion');
const selectProd = document.getElementById('productoAFabricar');
const txtReceta = document.getElementById('textoReceta');
const inputCantidad = document.getElementById('cantidadProduccion');
const cuadroReceta = document.getElementById('cuadroReceta');

let inventarioGlobal = {};

const RECETAS = {
    "PT-GALLETA": { 
        nombre: "Galleta de Chips", 
        insumos: { "MP-HARINA": 100, "MP-MANTEQUILLA": 100, "MP-HUEVO": 1 } 
    },
    "PT-PAN": { 
        nombre: "Pan Casero", 
        insumos: { "MP-HARINA": 200, "MP-MANTEQUILLA": 50 } 
    },
    "PT-PASTEL": { 
        nombre: "Pastel de Cumpleaños", 
        insumos: { "MP-HARINA": 500, "MP-MANTEQUILLA": 250, "MP-HUEVO": 5 } 
    }
};

function actualizarTextoReceta() {
    const prodID = selectProd.value;
    if (!RECETAS[prodID]) return;

    let cant = parseInt(inputCantidad.value);
    if (isNaN(cant) || cant < 1) cant = 1;

    const receta = RECETAS[prodID].insumos;
    let texto = "";
    
    for (const idInsumo in receta) {
        const totalInsumo = receta[idInsumo] * cant;
        texto += "- " + idInsumo + ": " + totalInsumo + " u/g totales necesarios<br>";
    }
    txtReceta.innerHTML = texto;
}

selectProd.addEventListener('change', () => {
    cuadroReceta.classList.remove('hidden-element');
    actualizarTextoReceta();
});

inputCantidad.addEventListener('input', () => {
    actualizarTextoReceta();
});

async function cargarSelectProductos() {
    try {
        const res = await fetch(URL + "productos.json");
        inventarioGlobal = await res.json() || {};
        
        selectProd.innerHTML = '<option value="" disabled selected>Seleccione un producto</option>';
        
        for (const id in RECETAS) {
            selectProd.innerHTML += '<option value="' + id + '">' + RECETAS[id].nombre + '</option>';
        }
    } catch (err) {
        console.error("Error al cargar productos", err);
    }
}

document.getElementById('btnNuevaProduccion').addEventListener('click', () => {
    inputCantidad.value = 1; 
    cargarSelectProductos().then(() => {
        document.getElementById('modalProduccion').style.display = "flex";
    });
});

document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('modalProduccion').style.display = "none";
    form.reset();
    txtReceta.innerHTML = "";
    cuadroReceta.classList.add('hidden-element');
    errorMsg.textContent = "";
});

async function cargarHistorial() {
    try {
        const res = await fetch(URL + "produccion.json");
        const datos = await res.json();
        tabla.innerHTML = ""; 
        
        if (datos) {
            const llavesOrdenadas = Object.keys(datos).reverse();
            for (const id of llavesOrdenadas) {
                if (id === "undefined" || id === "error" || !datos[id]) continue;
                
                const r = datos[id];
                const producto = r.productoTerminado || "Desconocido";
                const cantidad = r.cantidadFabricada || 0;
                const resumen = r.resumenMateriaPrima || "Sin detalles";
                const usuario = r.usuario || "N/A";
                const fecha = r.fecha || "N/A";

                tabla.innerHTML += "<tr><td><strong>#" + id + "</strong></td><td>" + producto + "</td><td>" + cantidad + " u</td><td>" + resumen + "</td><td>" + usuario + "</td><td>" + fecha + "</td></tr>";
            }
        }
    } catch (err) {
        console.error("Error al cargar el historial:", err);
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";
    
    const usuarioActivo = localStorage.getItem("user");
    const fechaActual = new Date().toLocaleString("es-CO");
    const prodID = selectProd.value;
    const cant = parseInt(inputCantidad.value);

    if (!RECETAS[prodID]) return;

    const receta = RECETAS[prodID].insumos;

    for (const id in receta) {
        const necesitaTotal = receta[id] * cant;
        if (!inventarioGlobal[id] || inventarioGlobal[id].cantidad < necesitaTotal) {
            errorMsg.textContent = "Falta stock de " + id + ". Necesitas: " + necesitaTotal + " y tienes: " + (inventarioGlobal[id] ? inventarioGlobal[id].cantidad : 0);
            return;
        }
    }

    let resumen = "";
    for (const id in receta) {
        const gastado = receta[id] * cant;
        inventarioGlobal[id].cantidad = inventarioGlobal[id].cantidad - gastado;
        resumen += id + ": -" + gastado + " | ";
        
        await fetch(URL + "productos/" + id + ".json", { 
            method: 'PUT', 
            body: JSON.stringify(inventarioGlobal[id]) 
        });
    }

    if (!inventarioGlobal[prodID]) {
        inventarioGlobal[prodID] = { 
            codigo: prodID, 
            nombreProducto: RECETAS[prodID].nombre, 
            type: "Producto Terminado", 
            cantidad: 0 
        };
    }
    inventarioGlobal[prodID].cantidad = inventarioGlobal[prodID].cantidad + cant;
    
    await fetch(URL + "productos/" + prodID + ".json", { 
        method: 'PUT', 
        body: JSON.stringify(inventarioGlobal[prodID]) 
    });

    const resHist = await fetch(URL + "produccion.json");
    const hist = await resHist.json() || {};
    const nuevoID = Object.keys(hist).length + 1;

    const orden = { 
        fecha: fechaActual,
        usuario: usuarioActivo,
        productoTerminado: RECETAS[prodID].nombre, 
        cantidadFabricada: cant, 
        resumenMateriaPrima: resumen 
    };
    
    await fetch(URL + "produccion/" + nuevoID + ".json", { 
        method: 'PUT', 
        body: JSON.stringify(orden) 
    });

    document.getElementById('modalProduccion').style.display = "none";
    form.reset();
    txtReceta.innerHTML = "";
    cuadroReceta.classList.add('hidden-element');
    cargarHistorial();
});

document.getElementById('btnSalir').addEventListener('click', cerrarSesion);
cargarHistorial();