# HondaDespensa

## Dos versiones con nombres fijos

| Nombre para nuestras conversaciones | Rama GitHub | Uso | Publicación |
| --- | --- | --- | --- |
| **HondaDespensa PROD** | [`main`](https://github.com/gs1lvan/hondadespensa-/tree/main) | Aplicación estable para uso diario | GitHub Pages configurado desde `main` |
| **HondaDespensa DEV** | [`desarrollo`](https://github.com/gs1lvan/hondadespensa-/tree/desarrollo) | Pruebas, cambios, optimización y futura versión Lite | Rama separada, **no** se publica automáticamente en GitHub Pages |

**Regla:** si hablamos de **PROD**, trabajamos sobre `main`. Si hablamos de **DEV**, trabajamos sobre `desarrollo`. Nunca cambiar `main` sin revisar primero las pruebas y fusionar conscientemente una propuesta desde `desarrollo`.

### Precaución con los datos

Crear una rama de Git **no** crea una base de datos Supabase distinta. DEV y PROD siguen compartiendo el mismo proyecto Supabase salvo que se configure una instancia de pruebas por separado. Por tanto, no probar borrados ni cambios de datos reales desde DEV. Crear y verificar un Supabase de pruebas es requisito antes de hacer ensayos con datos.

### Flujo de trabajo

1. Desarrollar y probar en `desarrollo`.
2. Ejecutar `node --test tests/quality-smoke.test.mjs` y las pruebas funcionales aplicables.
3. Revisar los cambios y crear una Pull Request de `desarrollo` a `main`.
4. Fusionar solo lo que se apruebe para **PROD**.

Documentación: [auditoría](docs/AUDITORIA-2026-11-10.md) y [plan de pruebas Android](docs/PLAN-PRUEBAS-ANDROID.md).
