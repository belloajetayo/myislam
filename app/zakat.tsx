import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, Calculator } from "lucide-react-native";

const NISAB_GOLD_GRAMS = 87.48;
const GOLD_PRICE_USD_PER_GRAM = 95; // approximate, user can adjust
const ZAKAT_RATE = 0.025;

export default function ZakatScreen() {
  const router = useRouter();
  const [gold, setGold] = useState("");
  const [silver, setSilver] = useState("");
  const [cash, setCash] = useState("");
  const [investments, setInvestments] = useState("");
  const [receivables, setReceivables] = useState("");
  const [debts, setDebts] = useState("");
  const [calculated, setCalculated] = useState(false);

  const total =
    (parseFloat(cash) || 0) +
    (parseFloat(investments) || 0) +
    (parseFloat(receivables) || 0) +
    (parseFloat(gold) || 0) * GOLD_PRICE_USD_PER_GRAM -
    (parseFloat(debts) || 0);

  const nisab = NISAB_GOLD_GRAMS * GOLD_PRICE_USD_PER_GRAM;
  const zakatable = Math.max(0, total);
  const zakatDue = zakatable >= nisab ? zakatable * ZAKAT_RATE : 0;

  const Field = ({
    label,
    value,
    onChange,
    hint,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    hint?: string;
  }) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 6 }}>
        {label}
        {hint && <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}> ({hint})</Text>}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        placeholder="0.00"
        placeholderTextColor="rgba(255,255,255,0.25)"
        style={{
          backgroundColor: "rgba(255,255,255,0.06)",
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          color: "white",
          fontSize: 15,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
        }}
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#110e24" }} edges={["top"]}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 20, paddingBottom: 8 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <ArrowLeft size={24} color="#F59E0B" />
        </TouchableOpacity>
        <Text style={{ color: "#F59E0B", fontSize: 20, fontWeight: "700" }}>Zakat Calculator</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Info card */}
        <View
          style={{
            backgroundColor: "rgba(245,158,11,0.08)",
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: "rgba(245,158,11,0.15)",
          }}
        >
          <Text style={{ color: "#F59E0B", fontSize: 14, fontWeight: "600", marginBottom: 4 }}>
            About Zakat
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 20 }}>
            Zakat is 2.5% of your total zakatable assets above the Nisab threshold
            (~{nisab.toFixed(0)} USD based on gold).
          </Text>
        </View>

        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>
          Assets
        </Text>

        <Field label="Cash & Bank Savings (USD)" value={cash} onChange={setCash} />
        <Field label="Investments & Stocks (USD)" value={investments} onChange={setInvestments} />
        <Field label="Money Owed to You (USD)" value={receivables} onChange={setReceivables} />
        <Field label="Gold (grams)" value={gold} onChange={setGold} hint="~$95/g" />
        <Field label="Silver (USD value)" value={silver} onChange={setSilver} />

        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600", marginBottom: 16, marginTop: 8, textTransform: "uppercase", letterSpacing: 1 }}>
          Liabilities
        </Text>

        <Field label="Immediate Debts (USD)" value={debts} onChange={setDebts} />

        <TouchableOpacity
          onPress={() => setCalculated(true)}
          activeOpacity={0.8}
          style={{
            backgroundColor: "#F59E0B",
            borderRadius: 14,
            paddingVertical: 15,
            alignItems: "center",
            marginTop: 8,
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Calculator size={18} color="white" style={{ marginRight: 8 }} />
            <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
              Calculate Zakat
            </Text>
          </View>
        </TouchableOpacity>

        {calculated && (
          <View
            style={{
              backgroundColor: zakatable >= nisab
                ? "rgba(16,185,129,0.1)"
                : "rgba(255,255,255,0.05)",
              borderRadius: 20,
              padding: 24,
              alignItems: "center",
              borderWidth: 1,
              borderColor: zakatable >= nisab
                ? "rgba(16,185,129,0.25)"
                : "rgba(255,255,255,0.08)",
            }}
          >
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 4 }}>
              Net Zakatable Assets
            </Text>
            <Text style={{ color: "white", fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
              ${zakatable.toFixed(2)}
            </Text>

            {zakatable < nisab ? (
              <>
                <Text style={{ fontSize: 36, marginBottom: 8 }}>ℹ️</Text>
                <Text style={{ color: "rgba(255,255,255,0.6)", textAlign: "center", fontSize: 14, lineHeight: 22 }}>
                  Your assets are below the Nisab threshold (${nisab.toFixed(0)}).{"\n"}
                  Zakat is not obligatory this year.
                </Text>
              </>
            ) : (
              <>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 4 }}>
                  Zakat Due (2.5%)
                </Text>
                <Text style={{ color: "#10B981", fontSize: 32, fontWeight: "700" }}>
                  ${zakatDue.toFixed(2)}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 8, textAlign: "center" }}>
                  May Allah accept your Zakat and bless your wealth.
                </Text>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
