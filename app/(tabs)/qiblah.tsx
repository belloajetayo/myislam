import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  FlatList,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Magnetometer is native-only — loaded dynamically to avoid web crash
let Magnetometer: any = null;
if (Platform.OS !== "web") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Magnetometer = require("expo-sensors").Magnetometer;
}
import { useSharedLocation } from "@/context/useSharedLocation";
import useNearbyMosques, { Mosque } from "@/hooks/useNearbyMosques";
import { MapPin, RefreshCw, Navigation, ExternalLink } from "lucide-react-native";

const KAABA_LAT = 21.4225;
const KAABA_LON = 39.8262;

const BG = "#110e24";
const GOLD = "#F59E0B";
const GREEN = "#10B981";

function getQiblahBearing(lat: number, lon: number): number {
  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (KAABA_LAT * Math.PI) / 180;
  const Δλ = ((KAABA_LON - lon) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDist(m: number) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

function openInMaps(name: string, lat: number, lng: number) {
  const url = Platform.OS === "ios"
    ? `maps://maps.apple.com/?q=${encodeURIComponent(name)}&ll=${lat},${lng}`
    : `geo:${lat},${lng}?q=${encodeURIComponent(name)}`;
  Linking.openURL(url).catch(() => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`);
  });
}

function openGoogleMapsSearch(lat?: number, lng?: number) {
  const url = lat && lng
    ? `https://www.google.com/maps/search/mosque/@${lat},${lng},14z`
    : "https://www.google.com/maps/search/mosque+near+me";
  Linking.openURL(url);
}

// ─── Compass tab ──────────────────────────────────────────────────────────────
function CompassTab() {
  const { location, loading: locationLoading } = useSharedLocation();
  const [magnetometer, setMagnetometer] = useState<{ x: number; y: number } | null>(null);
  const [available, setAvailable] = useState(true);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const lastAngle = useRef(0);

  useEffect(() => {
    let sub: any;
    if (!Magnetometer) { setAvailable(false); return; }
    Magnetometer.isAvailableAsync().then((avail: boolean) => {
      setAvailable(avail);
      if (!avail) return;
      Magnetometer.setUpdateInterval(100);
      sub = Magnetometer.addListener((data: { x: number; y: number }) => setMagnetometer(data));
    });
    return () => sub?.remove();
  }, []);

  const qiblahBearing = location ? getQiblahBearing(location.latitude, location.longitude) : 0;
  const compassHeading = magnetometer ? (Math.atan2(magnetometer.y, magnetometer.x) * 180) / Math.PI : 0;
  const arrowAngle = (qiblahBearing - compassHeading + 360) % 360;

  useEffect(() => {
    let diff = arrowAngle - lastAngle.current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const target = lastAngle.current + diff;
    lastAngle.current = target;
    Animated.spring(rotateAnim, { toValue: target, useNativeDriver: true, damping: 20, stiffness: 100 }).start();
  }, [arrowAngle]);

  const spin = rotateAnim.interpolate({ inputRange: [-360, 360], outputRange: ["-360deg", "360deg"] });
  const distanceKm = location ? haversineKm(location.latitude, location.longitude, KAABA_LAT, KAABA_LON) : null;

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "space-between", padding: 24 }}>
      <View style={{ alignItems: "center" }}>
        <Text style={{ color: GOLD, fontSize: 24, fontWeight: "700" }}>Qiblah Direction</Text>
        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>Point your device to find Mecca</Text>
      </View>

      <View style={{ alignItems: "center", justifyContent: "center" }}>
        {locationLoading ? (
          <ActivityIndicator color={GOLD} size="large" />
        ) : !available ? (
          <View style={{ alignItems: "center", padding: 24 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🧭</Text>
            <Text style={{ color: GOLD, fontSize: 16, fontWeight: "600", textAlign: "center" }}>Compass Not Available</Text>
            <Text style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", marginTop: 8 }}>Your device does not have a magnetometer sensor.</Text>
            {location && (
              <Text style={{ color: "rgba(255,255,255,0.6)", marginTop: 16, textAlign: "center", lineHeight: 22 }}>
                Bearing: {qiblahBearing.toFixed(1)}° from North{"\n"}Distance: {distanceKm?.toFixed(0)} km to Mecca
              </Text>
            )}
          </View>
        ) : (
          <>
            <View style={{ width: 260, height: 260, borderRadius: 130, borderWidth: 2, borderColor: "rgba(245,158,11,0.2)", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.03)" }}>
              {["N", "E", "S", "W"].map((dir, i) => {
                const angle = i * 90;
                const rad = (angle - 90) * (Math.PI / 180);
                const r = 100;
                return (
                  <Text key={dir} style={{ position: "absolute", left: 130 + r * Math.cos(rad) - 8, top: 130 + r * Math.sin(rad) - 10, color: dir === "N" ? GOLD : "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: "700" }}>
                    {dir}
                  </Text>
                );
              })}
              <Animated.View style={{ transform: [{ rotate: spin }], alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 80 }}>🕋</Text>
                <Text style={{ color: GOLD, fontSize: 12, marginTop: -8 }}>▲</Text>
              </Animated.View>
            </View>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 16 }}>
              Bearing: {qiblahBearing.toFixed(1)}°
            </Text>
          </>
        )}
      </View>

      <View style={{ alignItems: "center" }}>
        {distanceKm && (
          <View style={{ backgroundColor: "rgba(245,158,11,0.1)", borderRadius: 16, paddingHorizontal: 20, paddingVertical: 12, alignItems: "center", borderWidth: 1, borderColor: "rgba(245,158,11,0.2)" }}>
            <Text style={{ color: GOLD, fontSize: 20, fontWeight: "700" }}>{distanceKm.toFixed(0)} km</Text>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 }}>Distance to Mecca</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Mosques tab ──────────────────────────────────────────────────────────────
function MosquesTab() {
  const { location } = useSharedLocation();
  const { mosques, loading, error, refetch } = useNearbyMosques(20000);

  if (!location && loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <ActivityIndicator color={GREEN} size="large" />
        <Text style={{ color: "rgba(255,255,255,0.5)", marginTop: 12, textAlign: "center" }}>Acquiring your location…</Text>
      </View>
    );
  }

  if (error && !mosques.length) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>🕌</Text>
        <Text style={{ color: "#EF4444", fontSize: 15, fontWeight: "600", marginBottom: 8, textAlign: "center" }}>Could not load mosques</Text>
        <Text style={{ color: "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 20, marginBottom: 20 }}>{error}</Text>
        <View style={{ gap: 10, width: "100%" }}>
          <TouchableOpacity onPress={refetch} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 14, backgroundColor: "rgba(16,185,129,0.1)", borderWidth: 1, borderColor: "rgba(16,185,129,0.3)" }}>
            <RefreshCw size={16} color={GREEN} />
            <Text style={{ color: GREEN, fontSize: 14, fontWeight: "600" }}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openGoogleMapsSearch(location?.latitude, location?.longitude)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 14, backgroundColor: "rgba(59,130,246,0.1)", borderWidth: 1, borderColor: "rgba(59,130,246,0.3)" }}>
            <ExternalLink size={16} color="#3B82F6" />
            <Text style={{ color: "#3B82F6", fontSize: 14, fontWeight: "600" }}>Search on Google Maps</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Header row */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
        <View>
          <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, fontWeight: "700" }}>🕌 Mosques Near You</Text>
          <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>
            Within 20 km{loading && location ? " · Searching…" : ` · ${mosques.length} found`}
          </Text>
        </View>
        <TouchableOpacity onPress={refetch} disabled={loading} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "rgba(16,185,129,0.08)", borderWidth: 1, borderColor: "rgba(16,185,129,0.2)", opacity: loading ? 0.5 : 1 }}>
          {loading ? <ActivityIndicator size={14} color={GREEN} /> : <RefreshCw size={14} color={GREEN} />}
          <Text style={{ color: GREEN, fontSize: 12, fontWeight: "600" }}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Loading banner when refreshing an existing list */}
      {loading && mosques.length > 0 && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, paddingVertical: 8, backgroundColor: "rgba(16,185,129,0.05)", borderBottomWidth: 1, borderBottomColor: "rgba(16,185,129,0.1)" }}>
          <ActivityIndicator size={12} color={GREEN} />
          <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Updating results…</Text>
        </View>
      )}

      {/* Empty state */}
      {!loading && mosques.length === 0 && !error && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <MapPin size={40} color="rgba(255,255,255,0.2)" style={{ marginBottom: 12 }} />
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: "600", marginBottom: 8 }}>No Mosques Found</Text>
          <Text style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", lineHeight: 20, marginBottom: 20 }}>None found within 20 km. Try Google Maps for a broader search.</Text>
          <TouchableOpacity onPress={() => openGoogleMapsSearch(location?.latitude, location?.longitude)} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: "rgba(59,130,246,0.1)", borderWidth: 1, borderColor: "rgba(59,130,246,0.3)" }}>
            <ExternalLink size={16} color="#3B82F6" />
            <Text style={{ color: "#3B82F6", fontSize: 14, fontWeight: "600" }}>Open Google Maps</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={mosques}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }: { item: Mosque }) => (
          <TouchableOpacity
            onPress={() => openInMaps(item.name, item.lat, item.lng)}
            activeOpacity={0.75}
            style={{ flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", marginBottom: 10 }}>
            <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: "rgba(16,185,129,0.12)", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
              <MapPin size={20} color={GREEN} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: "600" }} numberOfLines={1}>{item.name}</Text>
              {item.address ? (
                <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }} numberOfLines={1}>{item.address}</Text>
              ) : (
                <Text style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginTop: 2, fontStyle: "italic" }}>Address not available</Text>
              )}
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, gap: 4 }}>
                <Navigation size={10} color={GREEN} />
                <Text style={{ color: GREEN, fontSize: 11, fontWeight: "700" }}>{fmtDist(item.distance)} away</Text>
              </View>
            </View>
            <ExternalLink size={14} color="rgba(255,255,255,0.25)" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
type Tab = "compass" | "mosques";

export default function QiblahScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("compass");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["top"]}>
      {/* Tab bar */}
      <View style={{ flexDirection: "row", marginHorizontal: 20, marginTop: 16, marginBottom: 4, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 14, padding: 4 }}>
        {(["compass", "mosques"] as Tab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: activeTab === tab ? GOLD : "transparent" }}>
            <Text style={{ color: activeTab === tab ? "white" : "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "700" }}>
              {tab === "compass" ? "🧭 Compass" : "🕌 Mosques"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "compass" ? <CompassTab /> : <MosquesTab />}
    </SafeAreaView>
  );
}
