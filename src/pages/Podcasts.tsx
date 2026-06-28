import React, { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Headphones, ExternalLink, Play, X } from "lucide-react";

const PODCASTS = [
  {
    name: "Yaqeen Institute",
    description: "Research-based Islamic content for the 21st century Muslim",
    category: "Knowledge",
    color: "from-emerald-500 to-teal-600",
    spotifyUrl: "https://open.spotify.com/show/0vC9BE1GIiTOenomDKjRZZ",
    embedId: "0vC9BE1GIiTOenomDKjRZZ",
    episodes: "200+ episodes",
  },
  {
    name: "Mufti Menk",
    description: "Daily reminders and Islamic guidance",
    category: "Reminders",
    color: "from-amber-500 to-orange-600",
    spotifyUrl: "https://open.spotify.com/show/4OkMVUfBqSIxHrqtjOJXX9",
    embedId: "4OkMVUfBqSIxHrqtjOJXX9",
    episodes: "500+ episodes",
  },
  {
    name: "The Muslim Life Podcast",
    description: "Real conversations about living as a Muslim today",
    category: "Lifestyle",
    color: "from-indigo-500 to-blue-600",
    spotifyUrl: "https://open.spotify.com/show/2mPHjNzHHs7MQeI7XWHKL9",
    embedId: "2mPHjNzHHs7MQeI7XWHKL9",
    episodes: "100+ episodes",
  },
  {
    name: "The Deen Show",
    description: "Conversations about Islam with Eddie",
    category: "Dawah",
    color: "from-rose-500 to-pink-600",
    spotifyUrl: "https://open.spotify.com/show/2hmkzUtix0qTqvZGDA7UMn",
    embedId: "2hmkzUtix0qTqvZGDA7UMn",
    episodes: "300+ episodes",
  },
  {
    name: "Quran Weekly",
    description: "Weekly Quran reflections and tafseer",
    category: "Quran",
    color: "from-purple-500 to-violet-600",
    spotifyUrl: "https://open.spotify.com/show/5VzFvh1JlEhBMS6ZHZ8CNO",
    embedId: "5VzFvh1JlEhBMS6ZHZ8CNO",
    episodes: "150+ episodes",
  },
  {
    name: "Productive Muslim",
    description: "Islamic productivity and personal development",
    category: "Lifestyle",
    color: "from-cyan-500 to-sky-600",
    spotifyUrl: "https://open.spotify.com/show/1mGpMBT9DKBqhsz4HPTAG6",
    embedId: "1mGpMBT9DKBqhsz4HPTAG6",
    episodes: "80+ episodes",
  },
];

const CATEGORIES = ["All", "Knowledge", "Lifestyle", "Reminders", "Dawah", "Quran"];

const Podcasts: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);
  const [embedPodcast, setEmbedPodcast] = useState<typeof PODCASTS[0] | null>(null);

  const filtered = activeCategory === "All"
    ? PODCASTS
    : PODCASTS.filter(p => p.category === activeCategory);

  const handlePlay = (podcast: typeof PODCASTS[0]) => {
    setEmbedPodcast(embedPodcast?.name === podcast.name ? null : podcast);
  };

  return (
    <MobileLayout>
      {/* WebView Modal */}
      {webViewUrl && (
        <div className="fixed inset-0 z-[999] flex flex-col bg-black">
          <div className="flex items-center justify-between px-4 py-3 bg-indigo-900/90 backdrop-blur-md">
            <span className="text-white text-sm font-medium">Spotify</span>
            <button onClick={() => setWebViewUrl(null)} className="p-1.5 rounded-lg bg-white/10 text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <iframe src={webViewUrl} className="flex-1 w-full border-none" title="Spotify" allow="autoplay" />
        </div>
      )}

      <div className="p-4 space-y-5 pb-8">
        {/* Header */}
        <header className="flex items-center gap-3 py-3">
          <button onClick={() => navigate("/")} className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/60 dark:bg-white/5 border border-indigo-100 dark:border-indigo-800">
            <ArrowLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
          </button>
          <div>
            <h1 className="font-bold text-lg text-foreground flex items-center gap-2">
              <Headphones className="w-5 h-5 text-indigo-500" />
              Islamic Podcasts
            </h1>
            <p className="text-xs text-muted-foreground">Powered by Spotify</p>
          </div>
        </header>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-indigo-100 dark:border-indigo-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Spotify embed player */}
        {embedPodcast && (
          <div className="rounded-2xl overflow-hidden border border-indigo-100 dark:border-indigo-800 shadow-sm bg-black">
            <iframe
              src={`https://open.spotify.com/embed/show/${embedPodcast.embedId}?utm_source=generator&theme=0`}
              width="100%"
              height="232"
              style={{ border: "none" }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={embedPodcast.name}
            />
          </div>
        )}

        {/* Podcast list */}
        <div className="space-y-3">
          {filtered.map((podcast, i) => (
            <div key={i} className={`rounded-2xl border overflow-hidden transition-all ${
              embedPodcast?.name === podcast.name
                ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                : "border-indigo-100 dark:border-indigo-800 bg-white/60 dark:bg-white/5"
            }`}>
              <div className="flex items-center gap-3 p-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${podcast.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{podcast.name}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{podcast.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-full">{podcast.category}</span>
                    <span className="text-[9px] text-muted-foreground">{podcast.episodes}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => handlePlay(podcast)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                      embedPodcast?.name === podcast.name
                        ? "bg-indigo-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    <Play className="w-3 h-3 fill-white" />
                    {embedPodcast?.name === podcast.name ? "Hide" : "Play"}
                  </button>
                  <button
                    onClick={() => window.open(podcast.spotifyUrl, "_blank")}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-[10px] font-bold"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => window.open("https://open.spotify.com/search/Islamic%20podcasts/podcasts", "_blank")}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-semibold"
        >
          <ExternalLink className="w-4 h-4" />
          Explore more on Spotify
        </button>
      </div>
    </MobileLayout>
  );
};

export default Podcasts;
