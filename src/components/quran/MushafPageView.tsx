import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Compass,
  Palette,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  BookOpen,
  Volume2,
  VolumeX,
  Columns,
  Square,
  Sparkles,
  Layers,
  Book,
} from "lucide-react";
import { toast } from "sonner";
import {
  TOTAL_MUSHAF_PAGES,
  getMushafPageImageUrl,
  getJuzForPage,
  getPrimarySurahNumberForPage,
  SURAH_NAMES_EN,
  SURAH_NAMES_AR,
  toArabicDigits,
} from "@/data/mushafPageData";
import { MushafNavigator } from "./MushafNavigator";
import { HardcopyCover } from "./HardcopyCover";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type MushafTheme = "madani" | "antique" | "midnight" | "emerald";

interface MushafPageViewProps {
  initialPage?: number;
  initialSurahNumber?: number;
  onSurahChange?: (surahNumber: number) => void;
  onOpenTranslationPeek?: (surahNumber: number, page: number) => void;
  onPlaySurahAudio?: (surahNumber: number) => void;
  isPlayingAudio?: boolean;
}

const THEME_STYLES: Record<
  MushafTheme,
  {
    name: string;
    bg: string;
    pageBg: string;
    coverBg: string;
    borderColor: string;
    textColor: string;
    accentColor: string;
    filterClass: string;
  }
> = {
  madani: {
    name: "Classic Madani (King Fahd)",
    bg: "radial-gradient(ellipse at 50% 30%, #153e2b 0%, #0a2417 60%, #04120b 100%)",
    pageBg: "#FBF7EE",
    coverBg: "#0B3826",
    borderColor: "#C5A869",
    textColor: "#2D241E",
    accentColor: "#D4AF37",
    filterClass: "",
  },
  antique: {
    name: "Aged Parchment (Walnut Rehal)",
    bg: "radial-gradient(ellipse at 50% 30%, #3a2717 0%, #26190e 60%, #130b05 100%)",
    pageBg: "#F5EFE0",
    coverBg: "#331c0e",
    borderColor: "#9E8148",
    textColor: "#352A1E",
    accentColor: "#B8860B",
    filterClass: "sepia-[0.22]",
  },
  midnight: {
    name: "Midnight OLED (Dark)",
    bg: "radial-gradient(ellipse at 50% 30%, #111827 0%, #080c14 60%, #020408 100%)",
    pageBg: "#0F172A",
    coverBg: "#0a101d",
    borderColor: "#B4975A",
    textColor: "#E2E8F0",
    accentColor: "#EAB308",
    filterClass: "invert-[0.92] hue-rotate-180 brightness-[1.1] contrast-[1.15]",
  },
  emerald: {
    name: "Royal Velvet Emerald",
    bg: "radial-gradient(ellipse at 50% 30%, #083c27 0%, #042115 60%, #02110a 100%)",
    pageBg: "#052319",
    coverBg: "#042618",
    borderColor: "#D4AF37",
    textColor: "#ECFDF5",
    accentColor: "#10B981",
    filterClass: "invert-[0.88] sepia-[0.35] hue-rotate-[95deg] brightness-[1.05]",
  },
};

// Subtle Web Audio page turn sound (authentic paper whisper)
function playPaperTurnSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const duration = 0.11;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1600;
    filter.Q.value = 1.4;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch {
    // Ignore audio permission errors
  }
}

export const MushafPageView: React.FC<MushafPageViewProps> = ({
  initialPage = 1,
  initialSurahNumber,
  onSurahChange,
  onOpenTranslationPeek,
  onPlaySurahAudio,
  isPlayingAudio = false,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [theme, setTheme] = useState<MushafTheme>(() => {
    return (localStorage.getItem("mushaf_theme") as MushafTheme) || "madani";
  });
  const [quality, setQuality] = useState<"1024" | "1920">("1024");
  const [isSpreadView, setIsSpreadView] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [showCover, setShowCover] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [savedBookmark, setSavedBookmark] = useState<number | null>(() => {
    const val = localStorage.getItem("mushaf_saved_bookmark");
    return val ? parseInt(val, 10) : null;
  });

  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync initial page
  useEffect(() => {
    if (initialPage && initialPage >= 1 && initialPage <= TOTAL_MUSHAF_PAGES) {
      setCurrentPage(initialPage);
    }
  }, [initialPage]);

  // Track last reported surah number to completely prevent re-render loops
  const lastSurahNumRef = useRef<number>(-1);
  const onSurahChangeRef = useRef(onSurahChange);
  useEffect(() => {
    onSurahChangeRef.current = onSurahChange;
  }, [onSurahChange]);

  // Save last read page in localStorage
  useEffect(() => {
    try {
      localStorage.setItem("mushaf_last_read_page", String(currentPage));
    } catch {}
    const surahNum = getPrimarySurahNumberForPage(currentPage);
    if (surahNum !== lastSurahNumRef.current) {
      lastSurahNumRef.current = surahNum;
      onSurahChangeRef.current?.(surahNum);
    }
  }, [currentPage]);

  // Save theme preference
  useEffect(() => {
    localStorage.setItem("mushaf_theme", theme);
  }, [theme]);

  // Preload and cache adjacent pages for instant navigation
  useEffect(() => {
    const pagesToPreload = [
      currentPage + 1,
      currentPage - 1,
      currentPage + 2,
      currentPage - 2,
    ].filter((p) => p >= 1 && p <= TOTAL_MUSHAF_PAGES);

    pagesToPreload.forEach(async (p) => {
      const url = getMushafPageImageUrl(p, quality);
      const img = new Image();
      img.src = url;
      if ("caches" in window) {
        try {
          const cache = await caches.open("mushaf-pages-cache");
          const has = await cache.match(url);
          if (!has) {
            const res = await fetch(url, { mode: "cors" });
            if (res.ok) await cache.put(url, res);
          }
        } catch {}
      }
    });
  }, [currentPage, quality]);

  // Page turn action with sound
  const turnPage = useCallback(
    (targetPage: number) => {
      const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PAGES, targetPage));
      if (clamped !== currentPage) {
        if (soundEnabled) playPaperTurnSound();
        setCurrentPage(clamped);
        setZoomScale(1);
      }
    },
    [currentPage, soundEnabled]
  );

  // In Arabic Mushaf: Next page is page + 1 (leftward), Prev page is page - 1 (rightward)
  const goToNextPage = useCallback(() => {
    if (isSpreadView) {
      turnPage(currentPage + 2);
    } else {
      turnPage(currentPage + 1);
    }
  }, [currentPage, isSpreadView, turnPage]);

  const goToPrevPage = useCallback(() => {
    if (isSpreadView) {
      turnPage(currentPage - 2);
    } else {
      turnPage(currentPage - 1);
    }
  }, [currentPage, isSpreadView, turnPage]);

  const jumpToPage = useCallback(
    (page: number) => {
      turnPage(page);
    },
    [turnPage]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === "ArrowLeft") {
        goToNextPage();
      } else if (e.key === "ArrowRight") {
        goToPrevPage();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullScreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextPage, goToPrevPage]);

  // Touch swipe gestures
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        goToNextPage();
      } else {
        goToPrevPage();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Bookmark toggle
  const toggleBookmark = () => {
    if (savedBookmark === currentPage) {
      setSavedBookmark(null);
      localStorage.removeItem("mushaf_saved_bookmark");
      toast.info("Bookmark removed");
    } else {
      setSavedBookmark(currentPage);
      localStorage.setItem("mushaf_saved_bookmark", String(currentPage));
      const surahNum = getPrimarySurahNumberForPage(currentPage);
      toast.success(
        `Bookmarked Page ${currentPage} (${SURAH_NAMES_EN[surahNum]})`
      );
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullScreen(false);
    }
  };

  const activeTheme = THEME_STYLES[theme];
  const primarySurahNum = getPrimarySurahNumberForPage(currentPage);
  const currentJuz = getJuzForPage(currentPage);

  // In 2-page spread:
  // Arabic books open Right to Left:
  // Right page is odd (e.g. Page 1, 3, 5)
  // Left page is even (e.g. Page 2, 4, 6)
  const isOdd = currentPage % 2 !== 0;
  const rightPage = isOdd ? currentPage : currentPage - 1;
  const leftPage = rightPage < TOTAL_MUSHAF_PAGES ? rightPage + 1 : null;

  // Calculate physical page stack thickness (percentage of 604)
  const pageStackLeftThickness = Math.max(
    3,
    Math.round(((TOTAL_MUSHAF_PAGES - currentPage) / TOTAL_MUSHAF_PAGES) * 16)
  );
  const pageStackRightThickness = Math.max(
    3,
    Math.round((currentPage / TOTAL_MUSHAF_PAGES) * 16)
  );

  // If user requested Cover mode
  if (showCover) {
    return (
      <div
        className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden"
        style={{ background: activeTheme.bg }}
      >
        <HardcopyCover
          onOpen={() => setShowCover(false)}
          lastReadPage={currentPage}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col h-screen w-full select-none overflow-hidden"
      style={{ background: activeTheme.bg }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── TOP HEADER / REAL HARDCOPY TOOLBAR ── */}
      <div
        className={`z-20 px-3 sm:px-6 py-2.5 bg-black/40 backdrop-blur-md border-b border-amber-400/20 shadow-md transition-all duration-300 flex items-center justify-between ${
          showControls ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 absolute top-0 left-0 right-0 pointer-events-none"
        }`}
      >
        {/* Left: Surah & Juz Quick Jump Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNavigatorOpen(true)}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-200 text-xs font-semibold shadow-sm transition-all"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
            <div className="text-left leading-none">
              <span className="block font-arabic text-amber-300 text-sm">
                سورة {SURAH_NAMES_AR[primarySurahNum]}
              </span>
              <span className="text-[10px] text-amber-200/70">
                Juz {currentJuz} • P. {currentPage}
              </span>
            </div>
          </button>
        </div>

        {/* Center: Mushaf Title & Golden Medallion */}
        <div className="text-center hidden sm:block">
          <span className="font-arabic text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">
            مُصْحَفُ الْمَدِينَةِ النَّبَوِيَّةِ
          </span>
          <span className="text-[11px] text-amber-200/60 block font-medium">
            صفحة {toArabicDigits(currentPage)} من {toArabicDigits(604)}
          </span>
        </div>

        {/* Right: Actions (Hardcover view, Peek, Theme, Ribbon, Fullscreen) */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Hardcopy Cover toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCover(true)}
            className="h-8 px-2.5 rounded-lg text-xs font-semibold text-amber-300 hover:bg-amber-400/15 border border-amber-400/20 flex items-center gap-1.5"
            title="View Quran Hard Cover"
          >
            <Book className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">الغلاف • Cover</span>
          </Button>

          {/* Peek Translation Sheet */}
          {onOpenTranslationPeek && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 rounded-lg text-xs font-semibold text-emerald-300 hover:bg-emerald-500/15 border border-emerald-400/20 flex items-center gap-1"
              onClick={() => onOpenTranslationPeek(primarySurahNum, currentPage)}
              title="Translation & Verses Peek"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">ع/EN</span>
            </Button>
          )}

          {/* Audio Reciter Toggle */}
          {onPlaySurahAudio && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-amber-300 hover:bg-amber-400/15"
              onClick={() => onPlaySurahAudio(primarySurahNum)}
              title={isPlayingAudio ? "Pause Audio" : "Play Surah Audio"}
            >
              {isPlayingAudio ? (
                <VolumeX className="w-4 h-4 text-rose-400 animate-pulse" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-300" />
              )}
            </Button>
          )}

          {/* Theme & Options Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-amber-300 hover:bg-amber-400/15"
              >
                <Palette className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl bg-slate-900 border-amber-500/30 text-slate-100">
              <DropdownMenuLabel className="text-xs text-amber-300">
                Mushaf Atmosphere
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-800" />
              {(Object.keys(THEME_STYLES) as MushafTheme[]).map((tKey) => (
                <DropdownMenuItem
                  key={tKey}
                  onClick={() => setTheme(tKey)}
                  className={`text-xs flex items-center justify-between cursor-pointer hover:bg-slate-800 ${
                    theme === tKey ? "font-bold text-amber-400" : ""
                  }`}
                >
                  {THEME_STYLES[tKey].name}
                  {theme === tKey && <span className="text-xs">✓</span>}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-xs flex items-center justify-between cursor-pointer hover:bg-slate-800"
              >
                Page Turn Sound
                <span>{soundEnabled ? "🔊 On" : "🔈 Off"}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuLabel className="text-xs text-amber-300">
                Plate Quality
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setQuality("1024")}
                className={`text-xs flex justify-between cursor-pointer hover:bg-slate-800 ${
                  quality === "1024" ? "font-bold text-amber-400" : ""
                }`}
              >
                Standard (1024px)
                {quality === "1024" && <span>✓</span>}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setQuality("1920")}
                className={`text-xs flex justify-between cursor-pointer hover:bg-slate-800 ${
                  quality === "1920" ? "font-bold text-amber-400" : ""
                }`}
              >
                Ultra HD (1920px)
                {quality === "1920" && <span>✓</span>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bookmark Ribbon Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleBookmark}
            className={`h-8 w-8 rounded-lg ${
              savedBookmark === currentPage
                ? "text-rose-400 bg-rose-500/20"
                : "text-amber-200/70 hover:text-amber-200"
            }`}
            title="Ribbon Bookmark"
          >
            <Bookmark
              className={`w-4 h-4 ${
                savedBookmark === currentPage ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
          </Button>

          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex h-8 w-8 rounded-lg text-amber-200/70 hover:text-amber-200"
            onClick={toggleFullScreen}
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullScreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* ── MAIN REALISTIC HARD COPY DISPLAY STAGE ── */}
      <div
        className="flex-1 relative flex items-center justify-center p-2 sm:p-5 overflow-hidden"
        onClick={() => setShowControls((prev) => !prev)}
      >
        {/* PHYSICAL SILK RIBBON BOOKMARK */}
        {savedBookmark === currentPage && (
          <div
            className="absolute top-0 right-12 sm:right-24 z-30 w-6 sm:w-7 h-32 sm:h-44 pointer-events-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] animate-in slide-in-from-top duration-300"
            style={{
              background:
                "linear-gradient(to right, #991b1b 0%, #dc2626 50%, #7f1d1d 100%)",
              clipPath:
                "polygon(0 0, 100% 0, 100% calc(100% - 15px), 50% 100%, 0 calc(100% - 15px))",
              borderTop: "3px solid #d4af37",
            }}
          >
            {/* Gold Thread Stitch Down Center of Ribbon */}
            <div className="w-[1px] h-full mx-auto bg-amber-300/40" />
          </div>
        )}

        {/* 3D BOOK CASING & PAGES */}
        <div
          className="relative max-h-full max-w-full flex items-center justify-center transition-transform duration-200"
          style={{ transform: `scale(${zoomScale})` }}
        >
          {/* HARDCOVER BACKING CASING (Protrudes realistically around pages) */}
          <div
            className="relative flex items-center justify-center rounded-3xl p-2 sm:p-3 shadow-[0_25px_60px_rgba(0,0,0,0.7),0_10px_20px_rgba(0,0,0,0.5)] border-2 border-amber-400/40"
            style={{
              background: activeTheme.coverBg,
              boxShadow:
                "0 30px 80px rgba(0,0,0,0.85), inset 0 0 20px rgba(0,0,0,0.8), 0 0 0 3px rgba(212,175,55,0.3)",
            }}
          >
            {/* Gilded Book Corners */}
            <div className="absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 border-amber-400/60 rounded-tl-xl pointer-events-none" />
            <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-amber-400/60 rounded-tr-xl pointer-events-none" />
            <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-amber-400/60 rounded-bl-xl pointer-events-none" />
            <div className="absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 border-amber-400/60 rounded-br-xl pointer-events-none" />

            {/* SPREAD VIEW (2 Pages Side-by-Side: Authentic Madani Left & Right) */}
            {isSpreadView && leftPage ? (
              <div className="flex items-center rounded-xl overflow-hidden shadow-2xl relative">
                {/* Left Stacked Pages Rim (Even Page Side) */}
                <div
                  className="hidden md:block self-stretch pointer-events-none"
                  style={{
                    width: `${pageStackLeftThickness}px`,
                    background:
                      "repeating-linear-gradient(to right, #c5a869 0px, #e8dec8 1px, #fbf7ee 2px, #e8dec8 3px)",
                    borderLeft: "2px solid #a17c38",
                    boxShadow: "inset -2px 0 6px rgba(0,0,0,0.3)",
                  }}
                  title={`Remaining: ${TOTAL_MUSHAF_PAGES - leftPage} pages`}
                />

                {/* Left Page (Even Page in Arabic Mushaf) */}
                <div
                  className="relative flex-1 max-h-[84vh] overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: activeTheme.pageBg }}
                >
                  <img
                    src={getMushafPageImageUrl(leftPage, quality)}
                    alt={`Madani Mushaf Page ${leftPage}`}
                    className={`max-h-[82vh] w-auto object-contain transition-all duration-200 select-none ${activeTheme.filterClass}`}
                    loading="eager"
                    decoding="async"
                  />
                  {/* Subtle inner curvature shadow into spine */}
                  <div
                    className="absolute top-0 bottom-0 right-0 w-8 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.08) 70%, rgba(0,0,0,0.22) 100%)",
                    }}
                  />
                </div>

                {/* Central Quran Spine / Gutter (Authentic Madani Book Binding) */}
                <div
                  className="w-5 sm:w-6 h-full self-stretch pointer-events-none z-20"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.08) 35%, rgba(255,255,255,0.08) 50%, rgba(0,0,0,0.08) 65%, rgba(0,0,0,0.3) 100%)",
                    boxShadow: "0 0 10px rgba(0,0,0,0.4) inset",
                  }}
                >
                  {/* Spine Center Stitch Line */}
                  <div className="w-[1px] h-full mx-auto bg-amber-900/30" />
                </div>

                {/* Right Page (Odd Page in Arabic Mushaf) */}
                <div
                  className="relative flex-1 max-h-[84vh] overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: activeTheme.pageBg }}
                >
                  {/* Subtle inner curvature shadow into spine */}
                  <div
                    className="absolute top-0 bottom-0 left-0 w-8 pointer-events-none z-10"
                    style={{
                      background:
                        "linear-gradient(to left, transparent 0%, rgba(0,0,0,0.08) 70%, rgba(0,0,0,0.22) 100%)",
                    }}
                  />
                  <img
                    src={getMushafPageImageUrl(rightPage, quality)}
                    alt={`Madani Mushaf Page ${rightPage}`}
                    className={`max-h-[82vh] w-auto object-contain transition-all duration-200 select-none ${activeTheme.filterClass}`}
                    loading="eager"
                    decoding="async"
                  />
                </div>

                {/* Right Stacked Pages Rim (Odd Page Side) */}
                <div
                  className="hidden md:block self-stretch pointer-events-none"
                  style={{
                    width: `${pageStackRightThickness}px`,
                    background:
                      "repeating-linear-gradient(to left, #c5a869 0px, #e8dec8 1px, #fbf7ee 2px, #e8dec8 3px)",
                    borderRight: "2px solid #a17c38",
                    boxShadow: "inset 2px 0 6px rgba(0,0,0,0.3)",
                  }}
                  title={`Read: ${rightPage} pages`}
                />
              </div>
            ) : (
              /* SINGLE PAGE VIEW (Mobile & Responsive Portrait) */
              <div
                className="relative max-h-[85vh] w-auto rounded-xl overflow-hidden shadow-2xl flex items-center justify-center"
                style={{ backgroundColor: activeTheme.pageBg }}
              >
                {/* Physical Spine Gutter on Bound Edge (RTL: odd pages bound on left, even pages bound on right) */}
                <div
                  className={`absolute top-0 bottom-0 pointer-events-none z-10 ${
                    currentPage % 2 !== 0 ? "left-0 w-5" : "right-0 w-5"
                  }`}
                  style={{
                    background:
                      currentPage % 2 !== 0
                        ? "linear-gradient(to right, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.05) 70%, transparent 100%)"
                        : "linear-gradient(to left, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.05) 70%, transparent 100%)",
                  }}
                />

                <img
                  src={getMushafPageImageUrl(currentPage, quality)}
                  alt={`Madani Mushaf Page ${currentPage}`}
                  className={`max-h-[80vh] sm:max-h-[83vh] w-auto object-contain pointer-events-none select-none transition-all duration-200 ${activeTheme.filterClass}`}
                  loading="eager"
                  decoding="async"
                  onLoad={() => setIsLoadingPage(false)}
                  onLoadStart={() => setIsLoadingPage(true)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Floating Quick Navigation Buttons */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToNextPage();
          }}
          disabled={currentPage >= TOTAL_MUSHAF_PAGES}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 border border-amber-400/40 shadow-xl items-center justify-center text-amber-200 hover:scale-110 active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none"
          title="Next Page (Left Arrow in RTL)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            goToPrevPage();
          }}
          disabled={currentPage <= 1}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 border border-amber-400/40 shadow-xl items-center justify-center text-amber-200 hover:scale-110 active:scale-95 transition-all disabled:opacity-20 disabled:pointer-events-none"
          title="Previous Page (Right Arrow in RTL)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* ── BOTTOM CONTROL BAR ── */}
      <div
        className={`z-20 px-3 sm:px-6 py-2.5 bg-black/50 backdrop-blur-md border-t border-amber-400/20 shadow-lg transition-all duration-300 flex items-center justify-between ${
          showControls ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 absolute bottom-0 left-0 right-0 pointer-events-none"
        }`}
      >
        {/* Prev Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevPage}
          disabled={currentPage <= 1}
          className="h-8 rounded-xl px-3 font-semibold text-xs flex items-center gap-1 border-amber-400/30 text-amber-200 bg-black/40 hover:bg-amber-400/20 disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" />
          <span className="hidden sm:inline">السابق • Prev</span>
        </Button>

        {/* Center: Zoom Controls & Two-Page Spread Toggle */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-amber-200/80 hover:text-amber-200 hover:bg-amber-400/15"
            onClick={() => setZoomScale((prev) => Math.min(2.5, prev + 0.15))}
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>

          {zoomScale !== 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-amber-400 hover:bg-amber-400/15"
              onClick={() => setZoomScale(1)}
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-amber-200/80 hover:text-amber-200 hover:bg-amber-400/15"
            onClick={() => setZoomScale((prev) => Math.max(0.8, prev - 0.15))}
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>

          {/* Dual Spread Toggle (Desktop/Tablet) */}
          <div className="hidden lg:flex items-center ml-2 border-l border-amber-400/30 pl-2">
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2.5 text-xs rounded-lg flex items-center gap-1.5 ${
                isSpreadView
                  ? "bg-amber-400/25 text-amber-300 font-bold border border-amber-400/40"
                  : "text-amber-200/70 hover:text-amber-200"
              }`}
              onClick={() => setIsSpreadView(!isSpreadView)}
              title="Toggle Two-Page Open Book Spread"
            >
              {isSpreadView ? (
                <>
                  <Columns className="w-3.5 h-3.5 text-amber-400" />
                  <span>مصحف مفتوح • 2 Pages</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5" />
                  <span>صفحة واحدة • 1 Page</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Next Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextPage}
          disabled={currentPage >= TOTAL_MUSHAF_PAGES}
          className="h-8 rounded-xl px-3 font-semibold text-xs flex items-center gap-1 border-amber-400/30 text-amber-200 bg-black/40 hover:bg-amber-400/20 disabled:opacity-30"
        >
          <span className="hidden sm:inline">التالي • Next</span>
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* ── 3-WAY JUMP NAVIGATOR MODAL ── */}
      <MushafNavigator
        isOpen={isNavigatorOpen}
        onClose={() => setIsNavigatorOpen(false)}
        currentPage={currentPage}
        onSelectPage={jumpToPage}
        savedBookmark={savedBookmark}
      />
    </div>
  );
};
