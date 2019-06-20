navigator.serviceWorker.register('serviceWorker.js', {
    scope: '.'
}).then(function(registration) {
    console.log('The service worker has been registered ', registration);
});