import React, { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Headphones, ExternalLink, Play, Music } from "lucide-react";

const PODCASTS = [
  {
    name: "Yaqeen Institute",
    description: "Research-based Islamic content for the 21st century Muslim",
    category: "Knowledge",
    color: "from-emerald-500 to-teal-600",
    spotifyUrl: "https://open.spotify.com/show/0vC9BE1GIiTOenomDKjRZZ",
    applePodcastUrl: "https://podcasts.apple.com/podcast/yaqeen-institute/id1439444469",
    episodes: "200+ episodes",
  },
  {
    name: "Mufti Menk Podcast",
    description: "Daily reminders and Islamic guidance from Mufti Ismail Menk",
    category: "Reminders",
    color: "from-amber-500 to-orange-600",
    spotifyUrl: "https://open.spotify.com/show/4OkMVUfBqSIxHrqtjOJXX9",
    applePodcastUrl: "https://podcasts.apple.com/podcast/mufti-menk/id1440929509",
    episodes: "500+ episodes",
  },
  {
    name: "The Muslim Life Podcast",
    description: "Real conversations about living as a Muslim today",
    category: "Lifestyle",
    color: "from-indigo-500 to-blue-600",
    spotifyUrl: "https://open.spotify.com/show/2mPHjNzHHs7MQeI7XWHKL9",
    applePodcastUrl: "https://podcasts.apple.com",
    episodes: "100+ episodes",
  },
  {
    name: "The Deen Show",
    description: "Conversations about Islam with Eddie from The Deen Show",
    category: "Dawah",
    color: "from-rose-500 to-pink-600",
    spotifyUrl: "https://open.spotify.com/show/2hmkzUtix0qTqvZGDA7UMn",
    applePodcastUrl: "https://podcasts.apple.com",
    episodes: "300+ episodes",
  },
  {
    name: "Quran Weekly",
    description: "Weekly Quran reflections and tafseer by scholars",
    category: "Quran",
    color: "from-purple-500 to-violet-600",
    spotifyUrl: "https://open.spotify.com/show/5VzFvh1JlEhBMS6ZHZ8CNO",
    applePodcastUrl: "https://podcasts.apple.com",
    episodes: "150+ episodes",
  },
  {
    name: "Productive Muslim",
    description: "Islamic productivity and personal development",
    category: "Lifestyle",
    color: "from-cyan-500 to-sky-600",
    spotifyUrl: "https://open.spotify.com/show/productivemuslim",
    applePodcastUrl: "https://podcasts.apple.com",
    episodes: "80+ episodes",
  },
];

const CATEGORIES = ["All", "Knowledge", "Lifestyle", "Reminders", "Dawah", "Quran"];

const Podcasts: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");

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
            <p className="text-xs text-muted-foreground">Curated Islamic audio content</p>
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

        {/* Featured banner */}
        <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Music className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Featured</span>
          </div>
          <p className="font-bold text-base">Listen to Islamic Podcasts</p>
          <p className="text-xs opacity-75 mt-0.5">Opens directly in Spotify or Apple Podcasts</p>
        </div>

        {/* Podcast list */}
        <div className="space-y-3">
          {filtered.map((podcast, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-800 bg-white/60 dark:bg-white/5 backdrop-blur-sm"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${podcast.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                <Headphones className="w-7 h-7 text-white" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{podcast.name}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{podcast.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-full">{podcast.category}</span>
                  <span className="text-[9px] text-muted-foreground">{podcast.episodes}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => window.open(podcast.spotifyUrl, "_blank")}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500 text-white text-[10px] font-semibold"
                >
                  <Play className="w-3 h-3 fill-white" />
                  Spotify
                </button>
                <button
                  onClick={() => window.open(podcast.applePodcastUrl, "_blank")}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500 text-white text-[10px] font-semibold"
                >
                  <Headphones className="w-3 h-3" />
                  Apple
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Search more */}
        <button
          onClick={() => window.open("https://open.spotify.com/search/Islamic%20podcasts/podcasts", "_blank")}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-semibold"
        >
          <ExternalLink className="w-4 h-4" />
          Search more Islamic podcasts on Spotify
        </button>
      </div>
    </MobileLayout>
  );
};

export default Podcasts;
