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
import { User, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { type User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useMIAChat } from "@/hooks/useMIAChat";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
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
    <MobileLayout>
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-24 w-48 h-48 bg-gradient-to-tr from-islamic-gold/15 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 -right-20 w-40 h-40 bg-gradient-to-bl from-secondary/15 to-transparent rounded-full blur-2xl" />
      </div>

      <div className="relative p-4 space-y-5 pb-8">
        {/* Header */}
        <header className="flex items-center justify-between py-4 animate-fade-in border-b border-border/10">
          {/* Left: Branding & Welcome */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-soft">
              <Sparkles className="w-5 h-5 text-primary animate-pulse-soft" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-gold tracking-tight leading-tight">
                My Islam
              </h1>
              <p className="text-[11px] font-semibold text-muted-foreground/80">
                Assalamu Alaikum
              </p>
            </div>
          </div>

          {/* Right: Action Bar */}
          <div className="flex items-center gap-2">
            <QiblahCompass />
            
            <button
              onClick={() => {
                const tracker = document.getElementById("progress-tracker");
                tracker?.scrollIntoView({ behavior: "smooth" });
              }}
              className="relative w-11 h-11 glass rounded-2xl flex items-center justify-center border border-border hover:border-primary/30 hover:shadow-soft active:scale-95 transition-all duration-200"
              title="Daily Progress"
            >
              <span className="text-lg">📊</span>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
            </button>
            
            {user ? (
              <button
                onClick={() => navigate("/profile")}
                className="w-11 h-11 gradient-primary rounded-2xl flex items-center justify-center shadow-soft hover:shadow-glow active:scale-95 transition-all duration-200"
                title="User Profile"
              >
                <span className="text-xs font-bold text-primary-foreground">
                  {(() => {
                    const name =
                      user.user_metadata?.full_name ||
                      user.user_metadata?.name ||
                      "";
                    if (name.trim())
                      return name
                        .trim()
                        .split(" ")
                        .map((w: string) => w[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();
                    return (user.email?.[0] ?? "U").toUpperCase();
                  })()}
                </span>
              </button>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="w-11 h-11 gradient-primary rounded-2xl flex items-center justify-center shadow-soft hover:shadow-glow active:scale-95 transition-all duration-200"
                title="Sign In"
              >
                <User className="w-5 h-5 text-primary-foreground" />
              </button>
            )}
          </div>
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
  );
};

export default Index;
