import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/integrations/supabase/client";

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "signin") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        router.replace("/");
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setMessage("Check your email to confirm your account.");
      }
    } catch (err: any) {
      setError(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#110e24" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
          <Text style={{ fontSize: 40, textAlign: "center", marginBottom: 8 }}>🕌</Text>
          <Text style={{ color: "#F59E0B", fontSize: 26, fontWeight: "700", textAlign: "center", marginBottom: 4 }}>
            My Islam
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: 36, fontSize: 14 }}>
            {mode === "signin" ? "Sign in to your account" : "Create your account"}
          </Text>

          {/* Mode toggle */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "rgba(255,255,255,0.06)",
              borderRadius: 12,
              padding: 4,
              marginBottom: 24,
            }}
          >
            {(["signin", "signup"] as const).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => { setMode(m); setError(null); setMessage(null); }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: mode === m ? "#F59E0B" : "transparent",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: mode === m ? "white" : "rgba(255,255,255,0.5)",
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  {m === "signin" ? "Sign In" : "Sign Up"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Fields */}
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor="rgba(255,255,255,0.3)"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              backgroundColor: "rgba(255,255,255,0.07)",
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: "white",
              fontSize: 15,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
            }}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.3)"
            secureTextEntry
            style={{
              backgroundColor: "rgba(255,255,255,0.07)",
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: "white",
              fontSize: 15,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
            }}
          />

          {error && (
            <Text style={{ color: "#EF4444", textAlign: "center", marginBottom: 12, fontSize: 13 }}>
              {error}
            </Text>
          )}
          {message && (
            <Text style={{ color: "#10B981", textAlign: "center", marginBottom: 12, fontSize: 13 }}>
              {message}
            </Text>
          )}

          <TouchableOpacity
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.8}
            style={{
              backgroundColor: "#F59E0B",
              borderRadius: 14,
              paddingVertical: 15,
              alignItems: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
                {mode === "signin" ? "Sign In" : "Create Account"}
              </Text>
            )}
          </TouchableOpacity>

          {mode === "signin" && (
            <TouchableOpacity
              onPress={() => router.push("/reset-password")}
              style={{ alignItems: "center", marginTop: 16 }}
            >
              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                Forgot password?
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => router.back()}
            style={{ alignItems: "center", marginTop: 24 }}
          >
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
              Continue without account
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
