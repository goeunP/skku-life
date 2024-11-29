// sw.js
const CACHE_NAME = 'skkulife';
const ASSETS = [
    '/', // Cache root
    '/html/static/css/style.css',
    '/html/static/css/signin.css',
    '/html/static/css/group-info.css',
    '/html/static/css/group-intro.css',
    '/html/static/css/info.css',
    '/html/static/css/join_group.css',
    '/html/static/css/signup.css',
    '/html/static/css/user-banner.css',
    '/html/static/scripts/api.js',
    '/html/static/scripts/imageCropper.js',
    '/html/static/scripts/signup.js',
    '/html/static/scripts/userBanner.js',
    '/html/static/images/default-profile-image.svg',
    '/html/static/images/default-group-image.svg',
    '/html/templates/create-group.html',
    '/html/templates/email-verification.html',
    '/html/templates/group-info.html',
    '/html/templates/group-intro.html',
    '/html/templates/info.html',
    '/html/templates/join_group.html',
    '/html/templates/signup.html',
    '/html/templates/user-banner.html'
];

// Message handler - clear cache
self.addEventListener('message', event => {
    if (event.data.type === 'CLEAR_USER_DATA') {
        caches.open(CACHE_NAME).then(cache => {
            cache.delete(new Request('https://nsptbxlxoj.execute-api.ap-northeast-2.amazonaws.com/dev/user/info'));
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

// Fetch handler - cache first with network fallback
self.addEventListener('fetch', event => {
    const { request } = event;

    if (request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then(cached => {
                if (cached) {
                    // Cache hit - return cached response
                    return cached;
                }
                
                // Cache miss - fetch from network
                return fetch(request)
                    .then(response => {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(request, responseClone));
                        return response;
                    })
                    .catch(() => {
                        console.log('Network request failed, no cache available');
                        return new Response('Network error occurred');
                    });
            })
    );
});