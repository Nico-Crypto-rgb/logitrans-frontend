// js/auth.js
import { API, apiFetch } from './api.js';

// --- FUNCIONES PARA EXPORTAR ---
export function verificarSesion() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    return true;
}

export function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

// --- LÓGICA DEL FORMULARIO ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    // js/auth.js (dentro del event listener del submit)
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Leemos el nuevo campo email
    // js/auth.js
// ... dentro de tu event listener ...

    const emailInput = document.getElementById('email').value;
    const passwordInput = document.getElementById('password').value;

    const response = await apiFetch(API.auth, '/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            login: emailInput, // <--- CAMBIA 'email' POR 'login' AQUÍ
            password: passwordInput
        })
    });

// ... resto del código ...

    if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        window.location.href = 'dashboard.html';
    } else {
        // Si hay un error, lo mostramos
        alert(response.message || 'Error al iniciar sesión');
    }
});
}