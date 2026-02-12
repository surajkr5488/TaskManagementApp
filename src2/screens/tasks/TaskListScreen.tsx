import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../hooks/useTheme';
import { AppDispatch, RootState } from '../../store/store';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { deleteTask, fetchTasks, syncTasks, toggleTaskComplete } from '../../store/slices/taskSlice';
import { Task } from '../../types/task.types';
import { Loader, TaskItem } from '../../components';
import { TASK_ITEM_HEIGHT } from '../../utils/constants';


export const TaskListScreen: React.FC<any> = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { tasks, loading, syncStatus } = useSelector((state: RootState) => state.tasks);
  const { isOnline } = useNetworkStatus();
  const [refreshing, setRefreshing] = useState(false);




  // Fetch when user login
  useEffect(() => {
    if (user) {
      dispatch(fetchTasks(user.uid));
    }
  }, [user]);

  // Auto sync when internet comes online
  useEffect(() => {
    if (isOnline && user) {
      dispatch(syncTasks(user.uid));
    }
  }, [isOnline]);

  const onRefresh = async () => {
    if (user) {
      setRefreshing(true);
      await dispatch(fetchTasks(user.uid));
      setRefreshing(false);
    }
  };

  const handleToggleComplete = (taskId: string, completed: boolean) => {
    dispatch(toggleTaskComplete({ taskId, completed: !completed }));
  };

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${taskTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteTask(taskId)),
        },
      ],
    );
  };

  const handleTaskPress = (taskId: string) => {
    navigation.navigate('TaskDetail', { taskId });
  };

  const handleAddTask = () => {
    navigation.navigate('TaskDetail', {});
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TaskItem
      task={item}
      onPress={() => handleTaskPress(item.id)}
      onToggleComplete={() => handleToggleComplete(item.id, item.completed)}
      onDelete={() => handleDeleteTask(item.id, item.title)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        No tasks yet. Tap + to create one!
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={[styles.header, { paddingBottom: theme.spacing.md }]}>
      <View style={styles.statusBar}>
        <View style={[styles.statusDot, {
          backgroundColor: isOnline ? theme.colors.success : theme.colors.error
        }]} />
        <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
          {isOnline ? 'Online' : 'Offline'}
        </Text>
        {syncStatus === 'syncing' && (
          <Text style={[styles.syncText, { color: theme.colors.warning }]}>
            • Syncing...
          </Text>
        )}
      </View>
    </View>
  );

  if (loading && tasks.length === 0) {
    return <Loader />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { padding: theme.spacing.md },
        ]}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        getItemLayout={(data, index) => ({
          length: TASK_ITEM_HEIGHT,
          offset: TASK_ITEM_HEIGHT * index,
          index,
        })}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />

      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            ...theme.shadows.lg,
          },
        ]}
        onPress={handleAddTask}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  header: {},
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
  },
  syncText: {
    fontSize: 14,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
