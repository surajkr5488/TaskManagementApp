import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {Text} from 'react-native';
import {useTheme} from '../hooks/useTheme';
import {TaskListScreen} from '../screens/tasks/TaskListScreen';
import {TaskDetailScreen} from '../screens/tasks/TaskDetailScreen';
import {SettingsScreen} from '../screens/settings/SettingsScreen';
import {AppTabParamList, TaskStackParamList} from '../types/navigation.types';
const Tab = createBottomTabNavigator<AppTabParamList>();
const TaskStack = createNativeStackNavigator<TaskStackParamList>();
const TaskStackNavigator: React.FC = () => {
  const {theme} = useTheme();
  return (
    <TaskStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: theme.colors.card},
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
      }}>
      <TaskStack.Screen
        name="TaskList"
        component={TaskListScreen}
        options={{title: 'My Tasks'}}
      />
      <TaskStack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={({route}) => ({
          title: route.params?.taskId ? 'Edit Task' : 'New Task',
        })}
      />
    </TaskStack.Navigator>
  );
};
export const AppStack: React.FC = () => {
  const {theme} = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
      }}>
      <Tab.Screen
        name="TaskList"
        component={TaskStackNavigator}
        options={{
          title: 'Tasks',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          title: 'Settings',
          tabBarIcon: ({color}) => <Text style={{fontSize: 24}}>⚙️</Text>,
          headerStyle: {backgroundColor: theme.colors.card},
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
        }}
      />
    </Tab.Navigator>
  );
};
