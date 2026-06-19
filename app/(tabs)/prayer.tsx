import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, Check, Bell, BellOff } from "lucide-react-native";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useProgress } from "@/hooks/useProgress";
import {
  schedulePrayerNotifications,
  cancelPrayerNotifications,
  arePrayerNotificationsEnabled,
} from "@/utils/prayerNotifications";

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
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

export default function PrayerScreen() {
  const { prayerTimes, location, hijriDate, loading, error, currentPrayer, nextPrayer } = usePrayerTimes();
  const { progress, togglePrayer } = useProgress();

  const days = getLast7Days();
  const [selectedDayIdx, setSelectedDayIdx] = useState(6);
  const isToday = selectedDayIdx === 6;
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  useEffect(() => {
    arePrayerNotificationsEnabled().then(setNotifEnabled);
  }, []);

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

  const prayedCount = TRACKABLE.filter(p => progress.prayersCompleted.includes(p)).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#110e24" }} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#F59E0B", fontSize: 24, fontWeight: "700" }}>Prayer Times</Text>
              {hijriDate && (
                <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 4 }}>
                  🌙 {hijriDate.day} {hijriDate.month.en} {hijriDate.year} AH
                </Text>
              )}
              {location && (
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                  <MapPin size={13} color="rgba(255,255,255,0.4)" />
                  <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginLeft: 5 }}>
                    {location.city}, {location.country}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={toggleNotifications}
              disabled={notifLoading || !prayerTimes}
              activeOpacity={0.75}
              style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: notifEnabled ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: notifEnabled ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.1)", marginLeft: 12, opacity: notifLoading || !prayerTimes ? 0.5 : 1 }}>
              {notifEnabled ? <Bell size={18} color="#F59E0B" /> : <BellOff size={18} color="rgba(255,255,255,0.4)" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* 7-day date selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4 }}>
          {days.map((d, i) => {
            const isSelected = selectedDayIdx === i;
            const isT = i === 6;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedDayIdx(i)}
                style={{
                  alignItems: "center",
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 14,
                  marginRight: 8,
                  backgroundColor: isSelected ? "#F59E0B" : "rgba(255,255,255,0.05)",
                  borderWidth: isSelected ? 0 : 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  minWidth: 52,
                }}>
                <Text style={{ color: isSelected ? "white" : "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: "600", marginBottom: 3 }}>
                  {isT ? "Today" : DAY_LABELS[d.getDay()]}
                </Text>
                <Text style={{ color: isSelected ? "white" : "rgba(255,255,255,0.7)", fontSize: 16, fontWeight: "700" }}>
                  {d.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Progress bar (today only) */}
        {isToday && !loading && prayerTimes && (
          <View style={{ marginHorizontal: 20, marginTop: 16, marginBottom: 4 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Daily progress</Text>
              <Text style={{ color: "#F59E0B", fontSize: 12, fontWeight: "700" }}>{prayedCount}/5 prayed</Text>
            </View>
            <View style={{ height: 6, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3 }}>
              <View style={{ height: 6, backgroundColor: "#F59E0B", borderRadius: 3, width: `${(prayedCount / 5) * 100}%` }} />
            </View>
          </View>
        )}

        {/* Current/Next badge (today only) */}
        {isToday && !loading && currentPrayer && (
          <View style={{ marginHorizontal: 20, marginTop: 16, flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 14, padding: 14, alignItems: "center" }}>
              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: "600", marginBottom: 4 }}>CURRENT</Text>
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>{currentPrayer}</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "rgba(245,158,11,0.12)", borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "rgba(245,158,11,0.3)" }}>
              <Text style={{ color: "#F59E0B", fontSize: 10, fontWeight: "600", marginBottom: 4 }}>NEXT</Text>
              <Text style={{ color: "#F59E0B", fontSize: 16, fontWeight: "600" }}>{nextPrayer}</Text>
              {prayerTimes && nextPrayer && (
                <Text style={{ color: "rgba(245,158,11,0.7)", fontSize: 13, marginTop: 2 }}>
                  {prayerTimes[nextPrayer as keyof typeof prayerTimes]}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Prayer Times List */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          {loading ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <ActivityIndicator color="#F59E0B" size="large" />
              <Text style={{ color: "rgba(255,255,255,0.5)", marginTop: 12 }}>Loading prayer times…</Text>
            </View>
          ) : error ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Text style={{ color: "#EF4444", textAlign: "center" }}>{error}</Text>
            </View>
          ) : prayerTimes ? (
            ALL_PRAYERS.map(name => {
              const isNext = isToday && nextPrayer === name;
              const isCurrent = isToday && currentPrayer === name;
              const isTrackable = TRACKABLE.includes(name as any);
              const prayed = isTrackable && progress.prayersCompleted.includes(name);
              return (
                <View
                  key={name}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 16,
                    marginBottom: 10,
                    backgroundColor: prayed
                      ? "rgba(16,185,129,0.06)"
                      : isNext
                        ? "rgba(245,158,11,0.1)"
                        : "rgba(255,255,255,0.04)",
                    borderWidth: prayed || isNext ? 1 : 0,
                    borderColor: prayed ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.3)",
                  }}>
                  <Text style={{ fontSize: 22, marginRight: 12, width: 32 }}>{PRAYER_EMOJIS[name]}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      color: prayed ? "#10B981" : isNext ? "#F59E0B" : isCurrent ? "white" : "rgba(255,255,255,0.8)",
                      fontSize: 16,
                      fontWeight: isNext || isCurrent || prayed ? "600" : "400",
                    }}>
                      {name}
                    </Text>
                    {isCurrent && !isNext && (
                      <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 1 }}>Current prayer</Text>
                    )}
                    {prayed && (
                      <Text style={{ color: "rgba(16,185,129,0.7)", fontSize: 11, marginTop: 1 }}>Prayed ✓</Text>
                    )}
                  </View>
                  <Text style={{
                    color: prayed ? "#10B981" : isNext ? "#F59E0B" : "rgba(255,255,255,0.6)",
                    fontSize: 16,
                    fontWeight: isNext || prayed ? "700" : "400",
                    marginRight: isTrackable && isToday ? 12 : 0,
                  }}>
                    {prayerTimes[name as keyof typeof prayerTimes]}
                  </Text>

                  {/* Prayed checkmark (today only, not Sunrise) */}
                  {isTrackable && isToday && (
                    <TouchableOpacity
                      onPress={() => togglePrayer(name)}
                      activeOpacity={0.75}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        backgroundColor: prayed ? "#10B981" : "rgba(255,255,255,0.06)",
                        borderWidth: prayed ? 0 : 1,
                        borderColor: "rgba(255,255,255,0.15)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                      {prayed ? (
                        <Check size={16} color="white" />
                      ) : (
                        <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.3)" }} />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          ) : null}
        </View>

        {/* Completion message */}
        {isToday && prayedCount === 5 && (
          <View style={{ marginHorizontal: 20, marginTop: 8, padding: 16, backgroundColor: "rgba(16,185,129,0.08)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(16,185,129,0.2)", alignItems: "center" }}>
            <Text style={{ fontSize: 32, marginBottom: 6 }}>🤲</Text>
            <Text style={{ color: "#10B981", fontSize: 16, fontWeight: "700", marginBottom: 4 }}>MashaAllah!</Text>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "center" }}>
              You've completed all 5 daily prayers today. May Allah accept your worship.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
