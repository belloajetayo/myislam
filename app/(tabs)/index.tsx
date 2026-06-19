import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
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
} from "lucide-react-native";

// ─── Daily Reminders data ──────────────────────────────────────────────────────
const REMINDERS = [
  { text: "Whoever reads Surah Al-Kahf on Friday, light shall shine forth for him between the two Fridays.", source: "Al-Hakim", type: "hadith" },
  { text: "The best of you are those who learn the Quran and teach it.", source: "Sahih Al-Bukhari", type: "hadith" },
  { text: "Charity does not decrease wealth. Rather, it increases it.", source: "Muslim", type: "hadith" },
  { text: "Make dua in sujood — it is the closest you are to Allah.", source: "Daily Reminder", type: "reminder" },
  { text: "Indeed, with hardship comes ease. So when you have finished, then stand up for worship.", source: "Quran 94:6-7", type: "quran" },
  { text: "The strong person is the one who can control himself when he is angry.", source: "Sahih Al-Bukhari", type: "hadith" },
  { text: "Smile at your brother. It is charity.", source: "At-Tirmidhi", type: "hadith" },
  { text: "And whoever relies upon Allah — then He is sufficient for him.", source: "Quran 65:3", type: "quran" },
  { text: "Remember to make dhikr throughout your day: SubhanAllah, Alhamdulillah, Allahu Akbar.", source: "Daily Reminder", type: "reminder" },
  { text: "None of you truly believes until he loves for his brother what he loves for himself.", source: "Sahih Bukhari", type: "hadith" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function QuickAction({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={{ alignItems: "center", width: "22%" }}>
      <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center", marginBottom: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}>
        {icon}
      </View>
      <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, textAlign: "center" }}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { prayerTimes, location, hijriDate, loading, nextPrayer } = usePrayerTimes();
  const { progress } = useProgress();

  const [reminderIdx, setReminderIdx] = useState(() => getDayOfYear() % REMINDERS.length);
  const reminder = REMINDERS[reminderIdx];

  const hijriStr = hijriDate ? `${hijriDate.day} ${hijriDate.month.en} ${hijriDate.year} AH` : "";
  const prayedCount = progress.prayersCompleted.length;

  const progressStats = [
    { label: "Prayers", value: `${prayedCount}/5`, pct: (prayedCount / 5) * 100, color: "#2563EB", Icon: Target },
    { label: "Streak", value: `${progress.streak}d`, pct: Math.min((progress.streak / 30) * 100, 100), color: "#EA580C", Icon: Flame },
    { label: "Quran", value: `${progress.quranPagesRead}pg`, pct: Math.min((progress.quranPagesRead / 5) * 100, 100), color: "#059669", Icon: Award },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#110e24" }} edges={["top"]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{getGreeting()}</Text>
              <Text style={{ color: "#F59E0B", fontSize: 22, fontWeight: "700", marginTop: 2 }}>As-salamu Alaykum</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/profile")} activeOpacity={0.75}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(245,158,11,0.2)", alignItems: "center", justifyContent: "center" }}>
                <User size={20} color="#F59E0B" />
              </View>
            </TouchableOpacity>
          </View>

          {hijriStr ? (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
              <Text style={{ fontSize: 12, marginRight: 4 }}>🌙</Text>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{hijriStr}</Text>
            </View>
          ) : null}

          {location && (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
              <MapPin size={12} color="rgba(255,255,255,0.4)" />
              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginLeft: 4 }}>{location.city}, {location.country}</Text>
            </View>
          )}
        </View>

        {/* Next Prayer Card */}
        <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
          <View style={{ backgroundColor: "rgba(245,158,11,0.12)", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(245,158,11,0.25)" }}>
            {loading ? (
              <ActivityIndicator color="#F59E0B" />
            ) : (
              <>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 4 }}>Next Prayer</Text>
                <Text style={{ color: "#F59E0B", fontSize: 28, fontWeight: "700" }}>{nextPrayer || "—"}</Text>
                {prayerTimes && nextPrayer && (
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                    <Clock size={14} color="rgba(255,255,255,0.5)" />
                    <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginLeft: 6 }}>{prayerTimes[nextPrayer as keyof typeof prayerTimes]}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 16, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>Quick Access</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <QuickAction icon={<Clock size={22} color="#F59E0B" />} label="Prayer" onPress={() => router.push("/(tabs)/prayer")} />
            <QuickAction icon={<BookOpen size={22} color="#10B981" />} label="Quran" onPress={() => router.push("/(tabs)/quran")} />
            <QuickAction icon={<Compass size={22} color="#0EA5E9" />} label="Qiblah" onPress={() => router.push("/(tabs)/qiblah")} />
            <QuickAction icon={<Moon size={22} color="#8B5CF6" />} label="Fasting" onPress={() => router.push("/(tabs)/fasting")} />
            <QuickAction icon={<Calculator size={22} color="#F59E0B" />} label="Zakat" onPress={() => router.push("/zakat")} />
            <QuickAction icon={<Landmark size={22} color="#D97706" />} label="Hajj" onPress={() => router.push("/hajj")} />
            <QuickAction icon={<Heart size={22} color="#EF4444" />} label="Donate" onPress={() => router.push("/donate")} />
            <QuickAction icon={<Calendar size={22} color="#0EA5E9" />} label="Calendar" onPress={() => router.push("/calendar")} />
          </View>
        </View>

        {/* Today's Progress */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>Today's Progress</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {progressStats.map(s => (
              <View key={s.label} style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: `${s.color}22`, alignItems: "center", justifyContent: "center" }}>
                    <s.Icon size={14} color={s.color} />
                  </View>
                  <Text style={{ color: "white", fontSize: 14, fontWeight: "700" }}>{s.value}</Text>
                </View>
                <View style={{ height: 4, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                  <View style={{ height: 4, backgroundColor: s.color, borderRadius: 2, width: `${s.pct}%` }} />
                </View>
                <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: "600", marginTop: 6 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Daily Reminder */}
        <View style={{ marginHorizontal: 20, marginBottom: 20, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(245,158,11,0.2)", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                <Text style={{ fontSize: 18 }}>💡</Text>
              </View>
              <View>
                <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "700" }}>Daily Reminder</Text>
                <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Refresh your iman</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setReminderIdx(prev => (prev + 1) % REMINDERS.length)}
              style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" }}>
              <RefreshCw size={14} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </View>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 22, fontStyle: "italic", marginBottom: 10 }}>
            "{reminder.text}"
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ backgroundColor: "rgba(245,158,11,0.12)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: "#F59E0B", fontSize: 11, fontWeight: "600" }}>
                {reminder.type === "quran" ? "Qur'an" : reminder.type === "hadith" ? "Hadith" : "Reminder"}
              </Text>
            </View>
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>— {reminder.source}</Text>
          </View>
        </View>

        {/* Today's Prayers */}
        {prayerTimes && (
          <View style={{ marginHorizontal: 20 }}>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>Today's Prayers</Text>
            {(["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const).map(name => (
              <View
                key={name}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: progress.prayersCompleted.includes(name)
                    ? "rgba(16,185,129,0.06)"
                    : nextPrayer === name
                      ? "rgba(245,158,11,0.1)"
                      : "rgba(255,255,255,0.04)",
                  borderRadius: 12,
                  marginBottom: 8,
                  borderWidth: nextPrayer === name || progress.prayersCompleted.includes(name) ? 1 : 0,
                  borderColor: progress.prayersCompleted.includes(name) ? "rgba(16,185,129,0.25)" : "#F59E0B",
                }}>
                <Text style={{ color: progress.prayersCompleted.includes(name) ? "#10B981" : nextPrayer === name ? "#F59E0B" : "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: nextPrayer === name ? "600" : "400" }}>
                  {name}
                </Text>
                <Text style={{ color: progress.prayersCompleted.includes(name) ? "#10B981" : nextPrayer === name ? "#F59E0B" : "rgba(255,255,255,0.6)", fontSize: 15 }}>
                  {prayerTimes[name]}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
