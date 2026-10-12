# AGENTS.md — Keiser Trees (Guía de árboles del campus)

Sitio web ambientalista con la guía de árboles del campus de Keiser University Latin American Campus
(San Marcos, Carazo, Nicaragua). Proyecto SGA 2025-2026. Idioma del sitio y de las respuestas: **español**.

## Stack actual
HTML5 semántico + CSS3 + JavaScript nativo. Sin frameworks salvo que `ARCHITECTURE.md` diga lo contrario.

## Equipo (cada agente vive en `.agent/skills/<nombre>/SKILL.md`)
| Agente | Archivos que puede modificar |
| :-- | :-- |
| `arquitecto` | `ARCHITECTURE.md`, estructura de carpetas, esquema de datos |
| `disenador-ux-ui` | `DESIGN.md`, `styles.css`, `arboles.css` (solo estilos y maquetas) |
| `datos-arboles` | `data/arboles.json`, `images/` (nombres y metadatos) |
| `fullstack` | `*.html`, `js/`, integración con backend |
| `seguridad-moderacion` | reglas de Storage/BD, `SECURITY.md` |
| `qa-pruebas` | `QA_REPORT.md` (solo reporta; no corrige) |
| `accesibilidad-seo` | `A11Y_SEO_REPORT.md` (reporta y propone cambios) |

## Reglas generales (aplican a todos)
1. Antes de trabajar, lee `ARCHITECTURE.md` y `DESIGN.md` si existen. Si no existen, pide al `arquitecto` / `disenador-ux-ui` que los creen.
2. No toques archivos fuera de tu lista. Si necesitas un cambio ajeno, déjalo anotado en `HANDOFF.md` con: qué, por qué, para quién.
3. Una sola fuente de verdad para los árboles: `data/arboles.json`. Nunca dupliques datos en HTML.
4. **Nunca** escribas claves, tokens o credenciales en archivos del repositorio. Usa `.env` (ignorado por git) o variables del servicio.
5. No borres ni sobrescribas imágenes ni datos sin avisar.
6. Antes de dar una tarea por terminada, di qué cambiaste, qué probaste y qué queda pendiente.
7. Cambios pequeños y revisables: un tema por vez.

## Orden de trabajo
1. `arquitecto` → 2. `datos-arboles` + `disenador-ux-ui` → 3. `fullstack` → 4. `seguridad-moderacion`, `qa-pruebas`, `accesibilidad-seo` → 5. Revisión humana.

## Funcionalidad clave pedida
Un usuario puede enviar **un árbol con una sola foto** y su información. Los envíos quedan **pendientes** hasta que el equipo del SGA los apruebe.
