(function verificarSesionInmediata() {
  if (window.location.pathname.includes("/panel.html") || window.location.pathname.endsWith("panel.html") || document.title.toLowerCase().includes("panel")) {
    let tieneSesion = false;
    // Verificar si hay usuario en sessionStorage
    const usuarioString = sessionStorage.getItem("usuario");
    if (usuarioString) {
      try {
        const usuario = JSON.parse(usuarioString);
        if (usuario && (usuario.idusuario || usuario.id)) {
          tieneSesion = true;
        }
      } catch (e) {
        console.warn("Error parsing usuario:", e);
      }
    }

    // Verificar si hay token
    const token = sessionStorage.getItem("token");
    if (token && !tieneSesion) {
      tieneSesion = true;
      console.log("Sesión encontrada por token");
    }

    // Verificar si hay id directamente
    const idDirecto = sessionStorage.getItem("id");
    if (idDirecto && !tieneSesion) {
      tieneSesion = true;
    }

    const currentUserId = sessionStorage.getItem("currentUserId");
    if (currentUserId && !tieneSesion) {
      tieneSesion = true;
    }

    // Si NO tiene sesión, mostrar bloqueo
    if (!tieneSesion) {
      console.warn("No se encontró sesión válida, bloqueando acceso");

      // Overlay de bloqueo visual
      const overlayHTML = `
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Acceso Restringido</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            min-height: 100vh;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            padding: 20px;
                        }
                        
                        .overlay-container {
                            background: rgba(255, 255, 255, 0.1);
                            backdrop-filter: blur(10px);
                            padding: 40px;
                            border-radius: 15px;
                            max-width: 500px;
                            width: 100%;
                            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                            border: 1px solid rgba(255, 255, 255, 0.2);
                            text-align: center;
                            color: white;
                        }
                        
                        .spinner {
                            width: 80px;
                            height: 80px;
                            border: 3px solid rgba(255, 255, 255, 0.3);
                            border-top: 3px solid white;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin: 0 auto 30px;
                        }
                        
                        h1 {
                            font-size: 2rem;
                            margin-bottom: 15px;
                            font-weight: 600;
                        }
                        
                        p {
                            font-size: 1.1rem;
                            margin-bottom: 25px;
                            line-height: 1.6;
                            opacity: 0.9;
                        }
                        
                        .button-group {
                            display: flex;
                            gap: 15px;
                            justify-content: center;
                            margin-top: 30px;
                            flex-wrap: wrap;
                        }
                        
                        .btn {
                            background: white;
                            color: #667eea;
                            border: none;
                            padding: 12px 30px;
                            border-radius: 50px;
                            font-weight: 600;
                            cursor: pointer;
                            font-size: 1rem;
                            transition: all 0.3s ease;
                            text-decoration: none;
                            display: inline-block;
                        }
                        
                        .btn-secondary {
                            background: transparent;
                            color: white;
                            border: 2px solid rgba(255, 255, 255, 0.3);
                        }
                        
                        .btn:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                        }
                        
                        .btn-secondary:hover {
                            background: rgba(255,255,255,0.1);
                        }
                        
                        .countdown {
                            margin-top: 30px;
                            font-size: 0.9rem;
                            opacity: 0.7;
                        }
                        
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        
                        .debug-info {
                            margin-top: 20px;
                            padding: 10px;
                            background: rgba(0,0,0,0.2);
                            border-radius: 5px;
                            font-size: 0.8rem;
                            text-align: left;
                        }
                    </style>
                </head>
                <body>
                    <div class="overlay-container">
                        <div class="spinner"></div>
                        <h1>Acceso Restringido</h1>
                        <p>Debes iniciar sesión para acceder al panel de administración.</p>
                        
                        <div class="button-group">
                            <a href="/front/loginAdmin" class="btn">Ir al Login</a>
                            <button onclick="location.reload()" class="btn btn-secondary">Reintentar</button>
                        </div>
                        
                        <div class="countdown">
                            Redirección automática en <span id="countdown">5</span> segundos
                        </div>
                        
                        <div class="debug-info">
                            <strong>Debug info:</strong><br>
                            Usuario: ${usuarioString ? "Presente" : "No encontrado"}<br>
                            Token: ${token ? "Presente" : "No encontrado"}<br>
                            ID directo: ${idDirecto || "No encontrado"}<br>
                            currentUserId: ${currentUserId || "No encontrado"}
                        </div>
                    </div>
                    
                    <script>
                        // Contador regresivo
                        let seconds = 5;
                        const countdownElement = document.getElementById('countdown');
                        const countdownInterval = setInterval(() => {
                            seconds--;
                            if (countdownElement) {
                                countdownElement.textContent = seconds;
                            }
                            if (seconds <= 0) {
                                clearInterval(countdownInterval);
                                window.location.replace("/front/loginAdmin");
                            }
                        }, 1000);
                        
                        // Redirección automática después de 5 segundos
                        setTimeout(() => {
                            window.location.replace("/front/loginAdmin");
                        }, 5000);
                    </script>
                </body>
                </html>
            `;

      // Reemplazar todo el contenido del documento
      document.write(overlayHTML);
      document.close();

      // Prevenir cualquier ejecución adicional de JavaScript
      throw new Error("Sesión no válida - Redirigiendo a login");
    } else {
      console.log("Sesión válida detectada, continuando...");
    }
  }
})();
// Variable para almacenar la instancia de DataTable
let tabla = null;

// Variable para controlar el modo del modal (crear/editar/ver)
let modoModal = "ver";

// Variable para almacenar el ID del reporte actual
let reporteActualId = null;

// Variable para almacenar el ID del usuario actual
let usuarioActualId = null;

let datosUsuarioActual = null;

// Pasos del wizard (1, 2 o 3)
let pasoActual = 1;

// Total de pasos en el wizard
const TOTAL_PASOS = 3;

// ----------------------------------------------------------------------------
// FUNCIÓN DE INICIALIZACIÓN (SE EJECUTA CUANDO EL DOM ESTÁ LISTO)
// ----------------------------------------------------------------------------

$(document).ready(function () {
  //console.log("Iniciando sistema de reportes...");

  if (document.body) {
    document.body.style.display = "block";
    document.body.style.visibility = "visible";
  }

  // Cargar el nombre del administrador desde sessionStorage
  cargarNombreAdmin();

  // Inicializar la tabla de reportes
  inicializarTabla();

  // Configurar todos los event listeners (botones, formularios, etc.)
  configurarEventListeners();

  // Verificar permisos del usuario (super admin)
  setTimeout(() => {
    verificarPermisos();
  }, 100);

  //console.log("Sistema inicializado correctamente");
});

// ----------------------------------------------------------------------------
// FUNCIÓN PARA CARGAR EL NOMBRE DEL ADMINISTRADOR
// ----------------------------------------------------------------------------

function cargarNombreAdmin() {
  //console.log("Cargando información del administrador...");

  // Intentar obtener el usuario desde sessionStorage
  const usuarioString = sessionStorage.getItem("usuario");
  const token = sessionStorage.getItem("token");

  //console.log("Datos en sessionStorage:");
  //console.log("  - usuarioString:", usuarioString);
  //console.log("  - token:", token ? "Presente" : "No presente");

  // Opción 1: Si existe información del usuario en sessionStorage
  if (usuarioString) {
    try {
      // Convertir el string JSON a objeto
      const usuario = JSON.parse(usuarioString);
      //console.log("Usuario parseado:", usuario);

      // Buscar el nombre
      let nombreAdmin = "Admin";

      if (usuario.nombre) {
        nombreAdmin = usuario.nombre;
        //console.log("Nombre encontrado en usuario.nombre:", nombreAdmin);
      }
      // Guardar el nombre en el elemento HTML
      $("#adminUserName").text(nombreAdmin);

      // También guardar el rol
      if (usuario.rol) {
        const rol = usuario.rol;
        sessionStorage.setItem("userRole", rol);
        //console.log("Rol del usuario:", rol);
      }

      return;
    } catch (error) {
      console.error("Error al parsear usuario:", error);
    }
  }

  // Opción 2: Si hay token, intentar extraer información
  if (token) {
    try {
      // Los tokens JWT tienen 3 partes separadas por puntos
      const tokenParts = token.split(".");
      if (tokenParts.length === 3) {
        // La segunda parte (payload) está en base64
        const payload = JSON.parse(atob(tokenParts[1]));
        //console.log("Payload del token:", payload);

        // Buscar nombre en el payload del token
        let nombreAdmin = "Admin";

        if (payload.nombre) {
          nombreAdmin = payload.nombre;
        }

        $("#adminUserName").text(nombreAdmin);
        //console.log("Nombre extraído del token:", nombreAdmin);

        // Extraer rol del token si existe
        if (payload.rol) {
          sessionStorage.setItem("userRole", payload.rol);
          //console.log("Rol extraído del token:", payload.rol);
        }

        return;
      }
    } catch (error) {
      console.error("Error al decodificar token:", error);
    }
  }

  // Opción 3: Si no hay datos, intentar obtener del endpoint de perfil
  obtenerPerfilAdmin();
}

// ----------------------------------------------------------------------------
// FUNCIÓN PARA OBTENER PERFIL DEL ADMIN
// ----------------------------------------------------------------------------

async function obtenerPerfilAdmin() {
  const token = sessionStorage.getItem("token");

  if (!token) {
    //console.log("No hay token disponible");
    $("#adminUserName").text("Invitado");
    return;
  }

  try {
    const response = await fetch(`/api/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const userData = await response.json();
      //console.log("Perfil obtenido:", userData);

      // Guardar en sessionStorage para futuras consultas
      sessionStorage.setItem("usuario", JSON.stringify(userData));

      // Extraer nombre
      let nombreAdmin = "Admin";

      if (userData.nombre) {
        nombreAdmin = userData.nombre;
      }

      $("#adminUserName").text(nombreAdmin);

      // Guardar rol
      if (userData.rol) {
        sessionStorage.setItem("userRole", userData.rol);
      }
    } else {
      console.warn("No se pudo obtener perfil, usando un valor por defecto");
      $("#adminUserName").text("Admin");
    }
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    $("#adminUserName").text("Admin");
  }
}

// ----------------------------------------------------------------------------
// FUNCIÓN PARA INICIALIZAR LA TABLA DE REPORTES (DATATABLE)
// ----------------------------------------------------------------------------

function inicializarTabla() {
  // Obtener token para las peticiones
  const token = sessionStorage.getItem("token");
  const usuarioString = sessionStorage.getItem("usuario");

  // Configurar headers para DataTables
  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (usuarioString) {
    try {
      const usuario = JSON.parse(usuarioString);
      if (usuario.token) {
        headers["Authorization"] = `Bearer ${usuario.token}`;
      }
    } catch (e) {
      console.warn("No se pudo obtener token para tabla:", e);
    }
  }
  let cursores = {};

  tabla = $("#tablaReportes").DataTable({
    processing: true,
    serverSide: true,

    ajax: {
      url: `/api/incidencias/filtrar`,
      type: "GET",
      dataSrc: function (json) {
        // página actual
        let pagina = tabla.page.info().page;

        // guardar cursor para la siguiente página
        if (json.data && json.data.length > 0) {
          cursores[pagina] = json.data[json.data.length - 1].fechareporte;
        }

        return json.data;
      },
      data: function (d) {
        let pagina = Math.floor(d.start / d.length);

        return {
          // backend
          limite: d.length,
          cursor_fecha: cursores[pagina - 1] || null,
          "search[value]": d.search.value,
          orden_desc: d.order[0].dir === "desc",
          columna_orden: d.columns[d.order[0].column].data,
        };
      },
      headers: headers,
      xhrFields: {
        withCredentials: true,
      },
      error: function (xhr, error) {
        console.error("Error al cargar datos:", error);

        if (xhr.status === 401 || xhr.status === 403) {
          sessionStorage.clear();
          setTimeout(() => {
            alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
            window.location.href = "/front/loginAdmin";
          }, 100);
        }
      },
    },

    columns: [
      {
        data: "idreporte",
        visible: false,
        searchable: false,
      },
      {
        data: "nombre_usuario",
        className: "text-center",
      },
      {
        data: "numeroreportado",
        className: "text-center",
      },
      {
        data: "categoriareporte",
        className: "text-center",
      },
      {
        data: "fechareporte",
        className: "text-center",
      },
      {
        data: "estatus",
        className: "text-center",
        render: function (data) {
          let color = "secondary";
          let textColor = "";

          if (data === "Pendiente") {
            color = "warning";
            textColor = "text-dark";
          } else if (data === "Resuelto") {
            color = "success";
          } else if (data === "En Proceso") {
            color = "info";
          } else if (data === "Descartado") {
            color = "dark";
          }

          return `<span class="badge bg-${color} ${textColor}">${data}</span>`;
        },
      },
      {
        data: null,
        orderable: false,
        searchable: false,
        render: function (data, type, row) {
          return `
          <button class="btn btn-sm btn-primary btn-ver-reporte"
            data-id="${row.idreporte}">
            <i class="bi bi-pencil-square"></i> Ver/Editar
          </button>`;
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
}
tabla.on("search.dt order.dt length.dt", function () {
  cursores = {};
});
// ----------------------------------------------------------------------------
// FUNCIÓN PARA CONFIGURAR TODOS LOS EVENT LISTENERS
// ----------------------------------------------------------------------------

function configurarEventListeners() {
  // Evento para mostrar/ocultar campo "otro municipio"
  $("#editMunicipio")
    .off("change")
    .on("change", function () {
      const municipioSeleccionado = $(this).val();

      if (municipioSeleccionado === "otro") {
        $("#otroMunicipioContainerModal").removeClass("d-none");
        $("#otroMunicipioInput").prop("disabled", false);
      } else {
        $("#otroMunicipioContainerModal").addClass("d-none");
        $("#otroMunicipioInput").prop("disabled", true);
      }
    });

  // Botón "Siguiente" del wizard
  $("#nextBtn").off("click").on("click", manejarBotonSiguiente);

  // Botón "Atrás" del wizard
  $("#prevBtn").off("click").on("click", manejarBotonAtras);

  // --- BOTONES DEL MODAL ---

  // Botón "Guardar Cambios" del modal
  $("#saveBtn")
    .off("click")
    .on("click", function (e) {
      e.preventDefault();
      $("#confirmationModal").modal("show"); // Mostrar modal de confirmación
    });

  // Botón "Eliminar Reporte" del modal
  $("#deleteBtn")
    .off("click")
    .on("click", function (e) {
      e.preventDefault();
      $("#confirmationModalDelete").modal("show"); // Mostrar modal de confirmación
    });

  // --- BOTONES DE CONFIRMACIÓN ---

  // Botón de confirmar guardado
  $("#confirmSaveBtn").off("click").on("click", guardarReporte);

  // Botón de confirmar eliminación
  $("#confirmDeleteBtn").off("click").on("click", eliminarReporte);

  // --- BOTONES DE NAVEGACIÓN ---

  // Botón "Crear Nuevo Reporte" del sidebar
  $("#btn-crear-reporte").off("click").on("click", abrirModalCrear);

  // Botón "Cerrar Sesión"
  $("#btn-logout").off("click").on("click", cerrarSesion);

  // --- EVENTOS DE LA TABLA ---

  // Evento delegado para los botones "Ver/Editar" de la tabla
  $("#tablaReportes tbody")
    .off("click", ".btn-ver-reporte")
    .on("click", ".btn-ver-reporte", function () {
      // Obtener el ID del reporte desde el atributo data-id
      const reporteId = $(this).data("id");
      abrirModalVer(reporteId);
    });

  // --- EVENTOS DEL FORMULARIO ---

  // Evento change para el select de Tipo de Destino
  $("#editTipoDestino")
    .off("change")
    .on("change", function () {
      const tipoSeleccionado = $(this).val();

      // Mostrar/ocultar contenedores según la selección
      if (tipoSeleccionado === "tarjeta") {
        $("#tarjetaContainer").show();
        $("#ubicacionContainer").hide();
      } else if (tipoSeleccionado === "ubicacion") {
        $("#tarjetaContainer").hide();
        $("#ubicacionContainer").show();
      } else {
        $("#tarjetaContainer").hide();
        $("#ubicacionContainer").hide();
      }
    });

  // Evento cuando se cierra el modal
  $("#adminReporteModal").on("hidden.bs.modal", function () {
    limpiarModal(); // Limpiar el modal completamente
  });
}

// ----------------------------------------------------------------------------
// FUNCIONES DEL WIZARD (NAVEGACIÓN ENTRE PASOS)
// ----------------------------------------------------------------------------

// Actualizar la vista del wizard según el paso actual
function actualizarVistaWizard() {
  // Ocultar todos los pasos
  $(".report-step").hide();

  // Mostrar solo el paso actual
  $(`#editStep${pasoActual}`).show();

  // Mostrar/ocultar botones según el paso

  // Botón "Atrás": mostrar si NO estamos en el primer paso
  if (pasoActual > 1) {
    $("#prevBtn").show();
  } else {
    $("#prevBtn").hide();
  }

  // Botón "Siguiente": mostrar si NO estamos en el último paso
  if (pasoActual < TOTAL_PASOS) {
    $("#nextBtn").show();
  } else {
    $("#nextBtn").hide();
  }

  // Botones "Guardar" y "Eliminar": mostrar SOLO en el último paso Y en modo editar/ver
  if (pasoActual === TOTAL_PASOS) {
    if (modoModal === "crear") {
      $("#saveBtn").show();
      $("#deleteBtn").hide(); // No eliminar cuando se crea
    } else {
      $("#saveBtn").show();
      $("#deleteBtn").show();
    }
  } else {
    $("#saveBtn").hide();
    $("#deleteBtn").hide();
  }
}

// Manejar el botón "Siguiente"
async function manejarBotonSiguiente() {
  // --- VALIDACIÓN DE USUARIO ---
  if (pasoActual === 1) {
    // Obtener los valores de teléfono y correo
    const telefono = $("#phoneLogin").val().trim();
    const correo = $("#emailLogin").val().trim();

    // Validar que ambos campos estén llenos
    if (!telefono || !correo) {
      alert("Por favor ingresa el número de teléfono y el correo electrónico.");
      return; // Detener la ejecución
    }

    // Validar formato de correo
    if (!validarEmail(correo)) {
      alert("Por favor ingresa un correo electrónico válido.");
      return;
    }

    // Validar formato de teléfono (10 dígitos)
    if (!validarTelefono(telefono)) {
      alert("Por favor ingresa un número de teléfono válido (10 dígitos).");
      return;
    }

    // Intentar validar el usuario en el servidor
    const usuarioEncontrado = await validarUsuario(telefono, correo);

    if (usuarioEncontrado) {
      // Usuario encontrado: saltar al paso 3
      pasoActual = 3;
      actualizarVistaWizard();
    } else {
      // Pre-cargar teléfono y correo en el Paso 2
      $("#editNumeroUsuario").val(telefono);
      $("#editCorreo").val(correo);

      // Asegurarse de que los campos estén desbloqueados
      desbloquearCamposUsuario();

      pasoActual = 2;
      actualizarVistaWizard();
    }
  }
  // --- REGISTRO DE NUEVO USUARIO ---
  else if (pasoActual === 2) {
    // Validar los datos del usuario antes de continuar
    if (!validarDatosUsuario()) {
      return; // Si la validación falla, no avanzar
    }

    // Registrar al usuario primero
    const registroExitoso = await registrarUsuario();

    if (registroExitoso) {
      // Si el registro fue exitoso, avanzar al paso 3
      pasoActual = 3;
      actualizarVistaWizard();
    }
  }
}

// Manejar el botón "Atrás"
function manejarBotonAtras() {
  // Si estamos en el paso 3 y hay un usuario cargado, volver al paso 1
  if (pasoActual === 3 && usuarioActualId) {
    pasoActual = 1;
  } else {
    // Retroceder un paso normalmente
    pasoActual--;
  }

  actualizarVistaWizard();
}

// ----------------------------------------------------------------------------
// FUNCIONES DE VALIDACIÓN
// ----------------------------------------------------------------------------

// Validar formato de email
function validarEmail(email) {
  // Expresión regular para validar email
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validar formato de teléfono (10 dígitos)
function validarTelefono(telefono) {
  // Expresión regular para validar 10 dígitos
  const regex = /^\d{10}$/;
  return regex.test(telefono);
}

// Validar los datos del usuario en el paso 2
function validarDatosUsuario() {
  // Obtener los valores de los campos
  const nombre = $("#editNombreUsuario").val().trim();
  const edad = $("#editEdad").val().trim();
  const sexo = $("#editSexo").val();
  const telefono = $("#editNumeroUsuario").val().trim();
  const correo = $("#editCorreo").val().trim();
  const municipio = $("#editMunicipio").val();

  // Validar que todos los campos obligatorios estén llenos
  if (!nombre) {
    alert("Por favor ingresa el nombre del usuario.");
    $("#editNombreUsuario").focus();
    return false;
  }

  if (!edad || edad < 1 || edad > 120) {
    alert("Por favor ingresa una edad válida (1-120).");
    $("#editEdad").focus();
    return false;
  }

  if (!sexo || sexo === "Seleccionar...") {
    alert("Por favor selecciona el sexo del usuario.");
    $("#editSexo").focus();
    return false;
  }

  if (!telefono || !validarTelefono(telefono)) {
    alert("Por favor ingresa un número de teléfono válido (10 dígitos).");
    $("#editNumeroUsuario").focus();
    return false;
  }

  if (!correo || !validarEmail(correo)) {
    alert("Por favor ingresa un correo electrónico válido.");
    $("#editCorreo").focus();
    return false;
  }

  if (!municipio || municipio === "Seleccionar...") {
    alert("Por favor selecciona el municipio.");
    $("#editMunicipio").focus();
    return false;
  }

  // Si todas las validaciones pasan
  return true;
}

// Validar los datos del reporte en el paso 3
function validarDatosReporte() {
  // Obtener los valores de los campos
  const numeroReportado = $("#editNumeroReportado").val().trim();
  const categoriaReporte = $("#editCategoria").val();
  const medioContacto = $("#editMedioContacto").val();

  // Validar que los campos obligatorios estén llenos
  if (!numeroReportado) {
    alert("Por favor ingresa el número reportado.");
    $("#editNumeroReportado").focus();
    return false;
  }

  if (!validarTelefono(numeroReportado)) {
    alert("El número reportado debe tener 10 dígitos.");
    $("#editNumeroReportado").focus();
    return false;
  }

  if (!categoriaReporte) {
    alert("Por favor selecciona la categoría del reporte.");
    $("#editCategoria").focus();
    return false;
  }

  if (!medioContacto) {
    alert("Por favor selecciona el medio de contacto.");
    $("#editMedioContacto").focus();
    return false;
  }

  // Validar campos condicionales según el tipo de destino
  const tipoDestino = $("#editTipoDestino").val();

  if (tipoDestino === "Tarjeta") {
    const numeroTarjeta = $("#editNumeroTarjeta").val().trim();
    if (!numeroTarjeta || numeroTarjeta.length !== 16) {
      alert("El número de tarjeta debe tener 16 dígitos.");
      $("#editNumeroTarjeta").focus();
      return false;
    }
  }

  if (tipoDestino === "Ubicacion") {
    const direccion = $("#editDireccion").val().trim();
    if (!direccion) {
      alert("Por favor ingresa la dirección o ubicación.");
      $("#editDireccion").focus();
      return false;
    }
  }

  // Si todas las validaciones pasan
  return true;
}

// ----------------------------------------------------------------------------
// FUNCIÓN PARA VALIDAR USUARIO EN EL SERVIDOR (MEJORADA)
// ----------------------------------------------------------------------------

async function validarUsuario() {
  // 1. Agarramos los valores de los inputs que pusiste en tu HTML
  const telefono = $("#phoneLogin").val().trim();
  const correo = $("#emailLogin").val().trim();

  // Validación rápida para no mandar nada vacío
  if (!telefono || !correo) {
    alert("Faltan datos. Escribe correo y teléfono.");
    return null; // Retornamos null para saber que ni se intentó
  }

  $("#nextBtn").prop("disabled", true).text("Validando...");

  try {
    // 2. Creamos el FormData (tu backend lo pide así)
    const formData = new FormData();
    formData.append("correo", correo);
    formData.append("contrasena", telefono);

    const response = await fetch(`/api/auth/login`, {
      method: "POST",
      body: formData,
      // Nota: Al usar FormData NO necesitas poner headers, el navegador lo hace solo.
      credentials: "include",
    });

    const userData = await response.json().catch(() => ({}));

    // Buscamos el ID (cubriendo todas las posibilidades donde el backend lo esconda)
    const idUsuario = userData.idusuario || userData.id;

    // --- ESCENARIO 1: EL USUARIO SÍ EXISTE (LOGIN EXITOSO) ---
    if (response.ok && idUsuario) {
      //console.log("¡Simón! Usuario validado. ID:", idUsuario);

      sessionStorage.setItem("currentUserId", idUsuario);
      usuarioActualId = idUsuario;

      // Cargar info y bloquear campos para que se vea que ya está logueado
      if (typeof cargarDatosUsuario === "function") cargarDatosUsuario(userData);

      // Bloqueamos los inputs del login para que no le muevan
      $("#phoneLogin, #emailLogin").prop("disabled", true);

      $("#nextBtn").prop("disabled", false).text("Siguiente");

      return true; // TRUE significa: "Ya existe, mándalo al final"
    }

    // --- ESCENARIO 2: NO EXISTE (TOCA REGISTRAR) ---
    else {
      //console.log("Usuario no topado, vamos a registrarlo.");
      sessionStorage.removeItem("currentUserId");
      usuarioActualId = null;

      // Preparamos los campos del SIGUIENTE paso (Registro)
      // Limpiamos nombre y edad por si había basura
      $("#editNombreUsuario, #editEdad").val("");

      // Pasamos lo que ya escribió para que no lo vuelva a escribir (UX chida)
      $("#editNumeroUsuario").val(telefono);
      $("#editCorreo").val(correo);

      if (typeof desbloquearCamposUsuario === "function") desbloquearCamposUsuario();

      $("#nextBtn").prop("disabled", false).text("Siguiente");

      return false; // FALSE significa: "No existe, mándalo a registrar"
    }
  } catch (error) {
    console.error("Chale, error en el server:", error);
    $("#nextBtn").prop("disabled", false).text("Reintentar");
    return null; // Error de conexión
  }
}
// ----------------------------------------------------------------------------
// FUNCIÓN PARA REGISTRAR NUEVO USUARIO (CIUDADANO)
// ----------------------------------------------------------------------------

async function registrarUsuario() {
  $("#nextBtn").prop("disabled", true).text("Registrando...");

  try {
    // 1. OBTENER EL ID DEL ADMIN (EL QUE ESTÁ OPERANDO)
    // Este ID es solo para saber QUIÉN hizo el registro
    let idAdminQueRegistra = null;
    try {
      const adminSession = JSON.parse(sessionStorage.getItem("usuario"));
      // Buscamos el ID del admin en su sesión actual
      idAdminQueRegistra = adminSession?.id || adminSession?.idusuario;
    } catch (e) {
      console.warn("No se detectó sesión de admin, se enviará sin ID de creador.");
    }

    // 2. OBTENER DATOS DEL CIUDADANO (DESDE EL FORMULARIO)
    const nombre = $("#editNombreUsuario").val().trim();

    // Validamos edad
    const edadVal = $("#editEdad").val();
    const edad = edadVal ? parseInt(edadVal) : 0;

    const sexo = $("#editSexo").val();

    // Usamos los inputs del paso 2 por si corrigieron el dato al escribirlo
    // Si están vacíos, usamos los del login (fallback)
    const telefono = $("#editNumeroUsuario").val().trim() || $("#phoneLogin").val().trim();
    const correo = $("#editCorreo").val().trim() || $("#emailLogin").val().trim();

    let municipio = $("#editMunicipio").val();
    if (municipio === "otro") {
      municipio = $("#otroMunicipioInput").val().trim() || "No especificado";
    }

    // 3. CONSTRUIR EL OBJETO (DATOS DEL USUARIO + FIRMA DEL ADMIN)
    const datosNuevoUsuario = {
      correo: correo,
      numeroTelefono: telefono,
      nombre: nombre,
      edad: edad,
      sexo: sexo,
      municipio: municipio,
      entidadForanea: "Chihuahua",
      contrasena: telefono, // La contraseña inicial es su teléfono
      idAdmin: idAdminQueRegistra, // Aquí va el ID del Admin que está en el panel
    };

    console.log("Enviando registro de ciudadano:", datosNuevoUsuario);

    // 4. PETICIÓN AL SERVIDOR
    const response = await fetch(`/api/auth/registrar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosNuevoUsuario),
    });

    const result = await response.json().catch(() => ({}));
    let idNuevoUsuario = null
    if (response.ok) {
      // 5. EXTRACCIÓN DEL ID DEL NUEVO USUARIO
      // Buscamos el ID en todas las estructuras posibles que pueda devolver tu API
      if (result.data.idusuario){
        idNuevoUsuario = result.data.idusuario;
      }
      if (idNuevoUsuario != null && !result.error) {
        // --- ÉXITO ---
        // Guardamos el ID del CIUDADANO en 'currentUserId' para usarlo en el reporte
        usuarioActualId = idNuevoUsuario;
        sessionStorage.setItem("currentUserId", idNuevoUsuario);

        // Actualizamos los datos globales para que el reporte se llene solo
        datosUsuarioActual = {
          nombreusuario: nombre,
          edad,
          sexo,
          numerotelefono: telefono,
          correousuario: correo,
          municipio,
          vecesreportado: 0,
        };

        // UI: Bloqueamos campos y preparamos botón
        $("#editVecesReportado").val("0");
        bloquearCamposUsuario();

        $("#nextBtn").prop("disabled", false).text("Siguiente");

        return true; // TRUE = Avanzar al paso 3 (Reporte)
      } else {
        console.error("Error en registro:", result);
        const mensajeError = result.mensaje;
        alert("No se pudo registrar al usuario: " + mensajeError);
        $("#nextBtn").prop("disabled", false).text("Siguiente");
        return false;
      }
    } else {
      alert("Error de comunicacion, reinicia la pagina");
    }
  } catch (error) {
    console.error("Error fatal en la conexión:", error);
    alert("Error de conexión. Revisa tu internet o contacta a sistemas.");
    $("#nextBtn").prop("disabled", false).text("Siguiente");
    return false;
  }
}

// ----------------------------------------------------------------------------
// FUNCIONES PARA CARGAR Y MANIPULAR DATOS DEL USUARIO
// ----------------------------------------------------------------------------

// Cargar los datos del usuario en los campos del paso 2
function cargarDatosUsuario(datosUsuario) {
  datosUsuarioActual = {
    nombreusuario: datosUsuario.nombreusuario || "",
    edad: datosUsuario.edad || "",
    sexo: datosUsuario.sexo || "",
    numerotelefono: datosUsuario.numerotelefono || "",
    correousuario: datosUsuario.correousuario || "",
    municipio: datosUsuario.municipio || "",
    vecesreportado: datosUsuario.vecesreportado || 0,
  };

  // Cargar en los campos del formulario
  $("#editNombreUsuario").val(datosUsuarioActual.nombreusuario);
  $("#editEdad").val(datosUsuarioActual.edad);
  $("#editSexo").val(datosUsuarioActual.sexo);
  $("#editNumeroUsuario").val(datosUsuarioActual.numerotelefono);
  $("#editCorreo").val(datosUsuarioActual.correousuario);
  $("#editMunicipio").val(datosUsuarioActual.municipio);
  $("#editVecesReportado").val(datosUsuarioActual.vecesreportado);
}

// Bloquear campos del usuario (solo lectura)
function bloquearCamposUsuario() {
  $("#editNombreUsuario").prop("readonly", true);
  $("#editEdad").prop("readonly", true);
  $("#editSexo").prop("disabled", true);
  $("#editNumeroUsuario").prop("readonly", true);
  $("#editCorreo").prop("readonly", true);
  $("#editMunicipio").prop("disabled", true);
  $("#editVecesReportado").prop("readonly", true);
}

// Desbloquear campos del usuario (editables)
function desbloquearCamposUsuario() {
  $("#editNombreUsuario").prop("readonly", false);
  $("#editEdad").prop("readonly", false);
  $("#editSexo").prop("disabled", false);
  $("#editNumeroUsuario").prop("readonly", false);
  $("#editCorreo").prop("readonly", false);
  $("#editMunicipio").prop("disabled", false);
  $("#editVecesReportado").prop("readonly", true); // Este siempre readonly
}

// ----------------------------------------------------------------------------
// FUNCIONES PARA ABRIR EL MODAL EN DIFERENTES MODOS
// ----------------------------------------------------------------------------

// Abrir modal en modo CREAR
function abrirModalCrear() {
  // Limpiar el modal completamente
  limpiarModal();

  // Establecer el modo
  modoModal = "crear";
  reporteActualId = null;
  usuarioActualId = null;

  // Cambiar el título del modal
  $("#adminModalLabel").text("Crear Nuevo Reporte");
  $("#folio-display").text("");

  // Mostrar el modal
  $("#adminReporteModal").modal("show");
}

// Abrir modal en modo VER/EDITAR
async function abrirModalVer(reporteId) {
  // Limpiar el modal completamente
  limpiarModal();

  // Establecer el modo
  modoModal = "ver";
  reporteActualId = reporteId;

  // Cambiar el título del modal
  $("#adminModalLabel").text("Cargando datos...");

  // Mostrar el modal
  $("#adminReporteModal").modal("show");

  // Mostrar indicador de carga
  $("#adminModalLabel").text(`Cargando reporte #${reporteId}...`);

  // Cargar los datos completos del reporte
  const datosCompletos = await cargarReporteCompleto(reporteId);

  if (datosCompletos) {
    // Cambiar el título al folio
    $("#adminModalLabel").text(`Reporte #${reporteId}`);
    $("#folio-display").text(reporteId);

    // Cargar los datos en el formulario
    cargarDatosReporte(datosCompletos);

    // Ir directamente al paso 3 (detalles del reporte)
    pasoActual = 3;

    // El wizard actualiza la vista (y normalmente muestra los botones)
    actualizarVistaWizard();

    $("#prevBtn").hide();
    // (Asegúrate que tu botón en el HTML tenga id="prevBtn")

    // Bloquear algunos campos en modo ver
    bloquearCamposVer();

    console.log("Modal cargado completamente");
  } else {
    // Si no se pudieron cargar los datos, cerrar el modal
    console.error("No se pudieron cargar los datos del reporte");
    $("#adminReporteModal").modal("hide");
    alert("No se pudieron cargar los datos del reporte. Por favor, intente nuevamente.");
  }
}

// ----------------------------------------------------------------------------
// FUNCIÓN PARA CARGAR REPORTE COMPLETO DESDE EL SERVIDOR
// ----------------------------------------------------------------------------

async function cargarReporteCompleto(reporteId) {
  try {
    // Hacer la petición al servidor
    const response = await fetch(`/api/incidencias/incidencia_completa/${reporteId}`);

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }

    // Obtener los datos en formato JSON
    const dataArray = await response.json();

    // Verificar que se haya encontrado el reporte
    if (!dataArray || dataArray.length === 0) {
      throw new Error("No se encontró ningún reporte con ese ID.");
    }

    const reporteCompleto = dataArray[0];
    // Mostrar todas las claves disponibles
    return reporteCompleto;
  } catch (error) {
    alert("No se pudo cargar el reporte completo. ");
    return null;
  }
}

// ----------------------------------------------------------------------------
// FUNCIÓN PARA CARGAR DATOS DEL REPORTE EN EL FORMULARIO
// ----------------------------------------------------------------------------

function cargarDatosReporte(datos) {
  // --- DATOS DEL USUARIO (Paso 2) ---
  $("#editNombreUsuario").val(datos.nombre || "");
  $("#editVecesReportado").val(datos.vecesreportado || 0);
  $("#editEdad").val(datos.edad || "");
  $("#editSexo").val(datos.sexo || "");
  $("#editNumeroUsuario").val(datos.numerotelefono || datos.numeroTelefono || "");
  $("#editCorreo").val(datos.email || "");
  $("#editMunicipio").val(datos.municipio || "");

  // Campo Via (nombreadmin)
  $("#Via").val(datos.nombre || "");

  // Guardar el ID del usuario si está disponible (buscando en diferentes nombres de campo)
  if (datos.idusuario) {
    usuarioActualId = datos.idusuario;
  }
  // --- DATOS DEL REPORTE (Paso 3) ---
  $("#editNumeroReportado").val(datos.numeroreportado || datos.numeroReportado || "");

  // Formatear la fecha
  let fechaReporte = datos.fechareporte || datos.fechaReporte;
  if (fechaReporte) {
    const fechaCorta = fechaReporte.split("T")[0];
    $("#editFechaReporte").val(fechaCorta);
  } else {
    $("#editFechaReporte").val("");
  }

  // Categoría
  $("#editCategoria").val(datos.categoriareporte || datos.categoriaReporte || "Extorsión");

  // Medio de contacto
  $("#editMedioContacto").val(datos.mediocontacto || datos.medioContacto || "llamada");

  // Descripción
  $("#editDescripcion").val(datos.descripcion || "");

  // Supuesto nombre
  $("#editSupuestoNombre").val(datos.supuestonombre || datos.supuestoNombre || "");

  // Género
  $("#editSupuestoGenero").val(datos.genero || datos.supuestoGenero || "No especificado");

  // Supuesto trabajo
  $("#editSupuestoTrabajo").val(datos.supuestotrabajo || datos.supuestoTrabajo || "");

  // Estatus
  $("#editEstatus").val(datos.estatus || "Pendiente");

  // --- DATOS DE DESTINO ---
  const tipoDestino = datos.tipodestino || datos.tipoDestino || "Ninguno";
  $("#editTipoDestino").val(tipoDestino).trigger("change"); // Trigger para mostrar/ocultar campos

  // Número de tarjeta
  $("#editNumeroTarjeta").val(datos.numerotarjeta || datos.numero_tarjeta || "");

  // Dirección
  $("#editDireccion").val(datos.direccion || "");
}

// ----------------------------------------------------------------------------
// FUNCIÓN PARA BLOQUEAR CAMPOS EN MODO VER
// ----------------------------------------------------------------------------

function bloquearCamposVer() {
  // Bloquear campos de usuario
  bloquearCamposUsuario();

  // Bloquear algunos campos del reporte
  $("#editNumeroReportado").prop("readonly", true);
  $("#Via").prop("readonly", true);

  // El estatus sí puede editarse en modo ver
  $("#editEstatus").prop("disabled", false);
}

// ----------------------------------------------------------------------------
// FUNCIÓN PARA LIMPIAR EL MODAL COMPLETAMENTE
// ----------------------------------------------------------------------------

function limpiarModal() {
  reporteActualId = null;
  const $formulario = $("#editReportForm");

  // Validamos si existe antes de resetear para que no truene
  if ($formulario.length > 0) {
    $formulario[0].reset();
  } else {
    console.warn("No se encontró el formulario #editReportForm para limpiar.");
  }

  // Resucitar el botón de Atrás
  $("#prevBtn").show();

  // Limpiar variables de control
  reporteActualId = null;
  usuarioActualId = null;
  datosUsuarioActual = null;
  modoModal = "ver";
  pasoActual = 1;

  // Limpiar campos específicos que no se limpian con reset()
  $("#folio-display").text("");
  $("#reporteId").val("");

  // Limpiar campos del Paso 1
  $("#phoneLogin").val("");
  $("#emailLogin").val("");

  // Resetear selects a su valor por defecto
  $("#editSexo").val("Seleccionar...");
  $("#editMunicipio").val("Seleccionar...");
  $("#editCategoria").val("Extorsión");
  $("#editMedioContacto").val("llamada");
  $("#editSupuestoGenero").val("No especificado");
  $("#editEstatus").val("Pendiente");
  $("#editTipoDestino").val("Ninguno").trigger("change");

  // Ocultar contenedores condicionales
  $("#tarjetaContainer").hide();
  $("#ubicacionContainer").hide();

  // Desbloquear todos los campos (por si estaban bloqueados)
  desbloquearCamposUsuario();
  $("#editNumeroReportado").prop("readonly", false);
  $("#editEstatus").prop("disabled", false);
  $("#Via").prop("readonly", false);

  // Limpiar sessionStorage
  sessionStorage.removeItem("currentUserId");

  // Resetear el wizard al paso 1
  actualizarVistaWizard();
}

// ----------------------------------------------------------------------------
// FUNCIÓN PARA GUARDAR EL REPORTE (CREAR O ACTUALIZAR) - CORREGIDA
// ----------------------------------------------------------------------------

async function guardarReporte() {
  // Validar los datos del reporte antes de guardar
  if (!validarDatosReporte()) {
    return; // Si la validación falla, no continuar
  }

  // Determinar si es crear o actualizar
  const esCrear = !reporteActualId;

  const datosReporte = construirObjetoReporte(esCrear);

  //console.log("Datos reporte ANTES de limpieza:", datosReporte);

  // Validación adicional de campos requeridos SOLO para creación
  // if (esCrear) {
  //   const camposRequeridosCreacion = ["idusuario", "numeroreportado", "categoriareporte", "mediocontacto"];
  //   const camposFaltantes = camposRequeridosCreacion.filter((campo) => !datosReporte[campo]);

  //   if (camposFaltantes.length > 0) {
  //     alert(`Faltan campos requeridos para crear reporte:\n${camposFaltantes.join(", ")}`);
  //     console.error("Campos faltantes para creación:", camposFaltantes);
  //     return;
  //   }
  // }

  let url = `/api/incidencias/crear`;
  let metodo = "POST";

  if (!esCrear) {
    url = `/api/incidencias/modificar/${reporteActualId}`;
    metodo = "PUT";

    // Eliminar campos del usuario que no deberían modificarse
    delete datosReporte.idUsuario;
    delete datosReporte.idusuario;
    delete datosReporte.categoriaReporte;
    delete datosReporte.nombreusuario;
    delete datosReporte.medioContacto;
    delete datosReporte.direccion;
    delete datosReporte.numeroReportado;
    delete datosReporte.fechaReporte;
    delete datosReporte.descripcion;
    delete datosReporte.edad;
    delete datosReporte.supuestoNombre;
    delete datosReporte.supuestoTrabajo;
    delete datosReporte.tipoDestino;
    delete datosReporte.numeroTarjeta;
    delete datosReporte.genero;
    delete datosReporte.sexo;
    delete datosReporte.numerotelefono;
    delete datosReporte.correousuario;
    delete datosReporte.municipio;
  }

  const headers = {
    "Content-Type": "application/json",
  };

  const token = sessionStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    console.log(`Enviando ${metodo} a ${url}`);
    console.log("Datos a enviar:", datosReporte);

    const response = await fetch(url, {
      method: metodo,
      headers: headers,
      body: JSON.stringify(datosReporte),
    });

    if (!response.ok) {
      const errorData = await response.json();
      let mensajeError = `Error ${response.status}:\n`;

      if (errorData.detail) {
        if (Array.isArray(errorData.detail)) {
          errorData.detail.forEach((err, index) => {
            const campo = err.loc ? err.loc[err.loc.length - 1] : "campo";
            const msg = err.msg || "Error de validación";
            mensajeError += `${index + 1}. ${campo}: ${msg}\n`;
          });
        } else {
          mensajeError += errorData.detail;
        }
      } else {
        mensajeError += JSON.stringify(errorData);
      }

      throw new Error(mensajeError);
    }

    const resultado = await response.json();
    console.log("Respuesta del servidor:", resultado);

    // Cerrar modales y limpiar
    $("#confirmationModal").modal("hide");
    $("#adminReporteModal").modal("hide");
    tabla.ajax.reload();
    limpiarModal();

    // Mostrar mensaje de éxito
    setTimeout(() => {
      alert(`Reporte ${esCrear ? "creado" : "actualizado"} exitosamente`);
    }, 300);
  } catch (error) {
    console.error("Error al guardar:", error);
    alert(`Error al ${esCrear ? "crear" : "actualizar"} el reporte:\n${error.message}`);
  }
}

// ----------------------------------------------------------------------------
// FUNCIÓN PARA CONSTRUIR EL OBJETO DE DATOS DEL REPORTE (MEJORADA)
// ----------------------------------------------------------------------------

function construirObjetoReporte(esCrear = true) {
  console.log(`Construyendo reporte (${esCrear ? "CREAR" : "MODIFICAR"})`);

  // 1. INTENTAMOS SACAR EL ID DE SESSION STORAGE
  let idFinal = sessionStorage.getItem("currentUserId");

  // 2. SI NO ESTÁ EN SESSION, BUSCAMOS EN LA VARIABLE GLOBAL
  if (!idFinal || idFinal === "undefined" || idFinal === "null") {
    // Si usuarioActualId es un objeto, sacamos el ID, si es texto, lo usamos directo
    if (usuarioActualId && typeof usuarioActualId === "object") {
      idFinal = usuarioActualId.id;
    } else {
      idFinal = usuarioActualId;
    }
  }

  // 3. LIMPIEZA DE BASURA (Por si quedó guardado [object Object])
  if (idFinal === "[object Object]") {
    console.warn("ID corrupto detectado. Intentando limpiar...");
    // Si tenemos el objeto global con datos, lo rescatamos de ahí
    if (datosUsuarioActual && datosUsuarioActual.id) {
      idFinal = datosUsuarioActual.id;
    } else {
      idFinal = null; // No se pudo rescatar
    }
  }

  console.log("🆔 UUID Detectado:", idFinal);

  // Validación: Que sea string y no sea basura
  if (esCrear) {
    if (!idFinal || typeof idFinal !== "string" || idFinal.length < 5) {
      console.error("ERROR: No hay ID válido para el reporte.", idFinal);
      alert("Error: No se ha detectado el usuario. Por favor recarga la página e intenta de nuevo.");
      return null;
    }
  }

  // OBJETO CON CAMPOS EN MINÚSCULAS
  const datos = {
    idUsuario: idFinal, // Aquí va el UUID limpio
    numeroReportado: $("#editNumeroReportado").val().trim() || null,
    categoriaReporte: $("#editCategoria").val() || null,
    medioContacto: $("#editMedioContacto").val() || null,

    fechaReporte: $("#editFechaReporte").val() || (esCrear ? new Date().toISOString().split("T")[0] : null),
    descripcion: $("#editDescripcion").val().trim() || null,
    supuestoNombre: $("#editSupuestoNombre").val().trim() || null,
    genero: $("#editSupuestoGenero").val() || "No especificado",
    supuestoTrabajo: $("#editSupuestoTrabajo").val().trim() || null,
    estatus: $("#editEstatus").val() || "Pendiente",

    tipoDestino: $("#editTipoDestino").val() || null,
    numeroTarjeta: $("#editNumeroTarjeta").val().trim() || null,
    direccion: $("#editDireccion").val().trim() || null,
  };

  // LIMPIEZA CONDICIONAL
  if (datos.tipoDestino === "Ninguno" || !datos.tipoDestino) {
    datos.tipoDestino = null;
    datos.numeroTarjeta = null;
    datos.direccion = null;
  } else if (datos.tipoDestino === "tarjeta") {
    datos.direccion = null;
  } else if (datos.tipoDestino === "ubicacion") {
    datos.numeroTarjeta = null;
  }

  if (!esCrear) delete datos.idUsuario;

  console.log("Datos reporte listos:", datos);
  return datos;
}
// ----------------------------------------------------------------------------
// FUNCIÓN PARA ELIMINAR EL REPORTE
// ----------------------------------------------------------------------------

async function eliminarReporte() {
  // Verificar que haya un ID de reporte
  if (!reporteActualId) {
    alert("Error: No se encontró el ID del reporte. No se puede eliminar.");
    return;
  }

  // Definir la URL del endpoint
  const url = `/api/incidencias/eliminar/${reporteActualId}`;

  try {
    // Hacer la petición al servidor
    const response = await fetch(url, {
      method: "DELETE",
    });

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "No se pudo eliminar el reporte.");
    }
    // Cerrar todos los modales
    $("#confirmationModalDelete").modal("hide");
    $("#adminReporteModal").modal("hide");

    // Recargar la tabla
    tabla.ajax.reload();

    // Limpiar el modal
    limpiarModal();
  } catch (error) {
    console.error("Error al eliminar:", error);
  }
}

// ----------------------------------------------------------------------------
// FUNCIÓN PARA CERRAR SESIÓN
// ----------------------------------------------------------------------------

function cerrarSesion(e) {
  e.preventDefault();
  // Limpiar sessionStorage y localStorage
  sessionStorage.clear();
  // Redirigir al login
  window.location.href = "../loginAdmin.html";
}

// ----------------------------------------------------------------------------
// 20. FUNCIÓN PARA VERIFICAR PERMISOS (SUPER ADMIN)
// ----------------------------------------------------------------------------

function verificarPermisos() {
  // Obtener el rol del usuario desde sessionStorage
  const rol = sessionStorage.getItem("userRole");

  // Si NO es super admin, ocultar elementos específicos
  if (rol !== "superadmin") {
    console.log("Usuario no es super admin, ocultando elementos");

    // Ocultar todos los elementos con la clase 'super-admin-only'
    document.querySelectorAll(".super-admin-only").forEach((elemento) => {
      elemento.style.setProperty("display", "none", "important");
    });
  } else {
    console.log("Usuario es super admin");
  }
}
function verificarPermisos() {
  // Obtener el rol del usuario desde sessionStorage
  const rol = sessionStorage.getItem("userRole");
  const usuarioString = sessionStorage.getItem("usuario");

  // Si NO hay rol en sessionStorage, intentar extraer de otras fuentes
  if (!rol && usuarioString) {
    try {
      const usuario = JSON.parse(usuarioString);
      const rolUsuario = usuario.rol || usuario.role || usuario.tipousuario;

      if (rolUsuario) {
        sessionStorage.setItem("userRole", rolUsuario);
        aplicarPermisos(rolUsuario);
        return;
      }
    } catch (error) {
      console.error("Error al parsear usuario:", error);
    }
  }

  aplicarPermisos(rol);
}

// Función auxiliar para aplicar permisos
function aplicarPermisos(rol) {
  // Si NO es super admin, ocultar elementos específicos
  if (rol !== "superadmin" && rol !== "super_admin" && rol !== "superadmin" && rol !== "admin_super") {
    // Ocultar todos los elementos con la clase 'super-admin-only'
    document.querySelectorAll(".super-admin-only").forEach((elemento) => {
      elemento.style.setProperty("display", "none", "important");
    });
    document.body.classList.add("no-super-admin");
  } else {
    // Mostrar elementos de super admin
    document.querySelectorAll(".super-admin-only").forEach((elemento) => {
      elemento.style.removeProperty("display");
      elemento.style.display = "block";
    });

    document.body.classList.add("super-admin");
  }
}
