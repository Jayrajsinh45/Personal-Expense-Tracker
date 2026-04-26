import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications should behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupNotifications() {
  if (Platform.OS === 'web') return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') return;

  // Check if a daily reminder is already scheduled
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  if (scheduledNotifications.length === 0) {
    await scheduleDailyReminder();
  }
}

export async function scheduleDailyReminder(forTomorrow = false) {
  if (Platform.OS === 'web') return;

  // Clear existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  const trigger = new Date();
  trigger.setHours(20, 0, 0, 0); // 8:00 PM (20:00)

  // If it's already past 8 PM today, or we explicitly want tomorrow, schedule for tomorrow
  if (forTomorrow || now.getTime() > trigger.getTime()) {
    trigger.setDate(trigger.getDate() + 1);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Friendly Reminder! 🔔",
      body: "Don't forget to track your expenses for today!",
      sound: true,
    },
    trigger: {
      hour: 20,
      minute: 0,
      repeats: true, // Will repeat every day at 8:00 PM
    },
  });
}

// Call this when a user adds a transaction to push the next reminder to tomorrow
export async function pushReminderToTomorrow() {
  if (Platform.OS === 'web') return;
  await scheduleDailyReminder(true);
}
