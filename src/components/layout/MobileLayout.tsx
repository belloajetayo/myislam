import React from "react";
import { View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface MobileLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#110e24" }} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#110e24" />
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
};

export default MobileLayout;
