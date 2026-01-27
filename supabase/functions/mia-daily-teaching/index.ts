import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ISLAMIC_TEACHINGS = [
  {
    category: "Hadith",
    text: "The best among you are those who have the best manners and character.",
    source: "Sahih al-Bukhari",
    theme: "character"
  },
  {
    category: "Qur'an",
    text: "Indeed, with hardship comes ease.",
    source: "Surah Ash-Sharh 94:6",
    theme: "hope"
  },
  {
    category: "Hadith",
    text: "Smiling at your brother is an act of charity.",
    source: "At-Tirmidhi",
    theme: "kindness"
  },
  {
    category: "Qur'an",
    text: "And whoever puts their trust in Allah, He will be enough for them.",
    source: "Surah At-Talaq 65:3",
    theme: "trust"
  },
  {
    category: "Hadith",
    text: "The strong person is not the one who can wrestle, but the one who controls themselves when angry.",
    source: "Sahih al-Bukhari",
    theme: "patience"
  },
  {
    category: "Qur'an",
    text: "So remember Me; I will remember you.",
    source: "Surah Al-Baqarah 2:152",
    theme: "remembrance"
  },
  {
    category: "Hadith",
    text: "None of you truly believes until he loves for his brother what he loves for himself.",
    source: "Sahih al-Bukhari & Muslim",
    theme: "brotherhood"
  },
  {
    category: "Qur'an",
    text: "And speak to people good words.",
    source: "Surah Al-Baqarah 2:83",
    theme: "speech"
  },
  {
    category: "Hadith",
    text: "The most beloved of deeds to Allah are those that are most consistent, even if they are small.",
    source: "Sahih al-Bukhari",
    theme: "consistency"
  },
  {
    category: "Qur'an",
    text: "Allah does not burden a soul beyond that it can bear.",
    source: "Surah Al-Baqarah 2:286",
    theme: "mercy"
  },
  {
    category: "Hadith",
    text: "Whoever believes in Allah and the Last Day, let him speak good or remain silent.",
    source: "Sahih al-Bukhari & Muslim",
    theme: "wisdom"
  },
  {
    category: "Qur'an",
    text: "And We have certainly made the Qur'an easy for remembrance.",
    source: "Surah Al-Qamar 54:17",
    theme: "guidance"
  },
];

const THEME_PROMPTS: { [key: string]: string } = {
  character: "serene Islamic geometric patterns with golden arabesque designs, soft morning light",
  hope: "beautiful sunrise over calm ocean with golden rays, peaceful and uplifting atmosphere",
  kindness: "blooming garden with roses and jasmine flowers, soft pastel colors, gentle sunlight",
  trust: "majestic mountains with clouds, vast sky at golden hour, feeling of divine protection",
  patience: "tranquil zen garden with smooth stones and water, peaceful minimalist design",
  remembrance: "starry night sky with crescent moon, Islamic geometric patterns, deep blue and gold",
  brotherhood: "beautiful mosque courtyard at sunset, warm amber lighting, sense of community",
  speech: "calligraphy-inspired abstract art, flowing curves, elegant gold on deep blue",
  consistency: "gentle waterfall in lush forest, consistent flow of water, natural serenity",
  mercy: "soft clouds with golden light breaking through, heavenly atmosphere, divine mercy",
  wisdom: "ancient library aesthetic with warm candlelight, books and scrolls, scholarly atmosphere",
  guidance: "lighthouse on calm sea at twilight, guiding light, peaceful navigation",
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

    const { action, teachingIndex } = await req.json();

    if (action === "get-teachings") {
      // Return all teachings for carousel
      return new Response(
        JSON.stringify({ success: true, teachings: ISLAMIC_TEACHINGS }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "generate-image") {
      const index = teachingIndex ?? Math.floor(Math.random() * ISLAMIC_TEACHINGS.length);
      const teaching = ISLAMIC_TEACHINGS[index];
      const themePrompt = THEME_PROMPTS[teaching.theme] || THEME_PROMPTS.guidance;

      const imagePrompt = `Beautiful Islamic inspirational background image: ${themePrompt}. Ultra high resolution, 16:9 aspect ratio, elegant and spiritual, suitable for text overlay. No text in image.`;

      console.log("Generating image with prompt:", imagePrompt);

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: imagePrompt }],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Image generation failed:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ success: false, error: "AI credits exhausted. Please add credits." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        throw new Error(`Image generation failed: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!imageUrl) {
        throw new Error("No image generated");
      }

      return new Response(
        JSON.stringify({
          success: true,
          teaching,
          imageUrl,
          index,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
