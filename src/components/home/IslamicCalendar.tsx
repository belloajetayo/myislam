import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Moon, MapPin, Sparkles, Calendar } from 'lucide-react';
import { islamicMonths } from '@/hooks/useHijriDate';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { Button } from '@/components/ui/button';

interface HijriDateInfo {
  day: number;
  month: { number: number; en: string; ar: string };
  year: number;
}

interface CalendarDay {
  hijriDay: number;
  gregorianDate: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hijriMonth: { number: number; en: string; ar: string };
  hijriYear: number;
  isImportantDate?: string;
}

// Important Islamic dates (approximate - actual dates vary by moon sighting)
const IMPORTANT_DATES: { [key: string]: string } = {
  '1-1': 'Islamic New Year',
  '10-1': 'Day of Ashura',
  '12-3': 'Mawlid an-Nabi',
  '27-7': 'Isra and Mi\'raj',
  '15-8': 'Mid-Sha\'ban',
  '1-9': 'Start of Ramadan',
  '27-9': 'Laylat al-Qadr',
  '1-10': 'Eid al-Fitr',
  '9-12': 'Day of Arafah',
  '10-12': 'Eid al-Adha',
};

interface IslamicCalendarProps {
  onDateSelect?: (hijriDate: HijriDateInfo, gregorianDate: Date, importantDate?: string) => void;
  onAskMIA?: (question: string) => void;
}

const IslamicCalendar: React.FC<IslamicCalendarProps> = ({ onDateSelect, onAskMIA }) => {
  const [currentHijriMonth, setCurrentHijriMonth] = useState<number>(8); // Shaaban
  const [currentHijriYear, setCurrentHijriYear] = useState<number>(1447);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [todayHijri, setTodayHijri] = useState<HijriDateInfo | null>(null);
  const [userLocation, setUserLocation] = useState<string>('Locating...');
  const [loading, setLoading] = useState(true);
  const { prayerTimes, location, hijriDate, currentPrayer, loading: prayerLoading } = usePrayerTimes();

  const hijriDaysShort = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Sync location from prayer times hook
  useEffect(() => {
    if (location) {
      setUserLocation(location.city || 'Your Location');
    }
  }, [location]);

  // Sync Hijri date from prayer times hook (single source of truth)
  useEffect(() => {
    if (hijriDate) {
      setTodayHijri({
        day: hijriDate.day,
        month: hijriDate.month,
        year: hijriDate.year,
      });
      setCurrentHijriMonth(hijriDate.month.number);
      setCurrentHijriYear(hijriDate.year);
    }
  }, [hijriDate]);

  // Build calendar for current Hijri month
  useEffect(() => {
    const buildCalendar = async () => {
      setLoading(true);
      
      try {
        // Fetch the Gregorian equivalent of the 1st of the Hijri month
        const response = await fetch(
          `https://api.aladhan.com/v1/hToG/${1}-${currentHijriMonth}-${currentHijriYear}`
        );
        const data = await response.json();
        
        if (data.code !== 200) {
          setLoading(false);
          return;
        }

        const firstDayGregorian = new Date(
          data.data.gregorian.year,
          data.data.gregorian.month.number - 1,
          parseInt(data.data.gregorian.day)
        );

        // Hijri months alternate between 29 and 30 days
        const daysInMonth = currentHijriMonth % 2 === 1 ? 30 : 29;
        
        const days: CalendarDay[] = [];
        const startDayOfWeek = firstDayGregorian.getDay();
        
        // Add empty days for alignment
        for (let i = 0; i < startDayOfWeek; i++) {
          const prevDate = new Date(firstDayGregorian);
          prevDate.setDate(prevDate.getDate() - (startDayOfWeek - i));
          days.push({
            hijriDay: 0,
            gregorianDate: prevDate,
            isCurrentMonth: false,
            isToday: false,
            hijriMonth: islamicMonths[currentHijriMonth - 1],
            hijriYear: currentHijriYear,
          });
        }

        // Add days of the month
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 1; i <= daysInMonth; i++) {
          const gregorianDate = new Date(firstDayGregorian);
          gregorianDate.setDate(firstDayGregorian.getDate() + (i - 1));
          gregorianDate.setHours(0, 0, 0, 0);

          const importantKey = `${i}-${currentHijriMonth}`;
          
          days.push({
            hijriDay: i,
            gregorianDate,
            isCurrentMonth: true,
            isToday: todayHijri 
              ? todayHijri.day === i && 
                todayHijri.month.number === currentHijriMonth && 
                todayHijri.year === currentHijriYear
              : false,
            hijriMonth: islamicMonths[currentHijriMonth - 1],
            hijriYear: currentHijriYear,
            isImportantDate: IMPORTANT_DATES[importantKey],
          });
        }

        // Fill remaining days to complete the grid
        const remaining = 42 - days.length;
        const lastDay = days[days.length - 1]?.gregorianDate || new Date();
        for (let i = 1; i <= remaining; i++) {
          const nextDate = new Date(lastDay);
          nextDate.setDate(lastDay.getDate() + i);
          days.push({
            hijriDay: 0,
            gregorianDate: nextDate,
            isCurrentMonth: false,
            isToday: false,
            hijriMonth: islamicMonths[(currentHijriMonth % 12)],
            hijriYear: currentHijriYear,
          });
        }

        setCalendarDays(days);
      } catch (error) {
        console.error('Error building calendar:', error);
      } finally {
        setLoading(false);
      }
    };

    buildCalendar();
  }, [currentHijriMonth, currentHijriYear, todayHijri]);

  const goToPreviousMonth = () => {
    if (currentHijriMonth === 1) {
      setCurrentHijriMonth(12);
      setCurrentHijriYear(prev => prev - 1);
    } else {
      setCurrentHijriMonth(prev => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentHijriMonth === 12) {
      setCurrentHijriMonth(1);
      setCurrentHijriYear(prev => prev + 1);
    } else {
      setCurrentHijriMonth(prev => prev + 1);
    }
  };

  const goToToday = () => {
    if (todayHijri) {
      setCurrentHijriMonth(todayHijri.month.number);
      setCurrentHijriYear(todayHijri.year);
    }
  };

  const handleDayClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return;
    setSelectedDay(day);
    
    if (onDateSelect) {
      onDateSelect(
        { day: day.hijriDay, month: day.hijriMonth, year: day.hijriYear },
        day.gregorianDate,
        day.isImportantDate
      );
    }
  };

  const handleAskAboutDate = () => {
    if (selectedDay && onAskMIA) {
      const question = selectedDay.isImportantDate
        ? `Tell me about ${selectedDay.isImportantDate} and its significance in Islam.`
        : `What is the Islamic significance of ${selectedDay.hijriDay} ${selectedDay.hijriMonth.en}?`;
      onAskMIA(question);
    }
  };

  const currentMonthInfo = islamicMonths[currentHijriMonth - 1];

  const prayers = prayerTimes ? [
    { name: 'Fajr', nameAr: 'الفجر', time: prayerTimes.Fajr, current: currentPrayer === 'Fajr' },
    { name: 'Dhuhr', nameAr: 'الظهر', time: prayerTimes.Dhuhr, current: currentPrayer === 'Dhuhr' },
    { name: 'Asr', nameAr: 'العصر', time: prayerTimes.Asr, current: currentPrayer === 'Asr' },
    { name: 'Maghrib', nameAr: 'المغرب', time: prayerTimes.Maghrib, current: currentPrayer === 'Maghrib' },
    { name: 'Isha', nameAr: 'العشاء', time: prayerTimes.Isha, current: currentPrayer === 'Isha' },
  ] : [];

  return (
    <div className="relative bg-card rounded-3xl p-5 shadow-card border border-border overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s' }}>
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-islamic-gold/15 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-islamic-green/10 to-transparent rounded-full blur-xl" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-islamic-gold/20 to-islamic-gold/5 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-islamic-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Islamic Calendar</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{userLocation}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={goToPreviousMonth}
              className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center hover:bg-muted active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            <button 
              onClick={goToNextMonth}
              className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center hover:bg-muted active:scale-95 transition-all"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
            <button 
              onClick={goToToday}
              className="w-8 h-8 rounded-xl gradient-warm flex items-center justify-center shadow-soft active:scale-95 transition-all"
            >
              <Moon className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Month/Year Display */}
        <div className="bg-gradient-to-br from-islamic-gold/20 via-islamic-gold/10 to-islamic-gold/5 rounded-2xl p-4 border border-islamic-gold/25 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-foreground">{currentMonthInfo?.en}</p>
              <p className="text-sm text-muted-foreground">{currentHijriYear} هـ</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-arabic font-bold text-islamic-gold">{currentMonthInfo?.ar}</p>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="mb-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {hijriDaysShort.map((day, idx) => (
              <div key={idx} className="text-center text-xs font-medium text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-islamic-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  disabled={!day.isCurrentMonth}
                  className={`
                    relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all
                    ${!day.isCurrentMonth 
                      ? 'text-muted-foreground/30 cursor-default' 
                      : day.isToday
                        ? 'bg-gradient-to-br from-islamic-gold to-islamic-gold/80 text-primary-foreground shadow-soft font-bold'
                        : selectedDay?.hijriDay === day.hijriDay && selectedDay?.isCurrentMonth && day.isCurrentMonth
                          ? 'bg-islamic-gold/20 text-foreground ring-2 ring-islamic-gold/50'
                          : 'hover:bg-muted text-foreground'
                    }
                    ${day.isImportantDate ? 'font-semibold' : ''}
                  `}
                >
                  <span>{day.hijriDay || ''}</span>
                  {day.isImportantDate && day.isCurrentMonth && (
                    <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-islamic-green" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Day Info */}
        {selectedDay && selectedDay.isCurrentMonth && (
          <div className="bg-muted/40 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-foreground">
                  {selectedDay.hijriDay} {selectedDay.hijriMonth.en} {selectedDay.hijriYear}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedDay.gregorianDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric' 
                  })}
                </p>
              </div>
              {onAskMIA && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAskAboutDate}
                  className="gap-1.5 text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask MIA
                </Button>
              )}
            </div>
            {selectedDay.isImportantDate && (
              <div className="flex items-center gap-2 text-islamic-green">
                <Moon className="w-4 h-4" />
                <span className="text-sm font-medium">{selectedDay.isImportantDate}</span>
              </div>
            )}
          </div>
        )}

        {/* Prayer Times Compact */}
        <div className="space-y-2">
          <h4 className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Today's Prayers</h4>
          {prayerLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-5 h-5 border-2 border-islamic-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {prayers.map((prayer, index) => (
                <div
                  key={index}
                  className={`text-center p-2 rounded-xl transition-all ${
                    prayer.current
                      ? 'bg-gradient-to-br from-islamic-green to-islamic-green/80 text-white shadow-soft'
                      : 'bg-muted/50'
                  }`}
                >
                  <p className={`text-[10px] font-medium ${prayer.current ? 'text-white/90' : 'text-muted-foreground'}`}>
                    {prayer.name}
                  </p>
                  <p className={`text-xs font-bold ${prayer.current ? 'text-white' : 'text-foreground'}`}>
                    {prayer.time}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IslamicCalendar;
