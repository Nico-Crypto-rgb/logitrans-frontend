document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        cargarRutas();
    }
});

async function cargarRutas() {
    const tbody = document.getElementById('listaRutas');
    tbody.innerHTML = '<tr><td colspan="5">Cargando rutas...</td></tr>';

    try {
        // Asegúrate de que esta función exista en tu api.js
        const response = await rutasApi('/rutas', 'GET');
        
        // Manejamos la respuesta (usando .data como en los otros módulos)
        const rutas = response.data || response;
        
        tbody.innerHTML = '';
        
        rutas.forEach(r => {
            // Nota: Si los nombres de los campos son distintos (ej: 'origen_ciudad'),
            // cámbialos aquí abajo.
            tbody.innerHTML += `
                <tr>
                    <td>${r.id}</td>
                    <td>${r.origen}</td>
                    <td>${r.destino}</td>
                    <td>${r.distancia}</td>
                    <td>
                        <button onclick="alert('Editar ID: ${r.id}')">Editar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error al cargar rutas:", error);
        tbody.innerHTML = '<tr><td colspan="5">Error al cargar datos</td></tr>';
    }
}