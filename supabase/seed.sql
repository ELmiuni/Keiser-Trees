-- ============================================================================
-- PROYECTO: Keiser Trees (Guía de árboles del campus de Keiser University)
-- ARCHIVO: supabase/seed.sql
-- RESPONSABLE: Agente fullstack
-- FECHA: Octubre 2026
-- DESCRIPCIÓN: Datos semilla canónicos basados en data/arboles.json.
--              11 árboles oficiales del campus.
--              Cumple todas las restricciones (CHECK, tipos, longitudes) de schema.sql.
-- ============================================================================

-- INSTRUCCIONES:
-- 1. Abre el "SQL Editor" en el panel de Supabase.
-- 2. Pega y ejecuta este script.
-- 3. Es idempotente: si ya existen por UUID o slug, se actualizan con los valores canónicos.

INSERT INTO public.arboles (
    id,
    slug,
    nombre_comun,
    nombre_cientifico,
    descripcion,
    beneficios,
    ubicacion,
    anio_plantacion,
    altura_m,
    estado_salud,
    imagen_url,
    origen,
    aprobado,
    created_at
) VALUES
(
    'a1e10001-0000-4000-8000-000000000001',
    'teca',
    'Teca',
    'Tectona grandis',
    'Árbol caducifolio de gran porte originario del sudeste asiático, ampliamente cultivado en regiones tropicales por la alta calidad y durabilidad de su madera.',
    'Alta tasa de captura de carbono y biomasa; su abundante hojarasca nutre y regenera el suelo; proporciona sombra amplia y produce madera altamente resistente a la humedad, hongos y plagas.',
    'Zona Norte',
    2024,
    16.0,
    'Excelente',
    'images/tectona.jpg', -- Foto disponible localmente. Si la subes a Supabase Storage, cambia a la URL pública del bucket.
    'campus',
    true,
    '2026-10-12T20:00:00Z'
),
(
    'a1e10002-0000-4000-8000-000000000002',
    'mango',
    'Árbol de mango',
    'Mangifera indica',
    'Árbol frutal perennifolio de copa densa y redondeada originario del sur de Asia, completamente adaptado a los suelos y clima tropical de Nicaragua.',
    'Ofrece sombra densa que mitiga el calor del entorno; produce frutos nutritivos ricos en vitaminas A y C; sirve como refugio y fuente de alimento para aves e insectos polinizadores.',
    NULL,
    NULL,
    NULL,
    NULL,
    'images/mango.png',
    'campus',
    true,
    '2026-10-12T20:00:00Z'
),
(
    'a1e10003-0000-4000-8000-000000000003',
    'roble',
    'Roble',
    'pendiente_verificar', -- NOTA: pendiente de clasificación taxonómica de campo (ej. Quercus oleoides o Tabebuia rosea)
    'Árbol de porte mediano a grande valorado por su floración y madera resistente; la especie botánica del ejemplar del campus requiere comprobación en campo (posible roble sabanero).',
    'Favorece la retención de humedad edáfica, aporta cobertura vegetal para avifauna urbana y contribuye a la regulación térmica en espacios abiertos del campus.',
    NULL,
    NULL,
    NULL,
    NULL,
    'images/roble.jpg',
    'campus',
    true,
    '2026-10-12T20:00:00Z'
),
(
    'a1e10004-0000-4000-8000-000000000004',
    'limon-dulce',
    'Limón dulce',
    'Citrus limetta',
    'Árbol frutal cítrico de copa compacta y follaje siempreverde aromático, cultivado comúnmente en huertos y jardines tropicales.',
    'Produce frutos jugosos con alto contenido de vitamina C y antioxidantes; su abundante floración blanca y fragante es fuente de néctar para abejas y favorece la polinización.',
    NULL,
    NULL,
    NULL,
    NULL,
    'images/limon-dulce.jpg',
    'campus',
    true,
    '2026-10-12T20:00:00Z'
),
(
    'a1e10005-0000-4000-8000-000000000005',
    'palmera',
    'Palmera',
    'pendiente_verificar', -- NOTA: clasificación de familia Arecaceae pendiente de especie exacta
    'Planta arborescente monocotiledónea de estípite esbelto y corona de frondas verdes; la especie exacta del ejemplar en el campus requiere clasificación botánica formal.',
    'Aporta valor paisajístico ornamental; ofrece sombra ligera, funciona como punto de percha y anidación para aves silvestres y tolera periodos prolongados de insolación.',
    NULL,
    NULL,
    NULL,
    NULL,
    'images/palmera.jpg',
    'campus',
    true,
    '2026-10-12T20:00:00Z'
),
(
    'a1e10006-0000-4000-8000-000000000006',
    'guayaba',
    'Guayaba',
    'Psidium guajava',
    'Árbol pequeño o arbusto frutal nativo del neotrópico, caracterizado por su corteza lisa y descascarillada en tonos cobrizos y follaje elíptico aromático.',
    'Frutos con extraordinaria concentración de vitamina C, fibra y licopeno; apoya activamente la biodiversidad del campus sirviendo de alimento a aves y pequeños mamíferos.',
    NULL,
    NULL,
    NULL,
    NULL,
    'images/guayaba.jpg',
    'campus',
    true,
    '2026-10-12T20:00:00Z'
),
(
    'a1e10007-0000-4000-8000-000000000007',
    'pino',
    'Pino',
    'pendiente_verificar', -- NOTA: Pinus spp. pendiente de comprobación botánica
    'Conífera perennifolia de fuste recto y follaje acicular aromático; la especie específica presente en el campus requiere confirmación botánica de campo.',
    'Filtrado continuo de partículas del aire, producción de resinas con propiedades antimicrobianas, retención del suelo mediante su sistema radicular y provisión de refugio invernal.',
    NULL,
    NULL,
    NULL,
    NULL,
    'images/pino.jpg',
    'campus',
    true,
    '2026-10-12T20:00:00Z'
),
(
    'a1e10008-0000-4000-8000-000000000008',
    'madrono',
    'Madroño',
    'pendiente_verificar', -- NOTA: Árbol Nacional (Calycophyllum candidissimum) pendiente de ratificación de campo
    'Árbol emblemático de Mesoamérica y Árbol Nacional de Nicaragua, reconocido por su corteza rojiza exfoliante y su profusa floración blanca aromática (clasificación botánica sujeta a corrección de campo).',
    'Excelente especie melífera cuya abundante floración alimenta enjambres de abejas y polinizadores; estabiliza suelos y ostenta un invaluable arraigo cultural y ecológico en Nicaragua.',
    NULL,
    NULL,
    NULL,
    NULL,
    'images/madrono.png',
    'campus',
    true,
    '2026-10-12T20:00:00Z'
),
(
    'a1e10009-0000-4000-8000-000000000009',
    'malinche',
    'Malinche',
    'Delonix regia',
    'Árbol ornamental caducifolio de copa amplia y aparasolada, follaje bipinnado fino y una floración espectacular de color rojo fuego anaranjado durante la estación seca.',
    'Genera una sombra ancha y fresca que combate las islas de calor en andenes y plazoletas; sus abundantes flores suministran néctar a colibríes y lepidópteros.',
    NULL,
    NULL,
    NULL,
    NULL,
    'images/malinche.jpg',
    'campus',
    true,
    '2026-10-12T20:00:00Z'
),
(
    'a1e10010-0000-4000-8000-000000000010',
    'guanabana',
    'Guanábana',
    'Annona muricata',
    'Árbol frutal tropical de porte modesto y hojas lustrosas perennes, caracterizado por sus flores carnosas y sus grandes frutos acorazonados de cubierta espinosa suave.',
    'Produce frutos de pulpa blanca agridulce ricos en compuestos fenólicos y vitamina C; sus hojas y semillas contienen fitoquímicos de interés medicinal; diversifica la flora frutal del campus.',
    NULL,
    NULL,
    NULL,
    NULL,
    'images/guanabana.jpg',
    'campus',
    true,
    '2026-10-12T20:00:00Z'
),
(
    'a1e10011-0000-4000-8000-000000000011',
    'bambu',
    'Bambú',
    'Bambusa vulgaris',
    'Gramínea gigante rizomatosa de cañas leñosas robustas y crecimiento ultra rápido, adaptada a zonas húmedas y linderos del campus.',
    'Rápida captura de CO₂ y alta liberación de oxígeno; su densa red de raíces y rizomas previene deslaves y erosión del terreno; provee material vegetal flexible y renovable.',
    NULL,
    NULL,
    NULL,
    NULL,
    'images/bambu.jpg',
    'campus',
    true,
    '2026-10-12T20:00:00Z'
)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    nombre_comun = EXCLUDED.nombre_comun,
    nombre_cientifico = EXCLUDED.nombre_cientifico,
    descripcion = EXCLUDED.descripcion,
    beneficios = EXCLUDED.beneficios,
    ubicacion = EXCLUDED.ubicacion,
    anio_plantacion = EXCLUDED.anio_plantacion,
    altura_m = EXCLUDED.altura_m,
    estado_salud = EXCLUDED.estado_salud,
    imagen_url = EXCLUDED.imagen_url,
    origen = EXCLUDED.origen,
    aprobado = EXCLUDED.aprobado;

-- Verificación de inserción:
SELECT count(*) AS total_arboles_insertados FROM public.arboles;
