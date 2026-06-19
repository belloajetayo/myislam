import { ScrollView, View, Text, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Heart, ExternalLink } from "lucide-react-native";

const CHARITY_ORGS = [
  {
    name: "Islamic Relief",
    desc: "Emergency humanitarian aid, food, water, and education worldwide.",
    url: "https://www.islamic-relief.org/donate/",
    emoji: "🌍",
  },
  {
    name: "Human Appeal",
    desc: "Sustainable development and emergency response programs.",
    url: "https://humanappeal.org.uk/donate/",
    emoji: "🤝",
  },
  {
    name: "Penny Appeal",
    desc: "Small change, big difference — poverty relief across Asia & Africa.",
    url: "https://pennyappeal.org/",
    emoji: "💛",
  },
  {
    name: "Al-Mustafa Trust",
    desc: "Orphans, widows, education, and disaster relief.",
    url: "https://almustafatrust.org/",
    emoji: "🏫",
  },
  {
    name: "Ummah Welfare Trust",
    desc: "Medical aid, food, and shelter for the most vulnerable.",
    url: "https://uwt.org/",
    emoji: "🏥",
  },
];

export default function DonateScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#110e24" }} edges={["top"]}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 20, paddingBottom: 8 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <ArrowLeft size={24} color="#F59E0B" />
        </TouchableOpacity>
        <Text style={{ color: "#F59E0B", fontSize: 20, fontWeight: "700" }}>Donate / Sadaqah</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Hero */}
        <View
          style={{
            backgroundColor: "rgba(239,68,68,0.08)",
            borderRadius: 20,
            padding: 20,
            alignItems: "center",
            marginBottom: 24,
            borderWidth: 1,
            borderColor: "rgba(239,68,68,0.15)",
          }}
        >
          <Heart size={40} color="#EF4444" fill="#EF4444" style={{ marginBottom: 12 }} />
          <Text style={{ color: "#EF4444", fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
            Give Sadaqah
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", fontSize: 13, lineHeight: 20 }}>
            "The parable of those who spend their wealth in the way of Allah is that of a grain of
            corn: it grows seven ears, and each ear has a hundred grains." — Qur'an 2:261
          </Text>
        </View>

        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>
          Trusted Charities
        </Text>

        {CHARITY_ORGS.map((org) => (
          <TouchableOpacity
            key={org.name}
            onPress={() => Linking.openURL(org.url)}
            activeOpacity={0.75}
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <Text style={{ fontSize: 32, marginRight: 14 }}>{org.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "white", fontSize: 15, fontWeight: "600", marginBottom: 3 }}>
                {org.name}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 18 }}>
                {org.desc}
              </Text>
            </View>
            <ExternalLink size={18} color="rgba(255,255,255,0.3)" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        ))}

        <View
          style={{
            marginTop: 8,
            backgroundColor: "rgba(245,158,11,0.06)",
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: "rgba(245,158,11,0.12)",
          }}
        >
          <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textAlign: "center", lineHeight: 18 }}>
            All links open the charity's official website. My Islam does not process payments
            directly. Please verify the authenticity of any donation page before giving.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
