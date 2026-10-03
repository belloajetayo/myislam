import React from "react";
import { BookOpen, Sparkles, Bookmark } from "lucide-react";
import {
  SURAH_NAMES_AR,
  SURAH_NAMES_EN,
  getPrimarySurahNumberForPage,
  toArabicDigits,
} from "@/data/mushafPageData";

interface HardcopyCoverProps {
  onOpen: () => void;
  lastReadPage?: number;
}

export const HardcopyCover: React.FC<HardcopyCoverProps> = ({
  onOpen,
  lastReadPage = 1,
}) => {
  const surahNum = getPrimarySurahNumberForPage(lastReadPage);

  return (
    <div className="w-full h-full flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none">
      {/* 3D Physical Book Binding Container */}
      <div
        onClick={onOpen}
        className="cursor-pointer group relative max-h-[88vh] aspect-[1/1.42] w-auto max-w-[520px] rounded-r-2xl rounded-l-md shadow-[0_25px_60px_rgba(0,0,0,0.55),0_10px_20px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_30px_70px_rgba(0,0,0,0.7)]"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, #0d442c 0%, #082c1d 60%, #04170f 100%)",
          borderLeft: "8px solid #03120b",
          boxShadow:
            "-10px 0 20px rgba(0,0,0,0.6) inset, 0 25px 60px rgba(0,0,0,0.55), 0 0 0 2px rgba(212,175,55,0.4)",
        }}
      >
        {/* Realistic Book Spine Ridge (left side) */}
        <div
          className="absolute top-0 bottom-0 left-0 w-8 pointer-events-none rounded-l-sm"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(255,255,255,0.06) 30%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.7) 100%)",
            borderRight: "1px solid rgba(212,175,55,0.3)",
          }}
        >
          {/* Spine Ribs */}
          <div className="h-full flex flex-col justify-around py-8 opacity-60">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-full h-1 bg-amber-400/40 shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
              />
            ))}
          </div>
        </div>

        {/* Outer Gilded Foil Border */}
        <div className="absolute inset-4 sm:inset-6 rounded-xl pointer-events-none border-2 border-amber-400/60 shadow-[inset_0_0_12px_rgba(212,175,55,0.25)]">
          {/* Inner Thin Border */}
          <div className="absolute inset-1.5 sm:inset-2.5 rounded-lg border border-amber-400/40">
            {/* Corner Arabesque Ornaments */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-amber-400" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-amber-400" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-amber-400" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-amber-400" />
          </div>
        </div>

        {/* Center Golden Medallion and Calligraphy */}
        <div className="absolute inset-0 flex flex-col items-center justify-between py-10 sm:py-14 px-6 text-center z-10">
          {/* Top Traditional Inscription */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="w-8 h-[1px] bg-amber-400/50" />
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="w-8 h-[1px] bg-amber-400/50" />
            </div>
            <p className="font-arabic text-amber-300 text-sm tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>

          {/* Central Grand Medallion */}
          <div className="relative my-auto flex flex-col items-center">
            {/* Outer Decorative Sunburst Ring */}
            <div
              className="w-48 h-48 sm:w-60 sm:h-60 rounded-full flex items-center justify-center p-3 relative"
              style={{
                background:
                  "radial-gradient(circle, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.04) 70%, transparent 100%)",
                border: "2px solid rgba(212,175,55,0.65)",
                boxShadow:
                  "0 0 25px rgba(212,175,55,0.3), inset 0 0 25px rgba(212,175,55,0.3)",
              }}
            >
              {/* Inner Medallion Frame */}
              <div className="w-full h-full rounded-full border border-amber-300/50 flex flex-col items-center justify-center p-4">
                {/* Gold Foil Calligraphy: AL-QURAN AL-KAREEM */}
                <h1
                  className="font-arabic text-3xl sm:text-4xl font-extrabold tracking-wider leading-relaxed text-transparent bg-clip-text"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #FFE898 0%, #D4AF37 50%, #AA7C11 100%)",
                    textShadow: "0 2px 10px rgba(0,0,0,0.9)",
                  }}
                >
                  الْقُرْآنُ الْكَرِيمُ
                </h1>
                <p className="font-arabic text-amber-200/90 text-xs sm:text-sm mt-1">
                  مُصْحَفُ الْمَدِينَةِ النَّبَوِيَّةِ
                </p>
                <p className="text-[10px] text-amber-300/70 font-serif tracking-widest uppercase mt-0.5">
                  The Holy Qur'an
                </p>
              </div>
            </div>

            {/* Riwayah Badge */}
            <div className="mt-4 px-3 py-1 rounded-full bg-black/40 border border-amber-400/40 text-[11px] font-arabic text-amber-300">
              بِرِوَايَةِ حَفْصٍ عَنْ عَاصِمٍ
            </div>
          </div>

          {/* Bottom Action: Open Mushaf */}
          <div className="w-full max-w-xs space-y-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-300 transform group-hover:scale-105 active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, #f5d061 0%, #d4af37 50%, #996515 100%)",
                color: "#1a1200",
                boxShadow: "0 8px 20px rgba(212,175,55,0.35)",
              }}
            >
              <BookOpen className="w-4 h-4 text-[#1a1200]" />
              <span>افتح المصحف • Open Mushaf</span>
            </button>

            {/* Resume Last Read Page info */}
            {lastReadPage > 1 && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-200/80">
                <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>
                  متابعة من صفحة {toArabicDigits(lastReadPage)} (سورة{" "}
                  {SURAH_NAMES_AR[surahNum]})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Physical Hard Cover Edge Thickness on the Right */}
        <div
          className="absolute top-0 bottom-0 right-0 w-2.5 rounded-r-xl pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.2) 0%, rgba(212,175,55,0.4) 50%, rgba(0,0,0,0.7) 100%)",
          }}
        />
      </div>
    </div>
  );
};
