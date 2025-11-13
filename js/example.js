// Esta función se llama cuando la página carga
async function cargarDatosBlacklist() {
  // 2. Llamar a la API con método GET
  const datos = await callApi("blacklist", "GET");

  if (!datos) {
    // Si la API falla, se muestra un error en lugar de la tabla.
    document.getElementById("wrapperTabla").innerHTML = '<div class="alert alert-danger">Error al cargar los datos.</div>';
    return;
  }

  // 4. Inicializar DataTables con los datos recibidos
  $("#tablaBlacklist").DataTable({
    data: datos,
    columns: [
      { data: "id", title: "ID" },
      { data: "numero", title: "Número Reportado" },
      { data: "descripcion", title: "Última Descripción" },
      { data: "municipio_nombre", title: "Municipio" },
      {
        data: "conteo_reportes",
        title: "Reportes",
        render: function (data, type, row) {
          let badgeClass = data > 5 ? "danger" : "warning";
          return `<span class="badge bg-${badgeClass}">${data}</span>`;
        },
      },
    ],
    responsive: true,
    language: {
      url: "//cdn.datatables.net/plug-ins/1.10.25/i18n/Spanish.json",
    },
  });
}

// 1. Ejecutar la carga de datos cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  cargarDatosBlacklist();
});
