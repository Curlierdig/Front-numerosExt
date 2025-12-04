// Selecciona los elementos del DOM
const municipioSelect = document.getElementById("municipality");
const otroMunicipioContainer = document.getElementById("otroMunicipioContainer");

// Agrega un "escuchador" para el evento de cambio en el dropdown
municipioSelect.addEventListener("change", function () {
  // Si el valor seleccionado es 'otro'
  if (this.value === "otro") {
    // Muestra el campo de texto eliminando la clase 'd-none' de Bootstrap
    otroMunicipioContainer.classList.remove("d-none");
  } else {
    // Si se selecciona cualquier otro, oculta el campo de texto
    otroMunicipioContainer.classList.add("d-none");
  }
});
const form = document.querySelector(".login-card form");

// Mostrar/ocultar campo "otro municipio" si usas esa lógica
const municipality = document.getElementById("municipality");
const otroContainer = document.getElementById("otroMunicipioContainer");
municipality?.addEventListener("change", () => {
  otroContainer.classList.toggle("d-none", municipality.value !== "otro");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Leer valores del formulario
  const payload = {
    correo: document.getElementById("email").value.trim(),
    numeroTelefono: document.getElementById("phone").value.trim(),
    nombre: document.getElementById("fullName").value.trim(),
    edad: Number(document.getElementById("age").value || 0),
    sexo: document.getElementById("gender").value,
    municipio: document.getElementById("municipality").value === "otro" ? document.getElementById("otroMunicipioInput").value.trim() : document.getElementById("municipality").value,
    entidadForanea: document.getElementById("state").value.trim(),
  };

  // Validaciones simples (puedes ampliarlas)
  if (!payload.correo || !payload.nombre) {
    alert("Por favor llena al menos correo y nombre completo.");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/auth/registrar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // importante para enviar JSON
      },
      credentials: "include", // descomenta si tu backend devuelve cookies y quieres que el navegador las guarde
      body: JSON.stringify(payload),
    });

    // Mostrar estado para depuración
    console.log("status:", res.status);

    if (res.ok) {
      const data = await res.json().catch(() => null);
      // éxito: redirigir o mostrar mensaje
      alert(data?.message || "Registro exitoso");
      window.location.href = "/front/login.html"; // descomenta si quieres redirigir
    } else {
      // intentar leer respuesta con error
      const err = await res.json().catch(() => ({ detail: "Error" }));
      console.error("Error response:", err);
      alert(err.detail || "Error en el registro");
    }
  } catch (error) {
    console.error("Fetch error:", error);
    alert("No fue posible conectar con el servidor. Revisa CORS / la IP / el servidor.");
  }
});
