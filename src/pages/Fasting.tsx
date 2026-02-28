import React, { useState, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import {
  ArrowLeft,
  Moon,
  CheckCircle,
  Info,
  UtensilsCrossed,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import RamadanCountdown from "@/components/home/RamadanCountdown";
import RamadanTracker from "@/components/fasting/RamadanTracker";

const Fasting: React.FC = () => {
  const navigate = useNavigate();
  const [todayFasted, setTodayFasted] = useState(false);
  const [fastingDays, setFastingDays] = useState(0);
  const [user, setUser] = useState<any>(null);

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

  const toggleFasting = async () => {
    if (!user) {
      toast.error("Please sign in to track your fasting");
      navigate("/auth");
      return;
    }
    const wasFasted = todayFasted;
    setTodayFasted(!wasFasted);
    setFastingDays((prev) => (wasFasted ? prev - 1 : prev + 1));
    toast.success(wasFasted ? "Fasting unmarked" : "MashaAllah! Fast recorded");
  };

  const fastingGuide = [
    {
      title: "Make Intention (Niyyah)",
      description:
        "Make sincere intention before Fajr to fast for the sake of Allah",
      icon: "🌙",
    },
    {
      title: "Eat Suhoor",
      description:
        "Have a pre-dawn meal before Fajr time. The Prophet ﷺ said there is blessing in Suhoor",
      icon: "🍽️",
    },
    {
      title: "Stop at Fajr",
      description: "Stop eating and drinking when Fajr time begins",
      icon: "🌅",
    },
    {
      title: "Continue Your Day",
      description:
        "Abstain from food, drink, and other invalidators until Maghrib",
      icon: "☀️",
    },
    {
      title: "Break Fast at Maghrib",
      description:
        "Break your fast when Maghrib time enters, preferably with dates and water",
      icon: "🌆",
    },
    {
      title: "Make Dua",
      description:
        "Say: 'Dhahaba adh-dhama' wa abtallatil-'urooq wa thabatal-ajru in sha Allah'",
      icon: "🤲",
    },
  ];

  const thingsToAvoid = [
    "Eating or drinking intentionally",
    "Smoking or vaping",
    "Backbiting and lying",
    "Excessive anger",
    "Wasting time on idle talk",
    "Missing prayers",
  ];

  const rewardedActions = [
    "Reading Quran",
    "Praying Taraweeh",
    "Giving charity",
    "Making dhikr",
    "Helping others",
    "Breaking someone's fast",
  ];

  return (
    <MobileLayout showNav={false}>
      <div className="p-4 space-y-6">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center gap-4 py-3 bg-background/95 backdrop-blur-sm border-b border-border/50 -mx-4 px-4 -mt-4 mb-2">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-2xl flex items-center justify-center gradient-primary shadow-soft"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gradient-gold">
              Sawm (Fasting)
            </h1>
            <p className="text-sm text-muted-foreground">
              Fourth Pillar of Islam
            </p>
          </div>
        </header>

        {/* Tracker Card */}
        <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gradient-gold">
                  Fasting Tracker
                </h2>
                <p className="text-xs text-primary-foreground/70">
                  Track your fasting days
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gradient-gold">
                {fastingDays}
              </p>
              <p className="text-xs text-primary-foreground/60">Days Fasted</p>
            </div>
          </div>

          <Button
            onClick={toggleFasting}
            className={`w-full py-5 rounded-xl font-semibold ${
              todayFasted
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "gradient-accent text-primary-foreground"
            }`}
          >
            {todayFasted ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Alhamdulillah - Fasted Today
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 mr-2" />
                Mark Today as Fasted
              </>
            )}
          </Button>
        </div>

        {/* Ramadan Countdown */}
        <RamadanCountdown />

        {/* Native Ramadan Tracker with Location-Based Times */}
        <RamadanTracker />

        {/* How to Fast Guide */}
        <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
          <h3 className="text-lg font-bold text-gradient-gold mb-4">
            How to Fast
          </h3>
          <div className="space-y-3">
            {fastingGuide.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-primary/5 rounded-xl"
              >
                <span className="text-2xl">{step.icon}</span>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {step.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Do's and Don'ts */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-2xl p-4 border border-primary-foreground/10">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-semibold text-gradient-gold">
                Rewarded Actions
              </h4>
            </div>
            <ul className="space-y-2">
              {rewardedActions.map((action, index) => (
                <li
                  key={index}
                  className="text-xs text-foreground flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {action}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-2xl p-4 border border-primary-foreground/10">
            <div className="flex items-center gap-2 mb-3">
              <UtensilsCrossed className="w-4 h-4 text-rose-400" />
              <h4 className="text-sm font-semibold text-gradient-gold">
                Things to Avoid
              </h4>
            </div>
            <ul className="space-y-2">
              {thingsToAvoid.map((item, index) => (
                <li
                  key={index}
                  className="text-xs text-foreground flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Types of Fasting */}
        <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
          <h3 className="text-lg font-bold text-gradient-gold mb-4">
            Types of Fasting
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-primary/5 rounded-xl">
              <h4 className="text-sm font-semibold text-foreground">
                Ramadan (Obligatory)
              </h4>
              <p className="text-xs text-muted-foreground">
                Required for all able Muslims during the month of Ramadan
              </p>
            </div>
            <div className="p-3 bg-primary/5 rounded-xl">
              <h4 className="text-sm font-semibold text-foreground">
                Voluntary Fasting (Sunnah)
              </h4>
              <p className="text-xs text-muted-foreground">
                Mondays & Thursdays, White Days (13th, 14th, 15th), Ashura,
                Arafah
              </p>
            </div>
            <div className="p-3 bg-primary/5 rounded-xl">
              <h4 className="text-sm font-semibold text-foreground">
                Makeup Fasts (Qada)
              </h4>
              <p className="text-xs text-muted-foreground">
                Making up missed Ramadan fasts before next Ramadan
              </p>
            </div>
          </div>
        </div>

        {/* Virtues */}
        <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-islamic-gold" />
            <h3 className="font-semibold text-gradient-gold">
              Virtues of Fasting
            </h3>
          </div>
          <p className="text-sm text-foreground leading-relaxed mb-3">
            The Prophet ﷺ said: "Whoever fasts Ramadan with faith and seeking
            reward, his previous sins will be forgiven." (Bukhari & Muslim)
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            "Fasting is a shield; so when one of you is fasting, he should
            neither indulge in obscene language nor raise his voice. If someone
            attacks him or insults him, let him say: 'I am fasting.'" (Bukhari)
          </p>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Fasting;
