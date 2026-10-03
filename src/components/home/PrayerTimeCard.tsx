import React from "react";
import { Clock, MapPin, ChevronRight, Check, Compass, Sparkles, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useProgress } from "@/hooks/useProgress";
import { toast } from "sonner";

interface PrayerTimeCardProps {
  onAskMIA?: (question: string) => void;
}

const PRAYERS_CONFIG = [
  {
    name: "Fajr",
    arabic: "الفجر",
    color: "from-indigo-500 to-purple-600",
    isFard: true,
  },
  {
    name: "Sunrise",
    arabic: "الشروق",
    color: "from-amber-400 to-orange-500",
    isFard: false,
  },
  {
    name: "Dhuhr",
    arabic: "الظهر",
    color: "from-orange-500 to-amber-600",
    isFard: true,
  },
  {
    name: "Asr",
    arabic: "العصر",
    color: "from-sky-500 to-blue-600",
    isFard: true,
  },
  {
    name: "Maghrib",
    arabic: "المغرب",
    color: "from-rose-500 to-pink-600",
    isFard: true,
  },
  {
    name: "Isha",
    arabic: "العشاء",
    color: "from-blue-600 to-indigo-700",
    isFard: true,
  },
];

const formatTime12 = (time24?: string) => {
  if (!time24) return "--:--";
  const clean = time24.split(" ")[0];
  const [hStr, mStr] = clean.split(":");
  const hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr, 10);
  if (isNaN(hours) || isNaN(minutes)) return clean;
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

const PrayerTimeCard: React.FC<PrayerTimeCardProps> = ({ onAskMIA }) => {
  const navigate = useNavigate();
  const { prayerTimes, location, hijriDate, currentPrayer, nextPrayer, loading } = usePrayerTimes();
  const { progress, togglePrayer } = useProgress();

  const hijriStr = hijriDate
    ? `${hijriDate.day} ${hijriDate.month.en} ${hijriDate.year} AH`
    : "";

  const locationStr = location?.city
    ? `${location.city}${location.country ? `, ${location.country}` : ""}`
    : "Your Location";

  // Calculate time remaining until next prayer
  const getTimeUntilNext = () => {
    if (!prayerTimes || !nextPrayer) return "";
    const nextTime = prayerTimes[nextPrayer as keyof typeof prayerTimes];
    if (!nextTime) return "";
    const now = new Date();
    const clean = nextTime.split(" ")[0];
    const [hours, minutes] = clean.split(":").map(Number);
    const nextDate = new Date();
    nextDate.setHours(hours, minutes, 0, 0);
    if (nextDate < now) nextDate.setDate(nextDate.getDate() + 1);
    const diff = nextDate.getTime() - now.getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const handleTogglePrayed = (prayerName: string) => {
    const isCompleted = progress.prayersCompleted.includes(prayerName);
    togglePrayer(prayerName);
    if (!isCompleted) {
      toast.success(`Marked ${prayerName} as prayed! Masha'Allah ✨`);
    } else {
      toast.info(`Unmarked ${prayerName}`);
    }
  };

  const activePrayerName = currentPrayer || nextPrayer || "Fajr";
  const activePrayerArabic = PRAYERS_CONFIG.find((p) => p.name === activePrayerName)?.arabic || "";
  const activePrayerTime = prayerTimes ? formatTime12(prayerTimes[activePrayerName as keyof typeof prayerTimes]) : "--:--";
  const countdown = getTimeUntilNext();

  return (
    <div
      className="relative bg-white dark:bg-card rounded-3xl p-5 shadow-card border border-indigo-100 dark:border-border overflow-hidden animate-slide-up"
      style={{ animationDelay: "0.2s" }}
    >
      {/* Soft background glow accents */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-indigo-500/10 via-sky-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-xl pointer-events-none" />

      <div className="relative space-y-4">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Prayer Times</h3>
                <span className="text-[10px] font-arabic text-indigo-500 font-semibold">مواقيت الصلاة</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                <span className="truncate max-w-[180px]">{loading ? "Locating..." : locationStr}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/prayer")}
            className="flex items-center gap-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors py-1 px-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
          >
            <span>Full view</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Current / Next Prayer Highlight Hero Banner */}
        <div
          className="relative rounded-2xl p-4 text-white overflow-hidden shadow-md"
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 50%, #0284c7 100%)",
          }}
        >
          <div className="absolute -right-4 -bottom-6 text-white/10 font-arabic text-8xl font-black select-none pointer-events-none">
            {activePrayerArabic}
          </div>

          <div className="relative flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-semibold text-white mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {currentPrayer ? "Current Prayer" : "Next Prayer"}
              </div>
              <div className="flex items-baseline gap-2">
                <h4 className="text-2xl font-black tracking-tight">{activePrayerName}</h4>
                <span className="text-lg font-arabic text-indigo-200">{activePrayerArabic}</span>
              </div>
              <p className="text-xs text-indigo-100 mt-0.5 font-medium">{hijriStr || "Today's Schedule"}</p>
            </div>

            <div className="text-right">
              <p className="text-2xl font-black tracking-tight">{loading ? "..." : activePrayerTime}</p>
              {countdown && (
                <p className="text-[11px] font-semibold text-sky-200 mt-0.5">
                  {nextPrayer === activePrayerName ? `in ${countdown}` : `Next: ${nextPrayer} in ${countdown}`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Prayers List with Checkmark Tracking */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
            <span>Schedule</span>
            <span>Check to log</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {PRAYERS_CONFIG.map((prayer) => {
              const rawTime = prayerTimes ? prayerTimes[prayer.name as keyof typeof prayerTimes] : undefined;
              const formatted = formatTime12(rawTime);
              const isCurrent = currentPrayer === prayer.name;
              const isNext = nextPrayer === prayer.name && !isCurrent;
              const isPrayed = progress.prayersCompleted.includes(prayer.name);

              return (
                <div
                  key={prayer.name}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all duration-200 ${
                    isCurrent
                      ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-sm"
                      : "bg-gray-50/60 dark:bg-white/5 border-gray-100 dark:border-gray-800/80 hover:bg-gray-100/50 dark:hover:bg-white/10"
                  }`}
                >
                  {/* Left: icon & names */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${prayer.color} flex items-center justify-center text-white text-xs font-arabic font-bold shadow-sm shrink-0`}
                    >
                      {prayer.arabic.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{prayer.name}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-500 text-white leading-tight">
                            Now
                          </span>
                        )}
                        {isNext && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-sky-500 text-white leading-tight">
                            Next
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-arabic text-muted-foreground">{prayer.arabic}</span>
                    </div>
                  </div>

                  {/* Right: time + prayed check button */}
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200 tracking-tight">
                      {loading ? "..." : formatted}
                    </span>

                    {prayer.isFard ? (
                      <button
                        onClick={() => handleTogglePrayed(prayer.name)}
                        aria-label={`Mark ${prayer.name} as prayed`}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                          isPrayed
                            ? "bg-emerald-500 text-white shadow-sm scale-105"
                            : "bg-gray-200/80 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-emerald-100 hover:text-emerald-600 dark:hover:bg-emerald-950/40"
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center text-muted-foreground/40 text-[10px] font-medium">
                        —
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Row */}
        <div className="pt-1 flex items-center gap-2">
          <button
            onClick={() => navigate("/qiblah")}
            className="flex-1 py-2 px-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-2 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 active:scale-95 transition-all"
          >
            <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Qiblah Compass</span>
          </button>

          {onAskMIA && (
            <button
              onClick={() => onAskMIA(`What are the virtues, timings, and Sunnah acts for ${activePrayerName} prayer?`)}
              className="py-2 px-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white flex items-center justify-center gap-1.5 text-xs font-semibold shadow-sm hover:opacity-95 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask MIA</span>
            </button>
          )}

          <button
            onClick={() => navigate("/prayer")}
            aria-label="Prayer settings and notifications"
            className="w-9 h-9 rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-center text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors shrink-0"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimeCard;
