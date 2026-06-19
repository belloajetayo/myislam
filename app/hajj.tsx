import { ScrollView, View, Text, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, ExternalLink } from "lucide-react-native";

const HAJJ_STEPS = [
  { day: "Day 1 – 8 Dhul Hijjah", title: "Arrive at Mina", desc: "Pilgrims travel to Mina and spend the night." },
  { day: "Day 2 – 9 Dhul Hijjah", title: "Wuquf at Arafat", desc: "The most important pillar of Hajj. Stand on the plain of Arafat from noon to sunset in prayer and supplication." },
  { day: "Day 2 (night)", title: "Muzdalifah", desc: "After sunset, move to Muzdalifah for Maghrib & Isha combined prayer. Collect pebbles for stoning." },
  { day: "Day 3 – 10 Dhul Hijjah", title: "Eid al-Adha & Stoning", desc: "Stone the largest Jamarat (Aqabah). Slaughter the sacrifice. Shave or trim hair. Tawaf al-Ifadah & Sa'i." },
  { day: "Days 4–6 – 11–13 Dhul Hijjah", title: "Tashreeq Days in Mina", desc: "Stone all three Jamarat each day after Zawal. Spend nights in Mina." },
  { day: "Final", title: "Farewell Tawaf", desc: "Perform the farewell Tawaf (Tawaf al-Wada') before leaving Makkah." },
];

const CHECKLIST = [
  "Valid Hajj visa & passport",
  "Ihram garments (men: 2 white sheets; women: modest clothing)",
  "Comfortable walking shoes",
  "Unscented toiletries",
  "Medications & first aid kit",
  "Small backpack with essentials",
  "Money belt / secure wallet",
  "Prayer mat & Qibla compass",
  "Phone charger & power bank",
  "Hajj guidebook / app",
];

export default function HajjScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#110e24" }} edges={["top"]}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 20, paddingBottom: 8 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <ArrowLeft size={24} color="#F59E0B" />
        </TouchableOpacity>
        <Text style={{ color: "#F59E0B", fontSize: 20, fontWeight: "700" }}>Hajj Guide</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Hero */}
        <View
          style={{
            backgroundColor: "rgba(245,158,11,0.08)",
            borderRadius: 20,
            padding: 20,
            alignItems: "center",
            marginBottom: 24,
            borderWidth: 1,
            borderColor: "rgba(245,158,11,0.15)",
          }}
        >
          <Text style={{ fontSize: 48, marginBottom: 8 }}>🕋</Text>
          <Text style={{ color: "#F59E0B", fontSize: 20, fontWeight: "700", marginBottom: 4 }}>
            Hajj — The Fifth Pillar
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", fontSize: 13, lineHeight: 20 }}>
            "And proclaim to the people the Hajj; they will come to you on foot and on every lean
            camel; they will come from every distant pass." — Qur'an 22:27
          </Text>
        </View>

        {/* Hajj Steps */}
        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>
          Hajj Rituals
        </Text>
        {HAJJ_STEPS.map((step, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(245,158,11,0.2)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
                marginTop: 2,
                flexShrink: 0,
              }}
            >
              <Text style={{ color: "#F59E0B", fontSize: 13, fontWeight: "700" }}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 2 }}>
                {step.day}
              </Text>
              <Text style={{ color: "white", fontSize: 15, fontWeight: "600", marginBottom: 4 }}>
                {step.title}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 20 }}>
                {step.desc}
              </Text>
            </View>
          </View>
        ))}

        {/* Checklist */}
        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600", marginBottom: 16, marginTop: 8, textTransform: "uppercase", letterSpacing: 1 }}>
          Packing Checklist
        </Text>
        {CHECKLIST.map((item, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
              paddingHorizontal: 14,
              paddingVertical: 12,
              backgroundColor: "rgba(255,255,255,0.04)",
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#10B981", marginRight: 12, fontSize: 16 }}>✓</Text>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>{item}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
