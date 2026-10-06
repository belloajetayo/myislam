import React, { useState, useMemo } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Heart,
  ChevronRight,
  Copy,
  Share2,
  X,
  Sparkles,
  BookOpen,
  Check,
  CheckCircle2,
  Bookmark,
} from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { toast } from "sonner";
import { DUA_CATEGORIES, ALL_DUAS_DATA, type DuaItem } from "@/data/duasData";

// ─── Single Dua Card Component ────────────────────────────────────────────────
interface DuaCardProps {
  dua: DuaItem;
  index: number;
  onFavorite: () => void;
  isFav: boolean;
  onRecited: () => void;
}

const DuaCard: React.FC<DuaCardProps> = ({ dua, index, onFavorite, isFav, onRecited }) => {
  const target = dua.times || 1;
  const [count, setCount] = useState(0);

  const incrementCount = () => {
    if (count < target) {
      const next = count + 1;
      setCount(next);
      if (next === target) {
        onRecited();
        toast.success("Completed! May Allah accept your supplication 🤲");
      }
    }
  };

  const handleCopy = () => {
    const text = `${dua.arabic}\n\n${dua.transliteration}\n\n"${dua.translation}"\n\nBenefit: ${dua.benefit}\nSource: ${dua.source}`;
    navigator.clipboard.writeText(text);
    toast.success("Dua copied to clipboard!");
  };

  const handleShare = async () => {
    const shareText = `${dua.arabic}\n\n${dua.transliteration}\n\n"${dua.translation}"\n\nBenefit: ${dua.benefit}\nSource: ${dua.source}\n\nShared via MyIslam App`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Supplication from MyIslam",
          text: shareText,
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Dua copied to clipboard!");
    }
  };

  return (
    <div className="rounded-3xl border border-indigo-100 dark:border-indigo-800/80 bg-white/80 dark:bg-white/5 shadow-sm p-4 space-y-3.5 transition-all hover:border-indigo-200">
      {/* Top Header Badge Row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-[11px]">
            #{index}
          </span>
          {dua.context && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50/70 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
              {dua.context}
            </span>
          )}
        </div>
        {target > 1 && (
          <span className="font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px]">
            Recite {target}x
          </span>
        )}
      </div>

      {/* Arabic Script */}
      <div className="text-right py-1">
        <p
          className="text-2xl leading-[2.2] font-semibold text-foreground select-text"
          style={{ fontFamily: "'Amiri', 'Traditional Arabic', 'Scheherazade New', serif" }}
          dir="rtl"
        >
          {dua.arabic}
        </p>
      </div>

      {/* Transliteration */}
      <div className="p-2.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100/60 dark:border-indigo-900/40">
        <p className="text-xs text-indigo-950 dark:text-indigo-200 italic leading-relaxed">
          {dua.transliteration}
        </p>
      </div>

      {/* English Translation */}
      <div>
        <p className="text-xs text-foreground/90 font-medium leading-relaxed">
          "{dua.translation}"
        </p>
      </div>

      {/* Highlighted Virtue & Benefit Section */}
      {dua.benefit && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-amber-100/40 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-transparent border border-amber-200/80 dark:border-amber-800/60 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
            <p className="text-[10px] font-bold text-amber-900 dark:text-amber-400 uppercase tracking-wider">
              Virtue & Spiritual Benefit
            </p>
          </div>
          <p className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed font-medium">
            {dua.benefit}
          </p>
        </div>
      )}

      {/* Source Citation */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{dua.source}</span>
      </div>

      {/* Counter + Actions Row */}
      <div className="flex items-center justify-between pt-2.5 border-t border-indigo-50 dark:border-indigo-900/50">
        <button
          onClick={incrementCount}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
            count === target && target > 0
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100"
          }`}
        >
          {count === target && target > 0 ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Completed
            </>
          ) : (
            <span>Recite {count}/{target}</span>
          )}
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            title="Copy Dua"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            title="Share Dua"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={onFavorite}
            className={`p-2 rounded-xl transition-colors ${
              isFav ? "text-red-500" : "text-muted-foreground hover:text-red-400"
            }`}
            title={isFav ? "Remove from Favorites" : "Save to Favorites"}
          >
            <Heart className={`w-4 h-4 ${isFav ? "fill-red-500" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Duas Component ──────────────────────────────────────────────────────
const Duas: React.FC = () => {
  const navigate = useNavigate();
  const { addDua } = useProgress();
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string | null>(searchParams.get("category"));
  const [search, setSearch] = useState("");

  const [favorites, setFavorites] = useState<DuaItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("myislam_fav_duas") || "[]");
    } catch {
      return [];
    }
  });

  const handleBack = () => {
    if (activeCategory) {
      setActiveCategory(null);
      setSearch("");
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const saveFavorites = (favs: DuaItem[]) => {
    setFavorites(favs);
    localStorage.setItem("myislam_fav_duas", JSON.stringify(favs));
  };

  const toggleFav = (dua: DuaItem) => {
    const exists = favorites.some((f) => f.arabic === dua.arabic);
    if (exists) {
      saveFavorites(favorites.filter((f) => f.arabic !== dua.arabic));
      toast.info("Removed from favorites");
    } else {
      saveFavorites([...favorites, dua]);
      addDua();
      toast.success("Saved to favorites ❤️");
    }
  };

  const isFav = (dua: DuaItem) => favorites.some((f) => f.arabic === dua.arabic);

  // All Duas flat list for global search
  const allDuasFlat = useMemo(() => {
    const list: DuaItem[] = [];
    Object.values(ALL_DUAS_DATA).forEach((arr) => {
      arr.forEach((d) => {
        if (!list.some((existing) => existing.arabic === d.arabic)) {
          list.push(d);
        }
      });
    });
    return list;
  }, []);

  // Determine current list to display
  const currentDuas = useMemo(() => {
    if (activeCategory === "favorites") {
      return favorites;
    }
    if (activeCategory && ALL_DUAS_DATA[activeCategory]) {
      return ALL_DUAS_DATA[activeCategory];
    }
    // If on main page and searching, search across ALL categories!
    if (search.trim()) {
      return allDuasFlat;
    }
    return [];
  }, [activeCategory, favorites, search, allDuasFlat]);

  // Filter current list with search query
  const filtered = useMemo(() => {
    if (!search.trim()) return currentDuas;
    const q = search.toLowerCase();
    return currentDuas.filter(
      (d) =>
        d.transliteration.toLowerCase().includes(q) ||
        d.translation.toLowerCase().includes(q) ||
        (d.benefit && d.benefit.toLowerCase().includes(q)) ||
        d.source.toLowerCase().includes(q) ||
        (d.context && d.context.toLowerCase().includes(q)) ||
        d.arabic.includes(search)
    );
  }, [currentDuas, search]);

  const currentCat = DUA_CATEGORIES.find((c) => c.id === activeCategory);

  // Total count across all categories
  const totalDuasCount = useMemo(() => {
    return Object.values(ALL_DUAS_DATA).reduce((acc, curr) => acc + curr.length, 0);
  }, []);

  // ─── 1. Category Detail View (or Global Search Results View) ───────────────
  if (activeCategory || (search.trim() && !activeCategory)) {
    return (
      <MobileLayout>
        <div className="p-4 space-y-4 pb-16 max-w-lg mx-auto">
          {/* Header */}
          <header className="flex items-center gap-3 py-2">
            <button
              onClick={() => {
                setActiveCategory(null);
                setSearch("");
              }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/80 dark:bg-white/10 border border-indigo-100 dark:border-indigo-800 shadow-sm active:scale-95 transition-all"
              aria-label="Back to categories"
            >
              <ArrowLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg text-foreground flex items-center gap-2 truncate">
                <span>{currentCat ? currentCat.icon : "🔍"}</span>
                <span className="truncate">{currentCat ? currentCat.name : `Results for "${search}"`}</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "supplication" : "supplications"} with spiritual benefits
              </p>
            </div>
          </header>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword, benefit, topic..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-indigo-100 dark:border-indigo-800 bg-white/80 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Duas Cards List */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-5xl">🤲</p>
              <p className="text-sm font-semibold text-foreground">
                {activeCategory === "favorites"
                  ? "No favorites saved yet"
                  : "No supplications matched your search"}
              </p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {activeCategory === "favorites"
                  ? "Tap ❤️ on any supplication to save it here for instant daily recitation."
                  : "Try searching with broader terms like 'anxiety', 'exam', 'sleep', 'rabbana', or 'mercy'."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((dua, i) => (
                <DuaCard
                  key={dua.id || dua.arabic || i}
                  dua={dua}
                  index={i + 1}
                  onFavorite={() => toggleFav(dua)}
                  isFav={isFav(dua)}
                  onRecited={() => addDua(1)}
                />
              ))}
            </div>
          )}
        </div>
      </MobileLayout>
    );
  }

  // ─── 2. Categories Overview Screen (Home of Duas) ──────────────────────────
  return (
    <MobileLayout>
      <div className="p-4 space-y-5 pb-16 max-w-lg mx-auto">
        {/* Header */}
        <header className="flex items-center gap-3 py-2">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/80 dark:bg-white/10 border border-indigo-100 dark:border-indigo-800 shadow-sm active:scale-95 transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
          </button>
          <div>
            <h1 className="font-bold text-2xl text-foreground" style={{ fontFamily: "Georgia, serif" }}>
              Dua & Adhkar
            </h1>
            <p className="text-xs text-muted-foreground">
              Complete authentic supplications with spiritual benefits
            </p>
          </div>
        </header>

        {/* Global Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all duas (e.g. anxiety, exam, parents, rabbana)..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl border border-indigo-100 dark:border-indigo-800 bg-white/80 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 🌟 FEATURED HERO CARD: 40 RABBANA DUAS 🌟 */}
        <button
          onClick={() => setActiveCategory("rabbana")}
          className="w-full text-left p-4 rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl border border-purple-500/30 relative overflow-hidden active:scale-[0.98] transition-all group"
        >
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="space-y-1 flex-1">
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
                <Sparkles className="w-3 h-3" /> Special Collection
              </span>
              <h2 className="text-lg font-bold text-white mt-1">The 40 Rabbana Duas</h2>
              <p className="text-xs text-purple-200/90 leading-relaxed">
                All 40 profound supplications from the Holy Quran that begin with "Rabbana" (Our Lord).
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0 border border-white/20 group-hover:scale-105 transition-transform">
              📖
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-purple-200">
            <span className="font-semibold">Complete 40 Duas with Benefits</span>
            <span className="flex items-center gap-1 font-bold text-white group-hover:translate-x-1 transition-transform">
              Explore Collection <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </button>

        {/* Favorites Quick Banner */}
        {favorites.length > 0 && (
          <button
            onClick={() => setActiveCategory("favorites")}
            className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20 border border-rose-200 dark:border-rose-800/60 shadow-sm active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-xl shadow-sm text-white">
              ❤️
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-foreground">My Favorites</p>
              <p className="text-xs text-muted-foreground">{favorites.length} saved supplications for daily practice</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        {/* Categories Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Explore by Category
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {DUA_CATEGORIES.filter((c) => c.id !== "favorites").map((cat) => {
              const count = ALL_DUAS_DATA[cat.id]?.length || 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="flex flex-col items-center gap-2 p-3 bg-white/80 dark:bg-white/5 rounded-3xl border border-indigo-100 dark:border-indigo-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm active:scale-95 transition-all group"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform`}
                  >
                    {cat.icon}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-foreground leading-tight">{cat.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{count} duas</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Summary Card */}
        <div className="grid grid-cols-3 gap-2.5 text-center pt-2">
          <div className="p-3 bg-white/70 dark:bg-white/5 rounded-2xl border border-indigo-100 dark:border-indigo-800">
            <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">15</p>
            <p className="text-[10px] text-muted-foreground font-medium">Categories</p>
          </div>
          <div className="p-3 bg-white/70 dark:bg-white/5 rounded-2xl border border-indigo-100 dark:border-indigo-800">
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {totalDuasCount}+
            </p>
            <p className="text-[10px] text-muted-foreground font-medium">Authentic Duas</p>
          </div>
          <div className="p-3 bg-white/70 dark:bg-white/5 rounded-2xl border border-indigo-100 dark:border-indigo-800">
            <p className="text-lg font-black text-rose-500">{favorites.length}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Saved Duas</p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Duas;
