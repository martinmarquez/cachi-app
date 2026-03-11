import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { getPreferences, upsertPreferences } from '@/lib/api';
import { UserPreferences } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SettingsScreen() {
  const { theme, isCalmMode, toggleCalmMode } = useTheme();
  const { user, signOut } = useAuth();

  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [breakInterval, setBreakInterval] = useState('25');
  const [wakeTime, setWakeTime] = useState('08:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState('21:00');
  const [saving, setSaving] = useState(false);

  const loadPrefs = useCallback(async () => {
    if (!user) return;
    try {
      const result = await getPreferences(user.id);
      if (result) {
        setPrefs(result);
        setBreakInterval(String(result.break_interval_minutes));
        setWakeTime(result.wake_time);
        setSleepTime(result.sleep_time);
        setNotificationsEnabled(result.notifications_enabled ?? true);
        setNotificationTime(result.notification_time ?? '21:00');
      }
    } catch {
      // silently fail
    }
  }, [user]);

  useEffect(() => {
    loadPrefs();
  }, [loadPrefs]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    try {
      await upsertPreferences(user.id, {
        calm_mode: isCalmMode,
        break_interval_minutes: parseInt(breakInterval, 10) || 25,
        wake_time: wakeTime,
        sleep_time: sleepTime,
        notifications_enabled: notificationsEnabled,
        notification_time: notificationTime,
      });
      Alert.alert('', 'Preferencias guardadas');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }, [user, isCalmMode, breakInterval, wakeTime, sleepTime, notificationsEnabled, notificationTime]);

  const handleSignOut = useCallback(() => {
    Alert.alert('Cerrar sesion', 'Estas seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesion', style: 'destructive', onPress: signOut },
    ]);
  }, [signOut]);

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
            Configuracion
          </Text>
        </Animated.View>

        {/* Calm mode */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(theme.animationDuration)}
          style={{ marginTop: theme.spacing.xl }}>
          <Card>
            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: theme.fontSize.base,
                    fontWeight: '600',
                    color: theme.text,
                  }}>
                  🧘 Modo Calma
                </Text>
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.textSecondary,
                    marginTop: 2,
                  }}>
                  Colores suaves, tipografia grande, transiciones lentas
                </Text>
              </View>
              <Switch
                value={isCalmMode}
                onValueChange={toggleCalmMode}
                trackColor={{ true: theme.primary }}
              />
            </View>
          </Card>
        </Animated.View>

        {/* Break interval */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(theme.animationDuration)}
          style={{ marginTop: theme.spacing.lg }}>
          <Card>
            <Text
              style={{
                fontSize: theme.fontSize.base,
                fontWeight: '600',
                color: theme.text,
                marginBottom: theme.spacing.sm,
              }}>
              ⏰ Intervalo de pausas
            </Text>
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.textSecondary,
                marginBottom: theme.spacing.md,
              }}>
              Cada cuantos minutos te recordamos tomar una pausa
            </Text>
            <Input
              value={breakInterval}
              onChangeText={setBreakInterval}
              placeholder="25"
              keyboardType="numeric"
            />
          </Card>
        </Animated.View>

        {/* Schedule */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(theme.animationDuration)}
          style={{ marginTop: theme.spacing.lg }}>
          <Card>
            <Text
              style={{
                fontSize: theme.fontSize.base,
                fontWeight: '600',
                color: theme.text,
                marginBottom: theme.spacing.md,
              }}>
              🌅 Tu horario
            </Text>
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
                <Input
                  label="Despertar"
                  value={wakeTime}
                  onChangeText={setWakeTime}
                  placeholder="08:00"
                />
              </View>
              <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
                <Input
                  label="Dormir"
                  value={sleepTime}
                  onChangeText={setSleepTime}
                  placeholder="23:00"
                />
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Notifications */}
        <Animated.View
          entering={FadeInDown.delay(350).duration(theme.animationDuration)}
          style={{ marginTop: theme.spacing.lg }}>
          <Card>
            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: theme.fontSize.base,
                    fontWeight: '600',
                    color: theme.text,
                  }}>
                  🔔 Recordatorio de manana
                </Text>
                <Text
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: theme.textSecondary,
                    marginTop: 2,
                  }}>
                  Te avisa la noche anterior sobre las tareas del dia siguiente
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ true: theme.primary }}
              />
            </View>
            {notificationsEnabled && (
              <View style={{ marginTop: theme.spacing.md }}>
                <Input
                  label="Hora del recordatorio"
                  value={notificationTime}
                  onChangeText={setNotificationTime}
                  placeholder="21:00"
                />
              </View>
            )}
          </Card>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(theme.animationDuration)}
          style={{ marginTop: theme.spacing.xl }}>
          <Button
            title="Guardar preferencias"
            onPress={handleSave}
            loading={saving}
            fullWidth
            size="lg"
          />
        </Animated.View>

        {/* User info */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(theme.animationDuration)}
          style={{ marginTop: theme.spacing.xxl }}>
          <Card>
            <Text
              style={{
                fontSize: theme.fontSize.sm,
                color: theme.textMuted,
              }}>
              Sesion: {user?.email}
            </Text>
          </Card>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(550).duration(theme.animationDuration)}
          style={{ marginTop: theme.spacing.lg }}>
          <Button
            title="Cerrar sesion"
            onPress={handleSignOut}
            variant="danger"
            fullWidth
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: { flexDirection: 'row' },
});
