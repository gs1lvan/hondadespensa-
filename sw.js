// HondaDespensa · recurso offline y actualización preferente de red.
const CACHE='hondadespensa-pwa-v202';
const ASSETS=['./index.html','./styles.css?v=122','./app.js?v=179','./manifest.webmanifest','./icon-192.png','./icon-512.png','./textura-azul.svg?v=40','./assets/polaroid-vintage-faro.webp','./assets/logotipo-marfil-v2.webp','./assets/iconos-ilustrados.webp','./assets/iconos-sencillos.webp','./assets/iconos-estencil.webp','./assets/iconos-estencil-sin-envases-v2.webp'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>(k.startsWith('hondadespensa-pwa-')||k.startsWith('mi-despensa-pwa-'))&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();})());});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{const response=await fetch(event.request,{cache:'no-store'});if(response.ok)await cache.put(event.request,response.clone());return response;}
  catch(error){const cached=await cache.match(event.request);if(cached)return cached;if(event.request.mode==='navigate'){const fallback=await cache.match('./index.html');if(fallback)return fallback;}throw error;}
 })());
});
