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

import { Sparkles, Menu, ChevronDown, ChevronRight, Home, Clock, Compass, BookOpen, Calendar, Hand, Heart, MapPin, LogIn, User, BookMarked, Star, ScrollText, Feather, Headphones } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { type User as UserType } from "@supabase/supabase-js";
import { useMIAChat } from "@/hooks/useMIAChat";
import { useMIAProactive } from "@/hooks/useMIAProactive";
import {
  getCurrentPrayerCheck,
  markPrayerAnswered,
  postSalahDuas,
  gentleGoPrayNudge,
  consultationOpener,
  getUserName,
  capitalizePrayer,
} from "@/lib/miaProactive";


const NAV_COLORS = [
  "from-indigo-500 to-blue-500",
  "from-blue-500 to-cyan-500",
  "from-cyan-500 to-teal-500",
  "from-violet-500 to-indigo-500",
  "from-rose-500 to-pink-500",
];

const SUB_COLORS = [
  "from-teal-400 to-emerald-500",
  "from-sky-400 to-blue-500",
  "from-violet-400 to-purple-500",
  "from-rose-400 to-pink-500",
  "from-amber-400 to-yellow-500",
  "from-green-400 to-teal-500",
  "from-indigo-400 to-violet-500",
  "from-cyan-400 to-sky-500",
  "from-fuchsia-400 to-pink-500",
];

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
  { label: "Podcasts", to: "/podcasts", icon: Headphones },
];

const Index: React.FC = () => { // v5
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
    injectAssistantMessage,
    unreadCount,
  } = useMIAChat();

  const { pending, message: proactive, markSeen } = useMIAProactive();
  const totalUnread = unreadCount + (pending ? 1 : 0);

  const [prayerCheck, setPrayerCheck] = useState<{ name: string } | null>(null);

  // On mount: check if there's a current prayer we haven't asked about today.
  // If so, auto-open MIA and show the "have you prayed X?" card.
  useEffect(() => {
    const check = getCurrentPrayerCheck();
    if (check) {
      setPrayerCheck(check);
      setIsOpen(true);
      const name = getUserName();
      const greeting = name ? `${name}, ` : '';
      injectAssistantMessage(
        `Assalamu alaikum ${greeting}👋\n\nThe time for **${capitalizePrayer(check.name)}** has entered. Have you prayed yet?`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrayerAnswer = (answer: 'yes' | 'no') => {
    if (!prayerCheck) return;
    markPrayerAnswered(prayerCheck.name, answer);
    if (answer === 'yes') {
      injectAssistantMessage(postSalahDuas(prayerCheck.name));
    } else {
      injectAssistantMessage(gentleGoPrayNudge(prayerCheck.name, getUserName()));
    }
    setPrayerCheck(null);
  };

  const handleStartConsultation = () => {
    injectAssistantMessage(consultationOpener(getUserName()));
  };

  // When the assistant opens with a pending proactive message, seed it as
  // the first assistant reply (no API call) so the user sees MIA's nudge
  // immediately — then mark it seen so the dot clears.
  useEffect(() => {
    if (isOpen && proactive) {
      injectAssistantMessage(`**${proactive.title}**\n\n${proactive.body}`);
      markSeen(proactive.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, proactive?.id]);


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

              <SheetContent side="left" className="w-72 p-0 border-none overflow-hidden">
                {/* Gradient header */}
                <div className="relative px-5 pt-10 pb-6" style={{background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 50%, #0ea5e9 100%)"}}>
                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20" style={{background: "radial-gradient(circle, white, transparent)", transform: "translate(30%, -30%)"}} />
                  <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10" style={{background: "radial-gradient(circle, white, transparent)", transform: "translate(-30%, 30%)"}} />
                  
                  {/* Logo + name */}
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
                      <img src={LOGO_URL} alt="MyIslam" className="w-9 h-9 rounded-xl" />
                    </div>
                    <div>
                      <p className="font-black text-white text-lg tracking-tight">MyIslam</p>
                      <p className="text-xs text-blue-100">Assalamu Alaikum 🌙</p>
                    </div>
                  </div>
                </div>

                {/* Nav items */}
                <div className="px-3 py-4 bg-white dark:bg-gray-950 flex flex-col gap-1 overflow-y-auto" style={{maxHeight: "calc(100vh - 160px)"}}>
                  {/* Main items */}
                  {mainNavItems.map((item, idx) => {
                    return (
                      <button
                        key={item.to}
                        onClick={() => navigate(item.to)}
                        className="text-left px-3 py-2.5 rounded-2xl flex items-center gap-3 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 active:scale-95 group"
                      >
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${NAV_COLORS[idx % NAV_COLORS.length]} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0`}>
                          <item.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{item.label}</span>
                      </button>
                    );
                  })}

                  {/* Divider */}
                  <div className="my-2 h-px bg-gradient-to-r from-indigo-100 via-sky-100 to-transparent dark:from-indigo-900 dark:via-sky-900" />

                  {/* Islamic Tools dropdown */}
                  <div>
                    <button
                      onClick={() => setIslamicToolsOpen(!islamicToolsOpen)}
                      className="w-full text-left px-3 py-2.5 rounded-2xl flex items-center gap-3 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 active:scale-95"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm flex-shrink-0">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <span className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-100">Islamic Tools</span>
                      <div className={"w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center transition-transform duration-200 " + (islamicToolsOpen ? "rotate-180" : "")}>
                        <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                    </button>

                    {islamicToolsOpen && (
                      <div className="mt-1 ml-3 pl-3 border-l-2 border-gradient-to-b from-indigo-300 to-sky-300 border-indigo-200 dark:border-indigo-800 flex flex-col gap-0.5 max-h-56 overflow-y-auto">
                        {islamicToolsSubmenu.map((item, idx) => {
                          return (
                            <button
                              key={item.to}
                              onClick={() => navigate(item.to)}
                              className="text-left px-2 py-2 rounded-xl flex items-center gap-2.5 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 active:scale-95 group"
                            >
                              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${SUB_COLORS[idx % SUB_COLORS.length]} flex items-center justify-center shadow-sm flex-shrink-0`}>
                                <item.icon className="w-3.5 h-3.5 text-white" />
                              </div>
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="my-2 h-px bg-gradient-to-r from-indigo-100 via-sky-100 to-transparent dark:from-indigo-900 dark:via-sky-900" />

                  {/* Sign in / Profile */}
                  <button
                    onClick={() => navigate(user ? "/profile" : "/auth")}
                    className="text-left px-3 py-2.5 rounded-2xl flex items-center gap-3 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 active:scale-95"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center shadow-sm flex-shrink-0">
                      {user ? <User className="w-4 h-4 text-white" /> : <LogIn className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{user ? "Profile" : "Sign In"}</span>
                  </button>

                  {/* App version */}
                  <div className="mt-4 mx-2 p-3 rounded-2xl" style={{background: "linear-gradient(135deg, #eef2ff, #e0f2fe)"}}>
                    <p className="text-[10px] font-bold text-indigo-600 text-center">MyIslam App v1.0</p>
                    <p className="text-[9px] text-indigo-400 text-center mt-0.5">Your complete Islamic companion 🕌</p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </header>

          <PrayerTopBar />
          <QuickShortcuts />
          <ProgressTracker />
          <IslamicFeed onArticleClick={handleDiscoverClick} />
          <IslamicCalendar onAskMIA={handleAskMIA} />
          <CommunityFeed />

          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 shadow-lg shadow-indigo-300/40 flex items-center justify-center text-white hover:scale-105 transition-transform"
              aria-label={totalUnread > 0 ? `MIA has ${totalUnread} new message${totalUnread > 1 ? 's' : ''}` : 'Open MIA Assistant'}
            >
              <Sparkles className="w-6 h-6" />
              {totalUnread > 0 && (
                <>
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 ring-2 ring-white shadow-md flex items-center justify-center text-[11px] font-bold text-white">
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </span>
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 rounded-full bg-rose-500 animate-ping opacity-60" />
                </>
              )}
            </button>
          )}

          <MIAAssistant
            messages={messages}
            isLoading={isLoading}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onSendMessage={sendMessage}
            onClearMessages={clearMessages}
            pendingPrayerCheck={prayerCheck}
            onPrayerAnswer={handlePrayerAnswer}
            onStartConsultation={handleStartConsultation}
          />

        </div>
      </MobileLayout>
    </>
  );
};

export default Index;
