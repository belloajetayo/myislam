import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Home, Clock, BookOpen, Compass, Moon } from "lucide-react-native";
import { Colors, Font, Weight, Space, Radius, Shadow } from "@/theme/tokens";
import { useAudio } from "@/context/AudioContext";
import { ProgressBar } from "@/shared";

const TAB_BAR_HEIGHT = 64;

const TABS = [
  { name: "index", label: "Home", Icon: Home },
  { name: "prayer", label: "Prayer", Icon: Clock },
  { name: "quran", label: "Quran", Icon: BookOpen, center: true },
  { name: "qiblah", label: "Qiblah", Icon: Compass },
  { name: "fasting", label: "Fasting", Icon: Moon },
] as const;

// ─── Floating mini player ─────────────────────────────────────────────────────

function FloatingMiniPlayer() {
  const { currentSurah, isPlaying, togglePlayPause, audioProgress } = useAudio();
  if (!currentSurah) return null;

  return (
    <View style={[styles.miniPlayer, Shadow.lg]}>
      <View style={styles.miniPlayerContent}>
        <View style={styles.miniPlayerIcon}>
          <BookOpen size={14} color={Colors.gold} />
        </View>
        <View style={{ flex: 1, marginRight: Space.sm }}>
          <Text style={styles.miniPlayerTitle} numberOfLines={1}>
            {currentSurah.name}
          </Text>
          <ProgressBar
            value={audioProgress}
            color={Colors.gold}
            height={2}
            trackColor={Colors.borderSubtle}
            style={{ marginTop: 4 }}
          />
        </View>
        <TouchableOpacity
          onPress={togglePlayPause}
          activeOpacity={0.75}
          style={styles.miniPlayerBtn}
          accessibilityLabel={isPlaying ? "Pause" : "Play"}
        >
          <Text style={styles.miniPlayerBtnIcon}>{isPlaying ? "⏸" : "▶"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Custom tab bar ───────────────────────────────────────────────────────────

type TabBarProps = {
  state: any;
  descriptors: any;
  navigation: any;
};

function CustomTabBar({ state, descriptors, navigation }: TabBarProps) {
  return (
    <View style={styles.tabBarWrapper}>
      <FloatingMiniPlayer />
      <View style={[styles.tabBar, Shadow.md]}>
        {state.routes.map((route: any, index: number) => {
          const tabDef = TABS.find((t) => t.name === route.name);
          if (!tabDef) return null;

          const { Icon, label } = tabDef;
          const center = "center" in tabDef ? tabDef.center : false;
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (center) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.85}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
                accessibilityRole="button"
                style={styles.centerTabBtn}
              >
                <View
                  style={[
                    styles.centerTab,
                    isFocused && styles.centerTabActive,
                  ]}
                >
                  <Icon
                    size={24}
                    color={isFocused ? Colors.white : Colors.gold}
                    strokeWidth={isFocused ? 2.5 : 2}
                  />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.75}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              accessibilityRole="button"
              style={styles.tabBtn}
            >
              <Icon
                size={22}
                color={isFocused ? Colors.gold : Colors.textMuted}
                strokeWidth={isFocused ? 2.5 : 1.8}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? Colors.gold : Colors.textMuted },
                ]}
              >
                {label}
              </Text>
              {isFocused ? <View style={styles.activeDot} /> : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="prayer" options={{ title: "Prayer" }} />
      <Tabs.Screen name="quran" options={{ title: "Quran" }} />
      <Tabs.Screen name="qiblah" options={{ title: "Qiblah" }} />
      <Tabs.Screen name="fasting" options={{ title: "Fasting" }} />
    </Tabs>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: TAB_BAR_HEIGHT + (Platform.OS === "ios" ? 20 : 0),
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
    paddingHorizontal: Space.sm,
  },

  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Space.sm,
    position: "relative",
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: Weight.medium,
    marginTop: 3,
  },
  activeDot: {
    position: "absolute",
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gold,
  },

  centerTabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerTab: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.goldMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.goldBorder,
    marginBottom: Platform.OS === "ios" ? 0 : 8,
  },
  centerTabActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },

  miniPlayer: {
    backgroundColor: Colors.white,
    marginHorizontal: Space.lg,
    marginBottom: Space.sm,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  miniPlayerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm,
    gap: Space.sm,
  },
  miniPlayerIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: Colors.goldMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  miniPlayerTitle: {
    color: Colors.text,
    fontSize: Font.sm,
    fontWeight: Weight.semibold,
  },
  miniPlayerBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    backgroundColor: Colors.goldMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.goldBorder,
  },
  miniPlayerBtnIcon: { fontSize: 14 },
});
