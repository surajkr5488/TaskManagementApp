
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {AuthStackParamList} from '../../types/navigation.types';
import {useTheme} from '../../hooks/useTheme';
import {useAuth} from '../../hooks/useAuth';
import {validateEmail, validatePassword} from '../../utils/validators';
import {ERROR_MESSAGES} from '../../utils/constants';
import {Button, Input} from '../../components';
import {SyncService} from '../../services/syncService';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<Props> = ({navigation}) => {
  const {theme} = useTheme();
  const {login, loading, error, clearError, user} = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (error) {
      Alert.alert('Login Error', error);
      clearError();
    }
  }, [error]);
  useEffect(() => {
    if (user?.uid) {
      console.log('✅ Starting Sync Services');

      SyncService.startAutoSync(user.uid);
      SyncService.setupNetworkListener(user.uid);
    }

    return () => {
      SyncService.stopAutoSync();
    };
  }, [user]);

  const validateForm = (): boolean => {
    let isValid = true;

    if (!validateEmail(email)) {
      setEmailError(ERROR_MESSAGES.INVALID_EMAIL);
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!validatePassword(password)) {
      setPasswordError(ERROR_MESSAGES.INVALID_PASSWORD);
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login({email, password});
    } catch (err) {

    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={[styles.content, {padding: theme.spacing.lg}]}>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.xxxl,
                fontWeight: theme.typography.fontWeight.bold,
                marginBottom: theme.spacing.lg,
              },
            ]}>
            Welcome Back
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.md,
                marginBottom: theme.spacing.xxl,
              },
            ]}>
            Sign in to continue
          </Text>

          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={passwordError}
          />

          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={{marginTop: theme.spacing.lg}}
          />

          <View style={[styles.footer, {marginTop: theme.spacing.xl}]}>
            <Text style={{color: theme.colors.textSecondary}}>
              Don't have an account?{' '}
            </Text>
            <Button
              title="Sign Up"
              onPress={() => navigation.navigate('SignUp')}
              variant="outline"
              style={{marginTop: theme.spacing.sm}}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
});

