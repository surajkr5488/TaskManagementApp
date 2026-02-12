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
import { AppDispatch, RootState } from '../../store/store';
import { DatabaseService } from '../../database';
import { createTask, updateTask } from '../../store/slices/taskSlice';
import { NotificationService } from '../../services/notificationService';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { Button, Input } from '../../components';

export const TaskDetailScreen: React.FC<any> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isOnline } = useNetworkStatus();

  const taskId = route.params?.taskId;
  const isEditing = !!taskId;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderDate, setReminderDate] = useState<Date | undefined>();
  const [reminderTime, setReminderTime] = useState<Date | undefined>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [existingTask, setExistingTask] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing && taskId) {
      const task = DatabaseService.getTaskById(taskId);
      if (task) {
        setExistingTask(task);
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
      combined.setSeconds(0);
      combined.setMilliseconds(0);
    }
    return combined;
  };

  const handleSave = async () => {
    if (!validateForm() || !user) return;

    const finalReminderTime = combineDateAndTime();
    setSaving(true);

    try {
      if (isEditing) {
        // FIXED: Update task (instant, non-blocking)
        const result = await dispatch(
          updateTask({
            taskId,
            updates: { title, description, reminderTime: finalReminderTime },
          }),
        ).unwrap();

        // FIXED: Cancel old notification first
        if (existingTask?.reminderTime) {
          await NotificationService.cancelTaskReminder(existingTask.id);
        }

        // FIXED: Schedule new notification if reminder is set
        if (finalReminderTime && finalReminderTime > new Date()) {
          const taskWithReminder = {
            id: taskId,
            title,
            description,
            reminderTime: finalReminderTime,
            ...result.updates,
          };
          await NotificationService.scheduleTaskReminder(taskWithReminder);
        }

        // Show success message with sync status
        if (isOnline) {
          Alert.alert('Success', 'Task updated and syncing...');
        } else {
          Alert.alert('Success', 'Task updated. Will sync when online.');
        }
      } else {
        // FIXED: Create task (instant, non-blocking)
        const result = await dispatch(
          createTask({
            userId: user.uid,
            taskData: { title, description, reminderTime: finalReminderTime },
          }),
        ).unwrap();

        // Schedule notification
        if (finalReminderTime && finalReminderTime > new Date()) {
          await NotificationService.scheduleTaskReminder(result);
        }

        // Show success message
        if (isOnline) {
          Alert.alert('Success', 'Task created and syncing...');
        } else {
          Alert.alert('Success', 'Task created. Will sync when online.');
        }
      }
      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving task:', error);
      Alert.alert('Error', error.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setReminderDate(selectedDate);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) setReminderTime(selectedTime);
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

  const clearReminder = async () => {
    if (isEditing && existingTask?.id) {
      await NotificationService.cancelTaskReminder(existingTask.id);
    }
    setReminderDate(undefined);
    setReminderTime(undefined);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">

      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>
              {isEditing ? '✏️ Edit Task' : '✨ Create New Task'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isEditing ? 'Update your task details' : 'Add a new task to your list'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isOnline ? '#10B98120' : '#EF444420' }]}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#EF4444' }]} />
            <Text style={[styles.statusText, { color: isOnline ? '#10B981' : '#EF4444' }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.form}>
        {!isOnline && (
          <View style={[styles.offlineNotice, { backgroundColor: '#F59E0B20', borderColor: '#F59E0B' }]}>
            <Text style={styles.offlineEmoji}>📵</Text>
            <View style={styles.offlineTextContainer}>
              <Text style={[styles.offlineTitle, { color: '#F59E0B' }]}>You're Offline</Text>
              <Text style={[styles.offlineMessage, { color: '#92400E' }]}>
                Your task will be saved locally and synced when you're back online.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Task Title *</Text>
          <Input
            placeholder="Enter task title"
            value={title}
            onChangeText={(text) => { setTitle(text); setTitleError(''); }}
            error={titleError}
            style={styles.input}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
          <Input
            placeholder="Enter task description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textArea]}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.reminderHeader}>
            <Text style={[styles.label, { color: theme.colors.text }]}>🔔 Set Reminder</Text>
            {(reminderDate || reminderTime) && (
              <TouchableOpacity onPress={clearReminder} style={[styles.clearButton, { backgroundColor: `${theme.colors.error}15` }]}>
                <Text style={[styles.clearText, { color: theme.colors.error }]}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.pickerButton, { backgroundColor: theme.colors.surface, borderColor: reminderDate ? theme.colors.primary : theme.colors.border, borderWidth: 2 }]}
            onPress={() => setShowDatePicker(true)}>
            <View style={styles.pickerContent}>
              <Text style={{ fontSize: 24 }}>📅</Text>
              <View style={styles.pickerTextContainer}>
                <Text style={[styles.pickerLabel, { color: theme.colors.textSecondary }]}>Date</Text>
                <Text style={[styles.pickerValue, { color: reminderDate ? theme.colors.text : theme.colors.warning }]}>
                  {formatDate(reminderDate)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pickerButton, { backgroundColor: theme.colors.surface, borderColor: reminderTime ? theme.colors.primary : theme.colors.border, borderWidth: 2 }]}
            onPress={() => setShowTimePicker(true)}>
            <View style={styles.pickerContent}>
              <Text style={{ fontSize: 24 }}>⏰</Text>
              <View style={styles.pickerTextContainer}>
                <Text style={[styles.pickerLabel, { color: theme.colors.textSecondary }]}>Time</Text>
                <Text style={[styles.pickerValue, { color: reminderTime ? theme.colors.text : theme.colors.warning }]}>
                  {formatTime(reminderTime)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {reminderDate && (
            <View style={[styles.previewCard, { backgroundColor: `${theme.colors.success}10`, borderColor: theme.colors.success }]}>
              <Text style={{ fontSize: 20, marginBottom: 4 }}>✅</Text>
              <Text style={[styles.previewText, { color: theme.colors.success }]}>Reminder set for</Text>
              <Text style={[styles.previewValue, { color: theme.colors.text }]}>{formatDate(reminderDate)}</Text>
              {reminderTime && (
                <Text style={[styles.previewValue, { color: theme.colors.text }]}>at {formatTime(reminderTime)}</Text>
              )}
            </View>
          )}
        </View>

        <Button
          title={isEditing ? '💾 Update Task' : '✨ Create Task'}
          onPress={handleSave}
          loading={saving}
          style={styles.saveButton}
        />
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={reminderDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

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
  container: { flex: 1 },
  content: { flexGrow: 1 },
  header: { padding: 24, paddingTop: 32, paddingBottom: 32 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  headerSubtitle: { fontSize: 16, color: '#FFFFFF', opacity: 0.9 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginLeft: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  form: { padding: 20 },
  offlineNotice: { flexDirection: 'row', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  offlineEmoji: { fontSize: 24, marginRight: 12 },
  offlineTextContainer: { flex: 1 },
  offlineTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  offlineMessage: { fontSize: 14, lineHeight: 20 },
  section: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  input: { marginBottom: 0 },
  textArea: { height: 100, textAlignVertical: 'top' },
  reminderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  clearButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  clearText: { fontSize: 14, fontWeight: '600' },
  pickerButton: { borderRadius: 16, padding: 16, marginBottom: 12 },
  pickerContent: { flexDirection: 'row', alignItems: 'center' },
  pickerTextContainer: { marginLeft: 12, flex: 1 },
  pickerLabel: { fontSize: 12, marginBottom: 4 },
  pickerValue: { fontSize: 16, fontWeight: '600' },
  previewCard: { borderRadius: 16, padding: 16, borderWidth: 2, alignItems: 'center', marginTop: 8 },
  previewText: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  previewValue: { fontSize: 16, fontWeight: 'bold' },
  saveButton: { marginTop: 8, height: 56 },
});
