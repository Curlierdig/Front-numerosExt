// Se ejecuta cuando el documento está listo
$(document).ready(function () {
  $("#tablaIncidencias").DataTable({
    // json para cargar datos de prueba 
    ajax: "mock.json",

    // datos del json que saldran en la tabla
    columns: [{ data: "numero" }, { data: "categoria" }, { data: "medio" }, { data: "fecha" }],

    // url para poner la tabla en español
    language: {
      url: "https://cdn.datatables.net/plug-ins/2.0.3/i18n/es-MX.json",
    },

    // se hace responsiva la tabla y se puede ver varias incidencias a la vez
    responsive: true,
    searching: false,
    lengthMenu: [50, 75, 100],
  });
});
