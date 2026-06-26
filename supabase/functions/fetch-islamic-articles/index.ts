import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FEEDS = [
  { source: "About Islam", url: "https://aboutislam.net/feed/" },
  { source: "Muslim Matters", url: "https://muslimmatters.org/feed/" },
  { source: "Islamicity", url: "https://www.islamicity.org/feed/" },
];

interface Article {
  title: string;
  link: string;
  source: string;
  image: string | null;
  excerpt: string;
  pubDate: string;
}

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripTags(s: string): string {
  return decode(s).replace(/<[^>]+>/g, "").trim();
}

function parseRss(xml: string, source: string): Article[] {
  const items: Article[] = [];
  const itemRegex = /<item[\s\S]*?<\/item>/g;
  const matches = xml.match(itemRegex) || [];
  for (const item of matches.slice(0, 8)) {
    const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
    const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? "";
    const desc =
      item.match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? "";
    const content =
      item.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/)?.[1] ?? "";
    const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "";

    // Find first image in media:content, enclosure, or content/description
    let image: string | null = null;
    image =
      item.match(/<media:content[^>]*url="([^"]+)"/)?.[1] ??
      item.match(/<enclosure[^>]*url="([^"]+)"/)?.[1] ??
      content.match(/<img[^>]*src="([^"]+)"/)?.[1] ??
      desc.match(/<img[^>]*src="([^"]+)"/)?.[1] ??
      null;

    items.push({
      title: stripTags(title),
      link: decode(link),
      source,
      image,
      excerpt: stripTags(desc).slice(0, 160),
      pubDate,
    });
  }
  return items;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const results = await Promise.allSettled(
      FEEDS.map(async ({ source, url }) => {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 8000);
        try {
          const res = await fetch(url, {
            signal: ctrl.signal,
            headers: { "User-Agent": "MyIslamApp/1.0" },
          });
          if (!res.ok) return [];
          const xml = await res.text();
          return parseRss(xml, source);
        } finally {
          clearTimeout(t);
        }
      }),
    );

    const articles: Article[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") articles.push(...r.value);
    }

    // Shuffle so different sources interleave
    articles.sort(() => Math.random() - 0.5);

    return new Response(
      JSON.stringify({ articles: articles.slice(0, 20) }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=3600",
        },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err), articles: [] }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
