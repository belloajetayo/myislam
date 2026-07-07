import React, { useState, useRef, useEffect, useMemo } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Headphones, Play, Pause, Radio, Volume2, VolumeX, Mic, ChevronRight, Loader, Youtube, MapPin } from "lucide-react";
import { useSharedLocation } from "@/context/useSharedLocation";

// Islamic Radio Streams — tagged with countries where they resonate most
interface Station {
  name: string;
  description: string;
  url: string;
  color: string;
  flag: string;
  countries: string[]; // ISO country names to boost
}

const RADIO_STATIONS: Station[] = [
  { name: "Quran Radio", description: "24/7 Holy Quran recitation", url: "https://stream.radiojar.com/quran-hafs-sulami", color: "from-emerald-500 to-teal-600", flag: "🕌", countries: ["*"] },
  { name: "Makkah Live", description: "Live from Masjid Al-Haram", url: "https://Qurango.net/radio/tarateel", color: "from-amber-500 to-orange-600", flag: "🕋", countries: ["*"] },
  { name: "Madinah Radio", description: "Live from Masjid An-Nabawi", url: "https://stream.radiojar.com/madinah", color: "from-rose-500 to-pink-600", flag: "🌙", countries: ["*"] },
  { name: "Quran Kareem", description: "Beautiful Quran recitation", url: "https://n0d.radiojar.com/csp2r04750quv?rj-ttl=5&rj-tok=AAABkVZH_xMADHIBXXxmh9g5VA", color: "from-purple-500 to-violet-600", flag: "✨", countries: ["*"] },
  { name: "Islamic Reminders", description: "English lectures & reminders", url: "https://stream.zeno.fm/0r0xa792kwzuv", color: "from-indigo-500 to-blue-600", flag: "📖", countries: ["United States", "United Kingdom", "Canada", "Australia"] },
  // Regional stations
  { name: "Turkey Diyanet FM", description: "Türkiye · Diyanet Radio", url: "https://tvradyo.diyanet.gov.tr/DiyanetRadyo", color: "from-red-500 to-rose-600", flag: "🇹🇷", countries: ["Turkey"] },
  { name: "Radio Sawt Al-Islam", description: "Egypt · Voice of Islam", url: "https://stream.zeno.fm/qh9zqvnfmwzuv", color: "from-amber-600 to-yellow-600", flag: "🇪🇬", countries: ["Egypt"] },
  { name: "Radio Coran Maroc", description: "Morocco · Idaat Muhammed VI", url: "https://stream.radiojar.com/8s5u5tpdtwzuv", color: "from-emerald-600 to-green-700", flag: "🇲🇦", countries: ["Morocco"] },
  { name: "IRIB Quran Radio", description: "Iran · Radio Ma'aref", url: "https://icecast.irib.ir/hls/radiomaaref/index.m3u8", color: "from-teal-600 to-cyan-700", flag: "🇮🇷", countries: ["Iran"] },
  { name: "Radio Pakistan Quran", description: "Pakistan · FM Quran", url: "https://live.radio.pk:8443/live", color: "from-green-600 to-emerald-700", flag: "🇵🇰", countries: ["Pakistan"] },
  { name: "Suara Quran Indonesia", description: "Indonesia · Suara Al-Qur'an", url: "https://stream.zeno.fm/4ta4qs5w1uhvv", color: "from-red-600 to-orange-600", flag: "🇮🇩", countries: ["Indonesia"] },
  { name: "Malaysia IKIM.fm", description: "Malaysia · Islamic radio", url: "https://ikimfm.rastream.com/ikimfm-ikimfm", color: "from-blue-600 to-indigo-700", flag: "🇲🇾", countries: ["Malaysia"] },
  { name: "BBC Asian Network", description: "UK · South Asian & Islamic content", url: "https://stream.live.vc.bbcmedia.co.uk/bbc_asian_network", color: "from-pink-600 to-rose-700", flag: "🇬🇧", countries: ["United Kingdom"] },
  { name: "Radio Al Quran Nigeria", description: "Nigeria · English & Hausa", url: "https://stream.zeno.fm/upa2ntfmnthvv", color: "from-green-500 to-lime-600", flag: "🇳🇬", countries: ["Nigeria"] },
];

// YouTube playlists / videos for music tab
const YOUTUBE_ITEMS = [
  { id: "AR6W-jWe85k", title: "Makkah Live · Masjid al-Haram", channel: "Saudi Quran TV", kind: "live" },
  { id: "51zCq5EbBTM", title: "Madinah Live · Masjid an-Nabawi", channel: "Sunnah TV", kind: "live" },
  { id: "GTGtxIayHRE", title: "Beautiful Nasheeds Collection", channel: "Muslim by Nature", kind: "playlist" },
  { id: "AXbSjggJDh4", title: "Maher Al Muaiqly · Full Quran", channel: "Quran", kind: "playlist" },
  { id: "9E6b3swbnWg", title: "Mishary Rashid Alafasy · Rain Recitation", channel: "Alafasy", kind: "playlist" },
  { id: "kzWSuwPQhDU", title: "Peaceful Islamic Instrumentals", channel: "Halal Vibes", kind: "playlist" },
];

const HADITHS_TTS = [
  { text: "The best among you are those who have the best manners and character.", source: "Sahih Al-Bukhari" },
  { text: "None of you truly believes until he loves for his brother what he loves for himself.", source: "Sahih Al-Bukhari & Muslim" },
  { text: "The strong man is not the one who overcomes others by force, but the one who controls himself while in anger.", source: "Sahih Al-Bukhari" },
  { text: "Smiling at your brother is an act of charity.", source: "At-Tirmidhi" },
  { text: "Make things easy and do not make them difficult, cheer people up and do not drive them away.", source: "Sahih Al-Bukhari" },
];

const LECTURES = [
  { title: "The Importance of Prayer", scholar: "Sheikh Yasir Qadhi", duration: "45 min", url: "https://ia800905.us.archive.org/17/items/sheikh-yasir-qadhi-lectures/The-Importance-of-Prayer.mp3", category: "Prayer" },
  { title: "Tafseer of Surah Al-Fatiha", scholar: "Nouman Ali Khan", duration: "30 min", url: "https://ia800905.us.archive.org/17/items/nouman-ali-khan/surah-fatiha-tafseer.mp3", category: "Quran" },
  { title: "Stories of the Prophets", scholar: "Sheikh Anwar Al-Awlaki", duration: "60 min", url: "https://ia800201.us.archive.org/29/items/StoriesOfTheProphets_201312/01-Stories-Of-The-Prophets.mp3", category: "History" },
  { title: "The Day of Judgment", scholar: "Sheikh Omar Suleiman", duration: "40 min", url: "https://ia600209.us.archive.org/14/items/sheikh-omar-suleiman/day-of-judgment.mp3", category: "Aqeedah" },
  { title: "Purification of the Soul", scholar: "Sheikh Hamza Yusuf", duration: "55 min", url: "https://ia800905.us.archive.org/17/items/hamza-yusuf-lectures/purification-of-soul.mp3", category: "Spirituality" },
];

const Podcasts: React.FC = () => {
  const navigate = useNavigate();
  const { location } = useSharedLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [activeTab, setActiveTab] = useState<"radio" | "youtube" | "lectures" | "reminders">("radio");
  const [playing, setPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [currentLecture, setCurrentLecture] = useState<typeof LECTURES[0] | null>(null);
  const [currentYT, setCurrentYT] = useState<typeof YOUTUBE_ITEMS[0] | null>(null);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [currentHadith, setCurrentHadith] = useState(0);

  const country = location?.country ?? "";

  // Sort stations: local first, then global (*), then rest
  const sortedStations = useMemo(() => {
    return [...RADIO_STATIONS].sort((a, b) => {
      const aLocal = country && a.countries.includes(country) ? 0 : a.countries.includes("*") ? 1 : 2;
      const bLocal = country && b.countries.includes(country) ? 0 : b.countries.includes("*") ? 1 : 2;
      return aLocal - bLocal;
    });
  }, [country]);

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const playAudio = async (url: string) => {
    try {
      setLoading(true);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      const audio = new Audio(url);
      audio.muted = muted;
      audio.crossOrigin = "anonymous";
      audioRef.current = audio;
      audio.oncanplay = () => setLoading(false);
      audio.onended = () => { setPlaying(false); setCurrentStation(null); setCurrentLecture(null); };
      audio.onerror = () => { setLoading(false); setPlaying(false); };
      await audio.play();
      setPlaying(true);
    } catch { setLoading(false); setPlaying(false); }
  };

  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlaying(false); setCurrentStation(null); setCurrentLecture(null);
  };

  const handleStation = async (station: Station) => {
    if (currentStation?.name === station.name && playing) { stopAudio(); return; }
    setCurrentStation(station); setCurrentLecture(null);
    await playAudio(station.url);
  };

  const handleLecture = async (lecture: typeof LECTURES[0]) => {
    if (currentLecture?.title === lecture.title && playing) { stopAudio(); return; }
    setCurrentLecture(lecture); setCurrentStation(null);
    await playAudio(lecture.url);
  };

  const toggleMute = () => {
    setMuted(m => { if (audioRef.current) audioRef.current.muted = !m; return !m; });
  };

  const speakHadith = () => {
    if (!window.speechSynthesis) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const hadith = HADITHS_TTS[currentHadith];
    const utterance = new SpeechSynthesisUtterance(
      `The Prophet peace be upon him said: ${hadith.text}. This Hadith is from ${hadith.source}.`
    );
    utterance.rate = 0.85; utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance); setSpeaking(true);
  };

  const nextHadith = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeaking(false);
    setCurrentHadith(i => (i + 1) % HADITHS_TTS.length);
  };

  return (
    <MobileLayout>
      <div className="p-4 space-y-5 pb-8">
        <header className="flex items-center gap-3 py-3">
          <button onClick={() => navigate("/")} className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/60 dark:bg-white/5 border border-indigo-100 dark:border-indigo-800">
            <ArrowLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-lg text-foreground flex items-center gap-2">
              <Headphones className="w-5 h-5 text-indigo-500" />
              Islamic Audio
            </h1>
            <p className="text-xs text-muted-foreground">Radio • YouTube • Lectures • Reminders</p>
          </div>
          {(playing || loading) && (
            <button onClick={toggleMute} className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              {muted ? <VolumeX className="w-4 h-4 text-indigo-500" /> : <Volume2 className="w-4 h-4 text-indigo-500" />}
            </button>
          )}
        </header>

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
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "radio", label: "📻 Radio" },
            { id: "youtube", label: "▶️ YouTube" },
            { id: "lectures", label: "🎙️ Lectures" },
            { id: "reminders", label: "🤲 Duas" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-2 rounded-xl text-[11px] font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-indigo-100 dark:border-indigo-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Radio */}
        {activeTab === "radio" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              {country
                ? <span>Stations near <b>{location?.city || country}</b> shown first</span>
                : <span>Tap to tune in live 📡</span>}
            </div>
            {sortedStations.map((station, i) => {
              const isActive = currentStation?.name === station.name;
              const isLocal = country && station.countries.includes(country);
              return (
                <button
                  key={i}
                  onClick={() => handleStation(station)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all active:scale-95 ${
                    isActive ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30" : "border-indigo-100 dark:border-indigo-800 bg-white/60 dark:bg-white/5"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${station.color} flex items-center justify-center flex-shrink-0 shadow-md text-2xl`}>
                    {station.flag}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-foreground">{station.name}</p>
                      {isLocal && <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">NEAR YOU</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{station.description}</p>
                    {isActive && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[9px] text-green-500 font-bold">{loading ? "Connecting..." : "LIVE"}</span>
                      </div>
                    )}
                  </div>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isActive && playing ? "bg-indigo-500" : "bg-gray-100 dark:bg-gray-800"}`}>
                    {isActive && loading ? <Loader className="w-4 h-4 text-indigo-500 animate-spin" />
                      : isActive && playing ? <Pause className="w-4 h-4 text-white fill-white" />
                      : <Play className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* YouTube */}
        {activeTab === "youtube" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Youtube className="w-3.5 h-3.5 text-red-500" /> YouTube music, Quran & nasheeds
            </p>

            {currentYT && (
              <div className="rounded-2xl overflow-hidden border border-indigo-200 dark:border-indigo-800 bg-black shadow-lg animate-fade-in">
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${currentYT.id}?autoplay=1&rel=0`}
                    title={currentYT.title}
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-3 flex items-center justify-between bg-gradient-to-r from-red-500 to-rose-600 text-white">
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{currentYT.title}</p>
                    <p className="text-[10px] opacity-80">{currentYT.channel}</p>
                  </div>
                  <button onClick={() => setCurrentYT(null)} className="ml-2 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Pause className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {YOUTUBE_ITEMS.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentYT(item)}
                  className={`text-left rounded-2xl overflow-hidden border transition-all active:scale-95 ${
                    currentYT?.id === item.id ? "border-red-400 ring-2 ring-red-200" : "border-indigo-100 dark:border-indigo-800"
                  }`}
                >
                  <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                    <img
                      src={`https://img.youtube.com/vi/${item.id}/mqdefault.jpg`}
                      alt={item.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>
                    {item.kind === "live" && (
                      <span className="absolute top-1.5 left-1.5 text-[9px] font-bold text-white bg-red-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                      </span>
                    )}
                  </div>
                  <div className="p-2 bg-white dark:bg-white/5">
                    <p className="text-[11px] font-bold text-foreground line-clamp-2">{item.title}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{item.channel}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lectures */}
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
                    isActive ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30" : "border-indigo-100 dark:border-indigo-800 bg-white/60 dark:bg-white/5"
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
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isActive && playing ? "bg-indigo-500" : "bg-gray-100 dark:bg-gray-800"}`}>
                    {isActive && loading ? <Loader className="w-4 h-4 text-indigo-500 animate-spin" />
                      : isActive && playing ? <Pause className="w-4 h-4 text-white fill-white" />
                      : <Play className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Reminders */}
        {activeTab === "reminders" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Listen to Hadiths read aloud 🔊</p>
            <div className="rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-3">Hadith Reminder</p>
              <p className="text-base font-bold leading-relaxed mb-3">"{HADITHS_TTS[currentHadith].text}"</p>
              <p className="text-indigo-200 text-xs italic">[{HADITHS_TTS[currentHadith].source}]</p>
              <div className="flex gap-3 mt-4">
                <button onClick={speakHadith} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${speaking ? "bg-red-500 text-white" : "bg-white/20 text-white border border-white/30"}`}>
                  {speaking ? (<><Pause className="w-4 h-4" /> Stop</>) : (<><Volume2 className="w-4 h-4" /> Listen</>)}
                </button>
                <button onClick={nextHadith} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/20 text-white border border-white/30 font-bold text-sm">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {HADITHS_TTS.map((h, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentHadith(i); if (window.speechSynthesis) window.speechSynthesis.cancel(); setSpeaking(false); }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    i === currentHadith ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30" : "border-indigo-100 dark:border-indigo-800 bg-white/60 dark:bg-white/5"
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
