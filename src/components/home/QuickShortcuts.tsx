import React from 'react';
import { Heart, Droplets, Moon, MapPin, HandHeart } from 'lucide-react';

const shortcuts = [
  { icon: Heart, label: 'Iman', color: 'from-rose-400 to-pink-500', description: 'Faith & Beliefs' },
  { icon: HandHeart, label: 'Salat', color: 'from-blue-400 to-indigo-500', description: 'Daily Prayers' },
  { icon: Droplets, label: 'Zakat', color: 'from-emerald-400 to-teal-500', description: 'Charity' },
  { icon: Moon, label: 'Sawm', color: 'from-amber-400 to-orange-500', description: 'Fasting' },
  { icon: MapPin, label: 'Hajj', color: 'from-purple-400 to-violet-500', description: 'Pilgrimage' },
];

const QuickShortcuts: React.FC = () => {
  return (
    <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <h3 className="text-sm font-semibold text-primary-foreground/90 mb-3">Pillars of Islam</h3>
      <div className="grid grid-cols-5 gap-2">
        {shortcuts.map((shortcut, index) => (
          <button
            key={index}
            className="flex flex-col items-center gap-2 p-3 glass rounded-2xl border border-primary-foreground/10 hover:scale-105 transition-all duration-300 group"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${shortcut.color} flex items-center justify-center shadow-soft group-hover:shadow-glow transition-shadow`}>
              <shortcut.icon className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-[10px] font-medium text-primary-foreground/80">{shortcut.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickShortcuts;
