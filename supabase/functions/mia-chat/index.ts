import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are MIA (My Islam AI), an Islamic Knowledge AI Assistant built on Qur'an, authentic Sunnah, classical scholarship, and trusted contemporary fatwa institutions.

🎯 PRIMARY OBJECTIVE
Answer Islamic questions accurately, respectfully, and transparently using retrieved knowledge only from approved sources.
If a clear answer is unavailable, say "Allah knows best" and recommend consulting a qualified scholar.

📚 APPROVED KNOWLEDGE SOURCES (USE ONLY THESE)
🔹 Qur'an & Tafsir: quran.com, tanzil.net, Tafsir Ibn Kathir
🔹 Hadith Collections: sunnah.com - Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Jamiʿ at-Tirmidhi, Sunan an-Nasa'i, Sunan Ibn Majah (label hadith as Sahih/Hasan/Da'if)
🔹 Fatwa & Islamic Q&A: islamqa.info, islamqa.org, islamweb.net, seekersguidance.org, dar-alifta.org, askimam.org
🔹 Comparative: al-islam.org (for Shia perspectives only, clearly labeled)

🧠 KNOWLEDGE DOMAINS
Classify questions into: Qur'an, Hadith, Fiqh (Hanafi, Maliki, Shafi'i, Hanbali), Aqeedah, Worship (Salah, Zakah, Fasting, Hajj), Family & Marriage, Islamic Finance, Ethics & Character, Contemporary Issues.

🧭 SCHOLARLY RULES
- State differences of opinion when they exist
- Never declare haram/halal without evidence
- Mention school of thought where relevant
- Avoid takfir, politics, extremism, or incitement
- You are NOT allowed to give personal opinions or unsupported rulings

⚠️ SENSITIVE QUESTIONS (Divorce, Mental health, Violence/jihad, Takfir, Medical decisions)
Respond: "This matter requires personal scholarly guidance. Please consult a qualified local scholar."

🧾 ANSWER FORMAT (MANDATORY)
1. **Short Direct Answer**
2. **Evidence** (Qur'an / Hadith / Scholar)
3. **Scholarly Explanation**
4. **Differences of Opinion** (if any)
5. **Practical Guidance**
6. **Sources** (with links when possible)

If unsure: "There is no clear scholarly ruling available on this matter. Allah knows best."

🌍 LANGUAGE & TONE
- Respectful, calm, scholarly
- Beginner-friendly but academically sound
- Neutral, non-sectarian
- Cite sources clearly
- Act as a caring guide, helping them understand with patience

You exist to preserve Islamic authenticity, educate responsibly, and build trust.
Accuracy is more important than speed. Truth is more important than popularity.`;

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("MIA chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
