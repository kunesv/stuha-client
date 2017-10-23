self.addEventListener('install', function (event) {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
    event.waitUntil(
        self.clients.matchAll().then(function (clientList) {
            var focused = clientList.some(function (client) {
                return client.focused;
            });

            var notificationMessage;
            if (focused) {
                notificationMessage = 'You\'re still here, thanks!';
            } else if (clientList.length > 0) {
                notificationMessage = 'You haven\'t closed the page, ' +
                    'click here to focus it!';
            } else {
                notificationMessage = 'You have closed the page, ' +
                    'click here to re-open it!';
            }

            return self.registration.showNotification('Stuha Konverzace', {
                body: notificationMessage,
            });
        })
    );
});

self.addEventListener('notificationclick', function (event) {
    event.waitUntil(
        self.clients.matchAll().then(function (clientList) {
            if (clientList.length > 0) {
                return clientList[0].focus();
            }

            return self.clients.openWindow('index.html');
        })
    )
});

// self.addEventListener('pushsubscriptionchange', function (event) {
//     console.log('Subscription expired');
//     event.waitUntil(
//         self.registration.pushManager.subscribe({userVisibleOnly: true})
//             .then(function (subscription) {
//                 console.log('Subscribed after expiration', subscription.endpoint);
//                 return fetch('register', {
//                     method: 'post',
//                     headers: {
//                         'Content-type': 'application/json'
//                     },
//                     body: JSON.stringify({
//                         endpoint: subscription.endpoint
//                     })
//                 });
//             })
//     );
// });