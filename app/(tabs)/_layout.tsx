import { Tabs, useRouter } from "expo-router";
import { View, TouchableOpacity, Text } from "react-native";
import { Home, Clock, Compass, Moon, Play, Pause, SkipForward, Volume2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAudio } from "@/context/AudioContext";

function FloatingMiniPlayer() {
  const { currentSurah, isPlaying, currentAyahIndex, togglePlayPause, playNext, audioProgress } = useAudio();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (!currentSurah) return null;

  const tabBarHeight = 72 + insets.bottom;
  const currentAyah = currentSurah.ayahs?.[currentAyahIndex];

  return (
    <View
      style={{
        position: "absolute",
        left: 12,
        right: 12,
        bottom: tabBarHeight + 8,
        zIndex: 100,
      }}
    >
      {/* Progress bar behind card */}
      <View style={{ position: "absolute", bottom: -3, left: 8, right: 8, height: 3, backgroundColor: "rgba(245,158,11,0.15)", borderRadius: 2 }}>
        <View style={{ height: 3, backgroundColor: "#F59E0B", borderRadius: 2, width: `${audioProgress}%` }} />
      </View>

      <TouchableOpacity
        onPress={() => router.push("/(tabs)/quran")}
        activeOpacity={0.9}
        style={{
          backgroundColor: "#1a1635",
          borderRadius: 18,
          padding: 12,
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "rgba(245,158,11,0.2)",
          shadowColor: "#000",
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        {/* Icon */}
        <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: "#F59E0B", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
          <Volume2 size={18} color="white" />
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#F59E0B", fontSize: 13, fontWeight: "700" }} numberOfLines={1}>
            {currentSurah.englishName}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 1 }}>
            Ayah {currentAyah ? currentAyah.numberInSurah : currentAyahIndex + 1} of {currentSurah.ayahs?.length ?? 0}
          </Text>
        </View>

        {/* Controls */}
        <TouchableOpacity
          onPress={e => { e.stopPropagation?.(); togglePlayPause(); }}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(245,158,11,0.12)", alignItems: "center", justifyContent: "center", marginRight: 8 }}
        >
          {isPlaying ? <Pause size={15} color="#F59E0B" fill="#F59E0B" /> : <Play size={15} color="#F59E0B" fill="#F59E0B" />}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={e => { e.stopPropagation?.(); playNext(); }}
          disabled={!currentSurah.ayahs || currentAyahIndex >= currentSurah.ayahs.length - 1}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(245,158,11,0.12)", alignItems: "center", justifyContent: "center", opacity: currentSurah.ayahs && currentAyahIndex < currentSurah.ayahs.length - 1 ? 1 : 0.4 }}
        >
          <SkipForward size={15} color="#F59E0B" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  const icons = [
    (focused: boolean) => <Home size={20} color={focused ? "#F59E0B" : "rgba(255,255,255,0.5)"} />,
    (focused: boolean) => <Clock size={20} color={focused ? "#F59E0B" : "rgba(255,255,255,0.5)"} />,
    (_focused: boolean) => <Play size={22} color="white" fill="white" />,
    (focused: boolean) => <Compass size={20} color={focused ? "#F59E0B" : "rgba(255,255,255,0.5)"} />,
    (focused: boolean) => <Moon size={20} color={focused ? "#F59E0B" : "rgba(255,255,255,0.5)"} />,
  ];
  const labels = ["Home", "Prayer", "Qur'an", "Qiblah", "Sawm"];

  return (
    <View
      style={{
        backgroundColor: "#110e24",
        flexDirection: "row",
        height: 72 + insets.bottom,
        paddingBottom: insets.bottom,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.08)",
        alignItems: "center",
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const isCenter = index === 2;

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

        if (isCenter) {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={{ flex: 1, alignItems: "center", marginBottom: 8 }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: isFocused ? "#D97706" : "#F59E0B",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#F59E0B",
                  shadowOpacity: 0.5,
                  shadowRadius: 12,
                  elevation: 8,
                  marginBottom: 2,
                }}
              >
                {icons[index](isFocused)}
              </View>
              <Text style={{ color: isFocused ? "#F59E0B" : "rgba(255,255,255,0.5)", fontSize: 9, fontWeight: "600" }}>
                {labels[index]}
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={{ flex: 1, alignItems: "center", paddingTop: 10 }}
          >
            {icons[index](isFocused)}
            <Text style={{ color: isFocused ? "#F59E0B" : "rgba(255,255,255,0.5)", fontSize: 9, fontWeight: "600", marginTop: 4 }}>
              {labels[index]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="prayer" options={{ title: "Prayer" }} />
        <Tabs.Screen name="quran" options={{ title: "Qur'an" }} />
        <Tabs.Screen name="qiblah" options={{ title: "Qiblah" }} />
        <Tabs.Screen name="fasting" options={{ title: "Sawm" }} />
      </Tabs>
      <FloatingMiniPlayer />
    </View>
  );
}
