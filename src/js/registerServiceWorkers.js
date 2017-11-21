// FIXME: Remove after testing
window.addEventListener('error', (msg, url, linenumber) => {
    alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
});


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
} else {
    console.log('No Service Worker in navigator. Surfing anonymously?')
}