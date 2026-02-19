self.addEventListener('install', (e) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('fetch', (e) => {
  // Just a placeholder to make it an installable PWA
  e.respondWith(fetch(e.request));
});