// 1. Esperamos a que todo el HTML esté cargado
document.addEventListener("DOMContentLoaded", function () {
  // 2. Seleccionamos los elementos que vamos a usar
  const loginForm = document.getElementById("login-form");
  const loginButton = document.getElementById("login-button");
  const alertContainer = document.getElementById("login-alert-container");

  // 3. Añadimos el "listener" al formulario
  loginForm.addEventListener("submit", async function (event) {
    // 4. Prevenimos que la página se recargue
    event.preventDefault();

    const formData = new FormData();
    formData.append("correo", document.getElementById("emailLogin").value);
    formData.append("contrasena", document.getElementById("phoneLogin").value);

    // 5. Limpiamos errores anteriores y desactivamos el botón
    alertContainer.innerHTML = "";
    loginButton.disabled = true;
    loginButton.textContent = "Iniciando...";

    try {
      // 8. Hacemos el FETCH (¡La mera mata!)
      // CAMBIA ESTA URL por la de tu API de login
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        body: formData,
        credentials: "include", // importante para enviar cookies
      });

      // 9. Manejamos la respuesta
      if (!response.ok) {
        // Si la API responde con 400, 401, 500, etc., entra aquí
        const errorData = await response.json();
        throw new Error(errorData.detail || "Correo o teléfono incorrectos. Intenta de nuevo.");
      }

      // 10. ¡ÉXITO! Si el login es correcto (status 200)
      const data = await response.json();

      // 11. Guardamos el Token (JWT) en el localStorage
      // Asumo que tu API regresa un "access_token"
      if (data) {
        sessionStorage.setItem("id", data.id);
        // (Opcional) Guarda el rol si tu API lo regresa
        // localStorage.setItem("userRole", data.user.role);
      }

      // 12. Redirigimos al index.html
      window.location.href = "/front/index.html";
    } catch (error) {
      // 13. Si algo falla (el fetch, o el error que lanzamos), lo mostramos
      const alerta = `<div class="alert alert-danger" role="alert">
                              ${error.message}
                           </div>`;
      alertContainer.innerHTML = alerta;
    } finally {
      // 14. Pase lo que pase, volvemos a activar el botón
      loginButton.disabled = false;
      loginButton.textContent = "Iniciar sesión";
    }
  });
});
