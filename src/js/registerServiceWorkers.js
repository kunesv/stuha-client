// FIXME: Remove after testing
window.onerror = function(msg, url, linenumber) {
    alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
    return true;
};


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
} else {
    console.log('No Service Worker in navigator. Surfing anonymously?')
}