import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { format } from 'date-fns';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getTasksByCategory, createTask, toggleTask, deleteTask } from '@/lib/api';
import { Task, Category, TaskInput } from '@/types';
import { CATEGORIES, getCategoryConfig } from '@/constants/categories';
import { TaskCard } from '@/components/TaskCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function TasksScreen() {
  const { theme, isCalmMode } = useTheme();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<Category>('cotidianas');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);

  // New task form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState(3);
  const [newMinutes, setNewMinutes] = useState('');
  const [newTime, setNewTime] = useState('');
  const [creating, setCreating] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!user) return;
    try {
      const result = await getTasksByCategory(user.id, selectedCategory);
      setTasks(result);
    } catch {
      // silently fail
    }
  }, [user, selectedCategory]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, [loadTasks]);

  const handleToggle = useCallback(
    async (taskId: string) => {
      await toggleTask(taskId);
      await loadTasks();
    },
    [loadTasks]
  );

  const handleCreate = useCallback(async () => {
    if (!user || !newTitle.trim()) {
      Alert.alert('', 'Ingresa un titulo para la tarea');
      return;
    }
    setCreating(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const input: TaskInput = {
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        category: selectedCategory,
        priority: newPriority,
        estimated_minutes: newMinutes ? parseInt(newMinutes, 10) : undefined,
        scheduled_date: today,
        scheduled_time: newTime || undefined,
      };
      await createTask(user.id, input);
      setNewTitle('');
      setNewDescription('');
      setNewPriority(3);
      setNewMinutes('');
      setNewTime('');
      setShowNewTask(false);
      await loadTasks();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo crear la tarea');
    } finally {
      setCreating(false);
    }
  }, [user, newTitle, newDescription, selectedCategory, newPriority, newMinutes, newTime, loadTasks]);

  const handleDelete = useCallback(
    async (taskId: string) => {
      Alert.alert('Eliminar tarea', 'Estas seguro?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteTask(taskId);
            await loadTasks();
          },
        },
      ]);
    },
    [loadTasks]
  );

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
        }}>
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.key;
          const color = isCalmMode ? cat.calmColor : cat.color;
          return (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setSelectedCategory(cat.key)}
              style={[
                styles.categoryTab,
                {
                  backgroundColor: isActive ? color + '20' : theme.surface,
                  borderRadius: theme.borderRadius.full,
                  borderWidth: isActive ? 2 : 1,
                  borderColor: isActive ? color : theme.border,
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.sm,
                  marginRight: theme.spacing.sm,
                },
              ]}>
              <Text
                style={{
                  fontSize: theme.fontSize.sm,
                  fontWeight: isActive ? '700' : '400',
                  color: isActive ? (isCalmMode ? theme.text : color) : theme.textSecondary,
                }}>
                {cat.emoji} {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{ padding: theme.spacing.xl, paddingTop: theme.spacing.sm }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Add button */}
        <Button
          title="+ Nueva tarea"
          onPress={() => setShowNewTask(true)}
          variant="secondary"
          fullWidth
        />

        {/* Pending */}
        {pendingTasks.length > 0 && (
          <View style={{ marginTop: theme.spacing.lg }}>
            {pendingTasks.map((task, i) => (
              <Animated.View
                key={task.id}
                entering={FadeInDown.delay(i * 50).duration(theme.animationDuration)}
                style={{ marginBottom: theme.spacing.sm }}>
                <TaskCard task={task} onToggle={handleToggle} />
              </Animated.View>
            ))}
          </View>
        )}

        {/* Completed */}
        {completedTasks.length > 0 && (
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

        {/* Empty */}
        {tasks.length === 0 && (
          <View style={{ marginTop: theme.spacing.xxl, alignItems: 'center' }}>
            <Text style={{ fontSize: 48 }}>
              {getCategoryConfig(selectedCategory).emoji}
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.base,
                color: theme.textSecondary,
                marginTop: theme.spacing.md,
                textAlign: 'center',
              }}>
              No hay tareas en {getCategoryConfig(selectedCategory).label}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* New task modal */}
      <Modal visible={showNewTask} animationType="slide" transparent>
        <View style={[styles.modalOverlay]}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.background,
                borderTopLeftRadius: theme.borderRadius.xl,
                borderTopRightRadius: theme.borderRadius.xl,
                padding: theme.spacing.xl,
              },
            ]}>
            <Text
              style={{
                fontSize: theme.fontSize.xl,
                fontWeight: '700',
                color: theme.text,
                marginBottom: theme.spacing.lg,
              }}>
              Nueva tarea
            </Text>

            <Input
              label="Titulo"
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Que tenes que hacer?"
            />

            <View style={{ height: theme.spacing.md }} />

            <Input
              label="Descripcion (opcional)"
              value={newDescription}
              onChangeText={setNewDescription}
              placeholder="Detalles..."
              multiline
              numberOfLines={3}
            />

            <View style={{ height: theme.spacing.md }} />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
                <Input
                  label="Tiempo (min)"
                  value={newMinutes}
                  onChangeText={setNewMinutes}
                  placeholder="30"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
                <Input
                  label="Hora (HH:MM)"
                  value={newTime}
                  onChangeText={setNewTime}
                  placeholder="09:00"
                />
              </View>
            </View>

            <View style={{ height: theme.spacing.md }} />

            {/* Priority */}
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: theme.fontSize.sm,
                marginBottom: theme.spacing.xs,
                fontWeight: '500',
              }}>
              Prioridad
            </Text>
            <View style={styles.priorityRow}>
              {[1, 2, 3, 4, 5].map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setNewPriority(p)}
                  style={[
                    styles.priorityButton,
                    {
                      backgroundColor:
                        newPriority === p ? theme.primary + '20' : theme.surface,
                      borderWidth: newPriority === p ? 2 : 1,
                      borderColor: newPriority === p ? theme.primary : theme.border,
                      borderRadius: theme.borderRadius.sm,
                    },
                  ]}>
                  <Text
                    style={{
                      color: newPriority === p ? theme.primary : theme.textSecondary,
                      fontWeight: newPriority === p ? '700' : '400',
                      fontSize: theme.fontSize.sm,
                    }}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: theme.spacing.xl }} />

            <Button
              title="Crear tarea"
              onPress={handleCreate}
              loading={creating}
              fullWidth
              size="lg"
            />

            <View style={{ height: theme.spacing.sm }} />

            <Button
              title="Cancelar"
              onPress={() => setShowNewTask(false)}
              variant="ghost"
              fullWidth
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  categoryTab: {},
  row: { flexDirection: 'row' },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    maxHeight: '90%',
  },
});
