import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getTasks, toggleTask, getTodayMood } from '@/lib/api';
import { Task, MoodEntry } from '@/types';
import { TaskCard } from '@/components/TaskCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Buenas noches';
  if (hour < 12) return 'Buen dia';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function getMotivation(energyLevel: number | null): string {
  if (!energyLevel || energyLevel >= 4)
    return 'Hoy es un buen dia para avanzar.';
  if (energyLevel === 3) return 'Dale tranqui, paso a paso.';
  if (energyLevel === 2) return 'No hace falta hacer todo. Hace lo que puedas.';
  return 'Esta bien tomarsela con calma hoy.';
}

export default function TuDiaScreen() {
  const { theme, isCalmMode } = useTheme();
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [mood, setMood] = useState<MoodEntry | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [overwhelmMode, setOverwhelmMode] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');
  const dayName = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [todayTasks, todayMood] = await Promise.all([
        getTasks(user.id, today),
        getTodayMood(user.id),
      ]);
      setTasks(todayTasks);
      setMood(todayMood);
    } catch {
      // silently fail
    }
  }, [user, today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleToggle = useCallback(
    async (taskId: string) => {
      await toggleTask(taskId);
      await loadData();
    },
    [loadData]
  );

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const nextTask = pendingTasks[0];
  const totalMinutes = pendingTasks.reduce(
    (sum, t) => sum + (t.estimated_minutes ?? 0),
    0
  );

  // En overwhelm mode solo mostramos la proxima tarea
  const visiblePending = overwhelmMode ? (nextTask ? [nextTask] : []) : pendingTasks;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.xl }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(theme.animationDuration)}>
          <Text
            style={{
              fontSize: theme.fontSize.xxl,
              fontWeight: '700',
              color: theme.text,
            }}>
            {getGreeting()}
            {user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </Text>
          <Text
            style={{
              fontSize: theme.fontSize.base,
              color: theme.textSecondary,
              marginTop: theme.spacing.xs,
              textTransform: 'capitalize',
            }}>
            {dayName}
          </Text>
        </Animated.View>

        {/* Motivational message */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(theme.animationDuration)}>
          <Text
            style={{
              fontSize: theme.fontSize.base,
              color: theme.textMuted,
              marginTop: theme.spacing.md,
              fontStyle: 'italic',
            }}>
            {getMotivation(mood?.energy_level ?? null)}
          </Text>
        </Animated.View>

        {/* Overwhelm mode toggle */}
        <Animated.View
          entering={FadeInDown.delay(150).duration(theme.animationDuration)}
          style={{ marginTop: theme.spacing.lg }}>
          <TouchableOpacity
            onPress={() => setOverwhelmMode(!overwhelmMode)}
            style={[
              styles.overwhelmButton,
              {
                backgroundColor: overwhelmMode ? theme.primary + '20' : theme.surface,
                borderRadius: theme.borderRadius.md,
                borderWidth: overwhelmMode ? 2 : 1,
                borderColor: overwhelmMode ? theme.primary : theme.border,
                padding: theme.spacing.md,
              },
            ]}>
            <Text
              style={{
                fontSize: theme.fontSize.base,
                color: overwhelmMode ? theme.primary : theme.textSecondary,
                fontWeight: overwhelmMode ? '600' : '400',
                textAlign: 'center',
              }}>
              {overwhelmMode
                ? '🧘 Modo Calma activo — solo el proximo paso'
                : '🧘 Activar Modo Calma (ver solo lo siguiente)'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats */}
        {!overwhelmMode && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(theme.animationDuration)}
            style={[styles.stats, { marginTop: theme.spacing.lg }]}>
            <Card style={{ flex: 1, marginRight: theme.spacing.sm, alignItems: 'center' } as any}>
              <Text style={{ fontSize: theme.fontSize.xxl, fontWeight: '700', color: theme.text }}>
                {pendingTasks.length}
              </Text>
              <Text style={{ fontSize: theme.fontSize.xs, color: theme.textSecondary }}>
                pendientes
              </Text>
            </Card>
            <Card style={{ flex: 1, marginLeft: theme.spacing.sm, alignItems: 'center' } as any}>
              <Text style={{ fontSize: theme.fontSize.xxl, fontWeight: '700', color: theme.text }}>
                {totalMinutes > 0 ? `${totalMinutes}m` : '—'}
              </Text>
              <Text style={{ fontSize: theme.fontSize.xs, color: theme.textSecondary }}>
                estimado
              </Text>
            </Card>
          </Animated.View>
        )}

        {/* Next task highlight */}
        {nextTask && (
          <Animated.View
            entering={FadeInDown.delay(300).duration(theme.animationDuration)}
            style={{ marginTop: theme.spacing.xl }}>
            <Text
              style={{
                fontSize: theme.fontSize.lg,
                fontWeight: '600',
                color: theme.text,
                marginBottom: theme.spacing.sm,
              }}>
              {overwhelmMode ? 'Tu unico foco ahora:' : 'Lo siguiente:'}
            </Text>
            <TaskCard task={nextTask} onToggle={handleToggle} highlight />
          </Animated.View>
        )}

        {/* Rest of pending tasks */}
        {visiblePending.length > 1 && (
          <Animated.View
            entering={FadeInDown.delay(400).duration(theme.animationDuration)}
            style={{ marginTop: theme.spacing.xl }}>
            <Text
              style={{
                fontSize: theme.fontSize.lg,
                fontWeight: '600',
                color: theme.text,
                marginBottom: theme.spacing.sm,
              }}>
              Despues:
            </Text>
            {visiblePending.slice(1).map((task) => (
              <View key={task.id} style={{ marginBottom: theme.spacing.sm }}>
                <TaskCard task={task} onToggle={handleToggle} />
              </View>
            ))}
          </Animated.View>
        )}

        {overwhelmMode && pendingTasks.length > 1 && (
          <Text
            style={{
              color: theme.textMuted,
              fontSize: theme.fontSize.sm,
              textAlign: 'center',
              marginTop: theme.spacing.lg,
            }}>
            Tenes {pendingTasks.length - 1} tareas mas, pero no te preocupes por
            eso ahora.
          </Text>
        )}

        {/* Completed */}
        {completedTasks.length > 0 && !overwhelmMode && (
          <View style={{ marginTop: theme.spacing.xl }}>
            <Text
              style={{
                fontSize: theme.fontSize.base,
                fontWeight: '600',
                color: theme.textMuted,
                marginBottom: theme.spacing.sm,
              }}>
              Completadas ({completedTasks.length})
            </Text>
            {completedTasks.map((task) => (
              <View key={task.id} style={{ marginBottom: theme.spacing.sm }}>
                <TaskCard task={task} onToggle={handleToggle} />
              </View>
            ))}
          </View>
        )}

        {/* Empty state */}
        {tasks.length === 0 && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(theme.animationDuration)}
            style={{ marginTop: theme.spacing.xxl, alignItems: 'center' }}>
            <Text style={{ fontSize: 48 }}>🌅</Text>
            <Text
              style={{
                fontSize: theme.fontSize.lg,
                color: theme.text,
                fontWeight: '600',
                marginTop: theme.spacing.md,
                textAlign: 'center',
              }}>
              Tu dia esta libre
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.base,
                color: theme.textSecondary,
                marginTop: theme.spacing.sm,
                textAlign: 'center',
              }}>
              Agrega tareas en la pestaña "Tareas"
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overwhelmButton: {},
  stats: { flexDirection: 'row' },
});
