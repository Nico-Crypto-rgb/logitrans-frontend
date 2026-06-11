import { API, apiFetch } from './api.js';

const tbody = document.getElementById('tbodyProgramacion');
const modal = document.getElementById('modalProgramacion');
const form = document.getElementById('formProgramacion');

// Cargar todas las programaciones
async function cargarProgramacion() {
    const response = await apiFetch(API.programacion, '/programacion');
    if (response.success) {
        renderTable(response.data);
    } else {
        tbody.innerHTML = '<tr><td colspan="7">Error al cargar datos.</td></tr>';
    }
}

// Dibujar tabla
function renderTable(data) {
    tbody.innerHTML = '';
    data.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.id}</td>
                <td>${item.ruta_id}</td>
                <td>${item.conductor_id}</td>
                <td>${item.vehiculo_id}</td>
                <td>${item.fecha_salida} ${item.hora_salida}</td>
                <td>${item.estado}</td>
                <td>
                    <button onclick="prepararEdicion(${item.id})">Editar</button>
                    <button class="btn-danger" onclick="eliminarProgramacion(${item.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

// Guardar (Crear o Actualizar)
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('progId').value;
    const payload = {
        ruta_id: document.getElementById('ruta_id').value,
        conductor_id: document.getElementById('conductor_id').value,
        vehiculo_id: document.getElementById('vehiculo_id').value,
        fecha_salida: document.getElementById('fecha_salida').value,
        hora_salida: document.getElementById('hora_salida').value,
        fecha_estimada_llegada: document.getElementById('fecha_estimada_llegada').value,
        observaciones: document.getElementById('observaciones').value
    };

    const method = id ? 'PUT' : 'POST';
    const endpoint = id ? `/programacion/${id}` : '/programacion';

    const response = await apiFetch(API.programacion, endpoint, {
        method: method,
        body: JSON.stringify(payload)
    });

    if (response.success) {
        alert('Operación exitosa');
        toggleModal(false);
        cargarProgramacion();
    } else {
        alert('Error: ' + (response.message || 'No se pudo guardar'));
    }
});

// Editar - Prepara el modal con datos
window.prepararEdicion = async (id) => {
    const response = await apiFetch(API.programacion, `/programacion/${id}`);
    if (response.success) {
        const d = response.data;
        document.getElementById('progId').value = d.id;
        document.getElementById('ruta_id').value = d.ruta_id;
        document.getElementById('conductor_id').value = d.conductor_id;
        document.getElementById('vehiculo_id').value = d.vehiculo_id;
        document.getElementById('fecha_salida').value = d.fecha_salida;
        document.getElementById('hora_salida').value = d.hora_salida;
        document.getElementById('fecha_estimada_llegada').value = d.fecha_estimada_llegada;
        document.getElementById('observaciones').value = d.observaciones || '';
        
        document.getElementById('modalTitle').innerText = 'Editar Programación';
        toggleModal(true);
    }
};

// Eliminar
window.eliminarProgramacion = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta programación?')) {
        const response = await apiFetch(API.programacion, `/programacion/${id}`, { method: 'DELETE' });
        if (response.success) {
            cargarProgramacion();
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
        document.getElementById('progId').value = '';
        document.getElementById('modalTitle').innerText = 'Nueva Programación';
        toggleModal(true);
    });
    
    document.getElementById('btnCancelar').addEventListener('click', () => toggleModal(false));
    cargarProgramacion();
});