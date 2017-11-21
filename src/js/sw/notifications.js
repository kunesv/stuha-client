self.addEventListener('install', function (event) {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
    let message = event.data.json() || {};

    let notificationMessage = '';

    for (let i = 0; i < message.formatted.textNodes.length; i++) {
        let node = message.formatted.textNodes[i];
        if (node.type === 'PLAIN_TEXT') {
            notificationMessage += node.text;
        }
    }
// FIXME: Maybe some additional permission check for Android Chrome ..?
    self.registration.showNotification(`${message.userName}`, {
        body: notificationMessage,
        icon: `images/icons/${message.iconPath}`
    });
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