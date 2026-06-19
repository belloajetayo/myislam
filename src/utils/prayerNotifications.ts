import { Platform } from "react-native";
import type { PrayerTimes } from "@/hooks/usePrayerTimes";

// expo-notifications is native-only — no-op stubs on web
const isNative = Platform.OS !== "web";

async function getNotifications() {
  if (!isNative) return null;
  return import("expo-notifications");
}

if (isNative) {
  import("expo-notifications").then(Notifications => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  const Notifications = await getNotifications();
  if (!Notifications) return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("prayer-times", {
      name: "Prayer Times",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

function parseTime(timeStr: string): { hour: number; minute: number } {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return { hour: 0, minute: 0 };
  let hour = parseInt(match[1]);
  const minute = parseInt(match[2]);
  const period = match[3]?.toUpperCase();
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return { hour, minute };
}

export async function schedulePrayerNotifications(prayerTimes: PrayerTimes): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  await cancelPrayerNotifications();
  const granted = await requestNotificationPermission();
  if (!granted) return;

  const now = new Date();
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    for (const name of PRAYER_NAMES) {
      const timeStr = prayerTimes[name as keyof PrayerTimes];
      if (!timeStr) continue;
      const { hour, minute } = parseTime(timeStr);
      const triggerDate = new Date(now);
      triggerDate.setDate(now.getDate() + dayOffset);
      triggerDate.setHours(hour, minute, 0, 0);
      if (triggerDate <= now) continue;

      await Notifications.scheduleNotificationAsync({
        identifier: `prayer_${name}_${dayOffset}`,
        content: {
          title: `🕌 ${name} Prayer`,
          body: `Time for ${name} — ${timeStr}`,
          sound: "default",
          data: { prayer: name },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
    }
  }
}

export async function cancelPrayerNotifications(): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter(n => n.identifier.startsWith("prayer_"))
      .map(n => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

export async function arePrayerNotificationsEnabled(): Promise<boolean> {
  const Notifications = await getNotifications();
  if (!Notifications) return false;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.some(n => n.identifier.startsWith("prayer_"));
}
