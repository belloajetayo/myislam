import React from "react";
import { useAudio } from "@/context/AudioContext";
import { Play, Pause, SkipForward, X, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const MiniPlayer: React.FC = () => {
  const {
    isPlaying,
    currentSurah,
    currentAyahIndex,
    togglePlayPause,
    playNext,
    audioProgress,
  } = useAudio();
  
  const navigate = useNavigate();

  if (!currentSurah) return null;

  const currentAyah = currentSurah.ayahs[currentAyahIndex];

  return (
    <div className="fixed bottom-[96px] left-4 right-4 z-40 animate-slide-up">
      <div 
        onClick={() => navigate("/quran")}
        className="glass border border-primary/20 rounded-2xl p-3 shadow-lg flex items-center justify-between gap-3 cursor-pointer bg-background/80 backdrop-blur-md hover:bg-background/90 transition-all duration-300 active:scale-[0.99]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse-soft">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-gradient-gold truncate">
              {currentSurah.englishName}
            </h4>
            <p className="text-[10px] text-muted-foreground truncate">
              Ayah {currentAyah ? currentAyah.numberInSurah : currentAyahIndex + 1} of {currentSurah.ayahs.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={togglePlayPause}
            className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>
          <button
            onClick={playNext}
            disabled={currentAyahIndex >= currentSurah.ayahs.length - 1}
            className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Progress Bar for the entire Surah */}
      <div className="absolute -bottom-1 left-4 right-4 h-1 bg-primary/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-linear"
          style={{ width: `${audioProgress}%` }}
        />
      </div>
    </div>
  );
};

export default MiniPlayer;
