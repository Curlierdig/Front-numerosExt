document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("correo", document.getElementById("emailInput").value);
  formData.append("matricula", document.getElementById("matriculaInput").value);
  formData.append("contrasena", document.getElementById("passwordInput").value);
  formData.append("rol", "admin");
  try {
    const res = await fetch(`/api/auth/login`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    //console.log(res.status);

    if (res.ok) {
      const data = await res.json();

      sessionStorage.setItem(
        "usuario",
        JSON.stringify({
          id: data.id,
          rol: data.rol,
          nombre: data.nombre, 
        })
      );
      window.location.href = "/front/panel.html";
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  } catch (error) {
    console.error("Error al hacer login:", error);
    alert("Ocurrió un error en el login. Intenta de nuevo.");
  }
});
