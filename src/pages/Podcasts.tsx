import React, { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Headphones, ExternalLink } from "lucide-react";

const PODCASTS = [
  {
    name: "Yaqeen Institute",
    description: "Research-based Islamic content for the 21st century Muslim",
    category: "Knowledge",
    color: "from-emerald-500 to-teal-600",
    spotifyId: "0vC9BE1GIiTOenomDKjRZZ",
    type: "show",
  },
  {
    name: "The Muslim Life Podcast",
    description: "Real conversations about living as a Muslim today",
    category: "Lifestyle",
    color: "from-indigo-500 to-blue-600",
    spotifyId: "2mPHjNzHHs7MQeI7XWHKL9",
    type: "show",
  },
  {
    name: "Mufti Menk Podcast",
    description: "Daily reminders and Islamic guidance from Mufti Ismail Menk",
    category: "Reminders",
    color: "from-amber-500 to-orange-600",
    spotifyId: "4OkMVUfBqSIxHrqtjOJXX9",
    type: "show",
  },
  {
    name: "The Deen Show",
    description: "Conversations about Islam and life with Eddie from The Deen Show",
    category: "Dawah",
    color: "from-rose-500 to-pink-600",
    spotifyId: "2hmkzUtix0qTqvZGDA7UMn",
    type: "show",
  },
  {
    name: "Quran Weekly",
    description: "Weekly Quran reflections and tafseer",
    category: "Quran",
    color: "from-purple-500 to-violet-600",
    spotifyId: "5VzFvh1JlEhBMS6ZHZ8CNO",
    type: "show",
  },
  {
    name: "Seeking Ilm",
    description: "Islamic knowledge and scholarship made accessible",
    category: "Knowledge",
    color: "from-cyan-500 to-sky-600",
    spotifyId: "1234567890",
    type: "show",
  },
];

const CATEGORIES = ["All", "Knowledge", "Lifestyle", "Reminders", "Dawah", "Quran"];

const Podcasts: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activePodcast, setActivePodcast] = useState<typeof PODCASTS[0] | null>(null);

  const filtered = activeCategory === "All"
    ? PODCASTS
    : PODCASTS.filter(p => p.category === activeCategory);

  return (
    <MobileLayout>
      <div className="p-4 space-y-5 pb-8">
        {/* Header */}
        <header className="flex items-center gap-3 py-3">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/60 dark:bg-white/5 border border-indigo-100 dark:border-indigo-800 backdrop-blur-md"
          >
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
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
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

        {/* Spotify Player */}
        {activePodcast && (
          <div className="rounded-2xl overflow-hidden border border-indigo-100 dark:border-indigo-800 shadow-sm">
            <iframe
              src={`https://open.spotify.com/embed/${activePodcast.type}/${activePodcast.spotifyId}?utm_source=generator&theme=0`}
              width="100%"
              height="232"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={activePodcast.name}
            />
          </div>
        )}

        {/* Podcast list */}
        <div className="space-y-3">
          {filtered.map((podcast, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${
                activePodcast?.name === podcast.name
                  ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                  : "border-indigo-100 dark:border-indigo-800 bg-white/60 dark:bg-white/5"
              }`}
              onClick={() => setActivePodcast(
                activePodcast?.name === podcast.name ? null : podcast
              )}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${podcast.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <Headphones className="w-6 h-6 text-white" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{podcast.name}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{podcast.description}</p>
                <span className="text-[9px] font-semibold text-indigo-400 uppercase tracking-wider">{podcast.category}</span>
              </div>

              {/* Play button */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                activePodcast?.name === podcast.name
                  ? "bg-indigo-500 text-white"
                  : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500"
              }`}>
                <Play className="w-4 h-4 fill-current" />
              </div>
            </div>
          ))}
        </div>

        {/* Open Spotify */}
        <button
          onClick={() => window.open("https://open.spotify.com/search/Islamic%20podcasts", "_blank")}
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
