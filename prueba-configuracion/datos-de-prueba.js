export function createClient(){
 const key='hondadespensa:prueba-configuracion:datos';
 const pantry={id:'demo-configuracion',nombre:'Despensa de ejemplo'};
 const defaultState={
  user:{id:'hondadespensa-demo-configuracion',user_metadata:{
   display_name:'Cuenta de prueba',alternate_home:'nevera-vintage',start_fridge_closed:true,fridge_notes_enabled:true
  }},
  despensas:[pantry],
  alimentos:[],
  categorias_despensa:[],
  catalogo:[]
 };
 function read(){
  try{return JSON.parse(localStorage.getItem(key))??structuredClone(defaultState);}
  catch{return structuredClone(defaultState);}
 }
 function write(state){localStorage.setItem(key,JSON.stringify(state));}
 const auth={
  async getSession(){return {data:{session:{user:read().user}}};},
  async updateUser({data}){
   const state=read();
   Object.assign(state.user.user_metadata,data);
   write(state);
   return {data:{user:state.user},error:null};
  },
  onAuthStateChange(){},
  async signOut(){return {error:{message:'La cuenta de prueba está siempre abierta.'}};}
 };
 return {
  auth,
  channel(){return {on(){return this;},subscribe(){return this;}};},
  async removeChannel(){},
  async rpc(name,params={}){
   const state=read();
   const pantries=state.despensas??=[pantry];
   if(name==='listar_mis_despensas')return {data:pantries,error:null};
   if(name==='crear_despensa_personal'){
    const id=crypto.randomUUID();
    const {p_nombre:nombre,p_icono:icono,p_cargar_catalogo:loadCatalog,p_frescos:fresh=[]}=params;
    pantries.push({id,nombre,icono});
    const categories=new Map();
    for(const food of [...(loadCatalog?state.catalogo:[]),...fresh]){
     if(!categories.has(food.categoria)){
      const categoryId=crypto.randomUUID();
      categories.set(food.categoria,categoryId);
      state.categorias_despensa.push({id:categoryId,nombre:food.categoria,icono:food.icono,nombres_anteriores:[],despensa_id:id});
     }
     state.alimentos.push({id:crypto.randomUUID(),nombre:food.nombre,categoria:food.categoria,
      categoria_id:categories.get(food.categoria),disponible:false,despensa_id:id});
    }
    write(state);
    return {data:id,error:null};
   }
   if(name==='casa_principal_compartir_con_gema')return {data:false,error:null};
   if(name==='proteccion_borrado_despensa')return {data:true,error:null};
   return {data:null,error:{message:'Disponible en la aplicación principal.'}};
  },
  from(table){
   const filters=[];
   let action='select',payload,one=false,ignoreDuplicates=false,sort,countOnly=false;
   const query={
    select(columns,options){countOnly=options?.head===true;return this;},
    eq(key,value){filters.push(row=>row[key]===value);return this;},
    in(key,values){filters.push(row=>values.includes(row[key]));return this;},
    order(key){sort=key;return this;},
    single(){one=true;return this;},
    maybeSingle(){one=true;return this;},
    insert(rows){action='insert';payload=rows;return this;},
    upsert(rows,options){action='insert';payload=rows;ignoreDuplicates=options?.ignoreDuplicates;return this;},
    update(changes){action='update';payload=changes;return this;},
    delete(){action='delete';return this;},
    then(resolve,reject){
     return Promise.resolve().then(()=>{
      const state=read();
      const rows=state[table];
      let matched=rows.filter(row=>filters.every(test=>test(row)));
      if(action==='insert'){
       matched=[];
       for(const row of [].concat(payload)){
        if(ignoreDuplicates&&rows.some(existing=>existing.id===row.id))continue;
        const record={id:crypto.randomUUID(),nombres_anteriores:[],creado_en:new Date().toISOString(),...row};
        rows.push(record);
        matched.push(record);
       }
      }
      if(action==='update')for(const row of matched)Object.assign(row,payload);
      if(action==='delete')state[table]=rows.filter(row=>!matched.includes(row));
      if(action!=='select')write(state);
      if(sort)matched.sort((left,right)=>String(left[sort]??'').localeCompare(String(right[sort]??''),'es'));
      return {data:one?matched[0]??null:matched,count:countOnly?matched.length:null,error:null};
     }).then(resolve,reject);
    }
   };
   return query;
  }
 };
}
