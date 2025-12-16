import React, { useState, useMemo } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { ChevronLeft, ChevronRight, MapPin, Bell, Check, Loader2 } from 'lucide-react';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';

const prayerColors: Record<string, string> = {
  Fajr: 'from-indigo-500 to-purple-600',
  Sunrise: 'from-orange-400 to-pink-500',
  Dhuhr: 'from-amber-400 to-orange-500',
  Asr: 'from-cyan-400 to-blue-500',
  Maghrib: 'from-purple-400 to-pink-500',
  Isha: 'from-blue-600 to-indigo-700',
};

const arabicNames: Record<string, string> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

const Prayer: React.FC = () => {
  const { prayerTimes, location, loading, currentPrayer, nextPrayer } = usePrayerTimes();
  const [prayedList, setPrayedList] = useState<string[]>([]);

  const today = new Date();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const dates = useMemo(() => {
    const result = [];
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      result.push(date.getDate());
    }
    return result;
  }, []);

  const [selectedDate, setSelectedDate] = useState(today.getDate());

  const togglePrayed = (name: string) => {
    setPrayedList(prev => 
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const getTimeUntilNext = () => {
    if (!prayerTimes || !nextPrayer) return '';
    const nextTime = prayerTimes[nextPrayer as keyof typeof prayerTimes];
    if (!nextTime) return '';
    
    const [nextHours, nextMinutes] = nextTime.split(':').map(Number);
    const now = new Date();
    const nextDate = new Date();
    nextDate.setHours(nextHours, nextMinutes, 0, 0);
    
    if (nextDate < now) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    
    const diff = nextDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const prayers = prayerTimes ? [
    { name: 'Fajr', time: prayerTimes.Fajr },
    { name: 'Sunrise', time: prayerTimes.Sunrise },
    { name: 'Dhuhr', time: prayerTimes.Dhuhr },
    { name: 'Asr', time: prayerTimes.Asr },
    { name: 'Maghrib', time: prayerTimes.Maghrib },
    { name: 'Isha', time: prayerTimes.Isha },
  ] : [];

  const currentPrayerData = prayers.find(p => p.name === currentPrayer);

  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <header className="flex items-center justify-between py-2 animate-fade-in">
          <div>
            <h1 className="text-xl font-bold text-gradient-gold drop-shadow-lg">Prayer Times</h1>
            <div className="flex items-center gap-1 text-white/80">
              <MapPin className="w-3 h-3" />
              <span className="text-xs">
                {loading ? 'Loading...' : location ? `${location.city}, ${location.country}` : 'Unknown'}
              </span>
            </div>
          </div>
          <button className="w-10 h-10 glass rounded-2xl flex items-center justify-center border border-white/20">
            <Bell className="w-5 h-5 text-white" />
          </button>
        </header>

        {/* Date Selector */}
        <div className="glass rounded-3xl p-4 shadow-card border border-primary/10 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <button className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">
                {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs text-white/70">Jumada al-Akhirah 1446</p>
            </div>
            <button className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="flex justify-between">
            {dates.map((date, index) => {
              const dateObj = new Date(today);
              dateObj.setDate(today.getDate() + (index - 3));
              const dayName = weekDays[dateObj.getDay()];
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all duration-300 ${
                    date === selectedDate
                      ? 'gradient-primary shadow-soft'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <span className={`text-[10px] ${date === selectedDate ? 'text-primary-foreground' : 'text-white/60'}`}>
                    {dayName}
                  </span>
                  <span className={`text-sm font-semibold ${date === selectedDate ? 'text-primary-foreground' : 'text-white'}`}>
                    {date}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Prayer Highlight */}
        {loading ? (
          <div className="gradient-accent rounded-3xl p-5 shadow-glow animate-slide-up flex items-center justify-center" style={{ animationDelay: '0.1s' }}>
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : currentPrayerData ? (
          <div className="gradient-accent rounded-3xl p-5 shadow-glow animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-xs">Current Prayer</p>
                <h2 className="text-2xl font-bold text-white">{currentPrayer}</h2>
                <p className="text-white/90 font-arabic text-lg">{arabicNames[currentPrayer]}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{formatTime(currentPrayerData.time)}</p>
                <p className="text-white/80 text-xs">Next: {nextPrayer} in {getTimeUntilNext()}</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Prayer List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gradient-gold drop-shadow-lg">All Prayers</h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          ) : (
            prayers.map((prayer, index) => {
              const isPrayed = prayedList.includes(prayer.name);
              const isCurrent = prayer.name === currentPrayer;
              
              return (
                <div
                  key={index}
                  className={`glass rounded-2xl p-4 border transition-all duration-300 animate-slide-up ${
                    isCurrent ? 'border-primary/30 shadow-soft' : 'border-primary/10'
                  }`}
                  style={{ animationDelay: `${0.15 + index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${prayerColors[prayer.name]} flex items-center justify-center shadow-soft`}>
                      <span className="text-white font-arabic text-lg">{arabicNames[prayer.name].charAt(0)}</span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white">{prayer.name}</h4>
                        {isCurrent && (
                          <span className="text-[10px] gradient-accent text-white px-2 py-0.5 rounded-full">Now</span>
                        )}
                      </div>
                      <p className="text-sm text-white/70 font-arabic">{arabicNames[prayer.name]}</p>
                    </div>
                    
                    <div className="text-right flex items-center gap-3">
                      <span className="font-semibold text-white">{formatTime(prayer.time)}</span>
                      <button
                        onClick={() => togglePrayed(prayer.name)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isPrayed 
                            ? 'bg-islamic-green text-white' 
                            : 'bg-white/20 text-white/60 hover:bg-white/30'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Prayer;
