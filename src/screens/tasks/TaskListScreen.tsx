import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { AppDispatch, RootState } from '../../store/store';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { deleteTask, fetchTasks, toggleTaskComplete } from '../../store/slices/taskSlice';
import { Task } from '../../types/task.types';
import { Loader } from '../../components';


const { width } = Dimensions.get('window');

export const TaskListScreen: React.FC<any> = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { tasks, loading } = useSelector((state: RootState) => state.tasks);
  const { isOnline } = useNetworkStatus();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchTasks(user.uid));
    }
  }, [user]);

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

  const TaskItem = ({ item, index }: { item: Task; index: number }) => {
    const [scaleAnim] = useState(new Animated.Value(0));
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          delay: index * 50,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    const formatDate = (date: Date) => {
      const now = new Date();
      const taskDate = new Date(date);
      const diff = taskDate.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) return 'Today';
      if (days === 1) return 'Tomorrow';
      if (days === -1) return 'Yesterday';
      if (days > 1 && days < 7) return `In ${days} days`;

      return taskDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    };

    const formatTime = (date: Date) => {
      return new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };

    const isOverdue = item.reminderTime && new Date(item.reminderTime) < new Date() && !item.completed;

    // Safely get gradient colors
    const getGradientColors = () => {
      if (!theme?.colors) {
        return ['#6366F1', '#8B5CF6']; // fallback colors
      }

      if (item.completed) {
        return [theme.colors.success || '#10B981', theme.colors.success || '#10B981'];
      }

      if (isOverdue) {
        return [theme.colors.error || '#EF4444', theme.colors.warning || '#F59E0B'];
      }

      return [theme.colors.primary || '#6366F1', theme.colors.accent || '#8B5CF6'];
    };

    return (
      <Animated.View
        style={[
          styles.taskContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
          activeOpacity={0.9}
          style={[
            styles.taskCard,
            { backgroundColor: theme?.colors?.surface || '#FFFFFF' },
          ]}>
          {/* Gradient Top Bar */}
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBar}
          />

          <View style={styles.taskContent}>
            {/* Checkbox */}
            <TouchableOpacity
              onPress={() => handleToggleComplete(item.id, item.completed)}
              style={[
                styles.checkbox,
                {
                  borderColor: item.completed
                    ? theme?.colors?.success || '#10B981'
                    : theme?.colors?.border || '#E5E7EB',
                  backgroundColor: item.completed
                    ? theme?.colors?.success || '#10B981'
                    : 'transparent',
                },
              ]}>
              {item.completed && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>

            {/* Task Info */}
            <View style={styles.taskInfo}>
              <Text
                style={[
                  styles.taskTitle,
                  {
                    color: theme?.colors?.text || '#111827',
                    textDecorationLine: item.completed ? 'line-through' : 'none',
                    opacity: item.completed ? 0.6 : 1,
                  },
                ]}
                numberOfLines={2}>
                {item.title}
              </Text>

              {item.description && (
                <Text
                  style={[styles.taskDescription, { color: theme?.colors?.textSecondary || '#6B7280' }]}
                  numberOfLines={2}>
                  {item.description}
                </Text>
              )}

              {/* Badges */}
              <View style={styles.badges}>
                {item.reminderTime && (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: isOverdue
                          ? `${theme?.colors?.error || '#EF4444'}15`
                          : `${theme?.colors?.primary || '#6366F1'}15`,
                      },
                    ]}>
                    <Text style={[styles.badgeEmoji]}>📅</Text>
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color: isOverdue ? theme?.colors?.error || '#EF4444' : theme?.colors?.primary || '#6366F1',
                        },
                      ]}>
                      {formatDate(item.reminderTime)}
                    </Text>
                  </View>
                )}
                {item.reminderTime && (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: isOverdue
                          ? `${theme?.colors?.error || '#EF4444'}15`
                          : `${theme?.colors?.success || '#10B981'}15`,
                      },
                    ]}>
                    <Text style={styles.badgeEmoji}>⏰</Text>
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color: isOverdue ? theme?.colors?.error || '#EF4444' : theme?.colors?.success || '#10B981',
                        },
                      ]}>
                      {formatTime(item.reminderTime)}
                    </Text>
                  </View>
                )}
                {!item.synced && (
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: `${theme?.colors?.warning || '#F59E0B'}15` },
                    ]}>
                    <Text style={styles.badgeEmoji}>⏳</Text>
                    <Text
                      style={[styles.badgeText, { color: theme?.colors?.warning || '#F59E0B' }]}>
                      Syncing
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Delete Button */}
            <TouchableOpacity
              onPress={() => handleDeleteTask(item.id, item.title)}
              style={[
                styles.deleteButton,
                { backgroundColor: `${theme?.colors?.error || '#EF4444'}15` },
              ]}>
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderTask = ({ item, index }: { item: Task; index: number }) => (
    <TaskItem item={item} index={index} />
  );

  if (loading && tasks.length === 0) {
    return <Loader />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme?.colors?.background || '#F9FAFB' }]}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[theme?.colors?.primary || '#6366F1', theme?.colors?.accent || '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}>
        <Text style={styles.headerTitle}>✨ My Tasks</Text>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isOnline ? '#34D399' : '#EF4444' },
            ]}
          />
          <Text style={styles.statusText}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </LinearGradient>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={[styles.emptyText, { color: theme?.colors?.textSecondary || '#6B7280' }]}>
              No tasks yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme?.colors?.textTertiary || '#9CA3AF' }]}>
              Tap the + button to create your first task
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme?.colors?.primary || '#6366F1'}
            colors={[theme?.colors?.primary || '#6366F1']}
          />
        }
      />

      {/* FAB with Gradient */}
      <TouchableOpacity
        onPress={() => navigation.navigate('TaskDetail', {})}
        activeOpacity={0.9}
        style={styles.fabContainer}>
        <LinearGradient
          colors={[theme?.colors?.primary || '#6366F1', theme?.colors?.accent || '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}>
          <Text style={styles.fabText}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  taskContainer: {
    marginBottom: 16,
  },
  taskCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  gradientBar: {
    height: 5,
  },
  taskContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 24,
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteIcon: {
    fontSize: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});