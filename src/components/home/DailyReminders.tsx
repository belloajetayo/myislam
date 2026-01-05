import React, { useState, useEffect } from 'react';
import { Lightbulb, RefreshCw, BookOpen } from 'lucide-react';

const reminders = [
  {
    text: "Whoever reads Surah Al-Kahf on Friday, light shall shine forth for him between the two Fridays.",
    source: "Al-Hakim",
    type: "hadith"
  },
  {
    text: "The best of you are those who learn the Quran and teach it.",
    source: "Sahih Al-Bukhari",
    type: "hadith"
  },
  {
    text: "When you wake up in the morning, say Alhamdulillah for being blessed with another day.",
    source: "Daily Reminder",
    type: "reminder"
  },
  {
    text: "Charity does not decrease wealth. Rather, it increases it, increases it, increases it.",
    source: "Muslim",
    type: "hadith"
  },
  {
    text: "Make dua in sujood (prostration) as it is the closest you are to Allah.",
    source: "Daily Reminder",
    type: "reminder"
  },
  {
    text: "Indeed, with hardship comes ease. So when you have finished, then stand up for worship.",
    source: "Quran 94:6-7",
    type: "quran"
  },
  {
    text: "The strong person is not the one who can wrestle someone else down. The strong person is the one who can control himself when he is angry.",
    source: "Sahih Al-Bukhari",
    type: "hadith"
  },
  {
    text: "Smile at your brother. It is charity.",
    source: "At-Tirmidhi",
    type: "hadith"
  },
  {
    text: "And whoever relies upon Allah - then He is sufficient for him.",
    source: "Quran 65:3",
    type: "quran"
  },
  {
    text: "Remember to make dhikr throughout your day. SubhanAllah, Alhamdulillah, Allahu Akbar.",
    source: "Daily Reminder",
    type: "reminder"
  }
];

const DailyReminders: React.FC = () => {
  const [currentReminder, setCurrentReminder] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Set initial reminder based on day of year for consistency
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setCurrentReminder(dayOfYear % reminders.length);
  }, []);

  const nextReminder = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentReminder((prev) => (prev + 1) % reminders.length);
      setIsAnimating(false);
    }, 200);
  };

  const reminder = reminders[currentReminder];

  const getTypeIcon = () => {
    switch (reminder.type) {
      case 'quran':
        return <BookOpen className="w-4 h-4" />;
      case 'hadith':
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getTypeLabel = () => {
    switch (reminder.type) {
      case 'quran':
        return 'Quran';
      case 'hadith':
        return 'Hadith';
      default:
        return 'Reminder';
    }
  };

  return (
    <div className="relative bg-card rounded-3xl p-5 shadow-card border border-border overflow-hidden animate-slide-up" style={{ animationDelay: '0.15s' }}>
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-xl" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-warm rounded-xl flex items-center justify-center shadow-soft">
              <Lightbulb className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Daily Reminder</h3>
              <p className="text-[10px] text-muted-foreground">Refresh your iman</p>
            </div>
          </div>
          <button 
            onClick={nextReminder}
            className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted hover:rotate-180 active:scale-95 transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4 text-foreground" />
          </button>
        </div>

        <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          <p className="text-sm text-foreground leading-relaxed mb-4 italic">
            "{reminder.text}"
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
              {getTypeIcon()}
              {getTypeLabel()}
            </span>
            <span className="text-xs text-muted-foreground font-medium">— {reminder.source}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyReminders;
