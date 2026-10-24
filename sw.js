// GameTab Service Worker
// Die App ist eine einzelne, eigenständige index.html (Code und Logo eingebettet), dazu manifest.webmanifest, fonts/, icons/ und img/. Es gibt keine externen Ressourcen-Requests.
// Diese Datei sorgt dafür, dass die App nach dem ersten Laden auch offline
// funktioniert und schneller startet.

const CACHE_NAME = "gametab-cache-2026.10.24-29";
const APP_SHELL = ["./", "./index.html"];
// Zusatzdateien (Schriften, Icons, Bilder): wird beim Vite-Build aus docs/ erzeugt (web/vite.config.mjs).
const PRECACHE_EXTRA = [];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(APP_SHELL).then(() =>
        Promise.all(PRECACHE_EXTRA.map((u) => cache.add(u).catch(() => {})))
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Netzwerk-zuerst: bei bestehender Verbindung immer die aktuellste Version laden
// und den Cache dabei auffrischen. Nur wenn das Netzwerk nicht erreichbar ist
// (offline), wird auf die zuletzt gespeicherte Version zurueckgegriffen.
// So sind Updates sofort beim ersten Oeffnen sichtbar, Offline-Faehigkeit bleibt erhalten.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // Update-Pruefung (version.json, auch mit ?t=...) nie cachen und nie abfangen,
  // sonst waechst der Cache bei jedem Fokus um einen Eintrag.
  const reqUrl = new URL(event.request.url);
  if (reqUrl.pathname.endsWith("/version.json")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && !reqUrl.search) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
