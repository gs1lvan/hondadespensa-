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
  assert.equal(manifest.name, 'HondaDespensa');
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

test('se pueden ocultar secos y frescos de forma independiente sin borrar los alimentos', () => {
  const js = read('app.js');
  assert.doesNotMatch(html, /id="show(?:Dry|Fresh)Foods"/, 'No deben quedar casillas duplicadas');
  assert.match(js, /pantryStyleKey\('show_'\+group\+'_foods'\)/, 'La visibilidad debe guardarse por despensa');
  assert.match(js, /const visibleData=data\.filter/, 'La lista debe respetar los grupos visibles');
  assert.match(js, /const categories=orderedCategories\(pantryCategories\(\)\)/, 'Las categorías deben filtrarse solo al mostrar');
  assert.match(js, /renderGroupedAdmin\(\$\('adminFoods'\),data,'food'/, 'Administración mantiene el inventario completo');
  assert.match(js, /header\.insertBefore\(eye,header\.querySelector\('\.chevron'\)\)/, 'El ojo debe ir antes de la flecha');
  assert.match(js, /event\.preventDefault\(\);\s*event\.stopPropagation\(\)/, 'El ojo no debe plegar el panel');
  assert.match(js, /foodGroup\.details\.classList\.toggle\('is-hidden-group',!visible\)/, 'El grupo oculto debe atenuarse');
});

test('el primer panel de Administración agrupa compartir, despensa y cuenta activa', () => {
  const js = read('app.js');
  const panelPosition = html.indexOf('id="adminPantryPanel"');
  const orderPosition = html.indexOf('id="foodGroupOrder"');
  const accountPosition = html.indexOf('class="admin-account"');
  assert.ok(panelPosition >= 0 && panelPosition < orderPosition, 'El panel de despensa debe ir primero');
  assert.ok(accountPosition > panelPosition && accountPosition < orderPosition, 'Cuenta activa debe estar dentro del panel');
  assert.match(html, /id="adminPantryPanelContent"/, 'Falta el contenedor de secciones internas');
  assert.match(js, /\$\('adminPantryPanelContent'\)\.prepend\(sharingSection\)/, 'Compartir despensa debe entrar en el panel');
  assert.match(js, /sharingSection\.after\(deletePantrySection\)/, 'Gestión de despensa debe seguir a compartir');
});

test('Administración distribuye inicio, Estilos y alimentos en paneles padres', () => {
  const js = read('app.js');
  const headings = [
    'adminPantryPanel', 'adminAlternateHomePanel', 'adminStylesPanel', 'adminFoodsPanel'
  ].map(id => html.indexOf('id="' + id + '"'));
  assert.ok(headings.every(i => i >= 0), 'Falta alguno de los cuatro paneles padres');
  assert.ok(headings.every((i, n) => n === 0 || headings[n - 1] < i), 'Orden de paneles incorrecto');
  const alternate = html.slice(headings[1], headings[2]);
  for (const id of [
    'alternateHome', 'startFridgeClosed', 'enableFridgeNotes',
    'enableAutomaticPantryNote', 'calendarIndependent', 'calendarIntegrated'
  ]) assert.ok(alternate.includes('id="' + id + '"'), 'Opción de inicio fuera de su panel: ' + id);
  const foods = html.slice(headings[3], html.indexOf('id="adminAddMount"'));
  assert.match(foods, /id="foodGroupOrder"/, 'Orden de alimentos fuera de su panel');
  assert.match(foods, /id="adminFoodSearch"/, 'Buscador de alimentos fuera de su panel');
  assert.match(foods, /id="adminFoods"/, 'Lista de alimentos fuera de su panel');
  assert.match(js, /document\.createElement\('section'\);panel\.className='admin-section style-panel'/);
  assert.match(js, /\$\('adminStylesPanelContent'\)\.append\(panel\)/, 'Estilos no se monta en su panel');
  for (const section of [
    'Vista de la despensa', 'Tamaño de los iconos de la despensa',
    'mountTypography(panel)', 'mountBackground(panel)', 'mountIconOptions(panel)'
  ]) assert.ok(js.includes(section), 'Falta un ajuste visual: ' + section);
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
