// GameTab Service Worker
// Die App ist eine einzelne, komplett eigenständige index.html (Schriften, Icons,
// Logo alles als Base64 eingebettet) — es gibt keine externen Ressourcen-Requests.
// Diese Datei sorgt dafür, dass die App nach dem ersten Laden auch offline
// funktioniert und schneller startet.

const CACHE_NAME = "gametab-cache-v2";
const APP_SHELL = ["./", "./index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
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

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
