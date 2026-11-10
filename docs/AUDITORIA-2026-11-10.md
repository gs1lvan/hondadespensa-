# Auditoría inicial de HondaDespensa · 10 de noviembre de 2026

**Estado:** informe de revisión estática, sin pruebas con cuentas reales ni cambios de producción.
**Referencia:** `main`, commit `3d2af5464a24d60d748bd50a588689fa6d67ca83`.
**Ámbito:** `app.js`, `index.html`, `styles.css`, `sw.js`, `manifest.webmanifest`, migraciones SQL y estructura del repositorio.

## Hallazgos priorizados

| Prioridad | Hallazgo | Evidencia | Acción |
| --- | --- | --- | --- |
| P0, comprobar antes de publicar | La política RLS de `categorias_despensa` en la migración de 8/11 permite `using (true) with check (true)` a **todos** los usuarios `authenticated`. Si sigue aplicada, no aísla categorías por despensa/propietario. | `supabase/migrations/20261108200000_categorias_despensa.sql` | Comprobar políticas **reales** en Supabase, miembros autorizados por despensa y todas las operaciones de lectura, inserción, edición y borrado. Diseñar una migración de seguridad compatible y probarla sobre copia antes de aplicarla. |
| P0, consistencia de esquema | La migración de 8/11 crea `categorias_despensa` sin `despensa_id` y con `nombre UNIQUE` global; la migración del 9/11 y `app.js` utilizan `categorias_despensa.despensa_id`. La secuencia conservada en Git no reproduce por sí sola el esquema esperado. | Las dos migraciones SQL y las consultas de `app.js` | Comparar contra el esquema real, inventariar modificaciones manuales y generar migraciones incrementales, nunca ejecutar scripts antiguos sin revisión. |
| P1, rendimiento | `app.js` ronda 780 KB y `index.html` 262 KB. Se detectan unas 41 y 18 imágenes `data:` respectivamente (la mayoría del peso en `app.js`). | `app.js`, `index.html` | Extraer imágenes a `assets/`, cargar a demanda, comprimir y medir transferencia/LCP antes y después. |
| P1, sincronización | Conviven suscripciones Realtime (`postgres_changes`) y `refresh()` cada 12 segundos cuando la pestaña está visible. | `app.js`: `signedIn()` y final de archivo | Medir peticiones duplicadas y latencia. Aplicar debounce a eventos repetidos y mantener polling de respaldo según estado de Realtime. |
| P1, uso multidispositivo | Las notas personales sobre la nevera se guardan en `localStorage` con clave por usuario y despensa; no están sincronizadas entre dispositivos. | `app.js`: `renderFridgeNotes()` | Confirmar si el comportamiento es deliberado; si se desea sincronización, crear tabla y RLS por usuario/despensa. |
| P1, funcionamiento offline | La biblioteca `@supabase/supabase-js@2/+esm` se importa de un CDN externo; el service worker solo intercepta peticiones del mismo origen. | `app.js` y `sw.js` | Probar instalación/carga offline y valorar empaquetar dependencia localmente, fijando versión. |
| P2, robustez de caché | `cache.addAll(ASSETS)` en instalación falla si cualquiera de los recursos listados falla; la estrategia de red necesita pruebas de actualización PWA. | `sw.js` | Ensayar actualización y fallo de descarga parcial, distinguiendo recursos críticos y opcionales. |
| P2, experiencia de usuario | El marcado masivo reconstruye listas mediante `render()`, y el marcado individual espera a Supabase antes de refrescar. La pérdida de foco y sensación de demora requieren reproducción visual. | `app.js`: `categoryAvailabilityActions()` y `foodAvailabilityCheckbox()` | Pruebas en Android con latencia simulada, conservación de estado desplegado y feedback de error. |

### Importante sobre P0

Este documento **no** confirma la configuración RLS actualmente desplegada en Supabase. El hallazgo afecta al SQL versionado. Los cambios de seguridad deben prepararse con un volcado **solo del esquema** y validarse en una copia, con usuarios de prueba, antes de tocar datos reales. La clave `sb_publishable_` del cliente es pública por diseño; no es una clave de servicio secreta, pero tampoco sustituye a RLS.

## Propuesta de ejecución

1. **Preservar:** no tocar `main` ni modificar Supabase de producción.
2. **Automatizar lo verificable:** sintaxis JavaScript, integridad de manifiesto/caché, referencias a archivos e IDs HTML, mediante `tests/quality-smoke.test.mjs` y GitHub Actions.
3. **Comprobar seguridad:** inventario de tablas, funciones RPC, roles y políticas. Probar desde cuenta A que no puede leer/modificar la despensa exclusiva de B; probar acceso compartido solo si B lo permite.
4. **Pruebas UX y Android:** ejecutar la matriz de `docs/PLAN-PRUEBAS-ANDROID.md` en navegador real o Work, con cuentas y datos ficticios.
5. **Optimizar:** sacar las imágenes base64, medir carga/CPU/red, reducir refrescos duplicados y mejorar feedback del marcado. Cada cambio en PR separado con pruebas.
6. **Lite:** extraer una interfaz mínima, sin funciones accesorias y sin cambios incompatibles en la base real.

## Límites de esta auditoría

- No se ha accedido a ninguna cuenta privada de Supabase ni consultado datos de usuarios.
- No se han pulsado botones en una sesión de navegador autenticada.
- No se ha medido rendimiento en un Android real ni auditado tráfico de red en ejecución.
- Los tests automáticos añadidos son de **integridad estática**; que pasen no demuestra seguridad RLS, funcionamiento del backend ni calidad de UX.
