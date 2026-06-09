// js/auth.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    // Si ya hay token, redirigir al dashboard para no pedir login otra vez
    if (localStorage.getItem('token')) {
        window.location.href = 'pages/dashboard.html';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita que la página recargue
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            // Utilizamos el atajo que creaste en api.js
            // Asumiendo que tu endpoint en PHP Slim es POST /login
            const response = await authApi('/login', 'POST', { email, password });
            
            // Guardamos el token y datos útiles (ajusta según lo que devuelva tu backend)
            localStorage.setItem('token', response.token);
            if(response.usuario) {
                localStorage.setItem('usuario', JSON.stringify(response.usuario));
            }

            // Redirección exitosa
            window.location.href = 'pages/dashboard.html';

        } catch (error) {
            // Muestra el error en la interfaz sin usar console.log o alerts feos
            errorMessage.textContent = error.message;
        }
    });
});