/**
 * js/app-ficha.js — Keiser Trees
 * Controlador de arbol.html.
 * Lee el parámetro ?id= (o ?slug=) de la URL y carga la ficha del árbol.
 */

import { getArbolById, getArbolBySlug } from "./data.js";
import { crearFicha, mostrarError, mostrarFichaNoEncontrada } from "./render.js";

/** Referencia al contenedor principal de la ficha */
const contenedor = document.getElementById("ficha-contenedor");
/** Referencia al elemento <title> para actualizarlo dinámicamente */
const paginaTitulo = document.querySelector("title");

/**
 * Lee los parámetros de la URL y carga el árbol correspondiente.
 */
async function cargarFicha() {
  if (!contenedor) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const slug = params.get("slug");

  // Sin parámetro válido → árbol no encontrado
  if (!id && !slug) {
    mostrarFichaNoEncontrada(contenedor);
    return;
  }

  // Estado de carga: spinner simple dentro del contenedor
  contenedor.setAttribute("aria-busy", "true");

  const { data: arbol, error } = id
    ? await getArbolById(id)
    : await getArbolBySlug(slug);

  contenedor.removeAttribute("aria-busy");

  if (error) {
    console.error("[Keiser Trees] Error al cargar ficha:", error.message);
    mostrarError(contenedor, cargarFicha, error.message);
    return;
  }

  if (!arbol) {
    mostrarFichaNoEncontrada(contenedor);
    return;
  }

  // Actualizar <title> y meta description dinámicamente
  if (paginaTitulo) {
    paginaTitulo.textContent = arbol.nombre_comun + " — Keiser Trees";
  }
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute(
      "content",
      "Conoce el " + arbol.nombre_comun + " (" + arbol.nombre_cientifico + ") del campus de Keiser University."
    );
  }

  // Limpiar el contenedor y pintar la ficha
  contenedor.innerHTML = "";
  contenedor.appendChild(crearFicha(arbol));
}

// Iniciar al cargar el módulo
cargarFicha();
