var Notifications = {

    subscriptions: {
        all: () => {
            return JSON.parse(localStorage.getItem('subscriptions')) || [];
        },
        add: (conversationId) => {
            let subscriptions = Notifications.subscriptions.all();
            subscriptions.push(conversationId);

            localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
        }
    },

    init: () => {
        if ('serviceWorker' in navigator) {
            document.querySelector('.conversation-menu .notification').classList.remove('disabled');

            let subscriptions = Notifications.subscriptions.all();
            for (let i = 0; i < subscriptions.length; i++) {
                document.querySelector(`.conversations.menu .button[data-conversation-id='${subscriptions[i]}']`).dataset.subscription = 'subscription';
            }
        }
    },

    getSubscription: () => {
        return navigator.serviceWorker.ready.then(function (registration) {
            return registration.pushManager.getSubscription();
        });
    },

    subscribe: (conversationId) => {
        navigator.serviceWorker.ready.then(function (registration) {
            return registration.pushManager.subscribe({userVisibleOnly: true});
        }).then(function (subscription) {

            let key = subscription.getKey ? subscription.getKey('p256dh') : '';
            let auth = subscription.getKey ? subscription.getKey('auth') : '';

            let form = new FormData();
            form.append('endpoint', subscription.endpoint);
            form.append('key', key ? btoa(String.fromCharCode.apply(null, new Uint8Array(key))) : '');
            form.append('auth', auth ? btoa(String.fromCharCode.apply(null, new Uint8Array(auth))) : '');

            form.append('conversationId', conversationId);

            fetch('/api/notification/subscribe', {
                headers: Fetch.headers(),
                method: 'POST',
                body: form
            }).then(Fetch.processFetchStatus).then(() => {
                Notifications.subscriptions.add(conversationId);
            });

        });
    },

    unsubscribe: () => {
        Notifications.getSubscription().then(function (subscription) {
            return subscription.unsubscribe().then(function () {

                let form = new FormData();
                form.append('endpoint', subscription.endpoint);

                return fetch('/api/notification/unsubscribe', {
                    headers: Fetch.headers(),
                    method: 'POST',
                    body: form
                }).then(Fetch.processFetchStatus).then(() => {
                    Notifications.subscribed.save(false);
                });
            });
        });
    }
};