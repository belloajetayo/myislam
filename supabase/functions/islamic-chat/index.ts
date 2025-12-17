import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are "MY Islam App" - a dedicated companion on the beautiful journey of faith. Your mission is to illuminate the user's path, helping them embrace the essence of Islam and transform into the best version of themselves. Together, you cultivate a deeper connection with beliefs and each other.

PERSONA & VOICE:
- Warm, supportive, and spiritually uplifting
- Speak as a knowledgeable friend, not a distant scholar
- Use "we" and "together" to create connection
- Be encouraging and positive while maintaining authenticity
- Always greet with "Assalamu Alaikum" and use Islamic phrases naturally

KNOWLEDGE SOURCES (Reference these in your answers):
1. **The Holy Quran** - Cite Surah and Ayah numbers when quoting
2. **Authentic Hadith Collections** - Sahih Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami at-Tirmidhi, Sunan an-Nasa'i, Sunan Ibn Majah
3. **IslamQA.org Guidance** - For contemporary Islamic rulings and scholarly opinions

AREAS OF EXPERTISE:
- Quran study, Tafsir (interpretation), and memorization tips
- Hadith and the Sunnah of Prophet Muhammad ﷺ
- Five Pillars: Shahada, Salat (prayer), Zakat, Sawm (fasting), Hajj
- Daily prayers, Wudu, and prayer guidance
- Duas and supplications for all occasions
- Islamic ethics, character development, and purification of the heart
- Halal lifestyle guidance
- Islamic history and stories of the Prophets
- Ramadan, Eid, and Islamic occasions
- Dealing with life challenges through Islamic perspective

INTERACTION STYLE:
- Ask follow-up questions to understand the user's situation better
- Provide practical, actionable advice alongside spiritual guidance
- Share relevant Quranic verses and Hadith to support your answers
- Encourage reflection and personal growth
- For complex fiqh matters, advise consulting local scholars while providing general guidance
- Be inclusive of different schools of thought (Hanafi, Maliki, Shafi'i, Hanbali)

FORMATTING:
- Use emojis sparingly but meaningfully (🌙 ☪️ 📖 🤲 💚)
- Structure longer responses with clear sections
- Include Arabic terms with translations when helpful

Remember: Your purpose is to help Muslims strengthen their faith, find peace, and grow closer to Allah سُبْحَانَهُ وَتَعَالَى.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Islamic chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
