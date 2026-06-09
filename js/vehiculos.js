document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        cargarVehiculos();
    }
});

// 1. Cargar datos
async function cargarVehiculos() {
    const tbody = document.getElementById('listaVehiculos');
    tbody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';

    try {
        const respuesta = await vehiculosApi('/vehiculos', 'GET');
        const vehiculos = respuesta.data || respuesta;
        renderizarTabla(vehiculos);
    } catch (error) {
        console.error("Error al cargar:", error);
        tbody.innerHTML = '<tr><td colspan="5">Error al cargar datos</td></tr>';
    }
}

// 2. Renderizar tabla
function renderizarTabla(vehiculos) {
    const tbody = document.getElementById('listaVehiculos');
    tbody.innerHTML = '';
    
    if (vehiculos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No hay vehículos registrados.</td></tr>';
        return;
    }

    vehiculos.forEach(v => {
        tbody.innerHTML += `
            <tr>
                <td>${v.id}</td>
                <td>${v.placa}</td>
                <td>${v.marca}</td>
                <td>${v.estado}</td>
                <td>
                    <button class="btn-icon" onclick="prepararEdicion(${v.id}, '${v.placa}', '${v.marca}', '${v.estado}')">Editar</button>
                    <button class="btn-icon" onclick="eliminarVehiculo(${v.id})" style="color: red; margin-left: 5px;">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

// 3. Funciones de EDICIÓN
function prepararEdicion(id, placa, marca, estado) {
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-placa').value = placa;
    document.getElementById('edit-marca').value = marca;
    
    // Al ser un select, esto seleccionará automáticamente la opción correcta
    document.getElementById('edit-estado').value = estado; 
    
    document.getElementById('modalEditar').style.display = 'flex';
}

function cerrarModalEditar() {
    document.getElementById('modalEditar').style.display = 'none';
}

async function guardarCambiosVehiculo() {
    const id = document.getElementById('edit-id').value;
    const data = {
        placa: document.getElementById('edit-placa').value.trim(),
        marca: document.getElementById('edit-marca').value.trim(),
        estado: document.getElementById('edit-estado').value.trim()
    };

    try {
        await vehiculosApi(`/vehiculos/${id}`, 'PUT', data);
        alert("Vehículo actualizado correctamente");
        cerrarModalEditar();
        cargarVehiculos();
    } catch (error) {
        console.error("Error al actualizar:", error);
        alert("No se pudo actualizar el vehículo.");
    }
}

// 4. Funciones para CREAR
function abrirModalCrear() {
    document.getElementById('modalCrear').style.display = 'flex';
}

function cerrarModalCrear() {
    document.getElementById('modalCrear').style.display = 'none';
}

async function guardarNuevoVehiculo() {
    const data = {
        placa: document.getElementById('crear-placa').value.trim(),
        marca: document.getElementById('crear-marca').value.trim(),
        tipo: document.getElementById('crear-tipo').value.trim(),
        capacidad_kg: document.getElementById('crear-capacidad').value.trim(),
        modelo: document.getElementById('crear-modelo').value.trim(), // Nuevo campo
        anlo: document.getElementById('crear-anlo').value.trim(),     // Nuevo campo
        estado: 'disponible'
    };

    // Validación básica para asegurar que no enviamos campos vacíos
    if (!data.placa || !data.marca || !data.modelo || !data.anlo) {
        alert("Por favor, completa todos los campos (Placa, Marca, Modelo, Año, Tipo y Capacidad).");
        return;
    }

    try {
        await vehiculosApi('/vehiculos', 'POST', data);
        alert("Vehículo registrado exitosamente");
        
        // Limpiamos los campos después de éxito
        cerrarModalCrear();
        await cargarVehiculos();
    } catch (error) {
        console.error("Error al crear:", error);
        alert("No se pudo registrar el vehículo. Verifica la consola.");
    }
}

// 5. Función ELIMINAR
async function eliminarVehiculo(id) {
    if (confirm("¿Estás seguro de eliminar este vehículo?")) {
        try {
            await vehiculosApi(`/vehiculos/${id}`, 'DELETE');
            alert("Vehículo eliminado");
            cargarVehiculos();
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("No se pudo eliminar el vehículo.");
        }
    }
}