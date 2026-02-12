import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../hooks/useTheme';
import { AppDispatch } from '../../../src2/store/store';
import { RootState } from '../../store/store';
import { DatabaseService } from '../../database';
import { createTask, updateTask } from '../../store/slices/taskSlice';
import { NotificationService } from '../../services/notificationService';
import { Button, Input } from '../../components';


export const TaskDetailScreen: React.FC<any> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading } = useSelector((state: RootState) => state.tasks);

  const taskId = route.params?.taskId;
  const isEditing = !!taskId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderDate, setReminderDate] = useState<Date | undefined>();
  const [reminderTime, setReminderTime] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    if (isEditing && taskId) {
      const task = DatabaseService.getTaskById(taskId);
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        if (task.reminderTime) {
          const reminderDateTime = new Date(task.reminderTime);
          setReminderDate(reminderDateTime);
          setReminderTime(reminderDateTime);
        }
      }
    }
  }, [taskId]);

  const validateForm = (): boolean => {
    if (title.trim().length === 0) {
      setTitleError('Title is required');
      return false;
    }
    setTitleError('');
    return true;
  };

  const combineDateAndTime = () => {
    if (!reminderDate) return undefined;

    const combined = new Date(reminderDate);
    if (reminderTime) {
      combined.setHours(reminderTime.getHours());
      combined.setMinutes(reminderTime.getMinutes());
    }
    return combined;
  };

  const handleSave = async () => {
    if (!validateForm() || !user) return;

    const finalReminderTime = combineDateAndTime();

    try {
      if (isEditing) {
        await dispatch(
          updateTask({
            taskId,
            updates: { title, description, reminderTime: finalReminderTime },
          }),
        ).unwrap();
        Alert.alert('Success', 'Task updated successfully');
      } else {
        const result = await dispatch(
          createTask({
            userId: user.uid,
            taskData: { title, description, reminderTime: finalReminderTime },
          }),
        ).unwrap();

        if (finalReminderTime && finalReminderTime > new Date()) {
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
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setReminderDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setReminderTime(selectedTime);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time: Date | undefined) => {
    if (!time) return 'Select Time';
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const clearReminder = () => {
    setReminderDate(undefined);
    setReminderTime(undefined);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">

      {/* Gradient Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.headerTitle}>
          {isEditing ? '✏️ Edit Task' : '✨ Create New Task'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isEditing ? 'Update your task details' : 'Add a new task to your list'}
        </Text>
      </View>

      <View style={styles.form}>
        {/* Title Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Task Title *
          </Text>
          <Input
            placeholder="Enter task title"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              setTitleError('');
            }}
            error={titleError}
            style={styles.input}
          />
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Description
          </Text>
          <Input
            placeholder="Enter task description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textArea]}
          />
        </View>

        {/* Reminder Section */}
        <View style={styles.section}>
          <View style={styles.reminderHeader}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              🔔 Set Reminder
            </Text>
            {(reminderDate || reminderTime) && (
              <TouchableOpacity
                onPress={clearReminder}
                style={[
                  styles.clearButton,
                  { backgroundColor: `${theme.colors.error}15` },
                ]}>
                <Text style={[styles.clearText, { color: theme.colors.error }]}>
                  Clear
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Date Picker Button */}
          <TouchableOpacity
            style={[
              styles.pickerButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: reminderDate ? theme.colors.primary : theme.colors.border,
                borderWidth: 2,
              },
            ]}
            onPress={() => setShowDatePicker(true)}>
            <View style={styles.pickerContent}>
              <Text style={{ fontSize: 24 }}>📅</Text>
              <View style={styles.pickerTextContainer}>
                <Text style={[styles.pickerLabel, { color: theme.colors.textSecondary }]}>
                  Date
                </Text>
                <Text
                  style={[
                    styles.pickerValue,
                    {
                      color: reminderDate ? theme.colors.text : theme.colors.warning,
                    },
                  ]}>
                  {formatDate(reminderDate)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Time Picker Button */}
          <TouchableOpacity
            style={[
              styles.pickerButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: reminderTime ? theme.colors.primary : theme.colors.border,
                borderWidth: 2,
              },
            ]}
            onPress={() => setShowTimePicker(true)}>
            <View style={styles.pickerContent}>
              <Text style={{ fontSize: 24 }}>⏰</Text>
              <View style={styles.pickerTextContainer}>
                <Text style={[styles.pickerLabel, { color: theme.colors.textSecondary }]}>
                  Time
                </Text>
                <Text
                  style={[
                    styles.pickerValue,
                    {
                      color: reminderTime ? theme.colors.text : theme.colors.warning,
                    },
                  ]}>
                  {formatTime(reminderTime)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Preview */}
          {reminderDate && (
            <View
              style={[
                styles.previewCard,
                {
                  backgroundColor: `${theme.colors.success}10`,
                  borderColor: theme.colors.success,
                },
              ]}>
              <Text style={{ fontSize: 20, marginBottom: 4 }}>✅</Text>
              <Text style={[styles.previewText, { color: theme.colors.success }]}>
                Reminder set for
              </Text>
              <Text style={[styles.previewValue, { color: theme.colors.text }]}>
                {formatDate(reminderDate)}
              </Text>
              {reminderTime && (
                <Text style={[styles.previewValue, { color: theme.colors.text }]}>
                  at {formatTime(reminderTime)}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Save Button */}
        <Button
          title={isEditing ? '💾 Update Task' : '✨ Create Task'}
          onPress={handleSave}
          loading={loading}
          style={styles.saveButton}
        />
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={reminderDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={reminderTime || new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
          is24Hour={false}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    marginBottom: 0,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pickerButton: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  pickerLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  pickerValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  previewCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    alignItems: 'center',
    marginTop: 8,
  },
  previewText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    marginTop: 8,
    height: 56,
  },
});
