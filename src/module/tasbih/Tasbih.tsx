import React, { useState, useEffect, useCallback, useRef } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Vibrate,
  Sparkles,
  Trophy,
  ChevronRight,
  Flame,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface DhikrItem {
  id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  defaultTarget: number;
}

const DHIKR_LIST: DhikrItem[] = [
  {
    id: "subhanallah",
    arabic: "سُبْحَانَ ٱللَّهِ",
    transliteration: "SubhanAllah",
    meaning: "Glory be to Allah",
    defaultTarget: 33,
  },
  {
    id: "alhamdulillah",
    arabic: "ٱلْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    meaning: "All praise is due to Allah",
    defaultTarget: 33,
  },
  {
    id: "allahuakbar",
    arabic: "ٱللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    meaning: "Allah is the Greatest",
    defaultTarget: 33,
  },
  {
    id: "astaghfirullah",
    arabic: "أَسْتَغْفِرُ ٱللَّهَ",
    transliteration: "Astaghfirullah",
    meaning: "I seek forgiveness from Allah",
    defaultTarget: 100,
  },
  {
    id: "lailahaillallah",
    arabic: "لَا إِلَٰهَ إِلَّا ٱللَّهُ",
    transliteration: "La ilaha illallah",
    meaning: "There is no deity except Allah",
    defaultTarget: 100,
  },
  {
    id: "subhanallahi_bihamdihi",
    arabic: "سُبْحَانَ ٱللَّهِ وَبِحَمْدِهِ",
    transliteration: "SubhanAllahi wa bihamdihi",
    meaning: "Glory be to Allah and His is the praise",
    defaultTarget: 100,
  },
  {
    id: "salawat",
    arabic: "ٱللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ",
    transliteration: "Allahumma salli 'ala Muhammad",
    meaning: "O Allah, send blessings upon Muhammad",
    defaultTarget: 100,
  },
  {
    id: "hawqalah",
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّهِ",
    transliteration: "La hawla wa la quwwata illa billah",
    meaning: "There is no power nor strength except with Allah",
    defaultTarget: 100,
  },
];

const TARGET_PRESETS = [33, 99, 100, 1000];

export const Tasbih: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDhikr, setSelectedDhikr] = useState<DhikrItem>(DHIKR_LIST[0]);
  const [count, setCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [laps, setLaps] = useState<number>(0);
  const [totalLifetime, setTotalLifetime] = useState<number>(() => {
    const val = localStorage.getItem("tasbih_total_lifetime");
    return val ? parseInt(val, 10) : 0;
  });
  const [todayCount, setTodayCount] = useState<number>(() => {
    const today = new Date().toISOString().slice(0, 10);
    const savedDate = localStorage.getItem("tasbih_today_date");
    if (savedDate === today) {
      return parseInt(localStorage.getItem("tasbih_today_count") || "0", 10);
    }
    return 0;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem("tasbih_sound") !== "false";
  });
  const [vibrateEnabled, setVibrateEnabled] = useState<boolean>(() => {
    return localStorage.getItem("tasbih_vibrate") !== "false";
  });
  const [isPressing, setIsPressing] = useState<boolean>(false);

  // Web Audio click tone synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playClickSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // AudioContext unavailable
    }
  }, [soundEnabled]);

  // Vibrate
  const triggerHaptic = useCallback(
    (duration = 35) => {
      if (!vibrateEnabled || typeof navigator === "undefined") return;
      try {
        navigator.vibrate?.(duration);
      } catch {
        // Vibrate unavailable
      }
    },
    [vibrateEnabled]
  );

  // Increment counter
  const handleIncrement = () => {
    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 120);

    playClickSound();

    const nextCount = count + 1;
    const nextLifetime = totalLifetime + 1;
    const nextToday = todayCount + 1;

    setTotalLifetime(nextLifetime);
    setTodayCount(nextToday);

    localStorage.setItem("tasbih_total_lifetime", String(nextLifetime));
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem("tasbih_today_date", today);
    localStorage.setItem("tasbih_today_count", String(nextToday));

    if (nextCount >= target) {
      setCount(0);
      setLaps((prev) => prev + 1);
      triggerHaptic(120);
      toast.success(`Completed 1 round (${target} ${selectedDhikr.transliteration})! 🎉`, {
        duration: 2500,
      });
    } else {
      setCount(nextCount);
      triggerHaptic(30);
    }
  };

  // Reset
  const handleReset = () => {
    setCount(0);
    setLaps(0);
    triggerHaptic(50);
    toast.info("Counter reset for current dhikr session");
  };

  // Change Dhikr
  const handleSelectDhikr = (dhikr: DhikrItem) => {
    setSelectedDhikr(dhikr);
    setTarget(dhikr.defaultTarget);
    setCount(0);
    setLaps(0);
  };

  // Percentage progress
  const progressPercent = Math.min(100, Math.round((count / target) * 100));

  // Circular progress SVG calculations
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <MobileLayout>
      <div className="p-4 space-y-4 max-w-lg mx-auto pb-24">
        {/* Header */}
        <header className="flex items-center justify-between py-2">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/70 dark:bg-white/10 border border-border/60 hover:bg-muted active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gradient-gold">Digital Tasbih</h1>
            <p className="text-xs text-muted-foreground">Praise & Remembrance of Allah</p>
          </div>
          <button
            onClick={handleReset}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/70 dark:bg-white/10 border border-border/60 hover:bg-muted active:scale-95 transition-all shadow-sm text-muted-foreground hover:text-foreground"
            title="Reset Counter"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-border/50 backdrop-blur-sm">
            <div className="text-[10px] text-muted-foreground font-semibold flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              Today
            </div>
            <div className="text-lg font-black text-foreground mt-0.5">{todayCount}</div>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-border/50 backdrop-blur-sm">
            <div className="text-[10px] text-muted-foreground font-semibold flex items-center justify-center gap-1">
              <Check className="w-3 h-3 text-emerald-500" />
              Rounds
            </div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {laps}
            </div>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-border/50 backdrop-blur-sm">
            <div className="text-[10px] text-muted-foreground font-semibold flex items-center justify-center gap-1">
              <Trophy className="w-3 h-3 text-amber-500" />
              Lifetime
            </div>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {totalLifetime}
            </div>
          </div>
        </div>

        {/* Active Dhikr Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600/15 via-teal-500/10 to-transparent border border-emerald-500/30 text-center space-y-2 relative overflow-hidden shadow-soft">
          <div className="font-arabic text-3xl sm:text-4xl text-foreground font-bold leading-relaxed">
            {selectedDhikr.arabic}
          </div>
          <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
            {selectedDhikr.transliteration}
          </div>
          <div className="text-xs text-muted-foreground italic max-w-xs mx-auto">
            "{selectedDhikr.meaning}"
          </div>
        </div>

        {/* MAIN BEAD / PROGRESS COUNTER BUTTON */}
        <div className="flex flex-col items-center justify-center py-4 relative">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* SVG Circular Ring */}
            <svg className="w-full h-full transform -rotate-90 pointer-events-none">
              {/* Background circle */}
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                className="stroke-muted/40"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Animated Progress circle */}
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                className="stroke-emerald-500 transition-all duration-150 ease-out"
                strokeWidth="10"
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>

            {/* Inner Tap Area */}
            <button
              onClick={handleIncrement}
              className={`absolute inset-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 shadow-xl flex flex-col items-center justify-center text-white transition-transform duration-100 active:scale-95 ${
                isPressing ? "scale-95 shadow-md" : "scale-100 hover:scale-[1.02]"
              }`}
              style={{
                boxShadow: "0 14px 35px -8px rgba(16, 185, 129, 0.45)",
              }}
            >
              <span className="text-5xl sm:text-6xl font-black tracking-tight">{count}</span>
              <span className="text-xs font-semibold text-emerald-100 mt-1 uppercase tracking-wider">
                Target: {target}
              </span>
              <span className="text-[11px] text-emerald-200 mt-0.5">
                {progressPercent}% Complete
              </span>
            </button>
          </div>
        </div>

        {/* Sound & Haptics Toggles */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              localStorage.setItem("tasbih_sound", String(next));
            }}
            className={`rounded-2xl text-xs h-9 px-3 gap-1.5 ${
              soundEnabled ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" : "text-muted-foreground"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            Sound {soundEnabled ? "On" : "Off"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const next = !vibrateEnabled;
              setVibrateEnabled(next);
              localStorage.setItem("tasbih_vibrate", String(next));
            }}
            className={`rounded-2xl text-xs h-9 px-3 gap-1.5 ${
              vibrateEnabled ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" : "text-muted-foreground"
            }`}
          >
            <Vibrate className="w-3.5 h-3.5" />
            Vibrate {vibrateEnabled ? "On" : "Off"}
          </Button>
        </div>

        {/* Target Presets */}
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-muted-foreground px-1">Round Target:</div>
          <div className="grid grid-cols-4 gap-2">
            {TARGET_PRESETS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTarget(t);
                  setCount(0);
                  triggerHaptic(30);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  target === t
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                    : "bg-white/60 dark:bg-white/5 border border-border/50 text-foreground hover:bg-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Dhikr Selector List */}
        <div className="space-y-2 pt-2">
          <div className="text-xs font-semibold text-muted-foreground px-1">
            Choose Dhikr (Azkar):
          </div>
          <div className="space-y-1.5">
            {DHIKR_LIST.map((item) => {
              const isSelected = selectedDhikr.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectDhikr(item)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                    isSelected
                      ? "bg-emerald-500/15 border border-emerald-500/40 text-foreground"
                      : "bg-white/60 dark:bg-white/5 hover:bg-muted/70 border border-border/40 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.defaultTarget}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{item.transliteration}</div>
                      <div className="text-xs text-muted-foreground">{item.meaning}</div>
                    </div>
                  </div>
                  <div className="font-arabic text-xl text-emerald-600 dark:text-emerald-400 font-bold">
                    {item.arabic}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Tasbih;
