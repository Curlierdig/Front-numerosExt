// Variable para almacenar la instancia de DataTable
let tabla = null;

// Variable para controlar el modo del modal (crear/editar/ver)
let modoModal = "ver";

// Variable para almacenar el ID del reporte actual
let reporteActualId = null;

// Variable para almacenar el ID del usuario actual
let usuarioActualId = null;

let datosUsuarioActual = null;

// Paso actual del wizard (1, 2 o 3)
let pasoActual = 1;

// Total de pasos en el wizard
const TOTAL_PASOS = 3;

// ----------------------------------------------------------------------------
// 2. FUNCIÓN DE INICIALIZACIÓN (SE EJECUTA CUANDO EL DOM ESTÁ LISTO)
// ----------------------------------------------------------------------------

$(document).ready(function () {
  //console.log("Iniciando sistema de reportes...");
  const token = sessionStorage.getItem("token");
  const usuario = sessionStorage.getItem("usuario");

  // Si no hay token ni usuario, redirigir al login
  if (!token && !usuario) {
    window.location.href = "/front/loginAdmin.html";
    return; // Detener la ejecución del resto del código
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
// 3. FUNCIÓN PARA CARGAR EL NOMBRE DEL ADMINISTRADOR
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

      // Buscar el nombre en diferentes propiedades posibles
      let nombreAdmin = "Admin";

      if (usuario.nombre) {
        nombreAdmin = usuario.nombre;
        //console.log("Nombre encontrado en usuario.nombre:", nombreAdmin);
      } else if (usuario.nombreadmin) {
        nombreAdmin = usuario.nombreadmin;
        //console.log("Nombre encontrado en usuario.nombreadmin:", nombreAdmin);
      } else if (usuario.nombre_admin) {
        nombreAdmin = usuario.nombre_admin;
        //console.log("Nombre encontrado en usuario.nombre_admin:", nombreAdmin);
      } else if (usuario.username) {
        nombreAdmin = usuario.username;
        //console.log("Nombre encontrado en usuario.username:", nombreAdmin);
      } else if (usuario.correo) {
        // Si solo hay correo, usar la parte antes del @
        nombreAdmin = usuario.correo.split("@")[0];
        //console.log("Nombre derivado del correo:", nombreAdmin);
      }

      // Guardar el nombre en el elemento HTML
      $("#adminUserName").text(nombreAdmin);

      // También guardar el rol
      if (usuario.rol || usuario.role || usuario.tipousuario) {
        const rol = usuario.rol || usuario.role || usuario.tipousuario;
        sessionStorage.setItem("userRole", rol);
        //console.log("Rol del usuario:", rol);
      }

      return;
    } catch (error) {
      //console.error("Error al parsear usuario:", error);
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
        } else if (payload.name) {
          nombreAdmin = payload.name;
        } else if (payload.sub) {
          nombreAdmin = payload.sub; // subject suele ser el username
        } else if (payload.email) {
          nombreAdmin = payload.email.split("@")[0];
        }

        $("#adminUserName").text(nombreAdmin);
        //console.log("Nombre extraído del token:", nombreAdmin);

        // Extraer rol del token si existe
        if (payload.rol) {
          sessionStorage.setItem("userRole", payload.rol);
          //console.log("Rol extraído del token:", payload.rol);
        } else if (payload.role) {
          sessionStorage.setItem("userRole", payload.role);
          //console.log("Rol extraído del token:", payload.role);
        } else if (payload.tipousuario) {
          sessionStorage.setItem("userRole", payload.tipousuario);
          //console.log("Rol extraído del token:", payload.tipousuario);
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
      } else if (userData.nombreadmin) {
        nombreAdmin = userData.nombreadmin;
      } else if (userData.nombre_admin) {
        nombreAdmin = userData.nombre_admin;
      } else if (userData.username) {
        nombreAdmin = userData.username;
      } else if (userData.correo) {
        nombreAdmin = userData.correo.split("@")[0];
      }

      $("#adminUserName").text(nombreAdmin);

      // Guardar rol
      if (userData.rol) {
        sessionStorage.setItem("userRole", userData.rol);
      } else if (userData.role) {
        sessionStorage.setItem("userRole", userData.role);
      } else if (userData.tipousuario) {
        sessionStorage.setItem("userRole", userData.tipousuario);
      }
    } else {
      console.warn("No se pudo obtener perfil, usando valor por defecto");
      $("#adminUserName").text("Admin");
    }
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    $("#adminUserName").text("Admin");
  }
}

// ----------------------------------------------------------------------------
// 4. FUNCIÓN PARA INICIALIZAR LA TABLA DE REPORTES (DATATABLE)
// ----------------------------------------------------------------------------

function inicializarTabla() {
  // Inicializar DataTable con configuración
  tabla = $("#tablaReportes").DataTable({
    // Configuración de AJAX para cargar datos desde el servidor
    ajax: {
      url: `/api/incidencias/filtrar`,
      dataSrc: "data", // Propiedad del JSON que contiene los datos
      error: function (xhr, error, code) {
        // Función que se ejecuta si hay error al cargar datos
        console.error("Error al cargar datos:", error);
      },
    },

    // Definición de columnas
    columns: [
      // Columna 1: ID (oculta)
      {
        data: "idreporte",
        visible: false, // No se muestra en la tabla
        searchable: false, // No se puede buscar por esta columna
      },
      // Columna 2: Nombre del Usuario
      {
        data: "nombre_usuario",
        className: "text-center", // Centrar el texto
      },
      // Columna 3: Número Reportado
      {
        data: "numeroreportado",
        className: "text-center",
      },
      // Columna 4: Categoría
      {
        data: "categoriareporte",
        className: "text-center",
      },
      // Columna 5: Fecha del Reporte
      {
        data: "fechareporte",
        className: "text-center",
      },
      // Columna 6: Estatus (con formato de badge)
      {
        data: "estatus",
        className: "text-center",
        render: function (data, type, row) {
          // Función para personalizar cómo se muestra el estatus
          let color = "secondary"; // Color por defecto
          let textColor = ""; // Color del texto

          // Asignar color según el estatus
          if (data === "Pendiente") {
            color = "warning";
            textColor = "text-dark"; // Texto oscuro para amarillo
          } else if (data === "Resuelto") {
            color = "success";
          } else if (data === "En Proceso") {
            color = "info";
          } else if (data === "Descartado") {
            color = "dark";
          }

          // Retornar el HTML del badge
          return `<span class="badge bg-${color} ${textColor}">${data}</span>`;
        },
      },
      // Columna 7: Botón de Acciones
      {
        data: null, // No viene de los datos, es generada
        orderable: false, // No se puede ordenar por esta columna
        searchable: false, // No se puede buscar por esta columna
        render: function (data, type, row) {
          // Crear botón Ver/Editar con el ID del reporte
          return `<button class="btn btn-sm btn-primary btn-ver-reporte" data-id="${row.idreporte}">
                    <i class="bi bi-pencil-square"></i> Ver/Editar
                  </button>`;
        },
      },
    ],

    // Configuración de idioma (español)
    language: {
      url: "https://cdn.datatables.net/plug-ins/2.0.5/i18n/es-MX.json",
    },

    // Hacer la tabla responsive (adaptable a móviles)
    responsive: true,

    // Configuración del layout (botones de exportar, longitud de página)
    layout: {
      topStart: {
        buttons: ["csv", "excel", "pdf", "print"], // Botones de exportación
      },
      topEnd: "pageLength", // Selector de número de registros por página
    },

    // Opciones de cantidad de registros por página
    lengthMenu: [50, 75, 100],

    // Cantidad inicial de registros por página
    pageLength: 50,
  });
}

// ----------------------------------------------------------------------------
// 5. FUNCIÓN PARA CONFIGURAR TODOS LOS EVENT LISTENERS
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
// 6. FUNCIONES DEL WIZARD (NAVEGACIÓN ENTRE PASOS)
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
  // --- PASO 1: VALIDACIÓN DE USUARIO ---
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
      // IMPORTANTE: Pre-cargar teléfono y correo en el Paso 2
      $("#editNumeroUsuario").val(telefono);
      $("#editCorreo").val(correo);

      // Asegurarse de que los campos estén desbloqueados
      desbloquearCamposUsuario();

      pasoActual = 2;
      actualizarVistaWizard();
    }
  }
  // --- PASO 2: REGISTRO DE NUEVO USUARIO ---
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
// 7. FUNCIONES DE VALIDACIÓN
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
  const fechaReporte = $("#editFechaReporte").val().trim();
  const categoria = $("#editCategoria").val();
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

  if (!fechaReporte) {
    alert("Por favor selecciona la fecha del reporte.");
    $("#editFechaReporte").focus();
    return false;
  }

  if (!categoria) {
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
// 8. FUNCIÓN PARA VALIDAR USUARIO EN EL SERVIDOR
// ----------------------------------------------------------------------------

async function validarUsuario(telefono, correo) {
  // Deshabilitar el botón mientras se valida
  $("#nextBtn").prop("disabled", true).text("Validando...");

  try {
    // Crear FormData para enviar al servidor
    const formData = new FormData();
    formData.append("correo", correo);
    formData.append("contrasena", telefono); // Se usa el teléfono como contraseña

    // Hacer la petición al servidor
    const response = await fetch(`/api/auth/login`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const userData = await response.json();

    // Buscar el ID del usuario en diferentes ubicaciones del JSON
    const idUsuario = userData.id || (userData.user && userData.user.id) || (userData.data && userData.data.id);

    // Determinar qué objeto contiene los datos del usuario
    const datosUsuario = userData.id ? userData : userData.user || userData.data || {};

    // Si el usuario fue encontrado y autenticado
    if (response.ok && idUsuario) {
      // Guardar el ID del usuario
      usuarioActualId = idUsuario;
      sessionStorage.setItem("currentUserId", idUsuario);

      // Cargar los datos del usuario en los campos del paso 2
      cargarDatosUsuario(datosUsuario);

      // Bloquear los campos del paso 2 (solo lectura)
      bloquearCamposUsuario();

      // Habilitar el botón nuevamente
      $("#nextBtn").prop("disabled", false).text("Siguiente");

      // Retornar true para indicar que el usuario fue encontrado
      return true;
    } else {
      // Limpiar el ID del usuario
      usuarioActualId = null;
      sessionStorage.removeItem("currentUserId");

      // IMPORTANTE: Limpiar los campos del Paso 2 primero
      $("#editNombreUsuario").val("");
      $("#editEdad").val("");
      $("#editSexo").val("Seleccionar...");
      $("#editMunicipio").val("Seleccionar...");
      $("#editVecesReportado").val("0");

      // Ahora pre-llenar teléfono y correo del paso 1
      $("#editNumeroUsuario").val(telefono);
      $("#editCorreo").val(correo);

      // Desbloquear los campos del paso 2 para que pueda llenarlos
      desbloquearCamposUsuario();

      // Habilitar el botón nuevamente
      $("#nextBtn").prop("disabled", false).text("Siguiente");

      // Retornar false para indicar que el usuario no fue encontrado
      return false;
    }
  } catch (error) {
    // Si hay un error de red o del servidor
    console.error("Error al validar usuario:", error);
    alert("Error de conexión al validar el usuario. Por favor, intente nuevamente.");

    // Habilitar el botón nuevamente
    $("#nextBtn").prop("disabled", false).text("Siguiente");

    return false;
  }
}

// ----------------------------------------------------------------------------
// 9. FUNCIÓN PARA REGISTRAR NUEVO USUARIO
// ----------------------------------------------------------------------------

async function registrarUsuario() {
  // Deshabilitar el botón mientras se registra
  $("#nextBtn").prop("disabled", true).text("Registrando...");

  try {
    // Obtener los valores del formulario
    const nombre = $("#editNombreUsuario").val().trim();
    const edad = parseInt($("#editEdad").val());
    const sexo = $("#editSexo").val();
    const telefono = $("#editNumeroUsuario").val().trim();
    const correo = $("#editCorreo").val().trim();
    let municipio = $("#editMunicipio").val();

    // Manejar el caso "otro" municipio (si aplica)
    if (municipio === "otro") {
      municipio = $("#otroMunicipioInput") ? $("#otroMunicipioInput").val().trim() : "No especificado";
    }

    // Crear objeto con los datos del usuario
    const datosUsuario = {
      correo: correo,
      numeroTelefono: telefono,
      nombre: nombre,
      edad: edad,
      sexo: sexo,
      municipio: municipio,
      entidadForanea: "Chihuahua",
      contrasena: telefono,
    };

    // Hacer la petición de registro
    const response = await fetch(`/api/auth/registrar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosUsuario),
    });

    // Obtener la respuesta
    const result = await response.json();

    if (response.ok) {
      let usuarioId = null;

      if (Array.isArray(result) && result.length > 0) {
        const usuarioData = result[0];
        usuarioId = usuarioData.idusuario || usuarioData.id;
        //console.log("Extraído ID del usuario del array:", usuarioId);
      } else if (result.idusuario || result.id) {
        // Si es un objeto simple
        usuarioId = result.idusuario || result.id;
      }

      if (!usuarioId) {
        throw new Error("No se pudo obtener el ID del usuario de la respuesta");
      }
      // Guardar el ID del nuevo usuario (como string, no como array)
      usuarioActualId = usuarioId;
      sessionStorage.setItem("currentUserId", usuarioId);

      // Guardar también los datos del usuario en la variable global
      datosUsuarioActual = {
        nombreusuario: nombre,
        edad: edad,
        sexo: sexo,
        numerotelefono: telefono,
        correousuario: correo,
        municipio: municipio,
        vecesreportado: 0,
      };

      // Actualizar el campo de veces reportado
      $("#editVecesReportado").val("0");

      // Bloquear los campos del paso 2 (solo lectura)
      bloquearCamposUsuario();

      // Habilitar el botón nuevamente
      $("#nextBtn").prop("disabled", false).text("Siguiente");

      return true;
    } else {
      let mensajeError = "Error al registrar usuario: ";

      if (result.detail && Array.isArray(result.detail)) {
        const errores = result.detail
          .map((err) => {
            const campo = err.loc ? err.loc[err.loc.length - 1] : "campo";
            const msg = err.msg || "Error de validación";
            return `${campo}: ${msg}`;
          })
          .join("\n");

        mensajeError += "\n" + errores;
      } else if (result.detail) {
        mensajeError += result.detail;
      } else {
        mensajeError += JSON.stringify(result);
      }

      // Habilitar el botón nuevamente
      $("#nextBtn").prop("disabled", false).text("Siguiente");

      return false;
    }
  } catch (error) {
    alert("Error al registrar el usuario");

    // Habilitar el botón nuevamente
    $("#nextBtn").prop("disabled", false).text("Siguiente");

    return false;
  }
}
// ----------------------------------------------------------------------------
// 10. FUNCIONES PARA CARGAR Y MANIPULAR DATOS DEL USUARIO
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
// 11. FUNCIONES PARA ABRIR EL MODAL EN DIFERENTES MODOS
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
    actualizarVistaWizard();

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
// 12. FUNCIÓN PARA CARGAR REPORTE COMPLETO DESDE EL SERVIDOR
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
// 13. FUNCIÓN PARA CARGAR DATOS DEL REPORTE EN EL FORMULARIO
// ----------------------------------------------------------------------------

function cargarDatosReporte(datos) {
  // --- DATOS DEL USUARIO (Paso 2) ---
  $("#editNombreUsuario").val(datos.nombreusuario || datos.nombre || datos.nombre_usuario || "");
  $("#editVecesReportado").val(datos.vecesreportado || datos.veces_reportado || 0);
  $("#editEdad").val(datos.edad || "");
  $("#editSexo").val(datos.sexo || "");
  $("#editNumeroUsuario").val(datos.numerotelefono || datos.numeroTelefono || datos.telefono || "");
  $("#editCorreo").val(datos.correousuario || datos.correo || datos.email || "");
  $("#editMunicipio").val(datos.municipio || "");

  // Campo Via (nombreadmin) - puede venir con diferentes nombres
  $("#Via").val(datos.nombreadmin || datos.nombre_admin || datos.admin || "");

  // Guardar el ID del usuario si está disponible (buscando en diferentes nombres de campo)
  if (datos.idusuario) {
    usuarioActualId = datos.idusuario;
  } else if (datos.idUsuario) {
    usuarioActualId = datos.idUsuario;
  } else if (datos.userId) {
    usuarioActualId = datos.userId;
  } else if (datos.usuario_id) {
    usuarioActualId = datos.usuario_id;
  }

  // --- DATOS DEL REPORTE (Paso 3) ---
  $("#editNumeroReportado").val(datos.numeroreportado || datos.numeroReportado || "");

  // Formatear la fecha (quitar la hora si viene en formato ISO)
  let fechaReporte = datos.fechareporte || datos.fechaReporte || datos.fecha_reporte;
  if (fechaReporte) {
    const fechaCorta = fechaReporte.split("T")[0];
    $("#editFechaReporte").val(fechaCorta);
  } else {
    $("#editFechaReporte").val("");
  }

  // Categoría - probar diferentes nombres de campo
  $("#editCategoria").val(datos.categoriareporte || datos.categoriaReporte || datos.categoria || "Extorsión");

  // Medio de contacto - probar diferentes nombres de campo
  $("#editMedioContacto").val(datos.mediocontacto || datos.medioContacto || datos.medio_contacto || "llamada");

  // Descripción
  $("#editDescripcion").val(datos.descripcion || "");

  // Supuesto nombre
  $("#editSupuestoNombre").val(datos.supuestonombre || datos.supuestoNombre || datos.supuesto_nombre || "");

  // Género
  $("#editSupuestoGenero").val(datos.genero || datos.supuestoGenero || datos.supuesto_genero || "No especificado");

  // Supuesto trabajo
  $("#editSupuestoTrabajo").val(datos.supuestotrabajo || datos.supuestoTrabajo || datos.supuesto_trabajo || "");

  // Estatus
  $("#editEstatus").val(datos.estatus || datos.status || "Pendiente");

  // --- DATOS DE DESTINO ---
  const tipoDestino = datos.tipodestino || datos.tipoDestino || datos.tipo_destino || "Ninguno";
  $("#editTipoDestino").val(tipoDestino).trigger("change"); // Trigger para mostrar/ocultar campos

  // Número de tarjeta
  $("#editNumeroTarjeta").val(datos.numerotarjeta || datos.numeroTarjeta || datos.numero_tarjeta || "");

  // Dirección
  $("#editDireccion").val(datos.direccion || "");
}

// ----------------------------------------------------------------------------
// 14. FUNCIÓN PARA BLOQUEAR CAMPOS EN MODO VER
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
// 15. FUNCIÓN PARA LIMPIAR EL MODAL COMPLETAMENTE
// ----------------------------------------------------------------------------

function limpiarModal() {
  // Resetear el formulario (limpia todos los inputs)
  const formulario = document.getElementById("editReportForm");
  if (formulario) {
    formulario.reset();
  }

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
// 16. FUNCIÓN PARA GUARDAR EL REPORTE (CREAR O ACTUALIZAR)
// ----------------------------------------------------------------------------

async function guardarReporte() {
  // Validar los datos del reporte antes de guardar
  if (!validarDatosReporte()) {
    return; // Si la validación falla, no continuar
  }

  // Determinar si es crear o actualizar
  const esCrear = !reporteActualId;

  const datosReporte = construirObjetoReporte(esCrear);

  // Validación adicional de campos requeridos SOLO para creación
  if (esCrear) {
    const camposRequeridosCreacion = ["idUsuario", "numeroReportado", "categoriaReporte", "medioContacto"];
    const camposFaltantes = camposRequeridosCreacion.filter((campo) => !datosReporte[campo]);

    if (camposFaltantes.length > 0) {
      alert(`Faltan campos requeridos para crear reporte:\n${camposFaltantes.join(", ")}`);
      console.error("Campos faltantes para creación:", camposFaltantes);
      return;
    }
  }

  let url = `/api/incidencias/crear`;
  let metodo = "POST";

  if (!esCrear) {
    url = `/api/incidencias/modificar/${reporteActualId}`;
    metodo = "PUT";

    // Eliminar campos del usuario que no deberían modificarse
    delete datosReporte.idUsuario;
    delete datosReporte.idusuario;
    delete datosReporte.nombreusuario;
    delete datosReporte.edad;
    delete datosReporte.sexo;
    delete datosReporte.numerotelefono;
    delete datosReporte.correousuario;
    delete datosReporte.municipio;
    delete datosReporte.direccion;
    delete datosReporte.mediocontacto;
    delete datosReporte.numerotarjeta;
    delete datosReporte.numeroreportado;
    delete datosReporte.tipodestino;
  }

  try {
    const response = await fetch(url, {
      method: metodo,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosReporte),
    });

    if (!response.ok) {
      const errorData = await response.json();
      let mensajeError = `Error ${response.status}:\n`;

      if (errorData.detail) {
        if (Array.isArray(errorData.detail)) {
          // Mostrar cada error de validación
          errorData.detail.forEach((err, index) => {
            const campo = err.loc ? err.loc[err.loc.length - 1] : "campo";
            const msg = err.msg || "Error de validación";
            mensajeError += `${index + 1}. ${campo}: ${msg}\n`;
          });
        } else {
          mensajeError += errorData.detail;
        }
      } else {
        mensajeError += "Error desconocido del servidor";
      }

      throw new Error(mensajeError);
    }

    const resultado = await response.json();

    // Cerrar modales y limpiar
    $("#confirmationModal").modal("hide");
    $("#adminReporteModal").modal("hide");
    tabla.ajax.reload();
    limpiarModal();
  } catch (error) {
    console.error("Error al guardar:", error);
    alert("Error al guardar el reporte.");
  }
}

// ----------------------------------------------------------------------------
// 17. FUNCIÓN PARA CONSTRUIR EL OBJETO DE DATOS DEL REPORTE
// ----------------------------------------------------------------------------

function construirObjetoReporte(esCrear = true) {
  console.log(`🔨 Construyendo objeto de datos del reporte (${esCrear ? "CREAR" : "MODIFICAR"})`);

  // Obtener valores del formulario
  const numeroReportado = $("#editNumeroReportado").val().trim();
  const fechaReporte = $("#editFechaReporte").val();
  const categoria = $("#editCategoria").val();
  const medioContacto = $("#editMedioContacto").val();
  const descripcion = $("#editDescripcion").val().trim();
  const supuestoNombre = $("#editSupuestoNombre").val().trim();
  const genero = $("#editSupuestoGenero").val();
  const supuestoTrabajo = $("#editSupuestoTrabajo").val().trim();
  const estatus = $("#editEstatus").val();
  const tipoDestino = $("#editTipoDestino").val();
  const numeroTarjeta = $("#editNumeroTarjeta").val().trim();
  const direccion = $("#editDireccion").val().trim();

  // Extraer idusuario correctamente SOLO para creación
  let idUsuarioValue = null;
  if (esCrear && usuarioActualId) {
    if (Array.isArray(usuarioActualId) && usuarioActualId.length > 0) {
      const usuarioObj = usuarioActualId[0];
      idUsuarioValue = usuarioObj.idusuario || usuarioObj.id || usuarioObj.idUsuario;
    } else if (typeof usuarioActualId === "string") {
      idUsuarioValue = usuarioActualId;
    } else if (usuarioActualId.idusuario) {
      idUsuarioValue = usuarioActualId.idusuario;
    } else if (usuarioActualId.id) {
      idUsuarioValue = usuarioActualId.id;
    } else if (usuarioActualId.idUsuario) {
      idUsuarioValue = usuarioActualId.idUsuario;
    }
  }

  // Construir objeto base
  const datos = {
    // Campos requeridos para creación (opcional para modificación)
    idUsuario: esCrear ? idUsuarioValue : undefined,

    // Campos del reporte (siempre se envían)
    numeroreportado: numeroReportado || null,
    categoriareporte: categoria || null,
    mediocontacto: medioContacto || null,
    fechareporte: fechaReporte || (esCrear ? new Date().toISOString().split("T")[0] : undefined),
    descripcion: descripcion || null,
    supuestonombre: supuestoNombre || null,
    genero: genero || "No especificado",
    supuestotrabajo: supuestoTrabajo || null,
    estatus: estatus || "Pendiente",
    tipodestino: tipoDestino === "Ninguno" ? null : tipoDestino,
    numerotarjeta: numeroTarjeta || null,
    direccion: direccion || null,
  };

  if (esCrear) {
    datos.nombreusuario = datosUsuarioActual?.nombreusuario || $("#editNombreUsuario").val().trim() || null;
    datos.edad = datosUsuarioActual?.edad || parseInt($("#editEdad").val()) || null;
    datos.sexo = datosUsuarioActual?.sexo || $("#editSexo").val() || null;
    datos.numerotelefono = datosUsuarioActual?.numerotelefono || $("#editNumeroUsuario").val().trim() || null;
    datos.correousuario = datosUsuarioActual?.correousuario || $("#editCorreo").val().trim() || null;
    datos.municipio = datosUsuarioActual?.municipio || $("#editMunicipio").val() || null;

    // Versión en minúscula también por si acaso
    datos.idusuario = idUsuarioValue;
  }

  // Limpiar campos undefined (no enviarlos)
  Object.keys(datos).forEach((key) => {
    if (datos[key] === undefined) {
      delete datos[key];
    }
  });

  return datos;
}
// ----------------------------------------------------------------------------
// 18. FUNCIÓN PARA ELIMINAR EL REPORTE
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
// 19. FUNCIÓN PARA CERRAR SESIÓN
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
