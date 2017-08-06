self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('v1').then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/css/common.css',
                '/js/lib.js',
                '/js/app.js',
                '/images/plus.svg',
                '/images/conversation.svg'
            ]);
        })
    );
});

self.addEventListener('fetch', function (event) {
    if (event.request.url.indexOf('/api/') !== -1) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});