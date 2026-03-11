import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  fullWidth = false,
}: ButtonProps) {
  const { theme } = useTheme();

  const backgroundColor = {
    primary: theme.primary,
    secondary: theme.surface,
    ghost: 'transparent',
    danger: theme.danger,
  }[variant];

  const textColor = {
    primary: theme.primaryText,
    secondary: theme.text,
    ghost: theme.primary,
    danger: '#FFFFFF',
  }[variant];

  const paddingVertical = { sm: 8, md: 12, lg: 16 }[size];
  const fontSize = { sm: theme.fontSize.sm, md: theme.fontSize.base, lg: theme.fontSize.lg }[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor,
          paddingVertical,
          borderRadius: theme.borderRadius.md,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: theme.border,
          opacity: disabled ? 0.5 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: textColor,
              fontSize,
              fontWeight: '600',
            },
          ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
});
