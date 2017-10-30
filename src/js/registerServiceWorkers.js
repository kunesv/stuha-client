// FIXME: Remove after testing
window.onerror = function(msg, url, linenumber) {
    alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
    return true;
};


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');

    // .then(function (registration) {
    //     return registration.pushManager.getSubscription().then(function (subscription) {
    //         if (subscription) {
    //             return subscription;
    //         }
    //
    //         return registration.pushManager.subscribe({userVisibleOnly: true});
    //     });
    // }).then(function (subscription) {
    //     let endpoint = subscription.endpoint;
    //
    //     console.log(endpoint)
    // });


} else {
    console.log('No Service Worker in navigator. Surfing anonymously?')
}