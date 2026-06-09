// js/viajes.js
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        cargarViajes(); // Cambia 'cargarConductores' por 'cargarViajes'
    }

    
    // Eventos del modal
    document.getElementById('btnNuevoViaje').addEventListener('click', abrirModalViaje);
    document.getElementById('btnCerrarModal').addEventListener('click', cerrarModal);
    
    document.getElementById('formViaje').addEventListener('submit', async (e) => {
        e.preventDefault();
        await guardarViaje();
    });
});

// --- CARGA CONCURRENTE DE CATÁLOGOS ---
async function cargarCatalogosFormulario() {
    const selectConductor = document.getElementById('id_conductor');
    const selectVehiculo = document.getElementById('id_vehiculo');
    const selectRuta = document.getElementById('id_ruta');

    try {
        // Ejecuta las 3 peticiones al backend en paralelo
        const [conductores, vehiculos, rutas] = await Promise.all([
    conductoresApi('/conductores', 'GET'),
    vehiculosApi('/vehiculos', 'GET'),
    rutasApi('/rutas', 'GET')
]);

        // Poblar Conductores
        selectConductor.innerHTML = '<option value="">-- Seleccione Conductor --</option>';
        conductores.forEach(c => {
            selectConductor.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
        });

        // Poblar Vehículos
        selectVehiculo.innerHTML = '<option value="">-- Seleccione Vehículo --</option>';
        vehiculos.forEach(v => {
            selectVehiculo.innerHTML += `<option value="${v.id}">${v.placa}</option>`;
        });

        // Poblar Rutas
        selectRuta.innerHTML = '<option value="">-- Seleccione Ruta --</option>';
        rutas.forEach(r => {
            selectRuta.innerHTML += `<option value="${r.id}">${r.ciudad_origen} a ${r.ciudad_destino}</option>`;
        });

    } catch (error) {
        console.error("Error al cargar datos foráneos:", error);
        alert("Hubo un problema de conexión con uno de los microservicios.");
    }
}

// --- FUNCIONES CRUD DE VIAJES ---
async function cargarViajes() {
    const tbody = document.getElementById('listaViajes');
    
    // Mostramos estado de carga
    tbody.innerHTML = '<tr><td colspan="6">Cargando viajes...</td></tr>';

    try {
        // 1. Hacemos la llamada
        const respuesta = await viajesApi('/viajes', 'GET');
        console.log("Respuesta del API:", respuesta); // <--- ESTO ES CRUCIAL

        // 2. Verificamos que realmente tenemos datos
        if (!respuesta || !Array.isArray(respuesta)) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay datos válidos o formato incorrecto.</td></tr>';
            return;
        }

        // 3. Asignamos a la variable que usaremos en el loop
        const viajes = respuesta; 
        tbody.innerHTML = '';

        // 4. Ahora sí, hacemos el loop
        // ... dentro del forEach en cargarViajes
viajes.forEach(viaje => {
    let claseEstado = viaje.estado === 'Finalizado' ? 'badge-active' : 
                      (viaje.estado === 'Cancelado' ? 'badge-inactive' : 'badge');
                      
    tbody.innerHTML += `
        <tr>
            <td>${viaje.id}</td>
            <td>Programación #${viaje.programacion_id}</td>
            <td>${viaje.ubicacion_actual || 'Sin ubicación'}</td>
            <td>${viaje.fecha_salida || 'N/A'}</td>
            <td><span class="badge ${claseEstado}">${viaje.estado}</span></td>
            <td>
                <button onclick="cambiarEstado(${viaje.id})" class="btn-icon">Actualizar</button>
            </td>
        </tr>
    `;
});
const botones = document.querySelectorAll('.btn-actualizar');

botones.forEach(btn => {
    btn.addEventListener('click', () => {
        const idViaje = btn.getAttribute('data-id');
        cambiarEstado(idViaje); // Llamamos a tu función de actualización
    });
});
    } catch (error) {
        console.error("Error al obtener viajes:", error);
        tbody.innerHTML = `<tr><td colspan="6" class="error-text">Error de conexión: ${error.message}</td></tr>`;
    }
}

async function guardarViaje() {
    // Asegúrate de que los IDs coincidan con los 'name' o 'id' de tus <select> en HTML
    const payload = {
        conductor_id: document.getElementById('id_conductor').value,
        vehiculo_id: document.getElementById('id_vehiculo').value,
        ruta_id: document.getElementById('id_ruta').value,
        fecha_salida: document.getElementById('fecha_salida').value + ' ' + document.getElementById('hora_salida').value + ':00',
        fecha_llegada_estimada: document.getElementById('fecha_llegada').value + ' 00:00:00',
        observaciones: document.getElementById('observaciones').value
    };

    try {
        // Enviar al microservicio de viajes
        await viajesApi('/viajes', 'POST', payload);
        alert('Viaje programado con éxito');
        cerrarModal();
        cargarViajes(); // Refrescar la tabla
    } catch (error) {
        alert('Error al guardar: ' + error.message);
    }
}

// --- MANEJO DEL MODAL ---
function abrirModalViaje() {
    document.getElementById('formViaje').reset();
    cargarCatalogosFormulario(); // Cargamos los selects solo cuando se abre el modal
    document.getElementById('modalViaje').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modalViaje').style.display = 'none';
}

async function cambiarEstado(id) {
    const confirmacion = confirm("¿Estás seguro de marcar este viaje como finalizado?");
    
    if (confirmacion) {
        try {
            const payload = { estado: "finalizado" };
            await viajesApi(`/viajes/${id}`, 'PUT', payload);
            alert("Estado actualizado con éxito");
            cargarViajes(); // Recargamos la tabla
        } catch (error) {
            console.error("Error al actualizar:", error);
            alert("No se pudo actualizar el estado.");
        }
    }
}

// Escuchamos clics en el cuerpo de la tabla
document.getElementById('listaViajes').addEventListener('click', function(event) {
    // Verificamos si el clic fue en un botón con la clase 'btn-actualizar'
    if (event.target.classList.contains('btn-actualizar')) {
        const id = event.target.getAttribute('data-id');
        cambiarEstado(id); // Llamamos a tu función
    }
});

// Función para cargar las opciones en los desplegables
async function cargarOpcionesFormulario() {
    try {
        const [conductores, vehiculos, rutas] = await Promise.all([
            conductoresApi('/conductores', 'GET'),
            vehiculosApi('/vehiculos', 'GET'),
            rutasApi('/rutas', 'GET')
        ]);

        const selConductor = document.getElementById('selectConductor');
        const selVehiculo = document.getElementById('selectVehiculo');
        const selRuta = document.getElementById('selectRuta');

        // Limpiamos y llenamos (asumiendo que vienen en .data)
        conductores.data.forEach(c => selConductor.innerHTML += `<option value="${c.id}">${c.nombre}</option>`);
        vehiculos.data.forEach(v => selVehiculo.innerHTML += `<option value="${v.id}">${v.placa}</option>`);
        rutas.data.forEach(r => selRuta.innerHTML += `<option value="${r.id}">${r.origen} a ${r.destino}</option>`);

    } catch (error) {
        console.error("Error cargando opciones:", error);
    }
}

// Función para crear el viaje
async function guardarViaje(event) {
    event.preventDefault(); // Evita que la página se recargue

    const data = {
        conductor_id: document.getElementById('selectConductor').value,
        vehiculo_id: document.getElementById('selectVehiculo').value,
        ruta_id: document.getElementById('selectRuta').value,
        fecha_salida: document.getElementById('fechaSalida').value
    };

    try {
        await viajesApi('/viajes', 'POST', data);
        alert("Viaje programado con éxito");
        cargarViajes(); // Recargamos la tabla para ver el nuevo viaje
    } catch (error) {
        alert("Error al guardar: " + error.message);
    }
}

// Vincula esto en tu DOMContentLoaded
// document.getElementById('btnGuardar').addEventListener('click', guardarViaje);

async function actualizarEstadoViaje(id) {
    try {
        // Enviamos un objeto con el nuevo estado
        await viajesApi(`/viajes/${id}`, 'PUT', { estado: 'finalizado' });
        alert("Viaje actualizado a finalizado");
        cargarViajes(); // Refrescamos tabla
    } catch (error) {
        alert("Error al actualizar: " + error.message);
    }
}

async function cargarCatalogosFormulario() {
    try {
        // Obtenemos los datos de la API
        const resConductores = await conductoresApi('/conductores', 'GET');
        const resVehiculos = await vehiculosApi('/vehiculos', 'GET');
        const resRutas = await rutasApi('/rutas', 'GET');

        // IMPORTANTE: Los IDs aquí coinciden exactamente con tu HTML
        const selConductor = document.getElementById('id_conductor');
        const selVehiculo = document.getElementById('id_vehiculo');
        const selRuta = document.getElementById('id_ruta');

        // Validamos que existan antes de modificar
        if (!selConductor || !selVehiculo || !selRuta) {
            console.error("Error: No se encontraron los selects. Verifica los IDs en el HTML.");
            return;
        }

        // Limpiamos y llenamos
        selConductor.innerHTML = '<option value="">-- Seleccione Conductor --</option>';
        selVehiculo.innerHTML = '<option value="">-- Seleccione Vehículo --</option>';
        selRuta.innerHTML = '<option value="">-- Seleccione Ruta --</option>';

        if (resConductores.data) {
            resConductores.data.forEach(c => {
                selConductor.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
            });
        }

        if (resVehiculos.data) {
            resVehiculos.data.forEach(v => {
                selVehiculo.innerHTML += `<option value="${v.id}">${v.placa}</option>`;
            });
        }

        if (resRutas.data) {
            resRutas.data.forEach(r => {
                selRuta.innerHTML += `<option value="${r.id}">${r.origen} a ${r.destino}</option>`;
            });
        }

    } catch (error) {
        console.error("Error al cargar datos:", error);
    }
}