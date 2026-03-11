import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { CategoryBadge } from '@/components/ui/CategoryBadge';
import { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onToggle: (taskId: string) => void;
  highlight?: boolean;
}

export function TaskCard({ task, onToggle, highlight = false }: TaskCardProps) {
  const { theme } = useTheme();
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/task/${task.id}`)}
      style={highlight && { transform: [{ scale: 1.02 }] }}>
      <Card
        variant={highlight ? 'elevated' : 'default'}
        style={highlight ? { borderColor: theme.primary, borderWidth: 2 } : undefined}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => onToggle(task.id)}
            style={[
              styles.checkbox,
              {
                borderColor: task.completed ? theme.success : theme.border,
                backgroundColor: task.completed ? theme.success : 'transparent',
                borderRadius: theme.borderRadius.sm,
              },
            ]}>
            {task.completed && (
              <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>
                ✓
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.content}>
            <Text
              style={[
                styles.title,
                {
                  color: task.completed ? theme.textMuted : theme.text,
                  fontSize: theme.fontSize.base,
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                },
              ]}>
              {task.title}
            </Text>

            {task.description && (
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: theme.fontSize.sm,
                  marginTop: 2,
                }}
                numberOfLines={1}>
                {task.description}
              </Text>
            )}

            <View style={styles.meta}>
              <CategoryBadge category={task.category} size="sm" />

              {task.estimated_minutes && (
                <Text
                  style={{
                    color: theme.textMuted,
                    fontSize: theme.fontSize.xs,
                    marginLeft: 8,
                  }}>
                  ~{task.estimated_minutes} min
                </Text>
              )}

              {task.scheduled_time && (
                <Text
                  style={{
                    color: theme.textMuted,
                    fontSize: theme.fontSize.xs,
                    marginLeft: 8,
                  }}>
                  {typeof task.scheduled_time === 'string' ? task.scheduled_time.slice(0, 5) : ''}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});
