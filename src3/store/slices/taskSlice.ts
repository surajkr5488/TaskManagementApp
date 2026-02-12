// src/store/slices/taskSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskFormData, TaskState } from '../../types/task.types';
import { DatabaseService } from '../../database';
import { TaskService } from '../../api/taskService';
import { generateId } from '../../utils/helpers';


const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  syncStatus: 'idle',
};

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (userId: string, { rejectWithValue }) => {
    try {
      // First, load from local database
      const localTasks = DatabaseService.getAllTasks(userId);

      // Then try to fetch from Firestore
      try {
        const remoteTasks = await TaskService.getUserTasks(userId);
        return remoteTasks;
      } catch (error) {
        // If offline, return local tasks
        return localTasks;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (
    { userId, taskData }: { userId: string; taskData: TaskFormData },
    { rejectWithValue },
  ) => {
    try {
      const task: Task = {
        id: generateId(),
        title: taskData.title,
        description: taskData.description,
        completed: false,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        reminderTime: taskData.reminderTime ?? null,
        synced: false,
      };

      // Save to local database first
      DatabaseService.createTask(task);

      // Try to sync to Firestore
      try {
        await TaskService.createTask(task);
        DatabaseService.markTaskAsSynced(task.id);
        return { ...task, synced: true };
      } catch (error) {
        // If offline, keep local copy
        return task;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async (
    { taskId, updates }: { taskId: string; updates: Partial<Task> },
    { rejectWithValue },
  ) => {
    try {
      // Update local database first
      DatabaseService.updateTask(taskId, { ...updates, synced: false });

      // Try to sync to Firestore
      try {
        await TaskService.updateTask(taskId, updates);
        DatabaseService.markTaskAsSynced(taskId);
        return { taskId, updates: { ...updates, synced: true } };
      } catch (error) {
        // If offline, keep local update
        return { taskId, updates: { ...updates, synced: false } };
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      // Delete from local database first
      DatabaseService.deleteTask(taskId);

      // Try to delete from Firestore
      try {
        await TaskService.deleteTask(taskId);
      } catch (error) {
        // If offline, local deletion is enough
        console.log('Task deleted locally, will sync later');
      }

      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const toggleTaskComplete = createAsyncThunk(
  'tasks/toggleTaskComplete',
  async ({ taskId, completed }: { taskId: string; completed: boolean }, { rejectWithValue }) => {
    try {
      const updates = { completed, synced: false };
      DatabaseService.updateTask(taskId, updates);

      // Try to sync to Firestore
      try {
        await TaskService.updateTask(taskId, { completed });
        DatabaseService.markTaskAsSynced(taskId);
        return { taskId, updates: { completed, synced: true } };
      } catch (error) {
        return { taskId, updates };
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const syncTasks = createAsyncThunk(
  'tasks/syncTasks',
  async (userId: string, { rejectWithValue }) => {
    try {
      const unsyncedTasks = DatabaseService.getUnsyncedTasks(userId);

      for (const task of unsyncedTasks) {
        try {
          await TaskService.createTask(task);
          DatabaseService.markTaskAsSynced(task.id);
        } catch (error) {
          console.error('Failed to sync task:', task.id);
        }
      }

      // Fetch latest from Firestore
      const remoteTasks = await TaskService.getUserTasks(userId);
      return remoteTasks;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// Slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSyncStatus: (state, action: PayloadAction<TaskState['syncStatus']>) => {
      state.syncStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Tasks
    builder.addCase(fetchTasks.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state.loading = false;
      state.tasks = action.payload;
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create Task
    builder.addCase(createTask.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createTask.fulfilled, (state, action) => {
      state.loading = false;
      state.tasks.unshift(action.payload);
    });
    builder.addCase(createTask.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Task
    builder.addCase(updateTask.fulfilled, (state, action) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.taskId);
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...action.payload.updates };
      }
    });

    // Delete Task
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    });

    // Toggle Task Complete
    builder.addCase(toggleTaskComplete.fulfilled, (state, action) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.taskId);
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...action.payload.updates };
      }
    });

    // Sync Tasks
    builder.addCase(syncTasks.pending, (state) => {
      state.syncStatus = 'syncing';
    });
    builder.addCase(syncTasks.fulfilled, (state, action) => {
      state.syncStatus = 'synced';
      state.tasks = action.payload;
    });
    builder.addCase(syncTasks.rejected, (state) => {
      state.syncStatus = 'error';
    });
  },
});

export const { clearError, setSyncStatus } = taskSlice.actions;
export default taskSlice.reducer;
