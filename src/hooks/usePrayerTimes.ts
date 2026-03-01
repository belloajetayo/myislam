import { useState, useEffect, useRef, useCallback } from "react";

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

export function usePrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [hijriDate, setHijriDate] = useState<HijriDateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPrayer, setCurrentPrayer] = useState<string>("");
  const [nextPrayer, setNextPrayer] = useState<string>("");

  useEffect(() => {
    const fetchPrayerTimes = async (lat: number, lon: number) => {
      try {
        // Get location name
        const geoResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
        );
        const geoData = await geoResponse.json();

        setLocation({
          city: geoData.city || geoData.locality || "Unknown",
          country: geoData.countryName || "Unknown",
          latitude: lat,
          longitude: lon,
        });

        // Get prayer times
        const date = new Date();
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${Math.floor(date.getTime() / 1000)}?latitude=${lat}&longitude=${lon}&method=2`,
        );
        const data = await response.json();

        if (data.code === 200) {
          const timings = data.data.timings;
          setPrayerTimes({
            Fajr: timings.Fajr,
            Sunrise: timings.Sunrise,
            Dhuhr: timings.Dhuhr,
            Asr: timings.Asr,
            Maghrib: timings.Maghrib,
            Isha: timings.Isha,
          });

          // Also extract Hijri date from the same API response
          const hijri = data.data.date.hijri;
          setHijriDate({
            day: parseInt(hijri.day),
            month: hijri.month,
            year: parseInt(hijri.year),
          });
        }
      } catch (err) {
        setError("Failed to fetch prayer times");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Get user location with high accuracy GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
          // Try with lower accuracy as fallback
          navigator.geolocation.getCurrentPosition(
            (position) => {
              fetchPrayerTimes(
                position.coords.latitude,
                position.coords.longitude,
              );
            },
            () => {
              // Default to Makkah if all location methods fail
              fetchPrayerTimes(21.4225, 39.8262);
              setError(
                "Location access denied. Using default location (Makkah).",
              );
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
          );
        },
        {
          enableHighAccuracy: true, // Force GPS for precise coordinates
          timeout: 15000, // Wait up to 15s for GPS fix
          maximumAge: 0, // Always get fresh location
        },
      );
    } else {
      fetchPrayerTimes(21.4225, 39.8262);
      setError("Geolocation not supported. Using default location (Makkah).");
    }
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

const PRAYER_NAMES_FOR_NOTIF = [
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
] as const;

function scheduleNotifications(prayerTimes: PrayerTimes): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  const now = new Date();
  const nowMs = now.getTime();

  for (const name of PRAYER_NAMES_FOR_NOTIF) {
    const raw = prayerTimes[name as keyof PrayerTimes];
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
      }
    }, msUntil);

    timers.push(timer);
  }

  return () => timers.forEach(clearTimeout);
}

export function useNotifications(prayerTimes: PrayerTimes | null) {
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    () => {
      return localStorage.getItem(NOTIF_STORAGE_KEY) === "true";
    },
  );
  const cleanupRef = useRef<(() => void) | null>(null);

  // Schedule (or cancel) whenever enabled state or prayerTimes changes
  useEffect(() => {
    // Cancel any existing timers
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    if (
      notificationsEnabled &&
      prayerTimes &&
      Notification.permission === "granted"
    ) {
      cleanupRef.current = scheduleNotifications(prayerTimes);
    }
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [notificationsEnabled, prayerTimes]);

  const toggleNotifications = useCallback(async () => {
    if (!notificationsEnabled) {
      // Request permission first
      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return false; // user denied
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

  return { notificationsEnabled, toggleNotifications };
}
