import React from 'react';
import { TrendingUp, Target, Award, Flame } from 'lucide-react';

const ProgressTracker: React.FC = () => {
  const stats = [
    { label: 'Prayers', value: '4/5', icon: Target, progress: 80, color: 'from-blue-500 to-indigo-600' },
    { label: 'Streak', value: '12', icon: Flame, progress: 60, color: 'from-orange-500 to-red-500' },
    { label: 'Quran', value: '3 pg', icon: Award, progress: 45, color: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Today's Progress</h3>
        <TrendingUp className="w-4 h-4 text-islamic-green" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="relative bg-card rounded-2xl p-4 border border-border overflow-hidden group hover:shadow-card transition-all duration-300"
          >
            {/* Background gradient accent */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-foreground">{stat.value}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${stat.progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;
