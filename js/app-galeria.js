/**
 * js/app-galeria.js — Keiser Trees
 * Controlador de index.html.
 * Orquesta la carga de árboles desde Supabase y el renderizado de la galería.
 */

import { getArboles } from "./data.js";
import {
  crearTarjeta,
  mostrarCargando,
  mostrarVacio,
  mostrarError,
} from "./render.js";

/** Referencia al contenedor principal de la galería */
const galeria = document.getElementById("galeria");

/**
 * Carga los árboles y los pinta en la galería.
 * Se llama al inicio y al hacer clic en "Reintentar".
 */
async function cargarGaleria() {
  if (!galeria) return;

  // 1. Estado de carga
  mostrarCargando(galeria);

  // 2. Consulta a Supabase
  const { data: arboles, error } = await getArboles();

  // 3. Manejo de error de red / Supabase
  if (error) {
    console.error("[Keiser Trees] Error al cargar árboles:", error.message);
    mostrarError(galeria, cargarGaleria, error.message);
    return;
  }

  // 4. Galería vacía
  if (!arboles || arboles.length === 0) {
    mostrarVacio(galeria);
    return;
  }

  // 5. Renderizado normal: limpiar y pintar tarjetas
  galeria.innerHTML = "";
  arboles.forEach((arbol) => {
    galeria.appendChild(crearTarjeta(arbol));
  });
}

// Iniciar al cargar el módulo
cargarGaleria();
