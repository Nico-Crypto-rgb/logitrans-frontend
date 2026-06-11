import { verificarSesion } from './auth.js';
import { API, apiFetch } from './api.js';

// 1. Carga inicial de datos
async function cargarProgramaciones() {
    const response = await apiFetch(API.programacion, '/programacion');

    if (response && response.success) {
        renderizarTabla(response.data);
    } else {
        console.error('Error al cargar:', response?.message);
    }
}

// 2. Renderizar filas en la tabla
// ... dentro de tu función renderizarTabla ...

function renderizarTabla(datos) {
    // Esto debe coincidir exactamente con el ID que pusiste en el HTML
    const tbody = document.getElementById('tabla-programacion'); 
    
    // Si tbody es null, aquí es donde salta el error que ves en consola
    if (!tbody) {
        console.error("Error: No se encontró el elemento con ID 'tabla-programacion' en el HTML.");
        return;
    }

    tbody.innerHTML = ''; // Limpiar tabla antes de llenar

    datos.forEach(prog => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${prog.ruta_id}</td>
            <td>${prog.conductor_id}</td>
            <td>${prog.vehiculo_id}</td>
            <td>${prog.fecha_salida} ${prog.hora_salida}</td>
            <td>${prog.estado}</td>
            <td>
                <button>Editar</button>
                <button>Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 3. Función eliminar
async function eliminarViaje(id) {
    if (!confirm('¿Estás seguro de eliminar esta programación?')) return;

    const response = await apiFetch(API.programacion, `/programacion/${id}`, {
        method: 'DELETE'
    });

    if (response && response.success) {
        alert('Programación eliminada');
        cargarProgramaciones(); // Recargar tabla
    } else {
        alert('Error al eliminar');
    }
}

// 4. Inicialización
document.addEventListener('DOMContentLoaded', () => {
    cargarProgramaciones();
    
    // Listener para el botón nuevo
    document.getElementById('btn-nuevo-viaje').addEventListener('click', () => {
        console.log("Abrir modal de creación aquí");
        // Tu lógica para abrir modal
    });
});