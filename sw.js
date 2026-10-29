const CACHE='dayflow-v3';
const CORE=['./','./index.html','./manifest.json'];
self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('dayflow-')&&key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message',event=>{
  if(event.data==='SKIP_WAITING')self.skipWaiting();
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    try{
      const fresh=await fetch(event.request);
      if(fresh&&fresh.ok){const cache=await caches.open(CACHE);cache.put(event.request,fresh.clone());}
      return fresh;
    }catch(e){return cached||caches.match('./index.html');}
  })());
});
