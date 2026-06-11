import { API, apiFetch } from './api.js';

// Elementos del DOM
const tbody = document.getElementById('tbodySeguimientos');
const modal = document.getElementById('modalSeguimiento');
const form = document.getElementById('formSeguimiento');

// 1. Función principal: Cargar datos
async function cargarSeguimientos() {
    const filterId = document.getElementById('inputFilter').value;
    let endpoint = '/seguimientos';

    if (filterId) {
        endpoint = `/seguimientos/programacion/${filterId}`;
    }

    const data = await apiFetch(API.viajes, endpoint);
    
    if (data && !data.error) {
        renderTable(data);
    } else {
        tbody.innerHTML = '<tr><td colspan="6">No se encontraron registros.</td></tr>';
    }
}

// 2. Renderizado de tabla
function renderTable(data) {
    tbody.innerHTML = '';
    
    data.forEach(item => {
        const estadoClase = `bg-${item.estado.replace(' ', '-')}`;
        
        const row = `
            <tr>
                <td>${item.id}</td>
                <td>${item.programacion_viaje_id}</td>
                <td>${item.fecha}</td>
                <td>${item.hora}</td>
                <td><span class="badge ${estadoClase}">${item.estado}</span></td>
                <td>${item.novedad || '-'}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// 3. Gestión del Modal
function toggleModal(show) {
    modal.style.display = show ? 'flex' : 'none';
}

// 4. Guardar datos
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const payload = {
        programacion_viaje_id: document.getElementById('formProgId').value,
        estado: document.getElementById('formEstado').value,
        novedad: document.getElementById('formNovedad').value
    };

    const response = await apiFetch(API.viajes, '/seguimientos', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

    if (response.success) {
        alert('Seguimiento guardado con éxito');
        toggleModal(false);
        form.reset();
        cargarSeguimientos();
    } else {
        alert('Error: ' + (response.error || 'No se pudo guardar'));
    }
});

// Inicialización de eventos (Aquí corregimos el error)
document.addEventListener('DOMContentLoaded', () => {
    // Escuchar botón buscar
    document.getElementById('btnBuscar').addEventListener('click', cargarSeguimientos);
    
    // Escuchar botón nuevo
    document.getElementById('btnNuevo').addEventListener('click', () => toggleModal(true));
    
    // Escuchar botón cancelar
    document.getElementById('btnCancelar').addEventListener('click', () => toggleModal(false));

    // Carga inicial
    cargarSeguimientos();
});