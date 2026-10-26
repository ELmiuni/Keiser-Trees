# FALTANTES.md — Registro de Fotografías y Datos Pendientes del Campus

**Proyecto:** Keiser Trees (Guía de árboles del campus de Keiser University)  
**Agente responsable:** `datos-arboles`  
**Fecha:** 12 de octubre de 2026  
**Documentos de referencia:** [ARCHITECTURE.md](file:///c:/Users/jala1/OneDrive/Desktop/KU%20Trees%20Web%20Page/Keiser%20Trees/ARCHITECTURE.md) y [HANDOFF.md](file:///c:/Users/jala1/OneDrive/Desktop/KU%20Trees%20Web%20Page/Keiser%20Trees/HANDOFF.md)

---

## (a) Imágenes que no existen en `images/`

En el repositorio local actualmente **únicamente existen tres archivos** en la carpeta `images/`:
- `images/keiserbanner.jpg` (Banner institucional del encabezado)
- `images/tectona.jpg` (Fotografía asignada a la Teca)
- `images/tecaEjemplo.png` (Imagen de referencia de maquetación)

Las referencias previas de `index.html` a nombres como `ceiba.jpg`, `caoba.jpg`, `guayacan.jpg`, `acacia.jpg`, `coco.jpg`, `almendro.jpg` y `nim.jpg` correspondían a cruces arbitrarios y **ninguno de esos archivos existe**.

Para completar la galería oficial de los 11 árboles, el equipo del campus debe recopilar y subir las siguientes **10 fotografías faltantes** con sus nombres exactos (en minúsculas, sin tildes ni espacios):

| # | Árbol | Nombre de archivo requerido | Ruta local esperada | Estado actual |
| :-: | :--- | :--- | :--- | :--- |
| 1 | **Teca** | `tectona.jpg` | `images/tectona.jpg` | **Disponible** |
| 2 | **Árbol de mango** | `mango.jpg` | `images/mango.jpg` | **Faltante** |
| 3 | **Roble** | `roble.jpg` | `images/roble.jpg` | **Faltante** |
| 4 | **Limón dulce** | `limon-dulce.jpg` | `images/limon-dulce.jpg` | **Faltante** |
| 5 | **Palmera** | `palmera.jpg` | `images/palmera.jpg` | **Faltante** |
| 6 | **Guayaba** | `guayaba.jpg` | `images/guayaba.jpg` | **Faltante** |
| 7 | **Pino** | `pino.jpg` | `images/pino.jpg` | **Faltante** |
| 8 | **Madroño** | `madrono.jpg` | `images/madrono.jpg` | **Faltante** |
| 9 | **Malinche** | `malinche.jpg` | `images/malinche.jpg` | **Faltante** |
| 10 | **Guanábana** | `guanabana.jpg` | `images/guanabana.jpg` | **Faltante** |
| 11 | **Bambú** | `bambu.jpg` | `images/bambu.jpg` | **Faltante** |

> **Criterios técnicos para las fotografías:**  
> - Formato: JPG, PNG o WebP.  
> - Peso máximo: $\le 5\text{ MB}$ por archivo (según políticas de Storage en `ARCHITECTURE.md`).  
> - Orientación: Preferiblemente vertical o encuadre centrado adecuado para recorte adaptable (`object-fit: cover`).

---

## (b) Datos del ejemplar que debe completar el humano

En `data/arboles.json`, la **Teca** ya cuenta con los datos reales registrados en `teca.html`:
- Ubicación: `"Zona Norte"`
- Año de plantación: `2024`
- Altura: `16.0` metros
- Estado de salud: `"Excelente"`

Para los **10 árboles restantes**, los campos físicos del ejemplar en el campus se han dejado en `null` para no inventar información de campo. El equipo debe relevar y registrar los siguientes 4 valores por árbol:

| Árbol (Slug) | Ubicación en Campus (`ubicacion`) | Año de Plantación (`anio_plantacion`) | Altura estimada en m (`altura_m`) | Estado de Salud (`estado_salud`) |
| :--- | :---: | :---: | :---: | :---: |
| `mango` | *Pendiente* | *Pendiente* | *Pendiente* | *Pendiente* |
| `roble` | *Pendiente* | *Pendiente* | *Pendiente* | *Pendiente* |
| `limon-dulce` | *Pendiente* | *Pendiente* | *Pendiente* | *Pendiente* |
| `palmera` | *Pendiente* | *Pendiente* | *Pendiente* | *Pendiente* |
| `guayaba` | *Pendiente* | *Pendiente* | *Pendiente* | *Pendiente* |
| `pino` | *Pendiente* | *Pendiente* | *Pendiente* | *Pendiente* |
| `madrono` | *Pendiente* | *Pendiente* | *Pendiente* | *Pendiente* |
| `malinche` | *Pendiente* | *Pendiente* | *Pendiente* | *Pendiente* |
| `guanabana` | *Pendiente* | *Pendiente* | *Pendiente* | *Pendiente* |
| `bambu` | *Pendiente* | *Pendiente* | *Pendiente* | *Pendiente* |

> **Valores sugeridos para `estado_salud`:**  
> `'Excelente'`, `'Bueno'`, `'Regular'`, `'En recuperación'`.

---

## (c) Puntos a verificar

Durante la auditoría taxonómica y botánica de `index.html`, se detectaron inconsistencias importantes que deben ser confirmadas en inspección directa del campus:

1. **Madroño (Crucial — Taxonomía errónea en HTML previo):**
   - En `index.html` figuraba asignado como *Arbutus unedo* (madroño mediterráneo/europeo).
   - En Nicaragua, el **Árbol Nacional** denominado Madroño es ***Calycophyllum candidissimum*** (familia Rubiaceae).
   - En `data/arboles.json` se marcó temporalmente como `"pendiente_verificar"` para que el equipo confirme la identidad botánica del ejemplar físico presente en San Marcos.

2. **Roble (Duda de especie por piso térmico):**
   - En `index.html` figuraba *Quercus spp*.
   - En la región del Pacífico y la meseta de Carazo, el árbol llamado popularmente "roble" suele ser el **roble sabanero** (***Tabebuia rosea***, familia Bignoniaceae). Los robles verdaderos (*Quercus*) se distribuyen naturalmente en zonas altas y frías del norte nicaragüense.
   - En `data/arboles.json` se marcó como `"pendiente_verificar"` para corroborar si se trata de un *Quercus* plantado o de un *Tabebuia rosea*.

3. **Palmera (Falta de binomio específico):**
   - En `index.html` figuraba *Arecaceae*, lo cual corresponde a la familia botánica y no a un binomio científico (*Género especie*).
   - En `data/arboles.json` se marcó como `"pendiente_verificar"` hasta identificar la especie del ejemplar (ej. Palma real *Roystonea regia*, Palma areca *Dypsis lutescens*, Cocotero *Cocos nucifera*, etc.).

4. **Pino (Falta de especie específica):**
   - En `index.html` figuraba *Pinus spp*.
   - Se marcó como `"pendiente_verificar"` para determinar con exactitud la especie plantada en el campus (ej. *Pinus caribaea*, *Pinus oocarpa*).

5. **Bambú (Validación de especie):**
   - En `index.html` figura *Bambusa vulgaris*. Conviene que el equipo verifique si en el campus corresponde a *Bambusa vulgaris* o a otra gramínea leñosa como *Guadua angustifolia*.

6. **Limón dulce (Sinonimia botánica):**
   - Se registró *Citrus limetta*. Validar si se prefiere mantener este binomio tradicional o actualizar a su sinónimo aceptado *Citrus limettioides*.

7. **Estandarización de imagen de la Teca:**
   - La foto existente en disco es `images/tectona.jpg`. En el futuro, si se adopta la convención de almacenar en `images/arboles/` con el slug del árbol, se podrá copiar/renombrar a `teca.jpg` para mantener consistencia con los demás árboles.
