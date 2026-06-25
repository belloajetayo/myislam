import React from 'react';
import { View, ViewStyle } from 'react-native';

interface ProgressBarProps {
  value: number;
  color: string;
  height?: number;
  trackColor?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  value,
  color,
  height = 4,
  trackColor = 'rgba(255,255,255,0.08)',
  style,
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const radius = height / 2;
  return (
    <View
      style={[
        { height, backgroundColor: trackColor, borderRadius: radius, overflow: 'hidden' },
        style,
      ]}
    >
      <View
        style={{
          width: `${clamped}%`,
          height,
          backgroundColor: color,
          borderRadius: radius,
        }}
      />
    </View>
  );
}
