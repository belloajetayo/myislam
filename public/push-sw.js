// Push notification service worker
// This runs independently of the main PWA service worker

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "Prayer Reminder", body: event.data.text() };
  }

  const options = {
    body: data.body || "Time to pray",
    icon: data.icon || "/pwa-icons/icon-192.svg",
    badge: "/pwa-icons/icon-192.svg",
    tag: data.tag || "prayer-notification",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/" },
    actions: [
      { action: "open", title: "Open App" },
      { action: "dismiss", title: "Dismiss" },
    ],
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(data.title || "🕌 Prayer Time", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(event.notification.data?.url || "/");
    })
  );
});
