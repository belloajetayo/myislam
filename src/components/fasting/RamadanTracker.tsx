import React, { useState, useEffect, useMemo } from 'react';
import { Moon, Sun, MapPin, Clock, Utensils, CheckCircle, Timer } from 'lucide-react';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { Skeleton } from '@/components/ui/skeleton';

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
}

const RamadanTracker: React.FC = () => {
  const { prayerTimes, location, hijriDate, loading } = usePrayerTimes();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeToSuhoor, setTimeToSuhoor] = useState<TimeRemaining | null>(null);
  const [timeToIftar, setTimeToIftar] = useState<TimeRemaining | null>(null);
  const [isFasting, setIsFasting] = useState(false);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate times
  useEffect(() => {
    if (!prayerTimes) return;

    const parseTime = (timeStr: string): Date => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    };

    const fajrTime = parseTime(prayerTimes.Fajr);
    const maghribTime = parseTime(prayerTimes.Maghrib);
    const now = currentTime;

    // Determine if currently fasting (between Fajr and Maghrib)
    const isCurrentlyFasting = now >= fajrTime && now < maghribTime;
    setIsFasting(isCurrentlyFasting);

    const calculateRemaining = (targetTime: Date): TimeRemaining => {
      let diff = targetTime.getTime() - now.getTime();
      
      // If target time has passed, calculate for next day
      if (diff < 0) {
        const nextDay = new Date(targetTime);
        nextDay.setDate(nextDay.getDate() + 1);
        diff = nextDay.getTime() - now.getTime();
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    };

    if (isCurrentlyFasting) {
      // Fasting - show time until Iftar
      setTimeToIftar(calculateRemaining(maghribTime));
      setTimeToSuhoor(null);
    } else {
      // Not fasting - show time until next Suhoor ends (Fajr)
      const nextFajr = new Date(fajrTime);
      if (now >= maghribTime) {
        // After Maghrib, Suhoor ends at tomorrow's Fajr
        nextFajr.setDate(nextFajr.getDate() + 1);
      }
      setTimeToSuhoor(calculateRemaining(nextFajr));
      setTimeToIftar(null);
    }
  }, [prayerTimes, currentTime]);

  // Format time display
  const formatTime = (time: TimeRemaining): string => {
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
  };

  // Check if currently Ramadan
  const isRamadan = hijriDate?.month.number === 9;

  if (loading) {
    return (
      <div className="glass rounded-3xl p-5 border border-primary/10 shadow-card">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-5 border border-primary/10 shadow-card animate-fade-in overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-gradient-to-br from-amber-500/15 to-orange-500/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-gradient-to-tr from-purple-500/15 to-transparent rounded-full blur-xl" />

      <div className="relative">
        {/* Header with Location */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              {isFasting ? (
                <Moon className="w-6 h-6 text-white" />
              ) : (
                <Utensils className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gradient-gold">
                {isRamadan ? 'Ramadan Tracker' : 'Fasting Times'}
              </h3>
              {location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{location.city}, {location.country}</span>
                </div>
              )}
            </div>
          </div>
          {isRamadan && hijriDate && (
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">Day {hijriDate.day}</p>
              <p className="text-xs text-muted-foreground">of Ramadan</p>
            </div>
          )}
        </div>

        {/* Main Timer Display */}
        <div className={`rounded-2xl p-4 mb-4 text-center ${
          isFasting 
            ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/20' 
            : 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/20'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Timer className={`w-5 h-5 ${isFasting ? 'text-amber-400' : 'text-purple-400'}`} />
            <p className={`text-sm font-medium ${isFasting ? 'text-amber-400' : 'text-purple-400'}`}>
              {isFasting ? 'Time until Iftar' : 'Suhoor ends in'}
            </p>
          </div>
          
          <p className="text-4xl font-bold text-foreground tabular-nums tracking-wider">
            {isFasting && timeToIftar
              ? formatTime(timeToIftar)
              : timeToSuhoor
              ? formatTime(timeToSuhoor)
              : '--:--:--'}
          </p>

          <p className="text-xs text-muted-foreground mt-2">
            {isFasting 
              ? "May Allah accept your fast"
              : "Time to eat before Fajr"}
          </p>
        </div>

        {/* Prayer Times for Suhoor and Iftar */}
        {prayerTimes && (
          <div className="grid grid-cols-2 gap-3">
            {/* Suhoor Time (Fajr) */}
            <div className="bg-gradient-to-b from-purple-500/10 to-purple-500/5 rounded-xl p-3 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Moon className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Suhoor Ends</p>
                  <p className="text-sm font-semibold text-foreground">{prayerTimes.Fajr}</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Stop eating before Fajr adhan
              </p>
            </div>

            {/* Iftar Time (Maghrib) */}
            <div className="bg-gradient-to-b from-amber-500/10 to-amber-500/5 rounded-xl p-3 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Sun className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Iftar Time</p>
                  <p className="text-sm font-semibold text-foreground">{prayerTimes.Maghrib}</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Break fast at Maghrib adhan
              </p>
            </div>
          </div>
        )}

        {/* Current Status Indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isFasting ? 'bg-emerald-400 animate-pulse' : 'bg-muted-foreground'}`} />
          <p className="text-xs text-muted-foreground">
            {isFasting ? 'Currently Fasting' : 'Eating Permitted'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RamadanTracker;
