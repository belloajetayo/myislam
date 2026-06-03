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

  const tag = data.tag || "prayer-notification";
  const shouldPlayAdhan =
    data.playAdhan ?? (tag === "prayer-test" || (tag.startsWith("prayer-") && !tag.endsWith("-pre")));

  const options = {
    body: data.body || "Time to pray",
    icon: data.icon || "/pwa-icons/icon-192.svg",
    badge: "/pwa-icons/icon-192.svg",
    tag,
    vibrate: [200, 100, 200],
    data: { url: data.url || "/", playAdhan: shouldPlayAdhan },
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
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (windowClients) => {
      const shouldPlayAdhan = event.notification.data?.playAdhan;
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          const focusedClient = await client.focus();
          if (shouldPlayAdhan) {
            focusedClient.postMessage({ type: "PLAY_ADHAN_FROM_NOTIFICATION" });
          }
          return focusedClient;
        }
      }
      const targetUrl = new URL(event.notification.data?.url || "/", self.location.origin);
      if (shouldPlayAdhan) {
        targetUrl.searchParams.set("playAdhan", "1");
      }
      return clients.openWindow(targetUrl.href);
    })
  );
});
