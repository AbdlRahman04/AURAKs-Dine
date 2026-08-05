// ==============================
// QuickDineFlow Service Worker
// PWA functionality: offline support, caching, and app shell
// ==============================

const SHELL_CACHE = "quickdineflow-shell-v3";
const RUNTIME_CACHE = "quickdineflow-runtime-v3";

// Static assets safe to pre-cache (no hashed build filenames)
const PRECACHE_ASSETS = [
  "/manifest.webmanifest",
  "/favicon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`Failed to pre-cache ${url}:`, err);
          }),
        ),
      ),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (name) => name !== SHELL_CACHE && name !== RUNTIME_CACHE,
            )
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept API requests
  if (url.pathname.startsWith("/api/")) return;

  // Navigation (HTML pages): always network-first so deploys get fresh bundle hashes
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cloned = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put("/index.html", cloned));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match("/index.html");
          if (cached) return cached;
          throw new Error("Offline and no cached app shell available.");
        }),
    );
    return;
  }

  // Hashed build assets: cache-first (filename changes on each deploy)
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const cloned = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, cloned));
            return response;
          }),
      ),
    );
    return;
  }

  // Other static files: network-first with runtime cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        const cloned = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, cloned));
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw new Error("Network request failed and no cache available.");
      }),
  );
});
