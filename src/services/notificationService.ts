
import notifee, {AndroidImportance, TriggerType} from '@notifee/react-native';
import {NOTIFICATION_CHANNELS} from '../utils/constants';
import {Task} from '../types/task.types';

export const NotificationService = {

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

    await notifee.requestPermission();
  },

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

  cancelTaskReminder: async (taskId: string): Promise<void> => {
    await notifee.cancelNotification(taskId);
  },

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

  getScheduledNotifications: async () => {
    return await notifee.getTriggerNotifications();
  },

  cancelAllNotifications: async (): Promise<void> => {
    await notifee.cancelAllNotifications();
  },
};

