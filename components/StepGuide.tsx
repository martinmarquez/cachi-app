import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { TaskStep } from '@/types';

interface StepGuideProps {
  steps: TaskStep[];
  onToggleStep: (stepId: string) => void;
  overwhelmMode?: boolean;
}

export function StepGuide({ steps, onToggleStep, overwhelmMode = false }: StepGuideProps) {
  const { theme, isCalmMode } = useTheme();

  const completedCount = steps.filter((s) => s.completed).length;
  const progress = steps.length > 0 ? completedCount / steps.length : 0;

  // En modo overwhelm, solo mostrar el proximo paso sin completar
  const visibleSteps = overwhelmMode
    ? steps.filter((s) => !s.completed).slice(0, 1)
    : steps;

  const nextStep = steps.find((s) => !s.completed);

  return (
    <View>
      {/* Barra de progreso */}
      <View
        style={[
          styles.progressContainer,
          {
            backgroundColor: theme.surface,
            borderRadius: theme.borderRadius.full,
            marginBottom: theme.spacing.lg,
          },
        ]}>
        <View
          style={[
            styles.progressBar,
            {
              backgroundColor: theme.success,
              borderRadius: theme.borderRadius.full,
              width: `${progress * 100}%`,
            },
          ]}
        />
      </View>

      <Text
        style={{
          color: theme.textSecondary,
          fontSize: theme.fontSize.sm,
          marginBottom: theme.spacing.md,
          textAlign: 'center',
        }}>
        {completedCount} de {steps.length} pasos completados
      </Text>

      {overwhelmMode && nextStep && (
        <Text
          style={{
            color: theme.primary,
            fontSize: theme.fontSize.lg,
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: theme.spacing.lg,
          }}>
          Solo enfocate en este paso:
        </Text>
      )}

      {visibleSteps.map((step, index) => {
        const isNext = step.id === nextStep?.id;

        return (
          <Animated.View
            key={step.id}
            entering={FadeInDown.delay(index * (isCalmMode ? 150 : 80)).duration(
              theme.animationDuration
            )}>
            <TouchableOpacity
              onPress={() => onToggleStep(step.id)}
              style={[
                styles.step,
                {
                  backgroundColor: isNext && !step.completed
                    ? theme.primary + '10'
                    : theme.surface,
                  borderRadius: theme.borderRadius.md,
                  borderLeftWidth: 4,
                  borderLeftColor: step.completed
                    ? theme.success
                    : isNext
                    ? theme.primary
                    : theme.border,
                  padding: theme.spacing.md,
                  marginBottom: theme.spacing.sm,
                },
              ]}>
              <View style={styles.stepHeader}>
                <View
                  style={[
                    styles.stepCheckbox,
                    {
                      borderColor: step.completed ? theme.success : theme.border,
                      backgroundColor: step.completed ? theme.success : 'transparent',
                      borderRadius: theme.borderRadius.full,
                    },
                  ]}>
                  {step.completed && (
                    <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>✓</Text>
                  )}
                </View>

                <View style={styles.stepContent}>
                  <Text
                    style={{
                      color: step.completed ? theme.textMuted : theme.text,
                      fontSize: overwhelmMode ? theme.fontSize.lg : theme.fontSize.base,
                      fontWeight: isNext ? '600' : '400',
                      textDecorationLine: step.completed ? 'line-through' : 'none',
                    }}>
                    {step.title}
                  </Text>

                  {step.description && (
                    <Text
                      style={{
                        color: theme.textSecondary,
                        fontSize: theme.fontSize.sm,
                        marginTop: 4,
                      }}>
                      {step.description}
                    </Text>
                  )}

                  {step.estimated_minutes && (
                    <Text
                      style={{
                        color: theme.textMuted,
                        fontSize: theme.fontSize.xs,
                        marginTop: 4,
                      }}>
                      ~{step.estimated_minutes} min
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {overwhelmMode && steps.filter((s) => !s.completed).length > 1 && (
        <Text
          style={{
            color: theme.textMuted,
            fontSize: theme.fontSize.sm,
            textAlign: 'center',
            marginTop: theme.spacing.md,
          }}>
          Hay {steps.filter((s) => !s.completed).length - 1} pasos mas, pero no te preocupes por
          eso ahora.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    height: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  step: {},
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepCheckbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepContent: {
    flex: 1,
  },
});
