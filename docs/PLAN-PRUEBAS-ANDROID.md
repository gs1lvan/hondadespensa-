# Plan de pruebas de Android y navegador · HondaDespensa

**Estado:** preparado, NO EJECUTADO. No usar datos reales para borrado ni cuentas principales para pruebas destructivas.

## Preparación

- Abrir versión publicada y copia de pruebas en Chrome Android; probar ancho 360, 412 y 768 px.
- Crear dos usuarios ficticios A y B, cada uno con despensa privada; una tercera despensa compartida únicamente entre ellos.
- Cargar 3 categorías de secos y 3 de frescos con al menos 5 productos cada una; incluir categorías vacías.
- Probar con conexión buena, latencia de red alta, sin red y tras recuperar la conexión.
- Registrar por prueba: **pendiente / pasa / falla**, captura, pasos, resultado esperado y error de consola/red.

## Matriz funcional

| ID | Acción del usuario | Resultado esperado |
| --- | --- | --- |
| A01 | Iniciar/cerrar sesión y volver a entrar | Sesión consistente, sin contenido de otra cuenta |
| A02 | Cambiar entre despensas y volver | Productos y configuración correctos de cada despensa |
| A03 | Abrir/cerrar puertas vintage y volver a abrir | Solo cambia la puerta pulsada; no se solapan secciones |
| A04 | Cambiar entre alimentos secos y frescos | Grupo correcto, contadores coherentes y sin pérdida de estado |
| A05 | Marcar/desmarcar alimento | Cambio visual rápido; sincronización confirmada tras guardar |
| A06 | Marcar/desmarcar categoría entera | Todos actualizados, contador x/y correcto y categoría sigue desplegada |
| A07 | Forzar error de red al marcar | Feedback de error y reconciliación; no se simula guardado correcto |
| A08 | Añadir, renombrar y borrar alimento | Aparece/desaparece en la categoría prevista sin colapsarla |
| A09 | Renombrar una categoría con icono personalizado | Se conserva icono e identidad de categoría |
| A10 | Alternar estilo oscuro/claro e iconos | Contraste suficiente, iconos y botones legibles |
| A11 | Crear nota, cambiar título, editar filas/cantidades y borrar | Persistencia esperada y manejo correcto del teclado Android |
| A12 | Arrastrar notas dentro de la nevera | No salen de límites ni bloquean otros controles |
| A13 | Activar nota azul automática y cambiar disponibilidad | Lista solo de alimentos no disponibles de la despensa actual |
| A14 | Cuenta A marca un alimento; cuenta B observa en despensa compartida | Cambio se refleja sin reiniciar; no aparecen duplicados |
| A15 | Cuenta B intenta leer o editar despensa privada de A | Acceso denegado por Supabase/RLS |
| A16 | Desconectar red, abrir app instalada y reconectar | Mostrar estado de red; conservar interfaz y recuperar datos sin duplicados |
| A17 | Instalar PWA y actualizar una versión | Se reciben nuevos recursos y no queda UI mezclada entre versiones |
| A18 | Abrir/cerrar teclado móvil en edición de notas | Modal visible y botones accesibles |
| A19 | Buscar por nombre con y sin tildes | Filtrado estable y sin pérdida de posición |
| A20 | Cambiar despensa durante una operación lenta | La respuesta anterior no modifica ni muestra la despensa nueva |

## Criterios antes de publicar en Google Play

- Cero accesos no autorizados entre despensas o usuarios.
- Ningún borrado accidental ni modificación de una despensa distinta.
- Sin errores JavaScript bloqueantes en las rutas esenciales.
- Gestión clara de errores y de conexión lenta.
- Medición repetible de tamaño transferido, tiempo hasta interacción, CPU y peticiones Supabase.
- Pruebas en un teléfono Android real además de emulación de escritorio.

**Nota:** las pruebas A14/A15/A16 necesitan usuarios de prueba y conexión de prueba; no deben ejecutarse alterando una despensa real.