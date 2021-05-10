//service worker, eseguono il cache delle risorse per fara ndare l'app più veloce 

const VERSION = "v0.1"
self.addEventListener("install", event=>{
    caches.open(VERSION)
    .then(cache=>cache.add("/offline"))
})


self.addEventListener("fetch", event=>{
    if (!navigator.onLine) {
        event.respondWith(caches.match("/offline"))
}})