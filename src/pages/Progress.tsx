import React, { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target, Flame, BookOpen, CheckCircle2, Circle, Plus, Minus, TrendingUp, Award, Star } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";

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
  const { progress, togglePrayer, addQuranPages } = useProgress();
  const [quranInput, setQuranInput] = useState(1);

  const prayersCount = progress.prayersCompleted.length;
  const prayerPercent = Math.round((prayersCount / 5) * 100);
  const quranPercent = Math.min(Math.round((progress.quranPagesRead / 20) * 100), 100);
  const streakPercent = Math.min(Math.round((progress.streak / 30) * 100), 100);

  const today = new Date().toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long" });

  return (
    <MobileLayout>
      <div className="p-4 space-y-5 pb-8">

        {/* Header */}
        <header className="flex items-center gap-3 py-3">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/60 dark:bg-white/5 border border-indigo-100 dark:border-indigo-800"
          >
            <ArrowLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
          </button>
          <div>
            <h1 className="font-bold text-lg text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Daily Progress
            </h1>
            <p className="text-xs text-muted-foreground">{today}</p>
          </div>
        </header>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Prayers", value: `${prayersCount}/5`, icon: Target, color: "from-indigo-500 to-blue-600", percent: prayerPercent },
            { label: "Streak", value: `${progress.streak}d`, icon: Flame, color: "from-orange-500 to-red-500", percent: streakPercent },
            { label: "Quran", value: `${progress.quranPagesRead}pg`, icon: BookOpen, color: "from-emerald-500 to-teal-600", percent: quranPercent },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-white/5 rounded-2xl p-3 border border-indigo-100 dark:border-indigo-800 shadow-sm">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 shadow-sm`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-lg font-black text-foreground">{stat.value}</p>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000`}
                  style={{ width: `${stat.percent}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Prayer tracker */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-indigo-100 dark:border-indigo-800 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-indigo-50 dark:border-indigo-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-foreground">Today's Prayers</h3>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              prayersCount === 5
                ? "bg-green-100 text-green-600"
                : "bg-indigo-50 text-indigo-500"
            }`}>
              {prayersCount === 5 ? "✅ Complete!" : `${prayersCount}/5`}
            </span>
          </div>
          <div className="p-3 flex flex-col gap-2">
            {PRAYERS.map((prayer) => {
              const done = progress.prayersCompleted.includes(prayer);
              return (
                <button
                  key={prayer}
                  onClick={() => togglePrayer(prayer)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all active:scale-95 ${
                    done
                      ? "bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700"
                      : "bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    done
                      ? `bg-gradient-to-br ${PRAYER_COLORS[prayer]} shadow-sm`
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}>
                    {done
                      ? <CheckCircle2 className="w-5 h-5 text-white" />
                      : <Circle className="w-5 h-5 text-gray-400" />
                    }
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${done ? "text-indigo-700 dark:text-indigo-300" : "text-gray-600 dark:text-gray-300"}`}>
                      {prayer}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{done ? "Completed ✓" : "Tap to mark done"}</p>
                  </div>
                  {done && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quran tracker */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-indigo-100 dark:border-indigo-800 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-indigo-50 dark:border-indigo-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-foreground">Quran Reading</h3>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
              {progress.quranPagesRead} pages today
            </span>
          </div>
          <div className="p-4">
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                style={{ width: `${quranPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mb-4 text-center">{progress.quranPagesRead} / 20 pages goal</p>

            {/* Page input */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setQuranInput(Math.max(1, quranInput - 1))}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center active:scale-90 transition-all"
              >
                <Minus className="w-4 h-4 text-gray-600" />
              </button>
              <div className="text-center">
                <p className="text-2xl font-black text-foreground">{quranInput}</p>
                <p className="text-[10px] text-muted-foreground">pages</p>
              </div>
              <button
                onClick={() => setQuranInput(quranInput + 1)}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center active:scale-90 transition-all"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <button
              onClick={() => { addQuranPages(quranInput); setQuranInput(1); }}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-sm active:scale-95 transition-all"
            >
              + Add {quranInput} {quranInput === 1 ? "page" : "pages"}
            </button>
          </div>
        </div>

        {/* Streak info */}
        <div className="rounded-2xl p-4 text-white" style={{ background: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)" }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Flame className="w-7 h-7 text-white fill-white" />
            </div>
            <div>
              <p className="font-black text-xl">{progress.streak} Day Streak 🔥</p>
              <p className="text-xs text-orange-100">
                {progress.streak === 0
                  ? "Start your streak by completing prayers or reading Quran!"
                  : progress.streak < 7
                  ? "Keep going! You're building a great habit."
                  : progress.streak < 30
                  ? "Amazing consistency! Keep it up!"
                  : "Mashallah! You're a dedicated Muslim! 🌟"}
              </p>
            </div>
          </div>
          {progress.streak > 0 && (
            <div className="mt-3 flex gap-1">
              {Array.from({ length: Math.min(progress.streak, 7) }).map((_, i) => (
                <div key={i} className="flex-1 h-1.5 bg-white/40 rounded-full" />
              ))}
              {Array.from({ length: Math.max(0, 7 - progress.streak) }).map((_, i) => (
                <div key={i} className="flex-1 h-1.5 bg-white/15 rounded-full" />
              ))}
            </div>
          )}
        </div>

        {/* Achievement */}
        {prayersCount === 5 && (
          <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-white flex items-center gap-3">
            <Award className="w-10 h-10 text-white" />
            <div>
              <p className="font-black">All 5 Prayers Complete! 🎉</p>
              <p className="text-xs text-amber-100">MashAllah! May Allah accept your prayers.</p>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Progress;
