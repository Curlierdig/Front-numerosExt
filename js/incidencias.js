$(document).ready(function () {
  // 1. Seleccionamos la tabla por su ID
  $("#tablaIncidencias").DataTable({
    // 2. Hacemos el "fetch" (DataTables lo llama 'ajax')
    ajax: {
      url: `${API_URL}/incidencias/usuarios`,
      dataSrc: "data",

      error: function (xhr, error, thrown) {
        alert("Error al cargar los datos. Por favor, revisa la conexión o la API.");
        console.error("Error en DataTables ajax:", error, thrown);
      },
    },

    // 3. Mapeamos las columnas (deben coincidir con tu <thead>)
    columns: [
      // Asegúrate que los 'data' coincidan con los nombres de tu JSON

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
          // --- ¡AQUÍ ESTÁ EL CANDADO! ---
          // Solo formatea si el tipo es "display" (pintar en pantalla)
          if (type === "display") {
            // Revisa si es un string que se puede cortar
            if (typeof data === "string" && data.includes("T")) {
              return data.split("T")[0]; // "2025-11-13"
            } // Si es null o no tiene 'T'
            return "N/A";
          } // Para cualquier otro tipo ('sort', 'filter'), // regresa el dato crudo para que ordene bien.
          return data;
        },
      },
    ],

    // --- 4. Opciones extra para que se vea pro ---

    responsive: true, // Para que jale chido en celulares
    pageLength: 25, // Cuántos reportes mostrar por página
    lengthMenu: [10, 25, 50, 100], // Opciones para el usuario

    // --- 5. Poner la tabla en español ---
    language: {
      url: "https://cdn.datatables.net/plug-ins/2.0.7/i18n/es-MX.json",
    },
  });
});
