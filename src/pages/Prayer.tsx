import React, { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { ChevronLeft, ChevronRight, MapPin, Bell, Check } from 'lucide-react';

const prayers = [
  { name: 'Fajr', time: '5:23 AM', arabic: 'الفجر', color: 'from-indigo-500 to-purple-600' },
  { name: 'Sunrise', time: '6:45 AM', arabic: 'الشروق', color: 'from-orange-400 to-pink-500' },
  { name: 'Dhuhr', time: '12:30 PM', arabic: 'الظهر', color: 'from-amber-400 to-orange-500' },
  { name: 'Asr', time: '3:45 PM', arabic: 'العصر', color: 'from-cyan-400 to-blue-500', current: true },
  { name: 'Maghrib', time: '6:12 PM', arabic: 'المغرب', color: 'from-purple-400 to-pink-500' },
  { name: 'Isha', time: '7:42 PM', arabic: 'العشاء', color: 'from-blue-600 to-indigo-700' },
];

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dates = [8, 9, 10, 11, 12, 13, 14];

const Prayer: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(12);
  const [prayedList, setPrayedList] = useState<string[]>(['Fajr', 'Sunrise', 'Dhuhr']);

  const togglePrayed = (name: string) => {
    setPrayedList(prev => 
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <header className="flex items-center justify-between py-2 animate-fade-in">
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">Prayer Times</h1>
            <div className="flex items-center gap-1 text-primary-foreground/70">
              <MapPin className="w-3 h-3" />
              <span className="text-xs">New York, USA</span>
            </div>
          </div>
          <button className="w-10 h-10 glass rounded-2xl flex items-center justify-center border border-primary-foreground/10">
            <Bell className="w-5 h-5 text-primary-foreground" />
          </button>
        </header>

        {/* Date Selector */}
        <div className="glass rounded-3xl p-4 shadow-card border border-primary/10 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <button className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">December 2024</p>
              <p className="text-xs text-muted-foreground">Jumada al-Akhirah 1446</p>
            </div>
            <button className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          </div>

          <div className="flex justify-between">
            {weekDays.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(dates[index])}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all duration-300 ${
                  dates[index] === selectedDate
                    ? 'gradient-primary shadow-soft'
                    : 'hover:bg-muted/50'
                }`}
              >
                <span className={`text-[10px] ${dates[index] === selectedDate ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {day}
                </span>
                <span className={`text-sm font-semibold ${dates[index] === selectedDate ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {dates[index]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Prayer Highlight */}
        <div className="gradient-accent rounded-3xl p-5 shadow-glow animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-foreground/80 text-xs">Current Prayer</p>
              <h2 className="text-2xl font-bold text-primary-foreground">Asr</h2>
              <p className="text-primary-foreground/90 font-arabic text-lg">العصر</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary-foreground">3:45 PM</p>
              <p className="text-primary-foreground/80 text-xs">Next: Maghrib in 2h 27m</p>
            </div>
          </div>
        </div>

        {/* Prayer List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-primary-foreground/90">All Prayers</h3>
          {prayers.map((prayer, index) => {
            const isPrayed = prayedList.includes(prayer.name);
            
            return (
              <div
                key={index}
                className={`glass rounded-2xl p-4 border transition-all duration-300 animate-slide-up ${
                  prayer.current ? 'border-primary/30 shadow-soft' : 'border-primary/10'
                }`}
                style={{ animationDelay: `${0.15 + index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${prayer.color} flex items-center justify-center shadow-soft`}>
                    <span className="text-primary-foreground font-arabic text-lg">{prayer.arabic.charAt(0)}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{prayer.name}</h4>
                      {prayer.current && (
                        <span className="text-[10px] gradient-accent text-primary-foreground px-2 py-0.5 rounded-full">Now</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-arabic">{prayer.arabic}</p>
                  </div>
                  
                  <div className="text-right flex items-center gap-3">
                    <span className="font-semibold text-foreground">{prayer.time}</span>
                    <button
                      onClick={() => togglePrayed(prayer.name)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isPrayed 
                          ? 'bg-islamic-green text-white' 
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Prayer;
