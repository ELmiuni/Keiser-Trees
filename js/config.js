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
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
