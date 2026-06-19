import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { Moon, Sun } from "lucide-react-native";
import { useState, useMemo } from "react";
import { mmkv } from "@/utils/storage";

const FASTING_KEY = "fasting_days_v1";

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getStoredFastingDays(): Record<string, boolean> {
  try {
    const raw = mmkv.getString(FASTING_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveFastingDays(days: Record<string, boolean>) {
  mmkv.set(FASTING_KEY, JSON.stringify(days));
}

// ─── Hijri conversion ──────────────────────────────────────────────────────────
const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhul Qadah", "Dhul Hijjah",
];

function toHijri(date: Date): { day: number; month: number; year: number } {
  const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
  const jdn = Math.floor((1461 * (y + 4800 + Math.floor((m - 14) / 12))) / 4)
    + Math.floor((367 * (m - 2 - 12 * Math.floor((m - 14) / 12))) / 12)
    - Math.floor((3 * Math.floor((y + 4900 + Math.floor((m - 14) / 12)) / 100)) / 4)
    + d - 32075;
  const L = jdn - 1948440 + 10632;
  const N = Math.floor((L - 1) / 10631);
  const L2 = L - 10631 * N + 354;
  const J = Math.floor((10985 - L2) / 5316) * Math.floor((50 * L2) / 17719)
    + Math.floor(L2 / 5670) * Math.floor((43 * L2) / 15238);
  const L3 = L2 - Math.floor((30 - J) / 15) * Math.floor((17719 * J) / 50)
    - Math.floor(J / 16) * Math.floor((15238 * J) / 43) + 29;
  return { day: L3 - Math.floor((709 * Math.floor((24 * L3) / 709)) / 24), month: Math.floor((24 * L3) / 709), year: 30 * N + J - 30 };
}

function getNextSunnahFastDays(now: Date, count = 5) {
  const results: { label: string; date: Date; arabicLabel: string }[] = [];
  const cursor = new Date(now);
  cursor.setDate(cursor.getDate() + 1);
  cursor.setHours(0, 0, 0, 0);

  for (let safety = 0; safety < 365 && results.length < count; safety++) {
    const h = toHijri(cursor);
    const dow = cursor.getDay();
    let label = "", arabicLabel = "";

    if (dow === 1) { label = "Monday"; arabicLabel = "الاثنين"; }
    else if (dow === 4) { label = "Thursday"; arabicLabel = "الخميس"; }
    else if (h.day === 13 || h.day === 14 || h.day === 15) {
      label = `White Day (${h.day} ${HIJRI_MONTHS[h.month - 1]})`;
      arabicLabel = `أيام البيض — ${h.day}`;
    } else if (h.month === 12 && h.day === 9) {
      label = "Day of Arafah (9 Dhul Hijjah)"; arabicLabel = "يوم عرفة";
    } else if (h.month === 1 && h.day === 10) {
      label = "Ashura (10 Muharram)"; arabicLabel = "يوم عاشوراء";
    }

    if (label) results.push({ label, date: new Date(cursor), arabicLabel });
    cursor.setDate(cursor.getDate() + 1);
  }
  return results;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function daysUntil(d: Date) {
  const diff = d.getTime() - new Date().setHours(0, 0, 0, 0);
  const days = Math.ceil(diff / 86400000);
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export default function FastingScreen() {
  const { prayerTimes, hijriDate, location, loading } = usePrayerTimes();
  const [fastingDays, setFastingDays] = useState<Record<string, boolean>>(getStoredFastingDays);

  const todayKey = getTodayKey();
  const isFastingToday = fastingDays[todayKey] === true;

  const toggleFasting = () => {
    const next = { ...fastingDays, [todayKey]: !isFastingToday };
    saveFastingDays(next);
    setFastingDays(next);
    // also track total count in localStorage for profile badges
    const total = Object.values(next).filter(Boolean).length;
    localStorage.setItem("fasting_days_total", String(total));
  };

  const fastingCount = Object.values(fastingDays).filter(Boolean).length;

  const currentMonth = hijriDate?.month?.number;
  const isRamadan = currentMonth === 9;
  const monthsToRamadan = currentMonth ? (currentMonth < 9 ? 9 - currentMonth : 12 - currentMonth + 9) : null;

  const sunnahDays = useMemo(() => getNextSunnahFastDays(new Date(), 5), []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#110e24" }} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}>
          <Text style={{ color: "#F59E0B", fontSize: 24, fontWeight: "700" }}>Fasting / Sawm</Text>
          {hijriDate && (
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>
              🌙 {hijriDate.day} {hijriDate.month.en} {hijriDate.year} AH
            </Text>
          )}
        </View>

        {/* Ramadan status */}
        <View style={{ marginHorizontal: 20, marginBottom: 16 }}>
          <View style={{ backgroundColor: isRamadan ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.05)", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: isRamadan ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.08)", alignItems: "center" }}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>{isRamadan ? "🌙✨" : "🕌"}</Text>
            {isRamadan ? (
              <>
                <Text style={{ color: "#8B5CF6", fontSize: 20, fontWeight: "700" }}>Ramadan Mubarak!</Text>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 }}>It is the blessed month of Ramadan</Text>
              </>
            ) : (
              <>
                <Text style={{ color: "#F59E0B", fontSize: 16, fontWeight: "600" }}>Next Ramadan</Text>
                {monthsToRamadan !== null && (
                  <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 }}>
                    ~{monthsToRamadan} month{monthsToRamadan !== 1 ? "s" : ""} away
                  </Text>
                )}
              </>
            )}
          </View>
        </View>

        {/* Today's fasting tracker */}
        <View style={{ marginHorizontal: 20, marginBottom: 16 }}>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Today's Fast</Text>
          <TouchableOpacity
            onPress={toggleFasting}
            activeOpacity={0.8}
            style={{ backgroundColor: isFastingToday ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)", borderRadius: 16, padding: 20, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: isFastingToday ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.08)" }}>
            <Text style={{ fontSize: 32, marginRight: 16 }}>{isFastingToday ? "✅" : "⭕"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: isFastingToday ? "#10B981" : "rgba(255,255,255,0.8)", fontSize: 17, fontWeight: "600" }}>
                {isFastingToday ? "Fasting Today" : "Not Fasting Today"}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>Tap to toggle</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={{ marginHorizontal: 20, marginBottom: 16 }}>
          <View style={{ backgroundColor: "rgba(245,158,11,0.08)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(245,158,11,0.15)", alignItems: "center" }}>
            <Text style={{ color: "#F59E0B", fontSize: 32, fontWeight: "700" }}>{fastingCount}</Text>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 }}>Days fasted (all time)</Text>
          </View>
        </View>

        {/* Suhoor & Iftar times */}
        {loading ? (
          <View style={{ alignItems: "center", padding: 20 }}>
            <ActivityIndicator color="#F59E0B" />
          </View>
        ) : prayerTimes ? (
          <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Fasting Times</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
                <Moon size={24} color="#8B5CF6" />
                <Text style={{ color: "#8B5CF6", fontSize: 13, fontWeight: "600", marginTop: 8 }}>Suhoor ends</Text>
                <Text style={{ color: "white", fontSize: 18, fontWeight: "700", marginTop: 4 }}>{prayerTimes.Fajr}</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: "rgba(245,158,11,0.08)", borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "rgba(245,158,11,0.2)" }}>
                <Sun size={24} color="#F59E0B" />
                <Text style={{ color: "#F59E0B", fontSize: 13, fontWeight: "600", marginTop: 8 }}>Iftar time</Text>
                <Text style={{ color: "white", fontSize: 18, fontWeight: "700", marginTop: 4 }}>{prayerTimes.Maghrib}</Text>
              </View>
            </View>
            {location && (
              <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, textAlign: "center", marginTop: 12 }}>
                Based on your location: {location.city}
              </Text>
            )}
          </View>
        ) : null}

        {/* Sunnah Fasting Days */}
        <View style={{ marginHorizontal: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>Upcoming Sunnah Fasts</Text>
          </View>
          <View style={{ backgroundColor: "rgba(16,185,129,0.04)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(16,185,129,0.12)", overflow: "hidden" }}>
            {sunnahDays.map((item, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: i < sunnahDays.length - 1 ? 1 : 0, borderBottomColor: "rgba(255,255,255,0.06)" }}>
                <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: "rgba(16,185,129,0.12)", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                  <Text style={{ fontSize: 18 }}>🌙</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: "600" }}>{item.label}</Text>
                  <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>{fmtDate(item.date)}</Text>
                </View>
                <View style={{ backgroundColor: "rgba(16,185,129,0.12)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                  <Text style={{ color: "#10B981", fontSize: 11, fontWeight: "700" }}>{daysUntil(item.date)}</Text>
                </View>
              </View>
            ))}
          </View>
          <Text style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, textAlign: "center", marginTop: 10, lineHeight: 16 }}>
            Includes Mondays, Thursdays, Ayyam al-Beed, Ashura, and Day of Arafah
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
