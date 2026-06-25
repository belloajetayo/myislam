import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Line, Text as SvgText, G } from "react-native-svg";
import { Compass, Navigation, MapPin, RotateCcw } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSharedLocation } from "@/context/useSharedLocation";
import { QiblahColors, Font, Weight, Space, Radius } from "@/theme/tokens";

const { width: SCREEN_W } = Dimensions.get("window");
const COMPASS_SIZE = Math.min(SCREEN_W - 64, 300);
const R = COMPASS_SIZE / 2;
const CENTER = R;

// Kaaba GPS coordinates
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function calcQiblahBearing(lat: number, lng: number): number {
  const φ1 = toRad(lat);
  const φ2 = toRad(KAABA_LAT);
  const Δλ = toRad(KAABA_LNG - lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// Compass tick marks at 8 cardinal/intercardinal positions
const TICK_LABELS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

export default function QiblahScreen() {
  const router = useRouter();
  const { location } = useSharedLocation();

  const [compassHeading, setCompassHeading] = useState<number | null>(null);
  const [sensorAvailable, setSensorAvailable] = useState(false);
  const [calibrating, setCalibrating] = useState(false);

  const qiblahBearing = location
    ? calcQiblahBearing(location.latitude, location.longitude)
    : null;

  // Native compass via expo-sensors Magnetometer
  useEffect(() => {
    if (Platform.OS === "web") return;

    let subscription: any = null;

    (async () => {
      try {
        const sensors = await import("expo-sensors");
        const Magnetometer = sensors.Magnetometer;
        const { status } = await Magnetometer.requestPermissionsAsync();
        if (status !== "granted") return;

        const available = await Magnetometer.isAvailableAsync();
        if (!available) return;

        setSensorAvailable(true);
        Magnetometer.setUpdateInterval(100);
        subscription = Magnetometer.addListener(
          ({ x, y }: { x: number; y: number }) => {
            let angle = Math.atan2(y, x) * (180 / Math.PI);
            angle = (angle + 360) % 360;
            setCompassHeading(angle);
          }
        );
      } catch (e) {
        // sensor not available on this device
      }
    })();

    return () => {
      subscription?.remove?.();
    };
  }, []);

  // Web compass via DeviceOrientation API
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handler = (event: any) => {
      // webkitCompassHeading is iOS Safari; alpha is Android/Chrome (reversed)
      const heading =
        event.webkitCompassHeading !== undefined
          ? event.webkitCompassHeading
          : ((360 - event.alpha) % 360);
      setCompassHeading(heading);
      setSensorAvailable(true);
    };

    // deviceorientationabsolute is more accurate on Android Chrome
    window.addEventListener(
      "deviceorientationabsolute",
      handler as EventListener,
      true
    );
    window.addEventListener(
      "deviceorientation",
      handler as EventListener,
      true
    );

    // iOS 13+ requires user permission
    if (
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      (DeviceOrientationEvent as any)
        .requestPermission()
        .then((state: string) => {
          if (state !== "granted") setSensorAvailable(false);
        })
        .catch(() => setSensorAvailable(false));
    }

    return () => {
      window.removeEventListener(
        "deviceorientationabsolute",
        handler as EventListener
      );
      window.removeEventListener("deviceorientation", handler as EventListener);
    };
  }, []);

  const handleCalibrate = () => {
    setCalibrating(true);
    setCompassHeading(null);
    setTimeout(() => setCalibrating(false), 2000);
  };

  // Needle rotation: qiblah bearing relative to device heading.
  // If no sensor, show static bearing from North (still useful).
  const needleRotation =
    compassHeading !== null && qiblahBearing !== null
      ? qiblahBearing - compassHeading
      : qiblahBearing ?? 0;

  const isFacingQiblah =
    compassHeading !== null &&
    qiblahBearing !== null &&
    Math.abs(((qiblahBearing - compassHeading + 540) % 360) - 180) < 10;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerIconWrap}>
            <Compass size={22} color={QiblahColors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Qiblah Compass</Text>
            <Text style={styles.headerSub}>Direction to the Kaaba, Mecca</Text>
          </View>
        </View>

        {/* ── Facing Qiblah banner ── */}
        {isFacingQiblah ? (
          <View style={styles.facingBanner}>
            <Text style={styles.facingText}>🕌 You are facing the Qiblah!</Text>
          </View>
        ) : null}

        {/* ── Compass rose ── */}
        <View style={styles.compassWrap}>
          <View style={styles.glowRing} />
          <Svg
            width={COMPASS_SIZE}
            height={COMPASS_SIZE}
            viewBox={`0 0 ${COMPASS_SIZE} ${COMPASS_SIZE}`}
          >
            {/* Outer ring */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={R - 4}
              fill="none"
              stroke={QiblahColors.border}
              strokeWidth={1.5}
            />
            {/* Inner fill */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={R * 0.55}
              fill={QiblahColors.surface}
              stroke={QiblahColors.border}
              strokeWidth={1}
            />

            {/* 8 tick marks + labels */}
            {TICK_LABELS.map((label, i) => {
              const angleDeg = i * 45;
              const rad = toRad(angleDeg - 90);
              const outerR = R - 6;
              const innerR = R - 22;
              const labelR = R - 36;
              const isCardinal =
                label === "N" ||
                label === "S" ||
                label === "E" ||
                label === "W";
              return (
                <G key={label}>
                  <Line
                    x1={CENTER + outerR * Math.cos(rad)}
                    y1={CENTER + outerR * Math.sin(rad)}
                    x2={CENTER + innerR * Math.cos(rad)}
                    y2={CENTER + innerR * Math.sin(rad)}
                    stroke={label === "N" ? "#EF4444" : QiblahColors.textSub}
                    strokeWidth={isCardinal ? 2 : 1}
                  />
                  <SvgText
                    x={CENTER + labelR * Math.cos(rad)}
                    y={CENTER + labelR * Math.sin(rad)}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fill={label === "N" ? "#EF4444" : QiblahColors.text}
                    fontSize={label.length === 1 ? 13 : 10}
                    fontWeight="600"
                  >
                    {label}
                  </SvgText>
                </G>
              );
            })}

            {/* Qiblah needle — rotates to point toward Mecca */}
            <G transform={`rotate(${needleRotation}, ${CENTER}, ${CENTER})`}>
              {/* Gold tip toward Qiblah */}
              <Line
                x1={CENTER}
                y1={CENTER}
                x2={CENTER}
                y2={CENTER - R * 0.48}
                stroke={QiblahColors.gold}
                strokeWidth={4}
                strokeLinecap="round"
              />
              {/* Blue tail */}
              <Line
                x1={CENTER}
                y1={CENTER}
                x2={CENTER}
                y2={CENTER + R * 0.3}
                stroke={QiblahColors.blue}
                strokeWidth={3}
                strokeLinecap="round"
              />
              {/* Pivot */}
              <Circle cx={CENTER} cy={CENTER} r={7} fill={QiblahColors.gold} />
              <Circle cx={CENTER} cy={CENTER} r={3} fill={QiblahColors.bg} />
            </G>

            {/* Kaaba emoji */}
            <SvgText
              x={CENTER}
              y={CENTER + R * 0.16}
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize={20}
            >
              🕋
            </SvgText>
          </Svg>

          {/* No sensor hint */}
          {!sensorAvailable && !calibrating ? (
            <View style={styles.noSensorOverlay}>
              <Navigation size={18} color={QiblahColors.textSub} />
              <Text style={styles.noSensorText}>
                {Platform.OS === "web"
                  ? "Tap to enable device orientation"
                  : "Compass sensor unavailable"}
              </Text>
              {qiblahBearing !== null ? (
                <Text style={styles.staticBearingText}>
                  Bearing from North: {Math.round(qiblahBearing)}°
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* ── Info cards ── */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Heading</Text>
            <Text style={styles.infoValue}>
              {compassHeading !== null ? `${Math.round(compassHeading)}°` : "—"}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Qiblah</Text>
            <Text style={[styles.infoValue, { color: QiblahColors.gold }]}>
              {qiblahBearing !== null ? `${Math.round(qiblahBearing)}°` : "—"}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Source</Text>
            <Text style={styles.infoValue}>
              {location?.source ?? "—"}
            </Text>
          </View>
        </View>

        {/* ── Action buttons ── */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={handleCalibrate}
            activeOpacity={0.75}
            style={styles.calibrateBtn}
          >
            <RotateCcw size={16} color={QiblahColors.gold} />
            <Text style={styles.calibrateBtnText}>
              {calibrating ? "Calibrating…" : "Calibrate"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/mosques" as any)}
            activeOpacity={0.75}
            style={styles.mosqueBtn}
          >
            <MapPin size={16} color={QiblahColors.white} />
            <Text style={styles.mosqueBtnText}>Mosque Near Me</Text>
          </TouchableOpacity>
        </View>

        {/* Desktop notice */}
        {Platform.OS === "web" && !sensorAvailable ? (
          <View style={styles.webTip}>
            <Text style={styles.webTipText}>
              On desktop browsers, compass data is unavailable. For accurate
              real-time direction, use the mobile app.
            </Text>
          </View>
        ) : null}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: QiblahColors.bg },
  scroll: { paddingBottom: 48 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Space.xl,
    paddingTop: Space.xl,
    paddingBottom: Space.lg,
    gap: Space.md,
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: QiblahColors.goldMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: QiblahColors.goldBorder,
  },
  headerTitle: {
    color: QiblahColors.text,
    fontSize: Font.xl,
    fontWeight: Weight.bold,
  },
  headerSub: { color: QiblahColors.textSub, fontSize: Font.sm, marginTop: 2 },

  facingBanner: {
    marginHorizontal: Space.xl,
    padding: Space.md,
    borderRadius: Radius.lg,
    backgroundColor: QiblahColors.greenMuted,
    borderWidth: 1,
    borderColor: QiblahColors.greenBorder,
    alignItems: "center",
    marginBottom: Space.md,
  },
  facingText: {
    color: QiblahColors.green,
    fontSize: Font.base,
    fontWeight: Weight.semibold,
  },

  compassWrap: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: Space.xxl,
    position: "relative",
  },
  glowRing: {
    position: "absolute",
    width: COMPASS_SIZE + 32,
    height: COMPASS_SIZE + 32,
    borderRadius: (COMPASS_SIZE + 32) / 2,
    backgroundColor: "rgba(245,158,11,0.06)",
  },

  noSensorOverlay: {
    position: "absolute",
    bottom: 4,
    alignItems: "center",
    gap: 6,
  },
  noSensorText: {
    color: QiblahColors.textSub,
    fontSize: Font.sm,
    textAlign: "center",
  },
  staticBearingText: {
    color: QiblahColors.textMuted,
    fontSize: Font.xs,
    textAlign: "center",
  },

  infoRow: {
    flexDirection: "row",
    paddingHorizontal: Space.xl,
    gap: Space.md,
    marginBottom: Space.xl,
  },
  infoCard: {
    flex: 1,
    backgroundColor: QiblahColors.surface,
    borderRadius: Radius.lg,
    padding: Space.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: QiblahColors.border,
  },
  infoLabel: {
    color: QiblahColors.textSub,
    fontSize: Font.xs,
    fontWeight: Weight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    color: QiblahColors.text,
    fontSize: Font.xl,
    fontWeight: Weight.bold,
  },

  actionRow: {
    flexDirection: "row",
    paddingHorizontal: Space.xl,
    gap: Space.md,
  },
  calibrateBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Space.xs,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: QiblahColors.goldBorder,
    backgroundColor: QiblahColors.goldMuted,
  },
  calibrateBtnText: {
    color: QiblahColors.gold,
    fontSize: Font.base,
    fontWeight: Weight.semibold,
  },
  mosqueBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Space.xs,
    paddingVertical: 14,
    borderRadius: Radius.lg,
    backgroundColor: QiblahColors.green,
  },
  mosqueBtnText: {
    color: QiblahColors.white,
    fontSize: Font.base,
    fontWeight: Weight.semibold,
  },

  webTip: {
    marginHorizontal: Space.xl,
    marginTop: Space.xl,
    padding: Space.md,
    borderRadius: Radius.lg,
    backgroundColor: QiblahColors.surface,
    borderWidth: 1,
    borderColor: QiblahColors.border,
  },
  webTipText: {
    color: QiblahColors.textSub,
    fontSize: Font.sm,
    textAlign: "center",
    lineHeight: 20,
  },
});
