// Comprobaciones estáticas SIN credenciales, backend ni acceso a despensas reales.
// Se ejecutan con: node --test tests/quality-smoke.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(join(root, path), 'utf8');
const html = read('index.html');
const sw = read('sw.js');
const manifest = JSON.parse(read('manifest.webmanifest'));

test('JavaScript principal y service worker tienen sintaxis válida', () => {
  for (const file of ['app.js', 'sw.js']) {
    const result = spawnSync(process.execPath, ['--check', join(root, file)], { encoding: 'utf8' });
    assert.equal(result.status, 0, file + ': ' + result.stderr);
  }
});

test('el manifiesto PWA es válido y sus iconos existen', () => {
  assert.equal(manifest.name, 'HondaDespensa DEV');
  assert.equal(manifest.display, 'standalone');
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2);
  for (const icon of manifest.icons) {
    assert.ok(existsSync(join(root, icon.src)), 'No existe icono: ' + icon.src);
  }
});

test('la página principal referencia los recursos críticos existentes', () => {
  for (const path of ['styles.css', 'app.js', 'manifest.webmanifest']) {
    assert.ok(html.includes(path), 'Falta referencia HTML a ' + path);
    assert.ok(existsSync(join(root, path)), 'Falta archivo ' + path);
  }
});

test('todos los recursos precargados por el service worker existen', () => {
  const match = sw.match(/const ASSETS=\[([\s\S]*?)\];/);
  assert.ok(match, 'No se encuentra el listado ASSETS en sw.js');
  const paths = [...match[1].matchAll(/['"](\.\/[^'"]+)['"]/g)].map(m => m[1]);
  assert.ok(paths.length >= 5, 'El manifiesto de caché tiene menos de 5 rutas');
  for (const path of paths) {
    const diskPath = decodeURIComponent(new URL(path, 'https://example.invalid/').pathname.slice(1));
    assert.ok(existsSync(join(root, diskPath)), 'Recurso ausente en caché: ' + path);
  }
});

test('las versiones del JS y CSS en HTML están precargadas en la PWA', () => {
  for (const path of ['app.js', 'styles.css']) {
    const pattern = new RegExp(path.replace('.', '\\.') + '\\?v=\\d+');
    const htmlVersion = html.match(pattern)?.[0];
    assert.ok(htmlVersion, 'No hay versión de ' + path + ' en HTML');
    assert.ok(sw.includes(htmlVersion), 'sw.js no precarga ' + htmlVersion);
  }
});

test('no hay IDs literales duplicados en index.html', () => {
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'Hay atributos id duplicados');
});

test('no se ha añadido una clave de servicio al cliente web', () => {
  const js = read('app.js');
  assert.doesNotMatch(js, /(?:service_role|sb_secret_)[A-Za-z0-9_-]{10,}/i);
});

// Prueba pendiente: el esquema versionado contiene un RLS global USING (true).
// No afirma que esa política esté activa en el proyecto Supabase real.
test.todo('auditar las políticas RLS reales por usuario y despensa');
test.todo('ejecutar flujos E2E Android con dos cuentas y datos ficticios');

test('la versión de desarrollo se distingue visualmente de producción', () => {
  assert.match(html, /<title>HondaDespensa DEV<\/title>/);
  assert.match(html, /HondaDespensa DEV · ENTORNO DE PRUEBAS/);
  assert.match(sw, /hondadespensa-dev-v1/);
  assert.ok(manifest.id?.includes('entorno=desarrollo'));
});
