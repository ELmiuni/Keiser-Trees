/**
 * js/config.js — Keiser Trees
 * Configuración pública del cliente Supabase.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  INSTRUCCIONES PARA EL ADMINISTRADOR                        │
 * │                                                             │
 * │  1. Ve a Supabase Dashboard > Project Settings > API        │
 * │  2. Copia los dos valores marcados abajo (PLACEHOLDER).     │
 * │  3. Nunca pegues la clave "service_role" — solo la "anon".  │
 * │  4. Estas claves son públicas por diseño (ver SECURITY.md). │
 * └─────────────────────────────────────────────────────────────┘
 *
 * SEGURIDAD: Estas credenciales pueden estar en el repositorio
 * porque la clave anon + RLS activo no permiten escritura anónima.
 * La clave service_role NUNCA debe aparecer aquí ni en ningún
 * archivo del repositorio.
 */

// ── REEMPLAZA ESTOS DOS VALORES CON LOS DE TU PROYECTO ─────────
// Supabase Dashboard > Project Settings > API > Project URL
export const SUPABASE_URL = "https://yahcawnenytxukircgiy.supabase.co";
// Supabase Dashboard > Project Settings > API > Project API Keys > anon / public
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaGNhd25lbnl0eHVraXJjZ2l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MzgwODYsImV4cCI6MjEwNzQxNDA4Nn0.wIZtOlHszwdrR7ZYgb4AHPR_5OA9XFjxBzOCGhrldAo";
// ────────────────────────────────────────────────────────────────

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";

/**
 * Cliente Supabase singleton.
 * Versión fija: @supabase/supabase-js@2.45.4 (no "latest").
 * Se importa desde CDN con ES Module para no requerir bundler.
 */
const SUPABASE_REQUEST_TIMEOUT_MS = 20_000;

/** Fetch acotado para que una petición de Supabase no deje el formulario bloqueado.
 * El registro omite query, headers y body para no exponer tokens ni datos.
 */
async function supabaseFetch(input, init = {}) {
  const startedAt = performance.now();
  const controller = new AbortController();
  const upstreamSignal = init.signal;
  const abortFromUpstream = () => controller.abort(upstreamSignal?.reason);
  upstreamSignal?.addEventListener("abort", abortFromUpstream, { once: true });
  const timeoutId = setTimeout(() => controller.abort(new Error("Supabase request timeout")), SUPABASE_REQUEST_TIMEOUT_MS);
  const requestInit = { ...init, signal: controller.signal };
  const url = typeof input === "string" ? input : input?.url || "";
  let route = "Supabase";
  try {
    route = new URL(url, SUPABASE_URL).pathname;
  } catch {
    // Keep a generic route if the request URL cannot be parsed.
  }

  try {
    const response = await fetch(input, requestInit);
    console.info("[Supabase] solicitud completada", {
      route,
      status: response.status,
      durationMs: Math.round(performance.now() - startedAt),
    });
    return response;
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt);
    console.error("[Supabase] solicitud fallida", {
      route,
      durationMs,
      timeout: controller.signal.aborted && !upstreamSignal?.aborted,
      error: error?.message || String(error),
    });
    throw error;
  } finally {
    clearTimeout(timeoutId);
    upstreamSignal?.removeEventListener("abort", abortFromUpstream);
  }
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { fetch: supabaseFetch },
});
