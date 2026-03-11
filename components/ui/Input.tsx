import React from 'react';
import { TextInput, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  style?: ViewStyle;
  autoCapitalize?: 'none' | 'sentences' | 'words';
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline,
  numberOfLines,
  keyboardType,
  style,
  autoCapitalize,
}: InputProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: theme.textSecondary, fontSize: theme.fontSize.sm, marginBottom: theme.spacing.xs },
          ]}>
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          {
            backgroundColor: theme.inputBackground,
            borderColor: theme.inputBorder,
            borderRadius: theme.borderRadius.md,
            color: theme.text,
            fontSize: theme.fontSize.base,
            padding: theme.spacing.md,
          },
          multiline && { minHeight: 80, textAlignVertical: 'top' },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  label: {
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
  },
});
