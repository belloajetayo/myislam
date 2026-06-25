import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Font, Weight } from '@/theme/tokens';

interface SectionHeaderProps {
  title: string;
  rightElement?: React.ReactNode;
}

export function SectionHeader({ title, rightElement }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {rightElement}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: Colors.textMuted,
    fontSize: Font.xs,
    fontWeight: Weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
