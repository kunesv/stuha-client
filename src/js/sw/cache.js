self.addEventListener('install', (event) => {
    console.debug('Installed Cache SW ...');
});

self.addEventListener('fetch', function (event) {
    // FIXME: Temporarily turn this off. (And then verify this works in all browsers.)
    return;

    if (event.request.url.indexOf('/api/') !== -1) {
        return;
    }

    event.respondWith(
        caches.open('v0020').then(function (cache) {

            return cache.match(event.request).then(function (response) {
                return response || fetch(event.request).then(function (fetchedResponse) {
                    cache.put(event.request, fetchedResponse.clone());

                    return fetchedResponse;
                });
            });
        })
    );
});