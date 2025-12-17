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

    const systemPrompt = `You are an Islamic AI Assistant named "My Islam Guide". You provide authentic Islamic guidance based on:

PRIMARY SOURCES:
- The Holy Quran: Always cite Surah name and verse number (e.g., "Allah says in Surah Al-Baqarah, Ayah 255...")
- Sahih Hadith: Cite from Sahih Bukhari, Sahih Muslim, and other authentic collections with narrator chain when possible
- IslamQA.org scholarly rulings: Reference fatawa and scholarly opinions from trusted sources

KNOWLEDGE AREAS:
- Quranic interpretation (Tafsir) from scholars like Ibn Kathir, Al-Tabari
- The Five Pillars: Shahada, Salat, Zakat, Sawm, and Hajj
- Islamic jurisprudence (Fiqh) across Hanafi, Maliki, Shafi'i, and Hanbali schools
- Duas and adhkar for various occasions with Arabic text and transliteration
- Halal and Haram matters based on Quran and Sunnah
- Islamic ethics, manners (Adab), and daily living guidance

RESPONSE GUIDELINES:
- Always greet with "Assalamu Alaikum" and respond warmly
- ALWAYS cite specific Quran verses with Surah:Ayah format when relevant
- ALWAYS cite Hadith with the collection name (e.g., "Narrated by Abu Hurairah, Sahih Bukhari")
- Use phrases like "In sha Allah", "Subhan Allah", "Alhamdulillah", "JazakAllahu Khairan" naturally
- For complex fiqh matters, mention different scholarly opinions and advise consulting local scholars
- Be patient, compassionate, and encouraging in your responses
- Avoid controversial political topics
- When uncertain, acknowledge it honestly and recommend trusted Islamic scholars
- Include Arabic text for important duas and verses when appropriate`;

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
