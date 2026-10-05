import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Headphones,
  Play,
  Pause,
  Radio,
  Volume2,
  VolumeX,
  Mic,
  ChevronRight,
  ChevronDown,
  Loader,
  Youtube,
  MapPin,
  Search,
  Bookmark,
  BookmarkCheck,
  Clock,
  Share2,
  RotateCcw,
  RotateCw,
  Moon,
  Sparkles,
  Heart,
  X,
  ListMusic,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useSharedLocation } from "@/context/useSharedLocation";
import {
  CURATED_PODCAST_SHOWS,
  LIVE_RADIO_STATIONS,
  REGIONAL_RADIO_STATIONS,
  CURATED_SERIES,
  FEATURED_OFFLINE_EPISODES,
  PodcastShow,
  PodcastEpisode,
  RadioStation,
  CuratedSeriesItem,
  searchIslamicPodcasts,
  fetchPodcastEpisodes,
  getSavedFavorites,
  toggleSavedFavorite,
  isFavorite,
  savePlaybackResume,
  getPlaybackResume,
} from "@/services/podcastService";

// YouTube Islamic Content
type YoutubeItem = { title: string; author: string; videoId: string; category: string };
const YOUTUBE_CONTENT: YoutubeItem[] = [
  { title: "Beautiful Quran Recitation — Sheikh Abdur-Rahman As-Sudais", author: "Haramain", videoId: "s_kfoLKGRE0", category: "Quran" },
  { title: "Maher Al Muaiqly — Full Quran", author: "Maher Al Muaiqly", videoId: "0DGpk3sq2ug", category: "Quran" },
  { title: "Mishary Rashid Alafasy — Surah Ar-Rahman", author: "Mishary Alafasy", videoId: "BbG9GgHwEnA", category: "Quran" },
  { title: "Sami Yusuf — Hasbi Rabbi", author: "Sami Yusuf", videoId: "0aoZmVzLbaU", category: "Nasheed" },
  { title: "Maher Zain — Insha Allah", author: "Maher Zain", videoId: "n5X2VOZZeQE", category: "Nasheed" },
  { title: "Harris J — Salam Alaikum", author: "Harris J", videoId: "Hzwzp3xLh5w", category: "Nasheed" },
  { title: "Omar Suleiman — Purifying the Heart", author: "Yaqeen Institute", videoId: "hSbFZJTVzZM", category: "Lecture" },
  { title: "Mufti Menk — Motivational Reminder", author: "Mufti Menk", videoId: "GX4ULOWtcnU", category: "Lecture" },
  { title: "Nouman Ali Khan — Understanding the Quran", author: "Bayyinah", videoId: "OZzKVsi-vqM", category: "Lecture" },
];

// Hadiths for TTS
const HADITHS_TTS = [
  { text: "The best among you are those who have the best manners and character.", source: "Sahih Al-Bukhari" },
  { text: "None of you truly believes until he loves for his brother what he loves for himself.", source: "Sahih Al-Bukhari & Muslim" },
  { text: "The strong man is not the one who overcomes others by force, but the one who controls himself while in anger.", source: "Sahih Al-Bukhari" },
  { text: "Smiling at your brother is an act of charity.", source: "At-Tirmidhi" },
  { text: "Make things easy and do not make them difficult, cheer people up and do not drive them away.", source: "Sahih Al-Bukhari" },
  { text: "Richness is not having many possessions, but true richness is the richness of the soul.", source: "Sahih Al-Bukhari" },
];

type AudioTrack = {
  id: string | number;
  type: "podcast" | "radio" | "series";
  title: string;
  subtitle: string;
  url: string;
  artworkUrl?: string;
  duration?: string;
  durationSec?: number;
};

const formatSeconds = (sec: number): string => {
  if (!sec || isNaN(sec) || !isFinite(sec)) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
};

const Podcasts: React.FC = () => {
  const navigate = useNavigate();
  const { location } = useSharedLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<"podcasts" | "radio" | "series" | "youtube" | "reminders">("podcasts");

  // Podcasts State
  const [selectedShow, setSelectedShow] = useState<PodcastShow | null>(null);
  const [showEpisodes, setShowEpisodes] = useState<PodcastEpisode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [podcastFilter, setPodcastFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PodcastShow[]>([]);

  // Audio Playback State
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);

  // Sleep Timer State
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepRemainingSec, setSleepRemainingSec] = useState<number | null>(null);
  const [showSleepMenu, setShowSleepMenu] = useState(false);

  // Modal / Fullscreen Player
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);

  // Favorites
  const [savedFavoritesList, setSavedFavoritesList] = useState(() => getSavedFavorites());

  // Resume State
  const [resumeData, setResumeData] = useState(() => getPlaybackResume());

  // TTS State
  const [speaking, setSpeaking] = useState(false);
  const [currentHadith, setCurrentHadith] = useState(0);

  // YouTube State
  const [ytFilter, setYtFilter] = useState<"All" | "Quran" | "Nasheed" | "Lecture">("All");
  const [activeVideo, setActiveVideo] = useState<YoutubeItem | null>(null);

  // Location-based radio stations
  const RADIO_STATIONS = useMemo<RadioStation[]>(() => {
    const country = location?.country;
    const local = country && REGIONAL_RADIO_STATIONS[country] ? REGIONAL_RADIO_STATIONS[country] : [];
    return [...local, ...LIVE_RADIO_STATIONS];
  }, [location?.country]);

  // Handle Search Debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchIslamicPodcasts(searchQuery.trim());
      setSearchResults(results);
      setIsSearching(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load episodes when show is selected
  useEffect(() => {
    if (!selectedShow) {
      setShowEpisodes([]);
      return;
    }

    let isMounted = true;
    setEpisodesLoading(true);

    fetchPodcastEpisodes(selectedShow.id)
      .then((eps) => {
        if (isMounted) {
          setShowEpisodes(eps.length > 0 ? eps : FEATURED_OFFLINE_EPISODES.filter((e) => e.showId === selectedShow.id));
          setEpisodesLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setShowEpisodes(FEATURED_OFFLINE_EPISODES.filter((e) => e.showId === selectedShow.id));
          setEpisodesLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedShow]);

  // Setup HTML5 Audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      if (audio) {
        setCurrentTime(audio.currentTime);
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      toast.error("Unable to stream audio. Please check network or try another station.");
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audioRef.current = null;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // Sync playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Sync mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Sleep Timer Countdown
  useEffect(() => {
    if (sleepTimerMinutes === null) {
      setSleepRemainingSec(null);
      return;
    }

    setSleepRemainingSec(sleepTimerMinutes * 60);

    const interval = setInterval(() => {
      setSleepRemainingSec((prev) => {
        if (prev === null || prev <= 1) {
          // Timer finished
          if (audioRef.current) {
            audioRef.current.pause();
          }
          setIsPlaying(false);
          setSleepTimerMinutes(null);
          toast.success("Sleep timer completed. May Allah grant you a peaceful night.");
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerMinutes]);

  // Save Playback Resume Progress every 5s
  useEffect(() => {
    if (!currentTrack || currentTrack.type === "radio" || !isPlaying || currentTime <= 5) return;

    const timer = setTimeout(() => {
      savePlaybackResume({
        id: currentTrack.id,
        title: currentTrack.title,
        showTitle: currentTrack.subtitle,
        audioUrl: currentTrack.url,
        artworkUrl: currentTrack.artworkUrl,
        currentTime,
        duration: duration || currentTrack.durationSec || 0,
        timestamp: Date.now(),
      });
      setResumeData(getPlaybackResume());
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentTrack, isPlaying, currentTime, duration]);

  // MediaSession API Integration (Lock Screen / Background Controls)
  useEffect(() => {
    if ("mediaSession" in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.subtitle,
        album: "MyIslam Audio & Podcasts",
        artwork: currentTrack.artworkUrl
          ? [{ src: currentTrack.artworkUrl, sizes: "512x512", type: "image/jpeg" }]
          : [{ src: "/favicon.ico", sizes: "96x96", type: "image/png" }],
      });

      navigator.mediaSession.setActionHandler("play", () => {
        audioRef.current?.play();
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        audioRef.current?.pause();
      });
      navigator.mediaSession.setActionHandler("seekbackward", () => {
        if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
      });
      navigator.mediaSession.setActionHandler("seekforward", () => {
        if (audioRef.current) audioRef.current.currentTime = Math.min(audioRef.current.duration || 9999, audioRef.current.currentTime + 15);
      });
    }
  }, [currentTrack]);

  // Play audio track
  const playTrack = async (track: AudioTrack, seekToSec?: number) => {
    try {
      if (activeVideo) setActiveVideo(null);
      if (speaking && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
      }

      setIsLoading(true);
      setCurrentTrack(track);

      const audio = audioRef.current;
      if (!audio) return;

      if (audio.src !== track.url) {
        audio.src = track.url;
        audio.playbackRate = playbackSpeed;
        audio.muted = isMuted;
        audio.load();
      }

      if (seekToSec && seekToSec > 0) {
        audio.currentTime = seekToSec;
      }

      await audio.play();
      setIsPlaying(true);
      setIsLoading(false);
    } catch (err) {
      console.warn("Audio play error:", err);
      setIsLoading(false);
      setIsPlaying(false);
      toast.error("Unable to play stream right now. Please try another audio track.");
    }
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => toast.error("Could not resume audio"));
    }
  };

  const stopCurrentAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setCurrentTime(0);
    setDuration(0);
  };

  const jumpSeconds = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = Math.max(0, Math.min(audio.duration || 99999, audio.currentTime + delta));
    audio.currentTime = target;
    setCurrentTime(target);
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const idx = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(idx + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    toast.info(`Playback speed set to ${nextSpeed}x`);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetSec = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = targetSec;
      setCurrentTime(targetSec);
    }
  };

  const handleShare = async (title: string, text?: string) => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || `Listening to ${title} on MyIslam`,
          url: shareUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(`${title} - ${shareUrl}`);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleToggleFavorite = (ep: PodcastEpisode | CuratedSeriesItem) => {
    const added = toggleSavedFavorite(ep);
    setSavedFavoritesList(getSavedFavorites());
    if (added) {
      toast.success("Added to Saved Episodes ⭐");
    } else {
      toast.info("Removed from Saved");
    }
  };

  // TTS Hadith
  const speakHadith = () => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-speech is not supported on this device.");
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    stopCurrentAudio();
    const hadith = HADITHS_TTS[currentHadith];
    const utterance = new SpeechSynthesisUtterance(
      `The Prophet peace be upon him said: ${hadith.text}. Recorded in ${hadith.source}.`
    );
    utterance.rate = 0.9;
    utterance.pitch = 1.02;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const nextHadith = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeaking(false);
    setCurrentHadith((i) => (i + 1) % HADITHS_TTS.length);
  };

  // Filtered podcasts
  const displayedShows = useMemo(() => {
    if (searchQuery.trim().length > 0 && searchResults.length > 0) {
      return searchResults;
    }
    if (podcastFilter === "All") return CURATED_PODCAST_SHOWS;
    if (podcastFilter === "Saved") return [];
    return CURATED_PODCAST_SHOWS.filter((s) => s.category === podcastFilter);
  }, [podcastFilter, searchQuery, searchResults]);

  return (
    <MobileLayout>
      <div className="p-4 space-y-5 pb-28">
        {/* Header */}
        <header className="flex items-center gap-3 py-2">
          <button
            onClick={() => {
              if (selectedShow) {
                setSelectedShow(null);
              } else if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/");
              }
            }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/70 dark:bg-white/5 border border-indigo-100 dark:border-indigo-800 shadow-sm active:scale-95 transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-lg text-foreground flex items-center gap-2">
              <Headphones className="w-5 h-5 text-indigo-500" />
              {selectedShow ? selectedShow.title : "Podcasts & Islamic Audio"}
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              {selectedShow ? selectedShow.host : "Official Shows • 24/7 Radio • Tafseer & Hadith"}
            </p>
          </div>
          {currentTrack && (
            <button
              onClick={() => setIsMuted((m) => !m)}
              className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}
        </header>

        {/* Resume Previous Listening Banner */}
        {!currentTrack && resumeData && resumeData.currentTime > 10 && (
          <div className="rounded-2xl p-3 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">Continue Listening</p>
                <p className="text-xs font-bold text-foreground truncate">{resumeData.title}</p>
                <p className="text-[10px] text-muted-foreground">Resumes at {formatSeconds(resumeData.currentTime)}</p>
              </div>
            </div>
            <button
              onClick={() =>
                playTrack(
                  {
                    id: resumeData.id,
                    type: "podcast",
                    title: resumeData.title,
                    subtitle: resumeData.showTitle,
                    url: resumeData.audioUrl,
                    artworkUrl: resumeData.artworkUrl,
                    durationSec: resumeData.duration,
                  },
                  resumeData.currentTime
                )
              }
              className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 shadow-md hover:bg-indigo-700 active:scale-95 transition-all flex-shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Resume
            </button>
          </div>
        )}

        {/* Main Category Tabs */}
        {!selectedShow && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            {[
              { id: "podcasts", label: "🎙️ Podcasts" },
              { id: "radio", label: "📻 24/7 Radio" },
              { id: "series", label: "📚 Series" },
              { id: "youtube", label: "▶️ Video Hub" },
              { id: "reminders", label: "🤲 Voice Hadith" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-[1.02]"
                    : "bg-white/70 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-indigo-100 dark:border-indigo-800 hover:bg-white/90"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 1: PODCAST SHOWS & EPISODES */}
        {/* ==================================================================== */}
        {activeTab === "podcasts" && (
          <div className="space-y-4">
            {/* If a show is selected: EPISODES LIST VIEW */}
            {selectedShow ? (
              <div className="space-y-4 animate-fade-in">
                {/* Show Header Banner */}
                <div className="rounded-3xl p-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden border border-indigo-800/50">
                  <div className="flex gap-4 items-start relative z-10">
                    <img
                      src={selectedShow.artworkUrl}
                      alt={selectedShow.title}
                      className="w-20 h-20 rounded-2xl object-cover shadow-lg border border-white/20 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-indigo-200">
                        {selectedShow.category}
                      </span>
                      <h2 className="text-base font-bold text-white mt-1 leading-tight">{selectedShow.title}</h2>
                      <p className="text-xs text-indigo-200 font-medium">{selectedShow.host}</p>
                      <p className="text-[11px] text-white/70 mt-1 line-clamp-2">{selectedShow.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 text-xs text-indigo-200">
                    <span>{showEpisodes.length || selectedShow.episodesCount || 0} Episodes Available</span>
                    <button
                      onClick={() => setSelectedShow(null)}
                      className="text-xs font-semibold text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-xl transition-all"
                    >
                      Browse Other Shows
                    </button>
                  </div>
                </div>

                {/* Episodes List */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
                    <span>Episodes</span>
                    {episodesLoading && <Loader className="w-4 h-4 text-indigo-500 animate-spin" />}
                  </h3>

                  {episodesLoading && showEpisodes.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <Loader className="w-7 h-7 text-indigo-500 animate-spin" />
                      <p className="text-xs">Loading authentic podcast episodes...</p>
                    </div>
                  ) : showEpisodes.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-800 text-muted-foreground text-xs">
                      No episodes found. Please check back shortly or explore another show.
                    </div>
                  ) : (
                    showEpisodes.map((ep) => {
                      const isCurrent = currentTrack?.id === ep.id;
                      const isFav = isFavorite(ep.id);
                      return (
                        <div
                          key={ep.id}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isCurrent
                              ? "border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 shadow-sm"
                              : "border-indigo-100 dark:border-indigo-800/80 bg-white/70 dark:bg-white/5 hover:border-indigo-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => {
                                if (isCurrent && isPlaying) {
                                  togglePlayPause();
                                } else {
                                  playTrack({
                                    id: ep.id,
                                    type: "podcast",
                                    title: ep.title,
                                    subtitle: selectedShow.title,
                                    url: ep.audioUrl,
                                    artworkUrl: ep.artworkUrl || selectedShow.artworkUrl,
                                    duration: ep.duration,
                                    durationSec: ep.durationSec,
                                  });
                                }
                              }}
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md transition-all active:scale-95 ${
                                isCurrent && isPlaying
                                  ? "bg-indigo-600 text-white"
                                  : "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100"
                              }`}
                            >
                              {isCurrent && isLoading ? (
                                <Loader className="w-5 h-5 animate-spin" />
                              ) : isCurrent && isPlaying ? (
                                <Pause className="w-5 h-5 fill-current" />
                              ) : (
                                <Play className="w-5 h-5 fill-current ml-0.5" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-foreground leading-snug line-clamp-2">{ep.title}</h4>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                                {ep.duration && (
                                  <span className="flex items-center gap-1 font-medium text-indigo-600 dark:text-indigo-400">
                                    <Clock className="w-3 h-3" /> {ep.duration}
                                  </span>
                                )}
                                {ep.publishedAt && <span>• {ep.publishedAt}</span>}
                              </div>
                              {ep.description && (
                                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                                  {ep.description}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col gap-1 items-center">
                              <button
                                onClick={() => handleToggleFavorite(ep)}
                                className={`p-1.5 rounded-xl transition-all ${
                                  isFav
                                    ? "text-amber-500 bg-amber-50 dark:bg-amber-950/40"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                                title={isFav ? "Saved" : "Save Episode"}
                              >
                                {isFav ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleShare(ep.title, ep.description)}
                                className="p-1.5 text-muted-foreground hover:text-foreground rounded-xl transition-all"
                                title="Share"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              /* SHOWS OVERVIEW & SEARCH */
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search any Islamic podcast in the world..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-indigo-100 dark:border-indigo-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Subcategory Pills */}
                {!searchQuery && (
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide py-0.5">
                    {["All", "Spiritual", "Seerah & History", "Youth & Life", "Saved"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setPodcastFilter(cat)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          podcastFilter === cat
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-indigo-50/70 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/60"
                        }`}
                      >
                        {cat === "Saved" ? `⭐ Saved (${savedFavoritesList.length})` : cat}
                      </button>
                    ))}
                  </div>
                )}

                {/* Saved Episodes Tab Filter */}
                {podcastFilter === "Saved" && !searchQuery ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">Your bookmarked Islamic podcast episodes & talks</p>
                    {savedFavoritesList.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-800 text-muted-foreground text-xs space-y-2">
                        <Bookmark className="w-8 h-8 text-indigo-400 mx-auto opacity-40" />
                        <p>No saved episodes yet.</p>
                        <p className="text-[11px]">Tap the bookmark icon on any episode to save it here for quick listening.</p>
                      </div>
                    ) : (
                      savedFavoritesList.map((item) => {
                        const isCurrent = currentTrack?.id === item.id;
                        return (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-800/80 bg-white/70 dark:bg-white/5 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                onClick={() =>
                                  playTrack({
                                    id: item.id,
                                    type: "podcast",
                                    title: item.title,
                                    subtitle: "showTitle" in item ? item.showTitle : item.scholar,
                                    url: item.audioUrl,
                                    artworkUrl: "artworkUrl" in item ? item.artworkUrl : undefined,
                                    duration: item.duration,
                                  })
                                }
                                className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md active:scale-95"
                              >
                                {isCurrent && isPlaying ? (
                                  <Pause className="w-4 h-4 fill-white" />
                                ) : (
                                  <Play className="w-4 h-4 fill-white ml-0.5" />
                                )}
                              </button>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-foreground truncate">{item.title}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {"showTitle" in item ? item.showTitle : item.scholar} • {item.duration}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleFavorite(item as any)}
                              className="p-2 text-amber-500 hover:text-red-500"
                              title="Remove from saved"
                            >
                              <BookmarkCheck className="w-5 h-5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  /* Shows Grid */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {searchQuery ? `Search results for "${searchQuery}"` : "Featured Islamic Podcast Channels"}
                      </p>
                      {isSearching && <Loader className="w-3.5 h-3.5 text-indigo-500 animate-spin" />}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {displayedShows.map((show) => (
                        <button
                          key={show.id}
                          onClick={() => setSelectedShow(show)}
                          className="w-full text-left p-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-800/80 bg-white/70 dark:bg-white/5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all active:scale-[0.98] shadow-sm flex items-start gap-3.5 group"
                        >
                          <img
                            src={show.artworkUrl}
                            alt={show.title}
                            className="w-16 h-16 rounded-xl object-cover shadow-md flex-shrink-0 border border-black/5"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                                {show.category}
                              </span>
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <h4 className="text-sm font-bold text-foreground mt-1 truncate">{show.title}</h4>
                            <p className="text-xs text-muted-foreground truncate">{show.host}</p>
                            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{show.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: 24/7 LIVE ISLAMIC RADIO */}
        {/* ==================================================================== */}
        {activeTab === "radio" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Continuous, crystal-clear 24/7 streams 📡</p>
              {location?.country && (
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {location.country}
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {RADIO_STATIONS.map((station) => {
                const isActive = currentTrack?.url === station.url;
                return (
                  <button
                    key={station.id}
                    onClick={() => {
                      if (isActive && isPlaying) {
                        togglePlayPause();
                      } else {
                        playTrack({
                          id: station.id,
                          type: "radio",
                          title: station.name,
                          subtitle: station.country ? `${station.country} • Live Stream` : "24/7 Global Islamic Radio",
                          url: station.url,
                        });
                      }
                    }}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all active:scale-[0.98] ${
                      isActive
                        ? "border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/50 shadow-md"
                        : "border-indigo-100 dark:border-indigo-800 bg-white/70 dark:bg-white/5 hover:border-indigo-200"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${station.color} flex items-center justify-center flex-shrink-0 shadow-md text-2xl`}
                    >
                      {station.flag}
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-foreground truncate">{station.name}</p>
                        {station.country && (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-full flex-shrink-0">
                            Local
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{station.description}</p>
                      {isActive && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                            {isLoading ? "Connecting to audio stream..." : "STREAMING LIVE"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isActive && isPlaying ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-foreground"
                      }`}
                    >
                      {isActive && isLoading ? (
                        <Loader className="w-4 h-4 text-indigo-500 animate-spin" />
                      ) : isActive && isPlaying ? (
                        <Pause className="w-4 h-4 fill-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: CURATED SERIES & TAFSEER */}
        {/* ==================================================================== */}
        {activeTab === "series" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Deep thematic audio series from renowned Islamic teachers</p>

            <div className="space-y-3">
              {CURATED_SERIES.map((item) => {
                const isActive = currentTrack?.id === item.id;
                const isFav = isFavorite(item.id);
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isActive
                        ? "border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 shadow-sm"
                        : "border-indigo-100 dark:border-indigo-800/80 bg-white/70 dark:bg-white/5"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => {
                          if (isActive && isPlaying) {
                            togglePlayPause();
                          } else {
                            playTrack({
                              id: item.id,
                              type: "series",
                              title: item.title,
                              subtitle: item.scholar,
                              url: item.audioUrl,
                              duration: item.duration,
                            });
                          }
                        }}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                          isActive && isPlaying ? "bg-indigo-600 text-white" : "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300"
                        }`}
                      >
                        {isActive && isLoading ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : isActive && isPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                        <h4 className="text-sm font-bold text-foreground mt-1 leading-snug">{item.title}</h4>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">{item.scholar}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1 font-semibold text-indigo-500">
                            <Clock className="w-3.5 h-3.5" /> {item.duration}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleFavorite(item)}
                        className={`p-1.5 rounded-xl transition-all ${
                          isFav ? "text-amber-500 bg-amber-50 dark:bg-amber-950/40" : "text-muted-foreground"
                        }`}
                        title={isFav ? "Saved" : "Save Series"}
                      >
                        {isFav ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: YOUTUBE MEDIA HUB */}
        {/* ==================================================================== */}
        {activeTab === "youtube" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Youtube className="w-3.5 h-3.5 text-red-500" /> Inspiring nasheeds, Quran recitations, & video talks
            </p>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-0.5">
              {(["All", "Quran", "Nasheed", "Lecture"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setYtFilter(c)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    ytFilter === c
                      ? "bg-red-500 text-white shadow-sm"
                      : "bg-white/70 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-red-100 dark:border-red-950"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {activeVideo && (
              <div className="rounded-2xl overflow-hidden border border-red-200 dark:border-red-900/40 bg-black shadow-lg">
                <div className="relative pb-[56.25%]">
                  <iframe
                    src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1&rel=0`}
                    className="absolute inset-0 w-full h-full"
                    title={activeVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-3 bg-white/80 dark:bg-white/5 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-sm font-bold text-foreground line-clamp-1">{activeVideo.title}</p>
                    <p className="text-xs text-red-500 font-semibold">{activeVideo.author}</p>
                  </div>
                  <button
                    onClick={() => setActiveVideo(null)}
                    className="p-1.5 text-muted-foreground hover:text-foreground"
                    title="Close player"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {YOUTUBE_CONTENT.filter((v) => ytFilter === "All" || v.category === ytFilter).map((v, i) => (
                <button
                  key={i}
                  onClick={() => {
                    stopCurrentAudio();
                    setActiveVideo(v);
                  }}
                  className={`text-left rounded-2xl overflow-hidden border transition-all active:scale-95 shadow-sm ${
                    activeVideo?.videoId === v.videoId
                      ? "border-red-400 bg-red-50 dark:bg-red-950/30"
                      : "border-indigo-100 dark:border-indigo-800 bg-white/70 dark:bg-white/5"
                  }`}
                >
                  <div className="relative">
                    <img
                      src={`https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`}
                      alt={v.title}
                      loading="lazy"
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute top-1 right-1 text-[8px] font-bold bg-black/75 text-white px-1.5 py-0.5 rounded-full">
                      {v.category}
                    </span>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-bold text-foreground line-clamp-2 leading-snug">{v.title}</p>
                    <p className="text-[10px] text-red-500 mt-0.5 font-medium">{v.author}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: VOICE HADITH REMINDERS (TTS) */}
        {/* ==================================================================== */}
        {activeTab === "reminders" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Listen to authentic Hadiths read aloud with clear voice 🔊</p>

            <div
              className="rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #8b5cf6 100%)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full text-indigo-100">
                  Hadith of the Day
                </span>
                <span className="text-xs text-indigo-200">
                  {currentHadith + 1} of {HADITHS_TTS.length}
                </span>
              </div>

              <p className="text-base font-bold leading-relaxed mb-4">"{HADITHS_TTS[currentHadith].text}"</p>
              <p className="text-indigo-200 text-xs italic font-medium">[{HADITHS_TTS[currentHadith].source}]</p>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={speakHadith}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 ${
                    speaking ? "bg-red-500 text-white" : "bg-white text-indigo-700 hover:bg-white/90"
                  }`}
                >
                  {speaking ? (
                    <>
                      <Pause className="w-4 h-4 fill-white" /> Stop Voice
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" /> Listen Aloud
                    </>
                  )}
                </button>
                <button
                  onClick={nextHadith}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/20 text-white border border-white/30 font-bold text-sm hover:bg-white/30 active:scale-95 transition-all"
                >
                  Next Hadith <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground">All Reminders</p>
              {HADITHS_TTS.map((h, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentHadith(i);
                    if (window.speechSynthesis) window.speechSynthesis.cancel();
                    setSpeaking(false);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    i === currentHadith
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-sm"
                      : "border-indigo-100 dark:border-indigo-800 bg-white/70 dark:bg-white/5"
                  }`}
                >
                  <p className="text-xs font-semibold text-foreground line-clamp-2">"{h.text}"</p>
                  <p className="text-[10px] text-indigo-500 mt-1 font-medium">[{h.source}]</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* PERSISTENT FLOATING MINI PLAYER */}
        {/* ==================================================================== */}
        {currentTrack && (
          <div
            className="fixed bottom-[74px] left-3 right-3 z-40 max-w-md mx-auto rounded-2xl p-2.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white shadow-2xl border border-indigo-500/30 backdrop-blur-lg flex items-center justify-between gap-3 animate-slide-up"
          >
            {/* Click to expand */}
            <div
              onClick={() => setIsFullPlayerOpen(true)}
              className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
            >
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-indigo-600 flex-shrink-0 flex items-center justify-center shadow-md">
                {currentTrack.artworkUrl ? (
                  <img src={currentTrack.artworkUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Headphones className="w-5 h-5 text-white" />
                )}
                {isPlaying && (
                  <span className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">{currentTrack.title}</p>
                <p className="text-[10px] text-indigo-200 truncate mt-0.5">
                  {currentTrack.subtitle} {currentTrack.type !== "radio" && duration > 0 ? `• ${formatSeconds(currentTime)} / ${formatSeconds(duration)}` : ""}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {currentTrack.type !== "radio" && (
                <button
                  onClick={() => jumpSeconds(-15)}
                  className="p-1.5 text-indigo-200 hover:text-white"
                  title="Rewind 15s"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={togglePlayPause}
                className="w-9 h-9 rounded-full bg-white text-indigo-900 flex items-center justify-center shadow-lg active:scale-95 transition-all"
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 text-indigo-600 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 fill-indigo-900" />
                ) : (
                  <Play className="w-4 h-4 fill-indigo-900 ml-0.5" />
                )}
              </button>

              <button
                onClick={stopCurrentAudio}
                className="p-1.5 text-indigo-200 hover:text-white ml-0.5"
                title="Close Player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* FULLSCREEN AUDIO PLAYER MODAL / DRAWER */}
        {/* ==================================================================== */}
        {isFullPlayerOpen && currentTrack && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-md mx-auto bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white rounded-t-[36px] p-6 shadow-2xl border-t border-indigo-500/30 flex flex-col max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <button
                  onClick={() => setIsFullPlayerOpen(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  aria-label="Collapse"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                  {currentTrack.type === "radio" ? "24/7 Live Radio" : "Islamic Podcast"}
                </p>
                <button
                  onClick={() => handleShare(currentTrack.title)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  aria-label="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Artwork Cover */}
              <div className="relative my-2 aspect-square max-w-[260px] mx-auto w-full rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-indigo-950 flex items-center justify-center">
                {currentTrack.artworkUrl ? (
                  <img src={currentTrack.artworkUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
                ) : (
                  <Headphones className="w-20 h-20 text-indigo-400 opacity-60" />
                )}
                {isPlaying && currentTrack.type === "radio" && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" /> LIVE
                  </div>
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="text-center my-4">
                <h3 className="text-base font-bold text-white line-clamp-2 px-2">{currentTrack.title}</h3>
                <p className="text-xs text-indigo-300 mt-1 font-medium">{currentTrack.subtitle}</p>
              </div>

              {/* Scrubber / Timeline (for podcasts and series) */}
              {currentTrack.type !== "radio" && (
                <div className="space-y-1 my-3">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full accent-indigo-400 h-1.5 bg-white/20 rounded-lg cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[11px] text-indigo-300 font-mono">
                    <span>{formatSeconds(currentTime)}</span>
                    <span>-{formatSeconds(Math.max(0, duration - currentTime))}</span>
                  </div>
                </div>
              )}

              {/* Main Playback Controls */}
              <div className="flex items-center justify-center gap-6 my-4">
                {currentTrack.type !== "radio" && (
                  <button
                    onClick={() => jumpSeconds(-15)}
                    className="p-3 rounded-full text-indigo-200 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                    title="Jump back 15 seconds"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </button>
                )}

                <button
                  onClick={togglePlayPause}
                  className="w-16 h-16 rounded-full bg-white text-indigo-900 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  {isLoading ? (
                    <Loader className="w-7 h-7 text-indigo-600 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-7 h-7 fill-indigo-900" />
                  ) : (
                    <Play className="w-7 h-7 fill-indigo-900 ml-1" />
                  )}
                </button>

                {currentTrack.type !== "radio" && (
                  <button
                    onClick={() => jumpSeconds(15)}
                    className="p-3 rounded-full text-indigo-200 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                    title="Jump forward 15 seconds"
                  >
                    <RotateCw className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Secondary Controls: Speed & Sleep Timer */}
              <div className="flex items-center justify-around border-t border-white/10 pt-4 mt-2">
                {/* Speed Button */}
                {currentTrack.type !== "radio" ? (
                  <button
                    onClick={cycleSpeed}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-200"
                  >
                    <span>{playbackSpeed}x Speed</span>
                  </button>
                ) : (
                  <div className="text-xs text-indigo-300 font-semibold flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-emerald-400" /> High-Quality Stream
                  </div>
                )}

                {/* Sleep Timer */}
                <div className="relative">
                  <button
                    onClick={() => setShowSleepMenu((m) => !m)}
                    className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                      sleepRemainingSec !== null
                        ? "bg-amber-500 text-white shadow-md"
                        : "bg-white/10 hover:bg-white/20 text-indigo-200"
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>{sleepRemainingSec !== null ? `${Math.ceil(sleepRemainingSec / 60)}m left` : "Sleep Timer"}</span>
                  </button>

                  {showSleepMenu && (
                    <div className="absolute bottom-full right-0 mb-2 w-36 bg-slate-900 border border-white/20 rounded-2xl p-1.5 shadow-2xl z-50 text-xs">
                      {[
                        { label: "15 Minutes", val: 15 },
                        { label: "30 Minutes", val: 30 },
                        { label: "45 Minutes", val: 45 },
                        { label: "60 Minutes", val: 60 },
                        { label: "Off", val: null },
                      ].map((item) => (
                        <button
                          key={String(item.val)}
                          onClick={() => {
                            setSleepTimerMinutes(item.val);
                            setShowSleepMenu(false);
                            if (item.val) {
                              toast.info(`Sleep timer set to ${item.val} minutes`);
                            } else {
                              toast.info("Sleep timer turned off");
                            }
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/15 text-white"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Podcasts;
