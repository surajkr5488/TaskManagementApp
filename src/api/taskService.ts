// src/api/taskService.ts
import { Task } from '../types/task.types';
import { firebaseFirestore, COLLECTIONS } from './firebaseConfig';


export const TaskService = {
  // Create task in Firestore
  createTask: async (task: Task): Promise<void> => {
    try {
      await firebaseFirestore()
        .collection(COLLECTIONS.TASKS)
        .doc(task.id)
        .set({
          ...task,
          createdAt: firebaseFirestore.FieldValue.serverTimestamp(),
          updatedAt: firebaseFirestore.FieldValue.serverTimestamp(),
        });
    } catch (error: any) {
      console.error('Error creating task in Firestore:', error);
      throw new Error(error.message || 'Failed to create task');
    }
  },

  // Update task in Firestore
  updateTask: async (taskId: string, updates: Partial<Task>): Promise<void> => {
    try {
      await firebaseFirestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .update({
          ...updates,
          updatedAt: firebaseFirestore.FieldValue.serverTimestamp(),
        });
    } catch (error: any) {
      console.error('Error updating task in Firestore:', error);
      throw new Error(error.message || 'Failed to update task');
    }
  },

  // Delete task from Firestore
  deleteTask: async (taskId: string): Promise<void> => {
    try {
      await firebaseFirestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .delete();
    } catch (error: any) {
      console.error('Error deleting task from Firestore:', error);
      throw new Error(error.message || 'Failed to delete task');
    }
  },

  // Get all tasks for a user
  getUserTasks: async (userId: string): Promise<Task[]> => {
    try {
      const snapshot = await firebaseFirestore()
        .collection(COLLECTIONS.TASKS)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          completed: data.completed,
          userId: data.userId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          reminderTime: data.reminderTime?.toDate(),
          synced: true,
        } as Task;
      });
    } catch (error: any) {
      console.error('Error getting user tasks from Firestore:', error);
      throw new Error(error.message || 'Failed to get tasks');
    }
  },

  // Get single task
  getTask: async (taskId: string): Promise<Task | null> => {
    try {
      const doc = await firebaseFirestore()
        .collection(COLLECTIONS.TASKS)
        .doc(taskId)
        .get();

      if (!doc.exists) return null;

      const data = doc.data();
      return {
        id: doc.id,
        title: data!.title,
        description: data!.description,
        completed: data!.completed,
        userId: data!.userId,
        createdAt: data!.createdAt?.toDate() || new Date(),
        updatedAt: data!.updatedAt?.toDate() || new Date(),
        reminderTime: data!.reminderTime?.toDate(),
        synced: true,
      } as Task;
    } catch (error: any) {
      console.error('Error getting task from Firestore:', error);
      throw new Error(error.message || 'Failed to get task');
    }
  },

  // Listen to task changes
  subscribeToUserTasks: (
    userId: string,
    onUpdate: (tasks: Task[]) => void,
  ): (() => void) => {
    return firebaseFirestore()
      .collection(COLLECTIONS.TASKS)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const tasks = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            description: data.description,
            completed: data.completed,
            userId: data.userId,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            reminderTime: data.reminderTime?.toDate(),
            synced: true,
          } as Task;
        });
        onUpdate(tasks);
      });
  },
};
