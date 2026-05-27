import React, { useState, useEffect, useRef } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import {
  ArrowLeft,

  Mail,
  Calendar,
  LogOut,
  KeyRound,
  Trash2,
  Flame,
  BookOpen,
  Moon,
  Target,
  Award,
  Shield,
  Star,
  Crown,
  ChevronRight,
  Edit2,
  Check,
  X,
  BookText,
  Compass,
  HandHeart,
  Camera,
  Bell,
  Sun,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { type User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserStats {
  prayersToday: number;
  fastingDays: number;
  quranPages: number;
  streakDays: number;
}

interface UserPrefs {
  showTransliteration: boolean;
  arabicOnly: boolean;
  prayerReminders: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name?: string | null, email?: string | null): string => {
  if (name && name.trim()) {
    return name
      .trim()
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return (email?.[0] ?? "U").toUpperCase();
};

const getGradientFromEmail = (email?: string | null): string => {
  const gradients = [
    "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-500",
    "from-blue-500 to-indigo-600",
    "from-rose-500 to-pink-600",
  ];
  const idx = (email?.charCodeAt(0) ?? 0) % gradients.length;
  return gradients[idx];
};

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return "Unknown";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

// ─── Badges ───────────────────────────────────────────────────────────────────
const BADGES = [
  {
    id: "first_prayer",
    icon: Target,
    label: "First Prayer",
    desc: "Logged your first prayer",
    color: "from-blue-500 to-indigo-600",
    threshold: (s: UserStats) => s.prayersToday >= 1,
  },
  {
    id: "streak_7",
    icon: Flame,
    label: "7-Day Streak",
    desc: "7 days of daily prayers",
    color: "from-orange-500 to-red-500",
    threshold: (s: UserStats) => s.streakDays >= 7,
  },
  {
    id: "streak_30",
    icon: Crown,
    label: "30-Day Streak",
    desc: "30 consecutive days",
    color: "from-amber-400 to-yellow-500",
    threshold: (s: UserStats) => s.streakDays >= 30,
  },
  {
    id: "fasting_3",
    icon: Moon,
    label: "Fasting",
    desc: "Completed 3 fasting days",
    color: "from-purple-500 to-violet-600",
    threshold: (s: UserStats) => s.fastingDays >= 3,
  },
  {
    id: "quran_10",
    icon: BookOpen,
    label: "Quran Reader",
    desc: "Read 10 pages of Quran",
    color: "from-emerald-500 to-teal-600",
    threshold: (s: UserStats) => s.quranPages >= 10,
  },
  {
    id: "devoted",
    icon: Award,
    label: "Devoted",
    desc: "Complete all 5 daily prayers",
    color: "from-rose-500 to-pink-600",
    threshold: (s: UserStats) => s.prayersToday >= 5,
  },
  {
    id: "scholar",
    icon: Star,
    label: "Scholar",
    desc: "Read 50 pages of Quran",
    color: "from-cyan-500 to-blue-500",
    threshold: (s: UserStats) => s.quranPages >= 50,
  },
  {
    id: "guardian",
    icon: Shield,
    label: "Guardian",
    desc: "Used the app for 60 days",
    color: "from-slate-500 to-gray-600",
    threshold: (s: UserStats) => s.streakDays >= 60,
  },
];

const QUICK_LINKS = [
  {
    icon: HandHeart,
    label: "Zakat Calculator",
    sub: "Purify your wealth",
    route: "/zakat",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Compass,
    label: "Hajj Planner",
    sub: "Plan your pilgrimage",
    route: "/hajj",
    color: "from-purple-500 to-violet-600",
  },
  {
    icon: BookText,
    label: "Donate",
    sub: "Support the app",
    route: "/donation",
    color: "from-amber-500 to-orange-500",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [tempName, setTempName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Stats from localStorage
  const [stats, setStats] = useState<UserStats>({
    prayersToday: 0,
    fastingDays: 0,
    quranPages: 0,
    streakDays: 0,
  });

  // Preferences from localStorage
  const [prefs, setPrefs] = useState<UserPrefs>({
    showTransliteration: true,
    arabicOnly: false,
    prayerReminders: true,
  });

  // ── Load user ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      const u = session.user;
      setUser(u);
      const name = u.user_metadata?.full_name || u.user_metadata?.name || "";
      setDisplayName(name);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session?.user) {
        navigate("/auth");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // ── Load stats & prefs from localStorage ──
  useEffect(() => {
    const stored = localStorage.getItem("myislam_stats");
    if (stored) {
      try {
        setStats(JSON.parse(stored));
      } catch (e) {
        console.warn("Failed to parse stats:", e);
      }
    }
    const storedPrefs = localStorage.getItem("myislam_prefs");
    if (storedPrefs) {
      try {
        setPrefs(JSON.parse(storedPrefs));
      } catch (e) {
        console.warn("Failed to parse prefs:", e);
      }
    }
  }, []);

  const savePref = (key: keyof UserPrefs, value: boolean) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    localStorage.setItem("myislam_prefs", JSON.stringify(updated));
    toast.success("Preference saved");
  };

  // ── Edit name ──
  const startEdit = () => {
    setTempName(displayName);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const saveName = async () => {
    const trimmed = tempName.trim();
    if (!trimmed) return;
    const { error } = await supabase.auth.updateUser({
      data: { full_name: trimmed },
    });
    if (error) {
      toast.error("Could not update name");
      return;
    }
    setDisplayName(trimmed);
    setEditingName(false);
    toast.success("Name updated!");
  };

  // ── Sign out ──
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out. Ma'a salama!");
    navigate("/auth");
  };

  // ── Change password ──
  const handleChangePassword = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) {
      toast.error("Failed to send reset email");
      return;
    }
    toast.success("Password reset email sent! Check your inbox.");
  };

  // ── Delete account ──
  const handleDeleteAccount = async () => {
    toast.error("Please contact support to delete your account.");
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  const initials = getInitials(displayName, user?.email);
  const gradient = getGradientFromEmail(user?.email);
  const memberSince = formatDate(user?.created_at);
  const earnedBadges = BADGES.filter((b) => b.threshold(stats));
  const lockedBadges = BADGES.filter((b) => !b.threshold(stats));

  return (
    <MobileLayout showNav={false}>
      <div className="flex flex-col min-h-screen">
        {/* ── Header ── */}
        <header className="sticky top-0 z-10 px-4 pt-4 pb-3 flex items-center gap-3 bg-background/80 backdrop-blur-md border-b border-border/40">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 glass rounded-2xl flex items-center justify-center border border-primary/20"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-gradient-gold flex-1">
            My Profile
          </h1>
        </header>

        <div className="p-4 space-y-5 pb-12">
          {/* ── Hero Card ── */}
          <div className="glass rounded-3xl p-5 border border-primary/15 shadow-card overflow-hidden relative">
            {/* background glow */}
            <div
              className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${gradient} opacity-20 blur-3xl rounded-full`}
            />
            <div className="relative flex items-start gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
                >
                  <span className="text-3xl font-bold text-white">
                    {initials}
                  </span>
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-background shadow">
                  <Camera className="w-3.5 h-3.5 text-primary-foreground" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {/* Name row */}
                {editingName ? (
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      ref={nameInputRef}
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveName()}
                      className="flex-1 bg-muted/60 rounded-lg px-2 py-1 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-0"
                      placeholder="Your name"
                    />
                    <button
                      onClick={saveName}
                      className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center"
                    >
                      <Check className="w-3.5 h-3.5 text-primary-foreground" />
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-foreground truncate">
                      {displayName || "Muslim User"}
                    </h2>
                    <button onClick={startEdit} className="flex-shrink-0">
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-2">
                  <Mail className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Prayers", value: `${stats.prayersToday}/5` },
                { label: "Streak", value: `${stats.streakDays}d` },
                { label: "Fasted", value: `${stats.fastingDays}` },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-lg font-bold text-foreground">
                    {item.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Daily Stats ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Today's Activity
              </h3>
              <Target className="w-4 h-4 text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Prayers Prayed",
                  value: `${stats.prayersToday} / 5`,
                  progress: (stats.prayersToday / 5) * 100,
                  color: "from-blue-500 to-indigo-600",
                  icon: Target,
                },
                {
                  label: "Fasting Days",
                  value: `${stats.fastingDays}`,
                  progress: Math.min((stats.fastingDays / 30) * 100, 100),
                  color: "from-purple-500 to-violet-600",
                  icon: Moon,
                },
                {
                  label: "Quran Pages",
                  value: `${stats.quranPages} pg`,
                  progress: Math.min((stats.quranPages / 20) * 100, 100),
                  color: "from-emerald-500 to-teal-600",
                  icon: BookOpen,
                },
                {
                  label: "Day Streak",
                  value: `${stats.streakDays} days`,
                  progress: Math.min((stats.streakDays / 30) * 100, 100),
                  color: "from-orange-500 to-red-500",
                  icon: Flame,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="glass rounded-2xl p-4 border border-primary/10 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                    >
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-base font-bold text-foreground">
                      {stat.value}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-700`}
                      style={{ width: `${stat.progress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Badges ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Badges
                {earnedBadges.length > 0 && (
                  <span className="ml-2 text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">
                    {earnedBadges.length}/{BADGES.length}
                  </span>
                )}
              </h3>
              <Award className="w-4 h-4 text-primary" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {BADGES.map((badge) => {
                const earned = badge.threshold(stats);
                return (
                  <div
                    key={badge.id}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-300 ${earned
                        ? "glass border-primary/20 shadow-soft"
                        : "bg-muted/30 border-transparent opacity-40"
                      }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${earned
                          ? `bg-gradient-to-br ${badge.color} shadow`
                          : "bg-muted"
                        }`}
                    >
                      <badge.icon
                        className={`w-5 h-5 ${earned ? "text-white" : "text-muted-foreground"}`}
                      />
                    </div>
                    <span className="text-[9px] font-semibold text-center text-foreground leading-tight">
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {earnedBadges.length === 0 && (
              <p className="text-xs text-center text-muted-foreground mt-3">
                Complete daily activities to earn badges 🏅
              </p>
            )}
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Quick Access
            </h3>
            <div className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <button
                  key={link.route}
                  onClick={() => navigate(link.route)}
                  className="w-full glass rounded-2xl p-4 border border-primary/10 flex items-center gap-4 hover:border-primary/30 active:scale-[0.98] transition-all duration-200 text-left"
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow flex-shrink-0`}
                  >
                    <link.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {link.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{link.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* ── Preferences ── */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Preferences
            </h3>
            <div className="glass rounded-2xl border border-primary/10 divide-y divide-border/40 overflow-hidden">
              {[
                {
                  key: "showTransliteration" as keyof UserPrefs,
                  icon: BookText,
                  label: "Show Transliteration",
                  sub: "Display phonetic text in Quran",
                },
                {
                  key: "arabicOnly" as keyof UserPrefs,
                  icon: Sun,
                  label: "Arabic-Only Mushaf",
                  sub: "Mushaf mode for Quran reading",
                },
                {
                  key: "prayerReminders" as keyof UserPrefs,
                  icon: Bell,
                  label: "Prayer Reminders",
                  sub: "Notifications for prayer times",
                },
              ].map((pref) => (
                <div key={pref.key} className="flex items-center gap-3 p-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <pref.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {pref.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{pref.sub}</p>
                  </div>
                  <Switch
                    checked={prefs[pref.key]}
                    onCheckedChange={(v) => savePref(pref.key, v)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Account ── */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Account
            </h3>
            <div className="glass rounded-2xl border border-primary/10 divide-y divide-border/40 overflow-hidden">
              {/* Change Password */}
              <button
                onClick={handleChangePassword}
                className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 active:bg-muted/50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <KeyRound className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    Change Password
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Send a reset link to your email
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Privacy */}
              <button className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    Privacy & Data
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your data stays private, always
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 p-4 hover:bg-rose-500/5 active:bg-rose-500/10 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                  <LogOut className="w-4 h-4 text-rose-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-rose-500">
                    Sign Out
                  </p>
                  <p className="text-xs text-muted-foreground">Ma'a salama!</p>
                </div>
              </button>
            </div>

            {/* Delete Account */}
            <div className="mt-3">
              {showDeleteConfirm ? (
                <div className="glass rounded-2xl p-4 border border-rose-500/30 space-y-3">
                  <p className="text-sm text-foreground font-semibold">
                    Are you sure?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This action cannot be undone. All your data will be
                    permanently erased.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDeleteAccount}
                      className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs py-2 h-auto rounded-xl"
                    >
                      Yes, delete my account
                    </Button>
                    <Button
                      onClick={() => setShowDeleteConfirm(false)}
                      variant="outline"
                      className="flex-1 text-xs py-2 h-auto rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400/70 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete account
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] text-muted-foreground pb-2">
            MyIslam v1.0 • May Allah accept your worship 🤲
          </p>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Profile;
