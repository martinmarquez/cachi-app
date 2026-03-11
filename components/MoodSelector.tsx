import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface MoodSelectorProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  items: { level: number; emoji: string; label: string }[];
}

export function MoodSelector({ label, value, onChange, items }: MoodSelectorProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={{
          color: theme.text,
          fontSize: theme.fontSize.lg,
          fontWeight: '600',
          marginBottom: theme.spacing.md,
        }}>
        {label}
      </Text>
      <View style={styles.options}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.level}
            onPress={() => onChange(item.level)}
            style={[
              styles.option,
              {
                backgroundColor:
                  value === item.level ? theme.primary + '20' : theme.surface,
                borderRadius: theme.borderRadius.lg,
                borderWidth: value === item.level ? 2 : 1,
                borderColor: value === item.level ? theme.primary : theme.border,
                padding: theme.spacing.md,
              },
            ]}>
            <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: theme.fontSize.xs,
                marginTop: 4,
                textAlign: 'center',
              }}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
});

export const MOOD_ITEMS = [
  { level: 1, emoji: '😔', label: 'Mal' },
  { level: 2, emoji: '😕', label: 'Bajo' },
  { level: 3, emoji: '😐', label: 'Normal' },
  { level: 4, emoji: '🙂', label: 'Bien' },
  { level: 5, emoji: '😊', label: 'Genial' },
];

export const ENERGY_ITEMS = [
  { level: 1, emoji: '🔋', label: 'Agotado' },
  { level: 2, emoji: '🪫', label: 'Bajo' },
  { level: 3, emoji: '⚡', label: 'Normal' },
  { level: 4, emoji: '💪', label: 'Activo' },
  { level: 5, emoji: '🚀', label: 'Pleno' },
];
