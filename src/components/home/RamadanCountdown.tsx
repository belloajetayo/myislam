import React, { useState, useEffect, useCallback } from 'react';
import { Moon, Calendar, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface HijriDateResponse {
  hijri: {
    day: string;
    month: { number: number; en: string; ar: string };
    year: string;
  };
  gregorian: {
    day: string;
    month: { number: number; en: string };
    year: string;
  };
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const RamadanCountdown: React.FC = () => {
  const [countdown, setCountdown] = useState<CountdownTime | null>(null);
  const [isRamadan, setIsRamadan] = useState(false);
  const [ramadanDay, setRamadanDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ramadanStartDate, setRamadanStartDate] = useState<Date | null>(null);
  const [hijriYear, setHijriYear] = useState<number>(0);

  // Fetch Hijri date and calculate Ramadan
  const fetchHijriDate = useCallback(async () => {
    try {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();

      const response = await fetch(
        `https://api.aladhan.com/v1/gToH/${day}-${month}-${year}`
      );
      const data = await response.json();

      if (data.code === 200) {
        const hijri = data.data.hijri;
        const currentMonth = hijri.month.number;
        const currentDay = parseInt(hijri.day);
        const currentYear = parseInt(hijri.year);
        
        setHijriYear(currentYear);

        // Check if currently Ramadan (month 9)
        if (currentMonth === 9) {
          setIsRamadan(true);
          setRamadanDay(currentDay);
          setLoading(false);
          return;
        }

        // Calculate days until Ramadan
        // We need to find the Gregorian date for 1st Ramadan
        let targetYear = currentMonth > 9 ? currentYear + 1 : currentYear;
        
        // Fetch the Gregorian date for 1st Ramadan of target year
        const ramadanResponse = await fetch(
          `https://api.aladhan.com/v1/hToG/01-09-${targetYear}`
        );
        const ramadanData = await ramadanResponse.json();

        if (ramadanData.code === 200) {
          const gregorian = ramadanData.data.gregorian;
          const ramadanStart = new Date(
            parseInt(gregorian.year),
            parseInt(gregorian.month.number) - 1,
            parseInt(gregorian.day)
          );
          setRamadanStartDate(ramadanStart);
        }
      }
    } catch (error) {
      console.error('Error fetching Hijri date:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHijriDate();
  }, [fetchHijriDate]);

  // Update countdown every second
  useEffect(() => {
    if (!ramadanStartDate || isRamadan) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = ramadanStartDate.getTime() - now.getTime();

      if (diff <= 0) {
        setIsRamadan(true);
        setRamadanDay(1);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [ramadanStartDate, isRamadan]);

  if (loading) {
    return (
      <div className="glass rounded-3xl p-5 border border-primary/10 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-5 border border-primary/10 shadow-card animate-fade-in overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-amber-500/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-emerald-500/15 to-transparent rounded-full blur-xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Moon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gradient-gold">Ramadan {hijriYear}</h3>
              <p className="text-xs text-muted-foreground">
                {isRamadan ? 'Blessed Month' : 'Countdown'}
              </p>
            </div>
          </div>
          {isRamadan && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 rounded-full border border-emerald-500/30">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Now</span>
            </div>
          )}
        </div>

        {isRamadan ? (
          // During Ramadan
          <div className="bg-gradient-to-r from-purple-500/20 to-emerald-500/20 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-gradient-gold mb-1">
              رمضان مبارك
            </p>
            <p className="text-lg font-semibold text-foreground">
              Ramadan Mubarak!
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Day <span className="text-foreground font-semibold">{ramadanDay}</span> of 30
              </p>
            </div>
            <div className="mt-3 h-2 bg-background/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(ramadanDay / 30) * 100}%` }}
              />
            </div>
          </div>
        ) : countdown ? (
          // Countdown display
          <div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { value: countdown.days, label: 'Days' },
                { value: countdown.hours, label: 'Hours' },
                { value: countdown.minutes, label: 'Min' },
                { value: countdown.seconds, label: 'Sec' },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className="bg-gradient-to-b from-primary/10 to-primary/5 rounded-xl p-3 text-center"
                >
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {String(item.value).padStart(2, '0')}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Until the blessed month begins
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RamadanCountdown;
