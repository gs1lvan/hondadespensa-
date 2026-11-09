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
const iconSlots = ['🥛','🫒','🍅','🌿','🍚','🫘','🐟','🥩','🥕','🥜','🍞','🧃'];
function iconSprite(slot) {
 const icon=document.createElement('span');
 icon.className='category-sprite';
 icon.setAttribute('aria-hidden','true');
 icon.style.backgroundPosition=`${slot%4*100/3}% ${Math.floor(slot/4)*50}%`;
 return icon;
}
function suggestedCategoryIcon(category) {
 const match=String(category).match(/^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)/u);
 const suggested=categoryEmojis.find(([re])=>re.test(folded(bareCategory(category))));
 return suggested?.[1]||match?.[1]||'🧺';
}
function categoryIcon(category,emoji=suggestedCategoryIcon(category)) {
 const box=document.createElement('span');
 box.className='cat-icon';box.setAttribute('aria-hidden','true');
 // Catalog copies can contain the generic basket when the source category was renamed.
 const suggested=emoji==='🧺'?suggestedCategoryIcon(category):emoji;
 const resolved=iconSlots.includes(suggested)?suggested:emoji;
 const slot=iconSlots.indexOf(resolved);
 if(slot<0)box.textContent=resolved;
 else box.append(iconSprite(slot));
 return box;
}
function categoryHeader(category,countText,emoji) {
 const summary=document.createElement('summary');summary.className='category-header';
 const label=document.createElement('span');label.className='cat-name';label.textContent=bareCategory(category);
 const count=document.createElement('small');count.className='cat-count';count.textContent=countText;
 const arrow=document.createElement('span');arrow.className='chevron';arrow.setAttribute('aria-hidden','true');
 summary.append(categoryIcon(category,emoji),label,count,arrow);
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
 const ordered=categoryOrder.map(key=>findPantryCategory(key)?.nombre??key);
 return [...ordered.filter(name=>available.delete(name)),...[...available].sort(esCompare)];
}
async function saveCategoryOrder(next){
 if(!session||!activePantry||savingCategoryOrder)return false;
 const key=pantryOrderKey(activePantry);
 savingCategoryOrder=true;renderAdmin();
 try{
  const {data:result,error}=await db.auth.updateUser({data:{[key]:next}});
  if(error)throw error;
  session.user=result.user;
  if(!activePantry||pantryOrderKey(activePantry)!==key)return false;
  categoryOrder=readCategoryOrder(result.user.user_metadata?.[key]);
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
   await saveCategoryOrder(next.map(name=>pantryCategoryByName.get(name)?.id??name));
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
 const title=document.createElement('summary');title.textContent='Estilos';
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
 const heading=document.createElement('h2');heading.textContent='Vista de la despensa';
 panel.append(title,heading,hint,options,message);
 const sizeLabel=document.createElement('label');
 sizeLabel.className='icon-size-control';
 sizeLabel.textContent='Tamaño de los iconos de la despensa';
 const size=document.createElement('select');
 size.id='pantryIconSize';
 size.add(new Option('Grandes · sobresalen de la tarjeta','grandes'));
 size.add(new Option('Medianos · dentro de la tarjeta','medianos'));
 size.onchange=()=>savePantryIconSize(size.value);
 sizeLabel.append(size);
 panel.append(sizeLabel);
 mountTypography(panel);
 mountBackground(panel);
 mountIconOptions(panel);
 $('adminPanel').insertBefore(panel,$('adminAddMount').parentElement);
 renderStylePanel();
 applyIconFamily();
}


const iconFamilies=[
 {id:'ilustrados',name:'Iconos ilustrados'},
 {id:'sencillos',name:'Iconos sencillos'},
 {id:'estencil',name:'Iconos esténcil'},
 {id:'estencil-sin-envases',name:'Esténcil sin envases'}
];
function applyIconFamily(value,adminValue){
 const locked=usesVintageHome();
 const family=!locked&&iconFamilies.some(option=>option.id===value)?value:'ilustrados';
 document.documentElement.dataset.iconFamily=family;
 const adminFamily=iconFamilies.some(option=>option.id===adminValue)?adminValue:'';
 $('adminPanel').dataset.adminIconFamily=adminFamily;
 for(const check of $('iconOptions').querySelectorAll('input')){
  check.checked=check.value===adminFamily;
 }
 for(const button of $('iconOptions').querySelectorAll('button')){
  const selected=button.dataset.family===family;
  button.disabled=locked;
  button.setAttribute('aria-pressed',String(selected));
  button.querySelector('.style-state').textContent=locked?(selected?'Fija en inicio alternativo':'No disponible'):selected?'Seleccionado':'Elegir familia';
 }
}
let savingIconFamily=false;
const typographyFields=[
 {key:'font',label:'Fuente',options:{sistema:'Del sistema',sans:'Arial',serif:'Georgia',mono:'Monoespaciada',humanista:'Verdana',redonda:'Redondeada',clasica:'Times',editorial:'Manuscrita',tecnica:'Cartel'},initial:'sistema'},
 {key:'weight',label:'Grosor',options:{normal:'Normal',original:'Original',negrita:'Negrita'},initial:'original'},
 {key:'size',label:'Tamaño de letra',options:{pequeno:'Pequeño',mediano:'Mediano',grande:'Grande'},initial:'mediano'}
];
function applyTypography(value){
 const result={};
 for(const {key,options,initial} of typographyFields){
  const choice=Object.hasOwn(options,value?.[key])?value[key]:initial;
  result[key]=choice;
  document.documentElement.dataset['text'+key]=choice;
  $('text-'+key).value=choice;
 }
 $('fontPicker').textContent=typographyFields[0].options[result.font]+' · Ajustar tipografía';
 for(const button of $('fontSamples').children){
  button.setAttribute('aria-pressed',String(button.dataset.textfont===result.font));
 }
}
const backgroundColors={marino:'Azul marino | oscuro',petroleo:'Azul petróleo | oscuro',bosque:'Verde bosque | oscuro',grafito:'Gris grafito | oscuro',ciruela:'Ciruela | oscuro','petroleo-claro':'Azul petróleo | claro','bosque-claro':'Verde bosque | claro','ciruela-claro':'Ciruela | claro'};
const backgroundTextures={grano:'Grano fino',liso:'Liso',tejido:'Tejido',puntos:'Puntos finos'};
const backgroundPresetTextures={marino:'grano',petroleo:'liso',bosque:'tejido',grafito:'grano',ciruela:'liso','petroleo-claro':'liso','bosque-claro':'tejido','ciruela-claro':'liso'};
const customColorFields={customBackground:'Fondo',textColor:'Texto',borderColor:'Bordes'};
const customColorDefaults={customBackground:'#071c32',textColor:'#f5f9ff',borderColor:'#6795b9'};
function applyCustomColors(element,value){
 for(const key of Object.keys(customColorFields)){
  if(value[key])element.style.setProperty('--'+key,value[key]);
  else element.style.removeProperty('--'+key);
 }
}
function backgroundPreference(value){
 return {
  color:Object.hasOwn(backgroundColors,value?.color)?value.color:'marino',
  texture:Object.hasOwn(backgroundTextures,value?.texture)?value.texture:'grano',
  ...Object.fromEntries(Object.keys(customColorFields).map(key=>[key,/^#[0-9a-f]{6}$/i.test(value?.[key]??'')?value[key]:null]))
 };
}
function applyBackground(value){
 const preference=backgroundPreference(value);
 const {color,texture}=preference;
 applyCustomColors(document.documentElement,preference);
 document.documentElement.dataset.bgColor=color;
 document.documentElement.dataset.bgTexture=texture;
 const themeColor=document.querySelector('meta[name="theme-color"]');
 themeColor.content=preference.customBackground
  ?? (getComputedStyle(document.documentElement).getPropertyValue('--app-bg-color').trim() || '#071c32');
}
function mountBackground(panel){
 const section=document.createElement('div');
 section.className='icon-size-control';
 const picker=document.createElement('button');
 picker.type='button';
 picker.textContent='Ajustar fondo';
 picker.setAttribute('aria-haspopup','dialog');
 const dialog=document.createElement('dialog');
 dialog.className='font-dialog background-dialog';
 dialog.setAttribute('aria-labelledby','backgroundTitle');
 const title=document.createElement('h2');
 title.id='backgroundTitle';
 title.textContent='Fondo de la aplicación';
 const preview=document.createElement('div');
 preview.className='background-preview';
 const card=document.createElement('details');
 card.className='category background-preview-card';
 const header=categoryHeader('Salsas y aderezos','7/12');
 header.tabIndex=-1;
 header.onclick=event=>event.preventDefault();
 card.append(header);
 preview.append(card);
 const themeButton=document.createElement('button');
 themeButton.type='button';
 themeButton.className='secondary theme-picker-trigger';
 themeButton.setAttribute('aria-haspopup','dialog');
 const themes=document.createElement('dialog');
 themes.className='font-dialog';
 themes.setAttribute('aria-labelledby','themePickerTitle');
 const themeTitle=document.createElement('h2');
 themeTitle.id='themePickerTitle';
 themeTitle.textContent='Temas predefinidos';
 const themeOptions=document.createElement('div');
 themeOptions.className='theme-picker-options';
 for(const [value,name] of Object.entries(backgroundColors)){
  const option=document.createElement('button');
  option.type='button';
  option.className='secondary';
  option.dataset.bgColor=value;
  const sample=document.createElement('span');
  sample.className='theme-picker-swatch';
  sample.setAttribute('aria-hidden','true');
  option.append(sample,name);
  option.onclick=()=>{
   selectTheme(value);
   themes.close();
  };
  themeOptions.append(option);
 }
 const closeThemes=document.createElement('button');
 closeThemes.type='button';
 closeThemes.className='secondary theme-picker-trigger';
 closeThemes.textContent='Cancelar';
 closeThemes.onclick=()=>themes.close();
 themes.append(themeTitle,themeOptions,closeThemes);
 themeButton.onclick=()=>themes.showModal();
 const field=document.createElement('label');
 field.className='icon-size-control';
 field.textContent='Textura';
 const texture=document.createElement('select');
 for(const [value,name] of Object.entries(backgroundTextures))texture.add(new Option(name,value));
 field.append(texture);
 dialog.append(themeButton,themes,field);
 const targets=document.createElement('div');
 targets.className='background-color-targets';
 targets.setAttribute('role','group');
 targets.setAttribute('aria-label','Color que quieres cambiar');
 let target='customBackground';
 for(const [key,label] of Object.entries(customColorFields)){
  const button=document.createElement('button');
  button.type='button';
  button.className='secondary';
  button.dataset.colorTarget=key;
  button.textContent=label;
  button.onclick=()=>{
   target=key;
   syncColor();
  };
  targets.append(button);
 }
 const wheel=document.createElement('div');
 wheel.className='background-wheel';
 wheel.setAttribute('aria-hidden','true');
 const exact=document.createElement('input');
 exact.type='color';
 exact.setAttribute('aria-label','Ajustar color exacto y luminosidad');
 const reset=document.createElement('button');
 reset.type='button';
 reset.className='secondary';
 reset.textContent='Restablecer este color';
 const customControls=document.createElement('div');
 customControls.className='background-color-controls';
 const hexRow=document.createElement('div');
 hexRow.className='background-hex';
 const hex=document.createElement('input');
 hex.type='text';
 hex.maxLength=7;
 hex.spellcheck=false;
 hex.setAttribute('aria-label','Código HEX del color');
 hex.oninput=()=>{
  if(/^#[0-9a-f]{6}$/i.test(hex.value.trim())){
   exact.value=hex.value.trim();
   exact.oninput();
  }
 };
 hex.onchange=()=>syncColor();
 const copy=document.createElement('button');
 copy.type='button';
 copy.className='secondary';
 copy.textContent='Copiar';
 const copied=document.createElement('small');
 copied.setAttribute('role','status');
 copy.onclick=async()=>{
  try{
   await navigator.clipboard.writeText(exact.value.toUpperCase());
   copied.textContent='Código copiado';
  }catch{
   hex.focus();
   hex.select();
   copied.textContent='Código seleccionado para copiar';
  }
 };
 hexRow.append(hex,copy);
 const wheelRow=document.createElement('div');
 wheelRow.className='background-wheel-row';
 const brightness=document.createElement('input');
 brightness.type='range';
 brightness.min=0;
 brightness.max=100;
 brightness.step=0.1;
 brightness.setAttribute('aria-label','Luminosidad del color');
 brightness.title='Luminosidad';
 const saturationControl=brightness.cloneNode();
 saturationControl.setAttribute('aria-label','Saturación del color');
 saturationControl.title='Saturación';
 wheelRow.append(exact,wheel,brightness,saturationControl);
 customControls.append(targets,wheelRow,hexRow,copied,reset);
 dialog.append(customControls);
 let draft,hue=0,saturation=0;
 function syncColor(keepChannels=false){
  const property={customBackground:'--app-bg-color',textColor:'--ink',borderColor:'--card-edge'}[target];
  const preset=getComputedStyle(preview).getPropertyValue(property).trim();
  exact.value=draft[target]??(preset||customColorDefaults[target]);
  if(!keepChannels){
   const [red,green,blue]=exact.value.slice(1).match(/../g).map(part=>parseInt(part,16)/255);
   const max=Math.max(red,green,blue),min=Math.min(red,green,blue);
   const lightness=(max+min)/2,delta=max-min;
   saturation=delta?delta/(1-Math.abs(2*lightness-1)):0;
   hue=delta?(60*(max===red?(green-blue)/delta:max===green?2+(blue-red)/delta:4+(red-green)/delta)+360)%360:0;
   brightness.value=lightness*100;
  }
  saturationControl.value=saturation*100;
  saturationControl.style.setProperty('--saturated-color',`hsl(${hue} 100% ${brightness.value}%)`);
  saturationControl.style.setProperty('--neutral-color',`hsl(0 0% ${brightness.value}%)`);
  brightness.style.setProperty('--middle-color',`hsl(${hue} ${saturation*100}% 50%)`);
  hex.value=exact.value.toUpperCase();
  copied.textContent='';
  for(const button of targets.children)button.setAttribute('aria-pressed',String(button.dataset.colorTarget===target));
 }

 exact.oninput=()=>{
  draft[target]=exact.value;
  syncColor();
  updatePreview();
 };
 reset.onclick=()=>{
  draft[target]=null;
  updatePreview();
  syncColor();
 };
 function pickHue(event){
  const rect=wheel.getBoundingClientRect();
  const x=(event.clientX-rect.left)/rect.width-.5;
  const y=(event.clientY-rect.top)/rect.height-.5;
  hue=(Math.atan2(x,-y)*180/Math.PI+360)%360;
  saturation=Math.min(1,Math.hypot(x,y)*2);
  updateWheelColor();
 }
 function updateWheelColor(){
  const lightness=Number(brightness.value)/100;
  const channel=n=>{
   const k=(n+hue/30)%12;
   const intensity=saturation*Math.min(lightness,1-lightness);
   return Math.round(255*(lightness-intensity*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,'0');
  };
  draft[target]='#'+channel(0)+channel(8)+channel(4);
  syncColor(true);
  updatePreview();
 }
 brightness.oninput=updateWheelColor;
 saturationControl.oninput=()=>{
  saturation=Number(saturationControl.value)/100;
  updateWheelColor();
 };
 wheel.onpointerdown=event=>{
  wheel.setPointerCapture(event.pointerId);
  pickHue(event);
 };
 wheel.onpointermove=event=>{
  if(wheel.hasPointerCapture(event.pointerId))pickHue(event);
 };
 function updatePreview(){
  applyCustomColors(preview,draft);
  preview.dataset.bgColor=draft.color;
  preview.dataset.iconFamily=document.documentElement.dataset.iconFamily;
  preview.dataset.bgTexture=texture.value;
  const personal=texture.value!==backgroundPresetTextures[draft.color]
   ||Object.keys(customColorFields).some(key=>draft[key]!==null);
  themeButton.textContent='Tema · '+(personal?'Personal':backgroundColors[draft.color]);
  for(const option of themeOptions.children){
   option.setAttribute('aria-pressed',String(!personal&&option.dataset.bgColor===draft.color));
  }
 }
 texture.onchange=updatePreview;
 function selectTheme(preset){
  draft=backgroundPreference({color:preset,texture:backgroundPresetTextures[preset]});
  texture.value=draft.texture;
  updatePreview();
  syncColor();
 }
 const actions=document.createElement('div');
 actions.className='font-dialog-actions';
 const cancel=document.createElement('button');
 cancel.type='button';
 cancel.className='secondary';
 cancel.textContent='Cancelar';
 cancel.onclick=()=>dialog.close();
 const apply=document.createElement('button');
 apply.type='button';
 apply.textContent='Aplicar';
 const message=document.createElement('p');
 message.id='backgroundMessage';
 message.className='hint';
 message.setAttribute('role','status');
 picker.onclick=()=>{
  const saved=backgroundPreference(session?.user?.user_metadata?.app_background);
  draft=saved;
  target='customBackground';
  texture.value=saved.texture;
  updatePreview();
  syncColor();
  dialog.showModal();
 };
 apply.onclick=async()=>{
  const current=session;
  if(!current||savingIconFamily)return;
  const previous=current.user?.user_metadata?.app_background;
  const choice={...draft,texture:texture.value};
  dialog.close();
  savingIconFamily=true;
  picker.disabled=true;
  applyBackground(choice);
  message.textContent='Guardando fondo…';
  try{
   const {data:result,error}=await db.auth.updateUser({data:{app_background:choice}});
   if(error)throw error;
   if(session===current){
    current.user=result.user;
    message.textContent='Fondo guardado en tu cuenta.';
   }
  }catch(error){
   if(session===current){
    applyBackground(previous);
    message.textContent='No se pudo guardar el fondo: '+error.message;
   }
  }finally{
   savingIconFamily=false;
   picker.disabled=false;
  }
 };
 actions.append(cancel,apply);
 dialog.prepend(title,preview);
 dialog.append(actions);
 section.append(picker,dialog,message);
 panel.append(section);
}
function mountTypography(panel){
 const group=document.createElement('fieldset');
 group.id='typographyOptions';
 group.className='typography-options';
 const title=document.createElement('legend');
 title.textContent='Tipografía de categorías y alimentos';
 group.append(title);
 const font=document.createElement('input');
 font.type='hidden';
 font.id='text-font';
 const picker=document.createElement('button');
 picker.type='button';
 picker.id='fontPicker';
 picker.setAttribute('aria-haspopup','dialog');
 const dialog=document.createElement('dialog');
 dialog.className='font-dialog';
 dialog.setAttribute('aria-labelledby','fontDialogTitle');
 const heading=document.createElement('h2');
 heading.id='fontDialogTitle';
 heading.textContent='Tipografía';
 const samples=document.createElement('div');
 samples.id='fontSamples';
 samples.className='font-samples';
 for(const [value,name] of Object.entries(typographyFields[0].options)){
  const button=document.createElement('button');
  button.type='button';
  button.dataset.textfont=value;
  const sample=document.createElement('span');
  sample.className='font-sample';
  sample.textContent='Arroz';
  sample.setAttribute('aria-hidden','true');
  button.append(sample,name);
  button.onclick=()=>{
   draftFont=value;
   updatePreview();
  };
  samples.append(button);
 }
 let draftFont;
 const sliders=[];
 for(const {key,label,options} of typographyFields.slice(1)){
  const field=document.createElement('label');
  field.className='font-slider';
  const caption=document.createElement('span');
  const range=document.createElement('input');
  const values=Object.keys(options);
  range.type='range';
  range.min=0;
  range.max=values.length-1;
  range.step=1;
  range.oninput=updatePreview;
  const hidden=document.createElement('input');
  hidden.type='hidden';
  hidden.id='text-'+key;
  group.append(hidden);
  field.append(caption,range);
  sliders.push({key,label,options,values,range,caption,field,hidden});
 }
 function updatePreview(){
  for(const button of samples.children){
   button.setAttribute('aria-pressed',String(button.dataset.textfont===draftFont));
  }
  for(const {key,label,options,values,range,caption} of sliders){
   const value=values[range.value];
   caption.textContent=label+' · '+options[value];
   range.setAttribute('aria-valuetext',options[value]);
   dialog.dataset['sample'+key]=value;
  }
 }
 const close=document.createElement('button');
 close.type='button';
 close.className='secondary';
 close.textContent='Cancelar';
 close.onclick=()=>dialog.close();
 const apply=document.createElement('button');
 apply.type='button';
 apply.textContent='Aplicar';
 apply.onclick=()=>{
  font.value=draftFont;
  for(const {hidden,values,range} of sliders)hidden.value=values[range.value];
  dialog.close();
  saveTypography();
 };
 picker.onclick=()=>{
  draftFont=font.value;
  for(const {hidden,range,values} of sliders)range.value=values.indexOf(hidden.value);
  updatePreview();
  dialog.showModal();
 };
 const actions=document.createElement('div');
 actions.className='font-dialog-actions';
 actions.append(close,apply);
 dialog.append(heading,samples,...sliders.map(slider=>slider.field),actions);
 group.append(font,picker,dialog);
 const message=document.createElement('p');
 message.id='typographyMessage';
 message.className='hint';
 message.setAttribute('role','status');
 group.append(message);
 panel.append(group);
}
async function saveTypography(){
 const current=session;
 const key=usesVintageHome()?'vintage_list_typography':'list_typography';
 const previous=current?.user?.user_metadata?.[key]??(usesVintageHome()?vintageTypography:undefined);
 if(!current||savingIconFamily){
  applyTypography(previous);
  return;
 }
 const choice=Object.fromEntries(typographyFields.map(({key})=>[key,$('text-'+key).value]));
 const group=$('typographyOptions');
 const message=$('typographyMessage');
 savingIconFamily=true;
 group.disabled=true;
 message.textContent='Guardando tipografía…';
 applyTypography(choice);
 try{
  const {data:result,error}=await db.auth.updateUser({data:{[key]:choice}});
  if(error)throw error;
  if(session===current){
   current.user=result.user;
   message.textContent='Tipografía guardada en tu cuenta.';
  }
 }catch(error){
  if(session===current){
   applyTypography(previous);
   message.textContent='No se pudo guardar la tipografía: '+error.message;
  }
 }finally{
  savingIconFamily=false;
  group.disabled=false;
 }
}
function applyPantryIconSize(value){
 const size=value==='medianos'?'medianos':'grandes';
 document.documentElement.dataset.pantryIconSize=size;
 const select=$('pantryIconSize');
 select.value=size;
 select.options[0].textContent=usesVintageHome()?'Grandes':'Grandes · sobresalen de la tarjeta';
}
async function savePantryIconSize(size){
 const current=session;
 const key=usesVintageHome()?'vintage_pantry_icon_size':'pantry_icon_size';
 const previous=document.documentElement.dataset.pantryIconSize;
 if(!current||savingIconFamily||size===previous){
  applyPantryIconSize(previous);
  return;
 }
 savingIconFamily=true;
 const select=$('pantryIconSize');
 const message=$('iconMessage');
 select.disabled=true;
 applyPantryIconSize(size);
 message.textContent='Guardando tamaño…';
 try{
  const {data:result,error}=await db.auth.updateUser({data:{[key]:size}});
  if(error)throw error;
  if(session===current){
   current.user=result.user;
   message.textContent='Tamaño guardado en tu cuenta.';
  }
 }catch(error){
  if(session===current){
   applyPantryIconSize(previous);
   message.textContent='No se pudo guardar el tamaño: '+error.message;
  }
 }finally{
  savingIconFamily=false;
  select.disabled=false;
 }
}
async function saveIconFamily(value,forAdmin=false){
 if(!forAdmin&&usesVintageHome())return;
 const current=session;
 const previous=document.documentElement.dataset.iconFamily;
 const previousAdmin=$('adminPanel').dataset.adminIconFamily;
 if(!current||savingIconFamily||value===(forAdmin?previousAdmin:previous)){
  applyIconFamily(previous,previousAdmin);
  return;
 }
 const family=forAdmin?previous:value;
 const adminFamily=forAdmin?value:previousAdmin;
 savingIconFamily=true;
 const options=$('iconOptions');
 const message=$('iconMessage');
 options.setAttribute('aria-busy','true');
 message.textContent='Guardando preferencia…';
 applyIconFamily(family,adminFamily);
 try{
  const {data:result,error}=await db.auth.updateUser({data:forAdmin?{admin_icon_family:adminFamily}:{icon_family:family}});
  if(error)throw error;
  if(session===current){
   current.user=result.user;
   message.textContent='Familia guardada en tu cuenta.';
  }
 }catch(error){
  if(session===current){
   applyIconFamily(previous,previousAdmin);
   message.textContent='No se pudo guardar la familia: '+error.message;
  }
 }finally{
  savingIconFamily=false;
  options.setAttribute('aria-busy','false');
 }
}
function mountIconOptions(panel){
 const title=document.createElement('h2');
 title.textContent='Iconos de categorías';
 const options=document.createElement('div');
 options.id='iconOptions';
 options.className='style-options';
 options.setAttribute('role','group');
 options.setAttribute('aria-label','Familia de iconos');
 for(const family of iconFamilies){
  const button=document.createElement('button');
  button.type='button';
  button.className='style-option';
  button.dataset.family=family.id;
  const preview=document.createElement('span');
  preview.className='icon-preview';
  preview.append(iconSprite(0),iconSprite(6),iconSprite(11));
  const name=document.createElement('strong');
  name.textContent=family.name;
  const state=document.createElement('span');
  state.className='style-state';
  button.append(name,preview,state);
  button.onclick=()=>saveIconFamily(family.id);
  const card=document.createElement('div');
  card.className='icon-family-card';
  const label=document.createElement('label');
  const check=document.createElement('input');
  check.type='checkbox';
  check.value=family.id;
  check.setAttribute('aria-label','Usar '+family.name.toLowerCase()+' en Administración');
  check.onchange=()=>saveIconFamily(check.checked?family.id:'',true);
  label.append(check,' Usar en Administración');
  card.append(button,label);
  options.append(card);
 }
 const message=document.createElement('p');
 message.id='iconMessage';
 message.className='hint';
 message.setAttribute('role','status');
 panel.append(title,options,message);
}

let pantryCategoryByName=new Map(),categoryMutation=false,refreshVersion=0;
const pantryCategories=()=>[...new Set([...pantryCategoryByName.keys(),...data.map(x=>x.category)])];
const categoryIdentity=name=>folded(bareCategory(name)).trim();
function findPantryCategory(key){
 return pantryCategoryByName.get(key)??[...pantryCategoryByName.values()].find(
  category=>category.id===key||category.nombres_anteriores.includes(key)
 );
}
function categoryExists(name,except){
 return pantryCategories().some(c=>c!==except&&categoryIdentity(c)===categoryIdentity(name));
}
async function ensurePantryCategory(name, pantryId){
 if(findPantryCategory(name))return;
 const {error}=await db.from('categorias_despensa').insert({nombre:name,icono:suggestedCategoryIcon(name),despensa_id:pantryId});
 if(!error)return;
 if(error.code==='23505'){
  const {data:existing}=await db.from('categorias_despensa').select('id').eq('despensa_id',pantryId).eq('nombre',name).maybeSingle();
  if(existing)return;
 }
 throw error;
}
async function createPantryCategory(name){
 name=name.trim();if(!name||!categoryIdentity(name)||!session||categoryMutation)return false;
 if(categoryExists(name)){adminMessage('Ya existe una categoría con ese nombre.');return false;}
 categoryMutation=true;
 try{
  const {error}=await db.from('categorias_despensa').insert({nombre:name,icono:suggestedCategoryIcon(name),despensa_id:activePantry.id});
  if(error)throw error;
  adminOpenCategories.food.add(name);await refresh();adminMessage('Categoría creada.');return true;
 }catch(error){adminMessage('No se pudo crear la categoría: '+error.message);return false;}
 finally{categoryMutation=false;}
}
async function renamePantryCategory(category,name,icon){
 name=name.trim();
 const current=pantryCategoryByName.get(category);
 if(!name||!categoryIdentity(name)||!current||!session||categoryMutation)return;
 if(categoryIdentity(name)===categoryIdentity(category)&&name===bareCategory(category))name=category;
 if(name===category&&icon===current.icono)return;
 if(categoryExists(name,category)){adminMessage('Ya existe una categoría con ese nombre.');return;}
 categoryMutation=true;
 try{
  const changes={};
  if(name!==category)changes.nombre=name;
  if(icon!==current.icono)changes.icono=icon;
  const {error}=await db.from('categorias_despensa').update(changes).eq('id',current.id).eq('despensa_id',activePantry.id);
  if(error)throw error;
  if(adminOpenCategories.food.delete(category))adminOpenCategories.food.add(name);
  if(openCategories.delete(category))openCategories.add(name);
  if(categoryFoodDrafts.has(category)){categoryFoodDrafts.set(name,categoryFoodDrafts.get(category));categoryFoodDrafts.delete(category);}
  await refresh();adminMessage('Categoría guardada.');
 }catch(error){adminMessage('No se pudo guardar la categoría: '+error.message);}
 finally{categoryMutation=false;}
}
async function deletePantryCategory(category){
 const current=pantryCategoryByName.get(category);
 if(!current||!session||categoryMutation)return;
 if(data.some(x=>x.category===category)){const message='La categoría aún contiene alimentos. Para borrarla, primero debes eliminar todos sus alimentos.';adminMessage(message);alert(message);return;}
 if(!confirm('¿Eliminar la categoría «'+bareCategory(category)+'»?'))return;
 categoryMutation=true;
 try{
  const {error}=await db.from('categorias_despensa').delete().eq('id',current.id).eq('despensa_id',activePantry.id);
  if(error)throw error;
  adminOpenCategories.food.delete(category);openCategories.delete(category);categoryFoodDrafts.delete(category);
  await refresh();adminMessage('Categoría eliminada.');
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
  const currentIcon=pantryCategoryByName.get(category)?.icono??suggestedCategoryIcon(category);
  const icon=document.createElement('select');icon.setAttribute('aria-label','Icono de la categoría');
  const choices=new Set([currentIcon,...iconSlots,...categoryEmojis.map(([,emoji])=>emoji),'🧺']);
  for(const emoji of choices){
   const label=emoji==='🐟'?'Pescados y mariscos':emoji==='🧺'?'Genérico':emoji;
   icon.add(new Option(label===emoji?emoji:emoji+' '+label,emoji));
  }
  icon.value=currentIcon;
  const save=document.createElement('button');save.type='submit';save.textContent='Guardar categoría';
  form.append(input,icon,save);holder.append(form);input.focus();
  form.onsubmit=async event=>{event.preventDefault();save.disabled=true;await renamePantryCategory(category,input.value,icon.value);save.disabled=false;};
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
const weatherRefreshMs=15*60*1000;
const playaHondaWeather='https://api.open-meteo.com/v1/forecast?latitude=37.63237&longitude=-0.73530&current=temperature_2m,relative_humidity_2m&timezone=Europe%2FMadrid';
let weatherPending=false,lastWeatherAttempt=0,lastWeatherTime='';
const weatherFormat=new Intl.NumberFormat('es-ES',{maximumFractionDigits:1});
function setWeatherGauge(id,value,unit,min,max){
 const gauge=$(id);
 gauge.querySelector('strong').textContent=weatherFormat.format(value)+' '+unit;
 const fraction=Math.max(0,Math.min(1,(value-min)/(max-min)));
 gauge.style.setProperty('--needle',(fraction*240-120)+'deg');
 gauge.dataset.reading='';
}
async function refreshWeather(){
 if($('weatherStation').hidden||document.hidden||weatherPending||
    Date.now()-lastWeatherAttempt<weatherRefreshMs)return;
 weatherPending=true;lastWeatherAttempt=Date.now();
 try{
  const response=await fetch(playaHondaWeather,{signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error('Open-Meteo '+response.status);
  const {current}=await response.json();
  const temperature=current?.temperature_2m,humidity=current?.relative_humidity_2m;
  const time=current?.time?.match(/T([0-2][0-9]:[0-5][0-9])$/)?.[1];
  if(!Number.isFinite(temperature)||!Number.isFinite(humidity)||humidity<0||humidity>100||!time){
   throw new Error('Lecturas incompletas');
  }
  setWeatherGauge('weatherTemperature',temperature,'°C',-10,50);
  setWeatherGauge('weatherHumidity',humidity,'%',0,100);
  lastWeatherTime=time;
  $('weatherStatus').textContent=time+' · estimación';
 }catch{
  $('weatherStatus').textContent=lastWeatherTime?'Sin actualizar · '+lastWeatherTime:'Sin datos';
  lastWeatherAttempt=Date.now()-weatherRefreshMs+60000;
 }finally{weatherPending=false;}
}
function syncWeatherStation(){
 const items=$('items');
 $('weatherStation').hidden=items.hidden||items.dataset.home!=='nevera-vintage';
 if(!$('weatherStation').hidden)refreshWeather();
}
setInterval(refreshWeather,60000);
document.addEventListener('visibilitychange',refreshWeather);

const alternateHomes=['nevera-vintage'];
const vintageTypography={font:'serif',size:'mediano',weight:'normal'};
function usesVintageHome(){
 return $('items').dataset.home==='nevera-vintage';
}
function applyAlternateHome(value){
 const home=alternateHomes.includes(value)?value:'';
 $('items').dataset.home=home;
 const toolbar=$('toolbar');
 $('search').placeholder=home==='nevera-vintage'?'Buscar alimentos…':'🔎 Buscar alimentos…';
 if(home==='nevera-vintage')$('fridgeControls').append(toolbar);
 else $('items').before(toolbar);
 $('alternateHome').checked=!!home;
 const preferences=session?.user?.user_metadata;
 const vintage=usesVintageHome();
 applyTypography(vintage?(preferences?.vintage_list_typography??vintageTypography):preferences?.list_typography);
 applyPantryIconSize(vintage?preferences?.vintage_pantry_icon_size:preferences?.pantry_icon_size);
 applyIconFamily(preferences?.icon_family,preferences?.admin_icon_family);
 syncWeatherStation();
}
$('alternateHome').onchange=async event=>{
 const checkbox=event.currentTarget;
 const current=session;
 if(!current)return;
 const home=checkbox.checked?alternateHomes[0]:null;
 const message=$('alternateHomeMessage');
 checkbox.disabled=true;
 message.textContent='Guardando página de inicio…';
 try{
  const {data:result,error}=await db.auth.updateUser({data:{alternate_home:home}});
  if(error)throw error;
  if(session!==current)return;
  current.user=result.user;
  applyAlternateHome(result.user.user_metadata?.alternate_home);
  message.textContent='Página de inicio guardada en tu cuenta.';
 }catch(error){
  if(session!==current)return;
  applyAlternateHome(current.user.user_metadata?.alternate_home);
  message.textContent='No se pudo guardar la página de inicio: '+error.message;
 }finally{
  checkbox.disabled=false;
 }
};
function showApp(visible){
 if(!visible)adminMode=false;
 $('pantryFooter').hidden=!visible;
 switchPantry.hidden=!visible||(!adminMode&&availablePantries.length<2);
 const adminToggle=$('adminToggle');
 adminToggle.setAttribute('aria-label',adminMode?'Volver a despensa':'Administrar');
 adminToggle.innerHTML=adminMode?'← Volver a despensa':'<span aria-hidden="true">&#9881;&#65038;</span>';
 $('adminPanel').hidden=!visible||!adminMode;
 for(const id of ['stats','toolbar','items'])$(id).hidden=!visible||adminMode;
 syncWeatherStation();
 $('auth').hidden=visible;
 $('loginForm').hidden=visible;
 $('status').hidden=visible;
 if(!visible)$('migration').hidden=true;
}
function render(){
 const q=folded($('search').value.trim());
 $('total').textContent=data.length;
 $('have').textContent=data.filter(x=>x.have).length;
 $('missing').textContent=data.filter(x=>!x.have).length;
 const shown=data.filter(x=>folded(x.name).includes(q));
 const main=$('categoryList');main.replaceChildren();
 if(!shown.length){const p=document.createElement('p');p.className='empty';p.textContent='No hay alimentos con este filtro.';main.append(p);}
 for(const category of orderedCategories(pantryCategories())){
  const rows=shown.filter(x=>x.category===category).sort((a,b)=>esCompare(a.name,b.name));
  if(!rows.length&&(q||filter!=='all'))continue;
  const details=document.createElement('details');details.className='category';details.open=openCategories.has(category)||!!q;
  if(!q)details.addEventListener('toggle',()=>{
   if(details.open)openCategories.add(category);
   else openCategories.delete(category);
  });
  details.append(categoryHeader(category,`${rows.filter(x=>x.have).length}/${rows.length}`,pantryCategoryByName.get(category)?.icono));
  details.append(categoryAddFoodForm(category,false));
  for(const x of rows){
   const row=document.createElement('div');row.className='item'+(x.have?' done':'');
   const check=document.createElement('input');check.type='checkbox';check.checked=x.have;check.disabled=busy;
   check.setAttribute('aria-label','Tengo '+x.name);
   check.onchange=async()=>{
    check.disabled=true;
    const {error}=await db.from('alimentos').update({disponible:check.checked}).eq('id',x.id).eq('despensa_id',activePantry.id);
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
 if(!session||!activePantry)return;
 const pantryId=activePantry.id;
 const version=++refreshVersion;
 const [food,categories]=await Promise.all([
  db.from('alimentos').select('id,nombre,categoria,categoria_id,disponible').eq('despensa_id',pantryId).order('creado_en',{ascending:true}),
  db.from('categorias_despensa').select('id,nombre,icono,nombres_anteriores').eq('despensa_id',pantryId).order('id')
 ]);
 if(version!==refreshVersion||!session)return;
 const {data:rows}=food,error=food.error??categories.error;
 if(error){setStatus('Sin conexión o sin permisos: '+error.message);$('auth').hidden=false;$('status').hidden=false;return;}
 const nextCategories=new Map(categories.data.map(row=>[row.nombre,row]));
 const namesById=new Map(categories.data.map(row=>[row.id,row.nombre]));
 const next=rows.map(x=>({id:x.id,name:x.nombre,category:namesById.get(x.categoria_id)??x.categoria,have:!!x.disponible}));
 const changed=JSON.stringify(next)!==JSON.stringify(data)||
  JSON.stringify([...nextCategories.values()])!==JSON.stringify([...pantryCategoryByName.values()]);
 pantryCategoryByName=nextCategories;
 data=next;if(changed)render();
 setStatus('☁️ Lista compartida · '+data.length+' alimentos · Sincronizada');
 $('migration').hidden=data.length!==0||pantrySystemKey(activePantry)!=='playa';
 $('auth').hidden=$('migration').hidden;
 $('status').hidden=$('migration').hidden;
}
let activePantry=null, availablePantries=[];
const pantryChooser=document.createElement('section');
pantryChooser.hidden=true;
pantryChooser.setAttribute('aria-label','Elige tu despensa');
$('auth').before(pantryChooser);
const switchPantry=document.createElement('button');
switchPantry.type='button';
switchPantry.hidden=true;
$('adminPanel').before(switchPantry);
const pantryStyle=document.createElement('style');
pantryChooser.className='pantry-chooser';
switchPantry.className='pantry-switch';
pantryStyle.textContent=`
body:has(.pantry-chooser:not([hidden])) { background:#071c32 url('textura-azul.svg'); }
.pantry-chooser { color:#fff1ce; font-family:Georgia,serif; padding-bottom:18px }
.pantry-chooser h2 { text-align:center; font-size:clamp(24px,6vw,36px); outline:none }
.pantry-chooser .pantry-create { display:block; width:auto; margin:18px auto 0 }
.pantry-create-dialog { width:min(440px, calc(100% - 28px)); max-height:calc(100dvh - 32px); overflow:auto; padding:18px; border:1px solid #76a4c1; border-radius:18px; background:#0b2940 url('textura-azul.svg'); color:#fff1ce }
.pantry-create-dialog::backdrop { background:#03101cba }
.pantry-load-defaults { margin-top:12px }
.pantry-create-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:14px }
.pantry-chooser .pantry-create-actions button { display:block; width:auto; margin:0 }
.pantry-icon-options { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; border:1px solid #76a4c1; border-radius:12px; padding:8px }
.pantry-icon-options label { display:grid; justify-items:center; align-content:center; gap:4px; min-height:96px; text-align:center; border:1px solid transparent; border-radius:8px; padding:4px; cursor:pointer }
.pantry-icon-options label:has(:disabled) { opacity:.55; cursor:default }
.pantry-icon-options label:has(:checked) { border-color:#ffdda2; background:#133950 }
.pantry-icon-options input { width:16px; height:16px; min-height:0; margin:0 }
.pantry-icon-options img { width:74px; height:64px; object-fit:contain }
.pantry-chooser button { display:grid; grid-template-columns:minmax(84px,34%) 1fr auto; gap:12px; align-items:center; width:100%; margin-bottom:14px; padding:9px 13px; background:#0b2940; color:#fff1ce; border:1px solid #76a4c1; border-radius:18px; text-align:left }
.pantry-chooser img { display:block; width:100%; border-radius:8px }
.pantry-chooser strong { font:700 clamp(18px,5vw,28px) Georgia,serif; overflow-wrap:anywhere }
.pantry-chooser small { display:block; color:#c4d9e6; margin-top:4px }
.pantry-switch { display:block; margin:0 auto 14px; padding:7px 12px; background:#0b2940; font-size:13px }
.pantry-switch[hidden], .pantry-chooser[hidden] { display:none }
`;
document.head.append(pantryStyle);
const pantryArt={playa:'data:image/webp;base64,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',casa:'data:image/webp;base64,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'};
const pantryIcons=[
 ['playa','Casa de playa',pantryArt.playa],
 ['casa','Casa principal',pantryArt.casa],
 ['campo','Casa de campo','data:image/webp;base64,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'],
 ['camper','Camper','data:image/webp;base64,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'],
 ['autocaravana','Autocaravana','data:image/webp;base64,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'],
 ['mochila','Mochila','data:image/webp;base64,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']
];
function pantrySystemKey(pantry){
 return pantry?.clave_sistema??(pantry?.nombre==='Playa Honda'?'playa':pantry?.nombre==='Casa principal'?'principal':null);
}
function pantryOrderKey(pantry){
 return pantrySystemKey(pantry)==='playa'?'category_order':'category_order_'+pantry.id;
}
function pantryReloadSelection(pantryId){
 const userId=session?.user?.id;
 if(!userId)return null;
 const key='hondadespensa:recarga:'+userId;
 try{
  if(pantryId===undefined)return sessionStorage.getItem(key);
  if(pantryId===null)sessionStorage.removeItem(key);
  else sessionStorage.setItem(key,pantryId);
 }catch{
  // The selector still works when browser storage is blocked.
 }
 return null;
}
function choosePantry(){
 pantryReloadSelection(null);
 activePantry=null;
 refreshVersion++;
 showApp(false);
 $('auth').hidden=true;
 switchPantry.hidden=true;
 pantryChooser.hidden=false;
 const heading=document.createElement('h2');
 heading.textContent='Elige tu despensa';
 heading.tabIndex=-1;
 pantryChooser.replaceChildren(heading);
 for(const pantry of availablePantries){
  const card=document.createElement('button');
  card.type='button';
  card.innerHTML='<img alt=""><span><strong></strong><small></small></span><span aria-hidden="true">›</span>';
  const beach=pantrySystemKey(pantry)==='playa';
  card.querySelector('img').src=pantryIcons.find(([key])=>key===pantry.icono)?.[2]??(beach?pantryArt.playa:pantryArt.casa);
  card.querySelector('strong').textContent=pantry.nombre;
  card.querySelector('small').textContent=(pantry.compartida??beach)?'Compartida':'Personal';
  card.onclick=()=>openPantry(pantry);
  pantryChooser.append(card);
 }
 const create=document.createElement('button');
 create.type='button';
 create.className='pantry-create';
 create.textContent='+ Crear despensa';
 const form=document.createElement('form');
 form.className='pantry-create-form';
 const dialog=document.createElement('dialog');
 dialog.className='pantry-create-dialog';
 dialog.setAttribute('aria-labelledby','pantry-create-title');
 form.innerHTML='<h2 id="pantry-create-title">Crear despensa</h2><fieldset class="pantry-icon-options"><legend>Tipo de despensa</legend></fieldset><label class="alternate-home-setting pantry-load-defaults"><input type="checkbox" name="loadDefaults"> Cargar alimentos por defecto</label><div class="pantry-create-actions"><button type="button" data-cancel>Cancelar</button><button type="submit">Crear</button></div><p class="hint" role="status"></p>';
 const iconOptions=form.querySelector('fieldset');
 for(const [key,title,src] of pantryIcons){
  const label=document.createElement('label');
  const radio=document.createElement('input');
  radio.type='radio';
  radio.name='pantryIcon';
  radio.value=key;
  radio.required=true;
  radio.disabled=key==='casa'||availablePantries.some(pantry=>
   (key==='playa'&&pantrySystemKey(pantry)==='playa')||
   folded(pantry.nombre)===folded(title)
  );
  const image=document.createElement('img');
  image.src=src;
  image.alt='';
  label.append(radio,image,title);
  iconOptions.append(label);
 }
 const submit=form.querySelector('[type="submit"]');
 const cancel=form.querySelector('[data-cancel]');
 const status=form.querySelector('[role="status"]');
 dialog.append(form);
 create.onclick=()=>dialog.showModal();
 cancel.onclick=()=>{if(!submit.disabled)dialog.close();};
 dialog.addEventListener('cancel',event=>{if(submit.disabled)event.preventDefault();});
 form.onsubmit=async event=>{
  event.preventDefault();
  const icono=form.elements.pantryIcon.value;
  const option=pantryIcons.find(([key])=>key===icono);
  if(!option||submit.disabled)return;
  const nombre=option[1];
  const current=session;
  submit.disabled=true;
  status.textContent='Creando despensa…';
  const loadDefaults=form.elements.loadDefaults.checked;
  const {data:id,error}=await db.rpc('crear_despensa_personal',loadDefaults
   ?{p_nombre:nombre,p_icono:icono,p_cargar_catalogo:true}
   :{p_nombre:nombre,p_icono:icono});
  if(session!==current)return;
  submit.disabled=false;
  if(error){status.textContent='No se pudo crear la despensa: '+error.message;return;}
  const pantry={id,nombre,icono};
  availablePantries.push(pantry);
  dialog.close();
  await openPantry(pantry);
 };
 pantryChooser.append(create,dialog);
 heading.focus();
}
async function openPantry(pantry){
 activePantry=pantry;
 pantryReloadSelection(pantry.id);
 refreshVersion++;
 data=[];
 pantryCategoryByName=new Map();
 openCategories.clear();
 adminOpenCategories.food.clear();
 categoryFoodDrafts.clear();
 recentAdminFoods.clear();
 $('search').value='';
 $('adminFoodSearch').value='';
 categoryOrder=readCategoryOrder(session.user.user_metadata?.[pantryOrderKey(pantry)]);
 pantryChooser.hidden=true;
 switchPantry.hidden=availablePantries.length<2;
 switchPantry.textContent=pantry.nombre+' · Cambiar de despensa';
 showApp(true);
 render();
 await refresh();
}
switchPantry.onclick=choosePantry;

const sharingSection=document.createElement('section');
sharingSection.hidden=true;
sharingSection.className='admin-section';
sharingSection.innerHTML='<h2>Compartir despensa</h2><label class="alternate-home-setting"><input type="checkbox"> Compartir con Gema</label><p class="hint" role="status"></p>';
$('adminPanel').prepend(sharingSection);
const shareWithGema=sharingSection.querySelector('input');
const sharingStatus=sharingSection.querySelector('[role="status"]');
let sharingRequest=0;
let sharedWithGema=false;

async function refreshPantrySharing(enabled=null){
 const request=++sharingRequest;
 const pantry=activePantry;
 sharingSection.hidden=!adminMode||!pantry||
  session?.user?.id!=='d0f8ab40-f2ea-43e5-9bd0-d7cebdd1fa59';
 if(sharingSection.hidden)return;
 shareWithGema.checked=!!pantry.compartida;
 shareWithGema.disabled=true;
 sharingStatus.textContent=enabled===null?'Comprobando acceso…':'Guardando acceso…';
 const {data:shared,error}=await db.rpc('casa_principal_compartir_con_gema',{
  p_despensa_id:pantry.id,p_compartir:enabled
 });
 if(request!==sharingRequest||activePantry!==pantry)return;
 if(!error){sharedWithGema=shared;pantry.compartida=shared;}
 shareWithGema.checked=sharedWithGema;
 shareWithGema.disabled=!!error&&enabled===null;
 sharingStatus.textContent=error
  ? 'No se pudo consultar o guardar el acceso. Comprueba la configuración en Supabase.'
  : shared?'Gema tiene acceso a esta despensa.':'Esta despensa es privada.';
}
shareWithGema.onchange=()=>refreshPantrySharing(shareWithGema.checked);

const deletePantrySection=document.createElement('section');
deletePantrySection.className='admin-section';
deletePantrySection.hidden=true;
deletePantrySection.innerHTML='<h2>Despensa actual</h2><button type="button" data-rename>Editar nombre</button> <button type="button" class="danger" data-delete>Eliminar despensa</button><p class="hint" role="status"></p>';
sharingSection.after(deletePantrySection);
const deletePantryButton=deletePantrySection.querySelector('[data-delete]');
const renamePantryButton=deletePantrySection.querySelector('[data-rename]');
renamePantryButton.onclick=async()=>{
 const pantry=activePantry;
 if(!pantry||renamePantryButton.disabled)return;
 const nombre=prompt('Nuevo nombre de la despensa',pantry.nombre)?.trim();
 if(!nombre||nombre===pantry.nombre)return;
 renamePantryButton.disabled=true;
 const {data:saved,error}=await db.rpc('renombrar_despensa',{p_despensa_id:pantry.id,p_nombre:nombre});
 renamePantryButton.disabled=false;
 if(activePantry!==pantry)return;
 if(error){deletePantryStatus.textContent='No se pudo cambiar el nombre: '+error.message;return;}
 pantry.nombre=saved;
 availablePantries.sort((a,b)=>esCompare(a.nombre,b.nombre));
 switchPantry.textContent=saved+' · Cambiar de despensa';
 deletePantryStatus.textContent='Nombre guardado.';
};
const deletePantryStatus=deletePantrySection.querySelector('[role="status"]');
deletePantryButton.onclick=async()=>{
 const pantry=activePantry;
 const current=session;
 if(!pantry||!current||deletePantryButton.disabled)return;
 if(!confirm('¿Eliminar «'+pantry.nombre+'»? Se borrarán sus alimentos y categorías. Esta acción es definitiva.'))return;
 deletePantryButton.disabled=true;
 deletePantryStatus.textContent='Eliminando despensa…';
 const {error}=await db.rpc('eliminar_despensa_personal',{p_despensa_id:pantry.id});
 deletePantryButton.disabled=false;
 if(session!==current)return;
 if(error){
  deletePantryStatus.textContent='No se pudo eliminar: '+error.message;
  return;
 }
 await signedIn(current);
};

async function signedIn(currentSession,restorePantry=false){
 session=currentSession;
 activePantry=null;
 availablePantries=[];
 pantryChooser.hidden=true;
 switchPantry.hidden=true;
 recentAdminFoods.clear();
 applyAlternateHome(currentSession?.user?.user_metadata?.alternate_home);
 $('alternateHomeMessage').textContent='';
 applyViewStyle(currentSession?.user?.user_metadata?.view_style);
 $('iconMessage').textContent='';
 $('typographyMessage').textContent='';
 applyBackground(currentSession?.user?.user_metadata?.app_background);
 $('backgroundMessage').textContent='';
 categoryOrder=readCategoryOrder(currentSession?.user?.user_metadata?.category_order);
 refreshVersion++;
 pantryCategoryByName=new Map();
 data=[];
 showApp(false);
 $('loginForm').hidden=!!currentSession;
 if(channel){await db.removeChannel(channel);channel=null;}
 if(catalogChannel){await db.removeChannel(catalogChannel);catalogChannel=null;}
 if(!currentSession){setStatus('Inicia sesión con tu cuenta de HondaDespensa.');$('auth').hidden=false;$('status').hidden=false;$('loginForm').hidden=false;return;}
 const u=currentSession.user||{};
 $('accountName').textContent=u.user_metadata?.display_name||u.user_metadata?.full_name||u.email?.split('@')[0]||'Usuario';
 setStatus('Cargando despensas…');
 let {data:pantries,error}=await db.rpc('listar_mis_despensas');
 if(error?.code==='PGRST202'){
  ({data:pantries,error}=await db.from('despensas').select('*').order('nombre'));
 }
 if(session!==currentSession)return;
 if(error){
  setStatus('No se pudieron cargar las despensas: '+error.message);
  $('loginForm').hidden=false;
  return;
 }
 availablePantries=pantries;
 const selectedId=restorePantry?pantryReloadSelection():null;
 const selected=pantries.find(pantry=>pantry.id===selectedId);
 if(selected||pantries.length===1)await openPantry(selected??pantries[0]);
 else choosePantry();
 await loadCatalog();
 if(session!==currentSession)return;
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
 refreshPantrySharing();
 deletePantrySection.hidden=!adminMode||!activePantry;
 deletePantryButton.hidden=!!pantrySystemKey(activePantry)&&session?.user?.id!=='d0f8ab40-f2ea-43e5-9bd0-d7cebdd1fa59';
 renamePantryButton.hidden=!!pantrySystemKey(activePantry)&&session?.user?.id!=='d0f8ab40-f2ea-43e5-9bd0-d7cebdd1fa59';
 deletePantryStatus.textContent='';
 window.scrollTo({top:0,behavior:'smooth'});
};

$('upload').onclick=async()=>{
 if(busy||pantrySystemKey(activePantry)!=='playa')return;
 const pantryId=activePantry.id;
 const {count,error:countError}=await db.from('alimentos').select('id',{count:'exact',head:true}).eq('despensa_id',pantryId);
 if(countError){alert(countError.message);return;}
 if(count!==0){alert('La nube ya contiene alimentos. No se importará otra lista.');await refresh();return;}
 const local=localItems();
 if(!confirm(`Vas a subir ${local.length} alimentos desde ESTE móvil. Hazlo solo desde el móvil con la lista correcta. ¿Continuar?`))return;
 busy=true;$('upload').disabled=true;
 const rows=local.map(x=>({id:x.id,nombre:x.name,categoria:x.category,disponible:!!x.have,despensa_id:pantryId}));
 try{
  for(const category of new Set(local.map(item=>item.category)))await ensurePantryCategory(category,pantryId);
 }catch(error){alert('No se pudo preparar la importación: '+error.message);busy=false;$('upload').disabled=false;return;}
 for(let i=0;i<rows.length;i+=100){
  const {error}=await db.from('alimentos').insert(rows.slice(i,i+100));
  if(error){alert('Error al importar: '+error.message+'; algunos productos podrían haberse subido. No repitas la importación sin revisar la nube.');break;}
 }
 busy=false;$('upload').disabled=false;await refresh();
};

async function addSharedFood(name,category,recentFirst=false){
 if(!session||!activePantry)return false;
 const pantryId=activePantry.id;
 const existingCategory=findPantryCategory(category);
 category=existingCategory?.nombre??category;
 if(data.some(x=>folded(x.name)===folded(name)&&x.category===category)){alert('Ese alimento ya está en la lista.');return false;}
 try{await ensurePantryCategory(category,pantryId);}catch(error){alert('No se pudo preparar la categoría: '+error.message);return false;}
 const {error}=await db.from('alimentos').insert({nombre:name,categoria:category,categoria_id:existingCategory?.id,disponible:false,despensa_id:pantryId});
 if(error){alert('No se pudo añadir: '+error.message);return false;}
 if(activePantry?.id!==pantryId)return false;
 if(recentFirst)recentAdminFoods.set(adminFoodKey({name,category}),++recentAdminFoodSequence);
 await refresh();return true;
}
$('search').oninput=render;

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
let addingCatalogCategory=false;
async function addCatalogCategory(category,names){
 if(!activePantry||addingCatalogCategory)return;
 const pantryId=activePantry.id;
 const existing=findPantryCategory(category);
 const categoryName=existing?.nombre??category;
 addingCatalogCategory=true;
 try{
  await ensurePantryCategory(categoryName,pantryId);
  const {data:target,error:categoryError}=await db.from('categorias_despensa')
   .select('id,nombre').eq('despensa_id',pantryId).eq('nombre',categoryName).single();
  if(categoryError)throw categoryError;
  const {data:foods,error:foodError}=await db.from('alimentos')
   .select('nombre').eq('despensa_id',pantryId).eq('categoria_id',target.id);
  if(foodError)throw foodError;
  if(activePantry?.id!==pantryId)return;
  const seen=new Set(foods.map(food=>folded(food.nombre)));
  const rows=[];
  for(const name of names){
   const key=folded(name);
   if(seen.has(key))continue;
   seen.add(key);
   rows.push({nombre:name,categoria:target.nombre,categoria_id:target.id,disponible:false,despensa_id:pantryId});
  }
  if(rows.length){
   const {error}=await db.from('alimentos').insert(rows);
   if(error)throw error;
  }
  if(activePantry?.id!==pantryId)return;
  await refresh();
 }catch(error){
  if(activePantry?.id===pantryId)alert('No se pudo añadir la categoría: '+error.message);
 }finally{
  addingCatalogCategory=false;
  if(activePantry?.id===pantryId)renderCatalog();
 }
}
function renderCatalog(){
 const holder=$('catalogItems'),q=folded($('catalogSearch').value.trim());holder.replaceChildren();
 let remaining=0;
 const groups=catalogReady?Object.entries(catalogRows.reduce((acc,x)=>{(acc[x.categoria]??=[]).push(x.nombre);return acc;},{})):Object.entries(initial);
 for(const [category,names] of groups.sort((a,b)=>esCompare(a[0],b[0]))){
  const available=names.filter(name=>!data.some(x=>x.category===(findPantryCategory(category)?.nombre??category)&&folded(x.name)===folded(name))&&folded(name).includes(q));
  if(!available.length)continue;remaining+=available.length;
  const details=document.createElement('details');details.className='catalog-category';details.open=catalogOpen.has(category)||!!q;
  details.addEventListener('toggle',()=>{if(details.open)catalogOpen.add(category);else catalogOpen.delete(category)});
  const summary=document.createElement('summary');summary.textContent=bareCategory(category)+' · '+available.length;details.append(summary);
  const products=document.createElement('div');products.className='catalog-products';
  const addAll=document.createElement('button');
  addAll.type='button';
  addAll.textContent=q?'＋ Añadir todos de la categoría':'＋ Añadir todos';
  addAll.disabled=addingCatalogCategory;
  addAll.onclick=()=>{
   if(addingCatalogCategory)return;
   for(const button of holder.querySelectorAll('button'))button.disabled=true;
   addCatalogCategory(category,names);
  };
  products.append(addAll);
  for(const name of available){
   const button=document.createElement('button');button.type='button';button.textContent='＋ '+name;
   button.disabled=addingCatalogCategory;
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
  await refresh();if(type==='catalog')await loadCatalog();
  adminMessage('Alimento eliminado.');
 };
 return row;
}
const categoryFoodDrafts=new Map(),categoryFoodSaving=new Set();
function categoryAddFoodForm(category,inAdmin=true){
 const form=document.createElement('form');form.className='add category-add-food'+(inAdmin?'':' pantry-quick-add');
 form.style.cssText='padding:10px 12px;margin:0;border-top:1px solid #476581';
 form.setAttribute('aria-label','Añadir alimento en '+bareCategory(category));
 const input=document.createElement('input');input.type='text';input.required=true;input.maxLength=100;
 input.placeholder='Añadir a esta categoría';input.setAttribute('aria-label','Nombre del nuevo alimento en '+bareCategory(category));
 input.value=categoryFoodDrafts.get(category)||'';
 input.oninput=()=>categoryFoodDrafts.set(category,input.value);
 const button=document.createElement('button');button.type='submit';button.textContent=inAdmin?'＋ Añadir alimento':'Añadir';
 input.disabled=button.disabled=categoryFoodSaving.has(category);
 form.append(input,button);
 form.onsubmit=async event=>{
  event.preventDefault();const name=input.value.trim();
  if(!name||categoryFoodSaving.has(category))return;
  categoryFoodDrafts.set(category,input.value);categoryFoodSaving.add(category);
  input.disabled=button.disabled=true;button.textContent='Añadiendo…';
  try{
   if(await addSharedFood(name,category,inAdmin)){
    categoryFoodDrafts.delete(category);
    if(inAdmin)adminMessage('Alimento añadido en '+bareCategory(category)+'.');
   }
  }catch(error){
   const message='No se pudo añadir: '+error.message;
   if(inAdmin)adminMessage(message);else alert(message);
  }
  finally{
   categoryFoodSaving.delete(category);
   if(inAdmin){
    renderAdmin();
   const section=[...$('adminFoods').querySelectorAll('details.admin-category')].find(x=>x.dataset.category===category);
    section?.querySelector('.category-add-food input')?.focus();
   }else render();
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
  const header=categoryHeader(category,groups.get(category).length+' alimentos',type==='food'?pantryCategoryByName.get(category)?.icono:undefined);
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
const emptyCategoryHint=document.createElement('p');emptyCategoryHint.className='hint';
emptyCategoryHint.textContent='Las categorías vacías se conservan hasta que las elimines desde aquí.';
$('adminFoods').before(emptyCategoryHint);

const {data:authData,error:authError}=await db.auth.getSession();
if(authError)setStatus('Error de sesión: '+authError.message);
await signedIn(authData.session,performance.getEntriesByType('navigation')[0]?.type==='reload');
db.auth.onAuthStateChange((event,s)=>{
 if(event==='SIGNED_OUT'&&session)signedIn(null);
});
setInterval(()=>{if(session&&!document.hidden)refresh();},12000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&session)refresh();});
