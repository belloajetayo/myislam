import React, { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import QiblahCompass from "@/components/home/QiblahCompass";
import MIAAssistant from "@/components/home/MIAAssistant";
import IslamicCalendar from "@/components/home/IslamicCalendar";
import QuickShortcuts from "@/components/home/QuickShortcuts";
import ProgressTracker from "@/components/home/ProgressTracker";
import DailyReminders from "@/components/home/DailyReminders";
import DailyTeachingsCarousel from "@/components/home/DailyTeachingsCarousel";

import CommunityFeed from "@/components/community/CommunityFeed";
// RamadanCountdown temporarily hidden — will reappear ~1 month before next Ramadan
// import RamadanCountdown from "@/components/home/RamadanCountdown";
import { User as UserIcon, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { type User } from "@supabase/supabase-js";

import { toast } from "sonner";
import { useMIAChat } from "@/hooks/useMIAChat";
import OnboardingScreen, { hasSeenOnboarding } from "@/components/onboarding/OnboardingScreen";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(() => !hasSeenOnboarding());
  const {
    messages,
    isLoading,
    isOpen,
    setIsOpen,
    sendMessage,
    clearMessages,
    openWithQuestion,
  } = useMIAChat();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAskMIA = (question: string) => {
    openWithQuestion(question);
  };

  return (
    <>
      {showOnboarding && (
        <OnboardingScreen onComplete={() => setShowOnboarding(false)} />
      )}
      <MobileLayout>
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-24 w-48 h-48 bg-gradient-to-tr from-islamic-gold/15 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 -right-20 w-40 h-40 bg-gradient-to-bl from-secondary/15 to-transparent rounded-full blur-2xl" />
      </div>

      <div className="relative p-4 space-y-5 pb-8">
        {/* Header — minimal, menu only */}
        <header className="flex items-center justify-between py-3 animate-fade-in">
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="w-11 h-11 glass rounded-2xl flex items-center justify-center border border-border hover:border-primary/30 active:scale-95 transition-all"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-foreground" strokeWidth={2.2} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex items-center gap-3 mb-6 mt-2">
                <img src={LOGO_URL} alt="MyIslam" className="w-10 h-10 rounded-xl" />
                <div>
                  <p className="font-bold text-foreground">My Islam</p>
                  <p className="text-xs text-muted-foreground">Assalamu Alaikum</p>
                </div>
              </div>
              <nav className="flex flex-col gap-1">
                {[
                  { label: "Home", to: "/" },
                  { label: "Prayer Times", to: "/prayer" },
                  { label: "Qiblah", to: "/qiblah" },
                  { label: "Quran", to: "/quran" },
                  { label: "Fasting", to: "/fasting" },
                  { label: "Zakat", to: "/zakat" },
                  { label: "Hajj", to: "/hajj" },
                  { label: "Donate", to: "/donate" },
                  { label: user ? "Profile" : "Sign In", to: user ? "/profile" : "/auth" },
                ].map((item) => (
                  <button
                    key={item.to}
                    onClick={() => navigate(item.to)}
                    className="text-left px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium text-foreground"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </header>


        {/* Ramadan Countdown — hidden until ~1 month before next Ramadan */}
        {/* <RamadanCountdown /> */}

        {/* Quick Shortcuts */}
        <QuickShortcuts />

        {/* Daily Reminders */}
        <DailyReminders />

        {/* AI-Generated Daily Teachings */}
        <DailyTeachingsCarousel />

        {/* Progress Tracker */}
        <div id="progress-tracker">
          <ProgressTracker />
        </div>

        {/* Islamic Calendar with AI Sync */}
        <IslamicCalendar onAskMIA={handleAskMIA} />

        {/* Community Feed - AI Generated Posts */}
        <CommunityFeed />

        {/* MIA Floating Button */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg flex items-center justify-center text-primary-foreground hover:scale-105 transition-transform"
            aria-label="Open MIA Assistant"
          >
            <Sparkles className="w-6 h-6" />
          </button>
        )}

        {/* MIA Assistant Panel */}
        <MIAAssistant
          messages={messages}
          isLoading={isLoading}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSendMessage={sendMessage}
          onClearMessages={clearMessages}
        />
      </div>
    </MobileLayout>
  </>);
};

export default Index;
