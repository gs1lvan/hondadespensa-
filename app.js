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
.pantry-chooser h2 { text-align:center; font-size:clamp(24px,6vw,36px) }
.pantry-chooser button { display:grid; grid-template-columns:minmax(70px,28%) 1fr auto; gap:12px; align-items:center; width:100%; margin-bottom:14px; padding:9px 13px; background:#0b2940; color:#fff1ce; border:1px solid #76a4c1; border-radius:18px; text-align:left }
.pantry-chooser img { display:block; width:100%; border-radius:8px }
.pantry-chooser strong { font:700 clamp(18px,5vw,28px) Georgia,serif; overflow-wrap:anywhere }
.pantry-chooser small { display:block; color:#c4d9e6; margin-top:4px }
.pantry-switch { display:block; margin:0 auto 14px; padding:7px 12px; background:#0b2940; font-size:13px }
.pantry-switch[hidden], .pantry-chooser[hidden] { display:none }
`;
document.head.append(pantryStyle);
const pantryArt={playa:'data:image/webp;base64,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',casa:'data:image/webp;base64,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'};
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
  card.querySelector('img').src=beach?pantryArt.playa:pantryArt.casa;
  card.querySelector('strong').textContent=pantry.nombre;
  card.querySelector('small').textContent=beach?'Compartida':'Personal';
  card.onclick=()=>openPantry(pantry);
  pantryChooser.append(card);
 }
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
 const {data:pantries,error}=await db.from('despensas').select('id,nombre').order('nombre');
 if(session!==currentSession)return;
 if(error||!pantries?.length){
  setStatus(error?'No se pudieron cargar las despensas: '+error.message:'Tu cuenta todavía no tiene una despensa asignada.');
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
