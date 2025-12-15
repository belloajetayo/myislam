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
    <div className="glass rounded-3xl p-4 shadow-card border border-primary/10 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-accent rounded-xl flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-primary-foreground" />
          </div>
          <h3 className="font-semibold text-gradient-gold text-sm">Daily Reminder</h3>
        </div>
        <button 
          onClick={nextReminder}
          className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-foreground" />
        </button>
      </div>

      <div className={`transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        <p className="text-sm text-foreground leading-relaxed mb-3">
          "{reminder.text}"
        </p>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
            {getTypeIcon()}
            {getTypeLabel()}
          </span>
          <span className="text-xs text-muted-foreground">— {reminder.source}</span>
        </div>
      </div>
    </div>
  );
};

export default DailyReminders;
