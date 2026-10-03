import React from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import IslamicCalendar from "@/components/home/IslamicCalendar";
import { ArrowLeft, Calendar as CalendarIcon, Moon, Star, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ISLAMIC_EVENTS = [
  { hijri: "1 Muharram", en: "Islamic New Year", desc: "First day of the Hijri year" },
  { hijri: "10 Muharram", en: "Day of Ashura", desc: "Day of fasting and commemoration of Prophet Musa (AS)" },
  { hijri: "12 Rabi al-Awwal", en: "Mawlid an-Nabi", desc: "Birth of the Prophet Muhammad (PBUH)" },
  { hijri: "27 Rajab", en: "Isra and Mi'raj", desc: "The Miraculous Night Journey & Ascension" },
  { hijri: "15 Sha'ban", en: "Mid-Sha'ban (Shab-e-Barat)", desc: "Night of forgiveness before Ramadan" },
  { hijri: "1 Ramadan", en: "First Day of Ramadan", desc: "Start of the holy month of fasting" },
  { hijri: "27 Ramadan", en: "Laylat al-Qadr", desc: "The Night of Power, better than a thousand months" },
  { hijri: "1 Shawwal", en: "Eid al-Fitr", desc: "Celebration of completing Ramadan fasting" },
  { hijri: "8-12 Dhul Hijjah", en: "Days of Hajj", desc: "The Sacred Annual Pilgrimage to Mecca" },
  { hijri: "9 Dhul Hijjah", en: "Day of Arafah", desc: "Greatest day of Hajj & recommended day of fasting" },
  { hijri: "10 Dhul Hijjah", en: "Eid al-Adha", desc: "Feast of Sacrifice commemorating Prophet Ibrahim (AS)" },
];

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <div className="p-4 space-y-5 max-w-lg mx-auto pb-24">
        {/* Header */}
        <header className="flex items-center gap-4 py-2">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/70 dark:bg-white/10 border border-border/60 hover:bg-muted active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gradient-gold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-500" />
              Islamic Calendar
            </h1>
            <p className="text-xs text-muted-foreground">Hijri Dates, Moon Sightings & Sacred Events</p>
          </div>
        </header>

        {/* Calendar Widget */}
        <div className="rounded-3xl overflow-hidden">
          <IslamicCalendar />
        </div>

        {/* Sacred Islamic Events Guide */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-foreground">Major Islamic Holy Dates & Holidays</h2>
          </div>
          <div className="space-y-2">
            {ISLAMIC_EVENTS.map((event, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/60 dark:bg-white/5 border border-border/50 backdrop-blur-sm flex items-start gap-3 hover:border-amber-500/40 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">{event.en}</span>
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      {event.hijri}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default CalendarPage;
