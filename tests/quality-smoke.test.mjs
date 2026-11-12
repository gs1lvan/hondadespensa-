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

test('la despensa abre en la vista normal y permite entrar en Administración', () => {
 const js = read('app.js');
 const start=js.indexOf('async function openPantry(pantry){');
 const end=js.indexOf('function updatePantrySwitchLabel()',start);
 assert.ok(start>=0&&end>start,'No se ha encontrado la apertura de despensa');
 const open=js.slice(start,end);
 assert.match(open,/adminMode=false;\s*showApp\(true\);\s*render\(\);\s*await refresh\(\);\s*syncAdminControls\(\)/,
  'La primera vista de cada despensa debe mostrar su listado con los controles inicializados');
 assert.doesNotMatch(open,/openBasicSetup\(/,'Abrir o recargar una despensa existente no debe mostrar el formulario');
 const create=js.slice(js.indexOf("function choosePantry("),start);
 assert.match(create,/id="basicSetupEnabled"/,'El checkbox debe estar en Crear despensa');
 assert.doesNotMatch(html,/id="basicSetupEnabled"/,'El checkbox no debe estar en Administración');
 assert.match(create,/const showSetup=setupEnabled\.checked;/,'La elección del diálogo decide si se abre el formulario');
 assert.match(create,/await openPantry\(pantry\);\s*if\(session===current&&activePantry===pantry&&showSetup\)openBasicSetup\(vintageSetup\)/,
  'El formulario solo se abre tras crear una despensa si se ha marcado en el diálogo de creación');
 assert.match(js,/\$\('adminToggle'\)\.onclick=\(\)=>\{\s*adminMode=!adminMode/,
  'Se debe poder cambiar de Administración a la despensa y viceversa');
 assert.match(js,/adminToggle\.innerHTML=adminMode\?'← Volver a despensa'/,
  'El botón para regresar debe permanecer visible en Administración');
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
    'adminProfilePanel', 'adminPantryPanel', 'adminAlternateHomePanel', 'adminStylesPanel', 'adminCategoriesPanel'
  ].map(id => html.indexOf('id="' + id + '"'));
  assert.ok(headings.every(i => i >= 0), 'Falta alguno de los cinco paneles padres');
  assert.ok(headings.every((i, n) => n === 0 || headings[n - 1] < i), 'Orden de paneles incorrecto');
  const alternate = html.slice(headings[2], headings[3]);
  for (const id of [
    'alternateHome', 'startFridgeClosed', 'enableFridgeNotes',
    'enableAutomaticPantryNote', 'calendarIndependent', 'calendarIntegrated'
  ]) assert.ok(alternate.includes('id="' + id + '"'), 'Opción de inicio fuera de su panel: ' + id);
  const categoryPanelPosition=html.indexOf('id="adminCategoriesPanel"');
  const categories=html.slice(categoryPanelPosition,html.indexOf('id="adminAddMount"'));
  assert.ok(!html.includes('id="adminFoodsPanel"'), 'No debe quedar el panel redundante de orden');
  assert.ok(html.indexOf('id="foodGroupOrder"')<categoryPanelPosition, 'El estado interno del orden debe seguir disponible');
  assert.ok(categoryPanelPosition>html.indexOf('id="adminStylesPanel"'),'Administrar categorías debe seguir detrás de Estilos');
  assert.match(categories,/id="adminFoodSearch"/, 'El buscador de categorías no está en su panel');
  assert.match(categories,/id="adminFoods"/, 'Las categorías no están en su panel');
  assert.match(js, /document\.createElement\('section'\);panel\.className='admin-section style-panel'/);
  assert.match(js, /\$\('adminStylesPanelContent'\)\.append\(panel\)/, 'Estilos no se monta en su panel');
  for (const section of [
    'Vista de la despensa', 'Tamaño de los iconos de la despensa',
    'mountTypography(panel)', 'mountBackground(panel)', 'mountIconOptions(panel)'
  ]) assert.ok(js.includes(section), 'Falta un ajuste visual: ' + section);
});

test('catálogos secos y frescos juntos en Añadir categorías por defecto',()=>{
 const start=html.indexOf('id="adminDefaultCategoriesPanel"');
 const end=html.indexOf('<summary>✏️ Administrar catálogo</summary>',start);
 assert.ok(start>=0&&end>start,'No existe el panel de categorías por defecto');
 const region=html.slice(start,end);
 assert.match(html,/<details class="admin-group-panel" id="adminDefaultCategoriesPanel">/,'El nuevo panel debe comenzar plegado');
 assert.match(region,/<summary>Añadir categorías por defecto<\/summary>/);
 assert.match(region,/Si quieres empezar tu despensa y no tienes claro qué categorías añadir/);
 assert.match(region,/Eres libre de añadir, eliminar o editar las que quieras\./);
 assert.match(region,/Añadir catálogo de alimentos secos/);
 assert.match(region,/Añadir desde el catálogo de alimentos frescos/);
 for(const id of ['catalogSearch','catalogItems','freshCatalog','freshCatalogSearch','freshCatalogItems']){
  assert.ok(region.includes('id="'+id+'"'),'No se ha conservado el control '+id);
 }
 const js=read('app.js');
 assert.match(js,/renderCatalogList\(\$\('catalogItems'\),\$\('catalogSearch'\),groups,catalogOpen\)/);
 assert.match(js,/renderCatalogList\(\$\('freshCatalogItems'\),\$\('freshCatalogSearch'\),Object\.entries\(freshCatalogGroups\),freshCatalogOpen\)/);
 assert.match(js,/\$\('freshCatalog'\)\.hidden=false/,'El catálogo de frescos debe mantenerse operativo');
 assert.equal((html.match(/id="adminDefaultCategoriesPanel"/g)||[]).length,1,'No duplicar el panel');
});

test('el borrado de categoría incluye alimentos con confirmación y respeta la despensa', async()=>{
 const js=read('app.js');
 const start=js.indexOf('async function deletePantryCategory(category){');
 const end=js.indexOf('const adminIconPaths={',start);
 assert.ok(start>=0&&end>start,'No se ha encontrado la función de borrado');
 const make=new Function('scope','with(scope){'+js.slice(start,end)+';return deletePantryCategory;}');
 for(const [quantity,accept] of [[3,true],[3,false],[0,true]]){
  let foods=Array.from({length:quantity},(_,i)=>({id:'target-'+i,despensa_id:'p1',categoria_id:'c1'}));
  foods.push({id:'other-category',despensa_id:'p1',categoria_id:'c2'});
  foods.push({id:'other-pantry',despensa_id:'p2',categoria_id:'c1'});
  let categories=[{id:'c1',despensa_id:'p1'},{id:'c2',despensa_id:'p1'}];
  const dialogs=[],messages=[];
  const db={from(table){
   const query={table,operation:'select',filters:{},ids:null};
   const builder={
    select(){return builder;},
    delete(){query.operation='delete';return builder;},
    eq(key,value){query.filters[key]=value;return builder;},
    in(key,ids){query.ids=new Set(ids);return builder;},
    then(resolve,reject){
     const source=table==='alimentos'?foods:categories;
     const matches=source.filter(item=>Object.entries(query.filters).every(([key,value])=>item[key]===value)
      &&(!query.ids||query.ids.has(item.id)));
     if(query.operation==='delete'){
      const removed=new Set(matches.map(item=>item.id));
      if(table==='alimentos')foods=foods.filter(item=>!removed.has(item.id));
      else categories=categories.filter(item=>!removed.has(item.id));
     }
     return Promise.resolve({data:matches.map(item=>({id:item.id})),error:null}).then(resolve,reject);
    }
   };
   return builder;
  }};
  const scope={
   db,activePantry:{id:'p1'},session:{user:{id:'test'}},categoryMutation:false,
   pantryCategoryByName:new Map([['Carnes',{id:'c1'}]]),
   bareCategory:value=>value,confirm:message=>{dialogs.push(message);return accept;},
   adminOpenCategories:{food:new Set(['Carnes'])},openCategories:new Set(),categoryFoodDrafts:new Map(),
   refresh:async()=>{},adminMessage:message=>messages.push(message)
  };
  await make(scope)('Carnes');
  assert.equal(dialogs.length,1,'La confirmación debe mostrarse una sola vez');
  if(quantity)assert.match(dialogs[0],new RegExp(quantity+' alimentos'),'La confirmación debe incluir la cantidad');
  assert.equal(foods.filter(food=>food.categoria_id==='c1'&&food.despensa_id==='p1').length,accept?0:quantity);
  assert.ok(foods.some(food=>food.id==='other-category'),'No borrar otras categorías');
  assert.ok(foods.some(food=>food.id==='other-pantry'),'No borrar otras despensas');
  assert.equal(categories.some(category=>category.id==='c1'),!accept);
  assert.equal(messages.length,accept?1:0);
 }
});

test('los grupos de alimentos tienen una casilla Todos junto al ojito', () => {
  const js=read('app.js');
  assert.match(js,/admin-category-all admin-group-all/);
  assert.match(js,/allCheck\.indeterminate=selected>0&&selected<allItems\.length/);
  assert.match(js,/header\.insertBefore\(all,collapse\)/, 'Todos debe insertarse antes de un elemento que ya pertenece a la cabecera');
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
 for(const tag of ['Supermercado 1','Supermercado 2','Frutería','Carnicería','Panadería','Pescadería','Farmacia','Ferretería','Mercado','Bazar'])
  assert.ok(js.includes("'"+tag+"'"),'Falta '+tag);
});
test('Los títulos de notas sin título se derivan del primer TAG y se respetan títulos escritos',()=>{
 const js=read('app.js');
 const start=js.indexOf('const defaultPersonalNoteTags=Object.freeze([');
 const end=js.indexOf('let savingPersonalNoteTags=false;',start);
 assert.ok(start>=0&&end>start,'No se encontraron las funciones de etiquetas y títulos');
 const helpers=new Function('session',js.slice(start,end)+';return {configuredPersonalNoteTags,selectedPersonalNoteTags,personalNoteDisplayTitle};')
  ({user:{user_metadata:{personal_note_tags:['Lidl','Mercadona','Frutería']}}});
 assert.deepEqual(helpers.configuredPersonalNoteTags(),['Supermercado 1','Supermercado 2','Frutería'],
  'Las etiquetas antiguas guardadas en la cuenta se renombran en la interfaz');
 assert.equal(helpers.personalNoteDisplayTitle({number:2,tags:['Mercadona'],title:''}),'Supermercado 2');
 assert.equal(helpers.personalNoteDisplayTitle({number:2,tags:['Frutería','Lidl'],title:''}),'Frutería',
  'Con varios TAG prevalece el primero');
 assert.equal(helpers.personalNoteDisplayTitle({number:2,tags:['Frutería'],title:' Compra jueves '}),'Compra jueves',
  'Un título escrito debe prevalecer sobre los TAG');
 assert.equal(helpers.personalNoteDisplayTitle({number:2,tags:[],title:''}),'Nota 2',
  'Sin título ni TAG se mantiene la numeración');
 assert.match(js,/titleButton\.textContent=personalNoteDisplayTitle\(savedNote\)/);
 assert.match(js,/titleInput\.placeholder=personalNoteDisplayTitle\(savedNote\)/);
 assert.match(js,/title\.textContent=personalNoteDisplayTitle\(note\)/);
 assert.match(js,/title:titleInput\.value\.trim\(\)/,
  'Los títulos escritos no deben sustituirse ni guardarse a partir de los TAG');
 assert.match(html,/Si no escribes un título, se utilizará la primera etiqueta seleccionada/);
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
 assert.match(html,/<details class="admin-group-panel" id="adminCategoriesPanel">/,'Administrar categorías debe ser panel independiente visible');
 assert.ok(html.indexOf('id="adminCategoriesPanel"')>html.indexOf('id="adminStylesPanel"'),'Administrar categorías debe estar después de Estilos');
 assert.match(js,/const expanded=!!query\|\|\(adminFoodGroupOpen\.get\(group\)\?\?false\)/,'Los grupos empiezan plegados');
 assert.match(js,/adminFoodGroupOpen\.set\(group,next\)/,'El plegado manual debe conservarse');
 assert.match(js,/if\(type==='food'\)for\(const category of pantryCategories\(\)\)/,'Deben conservarse categorías vacías');
});

test('Administrar categorías vuelve a mostrar tarjetas y acciones completas',()=>{
 const js=read('app.js');
 assert.match(js,/shell\.className='admin-food-group-flat'/,'Grupos sin otro details anidado');
 assert.match(js,/foodGroup\.cards\.append\(section\)/,'Categorías visibles bajo cada grupo');
 assert.doesNotMatch(js,/open\.add\(categories\[0\]\)/,'La primera categoría no debe abrirse sola');
 assert.match(js,/section\.open=open\.has\(category\)\|\|!!query/,'Cada categoría arranca plegada y se abre manualmente o al buscar');
 assert.match(js,/if\(type==='food'&&container\.dataset\.query\)continue/,'Los resultados de búsqueda no alteran las preferencias del usuario');
 assert.match(js,/categoryManagement\(category\),categoryAddFoodForm\(category\)/,'Conservar editar, eliminar, mover, marcar todos y añadir alimento');
 assert.match(js,/foodGroup\.cards\.hidden=!expanded/,'Conservar posibilidad de plegar grupos');
});

test('Administrar categorías tiene entrada propia visible en Administración', () => {
 const start=html.indexOf('id="adminCategoriesPanel"');
 const after=html.indexOf('id="adminAddMount"',start);
 assert.ok(start>0&&after>start,'Panel no encontrado');
 const panel=html.slice(start,after);
 assert.match(panel,/<summary>Administrar categorías<\/summary>/);
 assert.match(panel,/id="adminFoods"/);
 assert.match(panel,/id="adminFoodSearch"/);
 assert.match(panel,/id="dedup"/);
 assert.equal((html.match(/id="adminFoods"/g)||[]).length,1,'No duplicar el listado');
});

test('El encabezado de grupos inserta sus controles sobre nodos existentes',()=>{
 const js=read('app.js');
 const start=js.indexOf('  header.append(collapse);',js.indexOf('function renderGroupedAdmin('));
 const all=js.indexOf('header.insertBefore(all,collapse)',start);
 const eye=js.indexOf('header.insertBefore(eye,collapse)',start);
 assert.ok(start>=0&&all>start&&eye>all,'La flecha debe existir antes de insertar Todos y el ojo');
 assert.doesNotMatch(js,/header\.insertBefore\(all,eye\)/,'No insertar delante de un ojo todavía no montado');
 assert.match(js,/container\.append\(foodGroup\.shell\)/,'El grupo debe añadirse al listado');
});

test('Las flechas de ordenar sustituyen al panel redundante y conservan el orden por despensa',()=>{
 const js=read('app.js');
 assert.doesNotMatch(html,/id="adminFoodsPanel"/,'El panel de orden debe desaparecer');
 assert.match(html,/<select id="foodGroupOrder" hidden/,'El estado guardado debe permanecer oculto');
 assert.match(js,/const firstGroup=foodGroupOrder\.value==='fresh'\?'fresh':'dry'/,'La flecha depende del orden actual');
 assert.match(js,/for\(const group of \(foodGroupOrder\.value==='fresh'\?\['fresh','dry'\]:\['dry','fresh'\]\)\)/,'Los grupos se dibujan según el orden guardado');
 assert.match(js,/setAdminIcon\(move,moveDown\?'down':'up'/,'Flechas de subir y bajar');
 assert.match(js,/move\.hidden=foodGroups\.size<2/,'No mostrar flecha si solo existe un grupo');
 assert.match(js,/header\.insertBefore\(move,all\)/,'Flecha colocada junto a los controles de la categoría');
 assert.match(js,/foodGroupOrder\.onchange\(\)/,'Se conserva el guardado existente de la preferencia');
 assert.match(js,/localStorage\.setItem\(foodGroupOrderKey\(\),foodGroupOrder\.value\)/,'Orden independiente por usuario y despensa');
 assert.match(js,/foodGroupOrder\.hidden=true/,'No debe ocultarse el padre del selector');
});

test('Las herramientas de categoría comparten el estilo plano de los alimentos',()=>{
 const css=read('styles.css');
 const js=read('app.js');
 const scoped='#adminFoods .admin-icon-button';
 assert.ok(css.includes(scoped),'Los iconos de categoría y alimentos comparten una sola regla');
 const base=css.slice(css.indexOf(scoped),css.indexOf('}',css.indexOf(scoped))+1);
 assert.match(base,/background:transparent/,'Los iconos deben ser planos');
 assert.match(base,/box-shadow:none/,'No deben tener sombra');
 assert.match(base,/min-height:44px/,'El área táctil debe conservar 44px');
 assert.match(css,/#adminFoods :is\(\.admin-category-toolbar,\.admin-food-row \.admin-actions\)/,'Las herramientas de categoría y alimentos deben compartir estilos');
 assert.match(css,/#adminFoods \.admin-category-all/,'Todos debe seguir compacto');
 assert.doesNotMatch(css,/#adminFoods \.admin-category > \.admin-category-management \.admin-category-toolbar \.admin-icon-button/,'No duplicar reglas de iconos');
 assert.match(js,/setAdminIcon\(edit,'edit','Editar categoría'\)/);
 assert.match(js,/setAdminIcon\(del,'trash','Eliminar categoría'\)/);
 assert.match(js,/setAdminIcon\(button,delta<0\?'up':'down',label\+' categoría'\)/);
 assert.match(js,/categoryAvailabilityActions\(category\)/,'Marcar Todos debe seguir conectado');
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
