import React from 'react';
import { TrendingUp, Target, Award } from 'lucide-react';

const ProgressTracker: React.FC = () => {
  const stats = [
    { label: 'Prayers', value: '4/5', icon: Target, progress: 80 },
    { label: 'Streak', value: '12 days', icon: TrendingUp, progress: 60 },
    { label: 'Quran', value: '3 pages', icon: Award, progress: 45 },
  ];

  return (
    <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
      <h3 className="text-sm font-semibold text-gradient-gold drop-shadow-lg mb-3">Today's Progress</h3>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="glass rounded-2xl p-3 border border-white/20"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-4 h-4 text-amber-400" />
              <span className="text-lg font-bold text-white">{stat.value}</span>
            </div>
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full gradient-accent rounded-full transition-all duration-1000"
                style={{ width: `${stat.progress}%` }}
              />
            </div>
            <p className="text-[10px] text-white/70 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;
