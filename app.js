import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Conexión pública de la aplicación existente: la seguridad depende de RLS en Supabase.
const SUPABASE_URL = 'https://yqumpnoxmzkmnxnjrkjl.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_WcQCzIlbBTktSMzva2qsQw_VnwYD4Aq';
const LOCAL_KEY = 'despensa_segunda_vivienda_v1';
const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const $ = id => document.getElementById(id);

// Se conserva el listado de respaldo original, usado ÚNICAMENTE en la importación
// inicial de una despensa vacía (nunca para reemplazar datos existentes de Supabase).
const initial = {
 '🥛 Leche, desayunos y bebidas':['Leche UHT semidesnatada','Leche en polvo','Leche condensada','Bebidas vegetales UHT','Café soluble','Café molido al vacío','Infusiones','Cacao soluble','Chocolate negro','Cereales de desayuno','Galletas','Mermelada','Miel'],
 '🫒 Aceites y vinagres':['Aceite de oliva virgen extra','Aceite de girasol','Aceite de sésamo','Vinagre de vino','Vinagre balsámico'],
 '🍅 Salsas y aderezos':['Ketchup','Mostaza','Salsa de soja','Salsa barbacoa','Salsa Worcestershire (Perrins)','Tabasco','Salsa picante','Salsa teriyaki','Salsa agridulce','Mayonesa industrial','Tomate frito','Tomate triturado','Tomate concentrado','Salsa de tomate para pasta'],
 '🌿 Especias y condimentos':['Sal','Pimienta negra','Pimienta blanca','Pimentón dulce','Pimentón picante','Comino','Curry','Cúrcuma','Orégano','Tomillo','Romero','Albahaca seca','Perejil seco','Laurel','Ajo en polvo','Cebolla en polvo','Canela','Nuez moscada','Jengibre en polvo','Azafrán','Hierbas provenzales','Caldo concentrado en pastillas'],
 '🍚 Arroz, pasta y cereales':['Arroz blanco','Arroz basmati','Pasta seca','Fideos','Cuscús','Puré de patatas en copos','Fideos instantáneos'],
 '🫘 Legumbres y proteínas vegetales':['Garbanzos secos','Lentejas secas','Alubias secas','Soja seca','Soja texturizada','Garbanzos cocidos en conserva','Lentejas cocidas en conserva','Alubias cocidas en conserva','Guisantes en conserva'],
 '🐟 Pescados y mariscos en conserva':['Atún en aceite','Sardinas en aceite','Caballa en conserva','Melva en conserva','Mejillones en escabeche','Berberechos al natural','Almejas en conserva','Anchoas en aceite','Calamares en conserva','Pulpo en conserva'],
 '🥩 Carnes y platos preparados':['Paté en lata esterilizado','Albóndigas en lata','Fabada en conserva','Cocido madrileño en conserva','Callos en conserva','Lentejas preparadas','Garbanzos con espinacas','Sopas en lata','Cremas de verduras en brick','Caldos en brick'],
 '🥕 Verduras y encurtidos':['Maíz dulce en conserva','Guisantes en conserva','Judías verdes en conserva','Zanahorias en conserva','Espárragos en conserva','Pimientos asados en conserva','Champiñones en conserva','Alcachofas en conserva','Aceitunas','Pepinillos en vinagre','Cebollitas en vinagre','Remolacha en conserva','Tomates secos envasados','Verduras deshidratadas'],
 '🥜 Frutos secos y aperitivos':['Almendras','Nueces','Avellanas','Cacahuetes tostados','Pistachos','Anacardos','Semillas de calabaza','Semillas de girasol','Semillas de chía','Semillas de sésamo','Crema de cacahuete','Barritas proteicas','Patatas fritas de bolsa','Maíz para palomitas','Fruta deshidratada'],
 '🍞 Harinas y repostería':['Harina de trigo blanca','Harina de maíz','Pan rallado','Azúcar blanco','Azúcar moreno','Levadura química','Levadura seca de panadería','Bicarbonato','Gelatina en polvo','Cacao puro en polvo','Coco rallado','Esencia de vainilla','Sirope de chocolate'],
 '🧃 Bebidas y suplementos':['Agua mineral','Refrescos en lata','Bebidas isotónicas']
};

const esCompare = (a,b) => String(a).localeCompare(String(b),'es',{sensitivity:'base',numeric:true});
const folded = s => String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const bareCategory = s => String(s).replace(/^[^\p{L}\p{N}]+/u,'').trim();
// Icono específico en el extremo izquierdo; nunca se añade un icono genérico extra.
const categoryEmojis = [
 [/especia|condimento/, '🌿'],
 [/salsa|aderezo/, '🍅'],
 [/arroz|pasta|cereal|cuscus/, '🍚'],
 [/harina|reposteria|pan/, '🍞'],
 [/pescado|marisco/, '🐟'],
 [/legumbre|proteina vegetal/, '🫘'],
 [/aceite|vinagre/, '🫒'],
 [/leche|lacteo|desayuno/, '🥛'],
 [/fruto seco|aperitivo/, '🥜'],
 [/verdura|hortaliza|encurtido/, '🥕'],
 [/carne|embutido/, '🥩'],
 [/bebida|suplemento/, '🧃'],
 [/fruta/, '🍎'],
 [/azucar|endulzante/, '🍯'],
 [/dulce|mermelada/, '🍬'],
 [/conserva/, '🥫'],
 [/congelado/, '❄️'],
 [/mascota/, '🐾'],
 [/limpieza/, '🧽'],
 [/higiene/, '🧴'],
 [/hogar|papel/, '🏠'],
 [/bebe/, '🍼']
];
function categoryIcon(category) {
 const box=document.createElement('span');
 box.className='cat-icon';box.setAttribute('aria-hidden','true');
 const match=String(category).match(/^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/u);
 const suggested=categoryEmojis.find(([re])=>re.test(folded(bareCategory(category))));
 box.textContent=suggested?.[1]||match?.[1]||'🧺';
 return box;
}
function categoryHeader(category,countText) {
 const summary=document.createElement('summary');summary.className='category-header';
 const label=document.createElement('span');label.className='cat-name';label.textContent=bareCategory(category);
 const count=document.createElement('small');count.className='cat-count';count.textContent=countText;
 const arrow=document.createElement('span');arrow.className='chevron';arrow.setAttribute('aria-hidden','true');
 summary.append(categoryIcon(category),label,count,arrow);
 return summary;
}

let data=[],session=null,channel=null,catalogChannel=null,busy=false,catalogRows=[],catalogReady=false,adminMode=false;
const openCategories=new Set(),catalogOpen=new Set();
const adminOpenCategories={food:new Set(),catalog:new Set()};
const recentAdminFoods=new Map();
let recentAdminFoodSequence=0;
const adminFoodKey=item=>JSON.stringify([item.category,folded(item.name)]);
function compareAdminFoods(a,b){
 const recent=(recentAdminFoods.get(adminFoodKey(b))||0)-(recentAdminFoods.get(adminFoodKey(a))||0);
 return recent||esCompare(a.name,b.name);
}
let categoryOrder=[],savingCategoryOrder=false;
function readCategoryOrder(value){
 return Array.isArray(value)?[...new Set(value.filter(x=>typeof x==='string'))]:[];
}
function orderedCategories(values){
 const available=new Set(values);
 return [...categoryOrder.filter(x=>available.delete(x)),...[...available].sort(esCompare)];
}
async function saveCategoryOrder(next){
 if(!session||savingCategoryOrder)return false;
 savingCategoryOrder=true;renderAdmin();
 try{
  const {data:result,error}=await db.auth.updateUser({data:{category_order:next}});
  if(error)throw error;
  session.user=result.user;categoryOrder=readCategoryOrder(result.user.user_metadata?.category_order);
  render();adminMessage('Orden guardado en tu cuenta.');return true;
 }catch(error){adminMessage('No se pudo guardar el orden: '+error.message);return false;}
 finally{savingCategoryOrder=false;renderAdmin();}
}
function categoryOrderControls(category){
 const ordered=orderedCategories(pantryCategories()),index=ordered.indexOf(category);
 const actions=document.createElement('span');actions.className='category-order-actions';
 actions.style.cssText='display:flex;gap:6px;grid-column:3;grid-row:2';
 for(const [delta,text,label] of [[-1,'↑','Subir'],[1,'↓','Bajar']]){
  const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent=text;
  button.dataset.direction=String(delta);
  button.setAttribute('aria-label',label+' '+bareCategory(category));
  button.title=label+' categoría';
  button.style.cssText='min-width:44px;min-height:44px;padding:6px;font-size:20px;line-height:1';
  button.disabled=savingCategoryOrder||index+delta<0||index+delta>=ordered.length;
  button.onclick=async event=>{
   event.preventDefault();event.stopPropagation();
   if(savingCategoryOrder)return;
   const next=[...ordered];[next[index],next[index+delta]]=[next[index+delta],next[index]];
   next.push(...categoryOrder.filter(x=>!next.includes(x)));
   await saveCategoryOrder(next);
   const section=[...$('adminFoods').querySelectorAll('details.admin-category')].find(x=>x.dataset.category===category);
   const buttons=section?.querySelectorAll('.category-order-actions button');
   if(buttons){const preferred=[...buttons].find(x=>x.dataset.direction===String(delta));(preferred?.disabled?[...buttons].find(x=>!x.disabled):preferred)?.focus();}
  };
  actions.append(button);
 }
 return actions;
}

const viewStyles=[
 {id:'ampliado',name:'Ampliado',description:'Tarjetas grandes, iconos destacados y más espacio.'},
 {id:'compactado',name:'Compactado',description:'Tarjetas y filas más pequeñas para ver más alimentos.'}
];
let viewStyle='ampliado',savingViewStyle=false;
function applyViewStyle(value){
 viewStyle=viewStyles.some(x=>x.id===value)?value:'ampliado';
 document.documentElement.dataset.viewStyle=viewStyle;
 renderStylePanel();
}
function renderStylePanel(){
 const panel=$('styleOptions');if(!panel)return;
 for(const button of panel.querySelectorAll('button')){
  const selected=button.dataset.style===viewStyle;
  button.setAttribute('aria-pressed',String(selected));
  button.disabled=savingViewStyle;
  button.querySelector('.style-state').textContent=selected?'Seleccionado':'Elegir estilo';
 }
 panel.setAttribute('aria-busy',String(savingViewStyle));
}
async function saveViewStyle(next){
 if(!session||savingViewStyle||next===viewStyle)return;
 const previous=viewStyle;
 savingViewStyle=true;applyViewStyle(next);
 $('styleMessage').textContent='Guardando estilo…';
 try{
  const {data:result,error}=await db.auth.updateUser({data:{view_style:next}});
  if(error)throw error;
  session.user=result.user;
  $('styleMessage').textContent='Estilo guardado en tu cuenta.';
 }catch(error){
  applyViewStyle(previous);
  $('styleMessage').textContent='No se pudo guardar el estilo: '+error.message;
 }finally{savingViewStyle=false;renderStylePanel();}
}
function mountStylePanel(){
 const panel=document.createElement('details');panel.className='admin-section admin-catalog style-panel';
 const title=document.createElement('summary');title.textContent='🎨 Panel de estilos';
 const hint=document.createElement('p');hint.className='hint';hint.textContent='Elige cómo quieres ver la aplicación. Tu elección se guarda automáticamente en tu cuenta.';
 const options=document.createElement('div');options.id='styleOptions';options.className='style-options';options.setAttribute('role','group');options.setAttribute('aria-label','Estilo de visualización');
 for(const style of viewStyles){
  const button=document.createElement('button');button.type='button';button.className='style-option';button.dataset.style=style.id;
  const preview=document.createElement('span');preview.className='style-preview preview-'+style.id;preview.setAttribute('aria-hidden','true');
  for(const text of ['🌿 Especias','🍅 Salsas','🍚 Cereales']){const row=document.createElement('span');row.textContent=text;preview.append(row);}
  const name=document.createElement('strong');name.textContent=style.name;
  const description=document.createElement('span');description.className='style-description';description.textContent=style.description;
  const state=document.createElement('span');state.className='style-state';
  button.append(preview,name,description,state);button.onclick=()=>saveViewStyle(style.id);options.append(button);
 }
 const message=document.createElement('p');message.id='styleMessage';message.className='hint';message.setAttribute('role','status');
 panel.append(title,hint,options,message);
 $('adminPanel').insertBefore(panel,$('adminAddMount').parentElement);
 renderStylePanel();
}


let customCategories=[],categoryMutation=false;
const pantryCategories=()=>[...new Set([...customCategories,...data.map(x=>x.category)])];
const categoryIdentity=name=>folded(bareCategory(name)).trim();
async function storeCategories(categories,order=categoryOrder){
 const {data:result,error}=await db.auth.updateUser({data:{pantry_categories:categories,category_order:order}});
 if(error)throw error;
 session.user=result.user;customCategories=readCategoryOrder(result.user.user_metadata?.pantry_categories);
 categoryOrder=readCategoryOrder(result.user.user_metadata?.category_order);
}
function categoryExists(name,except){
 return pantryCategories().some(c=>c!==except&&categoryIdentity(c)===categoryIdentity(name));
}
async function createPantryCategory(name){
 name=name.trim();if(!name||!categoryIdentity(name)||!session||categoryMutation)return false;
 if(categoryExists(name)){adminMessage('Ya existe una categoría con ese nombre.');return false;}
 categoryMutation=true;
 try{
  await storeCategories([...customCategories,name]);
  adminOpenCategories.food.add(name);render();adminMessage('Categoría creada.');return true;
 }catch(error){adminMessage('No se pudo crear la categoría: '+error.message);return false;}
 finally{categoryMutation=false;}
}
async function renamePantryCategory(category,name){
 name=name.trim();if(!name||!categoryIdentity(name)||!session||categoryMutation)return;
 if(name===category)return;
 if(categoryExists(name,category)){adminMessage('Ya existe una categoría con ese nombre.');return;}
 categoryMutation=true;
 const previous=[...customCategories],previousOrder=[...categoryOrder];
 try{
  const categories=[...new Set([...customCategories.filter(c=>c!==category),name])];
  const order=orderedCategories(pantryCategories()).map(c=>c===category?name:c);
  await storeCategories(categories,order);
  const {error}=await db.from('alimentos').update({categoria:name}).eq('categoria',category);
  if(error){
   await storeCategories(previous,previousOrder);throw error;
  }
  data=data.map(x=>x.category===category?{...x,category:name}:x);
  if(adminOpenCategories.food.delete(category))adminOpenCategories.food.add(name);
  if(openCategories.delete(category))openCategories.add(name);
  if(categoryFoodDrafts.has(category)){categoryFoodDrafts.set(name,categoryFoodDrafts.get(category));categoryFoodDrafts.delete(category);}
  render();await refresh();adminMessage('Nombre de categoría guardado.');
 }catch(error){adminMessage('No se pudo completar el cambio de categoría: '+error.message);await refresh();render();}
 finally{categoryMutation=false;}
}
async function deletePantryCategory(category){
 if(!session||categoryMutation)return;
 if(data.some(x=>x.category===category)){adminMessage('Vacía esta categoría antes de eliminarla.');return;}
 if(!confirm('¿Eliminar la categoría «'+bareCategory(category)+'»?'))return;
 categoryMutation=true;
 try{
  await storeCategories(customCategories.filter(c=>c!==category),categoryOrder.filter(c=>c!==category));
  adminOpenCategories.food.delete(category);openCategories.delete(category);categoryFoodDrafts.delete(category);
  render();adminMessage('Categoría eliminada.');
 }catch(error){adminMessage('No se pudo eliminar la categoría: '+error.message);}
 finally{categoryMutation=false;}
}
function categoryManagement(category){
 const holder=document.createElement('div');holder.className='admin-row';
 const actions=document.createElement('div');actions.className='admin-actions';
 const edit=document.createElement('button');edit.type='button';edit.className='secondary';edit.textContent='Editar categoría';
 const del=document.createElement('button');del.type='button';del.className='danger';del.textContent='Eliminar categoría';
 actions.append(edit,del);holder.append(actions);
 edit.onclick=()=>{
  if(holder.querySelector('form')){holder.querySelector('form').remove();return;}
  const form=document.createElement('form');form.className='admin-edit';
  const input=document.createElement('input');input.required=true;input.maxLength=120;input.value=bareCategory(category);input.setAttribute('aria-label','Nombre de la categoría');
  const save=document.createElement('button');save.type='submit';save.textContent='Guardar nombre';
  form.append(input,save);holder.append(form);input.focus();
  form.onsubmit=async event=>{event.preventDefault();save.disabled=true;await renamePantryCategory(category,input.value);save.disabled=false;};
 };
 del.onclick=()=>deletePantryCategory(category);
 return holder;
}
function mountCategoryCreator(){
 const plus=$('dedup');plus.id='addCategoryToggle';plus.textContent='+';plus.setAttribute('aria-label','Crear categoría');plus.setAttribute('aria-expanded','false');
 const form=document.createElement('form');form.className='add';form.hidden=true;
 const input=document.createElement('input');input.required=true;input.maxLength=120;input.placeholder='Nombre de la nueva categoría';input.setAttribute('aria-label','Nombre de la nueva categoría');
 const add=document.createElement('button');add.type='submit';add.textContent='Añadir';
 const cancel=document.createElement('button');cancel.type='button';cancel.className='secondary';cancel.textContent='Cancelar';
 form.append(input,add,cancel);plus.parentElement.append(form);
 const close=()=>{form.hidden=true;plus.hidden=false;plus.setAttribute('aria-expanded','false');input.value='';plus.focus();};
 plus.onclick=()=>{plus.hidden=true;plus.setAttribute('aria-expanded','true');form.hidden=false;input.focus();};
 cancel.onclick=close;
 form.onsubmit=async event=>{event.preventDefault();add.disabled=cancel.disabled=true;try{if(await createPantryCategory(input.value))close();}finally{add.disabled=cancel.disabled=false;}};
}

const categoryOptions=()=>[...new Set([...Object.keys(initial),...data.map(x=>x.category),...catalogRows.map(x=>x.categoria)])];
function adminMessage(message) {$('adminMessage').textContent=message||'';}
function setStatus(message) {$('status').textContent=message;}
function localItems(){
 try{const saved=JSON.parse(localStorage.getItem(LOCAL_KEY));if(Array.isArray(saved))return saved;}catch{}
 return Object.entries(initial).flatMap(([category,names])=>names.map(name=>({id:crypto.randomUUID(),category,name,have:false})));
}
function showApp(visible){
 if(!visible)adminMode=false;
 $('adminToggle').hidden=!visible;
 $('adminToggle').textContent=adminMode?'← Volver a despensa':'⚙️ Administrar';
 $('adminPanel').hidden=!visible||!adminMode;
 for(const id of ['stats','toolbar','items'])$(id).hidden=!visible||adminMode;
 $('auth').hidden=visible;
 $('loginForm').hidden=visible;
 $('status').hidden=visible;
 if(!visible)$('migration').hidden=true;
}
function render(){
 const q=folded($('search').value.trim()),filter=$('filter').value;
 $('total').textContent=data.length;
 $('have').textContent=data.filter(x=>x.have).length;
 $('missing').textContent=data.filter(x=>!x.have).length;
 const shown=data.filter(x=>folded(x.name).includes(q)&&(filter==='all'||(filter==='have'?x.have:!x.have)));
 const main=$('items');main.replaceChildren();
 if(!shown.length){const p=document.createElement('p');p.className='empty';p.textContent='No hay alimentos con este filtro.';main.append(p);}
 for(const category of orderedCategories(pantryCategories())){
  const rows=shown.filter(x=>x.category===category).sort((a,b)=>esCompare(a.name,b.name));
  if(!rows.length&&(q||filter!=='all'))continue;
  const details=document.createElement('details');details.className='category';details.open=openCategories.has(category)||!!q;
  details.addEventListener('toggle',()=>{if(details.open)openCategories.add(category);else openCategories.delete(category)});
  details.append(categoryHeader(category,`${rows.filter(x=>x.have).length}/${rows.length}`));
  for(const x of rows){
   const row=document.createElement('div');row.className='item'+(x.have?' done':'');
   const check=document.createElement('input');check.type='checkbox';check.checked=x.have;check.disabled=busy;
   check.setAttribute('aria-label','Tengo '+x.name);
   check.onchange=async()=>{
    check.disabled=true;
    const {error}=await db.from('alimentos').update({disponible:check.checked}).eq('id',x.id);
    if(error)alert('No se pudo guardar: '+error.message);
    await refresh();
   };
   const name=document.createElement('span');name.textContent=x.name;row.append(check,name);details.append(row);
  }
  main.append(details);
 }
 if(adminMode)renderAdmin();
}
async function refresh(){
 if(!session)return;
 const {data:rows,error}=await db.from('alimentos').select('id,nombre,categoria,disponible').order('creado_en',{ascending:true});
 if(error){setStatus('Sin conexión o sin permisos: '+error.message);$('auth').hidden=false;$('status').hidden=false;return;}
 const next=(rows||[]).map(x=>({id:x.id,name:x.nombre,category:x.categoria,have:!!x.disponible}));
 const changed=JSON.stringify(next)!==JSON.stringify(data);
 data=next;if(changed)render();
 setStatus('☁️ Lista compartida · '+data.length+' alimentos · Sincronizada');
 $('migration').hidden=data.length!==0;
 $('auth').hidden=data.length!==0;
 $('status').hidden=data.length!==0;
}
async function signedIn(currentSession){
 session=currentSession;
 recentAdminFoods.clear();
 applyViewStyle(currentSession?.user?.user_metadata?.view_style);
 categoryOrder=readCategoryOrder(currentSession?.user?.user_metadata?.category_order);
 customCategories=readCategoryOrder(currentSession?.user?.user_metadata?.pantry_categories);
 showApp(!!currentSession);
 if(channel){await db.removeChannel(channel);channel=null;}
 if(catalogChannel){await db.removeChannel(catalogChannel);catalogChannel=null;}
 if(!currentSession){setStatus('Inicia sesión con tu cuenta de HondaDespensa.');$('auth').hidden=false;$('status').hidden=false;$('loginForm').hidden=false;return;}
 const u=currentSession.user||{};
 $('accountName').textContent=u.user_metadata?.display_name||u.user_metadata?.full_name||u.email?.split('@')[0]||'Usuario';
 setStatus('Cargando lista compartida…');await refresh();await loadCatalog();render();
 channel=db.channel('alimentos-honda-v21').on('postgres_changes',{event:'*',schema:'public',table:'alimentos'},()=>refresh()).subscribe();
 catalogChannel=db.channel('catalogo-honda-v21').on('postgres_changes',{event:'*',schema:'public',table:'catalogo'},()=>loadCatalog()).subscribe();
}

$('loginForm').onsubmit=async event=>{
 event.preventDefault();const button=$('loginForm').querySelector('button');button.disabled=true;
 setStatus('Iniciando sesión…');
 const {data:result,error}=await db.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});
 button.disabled=false;
 if(error){setStatus('Error de acceso: '+error.message);return;}
 $('password').value='';await signedIn(result.session);
};
$('signOut').onclick=async()=>{
 if(!session||!confirm('¿Quieres cerrar sesión?'))return;
 const {error}=await db.auth.signOut();
 if(error){adminMessage('No se pudo cerrar sesión: '+error.message);return;}
 await signedIn(null);
};
$('adminToggle').onclick=()=>{
 adminMode=!adminMode;recentAdminFoods.clear();showApp(true);
 if(adminMode)renderAdmin();else render();
 window.scrollTo({top:0,behavior:'smooth'});
};

$('upload').onclick=async()=>{
 if(busy)return;
 const {count,error:countError}=await db.from('alimentos').select('id',{count:'exact',head:true});
 if(countError){alert(countError.message);return;}
 if(count!==0){alert('La nube ya contiene alimentos. No se importará otra lista.');await refresh();return;}
 const local=localItems();
 if(!confirm(`Vas a subir ${local.length} alimentos desde ESTE móvil. Hazlo solo desde el móvil con la lista correcta. ¿Continuar?`))return;
 busy=true;$('upload').disabled=true;
 const rows=local.map(x=>({id:x.id,nombre:x.name,categoria:x.category,disponible:!!x.have}));
 for(let i=0;i<rows.length;i+=100){
  const {error}=await db.from('alimentos').insert(rows.slice(i,i+100));
  if(error){alert('Error al importar: '+error.message+'; algunos productos podrían haberse subido. No repitas la importación sin revisar la nube.');break;}
 }
 busy=false;$('upload').disabled=false;await refresh();
};

async function addSharedFood(name,category,recentFirst=false){
 if(!session)return false;
 if(data.some(x=>folded(x.name)===folded(name)&&x.category===category)){alert('Ese alimento ya está en la lista.');return false;}
 const {error}=await db.from('alimentos').insert({nombre:name,categoria:category,disponible:false});
 if(error){alert('No se pudo añadir: '+error.message);return false;}
 if(recentFirst)recentAdminFoods.set(adminFoodKey({name,category}),++recentAdminFoodSequence);
 await refresh();return true;
}
$('search').oninput=render;$('filter').onchange=render;

async function loadCatalog(){
 if(!session)return;
 const {data:rows,error}=await db.from('catalogo').select('id,nombre,categoria').order('categoria').order('nombre');
 if(error){catalogReady=false;adminMessage('No se pudo acceder al catálogo: '+error.message);}
 else{
  const next=rows||[];const changed=JSON.stringify(next)!==JSON.stringify(catalogRows);
  catalogRows=next;catalogReady=true;
  if(changed&&adminMode)renderAdmin();
  return;
 }
 if(adminMode)renderAdmin();
}
function renderCatalog(){
 const holder=$('catalogItems'),q=folded($('catalogSearch').value.trim());holder.replaceChildren();
 let remaining=0;
 const groups=catalogReady?Object.entries(catalogRows.reduce((acc,x)=>{(acc[x.categoria]??=[]).push(x.nombre);return acc;},{})):Object.entries(initial);
 for(const [category,names] of groups.sort((a,b)=>esCompare(a[0],b[0]))){
  const available=names.filter(name=>!data.some(x=>x.category===category&&folded(x.name)===folded(name))&&folded(name).includes(q));
  if(!available.length)continue;remaining+=available.length;
  const details=document.createElement('details');details.className='catalog-category';details.open=catalogOpen.has(category)||!!q;
  details.addEventListener('toggle',()=>{if(details.open)catalogOpen.add(category);else catalogOpen.delete(category)});
  const summary=document.createElement('summary');summary.textContent=bareCategory(category)+' · '+available.length;details.append(summary);
  const products=document.createElement('div');products.className='catalog-products';
  for(const name of available){
   const button=document.createElement('button');button.type='button';button.textContent='＋ '+name;
   button.onclick=async()=>{button.disabled=true;if(!await addSharedFood(name,category))button.disabled=false;else renderCatalog();};
   products.append(button);
  }
  details.append(products);holder.append(details);
 }
 if(!remaining){const p=document.createElement('p');p.className='empty';p.textContent=q?'No hay alimentos disponibles con esa búsqueda.':'Todos los alimentos del catálogo ya están añadidos.';holder.append(p);}
}
function makeAdminRow(item,type){
 const row=document.createElement('div');row.className='admin-row';
 const label=document.createElement('div');label.className='admin-label';
 const name=document.createElement('strong');name.textContent=type==='food'?item.name:item.nombre;
 label.append(name);
 const actions=document.createElement('div');actions.className='admin-actions';
 const edit=document.createElement('button');edit.type='button';edit.className='secondary';edit.textContent='Editar';
 const del=document.createElement('button');del.type='button';del.className='danger';del.textContent='Eliminar';
 actions.append(edit,del);row.append(label,actions);
 edit.onclick=()=>{
  if(row.querySelector('.admin-edit')){row.querySelector('.admin-edit').remove();return;}
  const form=document.createElement('form');form.className='admin-edit';
  const n=document.createElement('input');n.required=true;n.maxLength=100;n.value=type==='food'?item.name:item.nombre;n.setAttribute('aria-label','Nombre del alimento');
  const save=document.createElement('button');save.type='submit';save.textContent='Guardar cambios';form.append(n,save);row.append(form);
  form.onsubmit=async e=>{
   e.preventDefault();const nombre=n.value.trim();if(!nombre)return;
   save.disabled=true;
   const table=type==='food'?'alimentos':'catalogo';
   const {error}=await db.from(table).update({nombre}).eq('id',item.id);
   if(error){adminMessage('Error: '+error.message);save.disabled=false;return;}
   await refresh();if(type==='catalog')await loadCatalog();adminMessage('Cambios guardados.');
  };
 };
 del.onclick=async()=>{
  if(!confirm('¿Eliminar «'+(type==='food'?item.name:item.nombre)+'» '+(type==='food'?'de la despensa':'del catálogo')+'?'))return;
  del.disabled=true;
  const {error}=await db.from(type==='food'?'alimentos':'catalogo').delete().eq('id',item.id);
  if(error){adminMessage('Error: '+error.message);del.disabled=false;return;}
  await refresh();if(type==='catalog')await loadCatalog();adminMessage('Alimento eliminado.');
 };
 return row;
}
const categoryFoodDrafts=new Map(),categoryFoodSaving=new Set();
function categoryAddFoodForm(category){
 const form=document.createElement('form');form.className='add category-add-food';
 form.style.cssText='padding:10px 12px;margin:0;border-top:1px solid #476581';
 form.setAttribute('aria-label','Añadir alimento en '+bareCategory(category));
 const input=document.createElement('input');input.type='text';input.required=true;input.maxLength=100;
 input.placeholder='Añadir a esta categoría';input.setAttribute('aria-label','Nombre del nuevo alimento en '+bareCategory(category));
 input.value=categoryFoodDrafts.get(category)||'';
 input.oninput=()=>categoryFoodDrafts.set(category,input.value);
 const button=document.createElement('button');button.type='submit';button.textContent='＋ Añadir alimento';
 input.disabled=button.disabled=categoryFoodSaving.has(category);
 form.append(input,button);
 form.onsubmit=async event=>{
  event.preventDefault();const name=input.value.trim();
  if(!name||categoryFoodSaving.has(category))return;
  categoryFoodDrafts.set(category,input.value);categoryFoodSaving.add(category);
  input.disabled=button.disabled=true;button.textContent='Añadiendo…';
  try{
   if(await addSharedFood(name,category,true)){
    categoryFoodDrafts.delete(category);
    adminMessage('Alimento añadido en '+bareCategory(category)+'.');
   }
  }catch(error){adminMessage('No se pudo añadir: '+error.message);}
  finally{
   categoryFoodSaving.delete(category);renderAdmin();
   const section=[...$('adminFoods').querySelectorAll('details.admin-category')].find(x=>x.dataset.category===category);
   section?.querySelector('.category-add-food input')?.focus();
  }
 };
 return form;
}

function renderGroupedAdmin(container,rows,type,query){
 const open=adminOpenCategories[type];
 // Leer el estado actual antes de reconstruir la lista, sin esperar al evento toggle.
 for(const section of container.querySelectorAll('details.admin-category')){
  if(section.open)open.add(section.dataset.category);else open.delete(section.dataset.category);
 }
 container.replaceChildren();const groups=new Map();
 if(type==='food')for(const category of pantryCategories())if(!query||folded(category).includes(query))groups.set(category,[]);
 for(const item of rows){
  const category=type==='food'?item.category:item.categoria;
  const name=type==='food'?item.name:item.nombre;
  if(!folded(name+' '+category).includes(query))continue;
  if(!groups.has(category))groups.set(category,[]);
  groups.get(category).push(item);
 }
 for(const category of (type==='food'?orderedCategories(groups.keys()):[...groups.keys()].sort(esCompare))){
  const section=document.createElement('details');section.className='category admin-category';
  const header=categoryHeader(category,groups.get(category).length+' alimentos');
  if(type==='food'){
   header.style.cssText='display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:8px 10px';
   header.querySelector('.cat-icon').style.cssText='grid-column:1;grid-row:1';
   header.querySelector('.cat-name').style.cssText='grid-column:2;grid-row:1';
   header.querySelector('.chevron').style.cssText='grid-column:3;grid-row:1;justify-self:end;margin-right:6px';
   header.querySelector('.cat-count').style.cssText='grid-column:2;grid-row:2;white-space:normal';
   header.append(categoryOrderControls(category));
  }
  section.append(header);
  if(type==='food')section.append(categoryManagement(category),categoryAddFoodForm(category));
  for(const item of groups.get(category).sort(type==='food'?compareAdminFoods:(a,b)=>esCompare(a.nombre,b.nombre)))section.append(makeAdminRow(item,type));
  section.dataset.category=category;
  section.open=open.has(category)||!!query;container.append(section);
 }
 if(!groups.size){const p=document.createElement('p');p.className='empty';p.textContent='No hay alimentos con este filtro.';container.append(p);}
}
function renderAdmin(){
 if(!adminMode)return;
 renderGroupedAdmin($('adminFoods'),data,'food',folded($('adminFoodSearch').value.trim()));
 renderGroupedAdmin($('adminCatalogRows'),catalogRows,'catalog',folded($('adminCatalogSearch').value.trim()));
 renderCatalog();
 const dl=$('adminCategories');dl.replaceChildren();
 for(const category of categoryOptions().sort(esCompare)){const opt=document.createElement('option');opt.value=category;dl.append(opt);}
}
mountStylePanel();
// El alta se realiza dentro de cada categoría, sin selector global.
$('adminAddMount').parentElement.remove();
$('addForm').remove();
$('adminFoodSearch').oninput=renderAdmin;
$('adminCatalogSearch').oninput=renderAdmin;
$('catalogSearch').oninput=renderCatalog;
$('catalogAddForm').onsubmit=async e=>{
 e.preventDefault();
 const nombre=$('catalogNewName').value.trim(),categoria=$('catalogNewCategory').value.trim();
 if(!nombre||!categoria||!session)return;
 if(catalogRows.some(x=>folded(x.nombre)===folded(nombre)&&x.categoria===categoria)){adminMessage('Ese alimento ya figura en el catálogo.');return;}
 const button=$('catalogAddForm').querySelector('button');button.disabled=true;
 const {error}=await db.from('catalogo').insert({nombre,categoria});button.disabled=false;
 if(error){adminMessage('Error: '+error.message);return;}
 $('catalogNewName').value='';await loadCatalog();adminMessage('Alimento añadido al catálogo.');
};
mountCategoryCreator();

const {data:authData,error:authError}=await db.auth.getSession();
if(authError)setStatus('Error de sesión: '+authError.message);
await signedIn(authData.session);
db.auth.onAuthStateChange((event,s)=>{
 if(event==='SIGNED_OUT'&&session)signedIn(null);
});
setInterval(()=>{if(session&&!document.hidden)refresh();},12000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&session)refresh();});
