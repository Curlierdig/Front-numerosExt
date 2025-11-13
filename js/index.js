document.addEventListener("DOMContentLoaded", function () {
  // SELECCIONAMOS TODAS LAS PIEZAS

  const modalElement = document.getElementById("adminReporteModal");
  // Aseguramos que el modal exista antes de seguir
  if (!modalElement) return;

  const reporteModal = new bootstrap.Modal(modalElement);
  const btnReportar = document.getElementById("btn-iniciar-reporte"); // El botón de la página

  // Controles del modal
  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  const saveBtn = document.getElementById("saveBtn");
  const wizardForm = document.getElementById("wizardForm");

  // Campos condicionales del modal
  const medioContactoSelect = document.getElementById("adminMedioContacto");
  const otroMedioContainer = document.getElementById("otroMedioContainer");
  const tipoDestinoSelect = document.getElementById("adminTipoDestino");
  const tarjetaContainer = document.getElementById("tarjetaContainer");
  const ubicacionContainer = document.getElementById("ubicacionContainer");

  // Logica de cuando se abre el modal

  if (btnReportar) {
    btnReportar.addEventListener("click", function () {
      const token = sessionStorage.getItem("id");

      if (!token) {
        // CASO 1: NO ESTÁ LOGUEADO
        console.log("Usuario no logueado. Redirigiendo a login...");
        // Lo mandamos al login
        window.location.href = "../front/login.html"; // Asegúrate que esta ruta sea correcta
      } else {
        // CASO 2: SI ESTÁ LOGUEADO
        console.log("Usuario logueado. Saltando a Step 2.");

        step1.style.display = "none"; // Deshabilitamos los inputs del step1

        step1.querySelectorAll("input, select, textarea").forEach((el) => {
          el.disabled = true;
        }); // Mostramos el paso 2

        step2.style.display = "block";

        // mostramos los botones correctos

        prevBtn.style.display = "none"; // Oculta "Atrás"
        nextBtn.style.display = "none"; // Oculta "Siguiente"
        saveBtn.style.display = "block"; // Muestra "Guardar Cambios" y mostramos el modal

        reporteModal.show();
      }
    });
  }

  // Logica del modal

  // --- Mostrar/Ocultar campo "Otro Medio" ---
  if (medioContactoSelect && otroMedioContainer) {
    medioContactoSelect.addEventListener("change", function () {
      if (this.value === "otro") {
        otroMedioContainer.style.display = "block";
      } else {
        otroMedioContainer.style.display = "none";
      }
    });
  }

  // --- Mostrar/Ocultar campos de destino ---
  if (tipoDestinoSelect && tarjetaContainer && ubicacionContainer) {
    tipoDestinoSelect.addEventListener("change", function () {
      const seleccion = this.value;

      if (seleccion === "Tarjeta") {
        tarjetaContainer.style.display = "block";
        ubicacionContainer.style.display = "none";
      } else if (seleccion === "Ubicación") {
        tarjetaContainer.style.display = "none";
        ubicacionContainer.style.display = "block";
      } else {
        tarjetaContainer.style.display = "none";
        ubicacionContainer.style.display = "none";
      }
    });
  }

  // Escuchamos el 'submit' del FORMULARIO
  if (wizardForm) {
    wizardForm.addEventListener("submit", async function (event) {
      // Prevenimos que la página se recargue
      event.preventDefault();
      console.log("Formulario enviado");

      // Bloqueamos el botón de guardar
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "Enviando...";
      }

      // Obtenemos el Token de sesión
      const token = sessionStorage.getItem("id");

      // Verificamos que el token exista
      if (!token) {
        alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        window.location.href = "../front/login.html"; // Lo manda al login
        return;
      }
      // Recolectamos los datos (del step 2)

      const medioContacto = medioContactoSelect.value;
      const medioContactoFinal = medioContacto === "otro" ? document.getElementById("otroMedio").value : medioContacto;

      const requestBody = {
        idUsuario: sessionStorage.id,
        numeroReportado: document.getElementById("adminNumero").value,
        categoriaReporte: document.getElementById("adminCategoria").value,
        medioContacto: medioContactoFinal,
        descripcion: document.getElementById("adminDescripcion").value,
        genero: document.getElementById("adminSupuestoGenero").value || null,
        supuestoNombre: document.getElementById("adminSupuestoNombre").value || null,
        supuestoTrabajo: document.getElementById("adminSupuestoTrabajo").value || null,
        tipoDestino: tipoDestinoSelect.value,
        numeroTarjeta: document.getElementById("adminNumeroTarjeta").value || null,
        direccion: document.getElementById("adminDireccion").value || null,
      };

      console.log("Datos a enviar:", requestBody);
      console.log(sessionStorage.id);
      console.log(token);

      // FETCH POST
      try {
        const response = await fetch("http://192.168.0.194:8000/incidencias/crear", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "No se pudo enviar el reporte. Intenta de nuevo.");
        }

        const result = await response.json();
        console.log("Reporte enviado con éxito:", result);

        reporteModal.hide(); // Cierra el modal
        alert("¡Reporte enviado con éxito! Gracias por tu colaboración.");
      } catch (error) {
        console.error("Error al enviar el reporte:", error);
        alert(error.message);
      } finally {
        // Reactivamos el botón
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = "Guardar Cambios";
        }
      }
    });
  }

  // FUNCIÓN DE LIMPIEZA
  // Resetea el modal cuando se cierra
  modalElement.addEventListener("hidden.bs.modal", function () {
    console.log("Modal cerrado, reseteando pasos."); // Resetea el formulario (borra los campos)

    if (wizardForm) {
      wizardForm.reset();
    }

    // Volvemos a HABILITAR los inputs del step1 para la próxima vez
    step1.querySelectorAll("input, select, textarea").forEach((el) => {
      el.disabled = false;
    }); // Regresa el modal a su estado original (Paso 1 visible)

    step1.style.display = "block";
    step2.style.display = "none";

    // Resetea los botones
    prevBtn.style.display = "none";
    nextBtn.style.display = "block";
    saveBtn.style.display = "none";

    // Resetea los campos condicionales
    if (otroMedioContainer) otroMedioContainer.style.display = "none";
    if (tarjetaContainer) tarjetaContainer.style.display = "none";
    if (ubicacionContainer) ubicacionContainer.style.display = "none";
  });
});
