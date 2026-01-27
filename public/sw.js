// Service Worker for background notifications

self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker activated');
    event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
    console.log('📬 Push notification received');

    const data = event.data ? event.data.json() : {};
    const title = data.title || '🎙️ New Voice Message';
    const options = {
        body: data.body || 'You received a new voice message',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        tag: 'voice-message',
        requireInteraction: false,
        data: {
            audio: data.audio,
            roomId: data.roomId
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked');
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // If app is already open, focus it
            for (let client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'AUDIO_MESSAGE') {
        console.log('📥 Audio message received in Service Worker');

        // Show notification
        self.registration.showNotification('🎙️ New Voice Message', {
            body: `New message in room: ${event.data.roomId}`,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            vibrate: [200, 100, 200],
            tag: 'voice-message',
            data: {
                audio: event.data.audio,
                roomId: event.data.roomId
            }
        });
    }
});
