import React, { useState, useMemo } from "react";
import { SurahDetail, Ayah } from "@/hooks/useQuranData";
import { toArabicDigits } from "@/data/mushafPageData";
import {
  Volume2,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Palette,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ClassicMushafViewProps {
  surah: SurahDetail;
  isPlaying: boolean;
  currentAyahIndex: number;
  onPlayAyah: (index: number) => void;
  onTogglePlayPause: () => void;
  onNextSurah?: () => void;
  onPrevSurah?: () => void;
  activeAyahRef?: React.RefObject<HTMLSpanElement | null>;
}

// 8-Pointed Star Rosette with Turquoise center & Gold rim (Exact match to screenshot)
export const ClassicAyahRosette: React.FC<{
  number: number;
  isActive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}> = ({ number, isActive = false, onClick }) => {
  const arabicNum = toArabicDigits(number);

  return (
    <span
      onClick={onClick}
      role="button"
      title={`Ayah ${number}`}
      className={`inline-flex items-center justify-center align-middle mx-1 cursor-pointer select-none transition-transform duration-200 hover:scale-110 active:scale-95 ${
        isActive ? "ring-2 ring-amber-400 ring-offset-2 rounded-full scale-105" : ""
      }`}
      style={{ verticalAlign: "middle" }}
    >
      <svg
        viewBox="0 0 40 40"
        className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-sm flex-shrink-0"
      >
        {/* Outer 8-pointed star in antique bronze/gold */}
        <path
          d="M20 1 
             L24.5 7 L32 4.5 
             L31 12.5 L38.5 15.5 
             L34.5 22.5 L39 29.5 
             L31.5 30.5 L31 38.5 
             L23.5 35 L19.5 40 
             L15.5 35 L8 38.5 
             L7.5 30.5 L0 29.5 
             L4.5 22.5 L0.5 15.5 
             L8 12.5 L7 4.5 
             L14.5 7 Z"
          fill="#1c3d2f"
          stroke="#c59b27"
          strokeWidth="1.2"
        />

        {/* Inner gold scalloped ring */}
        <circle
          cx="20"
          cy="20"
          r="12.5"
          fill="#c59b27"
          stroke="#856404"
          strokeWidth="0.8"
        />

        {/* Vibrant Turquoise / Cyan central disc */}
        <circle
          cx="20"
          cy="20"
          r="10.8"
          fill="#00a896"
          stroke="#007a6c"
          strokeWidth="0.6"
        />

        {/* Inner subtle cyan ring highlight */}
        <circle
          cx="20"
          cy="20"
          r="9.5"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="0.6"
        />

        {/* Arabic digit in bold black font */}
        <text
          x="20"
          y="23.5"
          textAnchor="middle"
          fontSize={arabicNum.length > 2 ? "10" : "12"}
          fontWeight="bold"
          fill="#111827"
          fontFamily="'Amiri', 'Scheherazade New', serif"
        >
          {arabicNum}
        </text>
      </svg>
    </span>
  );
};

// Tajweed color parser for high-fidelity recitation visualization
interface TajweedWordProps {
  word: string;
  isLastWordOfAyah?: boolean;
  enableTajweedColors?: boolean;
}

const TajweedWord: React.FC<TajweedWordProps> = ({
  word,
  isLastWordOfAyah = false,
  enableTajweedColors = true,
}) => {
  if (!enableTajweedColors) {
    return <span className="text-[#111827] dark:text-[#f3f4f6]">{word} </span>;
  }

  // Parse Tajweed rules inside the word
  // 1. Compulsory Madd (red) - characters with madda sign ~ (e.g. الضَّالِّينَ, جَآءَ)
  // 2. Madd 'Arid li-Sukun (cyan/blue) - final elongation vowel before verse end (ـين, ـيم, ـون)
  // 3. Ghunnah / Ikhfa (green) - noon/meem mushaddad
  // 4. Qalqalah (navy blue) - qaf, ta, ba, jeem, dal with sukun
  const hasMadda = /[ٓ~]/.test(word) || word.includes("آ");

  // Check if this is the final word of the ayah with ending vowel like ـينَ, ـيمِ, ـونُ
  const isEndVowel =
    isLastWordOfAyah &&
    (/(ينَ?|يمِ?|ونَ?|يرُ?|ورِ?|يدُ?)$/.test(word) ||
      word.endsWith("ين") ||
      word.endsWith("يم") ||
      word.endsWith("ون"));

  // Check Qalqalah letters: ق ط ب ج د with sukun
  const hasQalqalah = /[قطبجد]ْ/.test(word);

  // Check Ghunnah: نّ or مّ
  const hasGhunnah = /[نم]ّ/.test(word);

  // If word has compulsory Madd with madda (e.g. الضَّالِّينَ)
  if (hasMadda) {
    // Split to color the madd letter red and end vowel blue
    const parts = word.split(/([آ|ا|ى|و|ي][ٓ~]?)/g);
    return (
      <span className="inline-block">
        {parts.map((part, i) => {
          if (/[ٓ~]/.test(part) || part === "آ") {
            return (
              <span key={i} className="text-[#dc2626] font-bold">
                {part}
              </span>
            );
          }
          if (isEndVowel && /[ي|و]/.test(part)) {
            return (
              <span key={i} className="text-[#0284c7] font-semibold">
                {part}
              </span>
            );
          }
          return <span key={i} className="text-[#111827] dark:text-gray-100">{part}</span>;
        })}{" "}
      </span>
    );
  }

  // If end vowel of ayah (Madd 'Arid li-sukun in cyan/blue like in screenshot)
  if (isEndVowel) {
    // Color the final vowel letter (ي / و / ا) cyan
    const match = word.match(/^(.*?)([يو][^يو]*)$/);
    if (match) {
      return (
        <span className="inline-block">
          <span className="text-[#111827] dark:text-gray-100">{match[1]}</span>
          <span className="text-[#0284c7] font-semibold">{match[2]}</span>{" "}
        </span>
      );
    }
  }

  // If word has ghunnah (green)
  if (hasGhunnah && !word.includes("اللَّه")) {
    return (
      <span className="inline-block">
        {word.split(/([نم]ّ)/g).map((part, i) =>
          /[نم]ّ/.test(part) ? (
            <span key={i} className="text-[#16a34a] font-semibold">
              {part}
            </span>
          ) : (
            <span key={i} className="text-[#111827] dark:text-gray-100">{part}</span>
          ),
        )}{" "}
      </span>
    );
  }

  // If word has qalqalah (royal blue)
  if (hasQalqalah) {
    return (
      <span className="inline-block">
        {word.split(/([قطبجد]ْ)/g).map((part, i) =>
          /[قطبجد]ْ/.test(part) ? (
            <span key={i} className="text-[#2563eb] font-semibold">
              {part}
            </span>
          ) : (
            <span key={i} className="text-[#111827] dark:text-gray-100">{part}</span>
          ),
        )}{" "}
      </span>
    );
  }

  // Words with special Allah notation or normal text
  if (word.includes("اللَّهِ") || word.includes("لِلَّهِ")) {
    return (
      <span className="inline-block">
        <span className="text-[#b45309] font-medium">{word}</span>{" "}
      </span>
    );
  }

  return <span className="text-[#111827] dark:text-[#f3f4f6]">{word} </span>;
};

// Formatted Ayah with Tajweed words
const TajweedAyah: React.FC<{
  ayah: Ayah;
  isActive: boolean;
  enableTajweedColors: boolean;
  onPlayAyah: () => void;
  activeAyahRef?: React.RefObject<HTMLSpanElement | null>;
}> = ({ ayah, isActive, enableTajweedColors, onPlayAyah, activeAyahRef }) => {
  const words = useMemo(() => ayah.text.split(" "), [ayah.text]);

  return (
    <span
      id={`ayah-${ayah.number}-${ayah.numberInSurah}`}
      ref={isActive ? activeAyahRef : null}
      onClick={onPlayAyah}
      className={`inline transition-all duration-300 rounded px-1 cursor-pointer ${
        isActive
          ? "bg-amber-400/20 dark:bg-amber-500/25 ring-1 ring-amber-400/40 rounded-lg shadow-sm"
          : "hover:bg-amber-50/60 dark:hover:bg-amber-900/10"
      }`}
    >
      {words.map((word, idx) => (
        <TajweedWord
          key={idx}
          word={word}
          isLastWordOfAyah={idx === words.length - 1}
          enableTajweedColors={enableTajweedColors}
        />
      ))}
      <ClassicAyahRosette
        number={ayah.numberInSurah}
        isActive={isActive}
        onClick={(e) => {
          e.stopPropagation();
          onPlayAyah();
        }}
      />
    </span>
  );
};

export const ClassicMushafView: React.FC<ClassicMushafViewProps> = ({
  surah,
  isPlaying,
  currentAyahIndex,
  onPlayAyah,
  onTogglePlayPause,
  onNextSurah,
  onPrevSurah,
  activeAyahRef,
}) => {
  const [fontSize, setFontSize] = useState<number>(26); // Default comfortable font size
  const [enableTajweedColors, setEnableTajweedColors] = useState<boolean>(true);
  const [paperTheme, setPaperTheme] = useState<"white" | "cream" | "night">("white");

  // Filter Bismillah: In Surah Al-Fatihah, ayah 1 is Bismillah. In others, Bismillah precedes ayah 1.
  const isFatihah = surah.number === 1;
  const isTawbah = surah.number === 9;

  const bgStyles = {
    white: "bg-[#FFFFFF] text-[#111827]",
    cream: "bg-[#FCF9F0] text-[#1a1a1a]",
    night: "bg-[#181a1b] text-[#e0e0e0]",
  };

  return (
    <div className="flex flex-col h-full w-full select-none">
      {/* ── TOP ACTION BAR (Zoom, Tajweed Toggle, Themes, Audio) ── */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 text-white border-b border-emerald-700/40 shadow-sm z-20 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-amber-300 font-sans tracking-wide">
            Mushaf
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-emerald-100">
            {surah.revelationType === "Meccan" ? "مكية" : "مدنية"} • {surah.numberOfAyahs} آيات
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Tajweed Color Toggle */}
          <button
            onClick={() => setEnableTajweedColors(!enableTajweedColors)}
            className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all ${
              enableTajweedColors
                ? "bg-amber-500 text-emerald-950 font-bold shadow-sm"
                : "bg-emerald-800/60 text-emerald-200 hover:bg-emerald-800"
            }`}
            title="Toggle Tajweed Color Coding"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Tajweed</span>
          </button>

          {/* Theme Selector */}
          <button
            onClick={() => {
              setPaperTheme((p) => (p === "white" ? "cream" : p === "cream" ? "night" : "white"));
            }}
            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-emerald-800/60 hover:bg-emerald-800 text-emerald-100 transition-colors"
            title="Change Paper Background"
          >
            <Palette className="w-3 h-3" />
            <span className="text-[10px] capitalize">{paperTheme}</span>
          </button>

          {/* Font Size Adjusters */}
          <div className="flex items-center bg-emerald-800/60 rounded-lg p-0.5">
            <button
              onClick={() => setFontSize((s) => Math.max(18, s - 2))}
              className="p-1 hover:bg-emerald-700 rounded text-emerald-200"
              title="Smaller font"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] px-1 font-mono">{fontSize}</span>
            <button
              onClick={() => setFontSize((s) => Math.min(38, s + 2))}
              className="p-1 hover:bg-emerald-700 rounded text-emerald-200"
              title="Larger font"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Audio Play/Pause Button */}
          <button
            onClick={onTogglePlayPause}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              isPlaying
                ? "bg-amber-400 text-emerald-950 shadow-md animate-pulse"
                : "bg-emerald-700 text-white hover:bg-emerald-600"
            }`}
            title={isPlaying ? "Pause Recitation" : "Play Surah"}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* ── MAIN ORNATE MUSHAF PAGE FRAME (Matching Screenshot) ── */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-muted/30">
        <div className="max-w-2xl mx-auto shadow-2xl transition-all">
          {/* OUTER ISLAMIC GREEN & GOLD ORNAMENTAL BORDER */}
          <div
            className="p-2 sm:p-3 rounded-sm relative"
            style={{
              backgroundColor: "#16382b",
              backgroundImage: `repeating-linear-gradient(45deg, #1c4535 0, #1c4535 10px, #16382b 10px, #16382b 20px)`,
              boxShadow: "inset 0 0 8px rgba(0,0,0,0.6), 0 8px 30px rgba(0,0,0,0.25)",
              border: "3px solid #b8860b",
            }}
          >
            {/* INNER GOLD FILIGREE FRAME */}
            <div
              className={`p-4 sm:p-6 border-2 border-[#16382b] relative ${bgStyles[paperTheme]}`}
              style={{
                outline: "2px solid #c59b27",
                outlineOffset: "-6px",
              }}
            >
              {/* Corner Ornaments */}
              <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#c59b27]" />
              <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#c59b27]" />
              <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#c59b27]" />
              <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#c59b27]" />

              {/* ── ORNATE SURAH HEADER CARTOUCHE ── */}
              <div className="mb-6 relative">
                <div
                  className="mx-auto max-w-md py-2.5 px-4 relative text-center border-2 border-[#1c4535] rounded-lg shadow-sm"
                  style={{
                    backgroundColor: paperTheme === "night" ? "#22272a" : "#fbf9f4",
                    outline: "1.5px solid #c59b27",
                    outlineOffset: "-4px",
                  }}
                >
                  {/* Left & Right Medallion Finials */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1c4535] border-2 border-[#c59b27] flex items-center justify-center text-[9px] text-[#c59b27] font-bold shadow-md">
                    ✦
                  </div>
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#1c4535] border-2 border-[#c59b27] flex items-center justify-center text-[9px] text-[#c59b27] font-bold shadow-md">
                    ✦
                  </div>

                  {/* Calligraphic Surah Name Header */}
                  <h2
                    className="font-arabic text-2xl sm:text-3xl font-bold tracking-wide"
                    style={{
                      color: paperTheme === "night" ? "#fbbf24" : "#111827",
                      fontFamily: "'Amiri', 'Scheherazade New', serif",
                    }}
                  >
                    سُورَةُ {surah.name.replace(/سُورَةُ?\s*/, "")}
                  </h2>
                  <p className="text-[11px] font-sans font-medium text-muted-foreground mt-0.5">
                    {surah.englishName} • {surah.englishNameTranslation}
                  </p>
                </div>
              </div>

              {/* ── BISMILLAH BANNER (For Surahs other than 1 and 9) ── */}
              {!isFatihah && !isTawbah && (
                <div className="text-center my-6 py-2 border-y border-amber-600/20">
                  <p
                    className="font-arabic text-2xl sm:text-3xl leading-relaxed"
                    style={{
                      fontFamily: "'Amiri', 'Scheherazade New', serif",
                      color: paperTheme === "night" ? "#f3f4f6" : "#111827",
                    }}
                  >
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                  </p>
                </div>
              )}

              {/* ── CONTINUOUS MUSHAF FLOWING ARABIC TEXT ── */}
              <div
                dir="rtl"
                className="font-arabic text-justify leading-[2.6] sm:leading-[2.9] tracking-wide select-text"
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily: "'Amiri', 'Scheherazade New', 'Noto Naskh Arabic', serif",
                  textAlignLast: isFatihah ? "center" : "justify",
                }}
              >
                {surah.ayahs.map((ayah, index) => (
                  <TajweedAyah
                    key={ayah.number}
                    ayah={ayah}
                    isActive={currentAyahIndex === index && isPlaying}
                    enableTajweedColors={enableTajweedColors}
                    onPlayAyah={() => onPlayAyah(index)}
                    activeAyahRef={activeAyahRef}
                  />
                ))}
              </div>

              {/* Bottom Decorative Finial */}
              <div className="mt-8 flex items-center justify-center gap-3 text-amber-600/40">
                <div className="h-0.5 w-16 bg-gradient-to-r from-transparent to-[#c59b27]" />
                <span className="text-xs text-[#c59b27]">۝</span>
                <div className="h-0.5 w-16 bg-gradient-to-l from-transparent to-[#c59b27]" />
              </div>
            </div>
          </div>

          {/* ── PREV / NEXT SURAH NAVIGATION FOOTER ── */}
          <div className="flex items-center justify-between px-3 py-3 mt-3 bg-card/60 backdrop-blur rounded-2xl border border-border/50 text-xs">
            <button
              onClick={onPrevSurah}
              disabled={surah.number <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              <span>Previous Surah</span>
            </button>

            <span className="font-semibold text-muted-foreground">
              Surah {surah.number} of 114
            </span>

            <button
              onClick={onNextSurah}
              disabled={surah.number >= 114}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted disabled:opacity-30 transition-colors"
            >
              <span>Next Surah</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassicMushafView;
