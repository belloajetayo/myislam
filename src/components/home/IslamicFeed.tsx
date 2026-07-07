import React, { useEffect, useState } from "react";
import { RefreshCw, Newspaper, Heart, Share2, BookmarkPlus, MessageCircle, Sparkles, ExternalLink } from "lucide-react";
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
}

interface IslamicFeedProps {
  onArticleClick?: (url: string) => void;
}

const CACHE_KEY = "myislam_articles_cache_v2";
const CACHE_TTL = 1000 * 60 * 60 * 3;

const timeAgo = (dateStr: string) => {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch {
    return "";
  }
};

const IslamicFeed: React.FC<IslamicFeedProps> = ({ onArticleClick }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [eventContext, setEventContext] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [openComments, setOpenComments] = useState<Record<number, boolean>>({});

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
      setArticles(list);
      setEventContext(evt);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: list, event: evt }));
    } catch (e) {
      console.error("Failed to load articles", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleShare = async (a: Article) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: a.title, url: a.link });
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
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-semibold text-foreground">Daily Discover</h3>
        </div>
        <button onClick={() => load(true)} className="text-muted-foreground hover:text-foreground p-1" aria-label="Refresh">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Event banner */}
      {eventContext && (
        <div className="mb-4 rounded-2xl bg-gradient-to-r from-amber-100 via-amber-50 to-orange-50 dark:from-amber-900/30 dark:via-amber-900/20 dark:to-orange-900/20 border border-amber-200/60 dark:border-amber-700/40 p-3 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Coming up in the Islamic calendar</p>
            <p className="text-[12px] font-medium text-amber-900 dark:text-amber-100 leading-snug">{eventContext}</p>
          </div>
        </div>
      )}

      {/* Vertical feed */}
      <div className="space-y-5">
        {articles.map((a, i) => {
          const commentCount = a.comments?.length ?? 0;
          const isOpen = !!openComments[i];
          return (
            <div key={i} className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-sm">
              {/* Post header */}
              <div className="flex items-center gap-3 px-3 py-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center ring-2 ring-indigo-400 ring-offset-1">
                  <img src={LOGO_URL} alt="MyIslam" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-gray-900 dark:text-white">{a.source}</p>
                  <p className="text-[10px] text-gray-400">{timeAgo(a.pubDate)}</p>
                </div>
                <span className="text-[9px] font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
                  {a.eventContext ? "Timely" : "Q&A"}
                </span>
              </div>

              {/* Image */}
              <button
                onClick={() => onArticleClick?.(a.link)}
                className="w-full block active:opacity-90 transition-opacity"
              >
                {a.image ? (
                  <img
                    src={a.image}
                    alt={a.title}
                    loading="lazy"
                    className="w-full object-cover"
                    style={{ maxHeight: "280px", minHeight: "180px" }}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-sky-100 dark:from-indigo-900/30 dark:to-sky-900/30 flex items-center justify-center">
                    <Newspaper className="w-12 h-12 text-indigo-300" />
                  </div>
                )}
              </button>

              {/* Actions */}
              <div className="flex items-center gap-1 px-3 pt-2 pb-1">
                <button
                  onClick={() => setLiked(l => ({ ...l, [i]: !l[i] }))}
                  className={`p-2 rounded-full transition-all active:scale-90 ${liked[i] ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
                >
                  <Heart className={`w-5 h-5 ${liked[i] ? "fill-red-500" : ""}`} />
                </button>
                <button
                  onClick={() => setOpenComments(o => ({ ...o, [i]: !o[i] }))}
                  className="p-2 rounded-full text-gray-500 dark:text-gray-400 transition-all active:scale-90 relative"
                >
                  <MessageCircle className="w-5 h-5" />
                  {commentCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 text-[9px] font-bold text-white bg-indigo-500 rounded-full w-4 h-4 flex items-center justify-center">
                      {commentCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleShare(a)}
                  className="p-2 rounded-full text-gray-500 dark:text-gray-400 transition-all active:scale-90"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => setSaved(s => ({ ...s, [i]: !s[i] }))}
                  className={`p-2 rounded-full transition-all active:scale-90 ${saved[i] ? "text-indigo-500" : "text-gray-500 dark:text-gray-400"}`}
                >
                  <BookmarkPlus className={`w-5 h-5 ${saved[i] ? "fill-indigo-500" : ""}`} />
                </button>
              </div>

              {/* Caption */}
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

              {/* Comments section — excerpts from this IslamQA post */}
              {isOpen && commentCount > 0 && (
                <div className="border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] px-3 py-3 space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    From this answer · {commentCount}
                  </p>
                  {a.comments!.map((c, ci) => (
                    <div key={ci} className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-[10px] font-bold shrink-0">
                        IQ
                      </div>
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
    </div>
  );
};

export default IslamicFeed;
