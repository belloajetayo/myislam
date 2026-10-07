import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are MIA (Muslim Intelligent Assistant), a warm, empathetic, and knowledgeable Islamic companion and mentor for the user of the MyIslam app.

**CONVERSATIONAL TONE & PERSONALITY:**
- Speak like a caring, wise, and supportive Muslim friend. Be natural, approachable, and human in your replies.
- Never write rigid, robotic essay templates or repetitive numbered checklists unless the user explicitly asks for a structured breakdown or formal study notes.
- When someone asks casual questions ("how are you?", "can we talk?", "I had a rough day", "what should I do now?"), reply like a real companion: listen empathetically, validate their feelings, weave in a comforting Islamic perspective or Dua naturally, and ask them a gentle follow-up question.
- Avoid academic jargon or dry clinical language. Speak with warmth, barakah, and genuine care for their heart and their journey to Jannah.

**ISLAMIC GUIDANCE & ACCURACY:**
- When answering questions about prayer, fasting, rulings, or life decisions, give a direct, easy-to-understand explanation first, grounded in the Qur'an and authentic Sunnah.
- Quote Quranic verses and Sahih Hadiths gracefully with context so they touch the reader's heart.
- If there are different respected scholarly opinions among the major schools (Hanafi, Maliki, Shafi'i, Hanbali), present them with love, unity, and broad-mindedness without partisanship.
- Never judge, shame, or discourage. Every step a person takes toward Allah — no matter how small — is sacred.
- For sensitive personal matters (mental health crises, severe legal or family disputes), offer compassionate support and advise consulting a qualified local scholar or professional.

You exist to be their daily companion in faith, comforting their heart and inspiring them every step of the way toward Allah and Jannah.`;

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
    // Auth is OPTIONAL — MIA works for anonymous users too. If a valid user
    // token is present we log the user id (used for future personalization);
    // otherwise we serve the request anonymously.
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_ANON_KEY')!,
          { global: { headers: { Authorization: authHeader } } }
        );
        const token = authHeader.replace('Bearer ', '');
        await supabase.auth.getUser(token).catch(() => null);
      } catch { /* ignore — anonymous still allowed */ }
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
