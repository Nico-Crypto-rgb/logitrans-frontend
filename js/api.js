// js/api.js

// js/api.js
export const API = {
    auth: 'http://localhost:8001',
    conductores: 'http://localhost:8002',
    vehiculos: 'http://localhost:8003',
    rutas: 'http://localhost:8004',
    programacion: 'http://localhost:8004', // <--- NUEVA ENTRADA CORRECTA
    viajes: 'http://localhost:8005'        // <--- Mantenemos viajes en 8005
};

export async function apiFetch(baseUrl, endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const config = {
        ...options,
        headers: { ...headers, ...options.headers }
    };

    try {
        const response = await fetch(`${baseUrl}${endpoint}`, config);

        // 1. Manejo de error 401
        if (response.status === 401) {
            localStorage.clear();
            window.location.href = 'index.html';
            return { success: false, message: 'Sesión no válida' };
        }

        // 2. Manejo de 204 (No content)
        if (response.status === 204) return { success: true };

        // 3. NUEVO: Verificar si la respuesta es OK (status 200-299)
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error en servidor (${response.status}):`, errorText);
            return { success: false, message: `Error ${response.status}: La petición falló` };
        }

        return await response.json();
    } catch (error) {
        console.error('Error de conexión:', error);
        return { success: false, message: 'Error de conexión' };
    }
}