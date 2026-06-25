import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, Bell, BellOff, Send, Check } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useProgress } from "@/hooks/useProgress";
import {
  schedulePrayerNotifications,
  cancelPrayerNotifications,
  arePrayerNotificationsEnabled,
  requestNotificationPermission,
} from "@/utils/prayerNotifications";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { Colors, Font, Weight, Space, Radius, Shadow } from "@/theme/tokens";
import { SectionHeader, PrayerRow, ProgressBar } from "@/shared";

// All known admin emails — shows the "Send Test" panel when any of these log in
const ADMIN_EMAILS = [
  "ayodejiibrahim09@gmail.com",
  "ayodejiibrahim@gmail.com",
];

const PRAYER_EMOJIS: Record<string, string> = {
  Fajr: "🌄",
  Sunrise: "🌅",
  Dhuhr: "☀️",
  Asr: "🌤",
  Maghrib: "🌇",
  Isha: "🌙",
};

const TRACKABLE = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
const ALL_PRAYERS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getLast7Days() {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

export default function PrayerScreen() {
  const { prayerTimes, location, hijriDate, loading, error, currentPrayer, nextPrayer } =
    usePrayerTimes();
  const { progress, togglePrayer } = useProgress();

  const days = getLast7Days();
  const [selectedDayIdx, setSelectedDayIdx] = useState(6);
  const isToday = selectedDayIdx === 6;

  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [testSending, setTestSending] = useState(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    arePrayerNotificationsEnabled().then(setNotifEnabled);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email ?? null);
    });

    // Listen for login/logout so the admin panel shows without a reload
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session: Session | null) => {
        setUserEmail(session?.user?.email ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const isAdmin = userEmail !== null && ADMIN_EMAILS.includes(userEmail);

  const sendTestNotification = async () => {
    setTestSending(true);
    try {
      const granted = await requestNotificationPermission();
      if (!granted) return;
      const Notifications = await import("expo-notifications");
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🕌 Test Notification",
          body: "My Islam push notifications are working! Alhamdulillah.",
          sound: "default",
        },
        trigger: null,
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
    } finally {
      setTestSending(false);
    }
  };

  const toggleNotifications = async () => {
    setNotifLoading(true);
    try {
      if (notifEnabled) {
        await cancelPrayerNotifications();
        setNotifEnabled(false);
      } else if (prayerTimes) {
        await schedulePrayerNotifications(prayerTimes);
        setNotifEnabled(true);
      }
    } finally {
      setNotifLoading(false);
    }
  };

  const prayedCount = TRACKABLE.filter((p) =>
    progress.prayersCompleted.includes(p)
  ).length;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Prayer Times</Text>
            {hijriDate ? (
              <Text style={styles.hijri}>
                🌙 {hijriDate.day} {hijriDate.month.en} {hijriDate.year} AH
              </Text>
            ) : null}
            {location ? (
              <View style={styles.locationRow}>
                <MapPin size={12} color={Colors.textMuted} />
                <Text style={styles.locationText}>
                  {location.city}, {location.country}
                </Text>
              </View>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={toggleNotifications}
            disabled={notifLoading || !prayerTimes}
            activeOpacity={0.75}
            accessibilityLabel={
              notifEnabled ? "Disable prayer notifications" : "Enable prayer notifications"
            }
            style={[
              styles.notifBtn,
              notifEnabled ? styles.notifBtnActive : styles.notifBtnInactive,
              (notifLoading || !prayerTimes) && { opacity: 0.4 },
            ]}
          >
            {notifEnabled ? (
              <Bell size={18} color={Colors.gold} />
            ) : (
              <BellOff size={18} color={Colors.textSub} />
            )}
          </TouchableOpacity>
        </View>

        {/* ── 7-Day selector ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayScroll}
        >
          {days.map((d, i) => {
            const isSelected = selectedDayIdx === i;
            const isT = i === 6;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedDayIdx(i)}
                accessibilityLabel={isT ? "Today" : DAY_LABELS[d.getDay()]}
                style={[
                  styles.dayPill,
                  isSelected ? styles.dayPillActive : styles.dayPillInactive,
                ]}
              >
                <Text
                  style={[
                    styles.dayPillWeekday,
                    { color: isSelected ? Colors.white : Colors.textMuted },
                  ]}
                >
                  {isT ? "Today" : DAY_LABELS[d.getDay()]}
                </Text>
                <Text
                  style={[
                    styles.dayPillDate,
                    { color: isSelected ? Colors.white : Colors.text },
                  ]}
                >
                  {d.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Current prayer highlight (today only) ── */}
        {isToday && !loading && currentPrayer && prayerTimes ? (
          <View style={styles.currentSection}>
            <LinearGradient
              colors={["#0D9488", "#0F766E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.currentCard}
            >
              <View>
                <Text style={styles.currentLabel}>Current Prayer</Text>
                <Text style={styles.currentName}>{currentPrayer}</Text>
              </View>
              <View style={styles.currentRight}>
                <Text style={styles.currentTime}>
                  {prayerTimes[currentPrayer as keyof typeof prayerTimes]}
                </Text>
                {nextPrayer ? (
                  <Text style={styles.nextInfo}>
                    Next: {nextPrayer}
                  </Text>
                ) : null}
              </View>
            </LinearGradient>
          </View>
        ) : null}

        {/* ── Progress (today only) ── */}
        {isToday && !loading && prayerTimes ? (
          <View style={styles.progressSection}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Daily progress</Text>
              <Text style={styles.progressCount}>{prayedCount}/5 prayed</Text>
            </View>
            <ProgressBar
              value={(prayedCount / 5) * 100}
              color={Colors.gold}
              height={5}
              trackColor={Colors.borderSubtle}
            />
          </View>
        ) : null}

        {/* ── Prayer list ── */}
        <View style={styles.listSection}>
          <SectionHeader title="Prayer Schedule" />
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={Colors.gold} size="large" />
              <Text style={styles.loadingText}>Loading prayer times…</Text>
            </View>
          ) : error ? (
            <View style={styles.loadingWrap}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : prayerTimes ? (
            ALL_PRAYERS.map((name) => {
              const isNext = isToday && nextPrayer === name;
              const isCurrent = isToday && currentPrayer === name;
              const isTrackable = TRACKABLE.includes(name as any);
              const prayed = isTrackable && progress.prayersCompleted.includes(name);
              return (
                <PrayerRow
                  key={name}
                  name={name}
                  time={prayerTimes[name as keyof typeof prayerTimes]}
                  emoji={PRAYER_EMOJIS[name]}
                  isNext={isNext}
                  isCurrent={isCurrent}
                  isCompleted={prayed}
                  showToggle={isTrackable && isToday}
                  onToggle={() => togglePrayer(name)}
                />
              );
            })
          ) : null}
        </View>

        {/* ── Completion celebration ── */}
        {isToday && prayedCount === 5 ? (
          <View style={styles.completionCard}>
            <Text style={styles.completionEmoji}>🤲</Text>
            <Text style={styles.completionTitle}>MashaAllah!</Text>
            <Text style={styles.completionText}>
              You've completed all 5 daily prayers today. May Allah accept your worship.
            </Text>
          </View>
        ) : null}

        {/* ── Admin: test notification ── */}
        {isAdmin ? (
          <View style={[styles.adminCard, Shadow.sm]}>
            <Text style={styles.adminTitle}>Test Push Notification</Text>
            <Text style={styles.adminDesc}>
              Instantly trigger a test notification to verify your device setup.
            </Text>
            <TouchableOpacity
              onPress={sendTestNotification}
              disabled={testSending}
              activeOpacity={0.75}
              style={[styles.adminBtn, testSending && { opacity: 0.6 }]}
            >
              {testSending ? (
                <ActivityIndicator size={14} color={Colors.white} />
              ) : testSent ? (
                <Check size={14} color={Colors.white} />
              ) : (
                <Send size={14} color={Colors.white} />
              )}
              <Text style={styles.adminBtnText}>
                {testSending ? "Sending…" : testSent ? "Notification Sent!" : "Send Test"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 40 },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: Space.xl,
    paddingTop: Space.xl,
    paddingBottom: Space.md,
  },
  title: { color: Colors.gold, fontSize: Font.xxl, fontWeight: Weight.bold },
  hijri: { color: Colors.textMuted, fontSize: Font.sm, marginTop: 4 },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  locationText: { color: Colors.textMuted, fontSize: Font.sm },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginLeft: Space.md,
  },
  notifBtnActive: {
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.goldBorder,
  },
  notifBtnInactive: {
    backgroundColor: Colors.bgMuted,
    borderColor: Colors.border,
  },

  dayScroll: {
    paddingHorizontal: Space.xl,
    paddingBottom: 4,
    gap: Space.sm,
  },
  dayPill: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Radius.lg,
    minWidth: 52,
    borderWidth: 1,
  },
  dayPillActive: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  dayPillInactive: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  dayPillWeekday: { fontSize: Font.xs, fontWeight: Weight.bold, marginBottom: 3 },
  dayPillDate: { fontSize: Font.lg, fontWeight: Weight.bold },

  currentSection: { paddingHorizontal: Space.xl, marginTop: Space.lg },
  currentCard: {
    borderRadius: Radius.xl,
    padding: Space.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currentLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: Font.sm,
    marginBottom: 4,
  },
  currentName: {
    color: Colors.white,
    fontSize: Font.xxl,
    fontWeight: Weight.bold,
  },
  currentRight: { alignItems: "flex-end" },
  currentTime: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: Weight.bold,
  },
  nextInfo: {
    color: "rgba(255,255,255,0.7)",
    fontSize: Font.sm,
    marginTop: 3,
  },

  progressSection: {
    paddingHorizontal: Space.xl,
    marginTop: Space.lg,
    marginBottom: Space.xs,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Space.sm,
  },
  progressLabel: { color: Colors.textSub, fontSize: Font.sm },
  progressCount: { color: Colors.gold, fontSize: Font.sm, fontWeight: Weight.bold },

  listSection: { paddingHorizontal: Space.xl, marginTop: Space.xl },
  loadingWrap: { alignItems: "center", paddingVertical: 40 },
  loadingText: { color: Colors.textSub, marginTop: Space.md },
  errorText: { color: Colors.red, textAlign: "center" },

  completionCard: {
    marginHorizontal: Space.xl,
    marginTop: Space.sm,
    padding: Space.lg,
    backgroundColor: Colors.greenMuted,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.greenBorder,
    alignItems: "center",
  },
  completionEmoji: { fontSize: 32, marginBottom: Space.sm },
  completionTitle: {
    color: Colors.green,
    fontSize: Font.lg,
    fontWeight: Weight.bold,
    marginBottom: Space.xs,
  },
  completionText: {
    color: Colors.textSub,
    fontSize: Font.sm,
    textAlign: "center",
    lineHeight: 20,
  },

  adminCard: {
    marginHorizontal: Space.xl,
    marginTop: Space.lg,
    padding: Space.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: Space.md,
  },
  adminTitle: {
    color: Colors.text,
    fontSize: Font.base,
    fontWeight: Weight.bold,
    flex: 1,
  },
  adminDesc: {
    display: "none",
  } as any,
  adminBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Space.xs,
    paddingVertical: 10,
    paddingHorizontal: Space.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.green,
  },
  adminBtnText: {
    color: Colors.white,
    fontSize: Font.sm,
    fontWeight: Weight.semibold,
  },
});
