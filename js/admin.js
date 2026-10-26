/**
 * js/admin.js — Keiser Trees
 * Lógica del portal administrativo (admin.html).
 *
 * Módulos y responsabilidades:
 *   1. Autenticación y control de acceso (Supabase Auth + verificación de admin).
 *   2. Registro de nuevos árboles (validación de foto <= 5MB, Storage, INSERT).
 *   3. Edición de árboles existentes (UPDATE de datos y foto opcional, alternar aprobado).
 *   4. Listado y administración del catálogo completo.
 *
 * REGLAS DE SEGURIDAD (SECURITY.md):
 *   - Solo anon key y URL pública desde config.js; NUNCA service_role.
 *   - Todos los textos de BD o inputs se renderizan con textContent (cero innerHTML con datos).
 *   - Validación estricta en cliente de formato de imagen y límite de 5 MB.
 */

import { supabase } from "./config.js";

// ─────────────────────────────────────────────────────────────────────────────
// Constantes y límites
// ─────────────────────────────────────────────────────────────────────────────
const BUCKET_NAME = "fotos-arboles";
const FOTOS_DIR = "arboles";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// ─────────────────────────────────────────────────────────────────────────────
// Elementos del DOM
// ─────────────────────────────────────────────────────────────────────────────
// Vistas y barras
const topbar = document.getElementById("admin-topbar");
const adminEmailEl = document.getElementById("admin-email");
const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");
const btnCerrarSesionDenied = document.getElementById("btn-cerrar-sesion-denied");

const viewLogin = document.getElementById("view-login");
const viewPanel = document.getElementById("view-panel");
const viewDenied = document.getElementById("view-denied");

// Formulario de login
const loginForm = document.getElementById("login-form");
const loginEmailInput = document.getElementById("login-email");
const loginPasswordInput = document.getElementById("login-password");
const loginBtnSubmit = document.getElementById("login-btn-submit");
const loginErrorAlert = document.getElementById("login-error");
const loginErrorMsg = document.getElementById("login-error-msg");

// Pestañas del panel
const tabBtnList = document.getElementById("tab-btn-list");
const tabBtnForm = document.getElementById("tab-btn-form");
const tabContentList = document.getElementById("tab-content-list");
const tabContentForm = document.getElementById("tab-content-form");
const formTitle = document.getElementById("form-title");

// Lista de árboles en admin
const adminTreesList = document.getElementById("admin-trees-list");
const adminTreesCount = document.getElementById("admin-trees-count");
const btnRefreshList = document.getElementById("btn-refresh-list");

// Formulario de árbol (alta y edición)
const treeForm = document.getElementById("upload-form");
const treeIdInput = document.getElementById("tree-id"); // Si tiene valor, es edición
const treeSlugInput = document.getElementById("tree-slug");
const currentImgUrlInput = document.getElementById("tree-current-img-url");

const inputNombreComun = document.getElementById("nombre_comun");
const inputNombreCientifico = document.getElementById("nombre_cientifico");
const inputUbicacion = document.getElementById("ubicacion");
const inputDescripcion = document.getElementById("descripcion");
const inputBeneficios = document.getElementById("beneficios");
const inputAnio = document.getElementById("anio_plantacion");
const inputAltura = document.getElementById("altura_m");
const selectEstadoSalud = document.getElementById("estado_salud");
const checkboxPublicar = document.getElementById("publicar");

// Input y área de foto
const fileUploadArea = document.getElementById("file-upload-area");
const inputFile = document.getElementById("foto");
const errFoto = document.getElementById("err-foto");
const fotoPreview = document.getElementById("foto-preview");
const fotoPreviewImg = document.getElementById("foto-preview-img");
const fotoPreviewHint = document.getElementById("foto-preview-hint");

// Progreso, alertas y botones
const formAlert = document.getElementById("form-alert");
const uploadProgress = document.getElementById("upload-progress");
const uploadBar = document.getElementById("upload-bar");
const uploadLabel = document.getElementById("upload-label");
const btnGuardar = document.getElementById("btn-guardar");
const btnCancelarEdicion = document.getElementById("btn-cancelar-edicion");

// ─────────────────────────────────────────────────────────────────────────────
// Estado de la aplicación
// ─────────────────────────────────────────────────────────────────────────────
let currentUser = null;
let currentSelectedFile = null;
let treesCache = [];

// ─────────────────────────────────────────────────────────────────────────────
// 1. Control de Vistas y Autenticación
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cambia la vista visible usando atributos hidden.
 * @param {'login' | 'panel' | 'denied'} viewName
 */
function cambiarVista(viewName) {
  viewLogin.hidden = viewName !== "login";
  viewPanel.hidden = viewName !== "panel";
  viewDenied.hidden = viewName !== "denied";

  if (viewName === "panel") {
    topbar.hidden = false;
    if (currentUser?.email) {
      adminEmailEl.textContent = currentUser.email;
    }
  } else {
    topbar.hidden = true;
  }
}

/**
 * Verifica si el usuario actual tiene permisos administrativos.
 * Implementa estrategia dual segura:
 *   1. RPC `is_admin()` declarada en supabase/schema.sql (SECURITY DEFINER).
 *   2. Fallback a SELECT sobre `public.administradores` o `public.admins`.
 * @param {Object} user
 * @returns {Promise<boolean>}
 */
async function verificarEsAdmin(user) {
  if (!user) return false;

  try {
    // 1. Intentar por RPC is_admin() (recomendación oficial de schema.sql)
    const { data: rpcData, error: rpcError } = await supabase.rpc("is_admin");
    if (!rpcError && typeof rpcData === "boolean") {
      return rpcData;
    }
  } catch (err) {
    console.warn("[Admin] RPC is_admin no respondió, intentando fallback:", err);
  }

  try {
    // 2. Fallback: consultar public.administradores
    const { data: adminData, error: adminErr } = await supabase
      .from("administradores")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!adminErr && adminData?.user_id) {
      return true;
    }
  } catch {
    // Si la tabla no existe o tiene permisos revocados
  }

  try {
    // 3. Fallback alternativo: tabla public.admins
    const { data: adminsData, error: adminsErr } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!adminsErr && adminsData?.user_id) {
      return true;
    }
  } catch {
    // Permisos revocados por schema
  }

  return false;
}

/**
 * Evalúa el estado de sesión y sincroniza la vista correspondiente.
 * @param {Object|null} session
 */
async function evaluarSesion(session) {
  if (!session || !session.user) {
    currentUser = null;
    cambiarVista("login");
    return;
  }

  currentUser = session.user;
  const esAdmin = await verificarEsAdmin(currentUser);

  if (esAdmin) {
    cambiarVista("panel");
    cargarListadoArboles();
  } else {
    cambiarVista("denied");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Manejo de Inicio y Cierre de Sesión
// ─────────────────────────────────────────────────────────────────────────────

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  ocultarAlerta(loginErrorAlert);

  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value;

  if (!email || !password) {
    mostrarAlerta(loginErrorAlert, loginErrorMsg, "Por favor completa el correo y la contraseña.");
    return;
  }

  loginBtnSubmit.disabled = true;
  loginBtnSubmit.textContent = "Verificando…";

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  loginBtnSubmit.disabled = false;
  loginBtnSubmit.textContent = "Iniciar sesión";

  if (error) {
    console.error("[Admin Login Error]:", error.message);
    let msg = "Credenciales incorrectas o acceso no autorizado.";
    if (error.message.includes("Invalid login credentials")) {
      msg = "Correo o contraseña incorrectos.";
    } else if (error.message.includes("Email not confirmed")) {
      msg = "El correo no ha sido confirmado en Supabase.";
    }
    mostrarAlerta(loginErrorAlert, loginErrorMsg, msg);
    return;
  }

  // La reactividad de onAuthStateChange se encarga de cambiar la vista
  if (data?.session) {
    await evaluarSesion(data.session);
  }
});

async function cerrarSesion() {
  await supabase.auth.signOut();
  currentUser = null;
  resetearFormularioArbol();
  cambiarVista("login");
}

btnCerrarSesion?.addEventListener("click", cerrarSesion);
btnCerrarSesionDenied?.addEventListener("click", cerrarSesion);

// ─────────────────────────────────────────────────────────────────────────────
// 3. Pestañas del Panel de Administración
// ─────────────────────────────────────────────────────────────────────────────

function activarPestana(pestana) {
  if (pestana === "list") {
    tabBtnList.classList.add("admin-tab-btn--active");
    tabBtnForm.classList.remove("admin-tab-btn--active");
    tabContentList.hidden = false;
    tabContentForm.hidden = true;
  } else {
    tabBtnForm.classList.add("admin-tab-btn--active");
    tabBtnList.classList.remove("admin-tab-btn--active");
    tabContentForm.hidden = false;
    tabContentList.hidden = true;
  }
}

tabBtnList?.addEventListener("click", () => activarPestana("list"));
tabBtnForm?.addEventListener("click", () => {
  activarPestana("form");
});

btnRefreshList?.addEventListener("click", () => {
  cargarListadoArboles();
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Gestión y Validación de Imágenes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Valida formato y tamaño de un archivo de imagen.
 * @param {File} file
 * @returns {string|null} Mensaje de error o null si es válido
 */
function validarArchivoFoto(file) {
  if (!file) return null;

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return "Formato no permitido. Solo se admiten fotos JPG, PNG o WebP.";
  }

  if (file.size > MAX_FILE_SIZE) {
    const tamanoMB = (file.size / (1024 * 1024)).toFixed(2);
    return `La imagen supera el límite de 5 MB (tamaño actual: ${tamanoMB} MB).`;
  }

  return null;
}

/**
 * Muestra la vista previa del archivo seleccionado en el formulario.
 * @param {File|null} file
 */
function actualizarVistaPrevia(file) {
  if (!file) {
    currentSelectedFile = null;
    // Si estamos editando y hay foto actual, mantener la foto actual
    const currentUrl = currentImgUrlInput.value;
    if (currentUrl) {
      fotoPreviewImg.src = currentUrl;
      fotoPreview.classList.add("is-visible");
      fotoPreviewHint.textContent = "Fotografía actual registrada. Selecciona una nueva si deseas reemplazarla.";
    } else {
      fotoPreview.classList.remove("is-visible");
      fotoPreviewImg.src = "";
      fotoPreviewHint.textContent = "";
    }
    return;
  }

  currentSelectedFile = file;
  const objectUrl = URL.createObjectURL(file);
  fotoPreviewImg.src = objectUrl;
  fotoPreview.classList.add("is-visible");
  fotoPreviewHint.textContent = `Nueva foto seleccionada: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
}

// Selector de archivo clickeable en toda el área
fileUploadArea?.addEventListener("click", () => {
  inputFile?.click();
});

fileUploadArea?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    inputFile?.click();
  }
});

// Arrastrar y soltar (drag & drop)
fileUploadArea?.addEventListener("dragover", (e) => {
  e.preventDefault();
  fileUploadArea.style.borderColor = "var(--color-primary)";
  fileUploadArea.style.background = "var(--color-card)";
});

fileUploadArea?.addEventListener("dragleave", () => {
  fileUploadArea.style.borderColor = "";
  fileUploadArea.style.background = "";
});

fileUploadArea?.addEventListener("drop", (e) => {
  e.preventDefault();
  fileUploadArea.style.borderColor = "";
  fileUploadArea.style.background = "";

  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    procesarArchivoSeleccionado(files[0]);
  }
});

inputFile?.addEventListener("change", (e) => {
  const files = e.target.files;
  if (files && files.length > 0) {
    procesarArchivoSeleccionado(files[0]);
  }
});

function procesarArchivoSeleccionado(file) {
  errFoto.hidden = true;
  errFoto.textContent = "";

  const errorValidacion = validarArchivoFoto(file);
  if (errorValidacion) {
    errFoto.textContent = errorValidacion;
    errFoto.hidden = false;
    actualizarVistaPrevia(null);
    inputFile.value = "";
    return;
  }

  actualizarVistaPrevia(file);
}

/**
 * Sube la imagen a Supabase Storage en fotos-arboles/arboles/
 * @param {File} file
 * @param {string} slug
 * @returns {Promise<string>} URL pública de la imagen
 */
async function subirImagenStorage(file, slug) {
  const extension = file.name.split(".").pop().toLowerCase() || "jpg";
  const timestamp = Date.now();
  const filePath = `${FOTOS_DIR}/${slug}-${timestamp}.${extension}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    throw new Error(`Error al subir imagen al bucket: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Generación de Slug Válido
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Genera un slug conforme al CHECK de PostgreSQL:
 * check_slug_formato: (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(slug) BETWEEN 2 AND 100)
 * @param {string} texto
 * @returns {string}
 */
function normalizarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remueve acentos
    .replace(/[^a-z0-9]+/g, "-") // Caracteres no alfanuméricos por guiones
    .replace(/^-+|-+$/g, "") // Remueve guiones al inicio o final
    .slice(0, 80); // Límite de longitud
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Carga y Renderizado del Catálogo de Árboles
// ─────────────────────────────────────────────────────────────────────────────

async function cargarListadoArboles() {
  if (!adminTreesList) return;

  adminTreesList.innerHTML = "";
  const loadingP = document.createElement("p");
  loadingP.className = "text-muted";
  loadingP.textContent = "Cargando árboles del catálogo…";
  adminTreesList.appendChild(loadingP);

  // Consulta todos los árboles (aprobados y ocultos)
  const { data: arboles, error } = await supabase
    .from("arboles")
    .select("id, slug, nombre_comun, nombre_cientifico, ubicacion, estado_salud, aprobado, imagen_url, created_at")
    .order("created_at", { ascending: false });

  adminTreesList.innerHTML = "";

  if (error) {
    console.error("[Admin list error]:", error.message);
    const errDiv = document.createElement("div");
    errDiv.className = "alert alert-error";
    const msg = document.createElement("p");
    msg.textContent = `Error al obtener árboles: ${error.message}`;
    errDiv.appendChild(msg);
    adminTreesList.appendChild(errDiv);
    return;
  }

  treesCache = arboles || [];
  if (adminTreesCount) {
    adminTreesCount.textContent = `(${treesCache.length} árboles)`;
  }

  if (treesCache.length === 0) {
    const emptyP = document.createElement("p");
    emptyP.className = "text-muted";
    emptyP.textContent = "No hay árboles registrados todavía. Haz clic en 'Registrar nuevo árbol' para agregar el primero.";
    adminTreesList.appendChild(emptyP);
    return;
  }

  // Renderizado seguro fila por fila
  treesCache.forEach((arbol) => {
    adminTreesList.appendChild(crearFilaArbolAdmin(arbol));
  });
}

/**
 * Crea un elemento de tarjeta/fila administrativa para un árbol.
 * Uso estricto de textContent para prevenir XSS.
 * @param {Object} arbol
 * @returns {HTMLElement}
 */
function crearFilaArbolAdmin(arbol) {
  const item = document.createElement("div");
  item.className = "admin-tree-item";
  if (!arbol.aprobado) {
    item.classList.add("admin-tree-item--oculto");
  }

  // Miniatura o placeholder
  const thumbDiv = document.createElement("div");
  thumbDiv.className = "admin-tree-thumb";
  if (arbol.imagen_url) {
    const img = document.createElement("img");
    img.src = arbol.imagen_url;
    img.alt = arbol.nombre_comun;
    thumbDiv.appendChild(img);
  } else {
    const placeholder = document.createElement("span");
    placeholder.textContent = "🌿";
    thumbDiv.appendChild(placeholder);
  }

  // Datos del árbol
  const infoDiv = document.createElement("div");
  infoDiv.className = "admin-tree-info";

  const titleRow = document.createElement("div");
  titleRow.className = "admin-tree-title-row";

  const title = document.createElement("h3");
  title.className = "admin-tree-title";
  title.textContent = arbol.nombre_comun;

  const badgeEstado = document.createElement("span");
  badgeEstado.className = arbol.aprobado
    ? "badge-admin-status badge-admin-status--publicado"
    : "badge-admin-status badge-admin-status--oculto";
  badgeEstado.textContent = arbol.aprobado ? "Público" : "Oculto (Borrador)";

  titleRow.appendChild(title);
  titleRow.appendChild(badgeEstado);

  const sciName = document.createElement("p");
  sciName.className = "sci-name";
  sciName.style.margin = "0";
  sciName.textContent = arbol.nombre_cientifico;

  const metaP = document.createElement("p");
  metaP.className = "admin-tree-meta";
  const ubicText = arbol.ubicacion ? `📍 ${arbol.ubicacion}` : "📍 Sin ubicación";
  const saludText = arbol.estado_salud ? ` · Estado: ${arbol.estado_salud}` : "";
  metaP.textContent = `${ubicText}${saludText}`;

  infoDiv.appendChild(titleRow);
  infoDiv.appendChild(sciName);
  infoDiv.appendChild(metaP);

  // Acciones
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "admin-tree-actions";

  // Botón Editar
  const btnEditar = document.createElement("button");
  btnEditar.type = "button";
  btnEditar.className = "btn btn-outline admin-btn-action";
  btnEditar.textContent = "✏️ Editar";
  btnEditar.addEventListener("click", () => {
    cargarArbolParaEdicion(arbol.id);
  });

  // Botón Rápido Alternar Aprobado
  const btnToggle = document.createElement("button");
  btnToggle.type = "button";
  btnToggle.className = arbol.aprobado
    ? "btn btn-outline admin-btn-action"
    : "btn btn-secondary admin-btn-action";
  btnToggle.textContent = arbol.aprobado ? "Ocultar" : "Publicar";
  btnToggle.addEventListener("click", () => {
    alternarAprobadoArbol(arbol.id, !arbol.aprobado);
  });

  // Enlace a la ficha pública
  const linkFicha = document.createElement("a");
  linkFicha.href = `arbol.html?id=${encodeURIComponent(arbol.id)}`;
  linkFicha.target = "_blank";
  linkFicha.className = "btn btn-outline admin-btn-action";
  linkFicha.textContent = "👁 Ver ficha";
  linkFicha.setAttribute("title", "Abre la ficha en pestaña nueva");

  actionsDiv.appendChild(btnEditar);
  actionsDiv.appendChild(btnToggle);
  actionsDiv.appendChild(linkFicha);

  item.appendChild(thumbDiv);
  item.appendChild(infoDiv);
  item.appendChild(actionsDiv);

  return item;
}

/**
 * Alterna de forma directa el estado aprobado de un árbol (publicar / ocultar).
 * @param {string} id
 * @param {boolean} nuevoEstado
 */
async function alternarAprobadoArbol(id, nuevoEstado) {
  const { error } = await supabase
    .from("arboles")
    .update({ aprobado: nuevoEstado })
    .eq("id", id);

  if (error) {
    alert(`No se pudo cambiar el estado: ${error.message}`);
    return;
  }

  cargarListadoArboles();
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Carga de Árbol para Edición
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Prepara el formulario para editar un árbol existente.
 * @param {string} id
 */
async function cargarArbolParaEdicion(id) {
  // Obtener datos completos de BD
  const { data: arbol, error } = await supabase
    .from("arboles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !arbol) {
    alert("No se pudieron cargar los datos del árbol para editar.");
    return;
  }

  // Rellenar campos del formulario
  treeIdInput.value = arbol.id;
  treeSlugInput.value = arbol.slug || "";
  currentImgUrlInput.value = arbol.imagen_url || "";

  inputNombreComun.value = arbol.nombre_comun || "";
  inputNombreCientifico.value = arbol.nombre_cientifico || "";
  inputUbicacion.value = arbol.ubicacion || "";
  inputDescripcion.value = arbol.descripcion || "";
  inputBeneficios.value = arbol.beneficios || "";
  inputAnio.value = arbol.anio_plantacion !== null ? arbol.anio_plantacion : "";
  inputAltura.value = arbol.altura_m !== null ? arbol.altura_m : "";
  selectEstadoSalud.value = arbol.estado_salud || "";
  checkboxPublicar.checked = Boolean(arbol.aprobado);

  // Manejo de foto actual
  currentSelectedFile = null;
  inputFile.value = "";
  if (arbol.imagen_url) {
    fotoPreviewImg.src = arbol.imagen_url;
    fotoPreview.classList.add("is-visible");
    fotoPreviewHint.textContent = "Fotografía actual registrada. Selecciona una nueva si deseas reemplazarla.";
  } else {
    fotoPreview.classList.remove("is-visible");
    fotoPreviewImg.src = "";
    fotoPreviewHint.textContent = "Este árbol no tiene foto asignada. Selecciona una si deseas agregarla.";
  }

  // Modificar textos de interfaz
  formTitle.textContent = `Editar árbol: ${arbol.nombre_comun}`;
  btnGuardar.textContent = "Guardar cambios";
  btnCancelarEdicion.hidden = false;

  // Cambiar pestaña al formulario
  activarPestana("form");
  formTitle.scrollIntoView({ behavior: "smooth" });
}

/**
 * Resetea el formulario a modo "Registrar nuevo árbol".
 */
function resetearFormularioArbol() {
  treeForm.reset();
  treeIdInput.value = "";
  treeSlugInput.value = "";
  currentImgUrlInput.value = "";
  currentSelectedFile = null;

  checkboxPublicar.checked = true;
  fotoPreview.classList.remove("is-visible");
  fotoPreviewImg.src = "";
  fotoPreviewHint.textContent = "";
  errFoto.hidden = true;
  ocultarAlerta(formAlert);

  formTitle.textContent = "Registrar árbol nuevo";
  btnGuardar.textContent = "Guardar árbol";
  btnCancelarEdicion.hidden = true;
}

btnCancelarEdicion?.addEventListener("click", () => {
  resetearFormularioArbol();
  activarPestana("list");
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Envío de Formulario (INSERT / UPDATE)
// ─────────────────────────────────────────────────────────────────────────────

treeForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  ocultarAlerta(formAlert);

  // Extracción y sanitización básica de campos requeridos
  const nombreComun = inputNombreComun.value.trim();
  const nombreCientifico = inputNombreCientifico.value.trim();
  const ubicacion = inputUbicacion.value.trim();
  const descripcion = inputDescripcion.value.trim();

  // Validaciones del cliente según CHECKs de schema.sql
  if (nombreComun.length < 2 || nombreComun.length > 150) {
    mostrarMensajeFormulario("El nombre común debe tener entre 2 y 150 caracteres.", "error");
    inputNombreComun.focus();
    return;
  }
  if (nombreCientifico.length < 2 || nombreCientifico.length > 150) {
    mostrarMensajeFormulario("El nombre científico debe tener entre 2 y 150 caracteres.", "error");
    inputNombreCientifico.focus();
    return;
  }
  if (descripcion.length < 10 || descripcion.length > 5000) {
    mostrarMensajeFormulario("La descripción debe tener entre 10 y 5000 caracteres.", "error");
    inputDescripcion.focus();
    return;
  }
  if (ubicacion.length < 2 || ubicacion.length > 200) {
    mostrarMensajeFormulario("La ubicación debe tener entre 2 y 200 caracteres.", "error");
    inputUbicacion.focus();
    return;
  }

  // Campos opcionales
  const beneficios = inputBeneficios.value.trim() || null;
  if (beneficios && (beneficios.length < 5 || beneficios.length > 3000)) {
    mostrarMensajeFormulario("Los beneficios deben tener entre 5 y 3000 caracteres.", "error");
    inputBeneficios.focus();
    return;
  }

  const anioVal = inputAnio.value.trim();
  let anioPlantacion = null;
  if (anioVal) {
    const anioNum = parseInt(anioVal, 10);
    if (isNaN(anioNum) || anioNum < 1800 || anioNum > 2100) {
      mostrarMensajeFormulario("El año de plantación debe ser un número entre 1800 y 2100.", "error");
      inputAnio.focus();
      return;
    }
    anioPlantacion = anioNum;
  }

  const alturaVal = inputAltura.value.trim();
  let alturaM = null;
  if (alturaVal) {
    const alturaNum = parseFloat(alturaVal);
    if (isNaN(alturaNum) || alturaNum <= 0 || alturaNum > 150) {
      mostrarMensajeFormulario("La altura debe ser mayor a 0 y menor o igual a 150 metros.", "error");
      inputAltura.focus();
      return;
    }
    alturaM = alturaNum;
  }

  const estadoSalud = selectEstadoSalud.value || null;
  const aprobado = checkboxPublicar.checked;

  const esEdicion = Boolean(treeIdInput.value);
  const arbolId = treeIdInput.value;

  // Estado de carga en botón
  btnGuardar.disabled = true;
  btnGuardar.classList.add("btn-loading");
  btnGuardar.textContent = esEdicion ? "Actualizando…" : "Guardando…";

  try {
    // 1. Manejo de imagen
    let imagenUrlFinal = currentImgUrlInput.value || null;

    if (currentSelectedFile) {
      mostrarProgreso(30, "Subiendo fotografía a Supabase Storage…");
      const baseSlug = esEdicion && treeSlugInput.value ? treeSlugInput.value : normalizarSlug(nombreComun);
      imagenUrlFinal = await subirImagenStorage(currentSelectedFile, baseSlug);
      mostrarProgreso(75, "Fotografía subida correctamente.");
    }

    // 2. Preparar payload de datos
    if (esEdicion) {
      mostrarProgreso(85, "Actualizando registro en la base de datos…");

      const updateData = {
        nombre_comun: nombreComun,
        nombre_cientifico: nombreCientifico,
        descripcion: descripcion,
        beneficios: beneficios,
        ubicacion: ubicacion,
        anio_plantacion: anioPlantacion,
        altura_m: alturaM,
        estado_salud: estadoSalud,
        imagen_url: imagenUrlFinal,
        aprobado: aprobado,
      };

      const { error: updateErr } = await supabase
        .from("arboles")
        .update(updateData)
        .eq("id", arbolId);

      if (updateErr) {
        throw new Error(`Error en actualización: ${updateErr.message}`);
      }

      mostrarMensajeFormulario(`Árbol "${nombreComun}" actualizado exitosamente.`, "success");
      resetearFormularioArbol();
      cargarListadoArboles();
      activarPestana("list");
    } else {
      // Alta de nuevo árbol
      mostrarProgreso(85, "Guardando nuevo árbol en el catálogo…");

      // Generar slug único garantizado
      let slug = normalizarSlug(nombreComun);
      if (slug.length < 2) {
        slug = `arbol-${Date.now().toString(36)}`;
      }

      const insertData = {
        slug: slug,
        nombre_comun: nombreComun,
        nombre_cientifico: nombreCientifico,
        descripcion: descripcion,
        beneficios: beneficios,
        ubicacion: ubicacion,
        anio_plantacion: anioPlantacion,
        altura_m: alturaM,
        estado_salud: estadoSalud,
        imagen_url: imagenUrlFinal,
        origen: "admin",
        aprobado: aprobado,
        created_by: currentUser?.id || null,
      };

      const { error: insertErr } = await supabase
        .from("arboles")
        .insert([insertData]);

      if (insertErr) {
        // Si hay conflicto de slug, intentar con sufijo
        if (insertErr.code === "23505" && insertErr.message.includes("slug")) {
          insertData.slug = `${slug}-${Math.floor(Math.random() * 900 + 100)}`;
          const { error: retryErr } = await supabase.from("arboles").insert([insertData]);
          if (retryErr) throw retryErr;
        } else {
          throw new Error(`Error al insertar: ${insertErr.message}`);
        }
      }

      mostrarMensajeFormulario(`Árbol "${nombreComun}" registrado exitosamente.`, "success");
      resetearFormularioArbol();
      cargarListadoArboles();
      activarPestana("list");
    }
  } catch (err) {
    console.error("[Admin submit error]:", err);
    mostrarMensajeFormulario(err.message || "Ocurrió un error inesperado al guardar el árbol.", "error");
  } finally {
    ocultarProgreso();
    btnGuardar.disabled = false;
    btnGuardar.classList.remove("btn-loading");
    btnGuardar.textContent = esEdicion ? "Guardar cambios" : "Guardar árbol";
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. Utilidades de Notificaciones y Progreso
// ─────────────────────────────────────────────────────────────────────────────

function mostrarAlerta(contenedor, msgEl, texto) {
  if (!contenedor || !msgEl) return;
  msgEl.textContent = texto;
  contenedor.hidden = false;
}

function ocultarAlerta(contenedor) {
  if (!contenedor) return;
  contenedor.hidden = true;
}

function mostrarMensajeFormulario(texto, tipo = "info") {
  if (!formAlert) return;
  formAlert.className = `alert alert-${tipo}`;
  formAlert.innerHTML = ""; // Estructura fija interna

  const icon = document.createElement("span");
  icon.className = "alert-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = tipo === "success" ? "✓" : tipo === "error" ? "✗" : "ℹ";

  const p = document.createElement("p");
  p.className = "alert-message";
  p.textContent = texto;

  formAlert.appendChild(icon);
  formAlert.appendChild(p);
  formAlert.hidden = false;
  formAlert.scrollIntoView({ behavior: "smooth" });
}

function mostrarProgreso(porcentaje, etiqueta) {
  if (!uploadProgress) return;
  uploadProgress.classList.add("is-visible");
  if (uploadBar) uploadBar.style.width = `${porcentaje}%`;
  if (uploadLabel) uploadLabel.textContent = etiqueta;
}

function ocultarProgreso() {
  if (!uploadProgress) return;
  uploadProgress.classList.remove("is-visible");
  if (uploadBar) uploadBar.style.width = "0%";
  if (uploadLabel) uploadLabel.textContent = "";
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Inicialización y Escucha de Sesión
// ─────────────────────────────────────────────────────────────────────────────

async function inicializarAdmin() {
  // Comprobar sesión actual almacenada
  const { data: { session } } = await supabase.auth.getSession();
  await evaluarSesion(session);

  // Escuchar cambios reactivos en la autenticación (login, logout, refresh de token)
  supabase.auth.onAuthStateChange(async (_event, session) => {
    await evaluarSesion(session);
  });
}

inicializarAdmin();
