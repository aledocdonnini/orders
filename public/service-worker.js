// This is the "Offline page" service worker

importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js"
);

const CACHE = "pwabuilder-page-v1";
const offlineFallbackPage = "offline.html?v=1";

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Install event: precache offline page
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll([offlineFallbackPage]);
    })
  );
});

// Activate event: cleanup old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Enable navigation preload
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Navigation requests
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloadResp = await event.preloadResponse;
          if (preloadResp) {
            console.log("[SW] Using navigation preload response");
            return preloadResp;
          }

          const networkResp = await fetch(event.request);
          console.log("[SW] Loaded from network:", event.request.url);
          return networkResp;
        } catch (error) {
          console.warn("[SW] Network error, serving offline page", error);
          const cache = await caches.open(CACHE);
          const cachedResp = await cache.match(offlineFallbackPage);
          return (
            cachedResp ||
            new Response("Offline", {
              status: 503,
              statusText: "Offline",
              headers: { "Content-Type": "text/html" },
            })
          );
        }
      })()
    );
  }
});

// Example: cache images
workbox.routing.registerRoute(
  ({ request }) => request.destination === "image",
  new workbox.strategies.CacheFirst({
    cacheName: "images-cache",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 giorni
      }),
    ],
  })
);

// Background Sync
if (workbox.backgroundSync) {
  const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin(
    "myQueueName",
    {
      maxRetentionTime: 24 * 60, // minutes
      onSync: async ({ queue }) => {
        let entry;
        while ((entry = await queue.shiftRequest())) {
          try {
            await fetch(entry.request.clone());
            console.log("[SW] Background sync replayed:", entry.request.url);
          } catch (error) {
            console.error("[SW] Replay failed, putting back in queue:", error);
            await queue.unshiftRequest(entry);
            break;
          }
        }
      },
    }
  );

  workbox.routing.registerRoute(
    ({ url, request }) =>
      url.pathname.startsWith("/api/sendMessage") && request.method === "POST",
    new workbox.strategies.NetworkOnly({
      plugins: [bgSyncPlugin],
    }),
    "POST"
  );
}
