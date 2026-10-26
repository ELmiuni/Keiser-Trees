-- ============================================================================
-- PROYECTO: Keiser Trees (Guía de árboles del campus de Keiser University)
-- ARCHIVO: supabase/schema.sql
-- RESPONSABLE: Agente seguridad-moderacion
-- FECHA: Octubre 2026
-- DESCRIPCIÓN: Esquema DDL completo, idempotente y endurecido para Supabase.
--              Modo: Administración Restringida (Sin envíos públicos).
--
-- INSTRUCCIONES DE USO:
-- Copia y pega el contenido completo de este archivo en el "SQL Editor"
-- del panel de Supabase y presiona "Run".
-- Puede ejecutarse múltiples veces sin generar errores de duplicidad.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. EXTENSIONES BÁSICAS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ----------------------------------------------------------------------------
-- 1. TABLA: administradores ("admins")
-- Lista blanca de usuarios con permisos de gestión, subida y edición.
-- Solo se manipula vía panel administrativo o por el rol de servicio.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.admins IS 'Lista de cuentas autorizadas con privilegios administrativos en Keiser Trees.';
COMMENT ON COLUMN public.admins.user_id IS 'Identificador UUID del usuario en auth.users.';


-- ----------------------------------------------------------------------------
-- 2. FUNCIÓN: is_admin()
-- Función auxiliar SECURITY DEFINER con search_path explícito para verificar
-- si el usuario autenticado actual pertenece a la lista blanca de administradores.
-- Evita problemas de recursión en políticas RLS y cierra vectores de inyección.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.admins
        WHERE user_id = auth.uid()
    );
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Retorna true si el usuario de la sesión actual (auth.uid()) está registrado en public.admins.';


-- ----------------------------------------------------------------------------
-- 3. TABLA: arboles
-- Catálogo de árboles del campus según especificación de ARCHITECTURE.md.
-- Incluye restricciones CHECK para validar longitud, rangos físicos y formato.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.arboles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE,
    nombre_comun TEXT NOT NULL,
    nombre_cientifico TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    beneficios TEXT,
    ubicacion TEXT,
    anio_plantacion INTEGER,
    altura_m NUMERIC(4, 1),
    estado_salud TEXT DEFAULT 'Bueno',
    imagen_url TEXT,
    origen TEXT NOT NULL DEFAULT 'campus',
    aprobado BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Restricciones de integridad (CHECK)
    CONSTRAINT check_slug_formato 
        CHECK (slug IS NULL OR (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(slug) BETWEEN 2 AND 100)),
    CONSTRAINT check_nombre_comun_longitud 
        CHECK (length(trim(nombre_comun)) BETWEEN 2 AND 150),
    CONSTRAINT check_nombre_cientifico_longitud 
        CHECK (length(trim(nombre_cientifico)) BETWEEN 2 AND 150),
    CONSTRAINT check_descripcion_longitud 
        CHECK (length(trim(descripcion)) >= 10 AND length(descripcion) <= 5000),
    CONSTRAINT check_beneficios_longitud 
        CHECK (beneficios IS NULL OR (length(trim(beneficios)) >= 5 AND length(beneficios) <= 3000)),
    CONSTRAINT check_ubicacion_longitud 
        CHECK (ubicacion IS NULL OR (length(trim(ubicacion)) >= 2 AND length(ubicacion) <= 200)),
    CONSTRAINT check_anio_plantacion 
        CHECK (anio_plantacion IS NULL OR (anio_plantacion >= 1800 AND anio_plantacion <= 2100)),
    CONSTRAINT check_altura_m 
        CHECK (altura_m IS NULL OR (altura_m > 0 AND altura_m <= 150.0)),
    CONSTRAINT check_estado_salud 
        CHECK (estado_salud IS NULL OR estado_salud IN ('Excelente', 'Bueno', 'Regular', 'En recuperación', 'Malo', 'Seco')),
    CONSTRAINT check_origen 
        CHECK (origen IN ('campus', 'admin')),
    CONSTRAINT check_imagen_url
        CHECK (imagen_url IS NULL OR length(trim(imagen_url)) BETWEEN 5 AND 1000)
);

COMMENT ON TABLE public.arboles IS 'Catálogo botánico de árboles del campus universitario.';
COMMENT ON COLUMN public.arboles.aprobado IS 'Control de visibilidad pública: true para mostrar en galería, false para ocultar/borrador.';
COMMENT ON COLUMN public.arboles.created_by IS 'UID del administrador que registró el árbol (auditoría).';


-- ----------------------------------------------------------------------------
-- 4. ÍNDICES DE RENDIMIENTO
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_arboles_aprobado ON public.arboles (aprobado);
CREATE INDEX IF NOT EXISTS idx_arboles_slug ON public.arboles (slug);
CREATE INDEX IF NOT EXISTS idx_arboles_created_at ON public.arboles (created_at DESC);


-- ----------------------------------------------------------------------------
-- 5. ACTIVACIÓN EXPLÍCITA DE ROW LEVEL SECURITY (RLS)
-- Asegura que RLS esté activo sin importar la configuración inicial del proyecto.
-- ----------------------------------------------------------------------------
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arboles ENABLE ROW LEVEL SECURITY;


-- ----------------------------------------------------------------------------
-- 6. PERMISOS EXPLÍCITOS (GRANTs y REVOKEs)
-- Principio de mínimo privilegio:
-- - anon: solo SELECT en arboles.
-- - authenticated: SELECT, INSERT, UPDATE, DELETE en arboles (sujeto a RLS).
-- - admins: ningún acceso a anon ni authenticated (solo accesible por service_role).
-- ----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

REVOKE ALL ON TABLE public.arboles FROM anon, authenticated, public;

-- Permisos sobre tabla arboles
GRANT SELECT ON TABLE public.arboles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.arboles TO authenticated;

-- Revocación absoluta sobre tabla admins para roles públicos
REVOKE ALL ON TABLE public.admins FROM anon, authenticated, public;

-- Permiso de ejecución de la función de validación
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;


-- ----------------------------------------------------------------------------
-- 7. POLÍTICAS RLS EN public.arboles
-- ----------------------------------------------------------------------------

-- Lectura para usuarios anónimos: solo árboles marcados como aprobados
DROP POLICY IF EXISTS "Anonimos solo leen arboles aprobados" ON public.arboles;
CREATE POLICY "Anonimos solo leen arboles aprobados"
ON public.arboles
FOR SELECT
TO anon
USING (aprobado = true);

-- Lectura para usuarios autenticados: árboles aprobados o todos si es administrador
DROP POLICY IF EXISTS "Autenticados leen aprobados o admins leen todo" ON public.arboles;
CREATE POLICY "Autenticados leen aprobados o admins leen todo"
ON public.arboles
FOR SELECT
TO authenticated
USING (aprobado = true OR public.is_admin());

-- Inserción: únicamente administradores validados
DROP POLICY IF EXISTS "Solo admins pueden insertar arboles" ON public.arboles;
CREATE POLICY "Solo admins pueden insertar arboles"
ON public.arboles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Modificación: únicamente administradores validados
DROP POLICY IF EXISTS "Solo admins pueden modificar arboles" ON public.arboles;
CREATE POLICY "Solo admins pueden modificar arboles"
ON public.arboles
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Eliminación: únicamente administradores validados
DROP POLICY IF EXISTS "Solo admins pueden eliminar arboles" ON public.arboles;
CREATE POLICY "Solo admins pueden eliminar arboles"
ON public.arboles
FOR DELETE
TO authenticated
USING (public.is_admin());


-- ----------------------------------------------------------------------------
-- 8. POLÍTICAS RLS EN public.admins
-- Con RLS activo y sin políticas para anon ni authenticated, rige el bloqueo
-- total (DENY ALL). Solo el rol service_role (que tiene BYPASSRLS) puede
-- gestionar la tabla admins.
-- ----------------------------------------------------------------------------


-- ----------------------------------------------------------------------------
-- 9. CONFIGURACIÓN DE STORAGE (Bucket: fotos-arboles)
-- Bucket público para lectura de imágenes (5 MB máx, solo JPEG, PNG y WebP).
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'fotos-arboles',
    'fotos-arboles',
    true,
    5242880, -- 5 MB (5 * 1024 * 1024 bytes)
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas de seguridad en storage.objects para el bucket fotos-arboles:

-- 9.1. Lectura pública de imágenes
DROP POLICY IF EXISTS "Lectura publica fotos-arboles" ON storage.objects;
CREATE POLICY "Lectura publica fotos-arboles"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'fotos-arboles');

-- 9.2. Subida de imágenes: solo administradores autorizados
DROP POLICY IF EXISTS "Solo admins suben a fotos-arboles" ON storage.objects;
CREATE POLICY "Solo admins suben a fotos-arboles"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'fotos-arboles' AND public.is_admin()
);

-- 9.3. Actualización de imágenes: solo administradores autorizados
DROP POLICY IF EXISTS "Solo admins actualizan fotos-arboles" ON storage.objects;
CREATE POLICY "Solo admins actualizan fotos-arboles"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'fotos-arboles' AND public.is_admin()
)
WITH CHECK (
    bucket_id = 'fotos-arboles' AND public.is_admin()
);

-- 9.4. Eliminación de imágenes: solo administradores autorizados
DROP POLICY IF EXISTS "Solo admins eliminan en fotos-arboles" ON storage.objects;
CREATE POLICY "Solo admins eliminan en fotos-arboles"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'fotos-arboles' AND public.is_admin()
);


-- ============================================================================
-- 10. BLOQUE DE VERIFICACIÓN Y AUDITORÍA
-- Estas consultas y pruebas confirman el estado de la seguridad tras la ejecución.
-- ============================================================================

-- 10.1. Verificar que Row Level Security (RLS) esté activo en ambas tablas
SELECT 
    schemaname AS esquema,
    tablename AS tabla,
    rowsecurity AS rls_habilitado
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('arboles', 'admins');

-- 10.2. Listar todas las políticas activas sobre las tablas y objetos de Storage
SELECT 
    schemaname AS esquema,
    tablename AS objeto,
    policyname AS politica,
    roles AS roles_afectados,
    cmd AS comando,
    qual AS condicion_using,
    with_check AS condicion_with_check
FROM pg_policies
WHERE (schemaname = 'public' AND tablename IN ('arboles', 'admins'))
   OR (schemaname = 'storage' AND tablename = 'objects')
ORDER BY tablename, cmd;

-- 10.3. Listar los privilegios (GRANTs) concedidos a anon y authenticated
SELECT 
    grantee AS rol,
    table_name AS tabla,
    privilege_type AS privilegio
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name IN ('arboles', 'admins')
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;

-- 10.4. Verificar la configuración del bucket fotos-arboles
SELECT 
    id, 
    name, 
    public AS es_publico, 
    file_size_limit AS limite_bytes, 
    allowed_mime_types AS tipos_permitidos
FROM storage.buckets 
WHERE id = 'fotos-arboles';

-- 10.5. Prueba activa simulada: confirmar que el rol anon NO PUEDE insertar
DO $$
DECLARE
    v_bloqueo_confirmado BOOLEAN := false;
BEGIN
    -- Cambiar temporalmente de rol al rol anónimo en esta transacción
    SET LOCAL ROLE anon;
    BEGIN
        INSERT INTO public.arboles (
            slug, nombre_comun, nombre_cientifico, descripcion, imagen_url
        ) VALUES (
            'test-seguridad', 'Prueba Intruso', 'Malus hackerus', 'Intento de insercion no autorizado', 'images/hack.jpg'
        );
    EXCEPTION 
        WHEN insufficient_privilege THEN
            v_bloqueo_confirmado := true;
            RAISE NOTICE '>>> [OK] Insercion anonima bloqueada por GRANT a nivel de tabla (insufficient_privilege).';
        WHEN OTHERS THEN
            v_bloqueo_confirmado := true;
            RAISE NOTICE '>>> [OK] Insercion anonima bloqueada por regla/RLS: %', SQLERRM;
    END;
    
    -- Restaurar rol de sesion
    RESET ROLE;

    IF NOT v_bloqueo_confirmado THEN
        RAISE EXCEPTION '>>> [CRITICO] FALLO DE SEGURIDAD: Un usuario anonimo logro insertar en public.arboles.';
    END IF;
END $$;
