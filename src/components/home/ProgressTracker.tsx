import React from "react";
import { TrendingUp, Target, Flame, BookOpen, ChevronRight, HandHeart } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { useNavigate } from "react-router-dom";

const ProgressTracker: React.FC = () => {
  const { progress } = useProgress();
  const navigate = useNavigate();

  const stats = [
    {
      label: "Salat",
      value: `${progress.prayersCompleted.length}/5`,
      icon: Target,
      progress: (progress.prayersCompleted.length / 5) * 100,
      color: "from-indigo-500 to-blue-600",
    },
    {
      label: "Streak",
      value: `${progress.streak}d`,
      icon: Flame,
      progress: Math.min((progress.streak / 30) * 100, 100),
      color: "from-orange-500 to-red-500",
    },
    {
      label: "Quran",
      value: `${progress.quranPagesRead}pg`,
      icon: BookOpen,
      progress: Math.min((progress.quranPagesRead / 20) * 100, 100),
      color: "from-emerald-500 to-teal-600",
    },
    {
      label: "Duas",
      value: `${progress.duasRead ?? 0}`,
      icon: HandHeart,
      progress: Math.min(((progress.duasRead ?? 0) / 10) * 100, 100),
      color: "from-purple-500 to-violet-600",
    },
  ];

  return (
    <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
      <button
        onClick={() => navigate("/progress")}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-semibold text-foreground">Today's Progress</h3>
        </div>
        <div className="flex items-center gap-1 text-indigo-400 group-hover:text-indigo-600 transition-colors">
          <span className="text-[11px] font-medium">View all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </button>

      <button
        onClick={() => navigate("/progress")}
        className="w-full grid grid-cols-4 gap-2 active:scale-[0.98] transition-all"
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            className="relative bg-white dark:bg-white/5 rounded-2xl p-2.5 border border-indigo-100 dark:border-indigo-800 overflow-hidden shadow-sm"
          >
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-1.5 shadow-sm`}>
              <stat.icon className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-base font-black text-foreground leading-none">{stat.value}</p>
            <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000`}
                style={{ width: `${stat.progress}%` }}
              />
            </div>
            <p className="text-[9px] text-muted-foreground mt-1 font-medium">{stat.label}</p>
          </div>
        ))}
      </button>
    </div>
  );
};

export default ProgressTracker;
