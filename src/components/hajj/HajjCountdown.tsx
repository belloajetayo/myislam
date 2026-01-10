import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

const HajjCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Hajj 2025 starts on June 4, 2025 (8th Dhul Hijjah 1446)
  // Hajj 2026 starts around May 24, 2026
  const getNextHajjDate = () => {
    const now = new Date();
    const hajj2025 = new Date('2025-06-04T00:00:00');
    const hajj2026 = new Date('2026-05-24T00:00:00');
    
    if (now < hajj2025) return hajj2025;
    if (now < hajj2026) return hajj2026;
    
    // Default to next year's approximate date
    const year = now.getFullYear() + 1;
    return new Date(`${year}-06-01T00:00:00`);
  };

  const hajjDate = getNextHajjDate();
  const hajjYear = hajjDate.getFullYear();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = hajjDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [hajjDate]);

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card overflow-hidden relative">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center animate-pulse-soft">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gradient-gold">Hajj {hajjYear}</h2>
              <p className="text-xs text-primary-foreground/70 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Makkah, Saudi Arabia
              </p>
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-2">
          {timeUnits.map((unit, index) => (
            <div 
              key={unit.label}
              className="glass rounded-xl p-3 text-center border border-primary-foreground/5"
            >
              <div className="text-2xl font-bold text-gradient-gold tabular-nums">
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-primary-foreground/60 uppercase tracking-wider">
                {unit.label}
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-primary-foreground/60">
          <Clock className="w-3 h-3" />
          <span>Book early for best prices & availability</span>
        </div>
      </div>
    </div>
  );
};

export default HajjCountdown;
