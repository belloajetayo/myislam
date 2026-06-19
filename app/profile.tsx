import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/integrations/supabase/client";
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
  Bell,
  Lock,
  HandHeart,
} from "lucide-react-native";
import { useProgress } from "@/hooks/useProgress";

// ─── Colours ──────────────────────────────────────────────────────────────────
const BG = "#110e24";
const GOLD = "#F59E0B";
const MUTED = "rgba(255,255,255,0.4)";
const WHITE = "rgba(255,255,255,0.92)";
const CARD_BG = "rgba(255,255,255,0.05)";
const CARD_BORDER = "rgba(255,255,255,0.08)";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name?: string | null, email?: string | null) => {
  if (name?.trim()) return name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (email?.[0] ?? "U").toUpperCase();
};

const AVATAR_COLORS = ["#7C3AED", "#059669", "#D97706", "#2563EB", "#DC2626"];
const getAvatarColor = (email?: string | null) => AVATAR_COLORS[(email?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

const formatDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Unknown";

// ─── Badges ───────────────────────────────────────────────────────────────────
interface Stats { prayersToday: number; fastingDays: number; quranPages: number; streakDays: number }

const BADGES = [
  { id: "first_prayer", Icon: Target, label: "First Prayer", desc: "Logged your first prayer", color: "#2563EB", test: (s: Stats) => s.prayersToday >= 1 },
  { id: "streak_7", Icon: Flame, label: "7-Day Streak", desc: "7 days of daily prayers", color: "#EA580C", test: (s: Stats) => s.streakDays >= 7 },
  { id: "streak_30", Icon: Crown, label: "30-Day Streak", desc: "30 consecutive days", color: "#CA8A04", test: (s: Stats) => s.streakDays >= 30 },
  { id: "fasting_3", Icon: Moon, label: "Fasting", desc: "3 fasting days completed", color: "#7C3AED", test: (s: Stats) => s.fastingDays >= 3 },
  { id: "quran_10", Icon: BookOpen, label: "Quran Reader", desc: "Read 10 pages of Quran", color: "#059669", test: (s: Stats) => s.quranPages >= 10 },
  { id: "devoted", Icon: Award, label: "Devoted", desc: "Complete all 5 daily prayers", color: "#BE185D", test: (s: Stats) => s.prayersToday >= 5 },
  { id: "scholar", Icon: Star, label: "Scholar", desc: "Read 50 pages of Quran", color: "#0891B2", test: (s: Stats) => s.quranPages >= 50 },
  { id: "guardian", Icon: Shield, label: "Guardian", desc: "Used app for 60 days", color: "#4B5563", test: (s: Stats) => s.streakDays >= 60 },
];

const QUICK_LINKS = [
  { Icon: HandHeart, label: "Zakat Calculator", sub: "Purify your wealth", route: "/zakat", color: "#059669" },
  { Icon: Compass, label: "Hajj Planner", sub: "Plan your pilgrimage", route: "/hajj", color: "#7C3AED" },
  { Icon: BookText, label: "Donate", sub: "Support good causes", route: "/donate", color: "#D97706" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const { progress } = useProgress();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const nameRef = useRef<TextInput>(null);

  const [prefs, setPrefs] = useState({
    showTransliteration: true,
    arabicOnly: false,
    prayerReminders: true,
  });

  // Build stats from progress hook
  const stats: Stats = {
    prayersToday: progress.prayersCompleted.length,
    fastingDays: parseInt(localStorage.getItem("fasting_days_total") ?? "0"),
    quranPages: progress.quranPagesRead,
    streakDays: progress.streak,
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { setLoading(false); return; }
      const u = session.user;
      setUser(u);
      setDisplayName(u.user_metadata?.full_name || u.user_metadata?.name || "");
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session?.user) { setUser(null); setLoading(false); }
    });
    // Load saved prefs
    try {
      const stored = localStorage.getItem("myislam_prefs");
      if (stored) setPrefs(JSON.parse(stored));
    } catch (_) {}
    return () => subscription.unsubscribe();
  }, []);

  const savePref = (key: keyof typeof prefs, value: boolean) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    localStorage.setItem("myislam_prefs", JSON.stringify(updated));
  };

  const startEdit = () => {
    setTempName(displayName);
    setEditingName(true);
    setTimeout(() => nameRef.current?.focus(), 60);
  };

  const saveName = async () => {
    const trimmed = tempName.trim();
    if (!trimmed) { setEditingName(false); return; }
    const { error } = await supabase.auth.updateUser({ data: { full_name: trimmed } });
    if (error) { Alert.alert("Error", "Could not update name."); return; }
    setDisplayName(trimmed);
    setEditingName(false);
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (error) { Alert.alert("Error", "Failed to send reset email."); return; }
    Alert.alert("Email Sent", "Password reset link sent. Check your inbox.");
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: async () => { await supabase.auth.signOut(); router.replace("/"); } },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["top"]}>
        <ActivityIndicator color={GOLD} style={{ marginTop: 40 }} size="large" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>🕌</Text>
          <Text style={{ color: WHITE, fontSize: 20, fontWeight: "700", marginBottom: 8 }}>Not Signed In</Text>
          <Text style={{ color: MUTED, textAlign: "center", marginBottom: 28, lineHeight: 20 }}>
            Sign in to sync your progress and access all features.
          </Text>
          <TouchableOpacity onPress={() => router.push("/auth")} style={{ backgroundColor: GOLD, borderRadius: 16, paddingHorizontal: 36, paddingVertical: 14 }}>
            <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const initials = getInitials(displayName, user.email);
  const avatarColor = getAvatarColor(user.email);
  const memberSince = formatDate(user.created_at);
  const earnedCount = BADGES.filter(b => b.test(stats)).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["top"]}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 14 }}>
          <ArrowLeft size={22} color={GOLD} />
        </TouchableOpacity>
        <Text style={{ color: GOLD, fontSize: 20, fontWeight: "700" }}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>

        {/* ── Hero Card ── */}
        <View style={{ backgroundColor: CARD_BG, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: CARD_BORDER, marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            {/* Avatar */}
            <View style={{ width: 72, height: 72, borderRadius: 18, backgroundColor: avatarColor, alignItems: "center", justifyContent: "center", marginRight: 14 }}>
              <Text style={{ color: "white", fontSize: 28, fontWeight: "700" }}>{initials}</Text>
            </View>

            {/* Info */}
            <View style={{ flex: 1 }}>
              {editingName ? (
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <TextInput
                    ref={nameRef}
                    value={tempName}
                    onChangeText={setTempName}
                    onSubmitEditing={saveName}
                    style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, color: WHITE, fontSize: 15, fontWeight: "600" }}
                    placeholder="Your name"
                    placeholderTextColor={MUTED}
                    returnKeyType="done"
                  />
                  <TouchableOpacity onPress={saveName} style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: GOLD, alignItems: "center", justifyContent: "center", marginLeft: 6 }}>
                    <Check size={14} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setEditingName(false)} style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginLeft: 4 }}>
                    <X size={14} color={MUTED} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={startEdit} style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <Text style={{ color: WHITE, fontSize: 18, fontWeight: "700", marginRight: 6 }}>{displayName || "Muslim User"}</Text>
                  <Edit2 size={13} color={MUTED} />
                </TouchableOpacity>
              )}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
                <Mail size={12} color={MUTED} style={{ marginRight: 5 }} />
                <Text style={{ color: MUTED, fontSize: 12 }} numberOfLines={1}>{user.email}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Calendar size={12} color={MUTED} style={{ marginRight: 5 }} />
                <Text style={{ color: MUTED, fontSize: 12 }}>Member since {memberSince}</Text>
              </View>
            </View>
          </View>

          {/* Stats row */}
          <View style={{ flexDirection: "row", marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" }}>
            {[
              { label: "Prayers", value: `${stats.prayersToday}/5` },
              { label: "Streak", value: `${stats.streakDays}d` },
              { label: "Fasted", value: `${stats.fastingDays}` },
              { label: "Quran", value: `${stats.quranPages}pg` },
            ].map((item, i) => (
              <View key={item.label} style={{ flex: 1, alignItems: "center", borderLeftWidth: i > 0 ? 1 : 0, borderLeftColor: "rgba(255,255,255,0.08)" }}>
                <Text style={{ color: WHITE, fontSize: 17, fontWeight: "700" }}>{item.value}</Text>
                <Text style={{ color: MUTED, fontSize: 10, marginTop: 2 }}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Activity Stats ── */}
        <Text style={{ color: GOLD, fontSize: 13, fontWeight: "600", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Today's Activity</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20, gap: 10 }}>
          {[
            { label: "Prayers", value: `${stats.prayersToday} / 5`, progress: (stats.prayersToday / 5) * 100, color: "#2563EB", Icon: Target },
            { label: "Fasting Days", value: `${stats.fastingDays}`, progress: Math.min((stats.fastingDays / 30) * 100, 100), color: "#7C3AED", Icon: Moon },
            { label: "Quran Pages", value: `${stats.quranPages} pg`, progress: Math.min((stats.quranPages / 20) * 100, 100), color: "#059669", Icon: BookOpen },
            { label: "Day Streak", value: `${stats.streakDays} days`, progress: Math.min((stats.streakDays / 30) * 100, 100), color: "#EA580C", Icon: Flame },
          ].map(stat => (
            <View key={stat.label} style={{ width: "47.5%", backgroundColor: CARD_BG, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: CARD_BORDER }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${stat.color}22`, alignItems: "center", justifyContent: "center" }}>
                  <stat.Icon size={16} color={stat.color} />
                </View>
                <Text style={{ color: WHITE, fontSize: 16, fontWeight: "700" }}>{stat.value}</Text>
              </View>
              <View style={{ height: 4, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 2, marginBottom: 6 }}>
                <View style={{ height: 4, backgroundColor: stat.color, borderRadius: 2, width: `${stat.progress}%` }} />
              </View>
              <Text style={{ color: MUTED, fontSize: 11, fontWeight: "500" }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Badges ── */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <Text style={{ color: GOLD, fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>Badges</Text>
          <View style={{ backgroundColor: "rgba(245,158,11,0.12)", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ color: GOLD, fontSize: 11 }}>{earnedCount}/{BADGES.length}</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {BADGES.map(badge => {
            const earned = badge.test(stats);
            return (
              <View key={badge.id} style={{ width: "22%", alignItems: "center", padding: 10, borderRadius: 16, backgroundColor: earned ? CARD_BG : "rgba(255,255,255,0.02)", borderWidth: 1, borderColor: earned ? CARD_BORDER : "rgba(255,255,255,0.03)", opacity: earned ? 1 : 0.4 }}>
                <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: earned ? `${badge.color}22` : "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center", marginBottom: 5 }}>
                  <badge.Icon size={18} color={earned ? badge.color : MUTED} />
                </View>
                <Text style={{ color: earned ? WHITE : MUTED, fontSize: 9, fontWeight: "600", textAlign: "center", lineHeight: 13 }}>{badge.label}</Text>
              </View>
            );
          })}
        </View>
        {earnedCount === 0 && (
          <Text style={{ color: MUTED, textAlign: "center", fontSize: 12, marginTop: -12, marginBottom: 12 }}>Complete daily activities to earn badges 🏅</Text>
        )}

        {/* ── Quick Links ── */}
        <Text style={{ color: GOLD, fontSize: 13, fontWeight: "600", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Quick Access</Text>
        <View style={{ marginBottom: 20 }}>
          {QUICK_LINKS.map(link => (
            <TouchableOpacity key={link.route} onPress={() => router.push(link.route as any)} activeOpacity={0.75} style={{ flexDirection: "row", alignItems: "center", backgroundColor: CARD_BG, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: CARD_BORDER }}>
              <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: `${link.color}22`, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <link.Icon size={18} color={link.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: WHITE, fontSize: 14, fontWeight: "600" }}>{link.label}</Text>
                <Text style={{ color: MUTED, fontSize: 12, marginTop: 1 }}>{link.sub}</Text>
              </View>
              <ChevronRight size={16} color={MUTED} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Preferences ── */}
        <Text style={{ color: GOLD, fontSize: 13, fontWeight: "600", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Preferences</Text>
        <View style={{ backgroundColor: CARD_BG, borderRadius: 16, borderWidth: 1, borderColor: CARD_BORDER, marginBottom: 20, overflow: "hidden" }}>
          {[
            { key: "showTransliteration" as const, Icon: BookText, label: "Show Transliteration", sub: "Phonetic text in Quran" },
            { key: "arabicOnly" as const, Icon: BookOpen, label: "Arabic-Only Mushaf", sub: "Mushaf mode for Quran reading" },
            { key: "prayerReminders" as const, Icon: Bell, label: "Prayer Reminders", sub: "Notifications for prayer times" },
          ].map((pref, i) => (
            <View key={pref.key} style={{ flexDirection: "row", alignItems: "center", padding: 14, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: "rgba(255,255,255,0.06)" }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(245,158,11,0.1)", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <pref.Icon size={16} color={GOLD} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: WHITE, fontSize: 14, fontWeight: "600" }}>{pref.label}</Text>
                <Text style={{ color: MUTED, fontSize: 12, marginTop: 1 }}>{pref.sub}</Text>
              </View>
              <Switch
                value={prefs[pref.key]}
                onValueChange={v => savePref(pref.key, v)}
                trackColor={{ false: "rgba(255,255,255,0.1)", true: `${GOLD}66` }}
                thumbColor={prefs[pref.key] ? GOLD : "rgba(255,255,255,0.4)"}
              />
            </View>
          ))}
        </View>

        {/* ── Account ── */}
        <Text style={{ color: GOLD, fontSize: 13, fontWeight: "600", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Account</Text>
        <View style={{ backgroundColor: CARD_BG, borderRadius: 16, borderWidth: 1, borderColor: CARD_BORDER, marginBottom: 12, overflow: "hidden" }}>
          <TouchableOpacity onPress={handleChangePassword} activeOpacity={0.75} style={{ flexDirection: "row", alignItems: "center", padding: 14 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(37,99,235,0.12)", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
              <KeyRound size={16} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: WHITE, fontSize: 14, fontWeight: "600" }}>Change Password</Text>
              <Text style={{ color: MUTED, fontSize: 12, marginTop: 1 }}>Send a reset link to your email</Text>
            </View>
            <ChevronRight size={16} color={MUTED} />
          </TouchableOpacity>

          <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.06)" }} />

          <TouchableOpacity activeOpacity={0.75} style={{ flexDirection: "row", alignItems: "center", padding: 14 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(5,150,105,0.12)", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
              <Lock size={16} color="#059669" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: WHITE, fontSize: 14, fontWeight: "600" }}>Privacy & Data</Text>
              <Text style={{ color: MUTED, fontSize: 12, marginTop: 1 }}>Your data stays private, always</Text>
            </View>
            <ChevronRight size={16} color={MUTED} />
          </TouchableOpacity>

          <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.06)" }} />

          <TouchableOpacity onPress={handleSignOut} activeOpacity={0.75} style={{ flexDirection: "row", alignItems: "center", padding: 14 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(239,68,68,0.1)", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
              <LogOut size={16} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#EF4444", fontSize: 14, fontWeight: "600" }}>Sign Out</Text>
              <Text style={{ color: MUTED, fontSize: 12, marginTop: 1 }}>Ma'a salama!</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Delete account */}
        {showDeleteConfirm ? (
          <View style={{ backgroundColor: "rgba(239,68,68,0.06)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" }}>
            <Text style={{ color: WHITE, fontSize: 14, fontWeight: "700", marginBottom: 6 }}>Are you sure?</Text>
            <Text style={{ color: MUTED, fontSize: 13, lineHeight: 19, marginBottom: 14 }}>This action cannot be undone. All your data will be permanently erased.</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity onPress={() => { Alert.alert("", "Please contact support to delete your account."); setShowDeleteConfirm(false); }} style={{ flex: 1, backgroundColor: "#EF4444", borderRadius: 12, padding: 12, alignItems: "center" }}>
                <Text style={{ color: "white", fontSize: 13, fontWeight: "700" }}>Yes, delete my account</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDeleteConfirm(false)} style={{ flex: 1, backgroundColor: CARD_BG, borderRadius: 12, padding: 12, alignItems: "center", borderWidth: 1, borderColor: CARD_BORDER }}>
                <Text style={{ color: WHITE, fontSize: 13 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}>
            <Trash2 size={13} color="rgba(239,68,68,0.5)" style={{ marginRight: 6 }} />
            <Text style={{ color: "rgba(239,68,68,0.5)", fontSize: 13 }}>Delete account</Text>
          </TouchableOpacity>
        )}

        <Text style={{ color: "rgba(255,255,255,0.2)", textAlign: "center", fontSize: 11, marginTop: 20 }}>
          MyIslam v1.0 · May Allah accept your worship 🤲
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
