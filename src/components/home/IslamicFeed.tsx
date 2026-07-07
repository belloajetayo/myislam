import React, { useEffect, useState, useRef, useCallback } from "react";
import { RefreshCw, Newspaper, Heart, Share2, BookmarkPlus, MessageCircle, Sparkles, ExternalLink, BookOpen, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const LOGO_URL = "/__l5e/assets-v1/4e726eb6-b18f-4122-bd0f-db8e93e45e65/myislam-logo.png";

interface Comment {
  author: string;
  text: string;
}

interface Article {
  title: string;
  link: string;
  source: string;
  image: string | null;
  excerpt: string;
  pubDate: string;
  comments?: Comment[];
  eventContext?: string | null;
  kind?: "article" | "wisdom";
  wisdomKind?: "hadith" | "verse";
  arabic?: string;
  narrator?: string;
}

interface IslamicFeedProps {
  onArticleClick?: (url: string) => void;
}

const CACHE_KEY = "myislam_articles_cache_v3";
const CACHE_TTL = 1000 * 60 * 60 * 3;

const HADITHS = [
  { text: "The best among you are those who have the best manners and character.", source: "Sahih Al-Bukhari", narrator: "The Prophet ﷺ said" },
  { text: "None of you truly believes until he loves for his brother what he loves for himself.", source: "Sahih Al-Bukhari & Muslim", narrator: "The Prophet ﷺ said" },
  { text: "The strong man is not the one who overcomes others by force, but the one who controls himself while in anger.", source: "Sahih Al-Bukhari", narrator: "The Prophet ﷺ said" },
  { text: "Smiling at your brother is an act of charity.", source: "At-Tirmidhi", narrator: "The Prophet ﷺ said" },
  { text: "Take benefit of five before five: your youth, health, wealth, free time, and life.", source: "Mustadrak Al-Hakim", narrator: "The Prophet ﷺ said" },
];

const VERSES = [
  { text: "Indeed, with hardship will be ease.", source: "Surah Ash-Sharh 94:6", arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا" },
  { text: "And He is with you wherever you are.", source: "Surah Al-Hadid 57:4", arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ" },
  { text: "So remember Me; I will remember you.", source: "Surah Al-Baqarah 2:152", arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ" },
  { text: "Verily, Allah is with the patient.", source: "Surah Al-Baqarah 2:153", arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ" },
];

const WISDOM_BG = [
  "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&q=80",
  "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=800&q=80",
  "https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=800&q=80",
  "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80",
];

const doy = () => {
  const d = new Date();
  return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
};

function buildWisdom(offset = 0): Article[] {
  const d = doy() + offset;
  const h = HADITHS[d % HADITHS.length];
  const v = VERSES[d % VERSES.length];
  return [
    {
      kind: "wisdom", wisdomKind: "hadith",
      title: h.text, link: "#hadith-" + d, source: "Hadith of the Day",
      image: WISDOM_BG[d % WISDOM_BG.length], excerpt: h.source,
      pubDate: new Date().toISOString(), narrator: h.narrator, comments: [],
    },
    {
      kind: "wisdom", wisdomKind: "verse",
      title: v.text, link: "#verse-" + d, source: "Verse of the Day",
      image: WISDOM_BG[(d + 2) % WISDOM_BG.length], excerpt: v.source,
      pubDate: new Date().toISOString(), arabic: v.arabic, comments: [],
    },
  ];
}

const timeAgo = (dateStr: string) => {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch { return ""; }
};

const IslamicFeed: React.FC<IslamicFeedProps> = ({ onArticleClick }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [eventContext, setEventContext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const wisdomInsert = useRef(0);

  const load = async (force = false) => {
    setLoading(true);
    try {
      if (!force) {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const { ts, data, event } = JSON.parse(raw);
          if (Date.now() - ts < CACHE_TTL && data?.length) {
            setArticles(data);
            setEventContext(event ?? null);
            setLoading(false);
            return;
          }
        }
      }
      const { data, error } = await supabase.functions.invoke("fetch-islamic-articles");
      if (error) throw error;
      const list: Article[] = data?.articles ?? [];
      const evt: string | null = data?.event ?? null;
      // Interleave wisdom cards into the first page
      const wisdom = buildWisdom(0);
      const merged: Article[] = [];
      list.forEach((a, i) => {
        merged.push(a);
        if (i === 1 && wisdom[0]) merged.push(wisdom[0]);
        if (i === 3 && wisdom[1]) merged.push(wisdom[1]);
      });
      wisdomInsert.current = 1;
      setArticles(merged);
      setEventContext(evt);
      setHasMore(data?.hasMore !== false);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: merged, event: evt }));
    } catch (e) {
      console.error("Failed to load articles", e);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || !hasMore) return;
    setLoadingMore(true);
    try {
      const exclude = articles.filter(a => a.kind !== "wisdom").map(a => a.link);
      const { data, error } = await supabase.functions.invoke("fetch-islamic-articles", {
        body: { exclude, limit: 6 },
      });
      if (error) throw error;
      const more: Article[] = data?.articles ?? [];
      const wisdom = buildWisdom(wisdomInsert.current * 2);
      wisdomInsert.current += 1;
      const merged: Article[] = [];
      more.forEach((a, i) => {
        merged.push(a);
        if (i === 2 && wisdom[0]) merged.push(wisdom[0]);
      });
      if (more.length < 3 && wisdom[1]) merged.push(wisdom[1]);
      setArticles(prev => [...prev, ...merged]);
      setHasMore(data?.hasMore !== false && more.length > 0);
    } catch (e) {
      console.error("Failed to load more", e);
    } finally {
      setLoadingMore(false);
    }
  }, [articles, hasMore, loading, loadingMore]);

  useEffect(() => { load(); }, []);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: "400px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  const handleShare = async (a: Article) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: a.title, url: a.link.startsWith("#") ? window.location.href : a.link });
      }
    } catch { /* ignore */ }
  };

  if (loading && articles.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-foreground">Daily Discover</h3>
          </div>
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl bg-muted animate-pulse h-80" />
        ))}
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-semibold text-foreground">Daily Discover</h3>
        </div>
        <button onClick={() => load(true)} className="text-muted-foreground hover:text-foreground p-1" aria-label="Refresh">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {eventContext && (
        <div className="mb-4 rounded-2xl bg-gradient-to-r from-amber-100 via-amber-50 to-orange-50 dark:from-amber-900/30 dark:via-amber-900/20 dark:to-orange-900/20 border border-amber-200/60 dark:border-amber-700/40 p-3 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Coming up in the Islamic calendar</p>
            <p className="text-[12px] font-medium text-amber-900 dark:text-amber-100 leading-snug">{eventContext}</p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {articles.map((a, i) => {
          const key = a.link + i;
          const commentCount = a.comments?.length ?? 0;
          const isOpen = !!openComments[key];
          const isWisdom = a.kind === "wisdom";
          const badge = isWisdom
            ? (a.wisdomKind === "hadith" ? "Hadith" : "Verse")
            : (a.eventContext ? "Timely" : "Q&A");
          const badgeColor = isWisdom
            ? "text-amber-600 bg-amber-50 dark:bg-amber-900/30"
            : "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30";
          const AvatarIcon = isWisdom ? (a.wisdomKind === "verse" ? BookOpen : Sparkles) : null;

          return (
            <div key={key} className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm animate-fade-in">
              {/* Header */}
              <div className="flex items-center gap-3 px-3 py-2.5">
                <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center ring-2 ring-offset-1 ${isWisdom ? "bg-amber-100 ring-amber-400" : "bg-indigo-100 ring-indigo-400"}`}>
                  {isWisdom && AvatarIcon
                    ? <AvatarIcon className="w-4 h-4 text-amber-600" />
                    : <img src={LOGO_URL} alt="MyIslam" className="w-6 h-6 object-contain" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-gray-900 dark:text-white">{a.source}</p>
                  <p className="text-[10px] text-gray-400">{timeAgo(a.pubDate)}</p>
                </div>
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
              </div>

              {/* Image / wisdom hero */}
              <button
                onClick={() => !isWisdom && onArticleClick?.(a.link)}
                className="w-full block active:opacity-90 transition-opacity relative"
                disabled={isWisdom}
              >
                {a.image ? (
                  <div className="relative">
                    <img
                      src={a.image}
                      alt={a.title}
                      loading="lazy"
                      className="w-full object-cover"
                      style={{ maxHeight: "280px", minHeight: isWisdom ? "220px" : "180px" }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                    {isWisdom && (
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black/85 flex flex-col justify-end p-4">
                        {a.wisdomKind === "hadith" && a.narrator && (
                          <p className="text-white/70 text-[10px] italic mb-1">{a.narrator}:</p>
                        )}
                        {a.wisdomKind === "verse" && a.arabic && (
                          <p className="text-white/90 text-base text-right mb-2 leading-relaxed" style={{ fontFamily: "'Amiri', serif" }}>
                            {a.arabic}
                          </p>
                        )}
                        <p className="text-white text-[13px] leading-relaxed font-medium">"{a.title}"</p>
                        <p className="text-amber-300 text-[10px] italic mt-1">[{a.excerpt}]</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-sky-100 flex items-center justify-center">
                    <Newspaper className="w-12 h-12 text-indigo-300" />
                  </div>
                )}
              </button>

              {/* Actions */}
              <div className="flex items-center gap-1 px-3 pt-2 pb-1">
                <button
                  onClick={() => setLiked(l => ({ ...l, [key]: !l[key] }))}
                  className={`p-2 rounded-full transition-all active:scale-90 ${liked[key] ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
                >
                  <Heart className={`w-5 h-5 ${liked[key] ? "fill-red-500" : ""}`} />
                </button>
                {!isWisdom && (
                  <button
                    onClick={() => setOpenComments(o => ({ ...o, [key]: !o[key] }))}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 transition-all active:scale-90 relative"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {commentCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 text-[9px] font-bold text-white bg-indigo-500 rounded-full w-4 h-4 flex items-center justify-center">
                        {commentCount}
                      </span>
                    )}
                  </button>
                )}
                <button
                  onClick={() => handleShare(a)}
                  className="p-2 rounded-full text-gray-500 dark:text-gray-400 transition-all active:scale-90"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => setSaved(s => ({ ...s, [key]: !s[key] }))}
                  className={`p-2 rounded-full transition-all active:scale-90 ${saved[key] ? "text-indigo-500" : "text-gray-500 dark:text-gray-400"}`}
                >
                  <BookmarkPlus className={`w-5 h-5 ${saved[key] ? "fill-indigo-500" : ""}`} />
                </button>
              </div>

              {/* Caption */}
              {!isWisdom && (
                <div className="px-3 pb-3">
                  <p className="text-[12px] font-semibold text-gray-900 dark:text-white mb-0.5">{a.source}</p>
                  <p className="text-[12px] text-gray-800 dark:text-gray-200 line-clamp-2 leading-relaxed font-medium">{a.title}</p>
                  {a.excerpt && (
                    <p className="text-[11.5px] text-gray-600 dark:text-gray-400 mt-1 line-clamp-3 leading-relaxed">{a.excerpt}</p>
                  )}
                  <button
                    onClick={() => onArticleClick?.(a.link)}
                    className="text-[11px] text-indigo-500 mt-1 font-medium inline-flex items-center gap-1"
                  >
                    Read full answer <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Comments */}
              {isOpen && commentCount > 0 && (
                <div className="border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] px-3 py-3 space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    From this answer · {commentCount}
                  </p>
                  {a.comments!.map((c, ci) => (
                    <div key={ci} className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-[10px] font-bold shrink-0">IQ</div>
                      <div className="flex-1 min-w-0 bg-white dark:bg-white/5 rounded-2xl px-3 py-2 border border-gray-100 dark:border-white/10">
                        <p className="text-[10.5px] font-semibold text-gray-900 dark:text-white">{c.author}</p>
                        <p className="text-[11.5px] text-gray-700 dark:text-gray-300 leading-relaxed mt-0.5">{c.text}</p>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => onArticleClick?.(a.link)}
                    className="w-full text-[11px] text-indigo-500 font-medium text-center py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20"
                  >
                    See full answer on IslamQA
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Infinite-scroll sentinel + lazy loader */}
      <div ref={sentinelRef} className="mt-6 flex flex-col items-center justify-center py-6">
        {loadingMore && (
          <>
            <div className="flex items-center gap-2 text-indigo-500 animate-fade-in">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-medium">Loading more posts…</span>
            </div>
            <div className="mt-4 w-full space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-2xl bg-muted animate-pulse h-40" />
              ))}
            </div>
          </>
        )}
        {!hasMore && !loadingMore && articles.length > 0 && (
          <p className="text-[11px] text-muted-foreground">You're all caught up ✨</p>
        )}
      </div>
    </div>
  );
};

export default IslamicFeed;
