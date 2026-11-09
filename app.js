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
 const slot=iconSlots.indexOf(emoji);
 if(slot<0)box.textContent=emoji;
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
 $('migration').hidden=data.length!==0||activePantry.nombre!=='Playa Honda';
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
.pantry-chooser .pantry-create-form { max-width:360px; margin:14px auto }
.pantry-create-form input[name=pantryName] {
 display:block; width:100%; min-height:46px; margin:8px 0 16px; padding:10px 14px;
 border:1px solid #76a4c1; border-radius:13px; background:#0b2940; color:#fff1ce;
 font:400 16px/1.35 Georgia,serif; box-shadow:inset 0 2px 5px #05172788;
}
.pantry-create-form input[name=pantryName]::placeholder { color:#adc6d8 }
.pantry-create-form input[name=pantryName]:focus {
 outline:none; border-color:#e2c794; box-shadow:0 0 0 2px #e2c79466,inset 0 2px 5px #05172788;
}
.pantry-icon-options { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; border:1px solid #76a4c1; border-radius:12px; padding:8px }
.pantry-icon-options label { display:grid; justify-items:center; align-content:center; gap:4px; min-height:96px; text-align:center; border:1px solid transparent; border-radius:8px; padding:4px; cursor:pointer }
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
 ['autocaravana','Autocaravana','data:image/webp;base64,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']
];
function pantryOrderKey(pantry){
 return pantry.nombre==='Playa Honda'?'category_order':'category_order_'+pantry.id;
}
function choosePantry(){
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
  const beach=pantry.nombre==='Playa Honda';
  card.querySelector('img').src=pantryIcons.find(([key])=>key===pantry.icono)?.[2]??(beach?pantryArt.playa:pantryArt.casa);
  card.querySelector('strong').textContent=pantry.nombre;
  card.querySelector('small').textContent=beach?'Compartida':'Personal';
  card.onclick=()=>openPantry(pantry);
  pantryChooser.append(card);
 }
 const create=document.createElement('button');
 create.type='button';
 create.className='pantry-create';
 create.textContent='+ Crear despensa';
 const form=document.createElement('form');
 form.className='pantry-create-form';
 form.hidden=true;
 form.innerHTML='<label>Nombre de la despensa<input name="pantryName" placeholder="Ej. Casa de campo" maxlength="60" required></label><fieldset class="pantry-icon-options"><legend>Icono de la despensa</legend></fieldset><button class="pantry-create" type="submit">Crear</button><p class="hint" role="status"></p>';
 const iconOptions=form.querySelector('fieldset');
 for(const [key,title,src] of pantryIcons){
  const label=document.createElement('label');
  const radio=document.createElement('input');
  radio.type='radio';
  radio.name='pantryIcon';
  radio.value=key;
  radio.checked=key==='casa';
  const image=document.createElement('img');
  image.src=src;
  image.alt='';
  label.append(radio,image,title);
  iconOptions.append(label);
 }
 const input=form.elements.pantryName;
 const submit=form.querySelector('button');
 const status=form.querySelector('[role="status"]');
 create.onclick=()=>{
  form.hidden=!form.hidden;
  if(!form.hidden)input.focus();
 };
 form.onsubmit=async event=>{
  event.preventDefault();
  const nombre=input.value.trim();
  if(!nombre||submit.disabled)return;
  const current=session;
  submit.disabled=true;
  status.textContent='Creando despensa…';
  const icono=form.elements.pantryIcon.value;
  const {data:id,error}=await db.rpc('crear_despensa_personal',{p_nombre:nombre,p_icono:icono});
  if(session!==current)return;
  submit.disabled=false;
  if(error){status.textContent='No se pudo crear la despensa: '+error.message;return;}
  const pantry={id,nombre,icono};
  availablePantries.push(pantry);
  await openPantry(pantry);
 };
 pantryChooser.append(create,form);
 heading.focus();
}
async function openPantry(pantry){
 activePantry=pantry;
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
 sharingSection.hidden=!adminMode||pantry?.nombre!=='Casa principal'||
  session?.user?.id!=='d0f8ab40-f2ea-43e5-9bd0-d7cebdd1fa59';
 if(sharingSection.hidden)return;
 shareWithGema.disabled=true;
 sharingStatus.textContent=enabled===null?'Comprobando acceso…':'Guardando acceso…';
 const {data:shared,error}=await db.rpc('casa_principal_compartir_con_gema',{
  p_despensa_id:pantry.id,p_compartir:enabled
 });
 if(request!==sharingRequest||activePantry!==pantry)return;
 if(!error)sharedWithGema=shared;
 shareWithGema.checked=sharedWithGema;
 shareWithGema.disabled=!!error&&enabled===null;
 sharingStatus.textContent=error
  ? 'No se pudo consultar o guardar el acceso. Comprueba la configuración en Supabase.'
  : shared?'Gema tiene acceso a Casa principal.':'Casa principal es privada.';
}
shareWithGema.onchange=()=>refreshPantrySharing(shareWithGema.checked);

const deletePantrySection=document.createElement('section');
deletePantrySection.className='admin-section';
deletePantrySection.hidden=true;
deletePantrySection.innerHTML='<h2>Despensa actual</h2><button type="button" class="danger">Eliminar despensa</button><p class="hint" role="status"></p>';
sharingSection.after(deletePantrySection);
const deletePantryButton=deletePantrySection.querySelector('button');
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

async function signedIn(currentSession){
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
 const {data:pantries,error}=await db.from('despensas').select('*').order('nombre');
 if(session!==currentSession)return;
 if(error){
  setStatus('No se pudieron cargar las despensas: '+error.message);
  $('loginForm').hidden=false;
  return;
 }
 availablePantries=pantries;
 if(pantries.length===1)await openPantry(pantries[0]);
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
 deletePantrySection.hidden=!adminMode||!activePantry||activePantry.nombre==='Playa Honda';
 deletePantryStatus.textContent='';
 window.scrollTo({top:0,behavior:'smooth'});
};

$('upload').onclick=async()=>{
 if(busy||activePantry?.nombre!=='Playa Honda')return;
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
await signedIn(authData.session);
db.auth.onAuthStateChange((event,s)=>{
 if(event==='SIGNED_OUT'&&session)signedIn(null);
});
setInterval(()=>{if(session&&!document.hidden)refresh();},12000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&session)refresh();});
