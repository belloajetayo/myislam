import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Moon } from 'lucide-react';
import { useHijriDate } from '@/hooks/useHijriDate';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';

const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const PrayerCalendar: React.FC = () => {
  const [selectedDateOffset, setSelectedDateOffset] = useState(0);
  const [weekHijriDates, setWeekHijriDates] = useState<{ [key: string]: number }>({});
  const { dateInfo, loading: hijriLoading, fetchDateInfo } = useHijriDate();
  const { prayerTimes, currentPrayer, loading: prayerLoading } = usePrayerTimes();

  const today = new Date();
  const currentDayIndex = today.getDay();
  
  // Generate week dates centered around today
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - currentDayIndex + i);
    return date;
  });

  // Fetch Hijri dates for the week
  useEffect(() => {
    const fetchWeekHijri = async () => {
      const hijriDates: { [key: string]: number } = {};
      for (const date of weekDates) {
        const dateStr = date.toDateString();
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        try {
          const response = await fetch(`https://api.aladhan.com/v1/gpiToH/${day}-${month}-${year}`);
          const data = await response.json();
          if (data.code === 200) {
            hijriDates[dateStr] = parseInt(data.data.hijri.day);
          }
        } catch (error) {
          console.error('Error fetching Hijri date:', error);
        }
      }
      setWeekHijriDates(hijriDates);
    };
    fetchWeekHijri();
  }, []);

  const selectedDate = new Date(today);
  selectedDate.setDate(today.getDate() + selectedDateOffset);

  useEffect(() => {
    fetchDateInfo(selectedDate);
  }, [selectedDateOffset]);

  const prayers = prayerTimes ? [
    { name: 'Fajr', time: prayerTimes.Fajr, passed: isPassed(prayerTimes.Fajr), current: currentPrayer === 'Fajr' },
    { name: 'Sunrise', time: prayerTimes.Sunrise, passed: isPassed(prayerTimes.Sunrise), current: false },
    { name: 'Dhuhr', time: prayerTimes.Dhuhr, passed: isPassed(prayerTimes.Dhuhr), current: currentPrayer === 'Dhuhr' },
    { name: 'Asr', time: prayerTimes.Asr, passed: isPassed(prayerTimes.Asr), current: currentPrayer === 'Asr' },
    { name: 'Maghrib', time: prayerTimes.Maghrib, passed: isPassed(prayerTimes.Maghrib), current: currentPrayer === 'Maghrib' },
    { name: 'Isha', time: prayerTimes.Isha, passed: isPassed(prayerTimes.Isha), current: currentPrayer === 'Isha' },
  ] : [];

  function isPassed(time: string): boolean {
    if (selectedDateOffset !== 0) return selectedDateOffset < 0;
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const prayerTime = new Date();
    prayerTime.setHours(hours, minutes, 0);
    return now > prayerTime;
  }

  const formatGregorianDate = () => {
    return selectedDate.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const formatHijriDate = () => {
    if (!dateInfo?.hijri) return '';
    return `${dateInfo.hijri.day} ${dateInfo.hijri.month.en} ${dateInfo.hijri.year} AH`;
  };

  return (
    <div className="glass rounded-3xl p-4 shadow-card border border-primary/10 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground">{selectedDateOffset === 0 ? 'Today' : formatGregorianDate()}</p>
          <h3 className="font-semibold text-foreground">{formatGregorianDate()}</h3>
          {/* Hijri Date */}
          {dateInfo?.hijri && (
            <div className="flex items-center gap-1 mt-1">
              <Moon className="w-3 h-3 text-islamic-gold" />
              <p className="text-xs text-islamic-gold font-medium">{formatHijriDate()}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSelectedDateOffset(prev => prev - 1)}
            className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <button 
            onClick={() => setSelectedDateOffset(prev => prev + 1)}
            className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
          <button 
            onClick={() => setSelectedDateOffset(0)}
            className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-soft"
          >
            <Calendar className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>

      {/* Date Selector */}
      <div className="flex justify-between mb-4">
        {weekDates.map((date, index) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === today.toDateString();
          
          return (
            <button
              key={index}
              onClick={() => {
                const diff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                setSelectedDateOffset(diff);
              }}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all duration-300 ${
                isSelected
                  ? 'gradient-primary shadow-soft'
                  : isToday
                  ? 'ring-2 ring-primary/50'
                  : 'hover:bg-muted/50'
              }`}
            >
              <span className={`text-xs ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                {days[index]}
              </span>
              <span className={`text-sm font-semibold ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                {date.getDate()}
              </span>
              {weekHijriDates[date.toDateString()] && (
                <span className={`text-[10px] ${isSelected ? 'text-primary-foreground/80' : 'text-islamic-gold'}`}>
                  {weekHijriDates[date.toDateString()]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Prayer Times */}
      <div className="space-y-2">
        <h4 className="text-xs text-muted-foreground font-medium mb-2">Prayer Times</h4>
        {prayerLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          prayers.map((prayer, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-300 ${
                prayer.current
                  ? 'gradient-accent shadow-soft'
                  : prayer.passed
                  ? 'bg-muted/30'
                  : 'bg-muted/50 hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  prayer.current ? 'bg-primary-foreground animate-pulse' : prayer.passed ? 'bg-islamic-green' : 'bg-muted-foreground/30'
                }`} />
                <span className={`font-medium text-sm ${
                  prayer.current ? 'text-primary-foreground' : prayer.passed ? 'text-muted-foreground' : 'text-foreground'
                }`}>
                  {prayer.name}
                </span>
                {prayer.current && (
                  <span className="text-[10px] bg-primary-foreground/20 text-primary-foreground px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <span className={`text-sm font-semibold ${
                prayer.current ? 'text-primary-foreground' : prayer.passed ? 'text-muted-foreground' : 'text-foreground'
              }`}>
                {prayer.time}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PrayerCalendar;
