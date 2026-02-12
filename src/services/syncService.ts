// src/services/syncService.ts
import NetInfo from '@react-native-community/netinfo';
import { store } from '../store/store';
import { setSyncStatus } from '../store/slices/taskSlice';
import { DatabaseService } from '../database';
import { TaskService } from '../api/taskService';
import { Task } from '../types/task.types';

let syncInterval: NodeJS.Timeout | null = null;
let syncQueue: Array<{ taskId: string; action: 'create' | 'update' | 'delete' }> = [];
let isSyncing = false;

export const SyncService = {
  // Initialize sync service
  initialize: (): void => {
    NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('🌐 Network connected - Starting sync...');
        SyncService.processSyncQueue();
      } else {
        console.log('📵 Network disconnected');
        store.dispatch(setSyncStatus('idle'));
      }
    });
  },

  startAutoSync: (userId: string, intervalMs: number = 30000): void => {
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(async () => {
      const isOnline = await SyncService.isOnline();
      if (isOnline) await SyncService.syncNow(userId);
    }, intervalMs);
  },

  stopAutoSync: (): void => {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  },

  syncNow: async (userId: string): Promise<void> => {
    if (isSyncing) return;
    try {
      isSyncing = true;
      store.dispatch(setSyncStatus('syncing'));
      const unsyncedTasks = DatabaseService.getUnsyncedTasks(userId);
      if (unsyncedTasks.length === 0) {
        store.dispatch(setSyncStatus('synced'));
        return;
      }
      for (const task of unsyncedTasks) {
        try {
          const existingTask = await TaskService.getTask(task.id);
          if (existingTask) {
            await TaskService.updateTask(task.id, task);
          } else {
            await TaskService.createTask(task);
          }
          DatabaseService.markTaskAsSynced(task.id);
        } catch (error) {
          console.error('Failed to sync task:', task.id, error);
          SyncService.addToSyncQueue(task.id, 'update');
        }
      }
      store.dispatch(setSyncStatus('synced'));
    } catch (error) {
      console.error('Sync failed:', error);
      store.dispatch(setSyncStatus('error'));
    } finally {
      isSyncing = false;
    }
  },

  addToSyncQueue: (taskId: string, action: 'create' | 'update' | 'delete'): void => {
    syncQueue = syncQueue.filter(item => item.taskId !== taskId);
    syncQueue.push({ taskId, action });
  },

  processSyncQueue: async (): Promise<void> => {
    if (isSyncing || syncQueue.length === 0) return;
    const isOnline = await SyncService.isOnline();
    if (!isOnline) return;
    isSyncing = true;
    const queueCopy = [...syncQueue];
    syncQueue = [];
    for (const item of queueCopy) {
      try {
        if (item.action === 'delete') {
          await TaskService.deleteTask(item.taskId);
        } else {
          const task = DatabaseService.getTaskById(item.taskId);
          if (task) {
            const existingTask = await TaskService.getTask(item.taskId);
            if (existingTask) {
              await TaskService.updateTask(item.taskId, task);
            } else {
              await TaskService.createTask(task);
            }
            DatabaseService.markTaskAsSynced(item.taskId);
          }
        }
      } catch (error) {
        syncQueue.push(item);
      }
    }
    isSyncing = false;
  },

  syncTask: async (task: Task): Promise<boolean> => {
    try {
      DatabaseService.updateTask(task.id, { synced: false });
      const isOnline = await SyncService.isOnline();
      if (!isOnline) {
        SyncService.addToSyncQueue(task.id, 'update');
        return true;
      }
      const existingTask = await TaskService.getTask(task.id);
      if (existingTask) {
        await TaskService.updateTask(task.id, task);
      } else {
        await TaskService.createTask(task);
      }
      DatabaseService.markTaskAsSynced(task.id);
      return true;
    } catch (error: any) {
      SyncService.addToSyncQueue(task.id, 'update');
      return true;
    }
  },

  deleteTask: async (taskId: string): Promise<void> => {
    try {
      const isOnline = await SyncService.isOnline();
      if (!isOnline) {
        SyncService.addToSyncQueue(taskId, 'delete');
        return;
      }
      await TaskService.deleteTask(taskId);
    } catch (error) {
      SyncService.addToSyncQueue(taskId, 'delete');
    }
  },

  setupNetworkListener: (userId: string): (() => void) => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        SyncService.processSyncQueue();
        SyncService.syncNow(userId);
      } else {
        store.dispatch(setSyncStatus('idle'));
      }
    });
    return unsubscribe;
  },

  isOnline: async (): Promise<boolean> => {
    try {
      const netInfo = await NetInfo.fetch();
      return netInfo.isConnected === true && netInfo.isInternetReachable === true;
    } catch (error) {
      return false;
    }
  },

  getSyncQueueStatus: () => ({ count: syncQueue.length, isSyncing, items: syncQueue }),
};
