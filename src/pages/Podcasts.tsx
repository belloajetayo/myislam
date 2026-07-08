import React, { useState, useRef, useEffect, useMemo } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Headphones, Play, Pause, Radio, Volume2, VolumeX, Mic, ChevronRight, Loader, Youtube, MapPin } from "lucide-react";
import { useSharedLocation } from "@/context/useSharedLocation";

type Station = { name: string; description: string; url: string; color: string; flag: string; country?: string };

// Global Islamic Radio Streams
const GLOBAL_STATIONS: Station[] = [
  { name: "Quran Radio", description: "24/7 Holy Quran recitation", url: "https://stream.radiojar.com/quran-hafs-sulami", color: "from-emerald-500 to-teal-600", flag: "🕌" },
  { name: "Makkah Live", description: "Live from Masjid Al-Haram", url: "https://Qurango.net/radio/tarateel", color: "from-amber-500 to-orange-600", flag: "🕋" },
  { name: "Islamic Reminders", description: "Lectures and reminders", url: "https://stream.zeno.fm/0r0xa792kwzuv", color: "from-indigo-500 to-blue-600", flag: "📖" },
  { name: "Madinah Radio", description: "Live from Masjid An-Nabawi", url: "https://stream.radiojar.com/madinah", color: "from-rose-500 to-pink-600", flag: "🌙" },
  { name: "Quran Kareem", description: "Beautiful Quran recitation", url: "https://n0d.radiojar.com/csp2r04750quv?rj-ttl=5&rj-tok=AAABkVZH_xMADHIBXXxmh9g5VA", color: "from-purple-500 to-violet-600", flag: "✨" },
];

// Region-specific stations — enabled by user's country
const REGIONAL_STATIONS: Record<string, Station[]> = {
  "Saudi Arabia": [
    { name: "Idha'at al-Quran (KSA)", description: "Saudi Quran radio", url: "https://svr7.radiotime.com/mp3/s1088067.mp3", color: "from-green-600 to-emerald-700", flag: "🇸🇦", country: "Saudi Arabia" },
    { name: "Nida al-Islam", description: "Islamic lectures — Riyadh", url: "https://stream.radiojar.com/nida-alislam", color: "from-teal-500 to-green-600", flag: "🇸🇦", country: "Saudi Arabia" },
  ],
  "Egypt": [
    { name: "Idha'at al-Quran (Egypt)", description: "Egypt's national Quran radio", url: "https://n0a.radiojar.com/8s5u5tpdtwzuv", color: "from-yellow-500 to-amber-600", flag: "🇪🇬", country: "Egypt" },
  ],
  "United Arab Emirates": [
    { name: "Quran Kareem Dubai", description: "Dubai Holy Quran radio", url: "https://uk2.streamingpulse.com/ssl/dqr", color: "from-red-500 to-rose-600", flag: "🇦🇪", country: "United Arab Emirates" },
  ],
  "Turkey": [
    { name: "Diyanet Radyosu", description: "Turkey Islamic radio", url: "https://radyo.dogannet.tv/diyanet", color: "from-red-600 to-red-800", flag: "🇹🇷", country: "Turkey" },
  ],
  "Indonesia": [
    { name: "Rodja FM", description: "Indonesian Sunni radio", url: "https://radio.rodja.id:8443/rodjafm", color: "from-red-500 to-white", flag: "🇮🇩", country: "Indonesia" },
    { name: "MQFM Bandung", description: "Manajemen Qolbu radio", url: "https://streaming.mqfm.co.id/mqfm", color: "from-emerald-500 to-green-600", flag: "🇮🇩", country: "Indonesia" },
  ],
  "Malaysia": [
    { name: "IKIMfm", description: "Malaysia Islamic knowledge", url: "https://ikimfmlh.rastream.com/ikimfm", color: "from-blue-500 to-indigo-600", flag: "🇲🇾", country: "Malaysia" },
  ],
  "Pakistan": [
    { name: "Radio Pakistan Quran", description: "Pakistan Quran channel", url: "https://live.radio.pk/stream/quran", color: "from-green-600 to-emerald-700", flag: "🇵🇰", country: "Pakistan" },
  ],
  "Nigeria": [
    { name: "Deenee Radio", description: "Nigerian Islamic radio", url: "https://s2.radio.co/s2b2b68a1e/listen", color: "from-green-500 to-emerald-600", flag: "🇳🇬", country: "Nigeria" },
  ],
  "United Kingdom": [
    { name: "Islam Channel Radio", description: "UK Islamic radio", url: "https://icradio.streamguys1.com/live-mp3", color: "from-blue-600 to-indigo-700", flag: "🇬🇧", country: "United Kingdom" },
  ],
  "United States": [
    { name: "Muslim Community Radio", description: "US Islamic community", url: "https://s2.radio.co/s5f7d97b3d/listen", color: "from-blue-500 to-red-500", flag: "🇺🇸", country: "United States" },
  ],
};

// YouTube Islamic content — nasheeds, Quran, lectures
type YoutubeItem = { title: string; author: string; videoId: string; category: string };
const YOUTUBE_CONTENT: YoutubeItem[] = [
  { title: "Beautiful Quran Recitation — Sheikh Abdur-Rahman As-Sudais", author: "Haramain", videoId: "s_kfoLKGRE0", category: "Quran" },
  { title: "Maher Al Muaiqly — Full Quran", author: "Maher Al Muaiqly", videoId: "0DGpk3sq2ug", category: "Quran" },
  { title: "Mishary Rashid Alafasy — Surah Ar-Rahman", author: "Mishary Alafasy", videoId: "BbG9GgHwEnA", category: "Quran" },
  { title: "Sami Yusuf — Hasbi Rabbi", author: "Sami Yusuf", videoId: "0aoZmVzLbaU", category: "Nasheed" },
  { title: "Maher Zain — Insha Allah", author: "Maher Zain", videoId: "n5X2VOZZeQE", category: "Nasheed" },
  { title: "Harris J — Salam Alaikum", author: "Harris J", videoId: "Hzwzp3xLh5w", category: "Nasheed" },
  { title: "Mustafa Ceceli — Bismillah", author: "Mustafa Ceceli", videoId: "GhCTPmxRHhw", category: "Nasheed" },
  { title: "Omar Suleiman — Purifying the Heart", author: "Yaqeen Institute", videoId: "hSbFZJTVzZM", category: "Lecture" },
  { title: "Mufti Menk — Motivational Reminder", author: "Mufti Menk", videoId: "GX4ULOWtcnU", category: "Lecture" },
  { title: "Nouman Ali Khan — Understanding the Quran", author: "Bayyinah", videoId: "OZzKVsi-vqM", category: "Lecture" },
];



// Islamic Lectures from free API
const LECTURES = [
  { title: "The Importance of Prayer", scholar: "Sheikh Yasir Qadhi", duration: "45 min", url: "https://ia800905.us.archive.org/17/items/sheikh-yasir-qadhi-lectures/The-Importance-of-Prayer.mp3", category: "Prayer" },
  { title: "Tafseer of Surah Al-Fatiha", scholar: "Nouman Ali Khan", duration: "30 min", url: "https://ia800905.us.archive.org/17/items/nouman-ali-khan/surah-fatiha-tafseer.mp3", category: "Quran" },
  { title: "Stories of the Prophets", scholar: "Sheikh Anwar Al-Awlaki", duration: "60 min", url: "https://ia800201.us.archive.org/29/items/StoriesOfTheProphets_201312/01-Stories-Of-The-Prophets.mp3", category: "History" },
  { title: "The Day of Judgment", scholar: "Sheikh Omar Suleiman", duration: "40 min", url: "https://ia600209.us.archive.org/14/items/sheikh-omar-suleiman/day-of-judgment.mp3", category: "Aqeedah" },
  { title: "Purification of the Soul", scholar: "Sheikh Hamza Yusuf", duration: "55 min", url: "https://ia800905.us.archive.org/17/items/hamza-yusuf-lectures/purification-of-soul.mp3", category: "Spirituality" },
];

// Hadiths for TTS
const HADITHS_TTS = [
  { text: "The best among you are those who have the best manners and character.", source: "Sahih Al-Bukhari" },
  { text: "None of you truly believes until he loves for his brother what he loves for himself.", source: "Sahih Al-Bukhari & Muslim" },
  { text: "The strong man is not the one who overcomes others by force, but the one who controls himself while in anger.", source: "Sahih Al-Bukhari" },
  { text: "Smiling at your brother is an act of charity.", source: "At-Tirmidhi" },
  { text: "Make things easy and do not make them difficult, cheer people up and do not drive them away.", source: "Sahih Al-Bukhari" },
];

const Podcasts: React.FC = () => {
  const navigate = useNavigate();
  const { location } = useSharedLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeTab, setActiveTab] = useState<"radio" | "youtube" | "lectures" | "reminders">("radio");
  const [playing, setPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [currentLecture, setCurrentLecture] = useState<typeof LECTURES[0] | null>(null);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [currentHadith, setCurrentHadith] = useState(0);
  const [ytFilter, setYtFilter] = useState<"All" | "Quran" | "Nasheed" | "Lecture">("All");
  const [activeVideo, setActiveVideo] = useState<YoutubeItem | null>(null);

  // Location-based station list — global + user's country if we have one
  const RADIO_STATIONS = useMemo<Station[]>(() => {
    const country = location?.country;
    const local = country && REGIONAL_STATIONS[country] ? REGIONAL_STATIONS[country] : [];
    return [...local, ...GLOBAL_STATIONS];
  }, [location?.country]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const playAudio = async (url: string) => {
    try {
      setLoading(true);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const audio = new Audio(url);
      audio.muted = muted;
      audio.crossOrigin = "anonymous";
      audioRef.current = audio;
      audio.oncanplay = () => setLoading(false);
      audio.onended = () => { setPlaying(false); setCurrentStation(null); setCurrentLecture(null); };
      audio.onerror = () => { setLoading(false); setPlaying(false); };
      await audio.play();
      setPlaying(true);
    } catch {
      setLoading(false);
      setPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlaying(false);
    setCurrentStation(null);
    setCurrentLecture(null);
  };

  const handleStation = async (station: typeof RADIO_STATIONS[0]) => {
    if (currentStation?.name === station.name && playing) {
      stopAudio();
      return;
    }
    setCurrentStation(station);
    setCurrentLecture(null);
    await playAudio(station.url);
  };

  const handleLecture = async (lecture: typeof LECTURES[0]) => {
    if (currentLecture?.title === lecture.title && playing) {
      stopAudio();
      return;
    }
    setCurrentLecture(lecture);
    setCurrentStation(null);
    await playAudio(lecture.url);
  };

  const toggleMute = () => {
    setMuted(m => {
      if (audioRef.current) audioRef.current.muted = !m;
      return !m;
    });
  };

  const speakHadith = () => {
    if (!window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const hadith = HADITHS_TTS[currentHadith];
    const utterance = new SpeechSynthesisUtterance(
      `The Prophet peace be upon him said: ${hadith.text}. This Hadith is from ${hadith.source}.`
    );
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const nextHadith = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeaking(false);
    setCurrentHadith(i => (i + 1) % HADITHS_TTS.length);
  };

  return (
    <MobileLayout>
      <div className="p-4 space-y-5 pb-8">
        {/* Header */}
        <header className="flex items-center gap-3 py-3">
          <button onClick={() => navigate("/")} className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/60 dark:bg-white/5 border border-indigo-100 dark:border-indigo-800">
            <ArrowLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-lg text-foreground flex items-center gap-2">
              <Headphones className="w-5 h-5 text-indigo-500" />
              Islamic Audio
            </h1>
            <p className="text-xs text-muted-foreground">Radio • Lectures • Reminders</p>
          </div>
          {(playing || loading) && (
            <button onClick={toggleMute} className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              {muted ? <VolumeX className="w-4 h-4 text-indigo-500" /> : <Volume2 className="w-4 h-4 text-indigo-500" />}
            </button>
          )}
        </header>

        {/* Now Playing bar */}
        {(playing || loading) && (currentStation || currentLecture) && (
          <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: "linear-gradient(135deg, #4f46e5, #0ea5e9)" }}>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              {loading ? <Loader className="w-5 h-5 text-white animate-spin" /> : <Volume2 className="w-5 h-5 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm truncate">{currentStation?.name || currentLecture?.title}</p>
              <p className="text-blue-100 text-[10px]">{loading ? "Connecting..." : "Now Playing 🎵"}</p>
            </div>
            <button onClick={stopAudio} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Pause className="w-4 h-4 text-white fill-white" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: "radio", label: "📻 Radio", icon: Radio },
            { id: "lectures", label: "🎙️ Lectures", icon: Mic },
            { id: "reminders", label: "🤲 Reminders", icon: Headphones },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-indigo-100 dark:border-indigo-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Radio Tab */}
        {activeTab === "radio" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Tap to tune in live 📡</p>
            {RADIO_STATIONS.map((station, i) => {
              const isActive = currentStation?.name === station.name;
              return (
                <button
                  key={i}
                  onClick={() => handleStation(station)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-95 ${
                    isActive
                      ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                      : "border-indigo-100 dark:border-indigo-800 bg-white/60 dark:bg-white/5"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${station.color} flex items-center justify-center flex-shrink-0 shadow-md text-2xl`}>
                    {station.flag}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-foreground">{station.name}</p>
                    <p className="text-[11px] text-muted-foreground">{station.description}</p>
                    {isActive && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[9px] text-green-500 font-bold">{loading ? "Connecting..." : "LIVE"}</span>
                      </div>
                    )}
                  </div>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    isActive && playing ? "bg-indigo-500" : "bg-gray-100 dark:bg-gray-800"
                  }`}>
                    {isActive && loading ? (
                      <Loader className="w-4 h-4 text-indigo-500 animate-spin" />
                    ) : isActive && playing ? (
                      <Pause className="w-4 h-4 text-white fill-white" />
                    ) : (
                      <Play className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Lectures Tab */}
        {activeTab === "lectures" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Islamic lectures from renowned scholars</p>
            {LECTURES.map((lecture, i) => {
              const isActive = currentLecture?.title === lecture.title;
              return (
                <button
                  key={i}
                  onClick={() => handleLecture(lecture)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-95 ${
                    isActive
                      ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                      : "border-indigo-100 dark:border-indigo-800 bg-white/60 dark:bg-white/5"
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Mic className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-foreground line-clamp-1">{lecture.title}</p>
                    <p className="text-[11px] text-indigo-500 font-medium">{lecture.scholar}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-muted-foreground">{lecture.duration}</span>
                      <span className="text-[9px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-400 px-1.5 py-0.5 rounded-full font-semibold">{lecture.category}</span>
                    </div>
                  </div>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    isActive && playing ? "bg-indigo-500" : "bg-gray-100 dark:bg-gray-800"
                  }`}>
                    {isActive && loading ? (
                      <Loader className="w-4 h-4 text-indigo-500 animate-spin" />
                    ) : isActive && playing ? (
                      <Pause className="w-4 h-4 text-white fill-white" />
                    ) : (
                      <Play className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Reminders Tab — TTS */}
        {activeTab === "reminders" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Listen to Hadiths read aloud 🔊</p>

            {/* Current Hadith card */}
            <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-3">Hadith Reminder</p>
              <p className="text-base font-bold leading-relaxed mb-3">
                "{HADITHS_TTS[currentHadith].text}"
              </p>
              <p className="text-indigo-200 text-xs italic">[{HADITHS_TTS[currentHadith].source}]</p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={speakHadith}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    speaking
                      ? "bg-red-500 text-white"
                      : "bg-white/20 text-white border border-white/30"
                  }`}
                >
                  {speaking ? (
                    <><Pause className="w-4 h-4" /> Stop</>
                  ) : (
                    <><Volume2 className="w-4 h-4" /> Listen</>
                  )}
                </button>
                <button
                  onClick={nextHadith}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/20 text-white border border-white/30 font-bold text-sm"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* All hadiths list */}
            <div className="space-y-2">
              {HADITHS_TTS.map((h, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentHadith(i); if (window.speechSynthesis) window.speechSynthesis.cancel(); setSpeaking(false); }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    i === currentHadith
                      ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                      : "border-indigo-100 dark:border-indigo-800 bg-white/60 dark:bg-white/5"
                  }`}
                >
                  <p className="text-xs font-semibold text-foreground line-clamp-2">"{h.text}"</p>
                  <p className="text-[10px] text-indigo-400 mt-1">[{h.source}]</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default Podcasts;
