var Notifications = {

    subscriptions: {
        load: () => {
            return Notifications.getSubscription().then(function (subscription) {
                if (subscription) {
                    return fetch(`/api/subscriptions?endpoint=${subscription.endpoint}`, {
                        headers: Fetch.headers()
                    }).then(Fetch.processFetchStatus).then((response) => {
                        return response.json().then((subscriptions) => {
                            return subscriptions;
                        });
                    });
                } else {
                    return [];
                }
            });
        }
    },

    init: () => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            document.querySelector('.conversation-menu .notification').classList.remove('disabled');

            Notifications.subscriptions.load().then((subscriptions) => {
                for (let i = 0; i < subscriptions.length; i++) {
                    document.querySelector(`.conversations.menu .button[data-conversation-id='${subscriptions[i].conversationId}']`).classList.add('subscribed');
                }

                Notifications.active();
            });
        }
    },

    reload: () => {
        document.querySelector('.conversation-menu .notification').classList.remove('active');
        let subscriptions = document.querySelectorAll('.conversations.menu .button.subscribed');
        for (let i = 0; i < subscriptions.length; i++) {
            subscriptions[i].classList.remove('subscribed');
        }

        Notifications.init();
    },

    active: () => {
        let conversationId = Conversations.lastConversation.load().id;
        if (conversationId && document.querySelector(`.conversations.menu .button[data-conversation-id='${conversationId}']`).classList.contains('subscribed')) {
            document.querySelector('.conversation-menu .notification > a').classList.add('active');
        } else {
            document.querySelector('.conversation-menu .notification > a').classList.remove('active');
        }
    },

    toggle: (button) => {
        let conversationId = Conversations.lastConversation.load().id;

        if (button.classList.contains('active')) {
            Notifications.unsubscribe(conversationId);
        } else {
            Notifications.subscribe(conversationId);
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
                Notifications.reload();
            });

        });
    },

    unsubscribe: () => {
        Notifications.getSubscription().then(function (subscription) {
            console.log('TODO unsubscribe')
            // return subscription.unsubscribe().then(function () {
            //
            //     let form = new FormData();
            //     form.append('endpoint', subscription.endpoint);
            //
            //     return fetch('/api/notification/unsubscribe', {
            //         headers: Fetch.headers(),
            //         method: 'POST',
            //         body: form
            //     }).then(Fetch.processFetchStatus).then(() => {
            //         Notifications.subscribed.save(false);
            //     });
            // });
        });
    }
};