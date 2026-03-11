import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from '@/contexts/ThemeContext';
import { DatePicker } from '@/components/DatePicker';

interface MultiDateSelectorProps {
  dates: { id: string; date: string }[]; // assignment id + YYYY-MM-DD
  onAdd: (date: string) => void;
  onRemove: (assignmentId: string) => void;
}

export default function MultiDateSelector({
  dates,
  onAdd,
  onRemove,
}: MultiDateSelectorProps) {
  const { theme } = useTheme();
  const [pickerDates, setPickerDates] = useState<string[]>([]);

  const handleDatesChange = (newDates: string[]) => {
    if (newDates.length > 0) {
      // Only add the last selected date
      const lastDate = newDates[newDates.length - 1];
      onAdd(lastDate);
    }
    setPickerDates([]);
  };

  return (
    <View>
      {/* Label */}
      <Text
        style={{
          fontSize: theme.fontSize.sm,
          fontWeight: '600',
          color: theme.text,
          marginBottom: theme.spacing.sm,
        }}
      >
        Fechas asignadas
      </Text>

      {/* Chips row */}
      <View style={styles.chipsContainer}>
        {dates.map((item) => {
          const parsed = parseISO(item.date);
          const label = format(parsed, "d MMM", { locale: es });
          return (
            <View
              key={item.id}
              style={[
                styles.chip,
                {
                  backgroundColor: theme.primary + '15',
                  borderRadius: theme.borderRadius.full,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.xs,
                  marginRight: theme.spacing.sm,
                  marginBottom: theme.spacing.sm,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  color: theme.text,
                  marginRight: theme.spacing.xs,
                }}
              >
                {label}
              </Text>
              <TouchableOpacity
                onPress={() => onRemove(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel={`Eliminar fecha ${label}`}
                accessibilityRole="button"
              >
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.textSecondary,
                    fontWeight: '700',
                  }}
                >
                  {'\u2715'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Add date using DatePicker */}
        <DatePicker
          selectedDates={pickerDates}
          onDatesChange={handleDatesChange}
          multiSelect={false}
          label=""
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
