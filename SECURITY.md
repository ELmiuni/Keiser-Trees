# Directivas y Auditoría de Seguridad: Keiser Trees

**Proyecto:** Guía de árboles del campus de Keiser University Latin American Campus  
**Responsable:** Agente `seguridad-moderacion`  
**Fecha:** Octubre 2026  
**Referencia:** [ARCHITECTURE.md](file:///c:/Users/jala1/OneDrive/Desktop/KU%20Trees%20Web%20Page/Keiser%20Trees/ARCHITECTURE.md) y [supabase/schema.sql](file:///c:/Users/jala1/OneDrive/Desktop/KU%20Trees%20Web%20Page/Keiser%20Trees/supabase/schema.sql)

---

## 1. Resumen del Modelo de Seguridad

El sistema opera bajo el principio de **Mínimo Privilegio** y **Defensa en Profundidad**:

1. **Sin Envíos Públicos ni Autoregistro:**  
   Se desactivan los registros públicos en Supabase Auth (`Enable email signup: false`). No existe interfaz pública para que visitantes o alumnos envíen datos ni suban archivos.
2. **Visitantes Anónimos (`anon`) — Solo Lectura Filtrada:**  
   - Concesión exclusiva de `GRANT SELECT ON public.arboles TO anon`.
   - Política RLS que restringe el resultado a registros con `aprobado = true`.
   - Cero permisos de escritura (`INSERT`, `UPDATE`, `DELETE`) a nivel de base de datos y de Storage.
3. **Control Administrativo Restringido (`admins` + `is_admin()`):**  
   - Solo cuentas creadas manualmente en Supabase Auth y registradas en la tabla `public.admins` pueden realizar operaciones de escritura.
   - La comprobación se ejecuta mediante la función `public.is_admin()`, declarada como `SECURITY DEFINER` con `search_path = public, pg_temp` para evitar escalamiento de privilegios o recursión RLS.
   - La tabla `public.admins` está completamente inaccesible para roles web (`REVOKE ALL FROM anon, authenticated, public`). Solo el rol de servicio (`service_role`) o el SQL Editor pueden gestionarla.
4. **Bucket de Almacenamiento (`fotos-arboles`):**  
   - Lectura pública para servir imágenes en la web sin URLs firmadas temporales.
   - Escritura y eliminación restringidas exclusivamente a administradores (`is_admin() = true`).
   - Límite de tamaño enforced por el motor: $\le 5\text{ MB}$ (5,242,880 bytes).
   - Formatos permitidos enforced por el motor: `image/jpeg`, `image/png`, `image/webp`.

---

## 2. Matriz de Riesgos y Hallazgos Auditados

| ID | Hallazgo / Vector de Riesgo | Severidad | Estado | Mitigación Aplicada |
| :--- | :--- | :---: | :---: | :--- |
| **SEC-01** | **Clave de rol de servicio (`service_role`) expuesta en frontend** | **ALTA** | Mitigado | **Regla estricta:** La clave `service_role` tiene bypass de RLS y NUNCA debe incluirse en código frontend (`js/config.js`), commits ni repositorios. Solo se utiliza la clave pública anónima (`anon key`). |
| **SEC-02** | **Autoregistro abierto en Supabase Auth** | **ALTA** | Pendiente (Manual) | Si el registro por correo permanece activo en Supabase, cualquier visitante podría crear una cuenta `authenticated`. **Mitigación:** Desactivar "Enable email signup" en el panel. Además, el rol `authenticated` no tiene privilegios de escritura si su UID no figura en `public.admins`. |
| **SEC-03** | **Inyección de código / Cross-Site Scripting (XSS) vía datos de árboles** | **ALTA** | Mitigado por contrato | Se prohíbe el uso de `.innerHTML` para renderizar datos dinámicos. El módulo `js/render.js` debe utilizar exclusivamente `.textContent` o `document.createTextNode()`. |
| **SEC-04** | **Subida de ejecutables o archivos maliciosos camuflados** | **MEDIA** | Mitigado | Configuración estricta en `storage.buckets`: únicamente se admiten tipos MIME `image/jpeg`, `image/png` y `image/webp` con tope de 5 MB. |
| **SEC-05** | **Inyección de ruta de búsqueda en funciones de seguridad (Search Path Injection)** | **MEDIA** | Mitigado | La función `public.is_admin()` fija explícitamente `SET search_path = public, pg_temp`, previniendo secuestro de esquemas por atacantes. |
| **SEC-06** | **Exposición de la clave pública `anon` en `js/config.js`** | **BAJA** | Aceptado / Seguro | La clave `anon` está diseñada para ser pública. Con RLS activo y GRANTs mínimos (`SELECT` únicamente sobre `arboles`), conocer esta clave no permite alterar datos ni vulnerar el sistema. |
| **SEC-07** | **Denegación de servicio por consultas masivas (Scraping abusivo)** | **BAJA** | Monitoreo | Supabase cuenta con rate limits por defecto en su API REST (PostgREST). Dado el volumen esperado del campus, es suficiente; si se detecta abuso, se puede colocar un proxy Cloudflare. |

---

## 3. ¿Por qué es Segura la Clave Pública (`anon key`) en el Código?

En la arquitectura de Supabase (y en general en aplicaciones cliente-servidor con bases de datos PostgREST):

1. **La clave anónima (`anon key`) es un token JWT público**, no una contraseña secreta de base de datos. Su propósito es identificar el proyecto ante el API Gateway de Supabase y asignarle el rol de PostgreSQL `anon`.
2. **La verdadera barrera de seguridad no es ocultar la clave `anon`, sino las políticas de Row Level Security (RLS) y los GRANTs de PostgreSQL:**
   - Si un usuario malintencionado copia la URL y la `anon key` desde la consola del navegador, intentará hacer peticiones `POST`, `PATCH` o `DELETE`.
   - PostgreSQL intercepta la consulta y evalúa los permisos:
     - El rol `anon` **no tiene `GRANT INSERT/UPDATE/DELETE`** sobre `arboles`.
     - Las políticas RLS de `arboles` y `storage.objects` solo permiten lectura de registros donde `aprobado = true`.
   - El motor de base de datos devuelve un código `401 Unauthorized` o `403 Forbidden` a nivel de servidor.
3. **Conclusión:** Mientras la clave `service_role` permanezca en secreto y RLS esté habilitado en todas las tablas, la exposición de la `anon key` en el frontend es un estándar de la industria 100% seguro.

---

## 4. Guía de Pasos Manuales en el Panel de Supabase (En Orden Estricto)

Sigue estos pasos en la consola web de Supabase (<https://supabase.com/dashboard>) antes de conectar la aplicación:

### Paso 1: Desactivar el Autoregistro Público
1. Ve a **Authentication** en el menú lateral.
2. Selecciona **Providers** > **Email**.
3. Localiza la opción **"Allow new users to sign up"** (o *"Enable email signup"*).
4. **Desactívala** (debe quedar en `OFF`).
5. Haz clic en **Save**.  
   *Resultado:* Nadie podrá crear cuentas desde fuera del panel.

### Paso 2: Ejecutar el Esquema de Base de Datos y Seguridad
1. Ve a **SQL Editor** en el menú lateral.
2. Haz clic en **"New query"**.
3. Copia y pega el contenido íntegro del archivo [supabase/schema.sql](file:///c:/Users/jala1/OneDrive/Desktop/KU%20Trees%20Web%20Page/Keiser%20Trees/supabase/schema.sql).
4. Presiona el botón verde **Run**.
5. Revisa los paneles de salida (*Results* y *Messages*):
   - Debes ver la confirmación de la prueba: `>>> [OK] Insercion anonima bloqueada por GRANT a nivel de tabla`.
   - Las tablas `arboles` y `admins`, la función `is_admin()`, el bucket `fotos-arboles` y las políticas quedarán aplicadas.

### Paso 3: Crear la Cuenta del Administrador
1. Ve a **Authentication** > **Users**.
2. Haz clic en el botón superior derecho **"Add user"** > **"Create user"**.
3. Introduce el correo institucional del administrador (ej. `sga@keiseruniversity.edu`) y una contraseña segura.
4. Marca la casilla **"Auto Confirm User?"** para que no requiera verificación de correo electrónico.
5. Haz clic en **Create user**.
6. En la lista de usuarios, localiza la cuenta recién creada y haz clic en el icono para **copiar su `User UID`** (un identificador con formato `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).

### Paso 4: Dar de Alta al Administrador en la Tabla `admins`
1. Vuelve a **SQL Editor** > **New query**.
2. Ejecuta la siguiente consulta reemplazando `<UID_COPIADO>` por el identificador del Paso 3:
   ```sql
   INSERT INTO public.admins (user_id) 
   VALUES ('<UID_COPIADO>');
   ```
3. Presiona **Run**.  
   *Resultado:* La cuenta queda formalmente autorizada para autenticarse en `admin.html`, subir imágenes al bucket `fotos-arboles` y registrar árboles.

### Paso 5: Extraer Credenciales Públicas para el Frontend
1. Ve a **Project Settings** (icono de engranaje) > **API**.
2. Copia los siguientes dos valores:
   - **Project URL** (ej. `https://xyzcompany.supabase.co`)
   - **Project API Keys** > `anon` / `public` (comienza con `eyJ...`)
3. Facilita estos dos valores al agente `fullstack` para ser configurados en `js/config.js`.
4. **ADVERTENCIA:** Ignora y nunca toques la clave `service_role` (secret).

---

## 5. Checklist de Verificación y Control de Calidad

Antes de publicar el sitio o abrirlo a los usuarios, verifica cada uno de los siguientes puntos:

- [ ] **RLS Activo:** Ambas tablas (`arboles` y `admins`) muestran el candado de Row Level Security activo en el panel (*Table Editor*).
- [ ] **Acceso Anónimo Bloqueado:** Al intentar realizar un `INSERT` en `public.arboles` desde el rol `anon`, la base de datos rechaza la operación con error de privilegios insuficientes.
- [ ] **Tabla `admins` Aislada:** No es posible consultar la tabla `admins` desde el cliente JavaScript con la `anon key`.
- [ ] **Bucket Configurado:** El bucket `fotos-arboles` existe, tiene la bandera `public = true`, su tamaño límite es 5 MB y solo acepta `image/jpeg`, `image/png`, `image/webp`.
- [ ] **Autoregistro Inactivo:** El registro público de cuentas está apagado en *Authentication > Providers*.
- [ ] **Credenciales Protegidas:** Ningún archivo del repositorio contiene la clave `service_role` ni la contraseña de la base de datos de PostgreSQL.
- [ ] **Protección de Git:** El archivo `.gitignore` incluye `.env`, `.env.local` y carpetas de configuración sensible.
- [ ] **Renderizado Seguro:** En el código JavaScript del frontend (`js/render.js`), todas las propiedades de texto (`nombre_comun`, `descripcion`, etc.) se inyectan usando `.textContent`.
