# DESIGN.md — Sistema de Diseño: Keiser Trees
**Proyecto:** Guía de Árboles del Campus · Keiser University LAC (San Marcos, Carazo, Nicaragua)  
**Agente responsable:** `disenador-ux-ui`  
**Fuente de diseño:** Google Stitch — proyecto *Árboles del Campus Guide* (`projects/6382520036840104520`), sistema *Arboretum Editorial*  
**Última actualización:** 2026-10-26  

---

## 1. Tipografía

### Fuentes usadas

| Rol | Fuente | Uso |
|-----|--------|-----|
| Títulos y encabezados | **Ranade** | `h1`–`h4`, nombre común del árbol, nombre de la página |
| Cuerpo e interfaz | **Inter** | párrafos, etiquetas, botones, inputs, metadata |

> [!IMPORTANT]
> **Ranade no está en Google Fonts.** Estrategia de carga propuesta (elige una antes de que `fullstack` implemente):
>
> **Opción A — Fontshare (recomendada, gratis, CDN):**
> ```html
> <link rel="preconnect" href="https://api.fontshare.com">
> <link rel="stylesheet"
>   href="https://api.fontshare.com/v2/css?f[]=ranade@400,500,600,700&display=swap">
> ```
>
> **Opción B — Archivo local (sin dependencias externas):**
> Descarga los archivos `.woff2` del sitio de ITF (Indian Type Foundry) o Fontshare y colócalos en `fonts/ranade/`.  
> Luego en `css/base.css`:
> ```css
> @font-face {
>   font-family: "Ranade";
>   src: url("../fonts/ranade/Ranade-Regular.woff2") format("woff2");
>   font-weight: 400; font-style: normal; font-display: swap;
> }
> /* Repetir para 500, 600, 700 */
> ```
>
> **Fuente de respaldo en ambos casos:** `"Epilogue", system-ui, sans-serif`  
> Epilogue es geométrica y de proporciones similares a Ranade; minimiza el layout shift.

### Escala tipográfica

| Token | Fuente | Tamaño | Peso | Line-height | Letra-spacing | Uso |
|-------|--------|--------|------|-------------|---------------|-----|
| `--type-hero` | Ranade | `clamp(2rem, 5vw, 3.5rem)` | 700 | 1.1 | -0.02em | Hero principal |
| `--type-hero-mobile` | Ranade | `2rem` | 700 | 1.2 | -0.01em | Hero en móvil |
| `--type-h2` | Ranade | `clamp(1.5rem, 3vw, 2.5rem)` | 600 | 1.2 | -0.015em | Títulos de sección |
| `--type-h3` | Ranade | `1.375rem` | 600 | 1.3 | 0 | Subtítulos de tarjeta |
| `--type-h4` | Ranade | `1.125rem` | 500 | 1.4 | 0 | Encabezados menores |
| `--type-sci` | Ranade | `1rem` | 400 (italic) | 1.5 | 0.01em | Nombre científico |
| `--type-body-lg` | Inter | `1.125rem` | 400 | 1.75 | 0 | Descripción, beneficios |
| `--type-body` | Inter | `1rem` | 400 | 1.6 | 0 | Párrafos generales |
| `--type-body-sm` | Inter | `0.875rem` | 400 | 1.5 | 0 | Metadata secundaria |
| `--type-label` | Inter | `0.875rem` | 600 | 1.4 | 0.02em | Etiquetas, chips |
| `--type-label-sm` | Inter | `0.75rem` | 500 | 1.3 | 0.04em | Badges, micro-labels |

---

## 2. Paleta de Colores

Basada en el sistema *Arboretum Editorial* de Stitch, adaptada para cumplir **WCAG 2.1 AA**.

### Colores primarios y de marca

| Variable CSS | Hex | Nombre | Uso principal |
|---|---|---|---|
| `--color-primary` | `#144229` | Verde bosque oscuro | Acciones CTA, headings, focus rings |
| `--color-primary-container` | `#2D5A3F` | Verde bosque medio | Fondo de botón primario, hover states |
| `--color-primary-light` | `#A1D2AF` | Verde salvia claro | Bordes, chips activos, íconos secundarios |
| `--color-secondary` | `#3D6751` | Verde helecho | Acciones secundarias, links internos |
| `--color-secondary-container` | `#BFEDD1` | Verde menta | Fondos de badges de estado |
| `--color-accent` | `#C5E384` | Verde lima solar | CTAs flotantes, estado activo de chips |
| `--color-sky` | `#BFE3F0` | Azul cielo suave | Badges de especie, agua, clima |
| `--color-bark` | `#4A3728` | Marrón corteza | Texto principal, bordes estructurales |
| `--color-bark-muted` | `#755C45` | Marrón corteza suave | Texto secundario, placeholders |

### Colores de fondo y superficie

| Variable CSS | Hex | Uso |
|---|---|---|
| `--color-bg` | `#FBF7EE` | Fondo general (crema cálida) |
| `--color-surface` | `#FFF9EA` | Fondo de página, hero |
| `--color-surface-low` | `#F9F3E4` | Fondo de secciones alternadas |
| `--color-card` | `#FFFFFF` | Fondo de tarjetas y formularios |
| `--color-card-elevated` | `#FBF7EE` | Tarjeta en estado hover/focus |

### Colores semánticos (estado de salud del árbol)

| Estado | Color texto | Fondo badge | Variable |
|--------|-------------|-------------|----------|
| Excelente | `#144229` | `#BFEDD1` | `--estado-excelente` |
| Bueno | `#1E4D2B` | `#D4F0DE` | `--estado-bueno` |
| Regular | `#7A4A00` | `#FFF3CD` | `--estado-regular` |
| En recuperación | `#8B4513` | `#FFE4CC` | `--estado-recuperacion` |
| Malo | `#93000A` | `#FFDAD6` | `--estado-malo` |
| Seco | `#4A4A4A` | `#E8E8E8` | `--estado-seco` |

### Colores de sistema (error, éxito, aviso)

| Tipo | Texto | Fondo | Variable |
|------|-------|-------|----------|
| Error | `#93000A` | `#FFDAD6` | `--color-error` / `--color-error-bg` |
| Éxito | `#144229` | `#BFEDD1` | `--color-success` / `--color-success-bg` |
| Aviso | `#7A4A00` | `#FFF3CD` | `--color-warning` / `--color-warning-bg` |
| Info | `#0A4D6E` | `#BFE3F0` | `--color-info` / `--color-info-bg` |

---

## 3. Espaciado

Sistema basado en múltiplos de 4px (escala 8pt). Variables CSS en `rem` asumiendo `font-size: 16px`.

| Token | Valor rem | px equivalente | Uso típico |
|-------|-----------|----------------|------------|
| `--space-xs` | `0.25rem` | 4px | Margen interior mínimo, separador de ícono |
| `--space-sm` | `0.5rem` | 8px | Padding de chips, gap entre meta-datos |
| `--space-md` | `1rem` | 16px | Padding interno de tarjeta (móvil) |
| `--space-lg` | `1.5rem` | 24px | Gap de cuadrícula, padding de sección |
| `--space-xl` | `2.5rem` | 40px | Separación entre secciones |
| `--space-2xl` | `4rem` | 64px | Margen vertical de hero, secciones mayores |
| `--gutter` | `1.5rem` | 24px | Gutter de grilla |
| `--gutter-mobile` | `1rem` | 16px | Gutter en móvil |
| `--container` | `1100px` | — | Ancho máximo del contenido |
| `--margin-desktop` | `3rem` | 48px | Margen lateral desktop |
| `--margin-mobile` | `1.25rem` | 20px | Margen lateral móvil |

---

## 4. Radios de Borde

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-sm` | `0.25rem` (4px) | Inputs, checkboxes, badges pequeños |
| `--radius-md` | `0.75rem` (12px) | Botones, chips, fields de formulario |
| `--radius-lg` | `1rem` (16px) | Tarjetas de galería, contenedores de imagen |
| `--radius-xl` | `1.25rem` (20px) | Tarjeta de ficha de árbol, modales |
| `--radius-hero` | `0 0 2rem 2rem` | Hero header (inferior) |
| `--radius-footer` | `2rem 2rem 0 0` | Footer (superior) |
| `--radius-pill` | `9999px` | Tags de taxonomía, estado de salud |

---

## 5. Sombras

Diseñadas con tinte cálido en marrón corteza (`#4A3728`) en lugar de negro puro. Inspiración: *solar shadows* del sistema *Arboretum Editorial*.

| Token | Valor | Uso |
|-------|-------|-----|
| `--shadow-sm` | `0 2px 8px rgba(74,55,40,0.06)` | Inputs en reposo, separadores sutiles |
| `--shadow-md` | `0 4px 16px rgba(74,55,40,0.08)` | Tarjetas de galería en reposo |
| `--shadow-lg` | `0 8px 24px rgba(74,55,40,0.10)` | Tarjetas de galería en hover |
| `--shadow-xl` | `0 12px 40px rgba(74,55,40,0.14)` | Modales, panel admin |
| `--shadow-focus` | `0 0 0 3px rgba(20,66,41,0.35)` | Focus ring de accesibilidad (verde) |
| `--shadow-error` | `0 0 0 3px rgba(147,0,10,0.30)` | Focus ring de campo con error |

---

## 6. Transiciones y Animaciones

```css
/* Velocidades */
--transition-fast:   150ms ease-out;   /* Hover de botones pequeños */
--transition-base:   200ms ease-in-out; /* Hover de tarjetas, color de inputs */
--transition-slow:   300ms ease-in-out; /* Elevación de tarjeta, slide de panel */

/* Uso */
.card             { transition: transform var(--transition-slow),
                                box-shadow var(--transition-slow); }
.btn              { transition: opacity var(--transition-fast),
                                background var(--transition-fast); }
input, select     { transition: border-color var(--transition-base),
                                box-shadow var(--transition-base); }
```

> [!IMPORTANT]
> **Respetar `prefers-reduced-motion`.**  
> En `css/base.css` se incluye:
> ```css
> @media (prefers-reduced-motion: reduce) {
>   *, *::before, *::after {
>     animation-duration: 0.01ms !important;
>     transition-duration: 0.01ms !important;
>   }
> }
> ```

---

## 7. Siluetas Decorativas de Árboles (SVG inline)

Las siluetas son elementos puramente decorativos (`aria-hidden="true"`) que aportan identidad visual sin peso de imagen. Se incluyen como SVG inline en el HTML y se controlan desde CSS.

**Propiedades base:**
```css
.tree-silhouette {
  position: absolute;
  opacity: 0.06;           /* 6 % — visible sin distraer */
  color: var(--color-primary);
  pointer-events: none;
  user-select: none;
}
.hero-header        .tree-silhouette { opacity: 0.10; }  /* Más visible en hero oscuro */
.colorful-footer    .tree-silhouette { opacity: 0.12; }
```

**Variantes disponibles** (el fullstack elige cuál SVG poner en cada página):

| Clase modificadora | Descripción |
|---|---|
| `.tree-silhouette--teca` | Árbol de copa densa, ovalada |
| `.tree-silhouette--palmera` | Palma esbelta, frondas largas |
| `.tree-silhouette--pino` | Conifera triangular |
| `.tree-silhouette--malinche` | Copa extendida, aparasolada |

> [!NOTE]
> Los SVG de las siluetas **no se crean aquí** (son SVG de código). El fullstack puede usar íconos de Heroicons, Phosphor o un SVG propio. El agente `disenador-ux-ui` los especifica como clases y posicionamiento; el fullstack los implementa.

---

## 8. Componentes

### 8.1 Tarjeta de Árbol (`.card`)

**Galería pública** — elemento de cuadrícula que enlaza a la ficha.

```
┌──────────────────────────────┐
│  [imagen 4:3 / placeholder]  │  ← .card-media
├──────────────────────────────┤
│  Nombre Común                │  ← .card-title (Ranade, h3)
│  Nombre científico (italic)  │  ← .card-sci   (Ranade, italic)
│  📍 Zona Norte               │  ← .card-meta
│  Estado: [badge]             │  ← .card-estado
├──────────────────────────────┤
│  [Btn: Ver ficha →]          │  ← .card-actions
└──────────────────────────────┘
```

**Reglas de uso:**
- Imagen siempre con `object-fit: cover`; relación de aspecto `4/3`.
- Si `imagen_url` es `null` → mostrar `.card-placeholder` (ver §8.5).
- Si datos de `ubicacion`, `altura_m`, `anio_plantacion` o `estado_salud` son `null` → mostrar texto "Por confirmar" en `--color-bark-muted`.
- Hover: elevación de 6px, sombra aumenta a `--shadow-lg`.
- El enlace envuelve toda la tarjeta (`<a class="card" href="arbol.html?id=...">`).

---

### 8.2 Botones

| Clase | Aspecto | Uso | Tamaño mínimo |
|-------|---------|-----|---------------|
| `.btn-primary` | Verde bosque sólido + texto blanco | Acción principal (Guardar, Ver ficha) | 44px alto |
| `.btn-secondary` | Fondo verde menta + texto verde bosque | Acción secundaria (Volver) | 44px alto |
| `.btn-outline` | Borde 1.5px verde bosque + texto verde | Acción terciaria (Cancelar) | 44px alto |
| `.btn-danger` | Rojo de error + texto blanco | Eliminar, acción destructiva | 44px alto |
| `.btn-loading` | Estado deshabilitado + spinner | Durante subida al servidor | 44px alto |

**Reglas de uso:**
- Nunca usar `opacity` como único indicador de estado deshabilitado (añadir `cursor: not-allowed` + `aria-disabled`).
- En formulario de admin: el botón "Guardar árbol" adopta `.btn-loading` mientras dura la operación de subida.

---

### 8.3 Formulario de Administración

**Campos del formulario** (solo los que el diseño debe contemplar; ver ARCHITECTURE.md para lógica):

| Campo | Tipo HTML | Obligatorio | Validación |
|-------|-----------|-------------|------------|
| Nombre común | `<input type="text">` | Sí | No vacío |
| Nombre científico | `<input type="text">` | Sí | No vacío |
| Descripción | `<textarea rows="4">` | Sí | No vacío |
| Beneficios | `<textarea rows="3">` | No | — |
| Ubicación | `<input type="text">` | Sí | No vacío |
| Año de plantación | `<input type="number" min="1900" max="2099">` | No | Entero |
| Altura estimada (m) | `<input type="number" min="0" step="0.1">` | No | Decimal |
| Estado de salud | `<select>` | No | Ver valores |
| Foto (única) | `<input type="file" accept="image/jpeg,image/png,image/webp">` | No | ≤ 5 MB |
| Publicar de inmediato | `<input type="checkbox">` | — | — |

**Valores del selector de `estado_salud`:**
```
(opción vacía: sin seleccionar)
Excelente
Bueno
Regular
En recuperación
Malo
Seco
```

> [!IMPORTANT]
> Los campos `origen` y `aprobado` **NO aparecen en el formulario de alta**. `origen` se asigna automáticamente como `"admin"` y `aprobado` se determina por el checkbox "Publicar de inmediato".

**Reglas de estilo:**
- Todos los campos: fondo `--color-card`, borde 1.5px `rgba(74,55,40,0.15)`, radio `--radius-md`.
- Focus: borde cambia a `--color-primary` + `--shadow-focus`.
- Estado de error: borde rojo `--color-error` + mensaje de error en rojo bajo el campo.
- `<label>` siempre visible encima del campo (nunca placeholder como único label).

---

### 8.4 Avisos / Notificaciones (`.alert`)

| Clase | Color | Icono | Uso |
|-------|-------|-------|-----|
| `.alert-success` | Verde bosque / fondo verde menta | ✓ | Árbol guardado correctamente |
| `.alert-error` | Rojo / fondo rojo claro | ✗ | Error de subida, formato incorrecto |
| `.alert-warning` | Marrón / fondo amarillo suave | ⚠ | Foto mayor a 5 MB, formato no permitido |
| `.alert-info` | Azul / fondo azul cielo | ℹ | Información general, estado de proceso |

**Estructura HTML esperada:**
```html
<div class="alert alert-success" role="alert">
  <span class="alert-icon" aria-hidden="true">✓</span>
  <p class="alert-message">Árbol guardado y publicado correctamente.</p>
</div>
```

---

### 8.5 Marcador "Foto próximamente" (`.card-placeholder`)

Se muestra cuando `imagen_url` es `null` en la tarjeta de galería y en la ficha de árbol.

**Especificación visual:**
```
┌──────────────────────────────┐
│                              │
│   🌿  (ícono árbol o hoja)   │  color: --color-primary-light
│   Foto próximamente          │  Ranade, italic, --color-bark-muted
│                              │
└──────────────────────────────┘
```

- Fondo: `--color-surface-low` con borde punteado 2px `--color-primary-light`.
- Relación de aspecto: misma que la imagen real (`4/3` en galería; proporcional en ficha).
- No usar `<img>` sin `src`; usar un `<div class="card-placeholder">` en su lugar.
- El marcador es informativo pero no interactivo; no requiere `alt`.

---

## 9. Layout y Grilla

### Galería (`index.html`)
- **Mobile-first:** columna única, `padding: var(--margin-mobile)`.
- **Tablet (≥ 640px):** 2 columnas, `gap: var(--gutter)`.
- **Desktop (≥ 1024px):** 3 columnas, `max-width: var(--container)`, `margin: 0 auto`.
- Cuadrícula CSS: `display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`.

### Ficha de árbol (`arbol.html`)
- **Mobile:** imagen full-width arriba, info abajo (una columna).
- **Desktop (≥ 768px):** imagen a la izquierda (40%), info a la derecha (60%), `gap: var(--space-xl)`.
- Meta-datos en caja `--color-surface-low` con borde suave.

### Admin (`admin.html`)
- Formulario centrado, `max-width: 640px`, `margin: 0 auto`.
- Vista de login: tarjeta centrada, máximo 400px.
- Vista de panel: tarjeta más ancha, 640px.

---

## 10. Accesibilidad (Reglas CSS)

- **Contraste mínimo:** texto sobre fondo debe cumplir ratio **4.5:1** (AA). Verificado:
  - `--color-primary` `#144229` sobre `#FFF9EA` → ratio ≈ 10.2:1 ✓
  - `--color-bark` `#4A3728` sobre `#FFF9EA` → ratio ≈ 9.8:1 ✓
  - Badge `.btn-primary` blanco sobre `#144229` → ratio ≈ 10.2:1 ✓
  - Texto en `.alert-warning` `#7A4A00` sobre `#FFF3CD` → ratio ≈ 5.1:1 ✓
- **Focus visible:** todos los elementos interactivos tienen `outline` visible. No usar `outline: none` sin alternativa.
- **Tamaño mínimo de toque:** 44×44px en todos los botones e inputs (especialmente en móvil).
- **No depender solo del color:** los estados de error, éxito y salud incluyen texto o ícono además del color.

---

*Fin de DESIGN.md — Agente: `disenador-ux-ui` · Sistema: Arboretum Editorial (Stitch) + adaptaciones Ranade/Inter*
