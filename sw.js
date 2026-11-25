const CACHE = "naememo-v39-13";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", event => {
  const requests = APP_SHELL.map(path => new Request(new URL(path, self.location.href), { cache: "reload" }));
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(requests)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  const cachedResponse = async () => {
    const cache = await caches.open(CACHE);
    return await cache.match(request) ||
      (request.mode === "navigate" ? await cache.match("./index.html") : undefined);
  };

  if (request.mode === "navigate") {
    event.respondWith(fetch(request, { cache: "no-cache" }).catch(async error => {
      const cached = await cachedResponse();
      if (cached) return cached;
      throw error;
    }));
    return;
  }

  event.respondWith(cachedResponse().then(cached => cached || fetch(request)));
});
