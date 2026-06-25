import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useProgress } from "@/hooks/useProgress";
import {
  Clock,
  MapPin,
  BookOpen,
  Compass,
  Moon,
  Calculator,
  Landmark,
  Heart,
  User,
  RefreshCw,
  Target,
  Flame,
  Award,
  Calendar,
  Sparkles,
} from "lucide-react-native";
import { Colors, Font, Weight, Space, Radius, Shadow } from "@/theme/tokens";
import { SectionHeader, StatCard, PrayerRow } from "@/shared";

// ─── Static data ──────────────────────────────────────────────────────────────

const REMINDERS = [
  { text: "Whoever reads Surah Al-Kahf on Friday, light shall shine forth for him between the two Fridays.", source: "Al-Hakim", type: "hadith" },
  { text: "The best of you are those who learn the Quran and teach it.", source: "Sahih Al-Bukhari", type: "hadith" },
  { text: "Charity does not decrease wealth. Rather, it increases it.", source: "Muslim", type: "hadith" },
  { text: "Make dua in sujood — it is the closest you are to Allah.", source: "Daily Reminder", type: "reminder" },
  { text: "Indeed, with hardship comes ease. So when you have finished, then stand up for worship.", source: "Quran 94:6-7", type: "quran" },
  { text: "The strong person is the one who can control himself when he is angry.", source: "Sahih Al-Bukhari", type: "hadith" },
  { text: "Smile at your brother. It is charity.", source: "At-Tirmidhi", type: "hadith" },
  { text: "And whoever relies upon Allah — then He is sufficient for him.", source: "Quran 65:3", type: "quran" },
  { text: "Remember to make dhikr: SubhanAllah, Alhamdulillah, Allahu Akbar.", source: "Daily Reminder", type: "reminder" },
  { text: "None of you truly believes until he loves for his brother what he loves for himself.", source: "Sahih Bukhari", type: "hadith" },
];

const PRAYER_EMOJIS: Record<string, string> = {
  Fajr: "🌄", Dhuhr: "☀️", Asr: "🌤", Maghrib: "🌇", Isha: "🌙",
};

const QUICK_ACTIONS = [
  { icon: Clock, label: "Prayer", color: "#6366F1", route: "/(tabs)/prayer" },
  { icon: BookOpen, label: "Quran", color: Colors.green, route: "/(tabs)/quran" },
  { icon: Compass, label: "Qiblah", color: Colors.blue, route: "/(tabs)/qiblah" },
  { icon: Moon, label: "Fasting", color: Colors.purple, route: "/(tabs)/fasting" },
  { icon: Calculator, label: "Zakat", color: Colors.gold, route: "/zakat" },
  { icon: Landmark, label: "Hajj", color: "#D97706", route: "/hajj" },
  { icon: Heart, label: "Donate", color: "#E11D48", route: "/donate" },
  { icon: Calendar, label: "Calendar", color: Colors.blue, route: "/calendar" },
] as const;

const TYPE_LABELS: Record<string, string> = {
  quran: "Qur'an",
  hadith: "Hadith",
  reminder: "Reminder",
};
const TYPE_COLORS: Record<string, string> = {
  quran: Colors.blue,
  hadith: Colors.gold,
  reminder: Colors.purple,
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function getDayOfYear() {
  const now = new Date();
  return Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function QuickActionButton({
  icon: Icon,
  label,
  color,
  onPress,
}: {
  icon: (typeof QUICK_ACTIONS)[number]["icon"];
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={styles.quickAction}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}18` }, Shadow.sm]}>
        <Icon size={22} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { prayerTimes, location, hijriDate, loading, nextPrayer } = usePrayerTimes();
  const { progress } = useProgress();

  const [reminderIdx, setReminderIdx] = useState(
    () => getDayOfYear() % REMINDERS.length
  );
  const reminder = REMINDERS[reminderIdx];
  const prayedCount = progress.prayersCompleted.length;

  const hijriStr = hijriDate
    ? `${hijriDate.day} ${hijriDate.month.en} ${hijriDate.year} AH`
    : "";
  const badgeColor = TYPE_COLORS[reminder.type] ?? Colors.textSub;

  const progressStats = [
    {
      label: "Prayers",
      value: `${prayedCount}/5`,
      pct: (prayedCount / 5) * 100,
      color: "#6366F1",
      Icon: Target,
    },
    {
      label: "Streak",
      value: `${progress.streak}d`,
      pct: Math.min((progress.streak / 30) * 100, 100),
      color: Colors.orange,
      Icon: Flame,
    },
    {
      label: "Quran",
      value: `${progress.quranPagesRead}pg`,
      pct: Math.min((progress.quranPagesRead / 5) * 100, 100),
      color: Colors.green,
      Icon: Award,
    },
  ];

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.salam}>As-salamu Alaykum</Text>
            <View style={styles.metaRow}>
              {hijriStr ? <Text style={styles.metaText}>🌙 {hijriStr}</Text> : null}
              {location ? (
                <View style={styles.locationRow}>
                  <MapPin size={11} color={Colors.textMuted} />
                  <Text style={[styles.metaText, { marginLeft: 3 }]}>
                    {location.city}, {location.country}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            activeOpacity={0.75}
            accessibilityLabel="Open profile"
            style={styles.avatar}
          >
            <User size={18} color={Colors.gold} />
          </TouchableOpacity>
        </View>

        {/* ── Next Prayer Hero ── */}
        <View style={styles.section}>
          <LinearGradient
            colors={["#F59E0B", "#D97706"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.prayerCard}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} size="large" />
            ) : (
              <View style={styles.prayerCardRow}>
                <View>
                  <Text style={styles.prayerLabel}>Next Prayer</Text>
                  <Text style={styles.prayerName}>{nextPrayer ?? "—"}</Text>
                  {prayerTimes && nextPrayer ? (
                    <View style={styles.prayerTimeRow}>
                      <Clock size={13} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.prayerTime}>
                        {prayerTimes[nextPrayer as keyof typeof prayerTimes]}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.prayerBadge}>
                  <Text style={styles.prayerBadgeCount}>{prayedCount}/5</Text>
                  <Text style={styles.prayerBadgeLabel}>today</Text>
                </View>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* ── Quick Access ── */}
        <View style={styles.section}>
          <SectionHeader title="Quick Access" />
          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map(({ icon, label, color, route }) => (
              <QuickActionButton
                key={label}
                icon={icon}
                label={label}
                color={color}
                onPress={() => router.push(route as any)}
              />
            ))}
          </View>
        </View>

        {/* ── Today's Progress ── */}
        <View style={styles.section}>
          <SectionHeader title="Today's Progress" />
          <View style={styles.statsRow}>
            {progressStats.map((s) => (
              <StatCard
                key={s.label}
                icon={<s.Icon size={13} color={s.color} />}
                value={s.value}
                label={s.label}
                percentage={s.pct}
                color={s.color}
              />
            ))}
          </View>
        </View>

        {/* ── Daily Reminder ── */}
        <View style={styles.section}>
          <View style={[styles.reminderCard, Shadow.md]}>
            <View style={styles.reminderTop}>
              <View style={styles.reminderIconWrap}>
                <Sparkles size={16} color={Colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reminderTitle}>Daily Reminder</Text>
                <Text style={styles.reminderSub}>Refresh your iman</Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  setReminderIdx((p) => (p + 1) % REMINDERS.length)
                }
                accessibilityLabel="Next reminder"
                style={styles.refreshBtn}
              >
                <RefreshCw size={13} color={Colors.textSub} />
              </TouchableOpacity>
            </View>
            <Text style={styles.reminderText}>"{reminder.text}"</Text>
            <View style={styles.reminderFooter}>
              <View
                style={[
                  styles.reminderBadge,
                  { backgroundColor: `${badgeColor}18` },
                ]}
              >
                <Text style={[styles.reminderBadgeText, { color: badgeColor }]}>
                  {TYPE_LABELS[reminder.type] ?? "Reminder"}
                </Text>
              </View>
              <Text style={styles.reminderSource}>— {reminder.source}</Text>
            </View>
          </View>
        </View>

        {/* ── Today's Prayers ── */}
        {prayerTimes ? (
          <View style={styles.section}>
            <SectionHeader title="Today's Prayers" />
            {(["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const).map(
              (name) => (
                <PrayerRow
                  key={name}
                  name={name}
                  time={prayerTimes[name]}
                  emoji={PRAYER_EMOJIS[name]}
                  isNext={nextPrayer === name}
                  isCompleted={progress.prayersCompleted.includes(name)}
                />
              )
            )}
          </View>
        ) : null}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 120 },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: Space.xl,
    paddingTop: Space.xl,
    paddingBottom: Space.lg,
  },
  greeting: { color: Colors.textSub, fontSize: Font.sm },
  salam: {
    color: Colors.gold,
    fontSize: Font.xxl,
    fontWeight: Weight.bold,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: Space.xs,
    gap: Space.md,
  },
  locationRow: { flexDirection: "row", alignItems: "center" },
  metaText: { color: Colors.textMuted, fontSize: Font.sm },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.goldMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.goldBorder,
    marginLeft: Space.md,
  },

  section: { paddingHorizontal: Space.xl, marginBottom: Space.xl },

  prayerCard: {
    borderRadius: Radius.xxl,
    padding: Space.xl,
    minHeight: 100,
    justifyContent: "center",
  },
  prayerCardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  prayerLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: Font.sm,
    marginBottom: 3,
  },
  prayerName: {
    color: Colors.white,
    fontSize: 30,
    fontWeight: Weight.bold,
  },
  prayerTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space.xs,
    marginTop: 5,
  },
  prayerTime: { color: "rgba(255,255,255,0.8)", fontSize: Font.base },
  prayerBadge: { alignItems: "center" },
  prayerBadgeCount: {
    color: Colors.white,
    fontSize: Font.xl,
    fontWeight: Weight.bold,
  },
  prayerBadgeLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: Font.xs,
    fontWeight: Weight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: Space.md },
  quickAction: { alignItems: "center", width: "22%" },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Space.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  quickActionLabel: {
    color: Colors.textSub,
    fontSize: 10,
    textAlign: "center",
  },

  statsRow: { flexDirection: "row", gap: Space.sm },

  reminderCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Space.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reminderTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Space.md,
    gap: Space.sm,
  },
  reminderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.goldMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  reminderTitle: {
    color: Colors.text,
    fontSize: Font.base,
    fontWeight: Weight.bold,
  },
  reminderSub: { color: Colors.textMuted, fontSize: Font.xs, marginTop: 1 },
  refreshBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  reminderText: {
    color: Colors.textSub,
    fontSize: Font.base,
    lineHeight: 22,
    fontStyle: "italic",
    marginBottom: Space.md,
  },
  reminderFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space.sm,
  },
  reminderBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Space.sm,
    paddingVertical: 3,
  },
  reminderBadgeText: { fontSize: Font.xs, fontWeight: Weight.bold },
  reminderSource: { color: Colors.textMuted, fontSize: Font.xs },
});
