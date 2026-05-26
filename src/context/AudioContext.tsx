import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { type SurahDetail } from "@/hooks/useQuranData";
import { toast } from "sonner";

interface AudioContextType {
  isPlaying: boolean;
  currentSurah: SurahDetail | null;
  currentAyahIndex: number;
  selectedReciter: string;
  setSelectedReciter: (reciter: string) => void;
  playSurah: (surah: SurahDetail, startAyahIndex?: number) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setCurrentAyahIndex: (index: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSurah, setCurrentSurah] = useState<SurahDetail | null>(null);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);
  const [selectedReciter, setSelectedReciter] = useState<string>(() => {
    return localStorage.getItem("myislam_selected_reciter") || "ar.alafasy";
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAyahIndexRef = useRef<number>(0);
  const currentSurahRef = useRef<SurahDetail | null>(null);

  // Sync refs to avoid stale closures in event handlers
  useEffect(() => {
    currentAyahIndexRef.current = currentAyahIndex;
  }, [currentAyahIndex]);

  useEffect(() => {
    currentSurahRef.current = currentSurah;
  }, [currentSurah]);

  // Save selected reciter preference
  useEffect(() => {
    localStorage.setItem("myislam_selected_reciter", selectedReciter);
  }, [selectedReciter]);

  // Create the global audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const handleEnded = () => {
      const surah = currentSurahRef.current;
      const nextIndex = currentAyahIndexRef.current + 1;
      
      if (surah && nextIndex < surah.ayahs.length) {
        if (surah.ayahs[nextIndex]?.audio) {
          audio.src = surah.ayahs[nextIndex].audio!;
          audio.play()
            .then(() => {
              setCurrentAyahIndex(nextIndex);
              setIsPlaying(true);
            })
            .catch((err) => {
              console.error("Audio playback error:", err);
              setIsPlaying(false);
            });
        }
      } else {
        setIsPlaying(false);
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
    };
  }, []);

  // Update Media Session metadata when track changes
  useEffect(() => {
    if (!currentSurah || !audioRef.current) return;

    const getReciterName = (identifier: string): string => {
      switch (identifier) {
        case "ar.alafasy": return "Mishary Rashid Alafasy";
        case "ar.abdurrahmaansudais": return "Abdur-Rahman As-Sudais";
        case "ar.minshawi": return "Mohamed Siddiq Al-Minshawi";
        case "ar.husary": return "Mahmoud Khalil Al-Husary";
        case "ar.abdulbasitmurattal": return "Abdul Basit (Murattal)";
        default: return "Qur'an Reciter";
      }
    };

    const ayah = currentSurah.ayahs[currentAyahIndex];
    if ('mediaSession' in navigator && ayah) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${currentSurah.englishName} - Ayah ${ayah.numberInSurah}`,
        artist: getReciterName(selectedReciter),
        album: "Holy Qur'an",
        artwork: [
          { src: "https://myislam-liard.vercel.app/og-image.png", sizes: "512x512", type: "image/png" }
        ]
      });

      // Register Media Session action handlers for background play control
      try {
        navigator.mediaSession.setActionHandler("play", () => {
          audioRef.current?.play();
          setIsPlaying(true);
        });
        navigator.mediaSession.setActionHandler("pause", () => {
          audioRef.current?.pause();
          setIsPlaying(false);
        });
        navigator.mediaSession.setActionHandler("previoustrack", () => {
          playPrevious();
        });
        navigator.mediaSession.setActionHandler("nexttrack", () => {
          playNext();
        });
      } catch (e) {
        console.warn("Media Session API actions not fully supported", e);
      }
    }
  }, [currentSurah, currentAyahIndex, selectedReciter]);

  const playSurah = (surah: SurahDetail, startAyahIndex: number = 0) => {
    if (!audioRef.current) return;

    setCurrentSurah(surah);
    setCurrentAyahIndex(startAyahIndex);
    
    const audioUrl = surah.ayahs[startAyahIndex]?.audio;
    if (audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Failed to start audio playback:", err);
          toast.error("Playback failed. Please check internet connection.");
          setIsPlaying(false);
        });
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentSurah) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const audioUrl = currentSurah.ayahs[currentAyahIndex]?.audio;
      if (audioUrl) {
        // If the src is not set or matches another surah/ayah, reload it
        if (audioRef.current.src !== audioUrl) {
          audioRef.current.src = audioUrl;
        }
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.error("Failed to resume playback:", err);
            setIsPlaying(false);
          });
      }
    }
  };

  const playNext = () => {
    const surah = currentSurahRef.current;
    const nextIndex = currentAyahIndexRef.current + 1;
    if (surah && nextIndex < surah.ayahs.length) {
      const audioUrl = surah.ayahs[nextIndex]?.audio;
      if (audioUrl && audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play()
          .then(() => {
            setCurrentAyahIndex(nextIndex);
            setIsPlaying(true);
          })
          .catch((err) => {
            console.error("Playback error:", err);
            setIsPlaying(false);
          });
      }
    }
  };

  const playPrevious = () => {
    const surah = currentSurahRef.current;
    const prevIndex = currentAyahIndexRef.current - 1;
    if (surah && prevIndex >= 0) {
      const audioUrl = surah.ayahs[prevIndex]?.audio;
      if (audioUrl && audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play()
          .then(() => {
            setCurrentAyahIndex(prevIndex);
            setIsPlaying(true);
          })
          .catch((err) => {
            console.error("Playback error:", err);
            setIsPlaying(false);
          });
      }
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        currentSurah,
        currentAyahIndex,
        selectedReciter,
        setSelectedReciter,
        playSurah,
        togglePlayPause,
        playNext,
        playPrevious,
        setCurrentAyahIndex,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
