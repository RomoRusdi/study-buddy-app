import { useCallback, useRef, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Task } from '@/types/task';

// Key untuk menyimpan catatan notifikasi yang sudah dikirim di localStorage
const NOTIF_RECORD_KEY = 'notif-sent-record';

export function useNotifications() {
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('notifications-enabled', false);

  // Gunakan ref untuk notif record agar tidak memicu infinite re-render
  const notifRecordRef = useRef<Record<string, number>>({});

  // Muat catatan notifikasi dari localStorage saat pertama kali
  useEffect(() => {
    const saved = localStorage.getItem(NOTIF_RECORD_KEY);
    if (saved) {
      try {
        notifRecordRef.current = JSON.parse(saved);
      } catch {
        notifRecordRef.current = {};
      }
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('Browser ini tidak mendukung notifikasi');
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
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options,
      });
    }
  }, []);

  const checkUpcomingDeadlines = useCallback((tasks: Task[]) => {
    // Cek permission langsung dari browser, tidak hanya dari state
    if (!notificationsEnabled || Notification.permission !== 'granted') return;

    const now = new Date();
    const record = { ...notifRecordRef.current };
    let recordChanged = false;

    const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    tasks.forEach(task => {
      if (task.status === 'complete') return;

      const dueDate = new Date(task.dueDate);
      const msUntilDue = dueDate.getTime() - now.getTime();
      const hoursUntilDue = msUntilDue / (1000 * 60 * 60);

      // ⏰ H-1: Deadline dalam 24 jam ke depan
      if (hoursUntilDue > 0 && hoursUntilDue <= 24) {
        const key = `${task.id}-day1`;
        const lastSent = record[key] || 0;

        // Hanya kirim jika belum dikirim dalam 12 jam terakhir
        if (now.getTime() - lastSent > TWELVE_HOURS_MS) {
          const hoursText = Math.round(hoursUntilDue);
          sendNotification('⏰ Tugas Akan Segera Deadline!', {
            body: `"${task.title}" (${task.course}) due dalam ${hoursText} jam`,
            tag: key,
          });
          record[key] = now.getTime();
          recordChanged = true;
        }
      }

      // 📅 H-3: Deadline antara 1 hari dan 3 hari ke depan
      if (hoursUntilDue > 24 && hoursUntilDue <= 72) {
        const key = `${task.id}-day3`;
        const lastSent = record[key] || 0;

        // Hanya kirim jika belum dikirim dalam 24 jam terakhir
        if (now.getTime() - lastSent > TWENTY_FOUR_HOURS_MS) {
          const daysText = Math.ceil(hoursUntilDue / 24);
          sendNotification('📅 Deadline Dalam 3 Hari', {
            body: `"${task.title}" (${task.course}) deadline dalam ${daysText} hari`,
            tag: key,
          });
          record[key] = now.getTime();
          recordChanged = true;
        }
      }

      // 🚨 Overdue: Deadline sudah lewat
      if (hoursUntilDue < 0) {
        const key = `${task.id}-overdue`;
        const lastSent = record[key] || 0;

        // Hanya kirim sekali per 24 jam untuk tugas yang overdue
        if (now.getTime() - lastSent > TWENTY_FOUR_HOURS_MS) {
          sendNotification('🚨 Tugas Sudah Melewati Deadline!', {
            body: `"${task.title}" (${task.course}) sudah melewati batas waktu!`,
            tag: key,
          });
          record[key] = now.getTime();
          recordChanged = true;
        }
      }
    });

    // Bersihkan catatan notifikasi yang sudah lebih dari 8 hari
    const eightDaysAgo = now.getTime() - 8 * 24 * 60 * 60 * 1000;
    Object.keys(record).forEach(key => {
      if (record[key] < eightDaysAgo) {
        delete record[key];
        recordChanged = true;
      }
    });

    if (recordChanged) {
      notifRecordRef.current = record;
      localStorage.setItem(NOTIF_RECORD_KEY, JSON.stringify(record));
    }
  }, [notificationsEnabled, sendNotification]);

  return {
    notificationsEnabled,
    requestPermission,
    sendNotification,
    checkUpcomingDeadlines,
  };
}
