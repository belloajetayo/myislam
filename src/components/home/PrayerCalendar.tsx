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
    <div className="relative bg-card rounded-3xl p-5 shadow-card border border-border overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s' }}>
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/8 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-islamic-gold/10 to-transparent rounded-full blur-xl" />
      
      <div className="relative">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">
              {selectedDateOffset === 0 ? 'Today' : formatGregorianDate()}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setSelectedDateOffset(prev => prev - 1)}
              className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center hover:bg-muted active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            <button 
              onClick={() => setSelectedDateOffset(prev => prev + 1)}
              className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center hover:bg-muted active:scale-95 transition-all"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
            <button 
              onClick={() => setSelectedDateOffset(0)}
              className="w-8 h-8 rounded-xl gradient-warm flex items-center justify-center shadow-soft active:scale-95 transition-all"
            >
              <Calendar className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Dual Calendar Display */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Gregorian Calendar Card */}
          <div className="bg-muted/40 rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Gregorian</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{selectedDate.getDate()}</p>
            <p className="text-xs text-muted-foreground font-medium">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Hijri Calendar Card */}
          <div className="bg-gradient-to-br from-islamic-gold/15 to-islamic-gold/5 rounded-2xl p-4 border border-islamic-gold/25">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-islamic-gold/20 flex items-center justify-center">
                <Moon className="w-3.5 h-3.5 text-islamic-gold" />
              </div>
              <span className="text-[10px] text-islamic-gold uppercase tracking-wider font-semibold">Hijri</span>
            </div>
            {hijriLoading ? (
              <div className="flex items-center py-2">
                <div className="w-5 h-5 border-2 border-islamic-gold border-t-transparent rounded-full animate-spin" />
              </div>
            ) : dateInfo?.hijri ? (
              <>
                <p className="text-2xl font-bold text-foreground">{dateInfo.hijri.day}</p>
                <p className="text-xs text-islamic-gold font-medium">
                  {dateInfo.hijri.month.en} {dateInfo.hijri.year}
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Loading...</p>
            )}
          </div>
        </div>

        {/* Week Date Selector */}
        <div className="flex justify-between mb-5 bg-muted/30 rounded-2xl p-1.5">
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
                className={`flex flex-col items-center gap-0.5 py-2 px-2.5 rounded-xl transition-all duration-300 ${
                  isSelected
                    ? 'gradient-warm shadow-soft'
                    : isToday
                    ? 'bg-primary/10 ring-1 ring-primary/30'
                    : 'hover:bg-muted'
                }`}
              >
                <span className={`text-[10px] font-medium ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {days[index]}
                </span>
                <span className={`text-sm font-bold ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {date.getDate()}
                </span>
                {weekHijriDates[date.toDateString()] && (
                  <span className={`text-[9px] font-medium ${isSelected ? 'text-primary-foreground/80' : 'text-islamic-gold'}`}>
                    {weekHijriDates[date.toDateString()]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Prayer Times */}
        <div className="space-y-2">
          <h4 className="text-xs text-muted-foreground font-semibold mb-3 uppercase tracking-wider">Prayer Times</h4>
          {prayerLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {prayers.map((prayer, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 ${
                    prayer.current
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-soft'
                      : prayer.passed
                      ? 'bg-muted/30'
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      prayer.current ? 'bg-white animate-pulse' : prayer.passed ? 'bg-islamic-green' : 'bg-muted-foreground/30'
                    }`} />
                    <span className={`font-semibold text-sm ${
                      prayer.current ? 'text-white' : prayer.passed ? 'text-muted-foreground' : 'text-foreground'
                    }`}>
                      {prayer.name}
                    </span>
                    {prayer.current && (
                      <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <span className={`text-sm font-bold ${
                    prayer.current ? 'text-white' : prayer.passed ? 'text-muted-foreground' : 'text-foreground'
                  }`}>
                    {prayer.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrayerCalendar;
