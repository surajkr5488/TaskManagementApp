// src/services/syncService.ts
import NetInfo from '@react-native-community/netinfo';
import { store } from '../store/store';
import { setSyncStatus } from '../store/slices/taskSlice';
import { DatabaseService } from '../database';
import { TaskService } from '../api/taskService';
import { NotificationService } from './notificationService';


let syncInterval: NodeJS.Timeout | null = null;

export const SyncService = {
  // Start automatic sync
  startAutoSync: (userId: string, intervalMs: number = 30000): void => {
    if (syncInterval) {
      clearInterval(syncInterval);
    }

    syncInterval = setInterval(async () => {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        await SyncService.syncNow(userId);
      }
    }, intervalMs);
  },

  // Stop automatic sync
  stopAutoSync: (): void => {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  },

  // Sync now
  syncNow: async (userId: string): Promise<void> => {
    try {
      store.dispatch(setSyncStatus('syncing'));

      // Get unsynced tasks from local database
      const unsyncedTasks = DatabaseService.getUnsyncedTasks(userId);

      if (unsyncedTasks.length === 0) {
        store.dispatch(setSyncStatus('synced'));
        return;
      }

      // Sync each task to Firestore
      for (const task of unsyncedTasks) {
        try {
          const existingTask = await TaskService.getTask(task.id);

          if (existingTask) {
            // Update existing task
            await TaskService.updateTask(task.id, task);
          } else {
            // Create new task
            await TaskService.createTask(task);
          }

          // Mark as synced in local database
          DatabaseService.markTaskAsSynced(task.id);
        } catch (error) {
          console.error('Failed to sync task:', task.id, error);
        }
      }

      store.dispatch(setSyncStatus('synced'));
      await NotificationService.showSyncNotification(
        `${unsyncedTasks.length} task(s) synced successfully`,
      );
    } catch (error) {
      console.error('Sync failed:', error);
      store.dispatch(setSyncStatus('error'));
    }
  },

  // Listen to network status
  setupNetworkListener: (userId: string): (() => void) => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        console.log('Network connected, syncing...');
        SyncService.syncNow(userId);
      } else {
        console.log('Network disconnected');
        store.dispatch(setSyncStatus('idle'));
      }
    });

    return unsubscribe;
  },

  // Check if online
  isOnline: async (): Promise<boolean> => {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected || false;
  },
};
