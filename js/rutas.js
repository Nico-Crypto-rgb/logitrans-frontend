import { API, apiFetch } from './api.js';

const tbody = document.getElementById('tbodyRutas');
const modal = document.getElementById('modalRuta');
const form = document.getElementById('formRuta');

// Cargar todas las rutas
async function cargarRutas() {
    const response = await apiFetch(API.rutas, '/rutas');
    if (response.success) {
        renderTable(response.data);
    } else {
        tbody.innerHTML = '<tr><td colspan="6">Error al cargar rutas.</td></tr>';
    }
}

// Dibujar tabla
function renderTable(data) {
    tbody.innerHTML = '';
    data.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.id}</td>
                <td>${item.ciudad_origen}</td>
                <td>${item.ciudad_destino}</td>
                <td>${item.distancia} km</td>
                <td>${item.tiempo_estimado}</td>
                <td>
                    <button onclick="prepararEdicion(${item.id})">Editar</button>
                    <button class="btn-danger" onclick="eliminarRuta(${item.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

// Guardar (Crear o Actualizar)
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('rutaId').value;
    const payload = {
        ciudad_origen: document.getElementById('ciudadOrigen').value,
        ciudad_destino: document.getElementById('ciudadDestino').value,
        distancia: document.getElementById('distancia').value,
        tiempo_estimado: document.getElementById('tiempoEstimado').value,
        observaciones: document.getElementById('observaciones').value
    };

    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `/rutas/${id}` : '/rutas';

    const response = await apiFetch(API.rutas, endpoint, {
        method: method,
        body: JSON.stringify(payload)
    });

    if (response.success) {
        alert('Operación exitosa');
        toggleModal(false);
        cargarRutas();
    } else {
        alert('Error: ' + (response.message || 'No se pudo guardar'));
    }
});

// Editar - Prepara el modal con datos
window.prepararEdicion = async (id) => {
    const response = await apiFetch(API.rutas, `/rutas/${id}`);
    if (response.success) {
        const d = response.data;
        document.getElementById('rutaId').value = d.id;
        document.getElementById('ciudadOrigen').value = d.ciudad_origen;
        document.getElementById('ciudadDestino').value = d.ciudad_destino;
        document.getElementById('distancia').value = d.distancia;
        document.getElementById('tiempoEstimado').value = d.tiempo_estimado;
        document.getElementById('observaciones').value = d.observaciones || '';
        document.getElementById('modalTitle').innerText = 'Editar Ruta';
        toggleModal(true);
    }
};

// Eliminar
window.eliminarRuta = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta ruta?')) {
        const response = await apiFetch(API.rutas, `/rutas/${id}`, { method: 'DELETE' });
        if (response.success) {
            cargarRutas();
        } else {
            alert('Error al eliminar');
        }
    }
};

// Helpers
function toggleModal(show) {
    modal.style.display = show ? 'flex' : 'none';
    if (!show) form.reset();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btnNuevo').addEventListener('click', () => {
        document.getElementById('rutaId').value = '';
        document.getElementById('modalTitle').innerText = 'Nueva Ruta';
        toggleModal(true);
    });
    
    document.getElementById('btnCancelar').addEventListener('click', () => toggleModal(false));
    cargarRutas();
});