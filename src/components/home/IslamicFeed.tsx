import React, { useEffect, useState } from "react";
import { ExternalLink, RefreshCw, Newspaper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Article {
  title: string;
  link: string;
  source: string;
  image: string | null;
  excerpt: string;
  pubDate: string;
}

const CACHE_KEY = "myislam_articles_cache_v1";
const CACHE_TTL = 1000 * 60 * 60 * 3; // 3 hours

const IslamicFeed: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async (force = false) => {
    setLoading(true);
    try {
      if (!force) {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const { ts, data } = JSON.parse(raw);
          if (Date.now() - ts < CACHE_TTL && data?.length) {
            setArticles(data);
            setLoading(false);
            return;
          }
        }
      }
      const { data, error } = await supabase.functions.invoke(
        "fetch-islamic-articles",
      );
      if (error) throw error;
      const list: Article[] = data?.articles ?? [];
      setArticles(list);
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ ts: Date.now(), data: list }),
      );
    } catch (e) {
      console.error("Failed to load articles", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Daily Discover
          </h3>
        </div>
        <button
          onClick={() => load(true)}
          className="text-muted-foreground hover:text-foreground p-1"
          aria-label="Refresh"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {loading && articles.length === 0 ? (
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="min-w-[220px] h-48 rounded-2xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-sm text-muted-foreground p-6 text-center bg-card rounded-2xl border border-border">
          No articles available right now. Pull to refresh.
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
          {articles.map((a, i) => (
            <a
              key={i}
              href={a.link}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[240px] max-w-[240px] snap-start bg-card rounded-2xl border border-border overflow-hidden hover:shadow-card active:scale-[0.98] transition-all flex flex-col"
            >
              <div className="h-32 w-full bg-muted relative overflow-hidden">
                {a.image ? (
                  <img
                    src={a.image}
                    alt={a.title}
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/15 to-secondary/15">
                    <Newspaper className="w-8 h-8 text-primary/60" />
                  </div>
                )}
                <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur">
                  {a.source}
                </span>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <h4 className="text-[13px] font-semibold text-foreground leading-snug line-clamp-3">
                  {a.title}
                </h4>
                <div className="mt-auto pt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <ExternalLink className="w-3 h-3" />
                  <span>Read article</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default IslamicFeed;
