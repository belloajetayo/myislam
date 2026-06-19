import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react-native";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email);
      if (err) throw err;
      setSent(true);
    } catch (err: any) {
      setError(err.message ?? "Failed to send reset email");
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
        <View style={{ flex: 1, padding: 24 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
            <ArrowLeft size={24} color="#F59E0B" />
          </TouchableOpacity>

          <Text style={{ color: "#F59E0B", fontSize: 24, fontWeight: "700", marginBottom: 8 }}>
            Reset Password
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 32 }}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          {sent ? (
            <View
              style={{
                backgroundColor: "rgba(16,185,129,0.1)",
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: "rgba(16,185,129,0.2)",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 40, marginBottom: 12 }}>📧</Text>
              <Text style={{ color: "#10B981", fontSize: 16, fontWeight: "600", textAlign: "center" }}>
                Check your email
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "center", marginTop: 8 }}>
                A password reset link has been sent to {email}
              </Text>
            </View>
          ) : (
            <>
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
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              />

              {error && (
                <Text style={{ color: "#EF4444", fontSize: 13, marginBottom: 12 }}>
                  {error}
                </Text>
              )}

              <TouchableOpacity
                onPress={handleReset}
                disabled={loading || !email}
                activeOpacity={0.8}
                style={{
                  backgroundColor: "#F59E0B",
                  borderRadius: 14,
                  paddingVertical: 15,
                  alignItems: "center",
                  opacity: !email ? 0.5 : 1,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
                    Send Reset Link
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
