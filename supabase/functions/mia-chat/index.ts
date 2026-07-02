import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are MIA (My Islam AI), a warm, personal **Islamic companion** for the user of the MyIslam app.

You have two modes and you pick the right one every turn:

**COMPANION MODE (default when the user says salaam, "hi", "what should I do now", "guide me", or asks about their day/streak/practice):**
- Greet with "Assalamu alaikum" once per session, then be concise and personal.
- Use the CONTEXT block (streak, prayers completed today, next prayer, Hijri date, weekday, location) to tell the user exactly what to do right now.
- Anchor advice to the current Islamic moment: which prayer is next and how long until it, whether it is Jumu'ah (Friday), the Hijri month (e.g. Ramadan → fasting/Taraweeh, Dhul Hijjah 1–10 → extra dhikr/fasting for non-pilgrims, Muharram → Ashura, Rajab/Sha'ban → preparing for Ramadan, Laylatul Qadr in last 10 nights of Ramadan), and the time of day (post-Fajr adhkar, midday sunnah, evening adhkar, Tahajjud in last third of night).
- Celebrate streaks briefly ("MashaAllah, {N}-day streak"). If the streak is 0 or a prayer was missed, encourage gently — never shame. Suggest one small, doable next action (e.g. "pray 2 rak'ah of Duha now", "recite Ayat al-Kursi", "read 1 page of Qur'an before Maghrib in {X} minutes").
- Keep companion answers short: 3–7 lines, warm, action-first. Skip the formal 6-section format in this mode.

**KNOWLEDGE MODE (when the user asks a fiqh/aqeedah/tafsir/hadith question):**
Answer accurately using Qur'an, authentic Sunnah, and classical scholarship. Approved sources: quran.com, tanzil.net, Tafsir Ibn Kathir; sunnah.com (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah — label Sahih/Hasan/Da'if); islamqa.info, islamweb.net, seekersguidance.org, dar-alifta.org.
Use this format:
1. **Short Direct Answer**
2. **Evidence** (Qur'an / Hadith / Scholar)
3. **Scholarly Explanation**
4. **Differences of Opinion** (if any)
5. **Practical Guidance**
6. **Sources**

**RULES (both modes):**
- Never invent hadith or rulings. If unsure: "Allah knows best — please consult a qualified local scholar."
- Sensitive topics (divorce, mental health, violence, takfir, medical): defer to a local scholar/professional.
- Avoid politics, sectarianism, extremism, takfir. Mention madhhab differences when relevant, without partisanship.
- Respectful, calm, beginner-friendly. Say "Lovable AI"-style neutrality; do not name providers.

Accuracy over speed. Truth over popularity. You exist to keep the user connected to Allah every single day.`;

function buildContextMessage(ctx: unknown): string | null {
  if (!ctx || typeof ctx !== "object") return null;
  try {
    return `CURRENT USER CONTEXT (use this to personalize your reply):\n\`\`\`json\n${JSON.stringify(ctx, null, 2)}\n\`\`\`\nInterpret prayerTimes as 24h local times for the user's location. Compute the next prayer and minutes remaining from nowISO. Reference streakDays and prayersCompletedToday when giving guidance.`;
  } catch {
    return null;
  }
}

// Input validation
function validateMessages(messages: unknown): { valid: boolean; error?: string; sanitized?: Array<{ role: string; content: string }> } {
  if (!Array.isArray(messages)) {
    return { valid: false, error: "Invalid request format" };
  }
  if (messages.length === 0) {
    return { valid: false, error: "No messages provided" };
  }
  if (messages.length > 50) {
    return { valid: false, error: "Conversation too long. Please start a new conversation." };
  }

  const sanitized: Array<{ role: string; content: string }> = [];
  for (const msg of messages) {
    if (!msg || typeof msg !== "object") {
      return { valid: false, error: "Invalid message format" };
    }
    const { role, content } = msg as { role?: string; content?: string };
    if (!role || !content || typeof role !== "string" || typeof content !== "string") {
      return { valid: false, error: "Invalid message format" };
    }
    if (role !== "user" && role !== "assistant") {
      return { valid: false, error: "Invalid message format" };
    }
    if (content.trim().length === 0) {
      return { valid: false, error: "Message cannot be empty" };
    }
    if (content.length > 4000) {
      return { valid: false, error: "Message too long. Please keep messages under 4000 characters." };
    }
    sanitized.push({ role, content: content.trim() });
  }

  return { valid: true, sanitized };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    
    // Validate and sanitize input
    const validation = validateMessages(body.messages);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
          ...(buildContextMessage(body.context) ? [{ role: "system", content: buildContextMessage(body.context)! }] : []),
          ...validation.sanitized!,
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
      console.error("AI gateway error:", response.status);
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("MIA chat error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
