import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {AppDispatch} from '../../store/store';
import {logout} from '../../store/slices/authSlice';
import {DatabaseService} from '../../database';
import {Button} from '../../components';
import {useTheme} from '../../hooks/useTheme';
import {useAuth} from '../../hooks/useAuth';
export const SettingsScreen: React.FC = () => {
  const {theme, themeMode, toggleTheme} = useTheme();
  const {user} = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await dispatch(logout());
        },
      },
    ]);
  };
  const handleClearLocalData = () => {
    Alert.alert(
      'Clear Local Data',
      'This will delete all local tasks. Are you sure?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            DatabaseService.clearAllTasks();
            Alert.alert('Success', 'Local data cleared');
          },
        },
      ],
    );
  };
  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      contentContainerStyle={[styles.content, {padding: theme.spacing.lg}]}>
      <View
        style={[
          styles.section,
          {
            backgroundColor: theme.colors.card,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing.md,
          },
          theme.shadows.sm,
        ]}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              marginBottom: theme.spacing.md,
            },
          ]}>
          Account
        </Text>
        <Text style={{color: theme.colors.textSecondary, marginBottom: 8}}>
          Email: {user?.email}
        </Text>
        <Text style={{color: theme.colors.textSecondary}}>
          User ID: {user?.uid}
        </Text>
      </View>
      <View
        style={[
          styles.section,
          {
            backgroundColor: theme.colors.card,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing.md,
          },
          theme.shadows.sm,
        ]}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              marginBottom: theme.spacing.md,
            },
          ]}>
          Appearance
        </Text>
        <View style={styles.settingRow}>
          <Text style={{color: theme.colors.text}}>Dark Mode</Text>
          <Switch
            value={themeMode === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{
              false: theme.colors.disabled,
              true: theme.colors.primary,
            }}
          />
        </View>
      </View>
      <View
        style={[
          styles.section,
          {
            backgroundColor: theme.colors.card,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing.md,
          },
          theme.shadows.sm,
        ]}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              marginBottom: theme.spacing.md,
            },
          ]}>
          Data
        </Text>
        <Button
          title="Clear Local Data"
          onPress={handleClearLocalData}
          variant="outline"
        />
      </View>
      <Button
        title="Logout"
        onPress={handleLogout}
        variant="secondary"
        style={{marginTop: theme.spacing.lg}}
      />
      <Text
        style={[
          styles.version,
          {
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginTop: theme.spacing.xxl,
          },
        ]}>
        Version 1.0.0
      </Text>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {flex: 1},
  content: {},
  section: {},
  sectionTitle: {},
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  version: {},
});
