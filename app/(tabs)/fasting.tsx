import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Moon, Sun, Check, ChevronRight, Info, Star } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Font, Weight, Space, Radius, Shadow } from "@/theme/tokens";
import { SectionHeader } from "@/shared";

// ─── Sunnah fast data ─────────────────────────────────────────────────────────

const TODAY_DAY = new Date().getDay();
const TODAY_DAY_NAME = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
][TODAY_DAY];

function daysUntilWeekday(target: number): number {
  const diff = (target - TODAY_DAY + 7) % 7;
  return diff === 0 ? 7 : diff;
}

const SUNNAH_FASTS = [
  {
    name: "Monday",
    description:
      "The Prophet ﷺ used to fast on Mondays, saying: 'It is the day on which I was born and revelation was sent down to me.'",
    hadith: "Muslim",
    daysUntil: daysUntilWeekday(1),
    isNext: daysUntilWeekday(1) <= 3,
    color: Colors.purple,
  },
  {
    name: "Thursday",
    description:
      "Deeds are presented to Allah on Thursdays and Mondays, so the Prophet ﷺ loved to be fasting when they were presented.",
    hadith: "At-Tirmidhi",
    daysUntil: daysUntilWeekday(4),
    isNext: daysUntilWeekday(4) <= 3,
    color: Colors.blue,
  },
  {
    name: "Ayyam al-Bid (13th–15th)",
    description:
      "Fasting the white days (full moon nights) of each lunar month is highly recommended.",
    hadith: "An-Nasa'i",
    daysUntil: null,
    isNext: false,
    color: Colors.gold,
  },
  {
    name: "Day of Arafah",
    description:
      "Fasting on the Day of Arafah expiates sins of the past year and the coming year.",
    hadith: "Muslim",
    daysUntil: null,
    isNext: false,
    color: "#D97706",
  },
  {
    name: "Muharram (9th & 10th)",
    description:
      "Fasting on Ashura (10th Muharram) expiates sins of the past year.",
    hadith: "Muslim",
    daysUntil: null,
    isNext: false,
    color: Colors.green,
  },
  {
    name: "6 Days of Shawwal",
    description:
      "Whoever fasts Ramadan then follows it with six days of Shawwal is as if they fasted the whole year.",
    hadith: "Muslim",
    daysUntil: null,
    isNext: false,
    color: Colors.purple,
  },
];

const HOW_TO_FAST = [
  {
    title: "Make your intention (Niyyah)",
    desc: "Before Fajr, intend in your heart that you will fast. You do not need to say it aloud.",
    icon: "🤲",
  },
  {
    title: "Suhoor (pre-dawn meal)",
    desc: "Eat suhoor before Fajr. It is a blessed act — even a sip of water counts.",
    icon: "🌙",
  },
  {
    title: "Abstain from invalidators",
    desc: "Avoid eating, drinking, marital relations, and deliberate vomiting during fasting hours.",
    icon: "⛔",
  },
  {
    title: "Break fast at Maghrib (Iftar)",
    desc: "Break your fast at Maghrib with dates or water. Say: Allahumma laka sumtu wa bika amantu wa 'alayka tawakkaltu wa 'ala rizqika aftartu.",
    icon: "🌅",
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FastingScreen() {
  const [fastingToday, setFastingToday] = useState(false);
  const [fastingTomorrow, setFastingTomorrow] = useState(false);
  const isSunnahDay = TODAY_DAY_NAME === "Monday" || TODAY_DAY_NAME === "Thursday";

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.title}>Fasting</Text>
          <Text style={styles.sub}>Track Sunnah and voluntary fasts</Text>
        </View>

        {/* ── Today's fasting status ── */}
        <View style={styles.section}>
          <LinearGradient
            colors={fastingToday ? ["#7C3AED", "#6D28D9"] : ["#1D4ED8", "#1E40AF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statusCard}
          >
            <View style={styles.statusLeft}>
              <Moon size={28} color="rgba(255,255,255,0.9)" />
              <View style={{ marginLeft: Space.md, flex: 1 }}>
                <Text style={styles.statusTitle}>
                  Today — {TODAY_DAY_NAME}
                  {isSunnahDay ? " ⭐" : ""}
                </Text>
                <Text style={styles.statusDesc}>
                  {fastingToday
                    ? "You are fasting today. MashaAllah!"
                    : isSunnahDay
                    ? "Today is a Sunnah fast day. Will you fast?"
                    : "Are you fasting today?"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setFastingToday((v) => !v)}
              activeOpacity={0.75}
              accessibilityLabel={fastingToday ? "Mark as not fasting" : "Mark as fasting"}
              style={[
                styles.fastToggleBtn,
                fastingToday
                  ? styles.fastToggleBtnActive
                  : styles.fastToggleBtnInactive,
              ]}
            >
              {fastingToday ? (
                <Check size={18} color={Colors.white} />
              ) : (
                <Moon size={18} color="rgba(255,255,255,0.7)" />
              )}
              <Text style={styles.fastToggleText}>
                {fastingToday ? "Fasting" : "Not Fasting"}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* ── Tomorrow ── */}
        <View style={styles.section}>
          <View style={[styles.tomorrowCard, Shadow.sm]}>
            <View style={styles.tomorrowLeft}>
              <Sun size={20} color={Colors.gold} />
              <Text style={styles.tomorrowLabel}>Tomorrow</Text>
            </View>
            <TouchableOpacity
              onPress={() => setFastingTomorrow((v) => !v)}
              activeOpacity={0.75}
              style={[
                styles.tomorrowToggle,
                fastingTomorrow
                  ? { backgroundColor: Colors.green, borderColor: Colors.green }
                  : {
                      backgroundColor: Colors.bgMuted,
                      borderColor: Colors.border,
                    },
              ]}
            >
              {fastingTomorrow ? (
                <Check size={14} color={Colors.white} />
              ) : null}
              <Text
                style={[
                  styles.tomorrowToggleText,
                  { color: fastingTomorrow ? Colors.white : Colors.textSub },
                ]}
              >
                {fastingTomorrow ? "Planned" : "Plan Fast"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Sunnah fasts list ── */}
        <View style={styles.section}>
          <SectionHeader title="Sunnah Fasts" />
          {SUNNAH_FASTS.map((fast, i) => (
            <View key={i} style={[styles.fastCard, Shadow.sm]}>
              <View
                style={[styles.fastColorBar, { backgroundColor: fast.color }]}
              />
              <View style={styles.fastContent}>
                <View style={styles.fastTop}>
                  <Text style={styles.fastName}>{fast.name}</Text>
                  {fast.isNext ? (
                    <View style={styles.nextBadge}>
                      <Star size={10} color={Colors.gold} />
                      <Text style={styles.nextBadgeText}>Next</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.fastDesc}>{fast.description}</Text>
                <View style={styles.fastMeta}>
                  <View style={styles.hadithBadge}>
                    <Text style={styles.hadithText}>{fast.hadith}</Text>
                  </View>
                  {fast.daysUntil !== null ? (
                    <Text style={styles.daysText}>in {fast.daysUntil}d</Text>
                  ) : null}
                </View>
              </View>
              <ChevronRight size={16} color={Colors.textMuted} />
            </View>
          ))}
        </View>

        {/* ── Niyyah (intention) ── */}
        <View style={styles.section}>
          <View style={[styles.niyyahCard, Shadow.sm]}>
            <View style={styles.niyyahTop}>
              <View style={styles.niyyahIconWrap}>
                <Info size={16} color={Colors.purple} />
              </View>
              <Text style={styles.niyyahTitle}>Intention (Niyyah)</Text>
            </View>
            <Text style={styles.niyyahArabic}>
              نَوَيْتُ صَوْمَ غَدٍ عَنْ أَدَاءِ فَرْضِ شَهْرِ رَمَضَانَ لِلَّهِ تَعَالَى
            </Text>
            <Text style={styles.niyyahTranslit}>
              "Nawaitu sauma ghadin an ada-i fardi shahri Ramadana lillahi ta'ala"
            </Text>
            <Text style={styles.niyyahMeaning}>
              "I intend to fast tomorrow as a fulfillment of the obligatory fast of Ramadan for the sake of Allah."
            </Text>
          </View>
        </View>

        {/* ── How to Fast ── */}
        <View style={styles.section}>
          <SectionHeader title="How to Fast" />
          {HOW_TO_FAST.map((step, i) => (
            <View key={i} style={[styles.stepCard, Shadow.sm]}>
              <View style={styles.stepIconWrap}>
                <Text style={styles.stepIcon}>{step.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 48 },

  header: {
    paddingHorizontal: Space.xl,
    paddingTop: Space.xl,
    paddingBottom: Space.md,
  },
  title: { color: Colors.gold, fontSize: Font.xxl, fontWeight: Weight.bold },
  sub: { color: Colors.textSub, fontSize: Font.sm, marginTop: 4 },

  section: { paddingHorizontal: Space.xl, marginBottom: Space.xl },

  statusCard: {
    borderRadius: Radius.xxl,
    padding: Space.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Space.md,
    flexWrap: "wrap",
  },
  statusLeft: { flex: 1, flexDirection: "row", alignItems: "center", minWidth: 160 },
  statusTitle: {
    color: Colors.white,
    fontSize: Font.md,
    fontWeight: Weight.bold,
  },
  statusDesc: {
    color: "rgba(255,255,255,0.75)",
    fontSize: Font.sm,
    marginTop: 3,
    lineHeight: 18,
  },
  fastToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space.xs,
    paddingVertical: 10,
    paddingHorizontal: Space.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
  },
  fastToggleBtnActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.5)",
  },
  fastToggleBtnInactive: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.25)",
  },
  fastToggleText: {
    color: Colors.white,
    fontSize: Font.sm,
    fontWeight: Weight.semibold,
  },

  tomorrowCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: Space.lg,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tomorrowLeft: { flexDirection: "row", alignItems: "center", gap: Space.sm },
  tomorrowLabel: {
    color: Colors.text,
    fontSize: Font.base,
    fontWeight: Weight.medium,
  },
  tomorrowToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space.xs,
    paddingVertical: 8,
    paddingHorizontal: Space.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  tomorrowToggleText: { fontSize: Font.sm, fontWeight: Weight.semibold },

  fastCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Space.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  fastColorBar: { width: 4, alignSelf: "stretch" },
  fastContent: { flex: 1, padding: Space.md },
  fastTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space.sm,
    marginBottom: 4,
  },
  fastName: {
    color: Colors.text,
    fontSize: Font.base,
    fontWeight: Weight.semibold,
    flex: 1,
  },
  nextBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.goldMuted,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  nextBadgeText: {
    color: Colors.gold,
    fontSize: Font.xs,
    fontWeight: Weight.bold,
  },
  fastDesc: {
    color: Colors.textSub,
    fontSize: Font.sm,
    lineHeight: 19,
    marginBottom: Space.sm,
  },
  fastMeta: { flexDirection: "row", alignItems: "center", gap: Space.sm },
  hadithBadge: {
    backgroundColor: Colors.bgMuted,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  hadithText: { color: Colors.textMuted, fontSize: Font.xs },
  daysText: { color: Colors.textMuted, fontSize: Font.xs },

  niyyahCard: {
    backgroundColor: Colors.purpleMuted,
    borderRadius: Radius.xl,
    padding: Space.lg,
    borderWidth: 1,
    borderColor: Colors.purpleBorder,
  },
  niyyahTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space.sm,
    marginBottom: Space.md,
  },
  niyyahIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: "rgba(124,58,237,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  niyyahTitle: {
    color: Colors.purple,
    fontSize: Font.base,
    fontWeight: Weight.bold,
  },
  niyyahArabic: {
    color: Colors.text,
    fontSize: 18,
    textAlign: "right",
    lineHeight: 32,
    marginBottom: Space.sm,
    fontWeight: Weight.medium,
  },
  niyyahTranslit: {
    color: Colors.textSub,
    fontSize: Font.sm,
    fontStyle: "italic",
    lineHeight: 20,
    marginBottom: Space.sm,
  },
  niyyahMeaning: { color: Colors.textMuted, fontSize: Font.sm, lineHeight: 20 },

  stepCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Space.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Space.md,
    marginBottom: Space.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgMuted,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepIcon: { fontSize: 24 },
  stepTitle: {
    color: Colors.text,
    fontSize: Font.base,
    fontWeight: Weight.semibold,
    marginBottom: 4,
  },
  stepDesc: { color: Colors.textSub, fontSize: Font.sm, lineHeight: 19 },
});
