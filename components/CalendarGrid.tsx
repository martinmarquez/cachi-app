import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from '@/contexts/ThemeContext';
import { Category } from '@/types';

interface CalendarGridProps {
  selectedDate?: Date;
  selectedDates?: string[]; // YYYY-MM-DD array (for multi-select in DatePicker)
  onSelectDate?: (date: Date) => void;
  onDayPress?: (dateStr: string) => void; // alternative callback with string
  taskDots?: Record<string, { categories: Category[]; count: number }>;
  currentMonth: Date;
  onChangeMonth?: (date: Date) => void;
  onMonthChange?: (date: Date) => void; // alias
  compact?: boolean;
}

const DAY_LABELS = ['L', 'M', 'Mi', 'J', 'V', 'S', 'D'];

export default function CalendarGrid({
  selectedDate,
  selectedDates,
  onSelectDate,
  onDayPress,
  taskDots,
  currentMonth,
  onChangeMonth,
  onMonthChange,
  compact = false,
}: CalendarGridProps) {
  const { theme } = useTheme();
  const today = useMemo(() => new Date(), []);
  const changeMonth = onChangeMonth ?? onMonthChange;

  const monthLabel = useMemo(() => {
    const label = format(currentMonth, 'MMMM yyyy', { locale: es });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [currentMonth]);

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calStart, end: calEnd });

    const rows: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));
    }
    // Always render 6 rows for consistent height
    while (rows.length < 6) {
      const lastDay = rows[rows.length - 1][6];
      const nextStart = new Date(lastDay);
      nextStart.setDate(nextStart.getDate() + 1);
      const nextEnd = new Date(nextStart);
      nextEnd.setDate(nextEnd.getDate() + 6);
      rows.push(eachDayOfInterval({ start: nextStart, end: nextEnd }));
    }
    return rows;
  }, [currentMonth]);

  const isDateSelected = (day: Date): boolean => {
    if (selectedDates && selectedDates.length > 0) {
      return selectedDates.includes(format(day, 'yyyy-MM-dd'));
    }
    if (selectedDate) {
      return isSameDay(day, selectedDate);
    }
    return false;
  };

  const handleDayTap = (day: Date) => {
    if (onDayPress) {
      onDayPress(format(day, 'yyyy-MM-dd'));
    } else if (onSelectDate) {
      onSelectDate(day);
    }
  };

  const getCategoryColor = (category: Category): string => {
    const map: Record<Category, string> = {
      cotidianas: theme.cotidianas,
      trabajo: theme.trabajo,
      social: theme.social,
      salud: theme.salud,
    };
    return map[category] ?? theme.primary;
  };

  const cellSize = compact ? 36 : 44;
  const dayFontSize = compact ? theme.fontSize.xs : theme.fontSize.sm;
  const headerFontSize = compact ? theme.fontSize.sm : theme.fontSize.lg;
  const arrowFontSize = compact ? theme.fontSize.base : theme.fontSize.xl;
  const dotSize = compact ? 4 : 6;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { marginBottom: theme.spacing.sm }]}>
        <TouchableOpacity
          onPress={() => changeMonth?.(subMonths(currentMonth, 1))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Mes anterior"
          accessibilityRole="button"
          style={[styles.arrowButton, { minHeight: 44, minWidth: 44 }]}>
          <Text style={{ color: theme.text, fontSize: arrowFontSize, fontWeight: '600' }}>
            {'←'}
          </Text>
        </TouchableOpacity>

        <Text style={{ color: theme.text, fontSize: headerFontSize, fontWeight: '700', textAlign: 'center' }}>
          {monthLabel}
        </Text>

        <TouchableOpacity
          onPress={() => changeMonth?.(addMonths(currentMonth, 1))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Mes siguiente"
          accessibilityRole="button"
          style={[styles.arrowButton, { minHeight: 44, minWidth: 44 }]}>
          <Text style={{ color: theme.text, fontSize: arrowFontSize, fontWeight: '600' }}>
            {'→'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Day-of-week row */}
      <View style={styles.weekRow}>
        {DAY_LABELS.map((label) => (
          <View key={label} style={[styles.weekCell, { minWidth: cellSize }]}>
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: compact ? theme.fontSize.xs : theme.fontSize.sm,
                fontWeight: '600',
                textAlign: 'center',
              }}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      <Animated.View entering={FadeIn.duration(theme.animationDuration)} key={monthLabel}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, today);
              const isSelected = isDateSelected(day);
              const dots = taskDots?.[dateKey];
              const categoriesToShow = dots ? dots.categories.slice(0, 3) : [];

              return (
                <TouchableOpacity
                  key={dateKey}
                  onPress={() => handleDayTap(day)}
                  activeOpacity={0.6}
                  accessibilityLabel={`${format(day, 'd MMMM yyyy', { locale: es })}${
                    dots ? `, ${dots.count} tarea${dots.count !== 1 ? 's' : ''}` : ''
                  }`}
                  style={[
                    styles.dayCell,
                    {
                      minHeight: cellSize,
                      minWidth: cellSize,
                      borderRadius: theme.borderRadius.sm,
                    },
                    isToday && !isSelected && { backgroundColor: theme.primary + '20' },
                    isSelected && { backgroundColor: theme.primary },
                    !isCurrentMonth && { opacity: 0.3 },
                  ]}>
                  <Text
                    style={{
                      fontSize: dayFontSize,
                      fontWeight: '500',
                      textAlign: 'center',
                      color: isSelected ? '#FFFFFF' : theme.text,
                    }}>
                    {format(day, 'd')}
                  </Text>

                  {categoriesToShow.length > 0 && (
                    <View style={styles.dotsRow}>
                      {categoriesToShow.map((cat, i) => (
                        <View
                          key={`${cat}-${i}`}
                          style={{
                            width: dotSize,
                            height: dotSize,
                            borderRadius: dotSize / 2,
                            backgroundColor: isSelected ? '#FFFFFF' : getCategoryColor(cat),
                            marginHorizontal: 1,
                          }}
                        />
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrowButton: { alignItems: 'center', justifyContent: 'center' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around' },
  weekCell: { alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
  dayCell: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
  dotsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
});
