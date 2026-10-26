/**
 * js/render.js — Keiser Trees
 * Construcción segura de nodos DOM para galería y ficha de árbol.
 *
 * SEGURIDAD — Regla estricta (ver SECURITY.md §SEC-03):
 *   ✓ Usar SIEMPRE textContent o document.createTextNode() para texto.
 *   ✗ Nunca usar innerHTML con datos que vengan de la base de datos.
 *
 * El texto del usuario / base de datos NUNCA se concatena en strings HTML.
 * Los únicos literales HTML que aparecen aquí son estructura fija del diseño.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades internas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Texto seguro: devuelve el valor o "Por confirmar" en muted si es null/vacío.
 * IMPORTANTE: este helper devuelve un nodo DOM, no un string.
 *
 * @param {*} value
 * @param {string} [suffix] — Unidad a añadir después del valor (ej. " m")
 * @returns {Node}
 */
function textoOConfirmar(value, suffix = "") {
  if (value === null || value === undefined || value === "") {
    const span = document.createElement("span");
    span.className = "ficha-meta-value--null";
    span.textContent = "Por confirmar";
    return span;
  }
  return document.createTextNode(String(value) + suffix);
}

/**
 * Mapea el valor de estado_salud al slug de clase CSS.
 *
 * @param {string|null} estado
 * @returns {string}
 */
function estadoSlug(estado) {
  const mapa = {
    "Excelente": "excelente",
    "Bueno": "bueno",
    "Regular": "regular",
    "En recuperación": "recuperacion",
    "Malo": "malo",
    "Seco": "seco",
  };
  return mapa[estado] || "";
}

/**
 * Crea el elemento de imagen o el placeholder cuando imagen_url es null.
 *
 * @param {string|null} imagenUrl
 * @param {string} nombreComun — Solo para el atributo alt; se asigna con textContent internamente.
 * @param {boolean} esPlaceholderFicha — Usa la variante de la ficha (sin relación 4:3).
 * @returns {HTMLElement}
 */
function crearMedia(imagenUrl, nombreComun, esPlaceholderFicha = false) {
  if (imagenUrl) {
    const img = document.createElement("img");
    img.src = imagenUrl; // URL es técnica, no datos de usuario inyectables
    img.alt = "Fotografía de " + nombreComun; // nombreComun = textContent directo
    img.loading = "lazy";
    img.decoding = "async";
    return img;
  }

  // Placeholder cuando no hay imagen
  const div = document.createElement("div");
  div.className = "card-placeholder" + (esPlaceholderFicha ? " card-placeholder--ficha" : "");
  div.setAttribute("aria-hidden", "true");

  const icon = document.createElement("span");
  icon.className = "card-placeholder__icon";
  icon.textContent = "🌿";

  const text = document.createElement("span");
  text.className = "card-placeholder__text";
  text.textContent = "Foto próximamente";

  div.appendChild(icon);
  div.appendChild(text);
  return div;
}

// ─────────────────────────────────────────────────────────────────────────────
// API pública
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Construye y devuelve el elemento <a class="card"> completo para la galería.
 * Toda la inserción de texto de la BD se hace con textContent.
 *
 * @param {Object} arbol — Objeto árbol devuelto por data.js
 * @returns {HTMLAnchorElement}
 */
export function crearTarjeta(arbol) {
  // Enlace principal — envuelve toda la tarjeta
  const a = document.createElement("a");
  a.className = "card";
  a.href = "arbol.html?id=" + encodeURIComponent(arbol.id);
  a.setAttribute("aria-label", "Ver ficha de " + arbol.nombre_comun);

  // ── Zona de imagen / placeholder ──────────────────────────────
  const mediaDiv = document.createElement("div");
  mediaDiv.className = "card-media";
  mediaDiv.appendChild(crearMedia(arbol.imagen_url, arbol.nombre_comun));

  // ── Cuerpo de la tarjeta ───────────────────────────────────────
  const body = document.createElement("div");
  body.className = "card-body";

  const titulo = document.createElement("h3");
  titulo.className = "card-title";
  titulo.textContent = arbol.nombre_comun;

  const sciName = document.createElement("p");
  sciName.className = "sci-name";
  sciName.textContent = arbol.nombre_cientifico;

  // Metadatos (ubicación, año)
  const meta = document.createElement("div");
  meta.className = "card-meta";

  const ubicItem = document.createElement("span");
  ubicItem.className = "card-meta-item";
  const ubicIcon = document.createTextNode("📍 ");
  const ubicTexto = document.createTextNode(
    arbol.ubicacion !== null && arbol.ubicacion !== "" ? arbol.ubicacion : "Por confirmar"
  );
  ubicItem.appendChild(ubicIcon);
  ubicItem.appendChild(ubicTexto);
  meta.appendChild(ubicItem);

  if (arbol.anio_plantacion !== null) {
    const anioItem = document.createElement("span");
    anioItem.className = "card-meta-item";
    anioItem.textContent = "🗓 " + arbol.anio_plantacion;
    meta.appendChild(anioItem);
  }

  // Badge de estado de salud
  const estadoDiv = document.createElement("div");
  estadoDiv.className = "card-estado";

  const badge = document.createElement("span");
  if (arbol.estado_salud) {
    badge.className = "badge-estado badge-estado--" + estadoSlug(arbol.estado_salud);
    badge.textContent = arbol.estado_salud;
  } else {
    badge.className = "badge-estado";
    badge.style.background = "transparent";
    badge.style.color = "var(--color-bark-muted)";
    badge.style.fontStyle = "italic";
    badge.textContent = "Por confirmar";
  }
  estadoDiv.appendChild(badge);

  body.appendChild(titulo);
  body.appendChild(sciName);
  body.appendChild(meta);
  body.appendChild(estadoDiv);

  // ── Acciones ───────────────────────────────────────────────────
  const actions = document.createElement("div");
  actions.className = "card-actions";

  const btnSpan = document.createElement("span");
  btnSpan.className = "btn btn-primary";
  btnSpan.textContent = "Ver ficha →";
  actions.appendChild(btnSpan);

  // Ensamblar tarjeta
  a.appendChild(mediaDiv);
  a.appendChild(body);
  a.appendChild(actions);

  return a;
}

/**
 * Construye y devuelve el elemento <article class="ficha"> completo.
 * Toda la inserción de texto de la BD se hace con textContent.
 *
 * @param {Object} arbol — Objeto árbol devuelto por data.js
 * @returns {HTMLElement}
 */
export function crearFicha(arbol) {
  const article = document.createElement("article");
  article.className = "ficha";

  // ── Imagen / placeholder ──────────────────────────────────────
  const mediaDiv = document.createElement("div");
  mediaDiv.className = "ficha-media";
  mediaDiv.appendChild(crearMedia(arbol.imagen_url, arbol.nombre_comun, true));

  // ── Información ───────────────────────────────────────────────
  const infoDiv = document.createElement("div");
  infoDiv.className = "ficha-info";

  const h1 = document.createElement("h1");
  h1.textContent = arbol.nombre_comun;

  const sci = document.createElement("p");
  sci.className = "sci-name";
  sci.textContent = arbol.nombre_cientifico;

  // Metadatos en <dl>
  const dl = document.createElement("dl");
  dl.className = "ficha-meta";

  const metaItems = [
    { label: "Ubicación", node: textoOConfirmar(arbol.ubicacion) },
    { label: "Año de plantación", node: textoOConfirmar(arbol.anio_plantacion) },
    { label: "Altura estimada", node: textoOConfirmar(arbol.altura_m, arbol.altura_m !== null ? " m" : "") },
  ];

  metaItems.forEach(({ label, node }) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "ficha-meta-item";
    const dt = document.createElement("dt");
    dt.className = "ficha-meta-label";
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.className = "ficha-meta-value";
    dd.appendChild(node);
    itemDiv.appendChild(dt);
    itemDiv.appendChild(dd);
    dl.appendChild(itemDiv);
  });

  // Estado de salud (badge)
  const estadoItem = document.createElement("div");
  estadoItem.className = "ficha-meta-item ficha-meta-item--estado";
  const estadoDt = document.createElement("dt");
  estadoDt.className = "ficha-meta-label";
  estadoDt.textContent = "Estado de salud";
  const estadoDd = document.createElement("dd");
  estadoDd.className = "ficha-meta-value";

  if (arbol.estado_salud) {
    const badge = document.createElement("span");
    badge.className = "badge-estado badge-estado--" + estadoSlug(arbol.estado_salud);
    badge.textContent = arbol.estado_salud;
    estadoDd.appendChild(badge);
  } else {
    const nullSpan = document.createElement("span");
    nullSpan.className = "ficha-meta-value--null";
    nullSpan.textContent = "Por confirmar";
    estadoDd.appendChild(nullSpan);
  }
  estadoItem.appendChild(estadoDt);
  estadoItem.appendChild(estadoDd);
  dl.appendChild(estadoItem);

  // Descripción
  const descSection = document.createElement("div");
  descSection.className = "ficha-section";
  const descH3 = document.createElement("h3");
  descH3.textContent = "Descripción";
  const descP = document.createElement("p");
  descP.textContent = arbol.descripcion;
  descSection.appendChild(descH3);
  descSection.appendChild(descP);

  infoDiv.appendChild(h1);
  infoDiv.appendChild(sci);
  infoDiv.appendChild(dl);
  infoDiv.appendChild(descSection);

  // Beneficios (solo si existen)
  if (arbol.beneficios) {
    const benSection = document.createElement("div");
    benSection.className = "ficha-section";
    const benH3 = document.createElement("h3");
    benH3.textContent = "Beneficios ecológicos";
    const benP = document.createElement("p");
    benP.textContent = arbol.beneficios;
    benSection.appendChild(benH3);
    benSection.appendChild(benP);
    infoDiv.appendChild(benSection);
  }

  // Botón de regreso
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "ficha-actions";
  const btnVolver = document.createElement("a");
  btnVolver.className = "btn btn-secondary";
  btnVolver.href = "index.html";
  btnVolver.textContent = "← Volver al catálogo";
  actionsDiv.appendChild(btnVolver);
  infoDiv.appendChild(actionsDiv);

  article.appendChild(mediaDiv);
  article.appendChild(infoDiv);
  return article;
}

/**
 * Muestra el estado de "cargando" en el contenedor dado.
 * Usa las clases gallery-loading (galería) o ficha-loading (ficha),
 * más galeria-estado como base para el spinner y estilos centralizados.
 *
 * @param {HTMLElement} container
 */
export function mostrarCargando(container) {
  container.innerHTML = ""; // Solo estructura, sin datos de usuario
  const div = document.createElement("div");
  div.className = "gallery-loading";
  div.setAttribute("role", "status");
  div.setAttribute("aria-live", "polite");

  // Spinner animado accesible
  const spinner = document.createElement("div");
  spinner.className = "kt-spinner";
  spinner.setAttribute("aria-hidden", "true");

  const p = document.createElement("p");
  p.textContent = "Cargando árboles del campus…";

  div.appendChild(spinner);
  div.appendChild(p);
  container.appendChild(div);
}

/**
 * Muestra el estado de "galería vacía".
 *
 * @param {HTMLElement} container
 */
export function mostrarVacio(container) {
  container.innerHTML = "";
  const div = document.createElement("div");
  div.className = "gallery-empty";
  div.setAttribute("role", "status");

  const icon = document.createElement("div");
  icon.className = "galeria-estado__icon";
  icon.textContent = "🌱";
  icon.setAttribute("aria-hidden", "true");

  const h3 = document.createElement("h3");
  h3.textContent = "Aún no hay árboles en el catálogo";

  const p = document.createElement("p");
  p.textContent = "Pronto encontrarás aquí la guía botánica del campus de Keiser University.";

  div.appendChild(icon);
  div.appendChild(h3);
  div.appendChild(p);
  container.appendChild(div);
}

/**
 * Muestra el estado de error de conexión con botón "Reintentar".
 *
 * @param {HTMLElement} container
 * @param {Function} onReintentar — Callback al hacer clic en "Reintentar"
 * @param {string} [_mensajeExtra] — Reservado para depuración; no se muestra al usuario.
 */
export function mostrarError(container, onReintentar, _mensajeExtra = "") {
  container.innerHTML = "";

  const div = document.createElement("div");
  // gallery-error extiende a toda la cuadrícula (grid-column: 1/-1)
  div.className = "gallery-error";
  div.setAttribute("role", "alert");

  const alerta = document.createElement("div");
  alerta.className = "alert alert-error";

  const icon = document.createElement("span");
  icon.className = "alert-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "✗";

  const msg = document.createElement("p");
  msg.className = "alert-message";
  msg.textContent = "No pudimos conectarnos al catálogo. Verifica tu internet e intenta de nuevo.";

  alerta.appendChild(icon);
  alerta.appendChild(msg);

  const btn = document.createElement("button");
  btn.className = "btn btn-primary";
  btn.type = "button";
  btn.textContent = "Reintentar";
  btn.style.marginTop = "var(--space-md)";
  btn.addEventListener("click", onReintentar);

  div.appendChild(alerta);
  div.appendChild(btn);
  container.appendChild(div);
}

/**
 * Muestra el error de "árbol no encontrado" en la ficha.
 * Usa la clase ficha-not-found definida en ficha.css.
 *
 * @param {HTMLElement} container
 */
export function mostrarFichaNoEncontrada(container) {
  container.innerHTML = "";

  const div = document.createElement("div");
  div.className = "ficha-not-found";
  div.setAttribute("role", "alert");

  const icon = document.createElement("p");
  icon.setAttribute("aria-hidden", "true");
  icon.style.fontSize = "3rem";
  icon.textContent = "🔍";

  const h2 = document.createElement("h2");
  h2.textContent = "Árbol no encontrado";

  const p = document.createElement("p");
  p.textContent = "El árbol que buscas no existe en el catálogo o ha sido retirado temporalmente.";

  const a = document.createElement("a");
  a.className = "btn btn-secondary";
  a.href = "index.html";
  a.textContent = "← Volver al catálogo";

  div.appendChild(icon);
  div.appendChild(h2);
  div.appendChild(p);
  div.appendChild(a);
  container.appendChild(div);
}
