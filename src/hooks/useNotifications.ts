import { useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Task } from '@/types/task';

export function useNotifications() {
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('notifications-enabled', false);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setNotificationsEnabled(granted);
      return granted;
    }

    return false;
  }, [setNotificationsEnabled]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (notificationsEnabled && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options,
      });
    }
  }, [notificationsEnabled]);

  const checkUpcomingDeadlines = useCallback((tasks: Task[]) => {
    if (!notificationsEnabled) return;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingTasks = tasks.filter(task => {
      if (task.status === 'complete') return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && dueDate <= tomorrow;
    });

    upcomingTasks.forEach(task => {
      const dueDate = new Date(task.dueDate);
      const hoursUntilDue = Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      if (hoursUntilDue <= 24 && hoursUntilDue > 0) {
        sendNotification(`📚 Assignment Due Soon`, {
          body: `"${task.title}" for ${task.course} is due in ${hoursUntilDue} hours`,
          tag: task.id,
        });
      }
    });
  }, [notificationsEnabled, sendNotification]);

  return {
    notificationsEnabled,
    requestPermission,
    sendNotification,
    checkUpcomingDeadlines,
  };
}
