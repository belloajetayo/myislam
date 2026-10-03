import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SurahDetail } from "@/hooks/useQuranData";
import { Button } from "@/components/ui/button";
import { Play, Pause, BookOpen, Volume2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MushafTranslationPeekProps {
  isOpen: boolean;
  onClose: () => void;
  page: number;
  surahDetail: SurahDetail | null;
  onPlayAyah?: (ayahIndex: number) => void;
  currentPlayingIndex?: number | null;
  isPlaying?: boolean;
}

export const MushafTranslationPeek: React.FC<MushafTranslationPeekProps> = ({
  isOpen,
  onClose,
  page,
  surahDetail,
  onPlayAyah,
  currentPlayingIndex,
  isPlaying,
}) => {
  if (!surahDetail) return null;

  // Filter ayahs that correspond to this page if page info is present, or fallback to all ayahs
  const pageAyahs = surahDetail.ayahs.filter(
    (a) => !a.page || a.page === page
  );
  const displayAyahs = pageAyahs.length > 0 ? pageAyahs : surahDetail.ayahs;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[75vh] max-w-2xl mx-auto rounded-t-3xl border-t border-primary/20 bg-background/95 backdrop-blur-xl p-0 flex flex-col overflow-hidden shadow-2xl"
      >
        <SheetHeader className="p-4 pb-2 border-b border-border/50 text-left">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-base font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                Translation Peek • Page {page}
              </SheetTitle>
              <div className="text-xs text-muted-foreground">
                Surah {surahDetail.englishName} ({surahDetail.englishNameTranslation})
              </div>
            </div>
            <div className="text-right font-arabic text-xl font-bold text-amber-500">
              {surahDetail.name}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 pb-10">
            {displayAyahs.map((ayah) => {
              const ayahIndex = surahDetail.ayahs.findIndex(
                (a) => a.numberInSurah === ayah.numberInSurah
              );
              const translationText =
                surahDetail.translation.find(
                  (t) => t.numberInSurah === ayah.numberInSurah
                )?.text || "";
              const transliterationText =
                surahDetail.transliteration.find(
                  (t) => t.numberInSurah === ayah.numberInSurah
                )?.text || "";
              const isPlayingThisAyah =
                currentPlayingIndex === ayahIndex && isPlaying;

              return (
                <div
                  key={ayah.number}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isPlayingThisAyah
                      ? "bg-amber-500/10 border-amber-500/40"
                      : "bg-card hover:bg-muted/40 border-border/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        {ayah.numberInSurah}
                      </span>
                      {onPlayAyah && (
                        <button
                          onClick={() => onPlayAyah(ayahIndex)}
                          className="w-7 h-7 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary flex items-center justify-center transition-colors"
                          title="Listen to Ayah"
                        >
                          {isPlayingThisAyah ? (
                            <Pause className="w-3.5 h-3.5 text-amber-500" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Arabic Text */}
                  <div className="text-right font-arabic text-2xl text-foreground leading-[2.2] mb-3">
                    {ayah.text}
                  </div>

                  {/* Transliteration */}
                  {transliterationText && (
                    <div className="text-xs italic text-amber-700 dark:text-amber-300/80 mb-1.5 leading-relaxed">
                      {transliterationText}
                    </div>
                  )}

                  {/* Translation */}
                  {translationText && (
                    <div className="text-sm text-foreground/90 leading-relaxed">
                      {translationText}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
