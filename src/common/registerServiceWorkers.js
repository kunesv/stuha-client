// FIXME: Remove after testing
window.addEventListener('error', (msg, url, linenumber) => {
    alert('Error: ' + msg.error + '\nLine Number: ' + msg.lineno + ',' + msg.colno);
});


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
} else {
    console.log('No Service Worker in navigator. Surfing anonymously?')
}