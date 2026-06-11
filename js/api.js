// js/api.js

export const API = {
    auth: 'http://localhost:8001',
    conductores: 'http://localhost:8002',
    vehiculos: 'http://localhost:8003',
    rutas: 'http://localhost:8004',
    viajes: 'http://localhost:8005'
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

        if (response.status === 401) {
            localStorage.clear();
            window.location.href = 'index.html';
            return { success: false, message: 'Sesión no válida' };
        }

        if (response.status === 204) return { success: true };

        return await response.json();
    } catch (error) {
        console.error('Error en petición API:', error);
        return { success: false, message: 'Error de conexión' };
    }
}