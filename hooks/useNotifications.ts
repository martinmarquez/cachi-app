import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPreferences, getTomorrowTasks } from '@/lib/api';
import {
  requestNotificationPermissions,
  scheduleNextDayNotification,
} from '@/lib/notifications';

export function useNotifications() {
  const { user } = useAuth();

  const setup = useCallback(async () => {
    if (!user) return;

    try {
      const granted = await requestNotificationPermissions();
      if (!granted) return;

      const prefs = await getPreferences(user.id);
      if (!prefs || !prefs.notifications_enabled) return;

      const tasks = await getTomorrowTasks(user.id);
      await scheduleNextDayNotification(
        tasks,
        prefs.notification_time ?? '21:00',
        prefs.notification_style ?? 'gentle'
      );
    } catch {
      // silently fail — notifications are best-effort
    }
  }, [user]);

  useEffect(() => {
    setup();
  }, [setup]);
}
