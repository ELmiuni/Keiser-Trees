# Sistema de diseño — Keiser Trees

**Proyecto:** Guía de árboles del campus · Keiser University Latin American Campus
**Responsable:** `disenador-ux-ui` · **Actualizado:** 2026-10-26

## Dirección visual

Una guía botánica editorial con base de papel lino, superficies cálidas, verdes de campus y acentos dorados. La foto del campus es la protagonista: el hero conserva la proporción 1200×420 de `keiserbanner.jpg` en escritorio y utiliza únicamente una sombra vertical ligera para separar el texto. La ficha y la galería consumen datos dinámicos; no deben contener especies de ejemplo.

## Tokens visuales

- **Fondo lino:** `--color-bg: #f7f4ed`; **superficie cálida:** `--color-surface: #fffdfa`; sección suave `#f1ecdf`.
- **Bosque:** `--color-primary: #166534`; **esmeralda:** `#22c55e`; **dorado solar:** `#eab308`.
- **Texto carbón botánico:** `#283329`; texto auxiliar `#667064`.
- **Tipografía:** Poppins 400/500/600/700, con fallback del sistema.
- **Radios:** chips `999px`, controles `1rem`, tarjetas `1.35rem`, ficha `2rem`.
- **Sombras:** verdes y tierra difusas; tarjetas hover a `translateY(-8px)`.
- **Curva de transición:** `cubic-bezier(.16, 1, .3, 1)`; foco visible y movimiento reducido respetado.

## Recursos gráficos inspeccionados

- `images/keiserbanner.jpg` (1200×420): fotografía panorámica nítida. Preload de prioridad alta en ambas plantillas. En escritorio conserva su relación original; overlay vertical suave, texto blanco con sombra legible.
- `images/HOJAssspng.png`: transparencia alfa y bordes limpios. Se usa muy pequeño como marca de la insignia del hero y como adorno del divisor editorial.
- `images/SiluetaAborlespng.png`: silueta transparente, compuesta en blanco con opacidad baja como paisaje de fondo del footer.
- `images/IlustracionHierbaverde.png`: alfa correcto, pero el acabado pictórico y las formas de alto contraste compiten con la fotografía; se descarta.
- `images/tecaEjemplo.png`: contiene cuadrícula de transparencia y marca de agua; se descarta.
- `images/mango.png` y `images/madrono.png`: fotografías de ejemplares, no adornos de interfaz. Se dejan disponibles para el catálogo si los datos aprobados las referencian; no se fijan en el HTML.

## Componentes y estructura dinámica

### Hero y footer

Ambas vistas públicas comparten `.hero-header`, `.hero-content`, `.hero-eyebrow` y el pie `.colorful-footer`. El hero usa texto con sombra y reveal de máscara. El pie usa la silueta PNG sin alterar el orden ni legibilidad del copyright y enlace discreto.

### Galería (`index.html`)

- La cuadrícula exterior es `<section id="gallery" class="gallery">`.
- Se conserva `<div id="galeria" class="gallery-items">` como destino requerido por `js/app-galeria.js`; `display: contents` hace que sus hijos entren en la grilla.
- Tarjetas responsive: una columna móvil, dos tablet, tres escritorio. Imágenes `object-fit: cover`, relación 4:3, radios y overflow oculto.
- En escritorio moderno, `animation-timeline: view()` revela `.intro` y `.card` al entrar al scrollport. Fuera de soporte, permanece la entrada `fadeInUp` temporal.
- Carga: `.gallery-loading` con motivo botánico y esqueletos cálidos con shimmer; vacío/error usan `.gallery-empty` y `.gallery-error`.

### Contrato actual de tarjeta (lo genera `js/render.js`)

```html
<a class="card" href="arbol.html?id={id}">
  <div class="card-media"><img src="{imagen_url}" alt="Fotografía de {nombre_comun}"></div>
  <div class="card-body">
    <h3 class="card-title">{nombre_comun}</h3>
    <p class="sci-name">{nombre_cientifico}</p>
    <div class="card-meta"><span class="card-meta-item">📍 {ubicacion}</span><span class="card-meta-item">🗓 {anio_plantacion}</span></div>
    <div class="card-estado"><span class="badge-estado badge-estado--{estado}">{estado_salud}</span></div>
  </div>
  <div class="card-actions"><span class="btn btn-primary">Ver ficha →</span></div>
</a>
```

Si no hay `imagen_url`, `.card-media` contiene `.card-placeholder` (no crear `<img>` sin `src`). Los elementos de metadatos opcionales pueden faltar según los datos.

### Ficha (`arbol.html`)

- El destino de `js/app-ficha.js` se mantiene como `#ficha-contenedor`.
- El render actual crea `<article class="ficha">` con `.ficha-media` (imagen cover o `.card-placeholder--ficha`) y `.ficha-info`.
- Dentro de `.ficha-info`: `h1`, `.sci-name`, `<dl class="ficha-meta">` con cuatro `.ficha-meta-item` (cada uno con `dt.ficha-meta-label` + `dd.ficha-meta-value`), `.ficha-section` para descripción y beneficios opcionales, y `.ficha-actions > a.btn.btn-secondary`.
- `.ficha-back` anima su flecha hacia la izquierda al pasar el cursor. Estados `.ficha-loading` y `.ficha-not-found` comparten la paleta editorial.

## Animación y accesibilidad

Hero: `hero-text-reveal` con máscara y desplazamiento leve; encabezado y copy entran suavemente. Galería: `revealUp` ligada al scroll cuando el navegador la soporta. Tarjetas: elevación de 8px, zoom de imagen 1.04 y chips con cambio sutil. Botones: brillo reflectante, micro-rebote al pulsar y degradado verde. Skeleton: brillo que cruza los espacios de carga. `prefers-reduced-motion` reduce/desactiva animaciones y transiciones; animaciones de scroll incluyen fallback visible.

## Hojas CSS

- `css/base.css`: tokens beige, Poppins, hero, botones, badges, footer y utilidades.
- `css/galeria.css`: intro, tarjetas, cuadrícula, shimmer y reveal de scroll.
- `css/ficha.css`: layout, imagen, metadatos y estados de ficha.
- `styles.css` y `arboles.css` son wrappers de compatibilidad; las páginas públicas cargan las hojas específicas directamente.