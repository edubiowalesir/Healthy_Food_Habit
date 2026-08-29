/* sw.js — caches the app so it opens with no internet.
   Bump CACHE when you change any file, so devices pick up the new version. */
const CACHE = 'plate-day-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/foods.js',
  './js/storage.js',
  './js/rewards.js',
  './js/charts.js',
  './js/teacher.js',
  './js/app.js',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
