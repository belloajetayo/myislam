import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Moon, MapPin } from 'lucide-react';
import { useHijriDate, islamicMonths } from '@/hooks/useHijriDate';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';

// Hijri day names
const hijriDays = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const hijriDaysShort = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const PrayerCalendar: React.FC = () => {
  const [selectedDateOffset, setSelectedDateOffset] = useState(0);
  const [weekHijriDates, setWeekHijriDates] = useState<{ [key: string]: { day: number; month: string; monthAr: string } }>({});
  const [userLocation, setUserLocation] = useState<string>('Locating...');
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

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            );
            const data = await response.json();
            setUserLocation(data.city || data.locality || 'Your Location');
          } catch {
            setUserLocation('Your Location');
          }
        },
        () => setUserLocation('Location unavailable'),
        { enableHighAccuracy: false }
      );
    }
  }, []);

  // Fetch Hijri dates for the week
  useEffect(() => {
    const fetchWeekHijri = async () => {
      const hijriDates: { [key: string]: { day: number; month: string; monthAr: string } } = {};
      for (const date of weekDates) {
        const dateStr = date.toDateString();
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        try {
          const response = await fetch(`https://api.aladhan.com/v1/gpiToH/${day}-${month}-${year}`);
          const data = await response.json();
          if (data.code === 200) {
            hijriDates[dateStr] = {
              day: parseInt(data.data.hijri.day),
              month: data.data.hijri.month.en,
              monthAr: data.data.hijri.month.ar
            };
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
    { name: 'Fajr', nameAr: 'الفجر', time: prayerTimes.Fajr, passed: isPassed(prayerTimes.Fajr), current: currentPrayer === 'Fajr' },
    { name: 'Sunrise', nameAr: 'الشروق', time: prayerTimes.Sunrise, passed: isPassed(prayerTimes.Sunrise), current: false },
    { name: 'Dhuhr', nameAr: 'الظهر', time: prayerTimes.Dhuhr, passed: isPassed(prayerTimes.Dhuhr), current: currentPrayer === 'Dhuhr' },
    { name: 'Asr', nameAr: 'العصر', time: prayerTimes.Asr, passed: isPassed(prayerTimes.Asr), current: currentPrayer === 'Asr' },
    { name: 'Maghrib', nameAr: 'المغرب', time: prayerTimes.Maghrib, passed: isPassed(prayerTimes.Maghrib), current: currentPrayer === 'Maghrib' },
    { name: 'Isha', nameAr: 'العشاء', time: prayerTimes.Isha, passed: isPassed(prayerTimes.Isha), current: currentPrayer === 'Isha' },
  ] : [];

  function isPassed(time: string): boolean {
    if (selectedDateOffset !== 0) return selectedDateOffset < 0;
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const prayerTime = new Date();
    prayerTime.setHours(hours, minutes, 0);
    return now > prayerTime;
  }

  const formatHijriDate = () => {
    if (!dateInfo?.hijri) return '';
    return `${dateInfo.hijri.day} ${dateInfo.hijri.month.en} ${dateInfo.hijri.year} هـ`;
  };

  const formatHijriDateArabic = () => {
    if (!dateInfo?.hijri) return '';
    return `${dateInfo.hijri.day} ${dateInfo.hijri.month.ar} ${dateInfo.hijri.year}`;
  };

  return (
    <div className="relative bg-card rounded-3xl p-5 shadow-card border border-border overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s' }}>
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-islamic-gold/15 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-islamic-green/10 to-transparent rounded-full blur-xl" />
      
      <div className="relative">
        {/* Header - Hijri Only */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-islamic-gold/20 to-islamic-gold/5 flex items-center justify-center">
              <Moon className="w-5 h-5 text-islamic-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {selectedDateOffset === 0 ? 'Today' : formatHijriDate()}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{userLocation}</span>
              </div>
            </div>
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
              <Moon className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Hijri Calendar Card - Primary Focus */}
        <div className="bg-gradient-to-br from-islamic-gold/20 via-islamic-gold/10 to-islamic-gold/5 rounded-2xl p-5 border border-islamic-gold/25 mb-5">
          <div className="flex items-center justify-between">
            <div>
              {hijriLoading ? (
                <div className="flex items-center py-2">
                  <div className="w-6 h-6 border-2 border-islamic-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : dateInfo?.hijri ? (
                <>
                  <p className="text-4xl font-bold text-foreground mb-1">{dateInfo.hijri.day}</p>
                  <p className="text-lg font-semibold text-islamic-gold">{dateInfo.hijri.month.en}</p>
                  <p className="text-sm text-muted-foreground">{dateInfo.hijri.year} هـ</p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Loading...</p>
              )}
            </div>
            <div className="text-right">
              {dateInfo?.hijri && (
                <>
                  <p className="text-2xl font-arabic font-bold text-islamic-gold">{dateInfo.hijri.month.ar}</p>
                  <p className="text-sm font-arabic text-muted-foreground mt-1">
                    {hijriDays[selectedDate.getDay()]}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Week Date Selector - Hijri Days */}
        <div className="flex justify-between mb-5 bg-muted/30 rounded-2xl p-1.5">
          {weekDates.map((date, index) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === today.toDateString();
            const hijriInfo = weekHijriDates[date.toDateString()];
            
            return (
              <button
                key={index}
                onClick={() => {
                  const diff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  setSelectedDateOffset(diff);
                }}
                className={`flex flex-col items-center gap-0.5 py-2 px-2.5 rounded-xl transition-all duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-br from-islamic-gold to-islamic-gold/80 shadow-soft'
                    : isToday
                    ? 'bg-islamic-gold/10 ring-1 ring-islamic-gold/30'
                    : 'hover:bg-muted'
                }`}
              >
                <span className={`text-[10px] font-medium ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {hijriDaysShort[index]}
                </span>
                {hijriInfo ? (
                  <>
                    <span className={`text-sm font-bold ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {hijriInfo.day}
                    </span>
                    <span className={`text-[8px] font-medium truncate max-w-[32px] ${isSelected ? 'text-primary-foreground/80' : 'text-islamic-gold'}`}>
                      {hijriInfo.month.substring(0, 3)}
                    </span>
                  </>
                ) : (
                  <div className="w-4 h-4 border border-muted-foreground/30 border-t-transparent rounded-full animate-spin" />
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
              <div className="w-6 h-6 border-2 border-islamic-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {prayers.map((prayer, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 ${
                    prayer.current
                      ? 'bg-gradient-to-r from-islamic-green to-islamic-green/80 shadow-soft'
                      : prayer.passed
                      ? 'bg-muted/30'
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      prayer.current ? 'bg-white animate-pulse' : prayer.passed ? 'bg-islamic-green' : 'bg-muted-foreground/30'
                    }`} />
                    <div>
                      <span className={`font-semibold text-sm block ${
                        prayer.current ? 'text-white' : prayer.passed ? 'text-muted-foreground' : 'text-foreground'
                      }`}>
                        {prayer.name}
                      </span>
                      <span className={`text-[10px] font-arabic ${
                        prayer.current ? 'text-white/80' : 'text-muted-foreground'
                      }`}>
                        {prayer.nameAr}
                      </span>
                    </div>
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
