import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Download,
  Sparkles,
  RefreshCw,
  Image,
  Maximize2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Teaching {
  category: string;
  text: string;
  source: string;
  theme: string;
}

interface TeachingCard {
  teaching: Teaching;
  imageUrl: string | null;
  loading: boolean;
}

const DailyTeachingsCarousel: React.FC = () => {
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState<Map<number, TeachingCard>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Get today's Hijri date
  const [hijriDate, setHijriDate] = useState<string>("");

  useEffect(() => {
    const fetchHijriDate = async () => {
      try {
        const today = new Date();
        // Use local Gregorian date (DD-MM-YYYY) to avoid UTC/timezone off-by-one
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();
        const response = await fetch(
          `https://api.aladhan.com/v1/gToH/${dd}-${mm}-${yyyy}`,
        );
        const data = await response.json();
        if (data.code === 200) {
          const hijri = data.data.hijri;
          setHijriDate(`${hijri.day} ${hijri.month.en} ${hijri.year} AH`);
        }
      } catch (error) {
        console.error("Error fetching Hijri date:", error);
      }
    };
    fetchHijriDate();
  }, []);

  // Fetch teachings on mount
  useEffect(() => {
    const fetchTeachings = async () => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "mia-daily-teaching",
          {
            body: { action: "get-teachings" },
          },
        );

        if (error) throw error;
        if (data?.teachings) {
          setTeachings(data.teachings);
          // Set initial index based on day of year for daily rotation
          const dayOfYear = Math.floor(
            (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
              86400000,
          );
          setCurrentIndex(dayOfYear % data.teachings.length);
        }
      } catch (error) {
        console.error("Error fetching teachings:", error);
      }
    };
    fetchTeachings();
  }, []);

  const generateImage = useCallback(
    async (index: number) => {
      if (cards.get(index)?.imageUrl || cards.get(index)?.loading) return;

      setCards((prev) =>
        new Map(prev).set(index, {
          teaching: teachings[index],
          imageUrl: null,
          loading: true,
        }),
      );

      try {
        const { data, error } = await supabase.functions.invoke(
          "mia-daily-teaching",
          {
            body: { action: "generate-image", teachingIndex: index },
          },
        );

        if (error) throw error;

        setCards((prev) =>
          new Map(prev).set(index, {
            teaching: teachings[index],
            imageUrl: data?.imageUrl || null,
            loading: false,
          }),
        );
      } catch (error) {
        console.error("Error generating image:", error);
        setCards((prev) =>
          new Map(prev).set(index, {
            teaching: teachings[index],
            imageUrl: null,
            loading: false,
          }),
        );
        toast.error("Failed to generate image");
      }
    },
    [teachings, cards],
  );

  // NO auto-generate on load - wait for user to click

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % teachings.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + teachings.length) % teachings.length);
  };

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    setCards((prev) => {
      const newMap = new Map(prev);
      newMap.delete(currentIndex);
      return newMap;
    });
    await generateImage(currentIndex);
    setIsGenerating(false);
  };

  const handleShare = async () => {
    const teaching = teachings[currentIndex];

    if (!teaching) return;

    const shareText = `"${teaching.text}"\n\n— ${teaching.source}\n\n📅 ${hijriDate}\n📱 MyIslam App`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: teaching.category,
          text: shareText,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          await navigator.clipboard.writeText(shareText);
          toast.success("Copied to clipboard!");
        }
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Copied to clipboard!");
    }
  };

  const handleDownload = async () => {
    const teaching = teachings[currentIndex];
    if (!teaching) return;

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 1080;
      canvas.height = 1920;

      const currentCard = cards.get(currentIndex);

      // Draw background - use AI image if available, otherwise gradient
      if (currentCard?.imageUrl) {
        const img = document.createElement("img") as HTMLImageElement;
        img.crossOrigin = "anonymous";

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = currentCard.imageUrl!;
        });

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else {
        // Create gradient background
        const gradient = ctx.createLinearGradient(
          0,
          0,
          canvas.width,
          canvas.height,
        );
        gradient.addColorStop(0, "#1a365d");
        gradient.addColorStop(0.5, "#2d3748");
        gradient.addColorStop(1, "#1a202c");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add decorative pattern
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = Math.random() * 100 + 50;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = "#d4af37";
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // Add overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add text
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";

      // Category badge
      ctx.font = "bold 36px Arial";
      ctx.fillText(teaching.category.toUpperCase(), canvas.width / 2, 180);

      // Main quote - smaller font for longer text
      ctx.font = "38px Georgia";
      const words = teaching.text.split(" ");
      let line = "";
      let y = 320;
      const maxWidth = canvas.width - 100;
      const lineHeight = 52;

      for (const word of words) {
        const testLine = line + word + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== "") {
          ctx.fillText(line.trim(), canvas.width / 2, y);
          line = word + " ";
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), canvas.width / 2, y);

      // Source
      ctx.font = "italic 30px Georgia";
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.fillText(`— ${teaching.source}`, canvas.width / 2, y + 80);

      // Date
      ctx.font = "26px Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillText(hijriDate, canvas.width / 2, canvas.height - 140);

      // MyIslam App branding
      ctx.font = "bold 32px Arial";
      ctx.fillStyle = "#FFD700";
      ctx.fillText("MyIslam App", canvas.width / 2, canvas.height - 80);

      // Download
      const link = document.createElement("a");
      link.download = `myislam-teaching-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success("Image downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    }
  };

  if (teachings.length === 0) {
    return null;
  }

  const currentCard = cards.get(currentIndex);
  const teaching = teachings[currentIndex];

  return (
    <div
      className="relative bg-card rounded-3xl overflow-hidden shadow-card border border-border animate-slide-up"
      style={{ animationDelay: "0.2s" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-islamic-gold" />
          <span className="font-semibold text-sm text-foreground">
            {teaching?.category || "Daily Teaching"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGenerateImage}
            disabled={isGenerating || currentCard?.loading}
            className="h-7 w-7"
            title="Generate artwork"
          >
            {isGenerating || currentCard?.loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Image className="w-3.5 h-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsViewOpen(true)}
            className="h-7 w-7"
            title="View full"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="h-7 w-7"
            title="Share"
          >
            <Share2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            className="h-7 w-7"
            title="Save image"
          >
            <Download className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Card Content */}
      <div className="relative min-h-[320px] overflow-hidden">
        {/* Background */}
        {currentCard?.loading ? (
          <div className="absolute inset-0 bg-gradient-to-br from-islamic-gold/20 via-secondary/20 to-primary/20 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-islamic-gold border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">
                Generating artwork...
              </p>
            </div>
          </div>
        ) : currentCard?.imageUrl ? (
          <img
            src={currentCard.imageUrl}
            alt="Islamic teaching background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-islamic-gold/30 via-secondary/20 to-primary/30" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

        {/* Content */}
        <div className="relative flex flex-col p-5 text-white">
          {/* Date Badge */}
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white text-black px-3 py-2 rounded-lg text-center min-w-[60px]">
              <span className="block text-xl font-bold leading-tight">
                {hijriDate.split(" ")[0] || "9"}
              </span>
              <span className="block text-[10px] uppercase tracking-wide">
                {hijriDate.split(" ")[1] || "Shaaban"}
              </span>
            </div>
            <span className="text-islamic-gold font-semibold text-lg">
              {teaching?.category}
            </span>
          </div>

          {/* Quote - Full detailed text */}
          <p className="text-sm leading-relaxed mb-4 text-white/95">
            {teaching?.text}
          </p>

          {/* Source */}
          <p className="text-xs text-white/70 italic mb-6">
            [{teaching?.source}]
          </p>

          {/* Branding */}
          <div className="mt-auto pt-2 border-t border-white/20">
            <p className="text-[11px] font-medium text-islamic-gold">
              MyIslam App
            </p>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex items-center justify-center gap-1.5 py-3">
        {teachings.slice(0, 5).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex % 5
                ? "w-6 bg-islamic-gold"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
        {teachings.length > 5 && (
          <span className="text-xs text-muted-foreground ml-1">
            +{teachings.length - 5}
          </span>
        )}
      </div>

      {/* Fullscreen View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden bg-card border-border">
          <DialogTitle className="sr-only">View Teaching</DialogTitle>
          {/* Background */}
          <div className="relative min-h-[70vh]">
            {currentCard?.imageUrl ? (
              <img
                src={currentCard.imageUrl}
                alt="Islamic teaching background"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-islamic-gold/30 via-secondary/20 to-primary/30" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />

            {/* Content */}
            <div className="relative flex flex-col p-8 text-white h-full justify-center">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white text-black px-4 py-3 rounded-xl text-center min-w-[70px]">
                  <span className="block text-2xl font-bold leading-tight">
                    {hijriDate.split(" ")[0] || "9"}
                  </span>
                  <span className="block text-xs uppercase tracking-wide">
                    {hijriDate.split(" ")[1] || "Shaaban"}
                  </span>
                </div>
                <span className="text-islamic-gold font-semibold text-xl">
                  {teaching?.category}
                </span>
              </div>

              <p className="text-lg leading-relaxed mb-6 text-white/95">
                {teaching?.text}
              </p>

              <p className="text-sm text-white/70 italic mb-8">
                [{teaching?.source}]
              </p>

              <div className="mt-auto pt-4 border-t border-white/20 flex items-center justify-between">
                <p className="text-sm font-medium text-islamic-gold">
                  MyIslam App
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyTeachingsCarousel;
