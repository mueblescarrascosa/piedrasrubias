/* Service worker de Piedra Rubia: solo guarda los archivos de la app para que abra sin cobertura.
   Los datos de los comuneros (Supabase) nunca se guardan aquí: van siempre por la red. */
const CACHE = 'piedrasrubias-v1';
const APP = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP)).catch(() => null).then(() => self.skipWaiting()));
});

// Al actualizarse solo borra sus propias cachés: en la misma web hay otras apps con las suyas
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k.startsWith('piedrasrubias-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Primero la red (para tener siempre la última versión); si no hay, lo guardado
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then((res) => {
    if (res.ok) { const copia = res.clone(); caches.open(CACHE).then((c) => c.put(req, copia)); }
    return res;
  }).catch(() => caches.match(req).then((r) => r || caches.match('./index.html'))));
});
