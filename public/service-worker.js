const CACHE_NAME = 'maroc2030-cache-v6';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/src/index.css',
  '/src/App.tsx',
  '/src/main.tsx'
];

// Installation du Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installation');
  
  // Sauter l'attente pour activer immédiatement le nouveau Service Worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache ouvert');
        // Ajout des ressources une par une avec gestion d'erreur
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(error => {
              console.warn(`Impossible de mettre en cache ${url}:`, error);
              return Promise.resolve();
            });
          })
        );
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activation');
  
  // Prendre le contrôle immédiatement
  event.waitUntil(
    Promise.all([
      // Suppression des anciens caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cache => {
            if (cache !== CACHE_NAME) {
              console.log('Suppression de l\'ancien cache :', cache);
              return caches.delete(cache);
            }
            return null;
          })
        );
      }),
      // Réclamer le contrôle immédiatement
      self.clients.claim()
    ])
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', event => {
  // Ignorer les requêtes non-GET et les requêtes vers des domaines externes
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Si la réponse est en cache, la retourner
        if (cachedResponse) {
          return cachedResponse;
        }

        // Pour les requêtes de navigation, toujours essayer le réseau d'abord
        if (event.request.mode === 'navigate') {
          return fetch(event.request)
            .then(response => {
              // Mettre en cache la page d'accueil pour le mode hors ligne
              if (event.request.url === self.location.origin + '/') {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, responseToCache));
              }
              return response;
            })
            .catch(() => {
              // En cas d'échec, retourner la page d'accueil en cache
              return caches.match('/');
            });
        }

        // Pour les autres ressources, essayer le cache d'abord, puis le réseau
        return fetch(event.request)
          .then(response => {
            // Vérifier que nous avons reçu une réponse valide
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Ne mettre en cache que les ressources nécessaires
            const shouldCache = [
              '/static/',
              '/assets/',
              '/images/',
              '.css',
              '.js',
              '.ts',
              '.tsx',
              '.json',
              '.png',
              '.jpg',
              '.jpeg',
              '.gif',
              '.svg',
              '.woff',
              '.woff2',
              '.ttf',
              '.eot'
            ].some(ext => event.request.url.includes(ext));

            if (shouldCache) {
              // Cloner la réponse pour la mettre en cache
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
            }

            return response;
          })
          .catch(error => {
            console.error('Erreur lors de la récupération:', error);
            // Pour les images, retourner une image par défaut
            if (event.request.headers.get('accept').includes('image')) {
              return new Response(
                '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="12" text-anchor="middle" dominant-baseline="middle" fill="#999">Image non chargée</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            // Pour les autres types de contenu, retourner une réponse d'erreur
            return new Response('Ressource non disponible hors ligne', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});
