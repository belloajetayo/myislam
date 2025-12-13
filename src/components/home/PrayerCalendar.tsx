import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const dates = [8, 9, 10, 11, 12, 13, 14];

const prayers = [
  { name: 'Fajr', time: '5:23 AM', passed: true },
  { name: 'Sunrise', time: '6:45 AM', passed: true },
  { name: 'Dhuhr', time: '12:30 PM', passed: true },
  { name: 'Asr', time: '3:45 PM', passed: false, current: true },
  { name: 'Maghrib', time: '6:12 PM', passed: false },
  { name: 'Isha', time: '7:42 PM', passed: false },
];

const PrayerCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(12);

  return (
    <div className="glass rounded-3xl p-4 shadow-card border border-primary/10 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Today</p>
          <h3 className="font-semibold text-foreground">12 December</h3>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <button className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
          <button className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
            <Calendar className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>

      {/* Date Selector */}
      <div className="flex justify-between mb-4">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => setSelectedDate(dates[index])}
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all duration-300 ${
              dates[index] === selectedDate
                ? 'gradient-primary shadow-soft'
                : 'hover:bg-muted/50'
            }`}
          >
            <span className={`text-xs ${dates[index] === selectedDate ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
              {day}
            </span>
            <span className={`text-sm font-semibold ${dates[index] === selectedDate ? 'text-primary-foreground' : 'text-foreground'}`}>
              {dates[index]}
            </span>
          </button>
        ))}
      </div>

      {/* Prayer Times */}
      <div className="space-y-2">
        <h4 className="text-xs text-muted-foreground font-medium mb-2">Prayer Times</h4>
        {prayers.map((prayer, index) => (
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
        ))}
      </div>
    </div>
  );
};

export default PrayerCalendar;
