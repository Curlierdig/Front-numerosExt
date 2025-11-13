document.addEventListener("DOMContentLoaded", function () {
  const tipoDestinoSelect = document.getElementById("tipoDestino");
  const tarjetaContainer = document.getElementById("tarjetaContainer");
  const ubicacionContainer = document.getElementById("ubicacionContainer");

  if (tipoDestinoSelect) {
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
});
