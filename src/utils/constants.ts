
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  THEME_MODE: '@theme_mode',
  LAST_SYNC: '@last_sync',
} as const;

export const NOTIFICATION_CHANNELS = {
  TASK_REMINDERS: {
    id: 'task-reminders',
    name: 'Task Reminders',
    description: 'Notifications for task reminders',
  },
  SYNC_STATUS: {
    id: 'sync-status',
    name: 'Sync Status',
    description: 'Background sync notifications',
  },
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR:
    'Network connection failed. Please check your internet connection.',
  AUTH_ERROR: 'Authentication failed. Please try again.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 6 characters long.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  TASK_CREATE_ERROR: 'Failed to create task. Please try again.',
  TASK_UPDATE_ERROR: 'Failed to update task. Please try again.',
  TASK_DELETE_ERROR: 'Failed to delete task. Please try again.',
  SYNC_ERROR: 'Failed to sync tasks. Will retry when online.',
} as const;

export const SYNC_INTERVAL = 30000; // 30 seconds
export const TASK_ITEM_HEIGHT = 80;
export const DEBOUNCE_DELAY = 300;

