document.addEventListener("DOMContentLoaded", function () {
  var tabla = $("#tablaReportes").DataTable({
    // Cargar datos desde el json de prueba
    ajax: {
      url: "mock2.json",
      dataSrc: "data", // Le dice a DataTables que los datos están en el array "data"
    },

    // Aqui le decimos a la tabla que propiedad del JSON va en cada columna
    columns: [
      { data: "id" },
      { data: "nombre" },
      { data: "numero_reportado" },
      { data: "categoria" },
      { data: "fecha" },
      {
        data: "estatus",
        render: function (data) {
          // Genera las insignias de colores para el estatus
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
          // Genera el botón "Ver/Editar" para cada fila
          return `
            <button class="btn btn-sm btn-primary btn-ver-reporte" data-id="${row.id}">
                <i class="bi bi-pencil-square"></i> Ver/Editar
            </button>
          `;
        },
      },
    ],

    language: {
      url: "https://cdn.datatables.net/plug-ins/2.0.5/i18n/es-MX.json",
    },
    responsive: true,
    layout: {
      topStart: {
        buttons: ["csv", "excel", "pdf", "print"],
      },
      topEnd: "pageLength",
    },
    lengthMenu: [50, 75, 100],
    pageLength: 50,
  });

  // --- 2. LÓGICA DE AUTORIZACIÓN (REVISAR ROL) ---
  console.log("Paso 1: Script de autorización iniciado.");

  function checkUserRoleAndPermissions() {
    console.log("Paso 2: Obteniendo rol del usuario desde localStorage...");
    const userRole = localStorage.getItem("userRole");
    console.log(` -> Rol encontrado: ${userRole}`);

    console.log("Paso 3: Buscando elementos con la clase '.super-admin-only'...");
    const superAdminElements = document.querySelectorAll(".super-admin-only");
    console.log(` -> Se encontraron ${superAdminElements.length} elementos.`);

    console.log("Paso 4: Evaluando si el rol es diferente a 'superadmin'...");
    if (userRole !== "superadmin") {
      console.log(" -> Condición VERDADERA. Procediendo a ocultar elementos.");
      superAdminElements.forEach((element, index) => {
        console.log(`    -> Ocultando elemento #${index + 1} con !important`);
        element.style.setProperty("display", "none", "important");
      });
    } else {
      console.log(" -> Condición FALSA. El usuario es superadmin.");
    }
  }

  // Ejecutar la función de revisión de rol
  checkUserRoleAndPermissions();

  // --- 3. LÓGICA PARA EL BOTÓN "VER/EDITAR REPORTE" ---
  $("#tablaReportes tbody").on("click", ".btn-ver-reporte", function () {
    var data = tabla.row($(this).parents("tr")).data();
    alert("Abriendo editor para el reporte de: " + data.nombre);
    $("#adminReporteModal").modal("show");
  });
});
