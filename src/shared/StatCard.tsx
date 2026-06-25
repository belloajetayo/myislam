import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Font, Weight, Radius, Space, Shadow } from '@/theme/tokens';
import { ProgressBar } from './ProgressBar';

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  percentage: number;
  color: string;
}

export function StatCard({ icon, value, label, percentage, color }: StatCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={[styles.iconWrap, { backgroundColor: `${color}18` }]}>{icon}</View>
        <Text style={styles.value}>{value}</Text>
      </View>
      <ProgressBar value={percentage} color={color} height={3} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Space.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Space.sm,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    color: Colors.text,
    fontSize: Font.base,
    fontWeight: Weight.bold,
  },
  label: {
    color: Colors.textMuted,
    fontSize: Font.xs,
    fontWeight: Weight.bold,
    marginTop: Space.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
