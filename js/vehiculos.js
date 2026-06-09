document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        cargarVehiculos();
    }
});

async function cargarVehiculos() {
    const tbody = document.getElementById('listaVehiculos');
    tbody.innerHTML = '<tr><td colspan="5">Cargando vehículos...</td></tr>';

    try {
        // Llamada al microservicio de vehículos definido en api.js
        const response = await vehiculosApi('/vehiculos', 'GET');
        
        // Asumimos que, como en el caso anterior, la lista viene en 'data'
        const vehiculos = response.data || response;
        
        tbody.innerHTML = '';
        
        vehiculos.forEach(v => {
            // Nota: Si los nombres de los campos en tu DB son diferentes 
            // (ej: 'placa_vehiculo' en vez de 'placa'), cámbialos aquí.
            tbody.innerHTML += `
                <tr>
                    <td>${v.id}</td>
                    <td>${v.placa}</td>
                    <td>${v.marca}</td>
                    <td>${v.estado}</td>
                    <td>
                        <button onclick="alert('Editar ID: ${v.id}')">Editar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error al cargar vehículos:", error);
        tbody.innerHTML = '<tr><td colspan="5">Error al cargar datos</td></tr>';
    }
}