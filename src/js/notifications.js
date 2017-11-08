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
            document.querySelector('main > header .notification').classList.remove('disabled');

            Notifications.subscriptions.load().then((subscriptions) => {
                for (let i = 0; i < subscriptions.length; i++) {
                    document.querySelector(`.conversations.menu .button[data-conversation-id='${subscriptions[i].conversationId}']`).classList.add('subscribed');
                }

                Notifications.active();
            });
        }
    },

    reload: () => {
        document.querySelector('main > header .notification').classList.remove('active');
        let subscriptions = document.querySelectorAll('.conversations.menu .button.subscribed');
        for (let i = 0; i < subscriptions.length; i++) {
            subscriptions[i].classList.remove('subscribed');
        }

        Notifications.init();
    },

    active: () => {
        let conversationId = Conversations.lastConversation.load().id;
        if (conversationId && document.querySelector(`.conversations.menu .button[data-conversation-id='${conversationId}']`).classList.contains('subscribed')) {
            document.querySelector('main > header .notification > .button').classList.add('active');
        } else {
            document.querySelector('main > header .notification > .button').classList.remove('active');
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
        console.log('subscribe',conversationId)
        const publicKey = new Uint8Array([0x04, 0xfd, 0x4b, 0xe8, 0xdb, 0x82, 0x3e, 0x26, 0x0f, 0x89, 0x3f, 0x60, 0x09, 0x32, 0x61, 0xc4, 0xbc, 0x68, 0xb8, 0xfa, 0x45, 0xa1, 0x24, 0x19, 0xdc, 0x9b, 0xab, 0xb6, 0xe5, 0xe4, 0x78, 0x43, 0xc0, 0xbf, 0xb7, 0x9e, 0x0a, 0x51, 0x21, 0xde, 0x90, 0x5d, 0x16, 0x55, 0x04, 0xb7, 0x07, 0x88, 0xa0, 0xa9, 0x70, 0xe1, 0x2d, 0x1f, 0x5e, 0x62, 0x40, 0x72, 0xba, 0x9e, 0x7d, 0xc4, 0xea, 0x87, 0x3a]);

        navigator.serviceWorker.ready.then(function (registration) {
            console.log('subscribe',registration)
            return registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: publicKey
            });
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

    unsubscribe: (conversationId) => {

        let form = new FormData();
        form.append('conversationId', conversationId);

        fetch('/api/notification/unsubscribe', {
            headers: Fetch.headers(),
            method: 'POST',
            body: form
        }).then(Fetch.processFetchStatus).then(() => {
            Notifications.reload();
        });

    }
};