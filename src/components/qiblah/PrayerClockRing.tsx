import React, { useEffect, useState } from "react";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

interface PrayerClockRingProps {
  locationName?: string;
}

const PRAYER_COLORS: Record<string, string> = {
  Fajr: "#a78bfa",
  Sunrise: "#fbbf24",
  Dhuhr: "#f97316",
  Asr: "#34d399",
  Maghrib: "#f87171",
  Isha: "#60a5fa",
};

const PRAYER_ORDER = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

// Convert "HH:MM" to degrees (0° = top/12 o'clock, 360° = full circle)
const timeToDegrees = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m;
  return (totalMinutes / 1440) * 360; // 1440 = 24 * 60
};

// Get position on a circle
const getPos = (deg: number, radius: number, cx: number, cy: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
};

const PrayerClockRing: React.FC<PrayerClockRingProps> = ({ locationName }) => {
  const { prayerTimes, loading } = usePrayerTimes();
  const [currentDeg, setCurrentDeg] = useState(0);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const s = now.getSeconds();
      const totalMinutes = h * 60 + m + s / 60;
      setCurrentDeg((totalMinutes / 1440) * 360);
      setCurrentTime(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const cx = 130;
  const cy = 130;
  const outerR = 118;
  const innerR = 80;
  const labelR = 105;

  if (loading || !prayerTimes) {
    return (
      <div className="flex items-center justify-center w-64 h-64 mx-auto">
        <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Find next prayer
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  let nextPrayer = "Fajr";
  for (const name of PRAYER_ORDER) {
    const time = prayerTimes[name as keyof typeof prayerTimes];
    if (!time) continue;
    const [h, m] = time.split(":").map(Number);
    if (h * 60 + m > nowMinutes) {
      nextPrayer = name;
      break;
    }
  }

  return (
    <div className="flex flex-col items-center">
      <svg width="260" height="260" viewBox="0 0 260 260">
        {/* Outer dark ring */}
        <circle cx={cx} cy={cy} r={outerR + 8} fill="#0f172a" opacity="0.8" />
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#1e293b" strokeWidth="28" />

        {/* Prayer time arcs */}
        {PRAYER_ORDER.map((name, i) => {
          const time = prayerTimes[name as keyof typeof prayerTimes];
          if (!time) return null;
          const nextName = PRAYER_ORDER[(i + 1) % PRAYER_ORDER.length];
          const nextTime = prayerTimes[nextName as keyof typeof prayerTimes];
          if (!nextTime) return null;

          const startDeg = timeToDegrees(time);
          const endDeg = timeToDegrees(nextTime) || startDeg + 30;
          const color = PRAYER_COLORS[name];

          const startPos = getPos(startDeg, outerR, cx, cy);
          const endPos = getPos(endDeg, outerR, cx, cy);
          const largeArc = endDeg - startDeg > 180 ? 1 : 0;

          return (
            <path
              key={name}
              d={`M ${startPos.x} ${startPos.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${endPos.x} ${endPos.y}`}
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              opacity={nextPrayer === name ? 1 : 0.4}
            />
          );
        })}

        {/* Prayer time labels */}
        {PRAYER_ORDER.map((name) => {
          const time = prayerTimes[name as keyof typeof prayerTimes];
          if (!time) return null;
          const deg = timeToDegrees(time);
          const pos = getPos(deg, labelR, cx, cy);
          const color = PRAYER_COLORS[name];
          const isNext = nextPrayer === name;

          return (
            <g key={name}>
              {/* Dot marker */}
              <circle cx={pos.x} cy={pos.y} r={isNext ? 5 : 3} fill={color} opacity={isNext ? 1 : 0.6} />
              {/* Prayer name */}
              <text
                x={getPos(deg, labelR + 16, cx, cy).x}
                y={getPos(deg, labelR + 16, cx, cy).y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isNext ? "8" : "7"}
                fontWeight={isNext ? "bold" : "normal"}
                fill={isNext ? color : "#94a3b8"}
              >
                {name}
              </text>
              {/* Time */}
              <text
                x={getPos(deg, labelR + 26, cx, cy).x}
                y={getPos(deg, labelR + 26, cx, cy).y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="6"
                fill={isNext ? color : "#64748b"}
              >
                {time}
              </text>
            </g>
          );
        })}

        {/* Current time hand */}
        {(() => {
          const handEnd = getPos(currentDeg, outerR - 4, cx, cy);
          const handStart = getPos(currentDeg + 180, 12, cx, cy);
          return (
            <>
              <line
                x1={handStart.x}
                y1={handStart.y}
                x2={handEnd.x}
                y2={handEnd.y}
                stroke="#f8fafc"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.9"
              />
              <circle cx={handEnd.x} cy={handEnd.y} r="4" fill="#f8fafc" />
            </>
          );
        })()}

        {/* Inner circle */}
        <circle cx={cx} cy={cy} r={innerR} fill="#0f172a" opacity="0.9" />
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#1e293b" strokeWidth="1" />

        {/* Center content */}
        <text x={cx} y={cy - 18} textAnchor="middle" fontSize="11" fill="#94a3b8">
          {new Date().toLocaleDateString("en", { weekday: "short", day: "numeric", month: "short" })}
        </text>
        <text x={cx} y={cy + 2} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#f8fafc">
          {currentTime}
        </text>
        <text x={cx} y={cy + 20} textAnchor="middle" fontSize="9" fill={PRAYER_COLORS[nextPrayer]}>
          Next: {nextPrayer}
        </text>
        {locationName && (
          <text x={cx} y={cy + 34} textAnchor="middle" fontSize="8" fill="#64748b">
            {locationName.split(",")[0]}
          </text>
        )}
      </svg>

      {/* Prayer times row */}
      <div className="flex gap-2 mt-2 flex-wrap justify-center">
        {PRAYER_ORDER.filter(n => n !== "Sunrise").map((name) => {
          const time = prayerTimes[name as keyof typeof prayerTimes];
          const isNext = nextPrayer === name;
          return (
            <div
              key={name}
              className={`flex flex-col items-center px-2 py-1 rounded-xl ${isNext ? "bg-white/10 ring-1" : ""}`}
              style={{ ringColor: PRAYER_COLORS[name] }}
            >
              <span className="text-[9px]" style={{ color: PRAYER_COLORS[name] }}>{name}</span>
              <span className="text-[10px] font-bold text-white">{time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrayerClockRing;
