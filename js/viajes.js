import { API, apiFetch } from './api.js';

// Elementos del DOM
const tbody = document.getElementById('tbodySeguimientos');
const modal = document.getElementById('modalSeguimiento');
const form = document.getElementById('formSeguimiento');

// 1. Función principal: Cargar datos

function getEstadoClass(estado) {
    if (!estado) return 'status-default';
    
    // Normalizar el string (por si viene con guiones o guiones bajos)
    const claseBase = estado.toLowerCase().replace('_', '-');
    
    const clases = {
        'en-ruta': 'status-en-ruta',
        'en-transito': 'status-en-ruta',
        'retrasado': 'status-retrasado',
        'inactivo': 'status-inactivo',
        'mantenimiento': 'status-mantenimiento'
    };
    
    return clases[claseBase] || 'status-default';
}


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
        const clase = getEstadoClass(item.estado); // Obtenemos la clase
        
        tbody.innerHTML += `
            <tr>
                <td>${item.id}</td>
                <td>${item.prog_id}</td>
                <td>${item.fecha}</td>
                <td>${item.hora}</td>
                <td><span class="badge ${clase}">${item.estado || 'N/A'}</span></td>
                <td>${item.novedad || '-'}</td>
            </tr>
        `;
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