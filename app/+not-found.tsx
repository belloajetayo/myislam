import { View, Text, TouchableOpacity } from "react-native";
import { Link, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotFound() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#110e24" }}>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>🕌</Text>
        <Text style={{ color: "#F59E0B", fontSize: 24, fontWeight: "700", marginBottom: 8 }}>
          Page Not Found
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 32 }}>
          The page you are looking for doesn't exist.
        </Text>
        <Link href="/" asChild>
          <TouchableOpacity
            style={{ backgroundColor: "#F59E0B", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 }}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>Go Home</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
