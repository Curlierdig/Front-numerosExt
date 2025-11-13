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
