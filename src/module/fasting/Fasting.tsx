import React, { useState, useEffect, useMemo } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import {
  ArrowLeft,
  Moon,
  CheckCircle,
  Info,
  UtensilsCrossed,
  MapPin,
  Clock,
  CalendarDays,
  Star,
  Sunrise,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { type User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useSharedLocation } from "@/context/useSharedLocation";
// RamadanCountdown temporarily hidden — will return ~1 month before next Ramadan
// import RamadanCountdown from "@/components/home/RamadanCountdown";
import RamadanTracker from "@/components/fasting/RamadanTracker";

// ─── Hijri helpers ────────────────────────────────────────────────────────────
const HIJRI_MONTH_NAMES = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhul Qadah",
  "Dhul Hijjah",
];

interface HijriInfo {
  day: number;
  month: number; // 1-based
  year: number;
  weekday: number; // 0=Sun … 6=Sat
}

const toHijri = (date: Date): HijriInfo => {
  // Convert Gregorian → Hijri using the standard algorithmic method
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  // Julian Day Number
  const jdn =
    Math.floor((1461 * (y + 4800 + Math.floor((m - 14) / 12))) / 4) +
    Math.floor((367 * (m - 2 - 12 * Math.floor((m - 14) / 12))) / 12) -
    Math.floor(
      (3 * Math.floor((y + 4900 + Math.floor((m - 14) / 12)) / 100)) / 4,
    ) +
    d -
    32075;

  // Hijri from JDN (Umalqura-compatible shift)
  const L = jdn - 1948440 + 10632;
  const N = Math.floor((L - 1) / 10631);
  const L2 = L - 10631 * N + 354;
  const J =
    Math.floor((10985 - L2) / 5316) * Math.floor((50 * L2) / 17719) +
    Math.floor(L2 / 5670) * Math.floor((43 * L2) / 15238);
  const L3 =
    L2 -
    Math.floor((30 - J) / 15) * Math.floor((17719 * J) / 50) -
    Math.floor(J / 16) * Math.floor((15238 * J) / 43) +
    29;
  const month = Math.floor((24 * L3) / 709);
  const day = L3 - Math.floor((709 * month) / 24);
  const year = 30 * N + J - 30;

  return { day, month, year, weekday: date.getDay() };
};

// ─── Sunnah fasting days ──────────────────────────────────────────────────────
//  Returns a list of upcoming Sunnah fast days as { label, gregorianDate }
const getNextSunnahFastDays = (
  now: Date,
  count = 5,
): { label: string; date: Date; arabicLabel: string }[] => {
  const results: { label: string; date: Date; arabicLabel: string }[] = [];
  const cursor = new Date(now);

  // Always start from tomorrow to avoid showing today as "next"
  cursor.setDate(cursor.getDate() + 1);
  cursor.setHours(0, 0, 0, 0);

  for (let safety = 0; safety < 365 && results.length < count; safety++) {
    const h = toHijri(cursor);
    const dow = cursor.getDay(); // 0=Sun,1=Mon,...,5=Fri,6=Sat

    let label = "";
    let arabicLabel = "";

    // Monday (1) or Thursday (4)
    if (dow === 1) {
      label = "Monday";
      arabicLabel = "الاثنين";
    } else if (dow === 4) {
      label = "Thursday";
      arabicLabel = "الخميس";
    }
    // White Days: 13th, 14th, 15th of any Hijri month
    else if (h.day === 13 || h.day === 14 || h.day === 15) {
      label = `White Day (${h.day} ${HIJRI_MONTH_NAMES[h.month - 1]})`;
      arabicLabel = `أيام البيض — ${h.day}`;
    }
    // Day of Arafah (9 Dhul Hijjah) — non-pilgrims
    else if (h.month === 12 && h.day === 9) {
      label = "Day of Arafah (9 Dhul Hijjah)";
      arabicLabel = "يوم عرفة";
    }
    // Ashura (10 Muharram)
    else if (h.month === 1 && h.day === 10) {
      label = "Ashura (10 Muharram)";
      arabicLabel = "يوم عاشوراء";
    }

    if (label) results.push({ label, date: new Date(cursor), arabicLabel });
    cursor.setDate(cursor.getDate() + 1);
  }
  return results;
};

// ─── Countdown helper ─────────────────────────────────────────────────────────
const countdown = (to: Date): string => {
  const diff = to.getTime() - Date.now();
  if (diff <= 0) return "Today";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m`;
};

const weekdayName = (d: Date) =>
  d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

// ─── Fasting guide data ────────────────────────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────────────────────
const Fasting: React.FC = () => {
  const navigate = useNavigate();
  const { location: sharedLocation } = useSharedLocation();

  // Auth
  const [user, setUser] = useState<User | null>(null);

  // Ramadan detection
  const [hijriInfo, setHijriInfo] = useState<HijriInfo | null>(null);
  const [location, setLocation] = useState<{
    city: string;
    country: string;
  } | null>(null);
  const [locationLoading, setLocLoad] = useState(true);
  const [now, setNow] = useState(new Date());

  // Tracker (only active during Ramadan)
  const [todayFasted, setTodayFasted] = useState(false);
  const [fastingDays, setFastingDays] = useState(0);

  // Live clock tick
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Auth listener
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setUser(session?.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) =>
      setUser(session?.user ?? null),
    );
    return () => subscription.unsubscribe();
  }, []);

  // Get Hijri date + location (reuse prayer-times API with GPS)
  useEffect(() => {
    if (!sharedLocation) return;

    const fetchData = async (lat: number, lon: number) => {
      try {
        // Location name
        const geoRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
        );
        const geoData = await geoRes.json();
        setLocation({
          city: geoData.city || geoData.locality || "Your city",
          country: geoData.countryName || "",
        });

        // Hijri date from prayer API (reliable)
        const ts = Math.floor(Date.now() / 1000);
        const pRes = await fetch(
          `https://api.aladhan.com/v1/timings/${ts}?latitude=${lat}&longitude=${lon}&method=2`,
        );
        const pData = await pRes.json();
        if (pData.code === 200) {
          const h = pData.data.date.hijri;
          setHijriInfo({
            day: parseInt(h.day),
            month: parseInt(h.month.number),
            year: parseInt(h.year),
            weekday: now.getDay(),
          });
        }
      } catch {
        // Fallback: compute Hijri locally
        setHijriInfo(toHijri(now));
      } finally {
        setLocLoad(false);
      }
    };

    if (sharedLocation.city || sharedLocation.country) {
      setLocation({
        city: sharedLocation.city || "Your city",
        country: sharedLocation.country || "",
      });
    }

    void fetchData(sharedLocation.latitude, sharedLocation.longitude);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedLocation?.latitude, sharedLocation?.longitude]);

  // Derived: is it Ramadan?
  const isRamadan = hijriInfo?.month === 9;

  // Next Sunnah fasting days (shown outside Ramadan)
  const todayStr = now.toDateString();
  const nextFastDays = useMemo(
    () => getNextSunnahFastDays(now, 5),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayStr], // todayStr changes once per day — intentional proxy for `now`
  );

  // Ramadan tracking toggle
  const toggleFasting = async () => {
    if (!user) {
      toast.error("Please sign in to track your fasting");
      navigate("/auth");
      return;
    }
    const wasFasted = todayFasted;
    setTodayFasted(!wasFasted);
    setFastingDays((prev) => (wasFasted ? prev - 1 : prev + 1));
    toast.success(
      wasFasted ? "Fasting unmarked" : "MashaAllah! Fast recorded 🌙",
    );
  };

  // ── Render ──
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
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gradient-gold">
              Sawm (Fasting)
            </h1>
            <p className="text-xs text-muted-foreground">
              Fourth Pillar of Islam
            </p>
          </div>
          {/* Location chip */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {locationLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <MapPin className="w-3 h-3" />
                <span>{location?.city || "—"}</span>
              </>
            )}
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════
            RAMADAN MODE — full features
        ════════════════════════════════════════════════════════ */}
        {isRamadan ? (
          <>
            {/* Tracker Card */}
            <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Moon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gradient-gold">
                      Ramadan Tracker
                    </h2>
                    <p className="text-xs text-primary-foreground/70">
                      {hijriInfo?.day} {HIJRI_MONTH_NAMES[8]} {hijriInfo?.year}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gradient-gold">
                    {fastingDays}
                  </p>
                  <p className="text-xs text-primary-foreground/60">
                    Days Fasted
                  </p>
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
                    Alhamdulillah — Fasted Today
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 mr-2" />
                    Mark Today as Fasted
                  </>
                )}
              </Button>
            </div>

            {/* Ramadan Countdown — hidden until ~1 month before next Ramadan */}
            {/* <RamadanCountdown /> */}

            {/* Native Ramadan Tracker with Location-Based Times */}
            <RamadanTracker />

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
                  {rewardedActions.map((action, i) => (
                    <li
                      key={i}
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
                  {thingsToAvoid.map((item, i) => (
                    <li
                      key={i}
                      className="text-xs text-foreground flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          /* ═══════════════════════════════════════════════════════
              OFF-RAMADAN MODE — Next Sunnah Fast Day countdown
          ════════════════════════════════════════════════════════ */
          <>
            {/* Hijri status banner */}
            <div className="glass rounded-3xl p-5 border border-primary/10 shadow-card overflow-hidden relative">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-indigo-500/10 blur-2xl rounded-full" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Moon className="w-7 h-7 text-white" />
                </div>
                <div>
                  {locationLoading ? (
                    <p className="text-sm text-muted-foreground">
                      Detecting location…
                    </p>
                  ) : (
                    <>
                      <h2 className="font-bold text-foreground">
                        {hijriInfo
                          ? `${hijriInfo.day} ${HIJRI_MONTH_NAMES[hijriInfo.month - 1]} ${hijriInfo.year} AH`
                          : "Loading Hijri date…"}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Ramadan begins in month 9 · currently month{" "}
                        {hijriInfo?.month ?? "—"}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/40">
                <p className="text-xs text-muted-foreground text-center">
                  Fasting features are fully active during{" "}
                  <span className="text-primary font-semibold">
                    Ramadan (month 9)
                  </span>
                  . Outside Ramadan, keep your Iman strong with Sunnah fasts
                  below 👇
                </p>
              </div>
            </div>

            {/* Ramadan countdown — hidden until ~1 month before next Ramadan */}
            {/* <RamadanCountdown /> */}

            {/* Next Sawm Days */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Your Next Sunnah Fasts
                </h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{location?.city || "locating…"}</span>
                </div>
              </div>
              <div className="space-y-3">
                {nextFastDays.map((fd, i) => {
                  const isNext = i === 0;
                  const diffMs = fd.date.getTime() - now.getTime();
                  const diffDays = Math.ceil(diffMs / 86400000);
                  return (
                    <div
                      key={i}
                      className={`glass rounded-2xl p-4 border transition-all duration-300 ${
                        isNext
                          ? "border-primary/40 shadow-soft"
                          : "border-primary/10"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shadow flex-shrink-0 ${
                            isNext
                              ? "bg-gradient-to-br from-amber-400 to-orange-500"
                              : "bg-muted/60"
                          }`}
                        >
                          {fd.label.startsWith("White") ? (
                            <Star
                              className={`w-5 h-5 ${isNext ? "text-white" : "text-muted-foreground"}`}
                            />
                          ) : fd.label.includes("Arafah") ? (
                            <Sunrise
                              className={`w-5 h-5 ${isNext ? "text-white" : "text-muted-foreground"}`}
                            />
                          ) : (
                            <Moon
                              className={`w-5 h-5 ${isNext ? "text-white" : "text-muted-foreground"}`}
                            />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-foreground">
                              {fd.label}
                            </p>
                            {isNext && (
                              <span className="text-[10px] gradient-accent text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                                Next
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {weekdayName(fd.date)}
                          </p>
                        </div>

                        {/* Countdown */}
                        <div className="text-right flex-shrink-0">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span
                              className={isNext ? "text-primary font-bold" : ""}
                            >
                              {diffDays === 1 ? "Tomorrow" : `${diffDays} days`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* How to Fast Guide (always visible) */}
            <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-5 h-5 text-islamic-gold" />
                <h3 className="text-lg font-bold text-gradient-gold">
                  How to Fast
                </h3>
              </div>
              <div className="space-y-3">
                {fastingGuide.map((step, i) => (
                  <div
                    key={i}
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
          </>
        )}

        {/* Types of Fasting — always shown */}
        <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
          <h3 className="text-lg font-bold text-gradient-gold mb-4">
            Types of Fasting
          </h3>
          <div className="space-y-3">
            {[
              {
                name: "Ramadan (Obligatory)",
                desc: "Required for all able Muslims during the month of Ramadan",
                badge: isRamadan ? "🟢 Active Now" : null,
              },
              {
                name: "Voluntary Fasting (Sunnah)",
                desc: "Mondays & Thursdays, White Days (13th–15th), Ashura, Arafah",
                badge: !isRamadan ? "🟢 Available Now" : null,
              },
              {
                name: "Makeup Fasts (Qada)",
                desc: "Making up missed Ramadan fasts before next Ramadan",
                badge: null,
              },
            ].map((t, i) => (
              <div key={i} className="p-3 bg-primary/5 rounded-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-foreground">
                    {t.name}
                  </h4>
                  {t.badge && (
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                      {t.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
              </div>
            ))}
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
            neither indulge in obscene language nor raise his voice." (Bukhari)
          </p>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Fasting;
