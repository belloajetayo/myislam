import React, { useState, useEffect, useCallback } from "react";

import { BookOpen, Clock, Compass, Heart, ChevronRight, SkipForward } from "lucide-react";
const LOGO_URL = "/__l5e/assets-v1/4e726eb6-b18f-4122-bd0f-db8e93e45e65/myislam-logo.png";

interface OnboardingScreenProps {
  onComplete?: () => void;
}

const ONBOARDING_KEY = "myislam_onboarding_seen";

export const hasSeenOnboarding = (): boolean => {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
  } catch {
    return false;
  }
};

export const markOnboardingSeen = (): void => {
  try {
    localStorage.setItem(ONBOARDING_KEY, "true");
  } catch { /* quota */ }
};

const slides = [
  {
    id: 1,
    title: "Welcome to MyIslam",
    subtitle: "Your journey starts here",
    description: "A complete Islamic companion designed to guide and enrich your spiritual daily life.",
  },
  {
    id: 2,
    title: "Your Complete Companion",
    subtitle: "Everything you need in one place",
    features: [
      { icon: BookOpen, label: "Quran", color: "text-emerald-400" },
      { icon: Clock, label: "Prayer", color: "text-amber-400" },
      { icon: Compass, label: "Qiblah", color: "text-sky-400" },
      { icon: Heart, label: "Duas", color: "text-rose-400" },
    ],
    description: "Access prayer times, Quranic recitation, Qiblah direction, and beautiful daily supplications.",
  },
  {
    id: 3,
    title: "Let's Get Started",
    subtitle: "Begin your spiritual journey today",
    description: "Set up your preferences and let MyIslam guide you through every moment of faith.",
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  const goToNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      setIsExiting(true);
      setTimeout(() => {
        markOnboardingSeen();
        onComplete?.();
      }, 400);
    }
  }, [currentSlide, onComplete]);

  const skip = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      markOnboardingSeen();
      onComplete?.();
    }, 400);
  }, [onComplete]);

  const goToSlide = (index: number) => {
    if (index !== currentSlide) {
      setCurrentSlide(index);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goToNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext]);

  const slide = slides[currentSlide];

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between transition-all duration-500 ${
        isExiting ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      style={{
        background: "linear-gradient(180deg, #0a0e27 0%, #0f1535 40%, #121a3d 100%)",
      }}
    >
      {/* Skip Button */}
      <div className="w-full flex justify-end p-6 pt-8">
        <button
          onClick={skip}
          className="flex items-center gap-1.5 text-sm font-medium text-white/50 hover:text-amber-400 transition-colors duration-200"
        >
          <span>Skip</span>
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Logo — consistent across all slides */}
      <div className="flex flex-col items-center -mt-4">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-2xl scale-110" />
          <img
            src={LOGO_URL}
            alt="MyIslam"
            className="relative w-28 h-28 rounded-full shadow-2xl animate-float"
          />
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 w-full max-w-md">
        <div
          key={slide.id}
          className="w-full text-center animate-fade-in"
        >
          {/* Slide 2 — Feature Icons */}
          {slide.id === 2 && slide.features && (
            <div className="grid grid-cols-2 gap-4 mb-8">
              {slide.features.map((feature) => (
                <div
                  key={feature.label}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  <span className="text-sm font-semibold text-white/90">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {slide.title}
          </h2>
          <p className="text-sm font-medium text-amber-400/90 mb-4 tracking-wide uppercase">
            {slide.subtitle}
          </p>
          <p className="text-[15px] leading-relaxed text-white/60 max-w-[280px] mx-auto">
            {slide.description}
          </p>
        </div>
      </div>

      {/* Bottom Section: Dots + Button */}
      <div className="w-full px-8 pb-12 flex flex-col items-center gap-8">
        {/* Dots */}
        <div className="flex items-center gap-2.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-amber-400"
                  : "w-2 bg-white/25 hover:bg-white/40"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* CTA Button */}
        {slide.id === 3 ? (
          <button
            onClick={goToNext}
            className="w-full max-w-[280px] h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2"
          >
            Get Started
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={goToNext}
            className="w-full max-w-[280px] h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-lg shadow-lg shadow-amber-500/25 active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2"
          >
            Continue
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Subtle decorative elements */}
      <div className="absolute top-1/4 -left-16 w-32 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-40 h-40 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};

export default OnboardingScreen;
