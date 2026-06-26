import React, { useState } from 'react';
import { BookOpen, Droplets, Moon, MapPin, HandHeart, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const shortcuts = [
  { icon: BookOpen, label: 'Quran', color: 'from-emerald-500 to-teal-600', route: '/quran' },
  { icon: HandHeart, label: 'Salat', color: 'from-blue-500 to-indigo-600', route: '/prayer' },
  { icon: Droplets, label: 'Zakat', color: 'from-amber-500 to-orange-600', route: '/zakat' },
  { icon: Moon, label: 'Sawm', color: 'from-purple-500 to-violet-600', route: '/fasting' },
  { icon: MapPin, label: 'Hajj', color: 'from-rose-500 to-pink-600', route: '/hajj' },
];

const QuickShortcuts: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  return (
    <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between mb-3 group"
        aria-expanded={open}
      >
        <h3 className="text-sm font-semibold text-foreground">Pillars of Islam</h3>
        <div className="flex items-center gap-2 flex-1 ml-3">
          <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-5 gap-2.5">
            {shortcuts.map((shortcut, index) => (
              <button
                key={index}
                onClick={() => navigate(shortcut.route)}
                className="flex flex-col items-center gap-2 p-3 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-card active:scale-95 transition-all duration-300 group"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${shortcut.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-all`}>
                  <shortcut.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-semibold text-foreground">{shortcut.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickShortcuts;

