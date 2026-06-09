// js/conductores.js

async function cargarConductores() {
    const tbody = document.getElementById('listaConductores');
    tbody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';

    try {
        const conductores = await conductoresApi('/conductores', 'GET');
        
        // --- AGREGA ESTO ---
        console.log("Datos recibidos del API:", conductores);
        if (conductores.length > 0) {
            console.log("Estructura del primer objeto:", conductores[0]);
        }
        // -------------------

        tbody.innerHTML = '';
        conductores.data.forEach(c => { 
    tbody.innerHTML += `
        <tr>
            <td>${c.id}</td>
            <td>${c.nombre}</td>
            <td>${c.licencia}</td>
            <td><button>Editar</button></td>
        </tr>
    `;
});
    } catch (error) {
        console.error("Error:", error);
    }
}

function renderizarTabla(conductores) {
    const tbody = document.getElementById('tabla-conductores');
    tbody.innerHTML = ''; // Limpiar antes de llenar

    conductores.forEach(c => {
        tbody.innerHTML += `
            <tr>
                <td>${c.id}</td>
                <td>${c.nombre}</td>
                <td>${c.licencia}</td>
                <td>
                    <button onclick="editarConductor(${c.id})">Editar</button>
                    <button onclick="eliminarConductor(${c.id})">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Si checkAuth() devuelve true (usuario logueado), ejecutamos la función de carga
    if (checkAuth()) {
        cargarConductores(); // (O cargarVehiculos, cargarRutas, etc, según el archivo)
    }
});