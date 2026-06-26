import React, { useState } from 'react';
import { BookOpen, Droplets, Moon, MapPin, HandHeart, ChevronDown, BookMarked, ScrollText, Star, Calendar, Heart, Users, Gift, User, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const primaryShortcuts = [
  { icon: BookOpen, label: 'Quran', color: 'from-emerald-500 to-teal-600', route: '/quran' },
  { icon: HandHeart, label: 'Salat', color: 'from-blue-500 to-indigo-600', route: '/prayer' },
  { icon: Droplets, label: 'Zakat', color: 'from-amber-500 to-orange-600', route: '/zakat' },
  { icon: Moon, label: 'Sawm', color: 'from-purple-500 to-violet-600', route: '/fasting' },
  { icon: MapPin, label: 'Hajj', color: 'from-rose-500 to-pink-600', route: '/hajj' },
];

const extraShortcuts = [
  { icon: BookMarked, label: 'Duas', color: 'from-teal-500 to-cyan-600', route: '/duas' },
  { icon: ScrollText, label: 'Hadith', color: 'from-orange-500 to-amber-600', route: '/hadith' },
  { icon: Star, label: 'Prophet', color: 'from-yellow-500 to-orange-500', route: '/prophet' },
  { icon: Calendar, label: 'Calendar', color: 'from-indigo-500 to-blue-600', route: '/islamic-calendar' },
  { icon: Compass, label: 'Qiblah', color: 'from-green-500 to-emerald-600', route: '/qiblah' },
  { icon: Users, label: 'Community', color: 'from-pink-500 to-rose-600', route: '/community' },
  { icon: Heart, label: 'Donate', color: 'from-red-500 to-pink-600', route: '/donation' },
  { icon: User, label: 'Profile', color: 'from-slate-500 to-gray-600', route: '/profile' },
  { icon: Gift, label: 'More', color: 'from-violet-500 to-purple-600', route: '/more' },
  { icon: Moon, label: 'Ramadan', color: 'from-blue-600 to-indigo-700', route: '/fasting' },
];

const ShortcutButton: React.FC<{ icon: React.ElementType; label: string; color: string; route: string; onClick: () => void }> = ({ icon: Icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-2 p-3 bg-white/60 dark:bg-white/5 rounded-2xl border border-indigo-100 dark:border-indigo-800 hover:border-indigo-300 hover:shadow-md active:scale-95 transition-all duration-300 group backdrop-blur-sm"
  >
    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-all`}>
      <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
    </div>
    <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-200">{label}</span>
  </button>
);

const QuickShortcuts: React.FC = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Pillars of Islam</h3>
        <div className="flex items-center gap-2 flex-1 ml-3">
          <div className="h-px flex-1 bg-gradient-to-r from-indigo-200 to-transparent dark:from-indigo-700" />
        </div>
      </div>

      {/* Primary shortcuts — always visible */}
      <div className="grid grid-cols-5 gap-2.5">
        {primaryShortcuts.map((shortcut, index) => (
          <ShortcutButton
            key={index}
            {...shortcut}
            onClick={() => navigate(shortcut.route)}
          />
        ))}
      </div>

      {/* V chevron expand button */}
      <div className="flex justify-center mt-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 text-indigo-500 text-xs font-medium hover:bg-indigo-100 transition-all active:scale-95"
          aria-label="Show more"
        >
          <span>{expanded ? 'Less' : 'More'}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Extra shortcuts — expandable */}
      <div
        className={`grid transition-all duration-300 ease-out mt-2 ${
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-5 gap-2.5 pt-1">
            {extraShortcuts.map((shortcut, index) => (
              <ShortcutButton
                key={index}
                {...shortcut}
                onClick={() => navigate(shortcut.route)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickShortcuts;
