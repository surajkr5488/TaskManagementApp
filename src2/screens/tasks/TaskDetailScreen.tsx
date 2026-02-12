import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../hooks/useTheme';
import { AppDispatch, RootState } from '../../store/store';
import { DatabaseService } from '../../database';
import { createTask, updateTask } from '../../store/slices/taskSlice';
import { NotificationService } from '../../services/notificationService';
import { Button, Input } from '../../components';
import DateTimePicker from '@react-native-community/datetimepicker';


export const TaskDetailScreen: React.FC<any> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading } = useSelector((state: RootState) => state.tasks);

  const taskId = route.params?.taskId;
  const isEditing = !!taskId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderTime, setReminderTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    if (isEditing && taskId) {
      const task = DatabaseService.getTaskById(taskId);
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setReminderTime(task.reminderTime ?? null);
      }
    }
  }, [taskId]);

  useEffect(() => {
    return () => {
      setShowDatePicker(false);
    };
  }, []);

  const validateForm = (): boolean => {
    if (title.trim().length === 0) {
      setTitleError('Title is required');
      return false;
    }
    setTitleError('');
    return true;
  };

  const handleSave = async () => {
    if (loading) return;
    if (!validateForm() || !user) return;

    try {
      if (isEditing) {
        await dispatch(
          updateTask({
            taskId,
            updates: { title, description, reminderTime: reminderTime ?? null },
          }),
        ).unwrap();
        Alert.alert('Success', 'Task updated successfully');
      } else {
        const result = await dispatch(
          createTask({
            userId: user.uid,
            taskData: { title, description, reminderTime },
          }),
        ).unwrap();

        if (reminderTime) {
          await NotificationService.scheduleTaskReminder(result);
        }

        Alert.alert('Success', 'Task created successfully');
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save task');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event?.type === "dismissed") return;

    if (selectedDate) {
      setReminderTime(selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[styles.content, { padding: theme.spacing.lg }]}
        keyboardShouldPersistTaps="handled">
        <Input
          label="Title *"
          placeholder="Enter task title"
          value={title}
          onChangeText={setTitle}
          error={titleError}
        />

        <Input
          label="Description"
          placeholder="Enter task description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: 'top' }}
        />

        <View style={{ marginBottom: theme.spacing.md }}>
          <Text
            style={[
              styles.label,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.sm,
                marginBottom: theme.spacing.xs,
              },
            ]}>
            Reminder (Optional)
          </Text>
          <TouchableOpacity
            style={[
              styles.dateButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.md,
              },
            ]}
            onPress={() => {
              if (!showDatePicker) {
                setShowDatePicker(true);
              }
            }}>
            <Text style={{ color: theme.colors.text }}>
              {reminderTime
                ? reminderTime.toLocaleString()
                : 'Set reminder time'}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={reminderTime || new Date()}
            mode="datetime"
            is24Hour
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        <Button
          title={isEditing ? 'Update Task' : 'Create Task'}
          onPress={handleSave}
          loading={loading}
          style={{ marginTop: theme.spacing.lg }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  label: {
    fontWeight: '500',
  },
  dateButton: {
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
});
