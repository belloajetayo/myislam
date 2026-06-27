import React, { useState } from "react";
import { Share2, Download, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useHijriDate } from "@/hooks/useHijriDate";

const LOGO_URL = "/__l5e/assets-v1/4e726eb6-b18f-4122-bd0f-db8e93e45e65/myislam-logo.png";

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=80",
  "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=800&q=80",
  "https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=800&q=80",
  "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80",
  "https://images.unsplash.com/photo-1597975020386-f8e85b6e8e0b?w=800&q=80",
];

const HADITHS = [
  { text: "The best among you are those who have the best manners and character.", source: "Sahih Al-Bukhari & At-Tirmidhi", narrator: "The Messenger of Allah ﷺ said" },
  { text: "None of you truly believes until he loves for his brother what he loves for himself.", source: "Sahih Al-Bukhari & Muslim", narrator: "The Prophet ﷺ said" },
  { text: "The strong man is not the one who overcomes others by force, but the one who controls himself while in anger.", source: "Sahih Al-Bukhari", narrator: "The Prophet ﷺ said" },
  { text: "Make things easy and do not make them difficult, cheer people up and do not drive them away.", source: "Sahih Al-Bukhari", narrator: "The Prophet ﷺ said" },
  { text: "Whoever believes in Allah and the Last Day should speak good or keep silent.", source: "Sahih Al-Bukhari & Muslim", narrator: "The Prophet ﷺ said" },
  { text: "The best of deeds is the prayer performed on time, then kindness to parents.", source: "Sahih Al-Bukhari", narrator: "The Prophet ﷺ said" },
  { text: "A Muslim is the one from whose tongue and hands the Muslims are safe.", source: "Sahih Al-Bukhari", narrator: "The Prophet ﷺ said" },
  { text: "The world is a prison for the believer and a paradise for the disbeliever.", source: "Sahih Muslim", narrator: "The Prophet ﷺ said" },
  { text: "Smiling at your brother is an act of charity.", source: "At-Tirmidhi", narrator: "The Prophet ﷺ said" },
  { text: "Take benefit of five before five: your youth, health, wealth, free time, and life.", source: "Mustadrak Al-Hakim", narrator: "The Prophet ﷺ said" },
];

const DailyCards: React.FC = () => {
  const { dateInfo } = useHijriDate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = HADITHS.length;

  const prev = () => setCurrentIndex((i) => (i - 1 + total) % total);
  const next = () => setCurrentIndex((i) => (i + 1) % total);

  const hadith = HADITHS[currentIndex];
  const bg = BG_IMAGES[currentIndex % BG_IMAGES.length];
  const dayNum = dateInfo?.hijri?.day ?? new Date().getDate();
  const monthName = dateInfo?.hijri?.month?.en ?? "Muharram";

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Hadith of the Day — MyIslam",
          text: `${hadith.narrator}:\n\n"${hadith.text}"\n\n[${hadith.source}]\n\nShared via MyIslam App`,
          url: "https://myislam-blj5.vercel.app",
        });
      }
    } catch (e) {
      console.log("Share cancelled");
    }
  };

  const handleDownload = () => {
    const text = `Hadith of the Day\n\n${hadith.narrator}:\n\n"${hadith.text}"\n\n[${hadith.source}]\n\nShared via MyIslam App\nmyislam-blj5.vercel.app`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `myislam-hadith-${currentIndex + 1}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-foreground">Hadith of the Day</h3>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleShare} className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-500 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <button onClick={handleDownload} className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-500 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
        <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/85" />

        {/* Islamic date badge */}
        <div className="absolute top-3 left-3 bg-white rounded-xl px-2 py-1 text-center min-w-[48px]">
          <p className="text-[16px] font-black text-gray-900 leading-none">{dayNum}</p>
          <p className="text-[8px] font-bold text-amber-600 uppercase tracking-wider">{monthName}</p>
        </div>

        {/* Title */}
        <div className="absolute top-4 left-16 right-3">
          <p className="text-amber-400 font-bold text-sm">✨ Hadith Of The Day</p>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white/70 text-[10px] italic mb-1">{hadith.narrator}:</p>
          <p className="text-white text-[13px] leading-relaxed font-medium line-clamp-5 mb-2">"{hadith.text}"</p>
          <p className="text-amber-300 text-[10px] italic">[{hadith.source}]</p>
          <div className="flex items-center gap-1.5 mt-2">
            <img src={LOGO_URL} alt="MyIslam" className="w-4 h-4 rounded-md" />
            <span className="text-white/60 text-[9px] font-semibold tracking-wider">MyIslam App</span>
          </div>
        </div>

        {/* Nav arrows */}
        <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-all">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-all">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3 flex-wrap">
        {Array.from({ length: total }).map((_, i) => (
          <button key={i} onClick={() => setCurrentIndex(i)}
            className={`rounded-full transition-all ${i === currentIndex ? "w-5 h-2 bg-amber-500" : "w-2 h-2 bg-gray-300 dark:bg-gray-600"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default DailyCards;
