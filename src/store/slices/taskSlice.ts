
import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {Task, TaskFormData, TaskState} from '../../types/task.types';
import {DatabaseService} from '../../database';
import {TaskService} from '../../api/taskService';
import {generateId} from '../../utils/helpers';

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  syncStatus: 'idle',
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (userId: string, {rejectWithValue}) => {
    try {
      const localTasks = DatabaseService.getAllTasks(userId);

      TaskService.getUserTasks(userId)
        .then(remoteTasks => {

        })
        .catch(() => {});
      return localTasks;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (
    {userId, taskData}: {userId: string; taskData: TaskFormData},
    {rejectWithValue},
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
      DatabaseService.createTask(task);

      TaskService.createTask(task)
        .then(() => {
          DatabaseService.markTaskAsSynced(task.id);
        })
        .catch(() => {});
      return task;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async (
    {taskId, updates}: {taskId: string; updates: Partial<Task>},
    {rejectWithValue},
  ) => {
    try {
      DatabaseService.updateTask(taskId, {...updates, synced: false});

      TaskService.updateTask(taskId, updates)
        .then(() => {
          DatabaseService.markTaskAsSynced(taskId);
        })
        .catch(() => {});
      return {taskId, updates: {...updates, synced: false}};
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string, {rejectWithValue}) => {
    try {
      DatabaseService.deleteTask(taskId);
      TaskService.deleteTask(taskId).catch(() => {});
      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const toggleTaskComplete = createAsyncThunk(
  'tasks/toggleTaskComplete',
  async (
    {taskId, completed}: {taskId: string; completed: boolean},
    {rejectWithValue},
  ) => {
    try {
      const updates = {completed, synced: false};
      DatabaseService.updateTask(taskId, updates);
      TaskService.updateTask(taskId, {completed})
        .then(() => {
          DatabaseService.markTaskAsSynced(taskId);
        })
        .catch(() => {});
      return {taskId, updates};
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const syncTasks = createAsyncThunk(
  'tasks/syncTasks',
  async (userId: string, {rejectWithValue}) => {
    try {
      const unsyncedTasks = DatabaseService.getUnsyncedTasks(userId);
      for (const task of unsyncedTasks) {
        try {
          await TaskService.createTask(task);
          DatabaseService.markTaskAsSynced(task.id);
        } catch (error) {}
      }
      const remoteTasks = await TaskService.getUserTasks(userId);
      return remoteTasks;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setSyncStatus: (state, action: PayloadAction<TaskState['syncStatus']>) => {
      state.syncStatus = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchTasks.pending, state => {
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
    builder.addCase(createTask.fulfilled, (state, action) => {
      state.tasks.unshift(action.payload);
    });
    builder.addCase(createTask.rejected, (state, action) => {
      state.error = action.payload as string;
    });
    builder.addCase(updateTask.fulfilled, (state, action) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.taskId);
      if (index !== -1) {
        state.tasks[index] = {...state.tasks[index], ...action.payload.updates};
      }
    });
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    });
    builder.addCase(toggleTaskComplete.fulfilled, (state, action) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.taskId);
      if (index !== -1) {
        state.tasks[index] = {...state.tasks[index], ...action.payload.updates};
      }
    });
    builder.addCase(syncTasks.pending, state => {
      state.syncStatus = 'syncing';
    });
    builder.addCase(syncTasks.fulfilled, (state, action) => {
      state.syncStatus = 'synced';
      state.tasks = action.payload;
    });
    builder.addCase(syncTasks.rejected, state => {
      state.syncStatus = 'error';
    });
  },
});

export const {clearError, setSyncStatus} = taskSlice.actions;
export default taskSlice.reducer;

