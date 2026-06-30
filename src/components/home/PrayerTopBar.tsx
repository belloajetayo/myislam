import React from "react";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { MapPin } from "lucide-react";

const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

const PrayerTopBar: React.FC = () => {
  const { prayerTimes, hijriDate, location, currentPrayer, loading } = usePrayerTimes();

  const hijriStr = hijriDate
    ? `${hijriDate.day} ${hijriDate.month.en} ${hijriDate.year} AH`
    : "";

  const cityName = location?.city || "";

  return (
    <div className="w-full rounded-2xl overflow-hidden mb-4 animate-fade-in relative">
      {/* Light mode background — indigo/light blue gradient */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #38bdf8 100%)",
        }}
      />
      {/* Dark mode background — deep navy */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #1e3a5f 50%, #0f2027 100%)",
        }}
      />

      <div className="relative" style={{ boxShadow: "0 4px 24px rgba(99,102,241,0.15)" }}>
        {/* Top row — Hijri date + location */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div>
            <p className="text-indigo-100 dark:text-indigo-300 text-[10px] font-medium uppercase tracking-wider">Islamic Date</p>
            <p className="text-white text-sm font-bold">{hijriStr || "Loading..."}</p>
          </div>
          {cityName && (
            <div className="flex items-center gap-1 bg-white/15 dark:bg-white/10 rounded-full px-2 py-1">
              <MapPin className="w-3 h-3 text-indigo-100 dark:text-indigo-300" />
              <span className="text-white dark:text-indigo-200 text-[10px] font-medium">{cityName}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-white/20 dark:bg-white/10 my-2" />

        {/* Prayer times row */}
        <div className="flex justify-between px-3 pb-3">
          {PRAYER_NAMES.map((name) => {
            const time = prayerTimes?.[name as keyof typeof prayerTimes];
            const isActive = currentPrayer === name;
            return (
              <div
                key={name}
                className={`flex flex-col items-center px-2 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-white/25 dark:bg-indigo-500/40 ring-1 ring-white/40 dark:ring-indigo-400/60"
                    : "bg-white/10 dark:bg-white/5"
                }`}
              >
                <span className={`text-[9px] font-semibold mb-0.5 ${isActive ? "text-white" : "text-indigo-100 dark:text-slate-400"}`}>
                  {name}
                </span>
                <span className={`text-[11px] font-bold ${isActive ? "text-white" : "text-indigo-50 dark:text-slate-300"}`}>
                  {loading ? "..." : time || "--:--"}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-white dark:bg-indigo-400 mt-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PrayerTopBar;
