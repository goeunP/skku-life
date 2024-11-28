// sw.js
const CACHE_NAME = 'skkulife';
const ASSETS = [
    '/', // Cache root
    '/html/static/css/style.css',
    '/html/static/css/signin.css',
    '/html/static/scripts/api.js',
    '/html/static/images/default-profile-image.svg',
    '/html/static/images/default-group-image.svg'
];

// Message handler - clear cache
self.addEventListener('message', event => {
    if (event.data.type === 'CLEAR_USER_DATA') {
        caches.open(CACHE_NAME).then(cache => {
            cache.delete(new Request('/dev/user/info'));
        });
    }

    if (event.data.type === 'CLEAR_ALL') {
        caches.keys().then(keys => {
            keys.forEach(key => caches.delete(key));
        });
    }
});

// Install handler - cache core assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
    );
});

// Activate handler - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            })
        ))
    );
});

// Fetch handler - network first with cache fallback
self.addEventListener('fetch', event => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    // API calls - network first with cache fallback
    event.respondWith(
        fetch(request)
            .then(response => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                    .then(cache => cache.put(request, responseClone));
                return response;
            })
            .catch(() => caches.match(request))
    );
    return;
});