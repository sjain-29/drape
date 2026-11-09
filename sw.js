/*
 * Clean-up only. The earlier DRAPE version installed an offline copy of itself
 * in your browser. If that copy is still there, this file removes it so the
 * new version loads. It does nothing else, and you can leave it in place.
 */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const windows = await self.clients.matchAll({ type: 'window' });
      windows.forEach((w) => w.navigate(w.url));
    })(),
  );
});
