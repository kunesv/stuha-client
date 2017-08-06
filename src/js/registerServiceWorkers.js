if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/cache-sw.js');
} else {
    console.log('No Service Worker in navigator. Surfing anonymously?')
}