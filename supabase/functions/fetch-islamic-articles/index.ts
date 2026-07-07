import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
  comments: Comment[];
  eventContext?: string | null;
}

// ---------- Hijri utilities ----------

interface Hijri { day: number; month: number; year: number; monthName: string; }

const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi al-Awwal", "Rabi ath-Thani", "Jumada al-Ula",
  "Jumada ath-Thaniyah", "Rajab", "Sha'ban", "Ramadan", "Shawwal",
  "Dhul-Qadah", "Dhul-Hijjah",
];

function hijriFor(date: Date): Hijri {
  const fmt = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    day: "numeric", month: "numeric", year: "numeric",
  });
  // Output looks like "12/3/1447 AH"
  const parts = fmt.formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0");
  const month = get("month");
  return {
    day: get("day"),
    month,
    year: get("year"),
    monthName: HIJRI_MONTHS[month - 1] ?? "",
  };
}

// ---------- Event detection ----------

interface IslamicEvent {
  name: string;
  description: string;
  keywords: string[];
  inDays: number; // 0=today, 1=tomorrow, 2=day after
}

function detectUpcomingEvent(now: Date): IslamicEvent | null {
  for (let offset = 0; offset <= 2; offset++) {
    const d = new Date(now.getTime() + offset * 86400000);
    const h = hijriFor(d);
    const wd = d.getUTCDay(); // 5 = Friday

    // Ramadan (whole month)
    if (h.month === 9) {
      if (h.day >= 21) {
        return { name: "Laylat al-Qadr window", description: `Last 10 nights of Ramadan (${h.monthName} ${h.day})`, keywords: ["laylat al-qadr", "laylatul qadr", "night of decree", "last ten", "itikaf"], inDays: offset };
      }
      return { name: "Ramadan", description: `Ramadan ${h.day}`, keywords: ["ramadan", "fasting", "sawm", "taraweeh", "suhoor", "iftar"], inDays: offset };
    }

    // Shawwal 1 → Eid al-Fitr
    if (h.month === 10 && h.day === 1) {
      return { name: "Eid al-Fitr", description: "Eid al-Fitr — 1 Shawwal", keywords: ["eid al-fitr", "eid ul fitr", "zakat al-fitr", "eid prayer"], inDays: offset };
    }

    // Dhul-Hijjah events
    if (h.month === 12) {
      if (h.day >= 1 && h.day <= 8) return { name: "First 10 days of Dhul-Hijjah", description: `Best 10 days of the year — Dhul-Hijjah ${h.day}`, keywords: ["dhul hijjah", "first ten days", "hajj", "udhiyah", "qurbani", "takbir"], inDays: offset };
      if (h.day === 9) return { name: "Day of Arafah", description: "Day of Arafah — 9 Dhul-Hijjah", keywords: ["arafah", "arafat", "hajj", "day of arafah", "fasting arafah"], inDays: offset };
      if (h.day === 10) return { name: "Eid al-Adha", description: "Eid al-Adha — 10 Dhul-Hijjah", keywords: ["eid al-adha", "eid ul adha", "udhiyah", "qurbani", "sacrifice"], inDays: offset };
      if (h.day >= 11 && h.day <= 13) return { name: "Days of Tashreeq", description: `Days of Tashreeq — Dhul-Hijjah ${h.day}`, keywords: ["tashreeq", "takbir", "hajj"], inDays: offset };
    }

    // Muharram
    if (h.month === 1 && h.day === 1) return { name: "Islamic New Year", description: "1 Muharram — Hijri New Year", keywords: ["hijri new year", "muharram", "hijrah"], inDays: offset };
    if (h.month === 1 && (h.day === 9 || h.day === 10)) return { name: "Ashura", description: `Ashura — ${h.day} Muharram`, keywords: ["ashura", "fasting ashura", "muharram", "10th muharram"], inDays: offset };

    // Rabi al-Awwal 12 → Mawlid (mentioned neutrally)
    if (h.month === 3 && h.day === 12) return { name: "12 Rabi al-Awwal", description: "12 Rabi al-Awwal — Birth of the Prophet ﷺ (per some views)", keywords: ["prophet muhammad", "seerah", "birth of the prophet", "mawlid"], inDays: offset };

    // Rajab 27 → Isra & Miraj
    if (h.month === 7 && h.day === 27) return { name: "Isra and Miraj", description: "27 Rajab — Night Journey", keywords: ["isra", "miraj", "night journey", "al-aqsa"], inDays: offset };

    // Sha'ban 15
    if (h.month === 8 && h.day === 15) return { name: "15 Sha'ban", description: "Middle of Sha'ban", keywords: ["shaban", "middle of shaban", "night of shaban"], inDays: offset };

    // Sha'ban late → prep for Ramadan
    if (h.month === 8 && h.day >= 25) return { name: "Preparing for Ramadan", description: `Ramadan is near — Sha'ban ${h.day}`, keywords: ["ramadan preparation", "shaban", "fasting"], inDays: offset };

    // Friday (Jumu'ah) — lowest priority, only if today or tomorrow
    if (wd === 5 && offset <= 1) return { name: "Jumu'ah", description: offset === 0 ? "Today is Friday" : "Tomorrow is Friday", keywords: ["jumuah", "friday", "jumah prayer", "surah al-kahf"], inDays: offset };
  }
  return null;
}

// ---------- IslamQA scraping ----------

const UA = "Mozilla/5.0 (compatible; MyIslamApp/1.0)";

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function stripTags(s: string): string {
  return decodeHtml(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

async function fetchText(url: string, timeoutMs = 9000): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": UA, "Accept-Language": "en" } });
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function listIslamQAAnswerLinks(): Promise<string[]> {
  const html = await fetchText("https://islamqa.info/en");
  if (!html) return [];
  const matches = html.match(/islamqa\.info\/en\/answers\/\d+(?:\/[a-z0-9-]+)?/g) || [];
  const unique = Array.from(new Set(matches.map((m) => "https://" + m.replace(/\\$/, ""))));
  return unique.slice(0, 30);
}

async function fetchIslamQAArticle(url: string, eventContext?: string | null): Promise<Article | null> {
  const html = await fetchText(url);
  if (!html) return null;

  const titleRaw = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "";
  const title = stripTags(titleRaw).replace(/\s*-\s*Islam Question.*$/i, "").trim();

  const image = html.match(/property="og:image"\s+content="([^"]+)"/)?.[1] ?? null;

  // Extract all reasonably long <p> paragraphs
  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/g;
  let m: RegExpExecArray | null;
  while ((m = pRegex.exec(html)) !== null) {
    const text = stripTags(m[1]);
    // Filter noise: nav, short strings, boilerplate
    if (text.length < 60) continue;
    if (/^Praise be to Allah,?$/i.test(text)) continue;
    if (/^and blessings and peace be upon/i.test(text)) continue;
    if (/^End quote\.?$/i.test(text)) continue;
    if (/cookie|privacy policy|subscribe/i.test(text)) continue;
    paragraphs.push(text);
    if (paragraphs.length >= 8) break;
  }

  if (paragraphs.length === 0) return null;

  const excerpt = paragraphs[0].slice(0, 220);

  // Turn subsequent paragraphs into "comments" (excerpts from the scholar's answer)
  const comments: Comment[] = paragraphs.slice(1, 5).map((text) => ({
    author: "IslamQA Scholars",
    text: text.length > 320 ? text.slice(0, 320).trim() + "…" : text,
  }));

  return {
    title: title || "Islamic Q&A",
    link: url,
    source: "IslamQA",
    image,
    excerpt,
    pubDate: new Date().toISOString(),
    comments,
    eventContext: eventContext ?? null,
  };
}

// ---------- Handler ----------

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const now = new Date();
    const event = detectUpcomingEvent(now);
    const eventContext = event
      ? `${event.name} — ${event.description}${event.inDays === 0 ? " (today)" : event.inDays === 1 ? " (tomorrow)" : " (in 2 days)"}`
      : null;

    const links = await listIslamQAAnswerLinks();
    if (links.length === 0) {
      return new Response(JSON.stringify({ articles: [], event: eventContext }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If an event is upcoming, first fetch to find matches by title
    let selected: string[] = [];
    if (event) {
      const settled = await Promise.allSettled(
        links.slice(0, 15).map(async (u) => {
          const h = await fetchText(u, 6000);
          const t = h?.match(/<title>([^<]+)<\/title>/)?.[1]?.toLowerCase() ?? "";
          const ogd = h?.match(/name="description"\s+content="([^"]+)"/)?.[1]?.toLowerCase() ?? "";
          const hay = t + " " + ogd;
          const hit = event.keywords.some((k) => hay.includes(k));
          return hit ? u : null;
        }),
      );
      selected = settled
        .map((r) => (r.status === "fulfilled" ? r.value : null))
        .filter((u): u is string => !!u)
        .slice(0, 6);
    }

    // Fill with randomised remaining if nothing matched or no event
    if (selected.length < 6) {
      const remaining = links.filter((l) => !selected.includes(l)).sort(() => Math.random() - 0.5);
      selected = [...selected, ...remaining].slice(0, 6);
    }

    const fetched = await Promise.allSettled(
      selected.map((u) => fetchIslamQAArticle(u, eventContext)),
    );
    const articles: Article[] = fetched
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter((a): a is Article => !!a);

    return new Response(
      JSON.stringify({ articles, event: eventContext, eventName: event?.name ?? null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=1800" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err), articles: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
