import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from '@/contexts/ThemeContext';
import CalendarGrid from '@/components/CalendarGrid';

interface DatePickerProps {
  selectedDates: string[]; // YYYY-MM-DD array
  onDatesChange: (dates: string[]) => void;
  multiSelect?: boolean; // false = single date mode
  label?: string; // trigger label like "Fecha"
}

export function DatePicker({
  selectedDates,
  onDatesChange,
  multiSelect = false,
  label,
}: DatePickerProps) {
  const { theme } = useTheme();

  const [visible, setVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempDates, setTempDates] = useState<string[]>([]);

  const formatTriggerText = (): string => {
    if (selectedDates.length === 0) {
      return 'Elegir fecha';
    }

    if (!multiSelect) {
      return format(parseISO(selectedDates[0]), "EEE d 'de' MMMM", { locale: es });
    }

    if (selectedDates.length === 1) {
      return format(parseISO(selectedDates[0]), "EEE d 'de' MMMM", { locale: es });
    }

    return `${selectedDates.length} fechas seleccionadas`;
  };

  const handleOpen = () => {
    setTempDates([...selectedDates]);
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  };

  const handleDayPress = (date: string) => {
    if (!multiSelect) {
      onDatesChange([date]);
      setVisible(false);
      return;
    }

    setTempDates((prev) => {
      if (prev.includes(date)) {
        return prev.filter((d) => d !== date);
      }
      return [...prev, date];
    });
  };

  const handleConfirm = () => {
    onDatesChange(tempDates);
    setVisible(false);
  };

  const activeDates = multiSelect ? tempDates : selectedDates;

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: theme.textSecondary,
              fontSize: theme.fontSize.sm,
              marginBottom: theme.spacing.xs,
            },
          ]}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={handleOpen}
        activeOpacity={0.7}
        style={[
          styles.trigger,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
          },
        ]}>
        <Text
          style={{
            color: selectedDates.length > 0 ? theme.text : theme.textSecondary,
            fontSize: theme.fontSize.base,
          }}>
          {'\uD83D\uDCC5'} {formatTriggerText()}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}>
        <View style={styles.overlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.card,
                borderRadius: theme.borderRadius.lg,
                padding: theme.spacing.lg,
              },
            ]}>
            <Text
              style={[
                styles.modalTitle,
                {
                  color: theme.text,
                  fontSize: theme.fontSize.xl,
                  marginBottom: theme.spacing.lg,
                },
              ]}>
              {multiSelect ? 'Elegir fechas' : 'Elegir fecha'}
            </Text>

            <CalendarGrid
              compact={true}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              selectedDates={activeDates}
              onDayPress={handleDayPress}
            />

            {multiSelect && tempDates.length > 0 && (
              <View
                style={[
                  styles.chipsContainer,
                  { marginTop: theme.spacing.md },
                ]}>
                {tempDates.map((date) => (
                  <View
                    key={date}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: theme.primary + '20',
                        borderRadius: theme.borderRadius.sm,
                        paddingHorizontal: theme.spacing.sm,
                        paddingVertical: theme.spacing.xs,
                        marginRight: theme.spacing.xs,
                        marginBottom: theme.spacing.xs,
                      },
                    ]}>
                    <Text
                      style={{
                        color: theme.primary,
                        fontSize: theme.fontSize.xs,
                      }}>
                      {format(parseISO(date), 'd MMM', { locale: es })}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setTempDates((prev) => prev.filter((d) => d !== date))
                      }
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text
                        style={{
                          color: theme.primary,
                          fontSize: theme.fontSize.xs,
                          marginLeft: theme.spacing.xs,
                          fontWeight: '700',
                        }}>
                        ×
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View
              style={[
                styles.modalActions,
                { marginTop: theme.spacing.lg },
              ]}>
              <TouchableOpacity
                onPress={handleClose}
                style={[
                  styles.cancelButton,
                  { paddingVertical: theme.spacing.sm },
                ]}>
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: theme.fontSize.base,
                  }}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              {multiSelect && (
                <TouchableOpacity
                  onPress={handleConfirm}
                  style={[
                    styles.confirmButton,
                    {
                      backgroundColor: theme.primary,
                      borderRadius: theme.borderRadius.md,
                      paddingHorizontal: theme.spacing.xl,
                      paddingVertical: theme.spacing.sm,
                    },
                  ]}>
                  <Text
                    style={{
                      color: theme.primaryText,
                      fontSize: theme.fontSize.base,
                      fontWeight: '600',
                    }}>
                    Confirmar
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  label: {
    fontWeight: '500',
  },
  trigger: {
    borderWidth: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontWeight: '700',
    textAlign: 'center',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelButton: {
    alignItems: 'center',
  },
  confirmButton: {
    alignItems: 'center',
  },
});

export default DatePicker;
