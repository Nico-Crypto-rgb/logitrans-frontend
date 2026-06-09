async function ejecutarLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('mensajeError');

    try {
        // Asumiendo que authApi está configurado en tu api.js
        const response = await authApi('/login', 'POST', { email, password });

        if (response.token) {
            // Guardamos el token en el navegador
            localStorage.setItem('token', response.token);
            // Redirigimos al dashboard
            window.location.href = 'dashboard.html';
        } else {
            errorMsg.innerText = "Credenciales incorrectas";
        }
    } catch (error) {
        console.error("Error de login:", error);
        errorMsg.innerText = "No se pudo conectar con el servidor de autenticación.";
    }
}