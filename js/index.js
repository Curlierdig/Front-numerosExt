document.addEventListener("DOMContentLoaded", function () {
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
        // NO ESTÁ LOGUEADO
        //console.log("Usuario no logueado. Redirigiendo a login...");
        // Lo mandamos al login
        window.location.href = "../front/login.html"; // Asegúrate que esta ruta sea correcta
      } else {
        // SI ESTÁ LOGUEADO
        //console.log("Usuario logueado. Saltando a Step 2.");

        step1.style.display = "none"; // Deshabilitamos los inputs del step1

        step1.querySelectorAll("input, select, textarea").forEach((el) => {
          el.disabled = true;
        });

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
      //console.log("Formulario enviado");

      // Bloqueamos el botón de guardar
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = "Enviando...";
      }

      // Obtenemos el Token de sesión y el ID del usuario
      //const token = sessionStorage.getItem("id");
      const userId = sessionStorage.getItem("id");

      // Verificamos que el ID exista
      if (!userId) {
        alert("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
        window.location.href = "../front/login.html";
        return;
      }

      // Recolectamos los datos
      const medioContacto = medioContactoSelect.value;
      const medioContactoFinal = medioContacto === "otro" ? document.getElementById("otroMedio").value : medioContacto;

      const requestBody = {
        idUsuario: userId,
        idusuario: userId,

        // Campos del reporte
        numeroReportado: document.getElementById("adminNumero").value.trim(),
        categoriaReporte: document.getElementById("adminCategoria").value,
        medioContacto: medioContactoFinal,
        fechareporte: new Date().toISOString().split("T")[0], // Fecha actual

        // Campos opcionales
        descripcion: document.getElementById("adminDescripcion").value.trim() || null,
        genero: document.getElementById("adminSupuestoGenero").value || "No especificado",
        supuestoNombre: document.getElementById("adminSupuestoNombre").value.trim() || null,
        supuestoTrabajo: document.getElementById("adminSupuestoTrabajo").value.trim() || null,
        estatus: "Pendiente", // Valor por defecto

        // Campos de destino
        tipoDestino: tipoDestinoSelect.value === "Ninguno" ? null : tipoDestinoSelect.value,
        numeroTarjeta: document.getElementById("adminNumeroTarjeta").value.trim() || null,
        direccion: document.getElementById("adminDireccion").value.trim() || null,
      };

      // Validaciones básicas
      if (!requestBody.numeroReportado || requestBody.numeroReportado.length !== 10) {
        alert("Por favor ingresa un número de teléfono válido (10 dígitos).");
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = "Guardar Cambios";
        }
        return;
      }

      if (!requestBody.categoriaReporte) {
        alert("Por favor selecciona una categoría.");
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = "Guardar Cambios";
        }
        return;
      }

      if (!requestBody.medioContacto) {
        alert("Por favor selecciona un medio de contacto.");
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = "Guardar Cambios";
        }
        return;
      }

      // Validación específica para tarjeta
      if (requestBody.tipoDestino === "Tarjeta") {
        const numeroTarjeta = document.getElementById("adminNumeroTarjeta").value.trim();
        if (!numeroTarjeta || numeroTarjeta.length !== 16) {
          alert("El número de tarjeta debe tener 16 dígitos.");
          if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = "Guardar Cambios";
          }
          return;
        }
      }

      //console.log("📤 Datos a enviar:", JSON.stringify(requestBody, null, 2));
      //console.log("🔑 User ID:", userId);
      // FETCH POST con mejor manejo de errores
      try {
        const response = await fetch(`/api/incidencias/crear`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(requestBody),
        });

        // Obtener la respuesta para debug
        const responseText = await response.text();
        //console.log("📥 Respuesta del servidor:", responseText);

        if (!response.ok) {
          let errorDetail = "Error desconocido";
          try {
            const errorData = JSON.parse(responseText);
            if (errorData.detail) {
              if (Array.isArray(errorData.detail)) {
                errorDetail = errorData.detail.map((err) => `${err.loc?.[err.loc.length - 1] || "campo"}: ${err.msg}`).join("\n");
              } else {
                errorDetail = errorData.detail;
              }
            } else if (errorData.message) {
              errorDetail = errorData.message;
            }
          } catch {
            errorDetail = responseText || `Error ${response.status}`;
          }

          throw new Error(`No se pudo enviar el reporte:\n${errorDetail}`);
        }

        //console.log("✅ Reporte enviado con éxito");

        reporteModal.hide(); // Cierra el modal

        alert("¡Reporte enviado con éxito! Gracias por tu colaboración.");

        wizardForm.reset();
      } catch (error) {
        console.error("❌ Error al enviar el reporte:", error);
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
    }); // Regresa el modal a su estado original

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
