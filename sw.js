// Service worker: network-first (ได้ไฟล์ใหม่เสมอเมื่อออนไลน์) แล้ว fallback เป็น cache เมื่อออฟไลน์
var CACHE = 'sanguo-atlas-v2';
var SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'assets/icon.svg', 'assets/css/app.css',
  'assets/js/store.js', 'assets/js/tts.js', 'assets/js/reader.js', 'assets/js/atlas.js', 'assets/js/characters.js',
  'assets/js/timeline.js', 'assets/js/quiz.js', 'assets/js/search.js', 'assets/js/app.js',
  'data/meta.js', 'data/geo.js', 'data/events.js', 'data/characters.js', 'data/profiles.js', 'data/glossary.js',
  'data/chapters/vol1.js', 'data/chapters/vol2.js', 'data/chapters/vol3.js', 'data/chapters/vol4.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      if (res && (res.ok || res.type === 'opaque')) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true }).then(function (hit) { return hit || caches.match('index.html'); });
    })
  );
});
