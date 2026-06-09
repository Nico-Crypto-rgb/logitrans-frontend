// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        cargarRutas();
    }
});

// 1. Cargar todas las rutas
async function cargarRutas() {
    const tbody = document.getElementById('listaRutas');
    tbody.innerHTML = '<tr><td colspan="6">Cargando rutas...</td></tr>'; // Actualizado a 6 columnas

    try {
        const respuesta = await rutasApi('/rutas', 'GET'); 
        const rutas = respuesta.data || respuesta;
        renderizarTabla(rutas);
    } catch (error) {
        console.error("Error al cargar rutas:", error);
        tbody.innerHTML = '<tr><td colspan="6">Error al cargar datos</td></tr>';
    }
}

// 2. Renderizar la tabla
function renderizarTabla(rutas) {
    const tbody = document.getElementById('listaRutas');
    tbody.innerHTML = '';
    
    if (rutas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No hay rutas registradas.</td></tr>';
        return;
    }

// En rutas.js - Función renderizarTabla
rutas.forEach(r => {
    tbody.innerHTML += `
        <tr>
            <td>${r.id}</td>
            <td>${r.nombre}</td>
            <td>${r.origen}</td>
            <td>${r.destino}</td>
            <td>${r.distancia_km}</td> <td>
                <button class="btn-icon" onclick="prepararEdicion(${r.id}, '${r.nombre}', '${r.origen}', '${r.destino}', ${r.distancia_km})">Editar</button>
                <button class="btn-icon" onclick="eliminarRuta(${r.id})" style="color: red; margin-left: 5px;">Eliminar</button>
            </td>
        </tr>
    `;
});
}

// 3. Funciones del Modal
function abrirModalCrear() {
    document.getElementById('ruta-id').value = '';
    document.getElementById('ruta-nombre').value = '';
    document.getElementById('ruta-origen').value = '';
    document.getElementById('ruta-destino').value = '';
    document.getElementById('ruta-distancia').value = '';
    document.getElementById('modalCrear').style.display = 'flex';
}

function prepararEdicion(id, nombre, origen, destino, distancia) {
    document.getElementById('ruta-id').value = id;
    document.getElementById('ruta-nombre').value = nombre;
    document.getElementById('ruta-origen').value = origen;
    document.getElementById('ruta-destino').value = destino;
    document.getElementById('ruta-distancia').value = distancia;
    document.getElementById('modalCrear').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modalCrear').style.display = 'none';
}

// En rutas.js - Función guardarRuta
async function guardarRuta() {
    const id = document.getElementById('ruta-id').value;
    const data = {
        nombre: document.getElementById('ruta-nombre').value.trim(),
        origen: document.getElementById('ruta-origen').value.trim(),
        destino: document.getElementById('ruta-destino').value.trim(),
        distancia_km: document.getElementById('ruta-distancia').value.trim()
    };

    // --- CORRECCIÓN AQUÍ ---
    // Cambiamos 'data.distancia' por 'data.distancia_km'
    if (!data.nombre || !data.origen || !data.destino || !data.distancia_km) {
        alert("Por favor completa todos los campos.");
        return;
    }
    // -----------------------

    try {
        if (id) {
            await rutasApi(`/rutas/${id}`, 'PUT', data);
            alert("Ruta actualizada");
        } else {
            await rutasApi('/rutas', 'POST', data);
            alert("Ruta creada");
        }
        cerrarModal();
        cargarRutas();
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("No se pudo guardar la ruta.");
    }
}

// 5. Eliminar
async function eliminarRuta(id) {
    if (confirm("¿Estás seguro de eliminar esta ruta?")) {
        try {
            await rutasApi(`/rutas/${id}`, 'DELETE');
            alert("Ruta eliminada");
            cargarRutas();
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("No se pudo eliminar la ruta.");
        }
    }
}