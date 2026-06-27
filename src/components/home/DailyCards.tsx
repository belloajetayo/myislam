import React, { useState, useRef } from "react";
import { Share2, Download, ChevronLeft, ChevronRight, BookOpen, Star } from "lucide-react";
import { useHijriDate } from "@/hooks/useHijriDate";

const LOGO_URL = "/__l5e/assets-v1/4e726eb6-b18f-4122-bd0f-db8e93e45e65/myislam-logo.png";

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=80", // Islamic geometry
  "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=800&q=80", // Mosque
  "https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=800&q=80", // Quran
  "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80", // Architecture
  "https://images.unsplash.com/photo-1597975020386-f8e85b6e8e0b?w=800&q=80", // Islamic art
];

const HADITHS = [
  {
    text: "The best among you are those who have the best manners and character.",
    source: "Sahih Al-Bukhari",
    narrator: "The Messenger of Allah ﷺ said",
  },
  {
    text: "None of you truly believes until he loves for his brother what he loves for himself.",
    source: "Sahih Al-Bukhari & Muslim",
    narrator: "The Prophet ﷺ said",
  },
  {
    text: "The strong man is not the one who overcomes others by force, but the one who controls himself while in anger.",
    source: "Sahih Al-Bukhari",
    narrator: "The Prophet ﷺ said",
  },
  {
    text: "Make things easy and do not make them difficult, cheer people up and do not drive them away.",
    source: "Sahih Al-Bukhari",
    narrator: "The Prophet ﷺ said",
  },
  {
    text: "Whoever believes in Allah and the Last Day should speak good or keep silent.",
    source: "Sahih Al-Bukhari & Muslim",
    narrator: "The Prophet ﷺ said",
  },
];

const VERSES = [
  {
    text: "Indeed, with hardship will be ease.",
    source: "Surah Ash-Sharh 94:6",
    arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
  },
  {
    text: "And He is with you wherever you are.",
    source: "Surah Al-Hadid 57:4",
    arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ",
  },
  {
    text: "So remember Me; I will remember you.",
    source: "Surah Al-Baqarah 2:152",
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ",
  },
  {
    text: "Verily, Allah is with the patient.",
    source: "Surah Al-Baqarah 2:153",
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
  },
  {
    text: "And it is He who created the night and day, the sun and the moon.",
    source: "Surah Al-Anbiya 21:33",
    arabic: "وَهُوَ الَّذِي خَلَقَ اللَّيْلَ وَالنَّهَارَ",
  },
];

interface CardProps {
  type: "hadith" | "verse";
  index: number;
  hijriDate?: { day: number; month: { en: string }; year: number } | null;
  onShare: (cardRef: React.RefObject<HTMLDivElement>) => void;
  onDownload: (cardRef: React.RefObject<HTMLDivElement>) => void;
}

const Card: React.FC<CardProps> = ({ type, index, hijriDate, onShare, onDownload }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const data = type === "hadith" ? HADITHS[index % HADITHS.length] : VERSES[index % VERSES.length];
  const bg = BG_IMAGES[index % BG_IMAGES.length];
  const dayNum = hijriDate?.day ?? new Date().getDate();
  const monthName = hijriDate?.month?.en ?? "Muharram";

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: "4/3" }} ref={cardRef}>
      {/* Background image */}
      <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover" />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80" />

      {/* Islamic date badge */}
      <div className="absolute top-3 left-3 bg-white rounded-xl px-2 py-1 text-center min-w-[48px]">
        <p className="text-[16px] font-black text-gray-900 leading-none">{dayNum}</p>
        <p className="text-[8px] font-bold text-amber-600 uppercase tracking-wider">{monthName}</p>
      </div>

      {/* Title */}
      <div className="absolute top-3 left-16 right-3">
        <p className="text-amber-400 font-bold text-sm">
          {type === "hadith" ? "✨ Hadith Of The Day" : "📖 Verse Of The Day"}
        </p>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        {type === "verse" && "arabic" in data && (
          <p className="text-right text-white/90 text-base font-arabic mb-2 leading-relaxed">
            {(data as typeof VERSES[0]).arabic}
          </p>
        )}
        {type === "hadith" && "narrator" in data && (
          <p className="text-white/70 text-[10px] italic mb-1">
            {(data as typeof HADITHS[0]).narrator}:
          </p>
        )}
        <p className="text-white text-[13px] leading-relaxed font-medium line-clamp-4 mb-2">
          "{data.text}"
        </p>
        <p className="text-amber-300 text-[10px] italic">[{data.source}]</p>

        {/* MyIslam watermark */}
        <div className="flex items-center gap-1.5 mt-2">
          <img src={LOGO_URL} alt="MyIslam" className="w-4 h-4 rounded-md" />
          <span className="text-white/60 text-[9px] font-semibold tracking-wider">MyIslam App</span>
        </div>
      </div>
    </div>
  );
};

const DailyCards: React.FC = () => {
  const { hijriDate } = useHijriDate();
  const [activeType, setActiveType] = useState<"hadith" | "verse">("hadith");
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const total = activeType === "hadith" ? HADITHS.length : VERSES.length;

  const prev = () => setCurrentIndex((i) => (i - 1 + total) % total);
  const next = () => setCurrentIndex((i) => (i + 1) % total);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        const data = activeType === "hadith" ? HADITHS[currentIndex % HADITHS.length] : VERSES[currentIndex % VERSES.length];
        await navigator.share({
          title: activeType === "hadith" ? "Hadith of the Day — MyIslam" : "Verse of the Day — MyIslam",
          text: `"${data.text}" — ${data.source}\n\nShared via MyIslam App`,
          url: "https://myislam-blj5.vercel.app",
        });
      }
    } catch (e) {
      console.log("Share cancelled");
    }
  };

  const handleDownload = () => {
    const data = activeType === "hadith" ? HADITHS[currentIndex % HADITHS.length] : VERSES[currentIndex % VERSES.length];
    const text = `"${data.text}"\n— ${data.source}\n\nShared via MyIslam App\nmyislam-blj5.vercel.app`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `myislam-${activeType}-${currentIndex + 1}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-foreground">Daily Inspiration</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-500 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-500 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Type toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => { setActiveType("hadith"); setCurrentIndex(0); }}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeType === "hadith"
              ? "bg-amber-500 text-white shadow-sm"
              : "bg-white/60 dark:bg-white/5 text-gray-500 border border-indigo-100 dark:border-indigo-800"
          }`}
        >
          ✨ Hadith
        </button>
        <button
          onClick={() => { setActiveType("verse"); setCurrentIndex(0); }}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeType === "verse"
              ? "bg-indigo-500 text-white shadow-sm"
              : "bg-white/60 dark:bg-white/5 text-gray-500 border border-indigo-100 dark:border-indigo-800"
          }`}
        >
          📖 Verse
        </button>
      </div>

      {/* Card with navigation */}
      <div className="relative">
        <Card
          type={activeType}
          index={currentIndex}
          hijriDate={hijriDate}
          onShare={handleShare}
          onDownload={handleDownload}
        />

        {/* Prev/Next buttons */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`rounded-full transition-all ${
              i === currentIndex
                ? "w-5 h-2 bg-amber-500"
                : "w-2 h-2 bg-gray-300 dark:bg-gray-600"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default DailyCards;
