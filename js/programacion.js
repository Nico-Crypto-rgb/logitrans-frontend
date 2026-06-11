import { API, apiFetch } from './api.js';

const tablaBody = document.getElementById('lista-programaciones');
const form = document.getElementById('form-programacion');
const modal = document.getElementById('modal-programacion');

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', cargarProgramaciones);

async function cargarProgramaciones() {
    const response = await apiFetch(API.viajes, '/programacion');
    if (response.success) {
        renderizarTabla(response.data);
    }
}

function renderizarTabla(data) {
    tablaBody.innerHTML = '';
    data.forEach(item => {
        const row = `<tr>
            <td>${item.ruta_id}</td>
            <td>${item.conductor_id}</td>
            <td>${item.vehiculo_id}</td>
            <td>${item.fecha_salida}</td>
            <td><span class="badge badge-${item.estado}">${item.estado}</span></td>
            <td>
                <button onclick="eliminar(${item.id})">Eliminar</button>
            </td>
        </tr>`;
        tablaBody.insertAdjacentHTML('beforeend', row);
    });
}

// Manejo del formulario
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        ruta_id: document.getElementById('ruta_id').value,
        conductor_id: document.getElementById('conductor_id').value,
        vehiculo_id: document.getElementById('vehiculo_id').value,
        fecha_salida: document.getElementById('fecha_salida').value,
        fecha_estimada_llegada: document.getElementById('fecha_salida').value, // Simplificado para el ejemplo
        hora_salida: "08:00:00"
    };

    const res = await apiFetch(API.viajes, '/programacion', {
        method: 'POST',
        body: JSON.stringify(data)
    });

    if (res.success) {
        alert('Programado con éxito');
        cerrarModal();
        cargarProgramaciones();
    }
});

// Funciones globales para botones
window.abrirModal = () => modal.style.display = 'flex';
window.cerrarModal = () => modal.style.display = 'none';
window.eliminar = async (id) => {
    if (confirm('¿Seguro que deseas eliminar?')) {
        await apiFetch(API.viajes, `/programacion/${id}`, { method: 'DELETE' });
        cargarProgramaciones();
    }
};