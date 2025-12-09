const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // evita recargar la página

  const payload = {
    correo: document.getElementById("adminEmail").value.trim(),
    matricula: document.getElementById("adminMatricula").value.trim(),
    contrasena: document.getElementById("adminPassword").value.trim(),
    nombre: document.getElementById("adminName").value.trim(),
  };

  // Validación rápida
  if (!payload.correo || !payload.contrasena || !payload.nombre) {
    alert("Por favor llena todos los campos obligatorios.");
    return;
  }

  try {
    const res = await fetch(`/api/superadmin/registrar_admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.message || "Administrador registrado correctamente");
      window.location.href = "/admin/panel.html";
    } else {
      const err = await res.json().catch(() => ({ detail: "Error desconocido" }));
      alert(err.detail || "Error al registrar administrador");
    }
  } catch (error) {
    console.error("Error en fetch:", error);
    alert("No se pudo conectar con el servidor. Revisa CORS o la IP.");
  }
});
