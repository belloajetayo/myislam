import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ExactLocation,
  getStoredLastLocation,
  LOCATION_UPDATED_EVENT,
  resolveExactLocation,
} from "@/hooks/useExactLocation";
import { LocationContext } from "@/context/location-context";
import { appEvents } from "@/utils/events";

const initialStoredLocation = () => {
  const stored = getStoredLastLocation();
  return stored?.source === "default" ? null : stored;
};

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<ExactLocation | null>(
    initialStoredLocation
  );
  const [loading, setLoading] = useState(true);
  const [initialReady, setInitialReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshLocation = useCallback(
    async (opts?: { preferCache?: boolean }) => {
      setLoading(true);
      setError(null);
      try {
        const resolved = await resolveExactLocation({
          allowBrowser: true,
          preferCache: opts?.preferCache ?? false,
          timeout: 12000,
        });
        setLocation(resolved);
        return resolved;
      } catch {
        setError("Unable to resolve location");
        throw new Error("Unable to resolve location");
      } finally {
        setLoading(false);
        setInitialReady(true);
      }
    },
    []
  );

  useEffect(() => {
    void refreshLocation({ preferCache: false });
  }, [refreshLocation]);

  useEffect(() => {
    const unsub = appEvents.on<ExactLocation>(
      LOCATION_UPDATED_EVENT,
      (next) => {
        if (next) setLocation(next);
      }
    );
    return unsub;
  }, []);

  const value = useMemo(
    () => ({ location, loading, error, refreshLocation }),
    [location, loading, error, refreshLocation]
  );

  if (!initialReady) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#110e24", alignItems: "center", justifyContent: "center", padding: 24 }}
      >
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: 24,
            padding: 20,
            width: "100%",
            maxWidth: 300,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 32, marginBottom: 12 }}>🕌</Text>
          <Text style={{ color: "#F59E0B", fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
            Preparing Location
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, textAlign: "center", marginBottom: 16 }}>
            Allow location access so prayer times stay accurate.
          </Text>
          <ActivityIndicator color="#F59E0B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
  );
}
