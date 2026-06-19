import { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react-native";

const BG = "#110e24";
const GOLD = "#F59E0B";
const GREEN = "#10B981";

// ─── Hijri conversion (Gregorian → Hijri) ─────────────────────────────────────
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
  const hMonth = Math.floor((24 * L3) / 709);
  const hDay = L3 - Math.floor((709 * hMonth) / 24);
  return { day: hDay, month: hMonth, year: 30 * N + J - 30 };
}

const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani",
  "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhul Qadah", "Dhul Hijjah",
];

const IMPORTANT_DATES: Record<string, string> = {
  "1-1": "Islamic New Year",
  "10-1": "Day of Ashura",
  "12-3": "Mawlid an-Nabi",
  "27-7": "Isra and Mi'raj",
  "15-8": "Mid-Sha'ban",
  "1-9": "Start of Ramadan",
  "27-9": "Laylat al-Qadr (est.)",
  "1-10": "Eid al-Fitr",
  "9-12": "Day of Arafah",
  "10-12": "Eid al-Adha",
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const GREGORIAN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

interface CalCell {
  gregorianDay: number;
  hijri: { day: number; month: number; year: number };
  isCurrentMonth: boolean;
  isToday: boolean;
  importantDate?: string;
  isWhiteDay: boolean;
  isFriday: boolean;
}

function buildCalendarCells(year: number, month: number): CalCell[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = getDaysInMonth(year, month);
  const prevDays = getDaysInMonth(year, month - 1);

  const cells: CalCell[] = [];

  // Pad with previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevDays - i);
    const hijri = toHijri(d);
    cells.push({ gregorianDay: prevDays - i, hijri, isCurrentMonth: false, isToday: false, isWhiteDay: false, isFriday: d.getDay() === 5 });
  }

  // Current month
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const hijri = toHijri(d);
    const key = `${hijri.day}-${hijri.month}`;
    const isWhiteDay = hijri.day === 13 || hijri.day === 14 || hijri.day === 15;
    cells.push({
      gregorianDay: day,
      hijri,
      isCurrentMonth: true,
      isToday: d.getTime() === today.getTime(),
      importantDate: IMPORTANT_DATES[key],
      isWhiteDay,
      isFriday: d.getDay() === 5,
    });
  }

  // Fill remaining cells to 42
  let nextDay = 1;
  while (cells.length < 42) {
    const d = new Date(year, month + 1, nextDay);
    const hijri = toHijri(d);
    cells.push({ gregorianDay: nextDay++, hijri, isCurrentMonth: false, isToday: false, isWhiteDay: false, isFriday: d.getDay() === 5 });
  }

  return cells;
}

export default function CalendarScreen() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<CalCell | null>(null);

  const cells = useMemo(() => buildCalendarCells(year, month), [year, month]);

  const goToPrev = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const goToNext = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };
  const goToToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()); };

  const todayHijri = toHijri(now);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <ArrowLeft size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: GOLD, fontSize: 20, fontWeight: "700" }}>Islamic Calendar</Text>
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 1 }}>
              🌙 {todayHijri.day} {HIJRI_MONTHS[todayHijri.month - 1]} {todayHijri.year} AH
            </Text>
          </View>
        </View>

        {/* Month navigation */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 4 }}>
          <TouchableOpacity onPress={goToPrev} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" }}>
            <ChevronLeft size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToToday}>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "700", textAlign: "center" }}>{GREGORIAN_MONTHS[month]}</Text>
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textAlign: "center" }}>{year}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNext} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" }}>
            <ChevronRight size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Calendar grid */}
        <View style={{ marginHorizontal: 12, marginTop: 12 }}>
          {/* Day labels */}
          <View style={{ flexDirection: "row", marginBottom: 4 }}>
            {DAY_LABELS.map(d => (
              <View key={d} style={{ flex: 1, alignItems: "center", paddingVertical: 6 }}>
                <Text style={{ color: d === "Fri" ? GOLD : "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: "700" }}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Weeks */}
          {[0, 1, 2, 3, 4, 5].map(week => (
            <View key={week} style={{ flexDirection: "row", marginBottom: 4 }}>
              {cells.slice(week * 7, week * 7 + 7).map((cell, i) => {
                const isSelected = selected?.gregorianDay === cell.gregorianDay && selected.isCurrentMonth === cell.isCurrentMonth;
                const hasImportant = !!(cell.importantDate && cell.isCurrentMonth);
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => cell.isCurrentMonth ? setSelected(isSelected ? null : cell) : null}
                    activeOpacity={0.7}
                    style={{ flex: 1, aspectRatio: 1, alignItems: "center", justifyContent: "center", borderRadius: 10, marginHorizontal: 1, backgroundColor: cell.isToday ? GOLD : isSelected ? "rgba(245,158,11,0.18)" : "transparent", borderWidth: isSelected && !cell.isToday ? 1 : 0, borderColor: "rgba(245,158,11,0.4)" }}>
                    <Text style={{ color: cell.isToday ? "white" : !cell.isCurrentMonth ? "rgba(255,255,255,0.18)" : cell.isFriday ? GOLD : "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: cell.isToday || cell.isFriday ? "700" : "400" }}>
                      {cell.gregorianDay}
                    </Text>
                    {cell.isCurrentMonth && (
                      <Text style={{ color: cell.isToday ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)", fontSize: 8, marginTop: 1 }}>
                        {cell.hijri.day}
                      </Text>
                    )}
                    {hasImportant && (
                      <View style={{ position: "absolute", bottom: 3, width: 4, height: 4, borderRadius: 2, backgroundColor: GREEN }} />
                    )}
                    {cell.isCurrentMonth && cell.isWhiteDay && !hasImportant && (
                      <View style={{ position: "absolute", bottom: 3, width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.4)" }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 20, marginTop: 12, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: GOLD }} />
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Today</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN }} />
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Islamic event</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.3)" }} />
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Ayyam al-Beed</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ color: GOLD, fontSize: 11, fontWeight: "700" }}>Fri</Text>
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Friday (Jumu'ah)</Text>
          </View>
        </View>

        {/* Selected day info */}
        {selected && selected.isCurrentMonth && (
          <View style={{ marginHorizontal: 20, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" }}>
            <Text style={{ color: "white", fontSize: 16, fontWeight: "700", marginBottom: 4 }}>
              {GREGORIAN_MONTHS[month]} {selected.gregorianDay}, {year}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
              🌙 {selected.hijri.day} {HIJRI_MONTHS[selected.hijri.month - 1]} {selected.hijri.year} AH
            </Text>
            {selected.importantDate && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10, backgroundColor: "rgba(16,185,129,0.1)", borderRadius: 10, padding: 10 }}>
                <Text style={{ fontSize: 18 }}>✨</Text>
                <Text style={{ color: GREEN, fontSize: 14, fontWeight: "600" }}>{selected.importantDate}</Text>
              </View>
            )}
            {selected.isWhiteDay && !selected.importantDate && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 10, padding: 10 }}>
                <Text style={{ fontSize: 18 }}>🌕</Text>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Ayyam al-Beed — Sunnah fasting day</Text>
              </View>
            )}
          </View>
        )}

        {/* Upcoming Islamic events */}
        <View style={{ marginHorizontal: 20, marginTop: 20 }}>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            Islamic Events This Year
          </Text>
          {Object.entries(IMPORTANT_DATES).map(([key, name]) => (
            <View key={key} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN, marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "600" }}>{name}</Text>
                <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 2 }}>
                  {HIJRI_MONTHS[parseInt(key.split("-")[1]) - 1]} {key.split("-")[0]}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
