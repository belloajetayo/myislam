import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Compass, BookOpen, Layers, Bookmark } from "lucide-react";
import {
  TOTAL_MUSHAF_PAGES,
  SURAH_START_PAGES,
  SURAH_NAMES_EN,
  SURAH_NAMES_AR,
  JUZ_START_PAGES,
  JUZ_TITLES_ARABIC,
  getJuzForPage,
  toArabicDigits,
} from "@/data/mushafPageData";

interface MushafNavigatorProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: number;
  onSelectPage: (page: number) => void;
  savedBookmark?: number | null;
}

export const MushafNavigator: React.FC<MushafNavigatorProps> = ({
  isOpen,
  onClose,
  currentPage,
  onSelectPage,
  savedBookmark,
}) => {
  const [activeTab, setActiveTab] = useState<string>("surahs");
  const [searchQuery, setSearchQuery] = useState("");
  const [sliderPage, setSliderPage] = useState<number>(currentPage);
  const [customInput, setCustomInput] = useState<string>("");

  // Sync slider when modal opens or currentPage changes
  React.useEffect(() => {
    setSliderPage(currentPage);
  }, [currentPage, isOpen]);

  const handleJump = (page: number) => {
    const clamped = Math.max(1, Math.min(TOTAL_MUSHAF_PAGES, page));
    onSelectPage(clamped);
    onClose();
  };

  const filteredSurahs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const list: Array<{ number: number; nameEn: string; nameAr: string; page: number }> = [];
    for (let i = 1; i <= 114; i++) {
      const nameEn = SURAH_NAMES_EN[i] || `Surah ${i}`;
      const nameAr = SURAH_NAMES_AR[i] || "";
      const page = SURAH_START_PAGES[i] || 1;
      if (!q || nameEn.toLowerCase().includes(q) || nameAr.includes(q) || String(i) === q) {
        list.push({ number: i, nameEn, nameAr, page });
      }
    }
    return list;
  }, [searchQuery]);

  const quickJumpPages = [1, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 604];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] p-0 flex flex-col overflow-hidden bg-background text-foreground border-primary/20 shadow-2xl rounded-2xl">
        <DialogHeader className="p-4 pb-2 border-b border-border/60">
          <DialogTitle className="flex items-center justify-between text-base font-bold">
            <span className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-500" />
              Navigate Mushaf Pages (1–604)
            </span>
            {savedBookmark && (
              <button
                onClick={() => handleJump(savedBookmark)}
                className="text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors font-medium"
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                Bookmark (p. {savedBookmark})
              </button>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-4 pt-2">
            <TabsList className="grid grid-cols-3 w-full bg-muted/60">
              <TabsTrigger value="surahs" className="text-xs sm:text-sm flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Surahs (114)
              </TabsTrigger>
              <TabsTrigger value="juz" className="text-xs sm:text-sm flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Juz (30)
              </TabsTrigger>
              <TabsTrigger value="direct" className="text-xs sm:text-sm flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Direct Page
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: SURAHS */}
          <TabsContent value="surahs" className="flex-1 flex flex-col m-0 p-4 pt-3 overflow-hidden">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search Surah name or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm rounded-xl bg-muted/40"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {filteredSurahs.map((surah) => {
                const isCurrent = currentPage >= surah.page && (surah.number === 114 || currentPage < (SURAH_START_PAGES[surah.number + 1] ?? 605));
                return (
                  <button
                    key={surah.number}
                    onClick={() => handleJump(surah.page)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      isCurrent
                        ? "bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-semibold"
                        : "hover:bg-muted/70 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isCurrent
                          ? "bg-amber-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {surah.number}
                      </div>
                      <div>
                        <div className="text-sm font-semibold leading-tight">{surah.nameEn}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Starts on Page {surah.page}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-arabic text-lg leading-none text-amber-600 dark:text-amber-400">
                        {surah.nameAr}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        p. {surah.page}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </TabsContent>

          {/* TAB 2: JUZ */}
          <TabsContent value="juz" className="flex-1 flex flex-col m-0 p-4 pt-3 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {JUZ_START_PAGES.map((startPage, index) => {
                const juzNum = index + 1;
                const titleAr = JUZ_TITLES_ARABIC[index] || `الجزء ${juzNum}`;
                const isCurrent = getJuzForPage(currentPage) === juzNum;
                return (
                  <button
                    key={juzNum}
                    onClick={() => handleJump(startPage)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                      isCurrent
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-semibold"
                        : "hover:bg-muted/70 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isCurrent
                          ? "bg-emerald-600 text-white"
                          : "bg-muted text-emerald-600 dark:text-emerald-400"
                      }`}>
                        {juzNum}
                      </div>
                      <div>
                        <div className="text-sm font-bold">Juz {juzNum}</div>
                        <div className="text-xs text-muted-foreground">
                          Starts on Page {startPage}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-arabic text-base text-emerald-700 dark:text-emerald-400 font-medium">
                      {titleAr}
                    </div>
                  </button>
                );
              })}
            </div>
          </TabsContent>

          {/* TAB 3: DIRECT PAGE */}
          <TabsContent value="direct" className="flex-1 flex flex-col m-0 p-5 space-y-6 overflow-y-auto">
            {/* Slider section */}
            <div className="bg-muted/40 p-4 rounded-2xl border border-border/50 text-center space-y-3">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Selected Page
              </div>
              <div className="text-3xl font-black text-amber-500">
                {sliderPage}{" "}
                <span className="font-arabic text-2xl font-normal text-muted-foreground ml-2">
                  (صفحة {toArabicDigits(sliderPage)})
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Juz {getJuzForPage(sliderPage)} of 30
              </div>
              <Slider
                value={[sliderPage]}
                min={1}
                max={TOTAL_MUSHAF_PAGES}
                step={1}
                onValueChange={(val) => setSliderPage(val[0])}
                className="py-2 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground px-1">
                <span>Page 1 (Al-Fatihah)</span>
                <span>Page 604 (An-Nas)</span>
              </div>
              <Button
                onClick={() => handleJump(sliderPage)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl mt-2"
              >
                Go to Page {sliderPage}
              </Button>
            </div>

            {/* Direct manual number input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Or type page number (1–604):
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  max={TOTAL_MUSHAF_PAGES}
                  placeholder={`e.g. ${currentPage}`}
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="rounded-xl"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customInput) {
                      handleJump(parseInt(customInput, 10));
                    }
                  }}
                />
                <Button
                  variant="outline"
                  className="rounded-xl px-5 font-semibold"
                  onClick={() => {
                    const parsed = parseInt(customInput, 10);
                    if (!isNaN(parsed)) handleJump(parsed);
                  }}
                >
                  Jump
                </Button>
              </div>
            </div>

            {/* Quick jump chips */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Quick Landmarks:
              </label>
              <div className="flex flex-wrap gap-2">
                {quickJumpPages.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleJump(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      currentPage === p
                        ? "bg-amber-500 text-white font-bold shadow-sm"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    p. {p}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
