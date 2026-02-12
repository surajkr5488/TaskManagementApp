
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme} from '../../hooks/useTheme';
import {formatDateTime} from '../../utils/helpers';
import {Task} from '../../types/task.types';

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onPress,
  onToggleComplete,
  onDelete,
}) => {
  const {theme} = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderRadius: theme.borderRadius.md,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.sm,
          borderLeftWidth: 4,
          borderLeftColor: task.completed
            ? theme.colors.success
            : theme.colors.primary,
        },
        theme.shadows.sm,
      ]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              {
                borderColor: task.completed
                  ? theme.colors.success
                  : theme.colors.border,
                backgroundColor: task.completed
                  ? theme.colors.success
                  : 'transparent',
              },
            ]}
            onPress={onToggleComplete}>
            {task.completed && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

          <View style={styles.taskInfo}>
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize.md,
                  fontWeight: theme.typography.fontWeight.semibold,
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                },
              ]}
              numberOfLines={1}>
              {task.title}
            </Text>
            {task.description && (
              <Text
                style={[
                  styles.description,
                  {
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.fontSize.sm,
                  },
                ]}
                numberOfLines={2}>
                {task.description}
              </Text>
            )}
            <View style={styles.footer}>
              <Text
                style={[
                  styles.date,
                  {
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.fontSize.xs,
                  },
                ]}>
                {formatDateTime(task.createdAt)}
              </Text>
              {!task.synced && (
                <View
                  style={[
                    styles.syncBadge,
                    {
                      backgroundColor: theme.colors.warning,
                      paddingHorizontal: theme.spacing.xs,
                      paddingVertical: 2,
                      borderRadius: theme.borderRadius.sm,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.syncText,
                      {fontSize: theme.typography.fontSize.xs},
                    ]}>
                    Not Synced
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.deleteButton, {padding: theme.spacing.sm}]}
          onPress={onDelete}>
          <Text style={{fontSize: 20}}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {},
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskInfo: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  description: {
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {},
  syncBadge: {},
  syncText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  deleteButton: {
    marginLeft: 8,
  },
});

