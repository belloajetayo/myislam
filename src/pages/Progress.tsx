import React, { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Target,
  Flame,
  BookOpen,
  CheckCircle2,
  Circle,
  Plus,
  Minus,
  TrendingUp,
  Award,
  Star,
  HandHeart,
  ChevronRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { toast } from "sonner";

const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const PRAYER_COLORS: Record<string, string> = {
  Fajr: "from-violet-500 to-indigo-600",
  Dhuhr: "from-amber-500 to-orange-500",
  Asr: "from-sky-500 to-blue-600",
  Maghrib: "from-rose-500 to-pink-600",
  Isha: "from-indigo-600 to-purple-700",
};

const Progress: React.FC = () => {
  const navigate = useNavigate();
  const {
    progress,
    togglePrayer,
    toggleAllPrayers,
    addQuranPages,
    addDua,
    resetDailyProgress,
  } = useProgress();
  const [quranInput, setQuranInput] = useState(1);

  const prayersCount = progress.prayersCompleted.length;
  const prayerPercent = Math.round((prayersCount / 5) * 100);
  const quranPercent = Math.min(Math.round((progress.quranPagesRead / 20) * 100), 100);
  const streakPercent = Math.min(Math.round((progress.streak / 30) * 100), 100);
  const duasCount = progress.duasRead ?? 0;
  const duasPercent = Math.min(Math.round((duasCount / 10) * 100), 100);

  const today = new Date().toLocaleDateString("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleReset = () => {
    resetDailyProgress();
    toast.info("Daily tracking reset for today.");
  };

  return (
    <MobileLayout>
      <div className="p-4 space-y-5 pb-12 max-w-lg mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between py-2">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/70 dark:bg-white/10 border border-indigo-100 dark:border-indigo-800 hover:bg-muted active:scale-95 transition-all shadow-sm"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
          </button>
          <div className="text-center flex-1 mx-2">
            <h1 className="font-bold text-lg text-foreground flex items-center justify-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Daily Progress
            </h1>
            <p className="text-xs text-muted-foreground">{today}</p>
          </div>
          <button
            onClick={handleReset}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/70 dark:bg-white/10 border border-indigo-100 dark:border-indigo-800 hover:bg-muted active:scale-95 transition-all shadow-sm text-muted-foreground hover:text-foreground"
            title="Reset Today's Counters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </header>

        {/* 4 Core Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            {
              label: "Salat",
              value: `${prayersCount}/5`,
              icon: Target,
              color: "from-indigo-500 to-blue-600",
              percent: prayerPercent,
            },
            {
              label: "Streak",
              value: `${progress.streak}d`,
              icon: Flame,
              color: "from-orange-500 to-red-500",
              percent: streakPercent,
            },
            {
              label: "Quran",
              value: `${progress.quranPagesRead}pg`,
              icon: BookOpen,
              color: "from-emerald-500 to-teal-600",
              percent: quranPercent,
            },
            {
              label: "Duas",
              value: `${duasCount}`,
              icon: HandHeart,
              color: "from-purple-500 to-pink-600",
              percent: duasPercent,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white dark:bg-white/5 rounded-2xl p-3 border border-indigo-100 dark:border-indigo-800 shadow-sm"
            >
              <div
                className={`w-8 h-8 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-1.5 shadow-sm`}
              >
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-lg font-black text-foreground">{stat.value}</p>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-700`}
                  style={{ width: `${stat.percent}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Prayer Tracker Section */}
        <div className="bg-white dark:bg-white/5 rounded-3xl border border-indigo-100 dark:border-indigo-800 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-indigo-50 dark:border-indigo-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-foreground">Today's Prayers (Salat)</h3>
            </div>
            <button
              onClick={() => {
                toggleAllPrayers();
                toast.success(
                  prayersCount === 5
                    ? "Reset all prayers for today"
                    : "Masha'Allah! Marked all 5 prayers as completed 🎉"
                );
              }}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {prayersCount === 5 ? "Unmark All" : "Mark All Done"}
            </button>
          </div>
          <div className="p-3 flex flex-col gap-2">
            {PRAYERS.map((prayer) => {
              const done = progress.prayersCompleted.includes(prayer);
              return (
                <button
                  key={prayer}
                  onClick={() => {
                    togglePrayer(prayer);
                    if (!done) {
                      toast.success(`Marked ${prayer} as completed! Masha'Allah ✨`);
                    }
                  }}
                  className={`flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-[0.98] ${
                    done
                      ? "bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-700 shadow-sm"
                      : "bg-gray-50/70 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:bg-gray-100/50"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform ${
                      done
                        ? `bg-gradient-to-br ${PRAYER_COLORS[prayer]} shadow-sm scale-105`
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p
                      className={`text-sm font-bold ${
                        done
                          ? "text-indigo-700 dark:text-indigo-300"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {prayer}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {done ? "Completed ✓" : "Tap to log completion"}
                    </p>
                  </div>
                  {done && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quran Tracker */}
        <div className="bg-white dark:bg-white/5 rounded-3xl border border-indigo-100 dark:border-indigo-800 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-indigo-50 dark:border-indigo-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-foreground">Quran Reading</h3>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
              {progress.quranPagesRead} pages today
            </span>
          </div>
          <div className="p-4">
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                style={{ width: `${quranPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mb-4 text-center">
              {progress.quranPagesRead} / 20 pages daily goal
            </p>

            {/* Page input controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setQuranInput(Math.max(1, quranInput - 1))}
                className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center active:scale-90 transition-all"
                aria-label="Decrease pages"
              >
                <Minus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="text-center min-w-[60px]">
                <p className="text-2xl font-black text-foreground">{quranInput}</p>
                <p className="text-[10px] text-muted-foreground">pages</p>
              </div>
              <button
                onClick={() => setQuranInput(quranInput + 1)}
                className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center active:scale-90 transition-all"
                aria-label="Increase pages"
              >
                <Plus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  addQuranPages(quranInput);
                  toast.success(`Logged ${quranInput} Quran ${quranInput === 1 ? "page" : "pages"}! ✨`);
                  setQuranInput(1);
                }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-sm active:scale-95 transition-all"
              >
                + Add {quranInput} {quranInput === 1 ? "page" : "pages"}
              </button>
              <button
                onClick={() => navigate("/quran")}
                className="px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs active:scale-95 transition-all"
              >
                Open Mushaf
              </button>
            </div>
          </div>
        </div>

        {/* Duas & Adhkar Tracker */}
        <div className="bg-white dark:bg-white/5 rounded-3xl border border-indigo-100 dark:border-indigo-800 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-indigo-50 dark:border-indigo-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HandHeart className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-bold text-foreground">Duas & Adhkar</h3>
            </div>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-full">
              {duasCount} recited today
            </span>
          </div>
          <div className="p-4 space-y-3">
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                style={{ width: `${duasPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {duasCount} / 10 daily duas goal
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  addDua(1);
                  toast.success("Recited 1 Dua! Logged to progress 🤲");
                }}
                className="flex-1 py-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold text-xs active:scale-95 transition-all"
              >
                +1 Dua
              </button>
              <button
                onClick={() => {
                  addDua(5);
                  toast.success("Recited 5 Duas! Masha'Allah 🌟");
                }}
                className="flex-1 py-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold text-xs active:scale-95 transition-all"
              >
                +5 Duas
              </button>
              <button
                onClick={() => navigate("/duas")}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1 active:scale-95 transition-all"
              >
                <span>Duas Library</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Streak Info Card */}
        <div
          className="rounded-3xl p-5 text-white shadow-md relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)" }}
        >
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Flame className="w-7 h-7 text-white fill-white" />
            </div>
            <div>
              <p className="font-black text-xl">{progress.streak} Day Streak 🔥</p>
              <p className="text-xs text-orange-100 mt-0.5 leading-snug">
                {progress.streak === 0
                  ? "Complete your prayers, read Quran, or recite duas today to start your streak!"
                  : progress.streak < 7
                  ? "Great start! You're building consistency in your daily worship."
                  : progress.streak < 30
                  ? "Incredible dedication! Keep shining with daily deeds."
                  : "MashAllah! You are maintaining an inspiring spiritual habit! 🌟"}
              </p>
            </div>
          </div>
          {progress.streak > 0 && (
            <div className="mt-4 flex gap-1.5 relative z-10">
              {Array.from({ length: Math.min(progress.streak, 7) }).map((_, i) => (
                <div key={i} className="flex-1 h-2 bg-white rounded-full shadow-sm" />
              ))}
              {Array.from({ length: Math.max(0, 7 - progress.streak) }).map((_, i) => (
                <div key={i} className="flex-1 h-2 bg-white/20 rounded-full" />
              ))}
            </div>
          )}
        </div>

        {/* Achievement Badge when all 5 prayers done */}
        {prayersCount === 5 && (
          <div className="rounded-3xl p-4 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500 text-white flex items-center gap-3 shadow-md animate-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-black text-base">All 5 Daily Prayers Complete! 🎉</p>
              <p className="text-xs text-amber-100">MashAllah! May Allah accept all your worship today.</p>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Progress;
