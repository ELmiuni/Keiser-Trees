/**
 * js/data.js — Keiser Trees
 * Consultas públicas de solo lectura a Supabase.
 *
 * Funciones exportadas:
 *   - getArboles()       → todos los árboles aprobados (para la galería)
 *   - getArbolById(id)   → un árbol por UUID (para la ficha)
 *   - getArbolBySlug(sl) → un árbol por slug (alternativa amigable)
 *
 * Reglas de seguridad:
 *   - Solo se leen registros con aprobado = true (el RLS lo impone en BD).
 *   - No se usan ni exposiciones de la clave service_role.
 *   - No se hacen operaciones de escritura en este módulo.
 */

import { supabase } from "./config.js";

// Columnas que devuelven las consultas (explícitas para no traer datos innecesarios).
const COLUMNS = [
  "id",
  "slug",
  "nombre_comun",
  "nombre_cientifico",
  "descripcion",
  "beneficios",
  "ubicacion",
  "anio_plantacion",
  "altura_m",
  "estado_salud",
  "imagen_url",
  "origen",
  "created_at",
].join(", ");

/**
 * Obtiene todos los árboles aprobados, ordenados por nombre común.
 * El filtro aprobado = true lo aplica el RLS en Supabase; la consulta
 * no necesita añadirlo explícitamente, pero lo incluimos como defensa
 * en profundidad por si el RLS se modifica sin querer.
 *
 * @returns {{ data: Object[]|null, error: Object|null }}
 */
export async function getArboles() {
  const { data, error } = await supabase
    .from("arboles")
    .select(COLUMNS)
    .eq("aprobado", true)
    .order("nombre_comun", { ascending: true });

  return { data, error };
}

/**
 * Obtiene un árbol por su UUID.
 * Si el árbol no existe o no está aprobado, data será null.
 *
 * @param {string} id — UUID del árbol (parámetro ?id= en la URL).
 * @returns {{ data: Object|null, error: Object|null }}
 */
export async function getArbolById(id) {
  if (!id || typeof id !== "string") {
    return { data: null, error: { message: "ID no válido." } };
  }

  const { data, error } = await supabase
    .from("arboles")
    .select(COLUMNS)
    .eq("id", id)
    .eq("aprobado", true)
    .maybeSingle();

  return { data, error };
}

/**
 * Obtiene un árbol por su slug legible (ej. "teca", "madrono").
 * Alternativa a getArbolById para URLs amigables.
 *
 * @param {string} slug — Slug del árbol (parámetro ?slug= en la URL).
 * @returns {{ data: Object|null, error: Object|null }}
 */
export async function getArbolBySlug(slug) {
  if (!slug || typeof slug !== "string") {
    return { data: null, error: { message: "Slug no válido." } };
  }

  const { data, error } = await supabase
    .from("arboles")
    .select(COLUMNS)
    .eq("slug", slug)
    .eq("aprobado", true)
    .maybeSingle();

  return { data, error };
}
