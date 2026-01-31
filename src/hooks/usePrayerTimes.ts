import { useState, useEffect } from 'react';

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
  const [currentPrayer, setCurrentPrayer] = useState<string>('');
  const [nextPrayer, setNextPrayer] = useState<string>('');

  useEffect(() => {
    const fetchPrayerTimes = async (lat: number, lon: number) => {
      try {
        // Get location name
        const geoResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
        );
        const geoData = await geoResponse.json();
        
        setLocation({
          city: geoData.city || geoData.locality || 'Unknown',
          country: geoData.countryName || 'Unknown',
          latitude: lat,
          longitude: lon,
        });

        // Get prayer times
        const date = new Date();
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${Math.floor(date.getTime() / 1000)}?latitude=${lat}&longitude=${lon}&method=2`
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
        setError('Failed to fetch prayer times');
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
          console.warn('Geolocation error:', error.message);
          // Try with lower accuracy as fallback
          navigator.geolocation.getCurrentPosition(
            (position) => {
              fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
            },
            () => {
              // Default to Makkah if all location methods fail
              fetchPrayerTimes(21.4225, 39.8262);
              setError('Location access denied. Using default location (Makkah).');
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
          );
        },
        { 
          enableHighAccuracy: true,  // Force GPS for precise coordinates
          timeout: 15000,            // Wait up to 15s for GPS fix
          maximumAge: 0              // Always get fresh location
        }
      );
    } else {
      fetchPrayerTimes(21.4225, 39.8262);
      setError('Geolocation not supported. Using default location (Makkah).');
    }
  }, []);

  // Calculate current and next prayer
  useEffect(() => {
    if (!prayerTimes) return;

    const updateCurrentPrayer = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const parseTime = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };

      const prayers = [
        { name: 'Fajr', time: parseTime(prayerTimes.Fajr) },
        { name: 'Sunrise', time: parseTime(prayerTimes.Sunrise) },
        { name: 'Dhuhr', time: parseTime(prayerTimes.Dhuhr) },
        { name: 'Asr', time: parseTime(prayerTimes.Asr) },
        { name: 'Maghrib', time: parseTime(prayerTimes.Maghrib) },
        { name: 'Isha', time: parseTime(prayerTimes.Isha) },
      ];

      let current = 'Isha';
      let next = 'Fajr';

      for (let i = 0; i < prayers.length; i++) {
        if (currentTime < prayers[i].time) {
          next = prayers[i].name;
          current = i === 0 ? 'Isha' : prayers[i - 1].name;
          break;
        }
        if (i === prayers.length - 1) {
          current = 'Isha';
          next = 'Fajr';
        }
      }

      setCurrentPrayer(current);
      setNextPrayer(next);
    };

    updateCurrentPrayer();
    const interval = setInterval(updateCurrentPrayer, 60000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  return { prayerTimes, location, hijriDate, loading, error, currentPrayer, nextPrayer };
}
