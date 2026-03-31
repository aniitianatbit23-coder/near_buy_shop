self.addEventListener('push', function(event) {
    const data = event.data.json();
    console.log('Push data received:', data);

    const options = {
        body: data.body,
        icon: data.icon || '/images/logo.png',
        badge: '/images/badge.png',
        data: {
            url: data.url || '/shopkeeper/dashboard'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
