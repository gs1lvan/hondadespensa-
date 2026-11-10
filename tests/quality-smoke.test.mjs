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
 assert.match(js,/header\.insertBefore\(eye,collapse\)/, 'El ojo debe ir antes de la flecha del grupo');
  assert.match(js, /event\.preventDefault\(\);\s*event\.stopPropagation\(\)/, 'El ojo no debe plegar el panel');
 assert.match(js,/foodGroup\.shell\.classList\.toggle\('is-hidden-group',!visible\)/, 'El grupo oculto debe atenuarse');
});

test('Perfil es el primer panel e incluye Cuenta activa y Compartir despensa', () => {
  const js = read('app.js');
  const profile=html.indexOf('id="adminProfilePanel"');
  const pantry=html.indexOf('id="adminPantryPanel"');
  const alternate=html.indexOf('id="adminAlternateHomePanel"');
  const account=html.indexOf('class="admin-account"');
  assert.ok(profile>=0&&profile<account&&account<pantry&&pantry<alternate,'Perfil debe aparecer antes de Despensa actual');
  assert.match(html,/id="adminProfilePanelContent"/);
  assert.match(html,/id="adminPantryPanelContent"/);
  assert.match(js,/\$\('adminProfilePanelContent'\)\.append\(sharingSection\)/,'Compartir despensa en Perfil');
  assert.match(js,/sharingSection\.hidden=!adminMode\|\|!pantry;/,'Compartir no debe depender de un ID fijo');
  assert.doesNotMatch(js,/sharingSection\.hidden=!adminMode\|\|!pantry\|\|/,'El apartado se ocultaría por un ID fijo');
  assert.match(js,/shareWithGema\.disabled=!!error;/,'El control debe bloquearse si el servidor deniega el permiso');
  assert.match(js,/\$\('adminProfilePanel'\)\.addEventListener\('toggle'/,'Perfil debe recuperar sus controles al abrirse');
  assert.match(js,/\$\('adminPantryPanelContent'\)\.append\(deletePantrySection\)/,'Gestión en Despensa actual');
});

test('Administración distribuye inicio, Estilos y alimentos en paneles padres', () => {
  const js = read('app.js');
  const headings = [
    'adminProfilePanel', 'adminPantryPanel', 'adminAlternateHomePanel', 'adminStylesPanel', 'adminFoodsPanel'
  ].map(id => html.indexOf('id="' + id + '"'));
  assert.ok(headings.every(i => i >= 0), 'Falta alguno de los cinco paneles padres');
  assert.ok(headings.every((i, n) => n === 0 || headings[n - 1] < i), 'Orden de paneles incorrecto');
  const alternate = html.slice(headings[2], headings[3]);
  for (const id of [
    'alternateHome', 'startFridgeClosed', 'enableFridgeNotes',
    'enableAutomaticPantryNote', 'calendarIndependent', 'calendarIntegrated'
  ]) assert.ok(alternate.includes('id="' + id + '"'), 'Opción de inicio fuera de su panel: ' + id);
  const foods = html.slice(headings[4], html.indexOf('id="adminAddMount"'));
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

test('los grupos de alimentos tienen una casilla Todos junto al ojito', () => {
  const js=read('app.js');
  assert.match(js,/admin-category-all admin-group-all/);
  assert.match(js,/allCheck\.indeterminate=selected>0&&selected<allItems\.length/);
  assert.match(js,/header\.insertBefore\(all,eye\)/);
  assert.match(js,/all\.onclick=event=>event\.stopPropagation\(\)/);
  assert.match(js,/allCheck\.onchange=\(\)=>setBulkFoodAvailability\(allItems,allCheck\.checked,title\.toLowerCase\(\)\)/);
  assert.match(js,/\.eq\('despensa_id',pantry\.id\)\.in\('id',ids\)/,'La operación debe limitarse a los alimentos de la despensa');
  assert.match(js,/check\.onchange=\(\)=>setBulkFoodAvailability\(items,check\.checked,bareCategory\(category\)\)/,'El mismo guardado se utiliza en categorías');
});


test('Notas dispone de panel de tags y nube independiente del título libre',()=>{
 const js=read('app.js');
 const notes=html.indexOf('id="adminNotesPanel"');
 assert.ok(notes>html.indexOf('id="adminAlternateHomePanel"')&&notes<html.indexOf('id="adminStylesPanel"'));
 for(const id of ['noteTagForm','noteTagInput','noteTagAdd','adminNoteTags','noteTagsStatus','fridgeNoteTagCloud']){
  assert.ok(html.includes('id="'+id+'"'),'Falta '+id);
 }
 assert.match(js,/renderPersonalNoteTagCloud\(savedNote,next=>/);
 assert.match(js,/note\.tags=next/,'Las etiquetas deben ser independientes');
 assert.match(js,/title:titleInput\.value\.trim\(\)/,'El título debe seguir siendo libre');
 assert.match(js,/\[noteTagMetadataKey\]:tags/,'Las opciones se guardan en cuenta');
 assert.match(js,/const key='hondadespensa:notes:'\+session\.user\.id\+':'\+activePantry\.id/,'Las notas siguen siendo por despensa');
 for(const tag of ['Lidl','Mercadona','Frutería','Carnicería','Panadería','Pescadería','Farmacia','Ferretería','Mercado','Bazar'])
  assert.ok(js.includes("'"+tag+"'"),'Falta '+tag);
});
test('Las etiquetas de Notas se administran con controles por fila',()=>{
 const js=read('app.js');
 assert.ok(js.includes("row.className='admin-note-tag-row'"),'Faltan filas individuales');
 assert.ok(js.includes("setAdminIcon(edit,'edit','Editar etiqueta '+tag)"),'Falta edición');
 assert.ok(js.includes("setAdminIcon(remove,'trash','Eliminar etiqueta '+tag)"),'Falta eliminación');
 assert.ok(js.includes("savePersonalNoteTags(next,'Orden de etiquetas guardado.')"),'Falta reordenación');
 assert.ok(js.includes("savePersonalNoteTags(current.map(other=>other===tag?value:other),'Etiqueta modificada.')"),'Falta guardar edición');
 assert.ok(js.includes("note.tags=next"),'No debe sustituirse el título por una etiqueta');
 assert.ok(html.includes('id="noteTagAdd" type="submit" aria-label="Añadir etiqueta"'),'El botón de alta debe ser accesible');
});

test('Administrar muestra las categorías de secos y frescos desde la primera apertura',()=>{
 const js=read('app.js');
 assert.match(html,/<details class="admin-group-panel" id="adminFoodsPanel" open>/,'Panel de alimentos debe estar abierto');
 assert.match(html,/<h2 class="admin-category-list-title">Administrar categorías<\/h2>/);
 assert.match(js,/const expanded=!!query\|\|\(adminFoodGroupOpen\.get\(group\)\?\?true\)/,'Los grupos se abren inicialmente');
 assert.match(js,/adminFoodGroupOpen\.set\(group,next\)/,'El plegado manual debe conservarse');
 assert.match(js,/if\(type==='food'\)for\(const category of pantryCategories\(\)\)/,'Deben conservarse categorías vacías');
});

test('Administrar categorías vuelve a mostrar tarjetas y acciones completas',()=>{
 const js=read('app.js');
 assert.match(js,/shell\.className='admin-food-group-flat'/,'Grupos sin otro details anidado');
 assert.match(js,/foodGroup\.cards\.append\(section\)/,'Categorías visibles bajo cada grupo');
 assert.match(js,/open\.add\(categories\[0\]\)/,'Primera categoría expandida como la referencia');
 assert.match(js,/categoryManagement\(category\),categoryAddFoodForm\(category\)/,'Conservar editar, eliminar, mover, marcar todos y añadir alimento');
 assert.match(js,/foodGroup\.cards\.hidden=!expanded/,'Conservar posibilidad de plegar grupos');
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
