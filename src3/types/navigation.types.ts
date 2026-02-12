// src/types/navigation.types.ts
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

// App Stack (Bottom Tabs)
export type AppTabParamList = {
  TaskList: undefined;
  Settings: undefined;
};

// Task Stack
export type TaskStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId?: string };
};

// Root Stack
export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

// Navigation Props
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type AppNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<AppTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;
export type TaskNavigationProp = NativeStackNavigationProp<TaskStackParamList>;
