import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface VisualTimerProps {
  durationMinutes: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

export function VisualTimer({
  durationMinutes,
  onComplete,
  autoStart = false,
}: VisualTimerProps) {
  const { theme } = useTheme();
  const totalSeconds = durationMinutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remaining > 0]);

  const progress = 1 - remaining / totalSeconds;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  const toggle = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  // Ring visual: circular progress indicator
  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <View style={[styles.timerCircle, { width: size, height: size }]}>
        {/* Background circle */}
        <View
          style={[
            styles.circleBackground,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: theme.surface,
            },
          ]}
        />

        {/* Simple progress ring using border */}
        <View
          style={[
            styles.progressRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: strokeWidth,
              borderColor: remaining === 0 ? theme.success : theme.primary,
              borderTopColor: progress < 0.25 ? 'transparent' : undefined,
              borderRightColor: progress < 0.5 ? 'transparent' : undefined,
              borderBottomColor: progress < 0.75 ? 'transparent' : undefined,
              transform: [{ rotate: '-90deg' }],
              opacity: 0.3 + progress * 0.7,
            },
          ]}
        />

        {/* Time display */}
        <View style={styles.timeDisplay}>
          <Text
            style={{
              color: theme.text,
              fontSize: theme.fontSize.xxl,
              fontWeight: '300',
              fontVariant: ['tabular-nums'],
            }}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
          {remaining === 0 && (
            <Text
              style={{
                color: theme.success,
                fontSize: theme.fontSize.sm,
                marginTop: 4,
              }}>
              Listo!
            </Text>
          )}
        </View>
      </View>

      <View style={[styles.controls, { marginTop: theme.spacing.lg }]}>
        <TouchableOpacity
          onPress={toggle}
          style={[
            styles.controlButton,
            {
              backgroundColor: isRunning ? theme.warning + '20' : theme.primary + '20',
              borderRadius: theme.borderRadius.full,
              paddingHorizontal: theme.spacing.xl,
              paddingVertical: theme.spacing.md,
            },
          ]}>
          <Text
            style={{
              color: isRunning ? theme.warning : theme.primary,
              fontSize: theme.fontSize.base,
              fontWeight: '600',
            }}>
            {isRunning ? 'Pausar' : remaining === totalSeconds ? 'Empezar' : 'Continuar'}
          </Text>
        </TouchableOpacity>

        {remaining < totalSeconds && (
          <TouchableOpacity
            onPress={reset}
            style={[
              styles.controlButton,
              {
                backgroundColor: theme.surface,
                borderRadius: theme.borderRadius.full,
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.md,
                marginLeft: theme.spacing.sm,
              },
            ]}>
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: theme.fontSize.base,
              }}>
              Reiniciar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  timerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBackground: {
    position: 'absolute',
  },
  progressRing: {
    position: 'absolute',
  },
  timeDisplay: {
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {},
});
