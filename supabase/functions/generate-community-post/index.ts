import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const POST_TYPES = ['teaching', 'qa', 'hadith', 'verse'] as const;

const PROMPTS: Record<string, string> = {
  teaching: `Generate a brief Islamic teaching or wisdom (2-4 sentences) that is beneficial and spiritually uplifting. Include practical guidance Muslims can apply daily. Do NOT use markdown. Just plain text.`,
  qa: `Generate an Islamic Q&A post. Start with a common question Muslims might have (like "Q: ..."), followed by a brief scholarly answer (like "A: ..."). Keep it under 200 words. Cite sources when possible (Quran/Hadith). Do NOT use markdown.`,
  hadith: `Share a beautiful Hadith of Prophet Muhammad ﷺ. Include the Arabic transliteration if short, the English translation, and the source (e.g., Sahih Bukhari, Muslim). Keep it concise. Do NOT use markdown.`,
  verse: `Share a Quranic verse with its Surah name and verse number. Provide both Arabic transliteration and English translation, plus a brief reflection (1-2 sentences). Do NOT use markdown.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Pick a random post type
    const postType = POST_TYPES[Math.floor(Math.random() * POST_TYPES.length)];
    const prompt = PROMPTS[postType];

    // Generate content using Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a knowledgeable Islamic scholar providing authentic teachings from Quran and Sunnah. Your responses are warm, accessible, and spiritually enriching. Always maintain accuracy and cite sources.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated");
    }

    // Insert into database
    const { data: post, error: insertError } = await supabase
      .from("community_posts")
      .insert({
        content: content.trim(),
        post_type: postType,
        source: "MyIslam AI",
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(JSON.stringify({ success: true, post }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating post:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
