import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getTask,
  getTaskSteps,
  toggleTask,
  toggleStep,
  addTaskStep,
  deleteTask,
  getTaskDateAssignments,
  addTaskDateAssignment,
  removeTaskDateAssignment,
} from '@/lib/api';
import { Task, TaskStep, TaskDateAssignment } from '@/types';
import MultiDateSelector from '@/components/MultiDateSelector';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { StepGuide } from '@/components/StepGuide';
import { VisualTimer } from '@/components/VisualTimer';
import { PRIORITY_LABELS } from '@/constants/categories';

export default function TaskDetailScreen() {
  const { theme, isCalmMode } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [task, setTask] = useState<Task | null>(null);
  const [steps, setSteps] = useState<TaskStep[]>([]);
  const [dateAssignments, setDateAssignments] = useState<TaskDateAssignment[]>([]);
  const [overwhelmMode, setOverwhelmMode] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showAddStep, setShowAddStep] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepMinutes, setNewStepMinutes] = useState('');

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [taskData, stepsData, assignments] = await Promise.all([
        getTask(id),
        getTaskSteps(id),
        getTaskDateAssignments(id),
      ]);
      setTask(taskData);
      setSteps(stepsData);
      setDateAssignments(assignments);
    } catch {
      // silently fail
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleTask = useCallback(async () => {
    if (!id) return;
    await toggleTask(id);
    await loadData();
  }, [id, loadData]);

  const handleToggleStep = useCallback(
    async (stepId: string) => {
      await toggleStep(stepId);
      await loadData();
    },
    [loadData]
  );

  const handleAddStep = useCallback(async () => {
    if (!id || !newStepTitle.trim()) return;
    await addTaskStep(
      id,
      {
        title: newStepTitle.trim(),
        estimated_minutes: newStepMinutes ? parseInt(newStepMinutes, 10) : undefined,
      },
      steps.length + 1
    );
    setNewStepTitle('');
    setNewStepMinutes('');
    setShowAddStep(false);
    await loadData();
  }, [id, newStepTitle, newStepMinutes, steps.length, loadData]);

  const handleAddDate = useCallback(
    async (date: string) => {
      if (!id) return;
      await addTaskDateAssignment(id, date);
      await loadData();
    },
    [id, loadData]
  );

  const handleRemoveDate = useCallback(
    async (assignmentId: string) => {
      await removeTaskDateAssignment(assignmentId);
      await loadData();
    },
    [loadData]
  );

  const handleDelete = useCallback(async () => {
    if (!id) return;
    Alert.alert('Eliminar tarea', 'Estas seguro? Se eliminaran tambien todos los pasos.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteTask(id);
          router.back();
        },
      },
    ]);
  }, [id, router]);

  if (!task) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.textMuted }}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentStep = steps.find((s) => !s.completed);
  const timerMinutes = currentStep?.estimated_minutes ?? task.estimated_minutes ?? 25;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.xl }}>
        {/* Back button */}
        <TouchableOpacity onPress={() => router.back()}>
          <Text
            style={{
              color: theme.primary,
              fontSize: theme.fontSize.base,
              fontWeight: '600',
            }}>
            ← Volver
          </Text>
        </TouchableOpacity>

        {/* Task header */}
        <Animated.View
          entering={FadeInDown.duration(theme.animationDuration)}
          style={{ marginTop: theme.spacing.lg }}>
          <CategoryBadge category={task.category} />

          <Text
            style={{
              fontSize: theme.fontSize.xl,
              fontWeight: '700',
              color: task.completed ? theme.textMuted : theme.text,
              marginTop: theme.spacing.md,
              textDecorationLine: task.completed ? 'line-through' : 'none',
            }}>
            {task.title}
          </Text>

          {task.description && (
            <Text
              style={{
                fontSize: theme.fontSize.base,
                color: theme.textSecondary,
                marginTop: theme.spacing.sm,
              }}>
              {task.description}
            </Text>
          )}

          <View style={[styles.metaRow, { marginTop: theme.spacing.md }]}>
            {task.estimated_minutes && (
              <Text style={{ color: theme.textMuted, fontSize: theme.fontSize.sm }}>
                ~{task.estimated_minutes} min
              </Text>
            )}
            {task.scheduled_time && (
              <Text
                style={{
                  color: theme.textMuted,
                  fontSize: theme.fontSize.sm,
                  marginLeft: theme.spacing.md,
                }}>
                {task.scheduled_time.slice(0, 5)}
              </Text>
            )}
            <Text
              style={{
                color: theme.textMuted,
                fontSize: theme.fontSize.sm,
                marginLeft: theme.spacing.md,
              }}>
              Prioridad: {PRIORITY_LABELS[task.priority] ?? task.priority}
            </Text>
          </View>
        </Animated.View>

        {/* Date assignments */}
        {!overwhelmMode && (
          <Animated.View
            entering={FadeInDown.delay(80).duration(theme.animationDuration)}
            style={{ marginTop: theme.spacing.lg }}>
            <MultiDateSelector
              dates={dateAssignments.map((a) => ({ id: a.id, date: a.assigned_date }))}
              onAdd={handleAddDate}
              onRemove={handleRemoveDate}
            />
          </Animated.View>
        )}

        {/* Actions */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(theme.animationDuration)}
          style={[styles.actions, { marginTop: theme.spacing.lg }]}>
          <Button
            title={task.completed ? 'Desmarcar' : 'Completar tarea'}
            onPress={handleToggleTask}
            variant={task.completed ? 'secondary' : 'primary'}
            style={{ flex: 1, marginRight: theme.spacing.sm }}
          />
          <Button
            title="⏱"
            onPress={() => setShowTimer(!showTimer)}
            variant="secondary"
            style={{ width: 48 }}
          />
        </Animated.View>

        {/* Overwhelm toggle */}
        {steps.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(150).duration(theme.animationDuration)}
            style={{ marginTop: theme.spacing.md }}>
            <TouchableOpacity
              onPress={() => setOverwhelmMode(!overwhelmMode)}
              style={[
                styles.overwhelmToggle,
                {
                  backgroundColor: overwhelmMode ? theme.primary + '15' : theme.surface,
                  borderRadius: theme.borderRadius.md,
                  padding: theme.spacing.md,
                  borderWidth: overwhelmMode ? 1 : 0,
                  borderColor: theme.primary,
                },
              ]}>
              <Text
                style={{
                  color: overwhelmMode ? theme.primary : theme.textSecondary,
                  fontSize: theme.fontSize.sm,
                  textAlign: 'center',
                  fontWeight: overwhelmMode ? '600' : '400',
                }}>
                {overwhelmMode
                  ? '🧘 Solo el proximo paso'
                  : '🧘 Ver solo el proximo paso'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Timer */}
        {showTimer && (
          <Animated.View
            entering={FadeInDown.duration(theme.animationDuration)}
            style={{ marginTop: theme.spacing.xl }}>
            <Card variant="elevated">
              <Text
                style={{
                  fontSize: theme.fontSize.lg,
                  fontWeight: '600',
                  color: theme.text,
                  textAlign: 'center',
                  marginBottom: theme.spacing.lg,
                }}>
                {currentStep ? currentStep.title : 'Temporizador'}
              </Text>
              <VisualTimer durationMinutes={timerMinutes} />
            </Card>
          </Animated.View>
        )}

        {/* Steps */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(theme.animationDuration)}
          style={{ marginTop: theme.spacing.xl }}>
          <View style={styles.stepsHeader}>
            <Text
              style={{
                fontSize: theme.fontSize.lg,
                fontWeight: '600',
                color: theme.text,
              }}>
              Pasos
            </Text>
            <Button
              title="+ Agregar"
              onPress={() => setShowAddStep(true)}
              variant="ghost"
              size="sm"
            />
          </View>

          {steps.length > 0 ? (
            <StepGuide
              steps={steps}
              onToggleStep={handleToggleStep}
              overwhelmMode={overwhelmMode}
            />
          ) : (
            <Card>
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: theme.fontSize.base,
                  textAlign: 'center',
                }}>
                Sin pasos todavia. Agrega pasos para dividir la tarea.
              </Text>
            </Card>
          )}
        </Animated.View>

        {/* Skip step button in overwhelm mode */}
        {overwhelmMode && currentStep && (
          <View style={{ marginTop: theme.spacing.lg }}>
            <Button
              title="No puedo con este paso, mostrame el siguiente"
              onPress={() => handleToggleStep(currentStep.id)}
              variant="ghost"
              fullWidth
            />
          </View>
        )}

        {/* Delete */}
        <View style={{ marginTop: theme.spacing.xxl }}>
          <Button
            title="Eliminar tarea"
            onPress={handleDelete}
            variant="danger"
            fullWidth
          />
        </View>
      </ScrollView>

      {/* Add step modal */}
      <Modal visible={showAddStep} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
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
              Nuevo paso
            </Text>

            <Input
              label="Que hay que hacer"
              value={newStepTitle}
              onChangeText={setNewStepTitle}
              placeholder="Describir el paso..."
            />

            <View style={{ height: theme.spacing.md }} />

            <Input
              label="Tiempo estimado (min)"
              value={newStepMinutes}
              onChangeText={setNewStepMinutes}
              placeholder="5"
              keyboardType="numeric"
            />

            <View style={{ height: theme.spacing.xl }} />

            <Button
              title="Agregar paso"
              onPress={handleAddStep}
              fullWidth
              size="lg"
            />

            <View style={{ height: theme.spacing.sm }} />

            <Button
              title="Cancelar"
              onPress={() => setShowAddStep(false)}
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
  metaRow: { flexDirection: 'row', flexWrap: 'wrap' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  overwhelmToggle: {},
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {},
});
