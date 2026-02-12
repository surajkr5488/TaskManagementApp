// src/types/task.types.ts
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  reminderTime?: Date | null;
  synced: boolean;
}

export interface TaskFormData {
  title: string;
  description: string;
  reminderTime?: Date | null;
}

export interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
}
