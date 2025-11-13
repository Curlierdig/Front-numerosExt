$(document).ready(function () {
  // Inicialización de DataTables
  var tabla = $("#tablaReportes").DataTable({
    // 1. Cargar los datos desde tu archivo JSON
    ajax: {
      url: "mock2.json", // Asegúrate que el nombre del archivo sea correcto
      dataSrc: "data", // Indica que los registros están en el array 'data'
    },

    // 2. Definir las columnas y cómo se deben mostrar
    columns: [
      { data: "id" },
      { data: "nombre" },
      { data: "numero_reportado" },
      { data: "categoria" },
      { data: "fecha" },
      {
        data: "estatus",
        render: function (data, type, row) {
          // Renderiza el estatus como una insignia de color
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
        data: null, // Esta columna no viene del JSON, se genera aquí
        orderable: false,
        searchable: false,
        render: function (data, type, row) {
          // Renderiza el botón de acciones para cada fila
          return `
            <button class="btn btn-sm btn-primary btn-ver-reporte" data-id="${row.id}">
                <i class="bi bi-pencil-square"></i> Ver/Editar
            </button>
          `;
        },
      },
    ],

    // --- El resto de tus opciones ---
    language: {
      url: "https://cdn.datatables.net/plug-ins/2.0.5/i18n/es-MX.json",
    },
    responsive: true,
    layout: {
      topStart: {
        buttons: ["copy", "csv", "excel", "pdf", "print"],
      },
    },
  });

  // --- LÓGICA PARA EL BOTÓN "VER/EDITAR REPORTE" ---
  $("#tablaReportes tbody").on("click", ".btn-ver-reporte", function () {
    // Obtenemos el objeto de datos completo de la fila
    var data = tabla.row($(this).parents("tr")).data();

    // 3. Accedemos a los datos como propiedades de un objeto (más claro y seguro)
    var reporteId = data.id;
    var nombre = data.nombre;

    console.log("Se hizo clic en el reporte ID:", reporteId);
    console.log("Datos completos del objeto de la fila:", data);

    // Tu lógica para abrir el modal sigue siendo la misma
    alert("Abriendo editor para el reporte de: " + nombre);
    $("#adminReporteModal").modal("show");
  });
});
