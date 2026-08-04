// ==============================
// QuickDineFlow Service Worker
// PWA functionality: offline support, caching, and app shell
// ==============================

// Cache names for different types of resources
const SHELL_CACHE = "quickdineflow-shell-v1"; // Core app shell (HTML, manifest, icons)
const RUNTIME_CACHE = "quickdineflow-runtime-v1"; // Dynamic assets fetched at runtime

// List of core files to cache during service worker installation
// These are the "app shell" necessary to load the PWA offline
const SHELL_ASSETS = [
  "/", // Root HTML
  "/index.html", // Main HTML
  "/manifest.webmanifest", // PWA manifest
  "/favicon.png", // Favicon
  "/icons/icon-192.png", // App icons
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png",
];

// ==============================
// Install event
// Pre-caches the app shell so the PWA can work offline
// ==============================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  // Activate this SW immediately, bypass waiting
  self.skipWaiting();
});

// ==============================
// Activate event
// Cleans up old caches and takes control of clients immediately
// ==============================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (name) => name !== SHELL_CACHE && name !== RUNTIME_CACHE
            )
            .map((name) => caches.delete(name)) // Delete old/unused caches
        )
      )
      .then(() => self.clients.claim()) // Take control of all pages
  );
});

// ==============================
// Fetch event
// Intercepts network requests to serve cached content when offline
// ==============================
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests (skip POST, PUT, etc.)
  if (request.method !== "GET") return;

  const sameOrigin = request.url.startsWith(self.location.origin);
  if (!sameOrigin) return; // Only handle same-origin requests

  // Serve app shell assets from cache first
  if (SHELL_ASSETS.includes(new URL(request.url).pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }

  // For other requests, try network first, then cache dynamically
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone response before caching
        const cloned = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, cloned));
        return response;
      })
      .catch(async () => {
        // If network fails, try to serve from cache
        const cached = await caches.match(request);
        if (cached) return cached;

        // If navigation request (like visiting a page), return app shell
        if (request.mode === "navigate") return caches.match("/index.html");

        // Otherwise, throw error (no offline fallback)
        throw new Error("Network request failed and no cache available.");
      })
  );
});
