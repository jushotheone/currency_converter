self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('currency-converter-cache').then(function(cache) {
            return cache.addAll([
                '/index.html',
                '/style.css',
                '/script.js',
                'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css',
                'https://cdn.jsdelivr.net/npm/chart.js',
                'https://www.paypal.com/sdk/js?client-id=d61d522cf1ba42f5ac9fedc454b36711',
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});