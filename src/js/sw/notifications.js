self.addEventListener('install', (event) => {
    console.debug('Installed Notifications SW ...');
});

self.addEventListener('push', function (event) {
    // console.log("Just have been pushed!");
    // console.log(event)

    event.waitUntil(
        self.registration.showNotification('Stuha', {
            body: 'Nazdar!',
        })
    );
});

function registerPush() {

}