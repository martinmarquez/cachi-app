import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Category } from '@/types';
import { getCategoryConfig } from '@/constants/categories';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  const { theme, isCalmMode } = useTheme();
  const config = getCategoryConfig(category);
  const color = isCalmMode ? config.calmColor : config.color;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color + '20',
          borderRadius: theme.borderRadius.full,
          paddingHorizontal: size === 'sm' ? 8 : 12,
          paddingVertical: size === 'sm' ? 2 : 4,
        },
      ]}>
      <Text
        style={{
          fontSize: size === 'sm' ? theme.fontSize.xs : theme.fontSize.sm,
          color: isCalmMode ? theme.text : color,
          fontWeight: '600',
        }}>
        {config.emoji} {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
});
