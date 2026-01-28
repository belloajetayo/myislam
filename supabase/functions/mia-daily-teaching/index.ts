import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ISLAMIC_TEACHINGS = [
  {
    category: "Verse Of The Day",
    text: "Indeed, those who have said, 'Our Lord is Allah' and then remained on a right course - the angels will descend upon them, [saying], 'Do not fear and do not grieve but receive good tidings of Paradise, which you were promised. We [angels] were your allies in worldly life and [are so] in the Hereafter. And you will have therein whatever your souls desire, and you will have therein whatever you request [or wish].'",
    source: "Quran 41:30-31",
    theme: "paradise"
  },
  {
    category: "Hadith Of The Day",
    text: "The Messenger of Allah (ﷺ) said: 'The best among you are those who have the best manners and character. The most complete of the believers in faith is the one with the best character among them. And the best of you are those who are best to their women.'",
    source: "Sahih al-Bukhari & At-Tirmidhi",
    theme: "character"
  },
  {
    category: "Verse Of The Day",
    text: "So verily, with hardship comes ease. Verily, with hardship comes ease. So when you have finished [your duties], then stand up [for worship]. And to your Lord direct [your] longing.",
    source: "Quran 94:5-8 (Surah Ash-Sharh)",
    theme: "hope"
  },
  {
    category: "Hadith Of The Day",
    text: "The Prophet (ﷺ) said: 'Do not belittle any good deed, even meeting your brother with a cheerful face. When you cook broth, make a lot of it and give some to your neighbors.' Smiling at your brother is charity. Guiding a person who is lost is charity. Removing harmful objects from the road is charity.",
    source: "At-Tirmidhi & Sahih Muslim",
    theme: "kindness"
  },
  {
    category: "Verse Of The Day",
    text: "And whoever puts their trust in Allah, He will be enough for them. Indeed, Allah will accomplish His purpose. Allah has already set for everything a [decreed] extent. And whoever fears Allah - He will make for him a way out and will provide for him from where he does not expect.",
    source: "Quran 65:3 (Surah At-Talaq)",
    theme: "trust"
  },
  {
    category: "Hadith Of The Day",
    text: "The Prophet (ﷺ) said: 'The strong man is not the one who can wrestle, but the strong man is the one who controls himself when he is angry.' In another narration: 'Strength is not in overpowering others, but true strength is in controlling oneself at the time of anger.'",
    source: "Sahih al-Bukhari & Muslim",
    theme: "patience"
  },
  {
    category: "Verse Of The Day",
    text: "So remember Me; I will remember you. Be grateful to Me and do not deny Me. O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient. And do not say about those who are killed in the way of Allah, 'They are dead.' Rather, they are alive, but you perceive [it] not.",
    source: "Quran 2:152-154 (Surah Al-Baqarah)",
    theme: "remembrance"
  },
  {
    category: "Hadith Of The Day",
    text: "The Prophet (ﷺ) said: 'None of you truly believes until he loves for his brother what he loves for himself.' This encompasses all forms of goodness - in religion and worldly matters. A believer should wish for his fellow Muslim the same guidance, sustenance, and blessings that he wishes for himself.",
    source: "Sahih al-Bukhari & Muslim",
    theme: "brotherhood"
  },
  {
    category: "Verse Of The Day",
    text: "And [recall] when We took the covenant from the Children of Israel, [enjoining upon them], 'Do not worship except Allah; and to parents do good and to relatives, orphans, and the needy. And speak to people good [words] and establish prayer and give zakah.'",
    source: "Quran 2:83 (Surah Al-Baqarah)",
    theme: "speech"
  },
  {
    category: "Hadith Of The Day",
    text: "The Prophet (ﷺ) said: 'The most beloved of deeds to Allah are those that are most consistent, even if they are small.' When 'Aisha was asked about the deeds of the Prophet, she said, 'His deeds were consistent. He would continue doing good deeds regularly without interruption.'",
    source: "Sahih al-Bukhari",
    theme: "consistency"
  },
  {
    category: "Verse Of The Day",
    text: "Allah does not burden a soul beyond that it can bear. It will have [the consequence of] what [good] it has gained, and it will bear [the consequence of] what [evil] it has earned. 'Our Lord, do not impose blame upon us if we have forgotten or erred. Our Lord, and lay not upon us a burden like that which You laid upon those before us.'",
    source: "Quran 2:286 (Surah Al-Baqarah)",
    theme: "mercy"
  },
  {
    category: "Hadith Of The Day",
    text: "The Prophet (ﷺ) said: 'Whoever believes in Allah and the Last Day, let him speak good or remain silent. Whoever believes in Allah and the Last Day, let him honor his neighbor. Whoever believes in Allah and the Last Day, let him honor his guest.'",
    source: "Sahih al-Bukhari & Muslim",
    theme: "wisdom"
  },
  {
    category: "Verse Of The Day",
    text: "And We have certainly made the Qur'an easy for remembrance, so is there any who will remember? How many a generation before them did We destroy, and they are crying out when there is no longer time for escape.",
    source: "Quran 54:17-18 (Surah Al-Qamar)",
    theme: "guidance"
  },
  {
    category: "Hadith Of The Day",
    text: "The Prophet (ﷺ) said: 'When Allah created Paradise and Hell, He sent Jibreel to Paradise and said: Look at it and what I have prepared for its people. So he looked at it and saw what Allah had prepared for its people. Then he said: By Your Might, no one who hears of it will fail to enter it.'",
    source: "At-Tirmidhi & Abu Dawud",
    theme: "paradise"
  },
  {
    category: "Verse Of The Day",
    text: "O mankind, indeed We have created you from male and female and made you peoples and tribes that you may know one another. Indeed, the most noble of you in the sight of Allah is the most righteous of you. Indeed, Allah is Knowing and Acquainted.",
    source: "Quran 49:13 (Surah Al-Hujurat)",
    theme: "brotherhood"
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
  paradise: "beautiful Islamic garden with fountains, lush greenery, golden light streaming through",
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
