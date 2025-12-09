$(document).ready(function () {
  // Seleccionamos la tabla por su ID
  $("#tablaIncidencias").DataTable({
    // Hacemos el "fetch" (DataTables lo llama 'ajax')
    ajax: {
      url: `/api/incidencias/usuarios`,
      dataSrc: "data",

      error: function (xhr, error, thrown) {
        alert("Error al cargar los datos. Por favor, revisa la conexión o la API.");
        console.error("Error en DataTables ajax:", error, thrown);
      },
    },

    // Mapeamos las columnas
    columns: [
      {
        data: "idreporte", // Jala el dato
        visible: false, // Lo oculta
        searchable: false,
      },
      // Columna 1: <th>Número Reportado</th>
      { data: "reportados.numeroreportado", className: "text-center" },

      // Columna 2: <th>Categoría Principal</th>
      { data: "categoriareporte", className: "text-center" },

      // Columna 3: <th>Medio de Contacto</th>
      { data: "mediocontacto", className: "text-center" },

      // Columna 4: <th>Fecha del Reporte</th>
      {
        data: "fechareporte",
        className: "text-center",
        render: function (data, type, row) {
          if (type === "display") {
            if (typeof data === "string" && data.includes("T")) {
              return data.split("T")[0]; // "2025-11-13"
            }
            return "N/A";
          }
          return data;
        },
      },
    ],

    responsive: true,
    pageLength: 25,
    lengthMenu: [10, 25, 50, 100],

    language: {
      url: "https://cdn.datatables.net/plug-ins/2.0.7/i18n/es-MX.json",
    },
  });
});
