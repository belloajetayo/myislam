import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Font, Weight, Space, Radius } from '@/theme/tokens';

interface EmptyStateAction {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  variant?: 'green' | 'blue';
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actions?: EmptyStateAction[];
}

export function EmptyState({ icon, title, description, actions }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actions && actions.length > 0 ? (
        <View style={styles.actions}>
          {actions.map((action, i) => {
            const isBlue = action.variant === 'blue';
            return (
              <TouchableOpacity
                key={i}
                onPress={action.onPress}
                activeOpacity={0.75}
                style={[
                  styles.btn,
                  {
                    backgroundColor: isBlue ? Colors.blueMuted : Colors.greenMuted,
                    borderColor: isBlue ? Colors.blueBorder : Colors.greenBorder,
                  },
                ]}
              >
                {action.icon}
                <Text style={[styles.btnText, { color: isBlue ? Colors.blue : Colors.green }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Space.xxl,
  },
  iconWrap: { marginBottom: Space.lg },
  title: {
    color: Colors.text,
    fontSize: Font.lg,
    fontWeight: Weight.semibold,
    textAlign: 'center',
    marginBottom: Space.sm,
  },
  description: {
    color: Colors.textSub,
    fontSize: Font.base,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Space.xl,
  },
  actions: { width: '100%', gap: Space.sm },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.sm,
    paddingVertical: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  btnText: {
    fontSize: Font.base,
    fontWeight: Weight.semibold,
  },
});
