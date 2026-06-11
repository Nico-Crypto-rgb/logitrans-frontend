import { verificarSesion } from './auth.js';
import { API, apiFetch } from './api.js';

// 1. Proteger la ruta inmediatamente
verificarSesion();

// 2. Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarConductores();
});

function renderizarTabla(conductores) {
    const tbody = document.getElementById('lista-conductores');
    
    if (conductores.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">No hay conductores registrados.</td></tr>`;
        return;
    }

    tbody.innerHTML = conductores.map(c => `
        <tr>
            <td>${c.nombres} ${c.apellidos}</td>
            <td>${c.documento}</td>
            <td>${c.numero_licencia}</td>
            <td><span class="badge-${c.estado}">${c.estado}</span></td>
            <td>
                <button onclick="editarConductor(${c.id})">Editar</button>
                <button onclick="cambiarEstado(${c.id}, '${c.estado}')">Estado</button>
            </td>
        </tr>
    `).join('');
}

// ... (mantiene tu código anterior de carga de tabla)

// Elementos del DOM
const modal = document.getElementById('modal-conductor');
const btnNuevo = document.getElementById('btn-nuevo');
const btnCancelar = document.getElementById('btn-cancelar');
const form = document.getElementById('form-conductor');

// Abrir modal
btnNuevo.addEventListener('click', () => modal.style.display = 'flex');

// Cerrar modal
btnCancelar.addEventListener('click', () => modal.style.display = 'none');

// Guardar datos
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const result = await apiFetch(API.conductores, '/conductores', {
        method: 'POST',
        body: JSON.stringify(data)
    });

    if (result.success) {
        alert('Conductor registrado con éxito');
        modal.style.display = 'none';
        form.reset();
        cargarConductores(); // Recarga la tabla para ver el nuevo registro
    } else {
        alert('Error: ' + (result.message || 'No se pudo guardar'));
    }
});

// Variable global para tener acceso a los datos
let listaConductores = [];

async function cargarConductores() {
    const tbody = document.getElementById('lista-conductores');
    try {
        const response = await apiFetch(API.conductores, '/conductores', { method: 'GET' });
        if (response && response.success) {
            listaConductores = response.data; // Guardamos los datos aquí
            renderizarTabla(listaConductores);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

function editarConductor(id) {
    const conductor = listaConductores.find(c => c.id == id);
    if (!conductor) return;

    // Llenar el formulario
    document.getElementById('conductor-id').value = conductor.id;
    // (Asumo que tus inputs tienen el atributo 'name' igual a las columnas de la BD)
    for (const key in conductor) {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) input.value = conductor[key];
    }

    // Cambiar título y abrir
    document.querySelector('.modal-content h2').innerText = 'Editar Conductor';
    modal.style.display = 'flex';
}

// Modifica el evento 'submit' para que detecte si es crear o editar
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('conductor-id').value;
    const data = Object.fromEntries(new FormData(form));

    const url = id ? `/conductores/${id}` : '/conductores';
    const method = id ? 'PUT' : 'POST';

    const result = await apiFetch(API.conductores, url, {
        method: method,
        body: JSON.stringify(data)
    });

    if (result.success) {
        alert('Operación exitosa');
        modal.style.display = 'none';
        form.reset();
        document.getElementById('conductor-id').value = ''; // Limpiar ID
        cargarConductores();
    }
});

function cambiarEstado(id, estadoActual) {
    document.getElementById('estado-id').value = id;
    document.getElementById('select-estado').value = estadoActual;
    document.getElementById('modal-estado').style.display = 'flex';
}

async function guardarEstado() {
    const id = document.getElementById('estado-id').value;
    const nuevoEstado = document.getElementById('select-estado').value;

    const result = await apiFetch(API.conductores, `/conductores/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: nuevoEstado })
    });

    if (result.success) {
        alert('Estado actualizado');
        document.getElementById('modal-estado').style.display = 'none';
        cargarConductores();
    }
}

// --- Funciones expuestas para los botones de la tabla ---

window.editarConductor = function(id) {
    const conductor = listaConductores.find(c => c.id == id);
    if (!conductor) {
        console.error("No se encontró el conductor con ID:", id);
        return;
    }

    // Llenar el formulario con los datos
    document.getElementById('conductor-id').value = conductor.id;
    // Asumimos que los 'name' de tus inputs coinciden con las claves del objeto conductor
    for (const key in conductor) {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) input.value = conductor[key];
    }

    document.querySelector('.modal-content h2').innerText = 'Editar Conductor';
    modal.style.display = 'flex';
};

window.cambiarEstado = function(id, estadoActual) {
    // Abrir modal de estado
    document.getElementById('estado-id').value = id;
    document.getElementById('select-estado').value = estadoActual;
    document.getElementById('modal-estado').style.display = 'flex';
};

// Asegúrate de tener también la función para guardar el estado del modal
window.guardarEstado = async function() {
    const id = document.getElementById('estado-id').value;
    const nuevoEstado = document.getElementById('select-estado').value;

    const result = await apiFetch(API.conductores, `/conductores/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: nuevoEstado })
    });

    if (result && result.success) {
        alert('Estado actualizado correctamente');
        document.getElementById('modal-estado').style.display = 'none';
        cargarConductores(); // Recargar tabla
    }
};