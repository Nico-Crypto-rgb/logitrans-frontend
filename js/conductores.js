// 1. Cargar los datos desde la API
async function cargarConductores() {
    try {
        const url = `/conductores?cache_bust=${new Date().getTime()}`;
        const respuesta = await conductoresApi(url, 'GET');
        
        console.log("Respuesta fresca de la API:", respuesta);
        const lista = Array.isArray(respuesta) ? respuesta : (respuesta.data || []);
        
        renderizarTabla(lista);
    } catch (error) {
        console.error("Error al cargar:", error);
    }
}

// 2. Renderizar la tabla y asignar eventos
function renderizarTabla(conductores) {
    const tbody = document.getElementById('listaConductores');
    tbody.innerHTML = '';
    
    if (conductores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No hay conductores registrados.</td></tr>';
        return;
    }

    conductores.forEach(c => {
        tbody.innerHTML += `
            <tr>
                <td>${c.id}</td>
                <td>${c.nombre}</td>
                <td>${c.licencia}</td>
                <td>
                    <button class="btn-icon" onclick="prepararEdicion(${c.id}, '${c.nombre}', '${c.licencia}')">Editar</button>
                    <button class="btn-icon" onclick="eliminarConductor(${c.id})" style="color: red; margin-left: 5px;">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

// 3. Funciones para EDICIÓN
function prepararEdicion(id, nombre, licencia) {
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-nombre').value = nombre;
    document.getElementById('edit-licencia').value = licencia;
    document.getElementById('modalEditar').style.display = 'flex';
}

function cerrarModalEditar() {
    document.getElementById('modalEditar').style.display = 'none';
}

async function guardarCambiosConductor() {
    const id = document.getElementById('edit-id').value;
    const nombre = document.getElementById('edit-nombre').value.trim();
    const licencia = document.getElementById('edit-licencia').value.trim();

    if (!id || !nombre || !licencia) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    try {
        const respuesta = await conductoresApi(`/conductores/${id}`, 'PUT', { nombre, licencia });
        if (respuesta) {
            alert("Conductor actualizado correctamente");
            cerrarModalEditar();
            await cargarConductores(); 
        }
    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo actualizar el conductor.");
    }
}

// 4. Funciones para CREAR (Nuevo)
function abrirModalCrear() {
    document.getElementById('modalCrear').style.display = 'flex';
}

function cerrarModalCrear() {
    document.getElementById('modalCrear').style.display = 'none';
}

async function guardarNuevoConductor() {
    const nuevoConductor = {
        nombre: document.getElementById('crear-nombre').value.trim(),
        cedula: document.getElementById('crear-cedula').value.trim(),
        licencia: document.getElementById('crear-licencia').value.trim(),
        telefono: document.getElementById('crear-telefono').value.trim(),
        estado: 'disponible'
    };

    if (!nuevoConductor.nombre || !nuevoConductor.cedula || !nuevoConductor.licencia) {
        alert("Nombre, Cédula y Licencia son obligatorios.");
        return;
    }

    try {
        const respuesta = await conductoresApi('/conductores', 'POST', nuevoConductor);
        if (respuesta) {
            alert("Conductor creado exitosamente");
            cerrarModalCrear();
            await cargarConductores();
        }
    } catch (error) {
        console.error("Error al crear:", error);
        alert("No se pudo registrar el conductor.");
    }
}

// 5. Función para ELIMINAR
async function eliminarConductor(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar este conductor? Esta acción no se puede deshacer.")) {
        return;
    }

    try {
        await conductoresApi(`/conductores/${id}`, 'DELETE');
        alert("Conductor eliminado correctamente");
        await cargarConductores();
    } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Hubo un error al intentar eliminar.");
    }
}

// 6. Inicialización
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        cargarConductores();
    }
});