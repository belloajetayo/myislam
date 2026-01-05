import React from 'react';
import { BookOpen, Droplets, Moon, MapPin, HandHeart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const shortcuts = [
  { icon: BookOpen, label: 'Quran', color: 'from-emerald-500 to-teal-600', shadowColor: 'emerald', description: 'Holy Quran', route: '/quran' },
  { icon: HandHeart, label: 'Salat', color: 'from-blue-500 to-indigo-600', shadowColor: 'blue', description: 'Daily Prayers', route: '/prayer' },
  { icon: Droplets, label: 'Zakat', color: 'from-amber-500 to-orange-600', shadowColor: 'amber', description: 'Charity', route: '/zakat' },
  { icon: Moon, label: 'Sawm', color: 'from-purple-500 to-violet-600', shadowColor: 'purple', description: 'Fasting', route: '/fasting' },
  { icon: MapPin, label: 'Hajj', color: 'from-rose-500 to-pink-600', shadowColor: 'rose', description: 'Pilgrimage', route: '/hajj' },
];

const QuickShortcuts: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Pillars of Islam</h3>
        <div className="h-px flex-1 ml-3 bg-gradient-to-r from-border to-transparent" />
      </div>
      <div className="grid grid-cols-5 gap-2.5">
        {shortcuts.map((shortcut, index) => (
          <button
            key={index}
            onClick={() => navigate(shortcut.route)}
            className="flex flex-col items-center gap-2 p-3 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-card active:scale-95 transition-all duration-300 group"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${shortcut.color} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
              <shortcut.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-semibold text-foreground">{shortcut.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickShortcuts;
