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
    <div className="w-full rounded-2xl overflow-hidden mb-4 animate-fade-in"
      style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #1e3a5f 50%, #0f2027 100%)",
        boxShadow: "0 4px 24px rgba(99,102,241,0.15)"
      }}
    >
      {/* Top row — Hijri date + location */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div>
          <p className="text-indigo-300 text-[10px] font-medium uppercase tracking-wider">Islamic Date</p>
          <p className="text-white text-sm font-bold">{hijriStr || "Loading..."}</p>
        </div>
        {cityName && (
          <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1">
            <MapPin className="w-3 h-3 text-indigo-300" />
            <span className="text-indigo-200 text-[10px] font-medium">{cityName}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/10 my-2" />

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
                  ? "bg-indigo-500/40 ring-1 ring-indigo-400/60"
                  : "bg-white/5"
              }`}
            >
              <span className={`text-[9px] font-semibold mb-0.5 ${isActive ? "text-indigo-200" : "text-slate-400"}`}>
                {name}
              </span>
              <span className={`text-[11px] font-bold ${isActive ? "text-white" : "text-slate-300"}`}>
                {loading ? "..." : time || "--:--"}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrayerTopBar;
