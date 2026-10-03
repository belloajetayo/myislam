import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Bookmark, ChevronRight, Sparkles } from "lucide-react";
import {
  getPrimarySurahNumberForPage,
  SURAH_NAMES_AR,
  SURAH_NAMES_EN,
  toArabicDigits,
} from "@/data/mushafPageData";

export const QuranHomeCard: React.FC = () => {
  const navigate = useNavigate();
  const [lastPage, setLastPage] = useState<number>(1);

  useEffect(() => {
    const saved = localStorage.getItem("mushaf_last_read_page");
    if (saved) {
      setLastPage(parseInt(saved, 10));
    }
  }, []);

  const surahNum = getPrimarySurahNumberForPage(lastPage);

  return (
    <div
      onClick={() => navigate("/quran")}
      className="cursor-pointer group relative overflow-hidden rounded-3xl p-4 sm:p-5 border border-amber-500/30 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up"
      style={{
        background:
          "linear-gradient(135deg, rgba(13, 68, 44, 0.95) 0%, rgba(8, 44, 29, 0.95) 60%, rgba(4, 23, 15, 0.98) 100%)",
        boxShadow:
          "0 10px 30px rgba(8, 44, 29, 0.35), inset 0 0 15px rgba(212, 175, 55, 0.15)",
      }}
    >
      {/* Decorative Gold Accent Elements */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />

      {/* Thin Gold Border Inset */}
      <div className="absolute inset-1.5 rounded-2xl border border-amber-400/20 pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        {/* Left Information */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              Authentic Mushaf
            </span>
            <span className="text-[11px] text-amber-200/70">
              604 Madani Pages
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
            <span>The Holy Qur'an</span>
            <span className="font-arabic text-amber-300 text-lg font-normal">
              الْقُرْآنُ الْكَرِيمُ
            </span>
          </h3>

          <div className="flex items-center gap-2 text-xs text-amber-200/80">
            <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="truncate">
              صفحة {toArabicDigits(lastPage)} • سورة{" "}
              {SURAH_NAMES_AR[surahNum]} ({SURAH_NAMES_EN[surahNum]})
            </span>
          </div>
        </div>

        {/* Right Icon & Action Button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md group-hover:scale-105 active:scale-95 transition-all">
            <BookOpen className="w-6 h-6 text-slate-950" />
          </div>
          <ChevronRight className="w-5 h-5 text-amber-300/80 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
