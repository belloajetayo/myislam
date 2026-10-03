import { useState, useEffect } from "react";

export interface ProgressData {
  lastActiveDate: string;
  prayersCompleted: string[];
  quranPagesRead: number;
  duasRead: number;
  streak: number;
}

const STORAGE_KEY = "mia_user_progress";

const getTodayString = () => new Date().toISOString().split("T")[0];

const defaultProgress: ProgressData = {
  lastActiveDate: getTodayString(),
  prayersCompleted: [],
  quranPagesRead: 0,
  duasRead: 0,
  streak: 0,
};

export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ProgressData;

        // Reset daily stats if it's a new day
        const today = getTodayString();
        if (parsed.lastActiveDate !== today) {
          // Check if streak is broken (difference is > 1 day)
          const lastDate = new Date(parsed.lastActiveDate);
          const currentDate = new Date(today);
          const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let newStreak = parsed.streak;

          // Only maintain streak if they completed at least 1 prayer or read quran yesterday
          // and the difference is exactly 1 day.
          if (
            diffDays === 1 &&
            (parsed.prayersCompleted.length > 0 || parsed.quranPagesRead > 0)
          ) {
            newStreak += 1;
          } else if (
            diffDays > 1 ||
            (parsed.prayersCompleted.length === 0 &&
              parsed.quranPagesRead === 0)
          ) {
            newStreak = 0;
          }

          return {
            lastActiveDate: today,
            prayersCompleted: [], // reset daily
            quranPagesRead: 0, // reset daily
            duasRead: 0, // reset daily
            streak: newStreak,
          };
        }
        return { ...parsed, duasRead: parsed.duasRead ?? 0 };
      }
    } catch (e) {
      console.error("Error reading progress from localStorage", e);
    }
    return defaultProgress;
  });

  // Save to local storage whenever progress changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const togglePrayer = (prayerName: string) => {
    setProgress((prev) => {
      const isCompleted = prev.prayersCompleted.includes(prayerName);
      const newPrayers = isCompleted
        ? prev.prayersCompleted.filter((p) => p !== prayerName)
        : [...prev.prayersCompleted, prayerName];
      const hasActivity = newPrayers.length > 0 || prev.quranPagesRead > 0 || (prev.duasRead ?? 0) > 0;
      return {
        ...prev,
        lastActiveDate: getTodayString(),
        prayersCompleted: newPrayers,
        streak: prev.streak === 0 && hasActivity ? 1 : prev.streak,
      };
    });
  };

  const toggleAllPrayers = () => {
    setProgress((prev) => {
      const allPrayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
      const allDone = allPrayers.every((p) => prev.prayersCompleted.includes(p));
      const newPrayers = allDone ? [] : allPrayers;
      const hasActivity = newPrayers.length > 0 || prev.quranPagesRead > 0 || (prev.duasRead ?? 0) > 0;
      return {
        ...prev,
        lastActiveDate: getTodayString(),
        prayersCompleted: newPrayers,
        streak: prev.streak === 0 && hasActivity ? 1 : prev.streak,
      };
    });
  };

  const addQuranPages = (pages: number) => {
    setProgress((prev) => {
      const newPages = prev.quranPagesRead + pages;
      return {
        ...prev,
        lastActiveDate: getTodayString(),
        quranPagesRead: newPages,
        streak: prev.streak === 0 && newPages > 0 ? 1 : prev.streak,
      };
    });
  };

  const addDua = (count = 1) => {
    setProgress((prev) => {
      const newDuas = (prev.duasRead ?? 0) + count;
      return {
        ...prev,
        lastActiveDate: getTodayString(),
        duasRead: newDuas,
        streak: prev.streak === 0 && newDuas > 0 ? 1 : prev.streak,
      };
    });
  };

  const resetDailyProgress = () => {
    setProgress((prev) => ({
      ...prev,
      lastActiveDate: getTodayString(),
      prayersCompleted: [],
      quranPagesRead: 0,
      duasRead: 0,
    }));
  };

  return {
    progress,
    togglePrayer,
    toggleAllPrayers,
    addQuranPages,
    addDua,
    resetDailyProgress,
  };
}
