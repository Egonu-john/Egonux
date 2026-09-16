const CACHE = 'anosa-shell-v1';
const SHELL = ['/anosa.webmanifest', '/brand/anosa-icon-192.png', '/brand/anosa-icon-512.png', '/brand/egonux-primary-logo.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  const pathname = new URL(event.request.url).pathname;
  const cacheable = pathname.startsWith('/brand/') || pathname === '/anosa.webmanifest';
  if (!cacheable) return;
  event.respondWith(fetch(event.request).then((response) => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => caches.match(event.request)));
});
