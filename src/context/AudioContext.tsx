import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Audio } from "expo-av";
import { mmkv } from "@/utils/storage";
import { type SurahDetail } from "@/hooks/useQuranData";

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
  audioProgress: number;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const RECITER_KEY = "myislam_selected_reciter";

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSurah, setCurrentSurah] = useState<SurahDetail | null>(null);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [selectedReciter, setSelectedReciterState] = useState<string>(
    () => mmkv.getString(RECITER_KEY) ?? "ar.alafasy"
  );
  const [audioProgress, setAudioProgress] = useState(0);

  const soundRef = useRef<Audio.Sound | null>(null);
  const currentAyahIndexRef = useRef(0);
  const currentSurahRef = useRef<SurahDetail | null>(null);

  useEffect(() => { currentAyahIndexRef.current = currentAyahIndex; }, [currentAyahIndex]);
  useEffect(() => { currentSurahRef.current = currentSurah; }, [currentSurah]);

  const setSelectedReciter = (reciter: string) => {
    mmkv.set(RECITER_KEY, reciter);
    setSelectedReciterState(reciter);
  };

  const unloadCurrent = async () => {
    if (soundRef.current) {
      soundRef.current.setOnPlaybackStatusUpdate(null);
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
  };

  const createAndPlay = async (url: string, ayahIndex: number) => {
    await unloadCurrent();

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });

    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true, volume: 0.9 }
    );
    soundRef.current = sound;
    setCurrentAyahIndex(ayahIndex);
    setIsPlaying(true);

    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) return;

      if (status.isPlaying && status.durationMillis) {
        const surah = currentSurahRef.current;
        if (surah) {
          const ayah = currentAyahIndexRef.current;
          const ayahProgress = status.positionMillis / status.durationMillis;
          const total = ((ayah + ayahProgress) / surah.ayahs.length) * 100;
          setAudioProgress(total);
        }
      }

      if (status.didJustFinish) {
        const surah = currentSurahRef.current;
        const nextIndex = currentAyahIndexRef.current + 1;
        if (surah && nextIndex < surah.ayahs.length) {
          const nextUrl = surah.ayahs[nextIndex]?.audio;
          if (nextUrl) {
            createAndPlay(nextUrl, nextIndex).catch(() => setIsPlaying(false));
            return;
          }
        }
        setIsPlaying(false);
      }
    });
  };

  const playSurah = (surah: SurahDetail, startAyahIndex = 0) => {
    const url = surah.ayahs[startAyahIndex]?.audio;
    if (!url) return;
    setCurrentSurah(surah);
    createAndPlay(url, startAyahIndex).catch(() => {
      setIsPlaying(false);
    });
  };

  const togglePlayPause = async () => {
    if (!soundRef.current || !currentSurah) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync().catch(() => {});
      setIsPlaying(false);
    } else {
      await soundRef.current.playAsync().catch(() => {});
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    const surah = currentSurahRef.current;
    const nextIndex = currentAyahIndexRef.current + 1;
    if (surah && nextIndex < surah.ayahs.length) {
      const url = surah.ayahs[nextIndex]?.audio;
      if (url) createAndPlay(url, nextIndex).catch(() => setIsPlaying(false));
    }
  };

  const playPrevious = () => {
    const surah = currentSurahRef.current;
    const prevIndex = currentAyahIndexRef.current - 1;
    if (surah && prevIndex >= 0) {
      const url = surah.ayahs[prevIndex]?.audio;
      if (url) createAndPlay(url, prevIndex).catch(() => setIsPlaying(false));
    }
  };

  // Clean up on unmount
  useEffect(() => () => { unloadCurrent(); }, []);

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
        audioProgress,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio must be used within AudioProvider");
  return context;
};
