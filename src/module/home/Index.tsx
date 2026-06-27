import React, { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import QiblahCompass from "@/components/home/QiblahCompass";
import MIAAssistant from "@/components/home/MIAAssistant";
import IslamicCalendar from "@/components/home/IslamicCalendar";
import QuickShortcuts from "@/components/home/QuickShortcuts";
import ProgressTracker from "@/components/home/ProgressTracker";
import IslamicFeed from "@/components/home/IslamicFeed";
import CommunityFeed from "@/components/community/CommunityFeed";
import PrayerTopBar from "@/components/home/PrayerTopBar";
import DailyCards from "@/components/home/DailyCards";
import { Sparkles, Menu, ChevronDown, ChevronRight, Home, Clock, Compass, BookOpen, Calendar, Hand, Heart, MapPin, LogIn, User, BookMarked, Star, ScrollText, Feather } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { type User as UserType } from "@supabase/supabase-js";
import { useMIAChat } from "@/hooks/useMIAChat";

const LOGO_URL = "/__l5e/assets-v1/4e726eb6-b18f-4122-bd0f-db8e93e45e65/myislam-logo.png";

// WebView Modal for Daily Discover
const WebViewModal: React.FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => (
  <div className="fixed inset-0 z-[999] flex flex-col bg-black">
    <div className="flex items-center justify-between px-4 py-3 bg-indigo-900/90 backdrop-blur-md">
      <span className="text-white text-sm font-medium truncate flex-1">Daily Discover</span>
      <button
        onClick={onClose}
        className="ml-3 px-3 py-1 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition"
      >
        Close
      </button>
    </div>
    <iframe
      src={url}
      className="flex-1 w-full border-none"
      title="Daily Discover"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
    />
  </div>
);

const mainNavItems = [
  { label: "Home", to: "/", icon: Home },
  { label: "Prayer Times", to: "/prayer", icon: Clock },
  { label: "Qiblah", to: "/qiblah", icon: Compass },
  { label: "Quran", to: "/quran", icon: BookOpen },
  { label: "Donate", to: "/donation", icon: Heart },
];

const islamicToolsSubmenu = [
  { label: "Islamic Calendar", to: "/islamic-calendar", icon: Calendar },
  { label: "Duas Library", to: "/duas", icon: BookMarked },
  { label: "Zakat Calculator", to: "/zakat", icon: Hand },
  { label: "Fasting Tracker", to: "/fasting", icon: Heart },
  { label: "Hajj Guide", to: "/hajj", icon: MapPin },
  { label: "Hadith Collection", to: "/hadith", icon: ScrollText },
  { label: "Prophet's Life", to: "/prophet", icon: Star },
  { label: "Dua Categories", to: "/dua-categories", icon: Feather },
];

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [islamicToolsOpen, setIslamicToolsOpen] = useState(false);
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAskMIA = (question: string) => {
    openWithQuestion(question);
  };

  const handleDiscoverClick = (url: string) => {
    setWebViewUrl(url);
  };

  return (
    <>
      {webViewUrl && (
        <WebViewModal url={webViewUrl} onClose={() => setWebViewUrl(null)} />
      )}

      <MobileLayout>
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-indigo-300/20 via-sky-200/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-1/3 -left-24 w-48 h-48 bg-gradient-to-tr from-indigo-400/15 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-1/4 -right-20 w-40 h-40 bg-gradient-to-bl from-sky-300/15 to-transparent rounded-full blur-2xl" />
        </div>

        <div className="relative p-4 space-y-5 pb-8">
          <header className="flex items-center justify-between py-3 animate-fade-in">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="w-11 h-11 rounded-2xl flex items-center justify-center border border-indigo-200 dark:border-indigo-700 bg-white/60 dark:bg-white/5 backdrop-blur-md hover:border-indigo-400 active:scale-95 transition-all shadow-sm"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5 text-indigo-700 dark:text-indigo-300" strokeWidth={2.2} />
                </button>
              </SheetTrigger>

              <SheetContent side="left" className="w-72 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-r border-indigo-100 dark:border-indigo-900">
                <div className="flex items-center gap-3 mb-6 mt-2">
                  <img src={LOGO_URL} alt="MyIslam" className="w-10 h-10 rounded-xl" />
                  <div>
                    <p className="font-bold text-indigo-900 dark:text-white">My Islam</p>
                    <p className="text-xs text-indigo-400">Assalamu Alaikum 🌙</p>
                  </div>
                </div>

                <nav className="flex flex-col gap-1">
                  {mainNavItems.map((item) => (
                    <button
                      key={item.to}
                      onClick={() => navigate(item.to)}
                      className="text-left px-3 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-3 transition-colors"
                    >
                      <item.icon className="w-4 h-4 text-indigo-500" />
                      {item.label}
                    </button>
                  ))}

                  {/* Islamic Tools dropdown with submenu */}
                  <div>
                    <button
                      onClick={() => setIslamicToolsOpen(!islamicToolsOpen)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-3 transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span className="flex-1">Islamic Tools</span>
                      {islamicToolsOpen
                        ? <ChevronDown className="w-4 h-4 text-indigo-400" />
                        : <ChevronRight className="w-4 h-4 text-indigo-400" />
                      }
                    </button>

                    {islamicToolsOpen && (
                      <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l-2 border-indigo-100 dark:border-indigo-800 pl-3 max-h-64 overflow-y-auto">
                        {islamicToolsSubmenu.map((item) => (
                          <button
                            key={item.to}
                            onClick={() => navigate(item.to)}
                            className="text-left px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-3 transition-colors"
                          >
                            <item.icon className="w-3.5 h-3.5 text-indigo-400" />
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(user ? "/profile" : "/auth")}
                    className="text-left px-3 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-3 transition-colors mt-2 border-t border-indigo-50 dark:border-indigo-900 pt-3"
                  >
                    {user ? <User className="w-4 h-4 text-indigo-500" /> : <LogIn className="w-4 h-4 text-indigo-500" />}
                    {user ? "Profile" : "Sign In"}
                  </button>
                </nav>
              </SheetContent>
            </Sheet>
          </header>

          <PrayerTopBar />
          <QuickShortcuts />
          <DailyCards />
          <IslamicFeed onArticleClick={handleDiscoverClick} />
          <div id="progress-tracker"><ProgressTracker /></div>
          <IslamicCalendar onAskMIA={handleAskMIA} />
          <CommunityFeed />

          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 shadow-lg shadow-indigo-300/40 flex items-center justify-center text-white hover:scale-105 transition-transform"
              aria-label="Open MIA Assistant"
            >
              <Sparkles className="w-6 h-6" />
            </button>
          )}

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
    </>
  );
};

export default Index;
