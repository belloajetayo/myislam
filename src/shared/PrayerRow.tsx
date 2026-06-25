import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors, Font, Weight, Radius, Space, Shadow } from '@/theme/tokens';

// Each prayer gets a distinct brand color circle
const PRAYER_CIRCLE: Record<string, string> = {
  Fajr: '#6366F1',
  Sunrise: '#F97316',
  Dhuhr: '#F59E0B',
  Asr: '#0EA5E9',
  Maghrib: '#8B5CF6',
  Isha: '#1D4ED8',
};

interface PrayerRowProps {
  name: string;
  time: string;
  emoji: string;
  isNext?: boolean;
  isCurrent?: boolean;
  isCompleted?: boolean;
  showToggle?: boolean;
  onToggle?: () => void;
}

export function PrayerRow({
  name,
  time,
  emoji,
  isNext,
  isCurrent,
  isCompleted,
  showToggle,
  onToggle,
}: PrayerRowProps) {
  const circleColor = PRAYER_CIRCLE[name] ?? Colors.gold;

  const bg = isCompleted
    ? Colors.greenMuted
    : isNext
    ? Colors.goldMuted
    : Colors.surface;

  const borderColor = isCompleted
    ? Colors.greenBorder
    : isNext
    ? Colors.goldBorder
    : Colors.border;

  const timeColor = isCompleted ? Colors.green : isNext ? Colors.gold : Colors.textSub;

  return (
    <View
      style={[
        styles.row,
        Shadow.sm,
        { backgroundColor: bg, borderColor },
      ]}
    >
      {/* Colored prayer circle */}
      <View style={[styles.circle, { backgroundColor: circleColor }]}>
        <Text style={styles.circleEmoji}>{emoji}</Text>
      </View>

      <View style={styles.info}>
        <Text
          style={[
            styles.name,
            {
              color: isCompleted ? Colors.green : isNext ? Colors.gold : Colors.text,
              fontWeight: isNext || isCompleted ? Weight.semibold : Weight.regular,
            },
          ]}
        >
          {name}
        </Text>
        {isCurrent && !isNext && (
          <Text style={[styles.tag, { color: Colors.blue }]}>Current prayer</Text>
        )}
        {isCompleted && (
          <Text style={[styles.tag, { color: Colors.green }]}>Prayed ✓</Text>
        )}
        {isNext && (
          <Text style={[styles.tag, { color: Colors.gold }]}>Up next</Text>
        )}
      </View>

      <Text
        style={[
          styles.time,
          {
            color: timeColor,
            fontWeight: isNext || isCompleted ? Weight.bold : Weight.medium,
            marginRight: showToggle ? Space.md : 0,
          },
        ]}
      >
        {time}
      </Text>

      {showToggle && onToggle && (
        <TouchableOpacity
          onPress={onToggle}
          activeOpacity={0.72}
          accessibilityLabel={`Mark ${name} as ${isCompleted ? 'not prayed' : 'prayed'}`}
          accessibilityRole="checkbox"
          style={[
            styles.toggle,
            {
              backgroundColor: isCompleted ? Colors.green : Colors.bgMuted,
              borderWidth: isCompleted ? 0 : 1,
              borderColor: Colors.border,
            },
          ]}
        >
          {isCompleted ? (
            <Check size={15} color={Colors.white} />
          ) : (
            <View style={styles.unchecked} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: Radius.lg,
    marginBottom: Space.sm,
    borderWidth: 1,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Space.md,
  },
  circleEmoji: { fontSize: 18 },
  info: { flex: 1 },
  name: { fontSize: Font.md, color: Colors.text },
  tag: { fontSize: Font.xs, color: Colors.textSub, marginTop: 2 },
  time: { fontSize: Font.md, color: Colors.textSub },
  toggle: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unchecked: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
  },
});
