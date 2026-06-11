import { verificarSesion } from './auth.js';
import { API, apiFetch } from './api.js';

verificarSesion();

let listaVehiculos = [];
const modal = document.getElementById('modal-vehiculo');
const form = document.getElementById('form-vehiculo');

document.addEventListener('DOMContentLoaded', cargarVehiculos);

async function cargarVehiculos() {
    const tbody = document.getElementById('lista-vehiculos');
    try {
        const response = await apiFetch(API.vehiculos, '/vehiculos', { method: 'GET' });
        if (response && response.success) {
            listaVehiculos = response.data;
            tbody.innerHTML = listaVehiculos.map(v => `
                <tr>
                    <td>${v.placa}</td>
                    <td>${v.tipo_vehiculo}</td>
                    <td>${v.capacidad_carga} Ton</td>
                    <td>${v.modelo} / ${v.marca}</td>
                    <td><span class="badge-${v.estado}">${v.estado}</span></td>
                    <td>
                        <button onclick="editarVehiculo(${v.id})">Editar</button>
                        <button onclick="abrirModalEstado(${v.id}, '${v.estado}')">Estado</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (e) { 
        console.error("Error al cargar vehículos:", e); 
    }
}

// Eventos del modal
document.getElementById('btn-nuevo').onclick = () => {
    form.reset();
    // CORRECCIÓN: Limpiamos el ID oculto al crear uno nuevo
    document.getElementById('vehiculo-id').value = ''; 
    document.getElementById('modal-titulo').innerText = "Nuevo Vehículo";
    modal.style.display = 'flex';
};

document.getElementById('btn-cancelar').onclick = () => modal.style.display = 'none';

// Evento de envío de formulario (Guardar / Actualizar)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Obtener el ID si existe (para saber si es actualización o creación)
    const idInput = document.getElementById('vehiculo-id');
    const id = idInput ? idInput.value : null;

    // 2. Obtener datos del formulario
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // 3. Limpieza: Si no hay ID (es creación), eliminamos el campo 'id' del objeto 
    // para no enviarlo al backend y evitar el error 500
    if (!id || id === "") {
        delete data.id;
    }

    // 4. Determinar URL y método HTTP
    const url = id ? `/vehiculos/${id}` : '/vehiculos';
    const method = id ? 'PUT' : 'POST';

    // 5. Preparar la petición
    const opciones = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    };

    // 6. Ejecutar la petición
    try {
        const res = await apiFetch(API.vehiculos, url, opciones);

        if (res && res.success) {
            alert(id ? 'Vehículo actualizado' : 'Vehículo creado');
            modal.style.display = 'none';
            form.reset(); 
            
            // Limpiar el campo oculto de ID después de guardar
            if (idInput) idInput.value = ''; 
            
            cargarVehiculos(); // Actualizar la tabla
        } else {
            console.error("Error del servidor:", res);
            alert('Error al guardar: ' + (res.message || 'Error desconocido'));
        }
    } catch (error) {
        console.error("Error de red:", error);
        alert('No se pudo conectar con el servidor');
    }
});
// Funciones globales (exponemos a window para que los botones las vean)
window.editarVehiculo = (id) => {
    const v = listaVehiculos.find(x => x.id == id);
    if(!v) return;
    
    document.getElementById('vehiculo-id').value = v.id;
    
    // Rellenar formulario
    for(let key in v) {
        const input = form.querySelector(`[name="${key}"]`);
        if(input) input.value = v[key];
    }
    
    document.getElementById('modal-titulo').innerText = "Editar Vehículo";
    modal.style.display = 'flex';
};

window.abrirModalEstado = (id, estado) => {
    document.getElementById('estado-id').value = id;
    document.getElementById('select-estado').value = estado;
    document.getElementById('modal-estado').style.display = 'flex';
};

window.guardarEstado = async () => {
    const id = document.getElementById('estado-id').value;
    const estado = document.getElementById('select-estado').value;
    
    const res = await apiFetch(API.vehiculos, `/vehiculos/${id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado })
    });
    
    if(res && res.success) {
        alert('Estado actualizado');
        document.getElementById('modal-estado').style.display = 'none';
        cargarVehiculos();
    }
};