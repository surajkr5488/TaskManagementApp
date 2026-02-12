// src/services/notificationService.ts
import notifee, { AndroidImportance, TriggerType } from '@notifee/react-native';
import { NOTIFICATION_CHANNELS } from '../utils/constants';
import { Task } from '../types/task.types';


export const NotificationService = {
  // Initialize notification channels
  initialize: async (): Promise<void> => {
    await notifee.createChannel({
      id: NOTIFICATION_CHANNELS.TASK_REMINDERS.id,
      name: NOTIFICATION_CHANNELS.TASK_REMINDERS.name,
      description: NOTIFICATION_CHANNELS.TASK_REMINDERS.description,
      importance: AndroidImportance.HIGH,
    });

    await notifee.createChannel({
      id: NOTIFICATION_CHANNELS.SYNC_STATUS.id,
      name: NOTIFICATION_CHANNELS.SYNC_STATUS.name,
      description: NOTIFICATION_CHANNELS.SYNC_STATUS.description,
      importance: AndroidImportance.LOW,
    });

    // Request permissions
    await notifee.requestPermission();
  },

  // Schedule task reminder
  scheduleTaskReminder: async (task: Task): Promise<void> => {
    if (!task.reminderTime) return;

    const trigger: any = {
      type: TriggerType.TIMESTAMP,
      timestamp: task.reminderTime.getTime(),
    };

    await notifee.createTriggerNotification(
      {
        id: task.id,
        title: 'Task Reminder',
        body: task.title,
        android: {
          channelId: NOTIFICATION_CHANNELS.TASK_REMINDERS.id,
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
        },
      },
      trigger,
    );
  },

  // Cancel task reminder
  cancelTaskReminder: async (taskId: string): Promise<void> => {
    await notifee.cancelNotification(taskId);
  },

  // Show immediate notification
  showNotification: async (title: string, body: string): Promise<void> => {
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: NOTIFICATION_CHANNELS.TASK_REMINDERS.id,
        importance: AndroidImportance.HIGH,
      },
      ios: {
        sound: 'default',
      },
    });
  },

  // Show sync notification
  showSyncNotification: async (message: string): Promise<void> => {
    await notifee.displayNotification({
      title: 'Sync Status',
      body: message,
      android: {
        channelId: NOTIFICATION_CHANNELS.SYNC_STATUS.id,
        importance: AndroidImportance.LOW,
      },
    });
  },

  // Get all scheduled notifications
  getScheduledNotifications: async () => {
    return await notifee.getTriggerNotifications();
  },

  // Cancel all notifications
  cancelAllNotifications: async (): Promise<void> => {
    await notifee.cancelAllNotifications();
  },
};
