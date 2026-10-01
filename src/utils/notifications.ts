import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Translations } from '../i18n/translations';
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

type NotificationStrings = Translations['notifications'];

async function ensureAndroidChannel(strings: NotificationStrings): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: strings.channelName,
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/**
 * Cancels any previously scheduled cycle reminders and schedules fresh ones
 * based on the latest prediction. Safe to call whenever the prediction
 * changes (new period day logged, settings edited, etc).
 */
export async function scheduleCycleNotifications(
  prediction: CyclePrediction,
  strings: NotificationStrings
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await ensureAndroidChannel(strings);

  const now = Date.now();

  if (prediction.nextPeriodStart) {
    const reminderDate = fromISODate(addDaysISO(prediction.nextPeriodStart, -2));
    reminderDate.setHours(9, 0, 0, 0);
    if (reminderDate.getTime() > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: strings.periodTitle,
          body: strings.periodBody,
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
          title: strings.ovulationTitle,
          body: strings.ovulationBody,
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
