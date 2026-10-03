import React, { useState } from "react";
import { Play, HelpCircle, Share2, ChevronDown } from "lucide-react";
import type { DiscoverQA, DiscoverVideo } from "@/data/discoverContent";

const share = async (title: string, url?: string, text?: string) => {
  try { if (navigator.share) await navigator.share({ title, url, text }); } catch { /* ignore */ }
};

export const VideoCard: React.FC<{ v: DiscoverVideo }> = ({ v }) => {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="text-[9px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full">Video · {v.duration}</span>
        <span className="text-[10px] text-muted-foreground">{v.topic}</span>
      </div>
      <div className="relative w-full aspect-video bg-black">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&playsinline=1`}
            title={v.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button onClick={() => setPlaying(true)} className="absolute inset-0 group" aria-label={`Play ${v.title}`}>
            <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt={v.title} loading="lazy" className="h-full w-full object-cover" />
            <span className="absolute inset-0 grid place-items-center bg-black/25">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-white/90 shadow-lg transition group-active:scale-90">
                <Play className="h-6 w-6 fill-rose-600 text-rose-600 ml-0.5" />
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="flex items-start gap-2 px-3 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-[12.5px] font-semibold text-foreground leading-snug line-clamp-2">{v.title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{v.channel}</p>
        </div>
        <button onClick={() => share(v.title, `https://youtu.be/${v.id}`)} className="p-2 text-muted-foreground" aria-label="Share">
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export const QACard: React.FC<{ q: DiscoverQA }> = ({ q }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300 px-2 py-0.5 rounded-full">
          <HelpCircle className="h-3 w-3" /> Quick Q&A
        </span>
        <span className="text-[10px] text-muted-foreground">{q.topic}</span>
      </div>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-start justify-between gap-2 text-left">
        <p className="text-[13px] font-semibold text-foreground leading-snug">{q.question}</p>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-2 space-y-1.5 animate-fade-in">
          <p className="text-[12px] text-muted-foreground leading-relaxed">{q.answer}</p>
          {q.reference && <p className="text-[10.5px] font-medium text-primary">{q.reference}</p>}
          <button onClick={() => share(q.question, undefined, `${q.question}\n\n${q.answer}${q.reference ? ` (${q.reference})` : ""}`)} className="text-[11px] text-primary inline-flex items-center gap-1">
            <Share2 className="h-3 w-3" /> Share
          </button>
        </div>
      )}
    </div>
  );
};
