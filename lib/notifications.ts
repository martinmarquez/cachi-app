import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Task, NotificationStyle } from '@/types';

// Configure how notifications display when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    // Web Notifications API fallback
    if ('Notification' in window) {
      const result = await window.Notification.requestPermission();
      return result === 'granted';
    }
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleNextDayNotification(
  tasks: Task[],
  notificationTime: string, // HH:MM
  style: NotificationStyle
): Promise<void> {
  // Cancel existing scheduled notifications first
  await cancelAllNotifications();

  if (style === 'off' || tasks.length === 0) return;

  const [hours, minutes] = notificationTime.split(':').map(Number);

  let title: string;
  let body: string;

  if (style === 'gentle') {
    const firstTask = tasks[0].title;
    title = 'Preparate para manana';
    body =
      tasks.length === 1
        ? `Manana tenes una tarea: ${firstTask}. Preparate tranquilo`
        : `Manana tenes ${tasks.length} tareas. La primera es: ${firstTask}. Preparate tranquilo`;
  } else {
    // minimal
    title = 'Tareas de manana';
    body =
      tasks.length === 1
        ? '1 tarea para manana'
        : `${tasks.length} tareas para manana`;
  }

  if (Platform.OS === 'web') {
    // On web, schedule using setTimeout (won't persist across page refreshes)
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }
    const delay = target.getTime() - now.getTime();
    if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
      setTimeout(() => {
        if ('Notification' in window && window.Notification.permission === 'granted') {
          new window.Notification(title, { body });
        }
      }, delay);
    }
    return;
  }

  // Native: schedule using expo-notifications
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: hours,
      minute: minutes,
    },
  });
}

export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
