$(document).ready(function () {
  // --- 1. INICIALIZACIÓN DE DATATABLES ---
  var tabla = $("#tablaReportes").DataTable({
    ajax: {
      url: "http://192.168.0.194:8000/incidencias/filtrar",
      dataSrc: "data",
      error: function () {
        alert("Error al cargar los datos de la tabla. Por favor, intente de nuevo más tarde.");
      },
    },
    columns: [
      { data: "id" },
      { data: "nombre" },
      { data: "numero_reportado" },
      { data: "categoria" },
      { data: "fecha" },
      {
        data: "estatus",
        render: function (data) {
          let color = "secondary";
          if (data === "Pendiente") color = "warning";
          if (data === "Resuelto") color = "success";
          if (data === "En Proceso") color = "info";
          if (data === "Descartado") color = "dark";
          const textColor = data === "Pendiente" ? "text-dark" : "";
          return `<span class="badge bg-${color} ${textColor}">${data}</span>`;
        },
      },
      {
        data: null,
        orderable: false,
        searchable: false,
        render: function (data, type, row) {
          return `<button class="btn btn-sm btn-primary btn-ver-reporte" data-id="${row.id}"><i class="bi bi-pencil-square"></i> Ver/Editar</button>`;
        },
      },
    ],
    language: { url: "https://cdn.datatables.net/plug-ins/2.0.5/i18n/es-MX.json" },
    responsive: true,
    layout: { topStart: { buttons: ["csv", "excel", "pdf", "print"] }, topEnd: "pageLength" },
    lengthMenu: [50, 75, 100],
    pageLength: 50,
  });

  function abrirModalParaCrear() {
    console.log("Modo: CREAR");

    // 1. Resetea el form y el ID
    $("#editReportForm")[0].reset();
    $("#reporteId").val("");

    // 2. Cambia el título del modal
    // (Asegúrate de que tu modal tenga un H5 con id="miModalLabel")
    $("#adminModalLabel").text("Crear Nuevo Reporte");

    // 3. Hacemos EDITABLES los campos del reportante (Step 1)
    // Porque es un reporte nuevo, no hay datos "readonly"
    $("#editNombreUsuario").prop("readonly", false);
    $("#editVecesReportado").prop("readonly", false).val(1); // Es su primera vez
    $("#editEdad").prop("readonly", false);
    $("#editSexo").prop("disabled", false);
    $("#editNumeroUsuario").prop("readonly", false);
    $("#editCorreo").prop("readonly", false);
    $("#editMunicipio").prop("disabled", false);
    $("#Via").prop("readonly", false);
    $("#Folio-display").text("N/A (Se generará)");

    // 4. Hacemos EDITABLE el "Número Reportado" (Step 2)
    // ¡Este es clave!
    $("#editNumeroReportado").prop("readonly", false);

    // 5. Ajusta los botones y pasos
    currentStep = 1;
    updateWizardView();

    // 6. Muestra modal
    $("#adminReporteModal").modal("show");
  }

  // --- 2. LÓGICA DE AUTORIZACIÓN (REVISAR ROL) ---
  function checkUserRoleAndPermissions() {
    if (localStorage.getItem("userRole") !== "superadmin") {
      document.querySelectorAll(".super-admin-only").forEach((el) => el.style.setProperty("display", "none", "important"));
    }
  }
  checkUserRoleAndPermissions();

  // --- 3. LÓGICA DEL MODAL ---
  let currentStep = 1;
  const totalSteps = 2;

  function updateWizardView() {
    $(".report-step").hide();
    $(`#editStep${currentStep}`).show();
    $("#prevBtn").toggle(currentStep > 1);
    $("#nextBtn").toggle(currentStep < totalSteps);
    $("#saveBtn").toggle(currentStep === totalSteps);
    $("#deleteBtn").toggle(currentStep === totalSteps);
  }

  $("#nextBtn").on("click", () => {
    if (currentStep < totalSteps) {
      currentStep++;
      updateWizardView();
    }
  });
  $("#prevBtn").on("click", () => {
    if (currentStep > 1) {
      currentStep--;
      updateWizardView();
    }
  });

  async function fetchReporteCompleto(id) {
    // Reemplaza el mock con un fetch real
    try {
      // ¡CAMBIA ESTA URL! Debe ser tu endpoint para GET un reporte por ID/Folio
      const response = await fetch(`http://192.168.0.194:8000/incidencias/incidencia_completa${id}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }
      const data = await response.json();

      // OJO: Asegúrate de que tu API devuelva los datos en la misma
      // estructura que tu mock (con { usuario: {...}, reporte: {...} })
      // Si no, tendrás que ajustar la función populateModal(data).
      return data;
    } catch (error) {
      console.error("Error al cargar el reporte:", error);
      alert("No se pudo cargar el reporte completo. " + error.message);
      $("#adminReporteModal").modal("hide"); // Oculta el modal si falla
      return null; // Devuelve null para que no truene el populate
    }
  }

  function populateModal(data) {
    // Rellena todos los campos del formulario, incluyendo los nuevos
    $("#editNombreUsuario").val(data.usuario.nombre);
    $("#editVecesReportado").val(data.usuario.veces_reportado);
    $("#editEdad").val(data.usuario.edad);
    $("#editSexo").val(data.usuario.sexo);
    $("#editNumeroUsuario").val(data.usuario.numero_contacto);
    $("#editCorreo").val(data.usuario.correo);
    $("#editMunicipio").val(data.usuario.municipio);
    $("#Via").val(data.usuario.Via);
    $("#folio-display").text(data.folio);
    $("#editNumeroReportado").val(data.reporte.numero_reportado);
    $("#editFechaReporte").val(data.reporte.fecha_reporte);
    $("#editCategoria").val(data.reporte.categoria);
    $("#editMedioContacto").val(data.reporte.medio_contacto);
    $("#editDescripcion").val(data.reporte.descripcion);
    $("#editSupuestoNombre").val(data.reporte.supuesto_nombre);
    $("#editSupuestoGenero").val(data.reporte.supuesto_genero);
    $("#editSupuestoTrabajo").val(data.reporte.supuesto_trabajo);
    $("#editEstatus").val(data.reporte.estatus);
    $("#editTipoDestino").val(data.reporte.tipo_destino).trigger("change");
    $("#editNumeroTarjeta").val(data.reporte.numero_tarjeta);
    $("#editDireccion").val(data.reporte.direccion);
  }

  $("#btn-crear-reporte").on("click", function (e) {
    e.preventDefault();
    abrirModalParaCrear();
  });

  $("#tablaReportes tbody").on("click", ".btn-ver-reporte", async function () {
    const data = tabla.row($(this).parents("tr")).data();
    const folio = data.id;
    $("#adminModalLabel").text("Cargando datos...");
    $("#adminReporteModal").modal("show");
    const reporteCompleto = await fetchReporteCompleto(folio);

    if (reporteCompleto) {
      // Solo si el fetch fue exitoso
      $("#reporteId").val(folio); // <-- ¡AÑADE ESTA LÍNEA! Guarda el ID
      populateModal(reporteCompleto);
      // Bloquea Step 1 (Info Reportante)
    }
    $("#editNombreUsuario").prop("readonly", true);
    $("#editVecesReportado").prop("readonly", true);
    $("#editEdad").prop("readonly", true);
    $("#editSexo").prop("disabled", true); // O 'disabled' si es select
    $("#editNumeroUsuario").prop("readonly", true);
    $("#editCorreo").prop("readonly", true);
    $("#editMunicipio").prop("disabled", true); // 'disabled' para <select>
    $("#Via").prop("readonly", true);

    // Bloquea campos clave de Step 2
    $("#editNumeroReportado").prop("readonly", true);
    // --- FIN DE LO AGREGADO ---

    currentStep = 1;
    updateWizardView();
  });

  $("#editTipoDestino").on("change", function () {
    const selection = $(this).val();
    $("#tarjetaContainer").toggle(selection === "Tarjeta");
    $("#ubicacionContainer").toggle(selection === "Ubicación");
  });

  // --- LÓGICA DE GUARDADO CON CONFIRMACIÓN ---
  $("#editReportForm").on("submit", function (e) {
    e.preventDefault();
    $("#confirmationModal").modal("show");
  });

  $("#deleteBtn").on("click", function (e) {
    e.preventDefault();
    $("#confirmationModalDelete").modal("show");
  });

  $("#confirmSaveBtn").on("click", async function () {
    // 1. Obtener el ID. Si está vacío, es CREAR. Si tiene valor, es EDITAR.
    const reporteId = $("#reporteId").val();
    const esNuevo = reporteId === "";

    // 2. Construir el objeto de datos con TODO el formulario
    // Este objeto debe coincidir con lo que tu API espera recibir
    const formData = {
      // Step 1: Datos del Reportante
      // Si es 'crear', estos datos se envían
      // Si es 'editar', tu API de PUT debe saber qué hacer con ellos
      usuario: {
        nombre: $("#editNombreUsuario").val(),
        veces_reportado: parseInt($("#editVecesReportado").val()) || 1,
        edad: parseInt($("#editEdad").val()) || null,
        sexo: $("#editSexo").val(),
        numero_contacto: $("#editNumeroUsuario").val(),
        correo: $("#editCorreo").val(),
        municipio: $("#editMunicipio").val(),
        Via: $("#Via").val(),
      },
      // Step 2: Datos del Reporte
      reporte: {
        numeroReportado: $("#editNumeroReportado").val(),
        categoriaReporte: $("#editCategoria").val(),
        medioContacto: $("#editMedioContacto").val(),
        descripcion: $("#editDescripcion").val(),
        supuestoNombre: $("#editSupuestoNombre").val() || null,
        genero: $("#editSupuestoGenero").val() || null,
        supuestoTrabajo: $("#editSupuestoTrabajo").val() || null,
        tipoDestino: $("#editTipoDestino").val() || "Ninguno", // OJO: asegúrate que "Ninguno" sea válido
        numeroTarjeta: $("#editNumeroTarjeta").val() || null,
        direccion: $("#editDireccion").val() || null,
      },
    };

    // 3. Definir URL y Método
    let url = "http://192.168.0.194:8000/incidencias/crear"; // <-- ¡CAMBIA! Endpoint para CREAR (POST)
    let method = "POST";

    if (!esNuevo) {
      url = `http://192.168.0.194:8000/incidencias/modificar${id}`; // <-- ¡CAMBIA! Endpoint para EDITAR (PUT)
      method = "PUT";
    }

    // 4. Hacer el fetch
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json", // Si usas tokens, aquí lo pones:
          // "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(formData), // Enviamos el objeto completo
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.detail || response.statusText}`);
      }

      const result = await response.json();
      console.log("Respuesta del servidor:", result);

      // 5. Cerrar todo y recargar la tabla
      $("#confirmationModal").modal("hide");
      $("#adminReporteModal").modal("hide");
      tabla.ajax.reload(); // ¡Ahora sí recarga la tabla!

      // (Opcional) Mostrar un toast/alerta de éxito
      alert(esNuevo ? "Reporte creado con éxito" : "Reporte actualizado con éxito");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar: " + error.message);
      // No cierres el modal si hay un error, para que el usuario pueda corregir
    }
  });
});
