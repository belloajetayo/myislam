import React, { useState, useMemo } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Bell,
  BellRing,
  Check,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePrayerTimes, useNotifications } from "@/hooks/usePrayerTimes";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useProgress } from "@/hooks/useProgress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const prayerConfig = [
  { name: "Fajr", arabic: "الفجر", color: "from-indigo-500 to-purple-600" },
  { name: "Sunrise", arabic: "الشروق", color: "from-orange-400 to-pink-500" },
  { name: "Dhuhr", arabic: "الظهر", color: "from-amber-400 to-orange-500" },
  { name: "Asr", arabic: "العصر", color: "from-cyan-400 to-blue-500" },
  { name: "Maghrib", arabic: "المغرب", color: "from-purple-400 to-pink-500" },
  { name: "Isha", arabic: "العشاء", color: "from-blue-600 to-indigo-700" },
];

const Prayer: React.FC = () => {
  const navigate = useNavigate();
  const {
    prayerTimes,
    location,
    hijriDate,
    loading,
    currentPrayer,
    nextPrayer,
  } = usePrayerTimes();
  const { notificationsEnabled, toggleNotifications } =
    useNotifications(prayerTimes);
  const { isSubscribed: pushEnabled, isSupported: pushSupported, isLoading: pushLoading, toggle: togglePush } =
    usePushNotifications();
  const todayKey = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const { progress, togglePrayer: toggleGlobalPrayer } = useProgress();
  const [testLoading, setTestLoading] = useState(false);

  const handleSendTestNotification = async () => {
    try {
      setTestLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("Please sign in to test notifications.");
        navigate("/auth");
        return;
      }

      const response = await fetch(
        "https://lhdksrflshusknopsrzz.supabase.co/functions/v1/send-prayer-push",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZGtzcmZsc2h1c2tub3Bzcnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NjEzMTMsImV4cCI6MjA4MTIzNzMxM30.ojA3qY26fY9zGFR55EuaDOX0ZClleccwH6y71KdovAg"
          },
          body: JSON.stringify({
            is_test: true,
            user_id: session.user.id,
          }),
        }
      );

      const result = await response.json();
      if (response.ok && result.sent > 0) {
        toast.success("Test notification sent! Check your device.");
      } else {
        toast.error(result.message || "Failed to send test notification. Make sure your browser has notifications enabled.");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while sending the test notification.");
    } finally {
      setTestLoading(false);
    }
  };

  // Generate week days and dates centered on today
  const { weekDays, dates, dateKeys } = useMemo(() => {
    const today = new Date();
    const days: string[] = [];
    const dateNums: number[] = [];
    const keys: string[] = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d.toLocaleDateString("en-US", { weekday: "short" }));
      dateNums.push(d.getDate());
      keys.push(d.toISOString().split("T")[0]);
    }
    return { weekDays: days, dates: dateNums, dateKeys: keys };
  }, []);

  const togglePrayed = (name: string) => {
    if (selectedDate === todayKey) {
      toggleGlobalPrayer(name);
    } else {
      toast.info("You can only track prayers for today.");
    }
  };

  // Format time to 12-hour format – strip optional timezone suffix e.g. "05:30 (+05:00)"
  const formatTime = (time24: string) => {
    const clean = time24.split(" ")[0]; // take only "HH:MM"
    const [hours, minutes] = clean.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Get prayers with real times
  const prayers = prayerConfig.map((p) => ({
    ...p,
    time: prayerTimes
      ? formatTime(prayerTimes[p.name as keyof typeof prayerTimes])
      : "--:--",
    current: p.name === currentPrayer,
  }));

  // Calculate time until next prayer – strip timezone suffix from API time value
  const getTimeUntilNext = () => {
    if (!prayerTimes || !nextPrayer) return "";
    const now = new Date();
    const nextTime = prayerTimes[nextPrayer as keyof typeof prayerTimes];
    if (!nextTime) return "";
    const clean = nextTime.split(" ")[0]; // strip "(+05:00)" suffix
    const [hours, minutes] = clean.split(":").map(Number);
    const nextDate = new Date();
    nextDate.setHours(hours, minutes, 0, 0);
    if (nextDate < now) nextDate.setDate(nextDate.getDate() + 1);
    const diff = nextDate.getTime() - now.getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <header className="flex items-center gap-4 py-2 animate-fade-in">
          <button
            onClick={() => navigate("/")}
            aria-label="Back to home"
            className="w-10 h-10 glass rounded-2xl flex items-center justify-center border border-islamic-gold/40 bg-background/40 shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-islamic-gold" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gradient-gold">
              Prayer Times
            </h1>
            <div className="flex items-center gap-1 text-gradient-gold opacity-80">
              <MapPin className="w-3 h-3" />
              <span className="text-xs truncate">
                {loading
                  ? "Locating..."
                  : location
                    ? `${location.city}, ${location.country}`
                    : "Unknown Location"}
              </span>
            </div>
          </div>
          <button
            aria-label={pushEnabled || notificationsEnabled ? "Disable prayer notifications" : "Enable prayer notifications"}
            onClick={async () => {
              if (pushSupported) {
                const result = await togglePush();
                if (result) {
                  toast.success(
                    pushEnabled
                      ? "Push notifications disabled."
                      : "Push notifications enabled! You'll be reminded even when the browser is closed.",
                  );
                } else if (Notification.permission === "denied") {
                  toast.error("Notifications are blocked. Please enable them in your browser settings.");
                }
              } else {
                const enabled = await toggleNotifications();
                if (enabled === null || enabled === undefined) return;
                if (enabled) {
                  toast.success("Prayer notifications enabled!");
                } else if (enabled === false && Notification.permission === "denied") {
                  toast.error("Notifications are blocked. Please enable them in your browser settings.");
                } else {
                  toast.info("Prayer notifications disabled.");
                }
              }
            }}
            disabled={pushLoading}
            className={`w-10 h-10 glass rounded-2xl flex items-center justify-center border transition-colors duration-300 shrink-0 ${
              pushEnabled || notificationsEnabled
                ? "border-islamic-gold/60 bg-islamic-gold/15"
                : "border-islamic-gold/40 bg-background/40"
            }`}
          >
            {pushLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-islamic-gold" />
            ) : pushEnabled ? (
              <BellRing className="w-5 h-5 text-islamic-gold" />
            ) : (
              <Bell className={`w-5 h-5 ${notificationsEnabled ? "text-islamic-gold" : "text-islamic-gold"}`} />
            )}
          </button>
        </header>

        {/* Date Selector */}
        <div className="glass rounded-3xl p-4 shadow-card border border-primary/10 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <button className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {hijriDate
                  ? `${hijriDate.month.en} ${hijriDate.year}`
                  : "Loading..."}
              </p>
            </div>
            <button className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          </div>

          <div className="flex justify-between">
            {weekDays.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(dateKeys[index])}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all duration-300 ${
                  dateKeys[index] === selectedDate
                    ? "gradient-primary shadow-soft"
                    : "hover:bg-muted/50"
                }`}
              >
                <span
                  className={`text-[10px] ${dateKeys[index] === selectedDate ? "text-primary-foreground" : "text-muted-foreground"}`}
                >
                  {day}
                </span>
                <span
                  className={`text-sm font-semibold ${dateKeys[index] === selectedDate ? "text-primary-foreground" : "text-foreground"}`}
                >
                  {dates[index]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Prayer Highlight */}
        <div
          className="gradient-accent rounded-3xl p-5 shadow-glow animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary-foreground" />
              <span className="ml-2 text-primary-foreground">
                Getting precise location...
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 text-xs">
                  Current Prayer
                </p>
                <h2 className="text-2xl font-bold text-primary-foreground">
                  {currentPrayer || "--"}
                </h2>
                <p className="text-primary-foreground/90 font-arabic text-lg">
                  {prayerConfig.find((p) => p.name === currentPrayer)?.arabic ||
                    ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary-foreground">
                  {prayerTimes && currentPrayer
                    ? formatTime(
                        prayerTimes[currentPrayer as keyof typeof prayerTimes],
                      )
                    : "--:--"}
                </p>
                <p className="text-primary-foreground/80 text-xs">
                  Next: {nextPrayer} in {getTimeUntilNext()}
                </p>
              </div>
            </div>
          )}
        </div>

        {pushSupported && pushEnabled && (
          <div className="glass rounded-3xl p-4 border border-islamic-gold/20 bg-islamic-gold/5 flex items-center justify-between animate-slide-up">
            <div className="flex-1 pr-2">
              <h4 className="font-semibold text-foreground text-sm">
                Test Push Notification
              </h4>
              <p className="text-xs text-muted-foreground">
                Instantly trigger a test notification to verify your device setup.
              </p>
            </div>
            <button
              onClick={handleSendTestNotification}
              disabled={testLoading}
              className="gradient-accent text-primary-foreground font-semibold px-4 py-2.5 rounded-2xl text-xs shadow-soft hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 shrink-0"
            >
              {testLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Send Test"
              )}
            </button>
          </div>
        )}

        {/* Prayer List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gradient-gold">
            All Prayers
          </h3>
          {prayers.map((prayer, index) => {
            const isPrayed =
              selectedDate === todayKey
                ? progress.prayersCompleted.includes(prayer.name)
                : false;

            return (
              <div
                key={index}
                className={`glass rounded-2xl p-4 border transition-all duration-300 animate-slide-up ${
                  prayer.current
                    ? "border-primary/30 shadow-soft"
                    : "border-primary/10"
                }`}
                style={{ animationDelay: `${0.15 + index * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${prayer.color} flex items-center justify-center shadow-soft`}
                  >
                    <span className="text-primary-foreground font-arabic text-lg">
                      {prayer.arabic.charAt(0)}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">
                        {prayer.name}
                      </h4>
                      {prayer.current && (
                        <span className="text-[10px] gradient-accent text-primary-foreground px-2 py-0.5 rounded-full">
                          Now
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-arabic">
                      {prayer.arabic}
                    </p>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <span className="font-semibold text-foreground">
                      {prayer.time}
                    </span>
                    <button
                      onClick={() => togglePrayed(prayer.name)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isPrayed
                          ? "bg-islamic-green text-white"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Prayer;
