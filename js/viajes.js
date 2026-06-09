document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        cargarViajes();
    }

    // Eventos del modal
    document.getElementById('btnNuevoViaje').addEventListener('click', abrirModalViaje);
    document.getElementById('btnCerrarModal').addEventListener('click', cerrarModal);
    
    // AQUÍ ESTABA EL ERROR: Vinculamos el formulario correctamente
    const formViaje = document.getElementById('formViaje');
    formViaje.addEventListener('submit', guardarViaje);
});

// --- FUNCIONES CRUD DE VIAJES ---
async function cargarViajes() {
    const tbody = document.getElementById('listaViajes');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="5">Cargando viajes...</td></tr>';

    try {
        const respuesta = await viajesApi('/viajes', 'GET');
        const viajes = Array.isArray(respuesta) ? respuesta : (respuesta.data || []);
        
        tbody.innerHTML = ''; // Limpiamos el "Cargando..."

        if (viajes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay viajes programados.</td></tr>';
            return;
        }

        // Construimos una variable con todas las filas para evitar errores en el bucle
        let filas = '';

viajes.forEach(viaje => {
    // 1. Obtenemos el valor de la BD y lo limpiamos
    const estadoDB = (viaje.estado || 'programado').toLowerCase().trim();

    // 2. Definimos una función o lógica que mapee el valor de la BD al valor del <option>
    // Esto asegura que, sin importar cómo se guarde en la BD, se seleccione la opción correcta
    const isSelected = (valorOpcion) => {
        // Normalizamos el valor de la opción para comparar
        const valorNormalizado = valorOpcion.toLowerCase().replace(' ', '_');
        return estadoDB === valorNormalizado ? 'selected' : '';
    };

    filas += `
    <tr>
        <td>${viaje.id || 'N/A'}</td>
        <td>${viaje.programacion_id || 'N/A'}</td>
        <td>${viaje.fecha_inicio || 'N/A'}</td>
        <td>
            <select onchange="actualizarEstado(${viaje.id}, this.value)" class="form-select">
                <option value="programado" ${estadoDB === 'programado' ? 'selected' : ''}>Programado</option>
                <option value="en_transito" ${estadoDB === 'en_transito' ? 'selected' : ''}>En tránsito</option>
                <option value="finalizado" ${estadoDB === 'finalizado' ? 'selected' : ''}>Finalizado</option>
                <option value="cancelado" ${estadoDB === 'cancelado' ? 'selected' : ''}>Cancelado</option>
            </select>
        </td>
    </tr>`;
});

        // Insertamos todo de golpe
        tbody.innerHTML = filas;

    } catch (error) {
        console.error("Error al obtener viajes:", error);
        tbody.innerHTML = `<tr><td colspan="5" class="error-text">Error al cargar datos.</td></tr>`;
    }
}

// --- GUARDAR VIAJE (CORREGIDO) ---
async function guardarViaje(event) {
    if (event) event.preventDefault();

    // 1. Obtener el token (asumiendo que lo guardaste como 'token' al hacer login)
    const token = localStorage.getItem('token'); 

    // 2. Captura de datos
    const payload = {
        programacion_id: document.getElementById('programacion_id').value,
        estado: 'programado',
        ubicacion_actual: null,
        observaciones: document.getElementById('observaciones').value,
        fecha_inicio: document.getElementById('fecha_salida').value,
        fecha_fin: document.getElementById('fecha_llegada').value
    };

    // 3. Envío al servidor con autenticación
    try {
        const response = await fetch('http://localhost:8005/viajes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // AQUÍ ESTÁ LA CORRECCIÓN: Agregamos el token
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        // Verificamos si la respuesta no es 200/201
        if (!response.ok) {
            // Si el error es 401, es problema de autenticación
            if (response.status === 401) {
                alert("Tu sesión ha expirado o no tienes permisos. Por favor, inicia sesión de nuevo.");
                window.location.href = 'login.html'; // O redirigir a donde tengas tu login
                return;
            }
            throw new Error('Error en el servidor: ' + response.status);
        }

        alert("Viaje guardado correctamente");
        location.reload(); 
    } catch (error) {
        console.error("Error:", error);
        alert("Hubo un error al guardar.");
    }
}

// --- CARGA DE CATÁLOGOS PARA EL FORMULARIO ---
// Busca donde tengas esta parte y asegúrate de añadir la validación Array.isArray
async function cargarCatalogosFormulario() {
    try {
        // Obtenemos los tres catálogos a la vez
        const [conductores, vehiculos, rutas] = await Promise.all([
            conductoresApi('/conductores', 'GET'),
            vehiculosApi('/vehiculos', 'GET'),
            rutasApi('/rutas', 'GET')
        ]);

        // Función auxiliar para llenar los selects
        const llenarSelect = (idSelect, data, campoTexto) => {
            const select = document.getElementById(idSelect);
            if (!select) return;
            
            // Limpiamos y añadimos opción por defecto
            select.innerHTML = '<option value="">-- Seleccione --</option>';
            
            // Aseguramos que sea array
            const lista = Array.isArray(data) ? data : (data.data || []);
            
            lista.forEach(item => {
                select.innerHTML += `<option value="${item.id}">${item[campoTexto]}</option>`;
            });
        };

        // Llenamos los selects (Asegúrate de que 'nombre', 'placa' y 'nombre_ruta' existan en tus objetos)
        llenarSelect('id_conductor', conductores, 'nombre'); // Cambia 'nombre' si tu API usa otro nombre
        llenarSelect('id_vehiculo', vehiculos, 'placa');     // Cambia 'placa' si tu API usa otro nombre
        llenarSelect('id_ruta', rutas, 'nombre_ruta');       // Cambia 'nombre_ruta' según corresponda

    } catch (error) {
        console.error("Error al cargar catálogos:", error);
        alert("Error al cargar los datos del formulario.");
    }
}

// --- MANEJO DEL MODAL ---
function abrirModalViaje() {
    document.getElementById('formViaje').reset();
    cargarCatalogosFormulario(); // Cargamos los datos frescos cada vez que se abre
    document.getElementById('modalViaje').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modalViaje').style.display = 'none';
}

async function cambiarEstado(id) {
    if (confirm("¿Marcar viaje como finalizado?")) {
        try {
            await viajesApi(`/viajes/${id}`, 'PUT', { estado: 'finalizado' });
            cargarViajes();
        } catch (error) {
            alert("No se pudo actualizar.");
        }
    }
}

async function actualizarEstado(id, nuevoEstado) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`http://localhost:8005/viajes/${id}`, {
            method: 'PUT', // O 'PATCH' dependiendo de lo que espere tu backend
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (!response.ok) {
            throw new Error('No se pudo actualizar el estado');
        }

        alert("Estado actualizado a: " + nuevoEstado);
        // Opcional: recargar la tabla para reflejar cambios reales
        // cargarViajes(); 
    } catch (error) {
        console.error("Error:", error);
        alert("Error al actualizar el estado.");
    }
}