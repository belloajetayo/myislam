import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveExactLocation, saveLastLocation } from "@/hooks/useExactLocation";

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface HijriDateData {
  day: number;
  month: { number: number; en: string; ar: string };
  year: number;
}

export interface LocationData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

const PT_CACHE_KEY = "prayer_times_cache_v1";
const PT_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CachedPT {
  ts: number;
  date: string; // YYYY-MM-DD
  prayerTimes: PrayerTimes;
  hijriDate: HijriDateData;
  location: LocationData;
}

function readCache(): CachedPT | null {
  try {
    const raw = localStorage.getItem(PT_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPT;
    const today = new Date().toISOString().split("T")[0];
    if (parsed.date !== today) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function usePrayerTimes() {
  const cached = typeof window !== "undefined" ? readCache() : null;
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(cached?.prayerTimes ?? null);
  const [location, setLocation] = useState<LocationData | null>(cached?.location ?? null);
  const [hijriDate, setHijriDate] = useState<HijriDateData | null>(cached?.hijriDate ?? null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<string>("");
  const [nextPrayer, setNextPrayer] = useState<string>("");

  useEffect(() => {
    // If cache is still fresh, skip refetch
    if (cached && Date.now() - cached.ts < PT_CACHE_TTL_MS) {
      return;
    }

    const fetchPrayerTimes = async (lat: number, lon: number) => {
      try {
        const geoResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
        );
        const geoData = await geoResponse.json();

        const loc: LocationData = {
          city: geoData.city || geoData.locality || "Unknown",
          country: geoData.countryName || "Unknown",
          latitude: lat,
          longitude: lon,
        };
        setLocation(loc);
        saveLastLocation(loc);

        const date = new Date();
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${Math.floor(date.getTime() / 1000)}?latitude=${lat}&longitude=${lon}&method=2`,
        );
        const data = await response.json();

        if (data.code === 200) {
          const timings = data.data.timings;
          const pt: PrayerTimes = {
            Fajr: timings.Fajr,
            Sunrise: timings.Sunrise,
            Dhuhr: timings.Dhuhr,
            Asr: timings.Asr,
            Maghrib: timings.Maghrib,
            Isha: timings.Isha,
          };
          setPrayerTimes(pt);

          const hijri = data.data.date.hijri;
          const hd: HijriDateData = {
            day: parseInt(hijri.day),
            month: hijri.month,
            year: parseInt(hijri.year),
          };
          setHijriDate(hd);

          try {
            const today = new Date().toISOString().split("T")[0];
            localStorage.setItem(PT_CACHE_KEY, JSON.stringify({
              ts: Date.now(),
              date: today,
              prayerTimes: pt,
              hijriDate: hd,
              location: loc,
            } satisfies CachedPT));
          } catch { /* ignore quota */ }
        }
      } catch (err) {
        setError("Failed to fetch prayer times");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    (async () => {
      const startLocation = await resolveExactLocation({ allowBrowser: true, preferCache: true });
      await fetchPrayerTimes(startLocation.latitude, startLocation.longitude);

      if (startLocation.city && startLocation.country) {
        setLocation({
          city: startLocation.city,
          country: startLocation.country,
          latitude: startLocation.latitude,
          longitude: startLocation.longitude,
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate current and next prayer
  useEffect(() => {
    if (!prayerTimes) return;

    const updateCurrentPrayer = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const parseTime = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const prayers = [
        { name: "Fajr", time: parseTime(prayerTimes.Fajr) },
        { name: "Sunrise", time: parseTime(prayerTimes.Sunrise) },
        { name: "Dhuhr", time: parseTime(prayerTimes.Dhuhr) },
        { name: "Asr", time: parseTime(prayerTimes.Asr) },
        { name: "Maghrib", time: parseTime(prayerTimes.Maghrib) },
        { name: "Isha", time: parseTime(prayerTimes.Isha) },
      ];

      let current = "Isha";
      let next = "Fajr";

      for (let i = 0; i < prayers.length; i++) {
        if (currentTime < prayers[i].time) {
          next = prayers[i].name;
          current = i === 0 ? "Isha" : prayers[i - 1].name;
          break;
        }
        if (i === prayers.length - 1) {
          current = "Isha";
          next = "Fajr";
        }
      }

      setCurrentPrayer(current);
      setNextPrayer(next);
    };

    updateCurrentPrayer();
    const interval = setInterval(updateCurrentPrayer, 60000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  return {
    prayerTimes,
    location,
    hijriDate,
    loading,
    error,
    currentPrayer,
    nextPrayer,
  };
}

// ─── Prayer Notification Hook ────────────────────────────────────────────────

const NOTIF_STORAGE_KEY = "prayer_notifications_enabled";
const PRAYER_CONFIG_KEY = "prayer_notifications_config";

const PRAYER_NAMES_FOR_NOTIF = [
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
] as const;

function scheduleNotifications(prayerTimes: PrayerTimes, config: Record<string, boolean>): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  const now = new Date();
  const nowMs = now.getTime();

  // Auto-reschedule at midnight
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = midnight.getTime() - nowMs;
  const resetTimer = setTimeout(() => {
    window.dispatchEvent(new Event("prayer-reschedule"));
  }, msUntilMidnight);
  timers.push(resetTimer);

  for (const name of PRAYER_NAMES_FOR_NOTIF) {
    if (!config[name]) continue;
    const raw = prayerTimes[name as keyof PrayerTimes];
    if (!raw) continue;
    const clean = raw.split(" ")[0]; // strip timezone suffix  e.g. "(+01:00)"
    const [h, m] = clean.split(":").map(Number);
    const target = new Date();
    target.setHours(h, m, 0, 0);

    const msUntil = target.getTime() - nowMs;
    if (msUntil <= 0) continue; // prayer already passed today

    const timer = setTimeout(() => {
        if (Notification.permission === "granted") {
        new Notification(`🕌 ${name} Prayer Time`, {
          body: `It is time for ${name} prayer. May Allah accept your salah.`,
          icon: "/favicon.ico",
          tag: `prayer-${name}`,
        });
        try {
          // Use shared adhan player to avoid overlapping audio
          import("@/lib/adhanPlayer")
            .then(({ playAdhan }) => playAdhan("https://www.islamcan.com/audio/adhan/azan2.mp3"))
            .catch((e) => console.error("Adhan play failed:", e));
        } catch (e) {
          console.error("Adhan play failed:", e);
        }
      }
    }, msUntil);

    timers.push(timer);
  }

  return () => timers.forEach(clearTimeout);
}

export function useNotifications(prayerTimes: PrayerTimes | null) {
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem(NOTIF_STORAGE_KEY) === "true";
  });
  
  const [prayerConfig, setPrayerConfig] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(PRAYER_CONFIG_KEY);
    if (saved) return JSON.parse(saved);
    return { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true };
  });

  const [rescheduleTrigger, setRescheduleTrigger] = useState(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleReschedule = () => setRescheduleTrigger(prev => prev + 1);
    window.addEventListener("prayer-reschedule", handleReschedule);
    return () => window.removeEventListener("prayer-reschedule", handleReschedule);
  }, []);

  // Schedule (or cancel) whenever enabled state, config, or prayerTimes changes
  useEffect(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    if (
      notificationsEnabled &&
      prayerTimes &&
      Notification.permission === "granted"
    ) {
      cleanupRef.current = scheduleNotifications(prayerTimes, prayerConfig);
    }
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [notificationsEnabled, prayerTimes, prayerConfig, rescheduleTrigger]);

  const toggleNotifications = useCallback(async () => {
    if (!notificationsEnabled) {
      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return false;
      }
      if (Notification.permission === "denied") return false;
      setNotificationsEnabled(true);
      localStorage.setItem(NOTIF_STORAGE_KEY, "true");
      return true;
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem(NOTIF_STORAGE_KEY, "false");
      return false;
    }
  }, [notificationsEnabled]);

  const togglePrayerNotification = useCallback((prayerName: string) => {
    setPrayerConfig(prev => {
      const next = { ...prev, [prayerName]: !prev[prayerName] };
      localStorage.setItem(PRAYER_CONFIG_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { notificationsEnabled, toggleNotifications, prayerConfig, togglePrayerNotification };
}
