import React from "react";
import { TrendingUp, Target, Flame, BookOpen, ChevronRight } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { useNavigate } from "react-router-dom";

const ProgressTracker: React.FC = () => {
  const { progress } = useProgress();
  const navigate = useNavigate();

  const prayersProgress = (progress.prayersCompleted.length / 5) * 100;
  const quranProgress = Math.min((progress.quranPagesRead / 20) * 100, 100);
  const streakProgress = Math.min((progress.streak / 30) * 100, 100);

  const stats = [
    {
      label: "Prayers",
      value: `${progress.prayersCompleted.length}/5`,
      icon: Target,
      progress: prayersProgress,
      color: "from-indigo-500 to-blue-600",
    },
    {
      label: "Streak",
      value: `${progress.streak}d`,
      icon: Flame,
      progress: streakProgress,
      color: "from-orange-500 to-red-500",
    },
    {
      label: "Quran",
      value: `${progress.quranPagesRead}pg`,
      icon: BookOpen,
      progress: quranProgress,
      color: "from-emerald-500 to-teal-600",
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
        className="w-full grid grid-cols-3 gap-3 active:scale-[0.98] transition-all"
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            className="relative bg-white dark:bg-white/5 rounded-2xl p-3 border border-indigo-100 dark:border-indigo-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 hover:opacity-5 transition-opacity duration-300`} />
            <div className="relative">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 shadow-sm`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-lg font-black text-foreground">{stat.value}</p>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${stat.progress}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </button>
    </div>
  );
};

export default ProgressTracker;
