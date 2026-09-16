import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { CyclePrediction } from '../types';
import { fromISODate, addDaysISO } from './date';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const ANDROID_CHANNEL_ID = 'period-reminders';

export async function requestNotificationPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Döngü Hatırlatmaları',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/**
 * Cancels any previously scheduled cycle reminders and schedules fresh ones
 * based on the latest prediction. Safe to call whenever the prediction
 * changes (new period day logged, settings edited, etc).
 */
export async function scheduleCycleNotifications(prediction: CyclePrediction): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await ensureAndroidChannel();

  const now = Date.now();

  if (prediction.nextPeriodStart) {
    const reminderDate = fromISODate(addDaysISO(prediction.nextPeriodStart, -2));
    reminderDate.setHours(9, 0, 0, 0);
    if (reminderDate.getTime() > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Adet döneminiz yaklaşıyor',
          body: 'Tahmini adet başlangıcınıza 2 gün kaldı.',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderDate,
          channelId: ANDROID_CHANNEL_ID,
        },
      });
    }
  }

  if (prediction.ovulationDate) {
    const reminderDate = fromISODate(addDaysISO(prediction.ovulationDate, -1));
    reminderDate.setHours(9, 0, 0, 0);
    if (reminderDate.getTime() > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Yumurtlama döneminiz yaklaşıyor',
          body: 'Tahmini yumurtlama gününüze 1 gün kaldı.',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderDate,
          channelId: ANDROID_CHANNEL_ID,
        },
      });
    }
  }
}

export async function cancelAllCycleNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
