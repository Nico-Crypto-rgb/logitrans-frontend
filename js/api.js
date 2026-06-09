// ============================================================
// api.js — Cliente central corregido
// ============================================================

const API = {
  auth:        'http://localhost:8001',
  conductores: 'http://localhost:8002',
  vehiculos:   'http://localhost:8003',
  rutas:       'http://localhost:8004',
  viajes:      'http://localhost:8005',
};

async function request(baseUrl, path, method = 'GET', body = null) {
  const token = localStorage.getItem('token');

  const headers = {
    'Accept': 'application/json'
  };

  if (body !== null && body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
    mode: 'cors'
  };

  if (body !== null && body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const fullUrl = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;

  try {
      const response = await fetch(fullUrl, options);

      // Si el servidor responde 401, no tenemos autorización
      if (response.status === 401) {
        console.warn("Sesión expirada o no autorizada");
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        
        // Ajuste: Redirige al login, sin importar dónde esté el usuario
        window.location.href = '/pages/login.html'; 
        throw new Error('No autorizado');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error en la solicitud');
      }

      return data;
  } catch (error) {
      console.error("Error en petición a:", fullUrl, error);
      throw error;
  }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/pages/login.html';
}

function checkAuth() {
    if (!localStorage.getItem('token')) {
        window.location.href = '/pages/login.html';
        return false;
    }
    return true;
}

// Atajos por microservicio
const authApi       = (path, method, body) => request(API.auth,        path, method, body);
const conductoresApi = (path, method, body) => request(API.conductores, path, method, body);
const vehiculosApi  = (path, method, body) => request(API.vehiculos,   path, method, body);
const rutasApi      = (path, method, body) => request(API.rutas,       path, method, body);
const viajesApi     = (path, method, body) => request(API.viajes,      path, method, body);