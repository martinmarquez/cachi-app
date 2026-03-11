import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { toDateStr } from '@/lib/dateUtils';
import { useAuth } from '@/contexts/AuthContext';
import { getTasksForDate, getTaskSummaryForRange, toggleTask } from '@/lib/api';
import { Task, Category } from '@/types';
import CalendarGrid from '@/components/CalendarGrid';
import { TaskCard } from '@/components/TaskCard';

export default function CalendarScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskDots, setTaskDots] = useState<
    Record<string, { categories: Category[]; count: number }>
  >({});

  const loadTasks = useCallback(async () => {
    if (!user) return;
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const result = await getTasksForDate(user.id, dateStr);
      setTasks(result);
    } catch {
      // silently fail
    }
  }, [user, selectedDate]);

  const loadDots = useCallback(async () => {
    if (!user) return;
    try {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      const summaries = await getTaskSummaryForRange(user.id, start, end);
      const dots: Record<string, { categories: Category[]; count: number }> = {};
      for (const s of summaries) {
        // Normalize date key — neon driver may return Date objects
        const key = toDateStr(s.date);
        dots[key] = { categories: s.categories, count: s.count };
      }
      setTaskDots(dots);
    } catch {
      // silently fail
    }
  }, [user, currentMonth]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    loadDots();
  }, [loadDots]);

  const handleToggle = useCallback(
    async (taskId: string) => {
      await toggleTask(taskId);
      await loadTasks();
    },
    [loadTasks]
  );

  const dayLabel = format(selectedDate, "EEEE d", { locale: es });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(200)}
        style={{ paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.lg }}
      >
        <Text
          style={{
            fontSize: theme.fontSize.xxl,
            fontWeight: '700',
            color: theme.text,
          }}
        >
          Calendario
        </Text>
      </Animated.View>

      {/* Calendar grid */}
      <View
        style={{
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.lg,
        }}
      >
        <CalendarGrid
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          taskDots={taskDots}
          currentMonth={currentMonth}
          onChangeMonth={setCurrentMonth}
        />
      </View>

      {/* Tasks for selected day */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: theme.spacing.xl,
          paddingTop: theme.spacing.md,
        }}
      >
        {/* Section header */}
        <Text
          style={{
            fontSize: theme.fontSize.lg,
            fontWeight: '600',
            color: theme.text,
            marginBottom: theme.spacing.md,
          }}
        >
          Tareas del {dayLabel}
        </Text>

        {/* Task list */}
        {tasks.length > 0 &&
          tasks.map((task, i) => (
            <Animated.View
              key={task.id}
              entering={FadeInDown.delay(i * 50).duration(200)}
              style={{ marginBottom: theme.spacing.sm }}
            >
              <TaskCard task={task} onToggle={handleToggle} />
            </Animated.View>
          ))}

        {/* Empty state */}
        {tasks.length === 0 && (
          <View style={{ marginTop: theme.spacing.xxl, alignItems: 'center' }}>
            <Text style={{ fontSize: 48 }}>📅</Text>
            <Text
              style={{
                fontSize: theme.fontSize.base,
                color: theme.textSecondary,
                marginTop: theme.spacing.md,
                textAlign: 'center',
                fontWeight: '600',
              }}
            >
              No hay tareas para este dia
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.textMuted,
                marginTop: theme.spacing.xs,
                textAlign: 'center',
              }}
            >
              Podes agregar una desde Tareas
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add task button */}
      <View
        style={{
          paddingHorizontal: theme.spacing.xl,
          paddingBottom: theme.spacing.lg,
          paddingTop: theme.spacing.sm,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/tasks')}
          activeOpacity={0.7}
          style={[
            styles.addButton,
            {
              backgroundColor: theme.primary,
              borderRadius: theme.borderRadius.md,
              paddingVertical: theme.spacing.md,
            },
          ]}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: theme.fontSize.base,
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            + Agregar tarea para este dia
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
