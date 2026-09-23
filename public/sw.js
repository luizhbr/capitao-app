const CACHE="capitao-shell-v1";
const PRECACHE=["/offline"];
self.addEventListener("install",(event)=>{event.waitUntil(caches.open(CACHE).then((cache)=>cache.addAll(PRECACHE)));self.skipWaiting()});
self.addEventListener("activate",(event)=>{event.waitUntil(caches.keys().then((keys)=>Promise.all(keys.filter((key)=>key!==CACHE).map((key)=>caches.delete(key)))));self.clients.claim()});
self.addEventListener("fetch",(event)=>{if(event.request.method!=="GET")return;if(event.request.mode==="navigate"){event.respondWith(fetch(event.request).catch(()=>caches.match("/offline")))}}); 
