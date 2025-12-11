document.addEventListener("DOMContentLoaded", function () {
  // Seleccionamos los elementos que vamos a usar
  const loginForm = document.getElementById("login-form");
  const loginButton = document.getElementById("login-button");
  const alertContainer = document.getElementById("login-alert-container");

  // Añadimos el "listener" al formulario
  loginForm.addEventListener("submit", async function (event) {
    // Prevenimos que la página se recargue
    event.preventDefault();

    const formData = new FormData();
    formData.append("correo", document.getElementById("emailLogin").value);
    formData.append("contrasena", document.getElementById("phoneLogin").value);

    // Limpiamos errores anteriores y desactivamos el botón
    alertContainer.innerHTML = "";
    loginButton.disabled = true;
    loginButton.textContent = "Iniciando...";

    try {
      // Hacemos el FETCH
      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        body: formData,
        credentials: "include", // importante para enviar cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Correo o teléfono incorrectos. Intenta de nuevo.");
      }

      const data = await response.json();

      // Guardamos el Token (JWT) en el sessionStorage
      if (data) {
        sessionStorage.setItem("id", data.id);
        // ROL
        // localStorage.setItem("userRole", data.user.role);
      }

      window.location.href = "/index.html";
    } catch (error) {
      const alerta = `<div class="alert alert-danger" role="alert">
                              ${error.message}
                           </div>`;
      alertContainer.innerHTML = alerta;
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = "Iniciar sesión";
    }
  });
});
