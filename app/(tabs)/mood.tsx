import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { addMoodEntry, getTodayMood, getMoodHistory } from '@/lib/api';
import { MoodEntry } from '@/types';
import { MoodSelector, MOOD_ITEMS, ENERGY_ITEMS } from '@/components/MoodSelector';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function MoodScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();

  const [moodLevel, setMoodLevel] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);
  const [history, setHistory] = useState<MoodEntry[]>([]);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [mood, hist] = await Promise.all([
        getTodayMood(user.id),
        getMoodHistory(user.id, 7),
      ]);
      setTodayMood(mood);
      setHistory(hist);
      if (mood) {
        setMoodLevel(mood.mood_level);
        setEnergyLevel(mood.energy_level);
      }
    } catch {
      // silently fail
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      await addMoodEntry(user.id, moodLevel, energyLevel, notes || undefined);
      setNotes('');
      await loadData();
      Alert.alert('', 'Registrado! Tu dia se va a ajustar segun como te sentis.');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }, [user, moodLevel, energyLevel, notes, loadData]);

  const getMoodEmoji = (level: number) =>
    MOOD_ITEMS.find((m) => m.level === level)?.emoji ?? '😐';
  const getEnergyEmoji = (level: number) =>
    ENERGY_ITEMS.find((e) => e.level === level)?.emoji ?? '⚡';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.xl }}>
        <Animated.View entering={FadeInDown.duration(theme.animationDuration)}>
          <Text
            style={{
              fontSize: theme.fontSize.xxl,
              fontWeight: '700',
              color: theme.text,
            }}>
            Como estas hoy?
          </Text>
          <Text
            style={{
              fontSize: theme.fontSize.base,
              color: theme.textSecondary,
              marginTop: theme.spacing.xs,
            }}>
            Esto nos ayuda a organizar mejor tu dia
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(100).duration(theme.animationDuration)}
          style={{ marginTop: theme.spacing.xl }}>
          <MoodSelector
            label="Tu animo"
            value={moodLevel}
            onChange={setMoodLevel}
            items={MOOD_ITEMS}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(theme.animationDuration)}
          style={{ marginTop: theme.spacing.xl }}>
          <MoodSelector
            label="Tu energia"
            value={energyLevel}
            onChange={setEnergyLevel}
            items={ENERGY_ITEMS}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(theme.animationDuration)}
          style={{ marginTop: theme.spacing.xl }}>
          <Input
            label="Notas (opcional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Como te sentis? Algo que quieras anotar..."
            multiline
            numberOfLines={3}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(350).duration(theme.animationDuration)}
          style={{ marginTop: theme.spacing.xl }}>
          <Button
            title={todayMood ? 'Actualizar registro' : 'Registrar'}
            onPress={handleSave}
            loading={saving}
            fullWidth
            size="lg"
          />
        </Animated.View>

        {/* History */}
        {history.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(400).duration(theme.animationDuration)}
            style={{ marginTop: theme.spacing.xxl }}>
            <Text
              style={{
                fontSize: theme.fontSize.lg,
                fontWeight: '600',
                color: theme.text,
                marginBottom: theme.spacing.md,
              }}>
              Ultimos dias
            </Text>

            {history.map((entry) => (
              <Card key={entry.id} style={{ marginBottom: theme.spacing.sm }}>
                <View style={styles.historyRow}>
                  <Text
                    style={{
                      fontSize: theme.fontSize.sm,
                      color: theme.textSecondary,
                      flex: 1,
                    }}>
                    {format(new Date(entry.created_at), "EEE d MMM, HH:mm", {
                      locale: es,
                    })}
                  </Text>
                  <Text style={{ fontSize: 20 }}>
                    {getMoodEmoji(entry.mood_level)}{' '}
                    {getEnergyEmoji(entry.energy_level)}
                  </Text>
                </View>
                {entry.notes && (
                  <Text
                    style={{
                      fontSize: theme.fontSize.sm,
                      color: theme.textMuted,
                      marginTop: theme.spacing.xs,
                    }}>
                    {entry.notes}
                  </Text>
                )}
              </Card>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
