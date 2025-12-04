document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("correo", document.getElementById("emailInput").value);
  formData.append("matricula", document.getElementById("matriculaInput").value);
  formData.append("contrasena", document.getElementById("passwordInput").value);
  formData.append("rol", "admin");
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    console.log(res.status);

    if (res.ok) {
      const data = await res.json(); // Asumimos que la respuesta contiene { id, rol }

      sessionStorage.setItem(
        "usuario",
        JSON.stringify({
          id: data.id,
          rol: data.rol,
          nombre: data.nombre, // <-- ¡La clave para el dashboard!
        })
      );

      // 🔹 Guardar id y rol en sessionStorage en una sola línea
      console.log("Login exitoso:", data);
      // ✅ Redirige al panel
      window.location.href = "/front/panel.html";
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  } catch (error) {
    console.error("Error al hacer login:", error);
    alert("Ocurrió un error en el login. Intenta de nuevo.");
  }
});
