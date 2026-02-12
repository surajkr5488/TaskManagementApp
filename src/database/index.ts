
import {Task} from '../types/task.types';
import {getRealm, initializeRealm} from './realm/realmConfig';
import {TaskSchema} from './realm/schemas';

export const DatabaseService = {
  initialize: async (): Promise<void> => {
    await initializeRealm();
  },

  getAllTasks: (userId: string): Task[] => {
    const realm = getRealm();
    const tasks = realm
      .objects<TaskSchema>('Task')
      .filtered('userId == $0', userId);
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      reminderTime: task.reminderTime,
      synced: task.synced,
    }));
  },

  getTaskById: (id: string): Task | null => {
    const realm = getRealm();
    const task = realm.objectForPrimaryKey<TaskSchema>('Task', id);
    if (!task) return null;
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      reminderTime: task.reminderTime,
      synced: task.synced,
    };
  },

  createTask: (task: Task): void => {
    const realm = getRealm();
    realm.write(() => {
      realm.create('Task', task);
    });
  },

  updateTask: (id: string, updates: Partial<Task>): void => {
    const realm = getRealm();
    realm.write(() => {
      const task = realm.objectForPrimaryKey<TaskSchema>('Task', id);
      if (task) {
        Object.assign(task, updates, {updatedAt: new Date()});
      }
    });
  },

  deleteTask: (id: string): void => {
    const realm = getRealm();
    realm.write(() => {
      const task = realm.objectForPrimaryKey<TaskSchema>('Task', id);
      if (task) {
        realm.delete(task);
      }
    });
  },

  getUnsyncedTasks: (userId: string): Task[] => {
    const realm = getRealm();
    const tasks = realm
      .objects<TaskSchema>('Task')
      .filtered('userId == $0 AND synced == false', userId);
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      reminderTime: task.reminderTime,
      synced: task.synced,
    }));
  },

  markTaskAsSynced: (id: string): void => {
    const realm = getRealm();
    realm.write(() => {
      const task = realm.objectForPrimaryKey<TaskSchema>('Task', id);
      if (task) {
        task.synced = true;
      }
    });
  },

  clearAllTasks: (): void => {
    const realm = getRealm();
    realm.write(() => {
      const allTasks = realm.objects('Task');
      realm.delete(allTasks);
    });
  },
};

export {initializeRealm};

