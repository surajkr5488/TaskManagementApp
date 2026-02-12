// src/screens/auth/SignUpScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation.types';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword, validatePasswordMatch } from '../../utils/validators';
import { ERROR_MESSAGES } from '../../utils/constants';
import { Button, Input } from '../../components';


type SignUpScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

interface Props {
  navigation: SignUpScreenNavigationProp;
}

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { signUp, loading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  useEffect(() => {
    if (error) {
      Alert.alert('Sign Up Error', error);
      clearError();
    }
  }, [error]);

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

    if (!validatePasswordMatch(password, confirmPassword)) {
      setConfirmPasswordError(ERROR_MESSAGES.PASSWORDS_DONT_MATCH);
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      await signUp({ email, password, confirmPassword });
    } catch (err) {
      // Error handled by useAuth hook
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={[styles.content, { padding: theme.spacing.lg }]}>
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
            Create Account
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
            Sign up to get started
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

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={confirmPasswordError}
          />

          <Button
            title="Sign Up"
            onPress={handleSignUp}
            loading={loading}
            style={{ marginTop: theme.spacing.lg }}
          />

          <View style={[styles.footer, { marginTop: theme.spacing.xl }]}>
            <Text style={{ color: theme.colors.textSecondary }}>
              Already have an account?{' '}
            </Text>
            <Button
              title="Login"
              onPress={() => navigation.navigate('Login')}
              variant="outline"
              style={{ marginTop: theme.spacing.sm }}
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
