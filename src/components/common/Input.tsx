
import React, {useState} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import {useTheme} from '../../hooks/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  secureTextEntry,
  style,
  ...rest
}) => {
  const {theme} = useTheme();
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.sm,
              marginBottom: theme.spacing.xs,
            },
          ]}>
          {label}
        </Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: error ? theme.colors.error : theme.colors.border,
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.md,
              padding: theme.spacing.md,
              borderRadius: theme.borderRadius.md,
            },
            style,
          ]}
          placeholderTextColor={theme.colors.placeholder}
          secureTextEntry={isSecure}
          {...rest}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={[
              styles.eyeIcon,
              {right: theme.spacing.md, top: theme.spacing.md},
            ]}
            onPress={toggleSecureEntry}>
            <Text style={{color: theme.colors.textSecondary}}>
              {isSecure ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text
          style={[
            styles.error,
            {
              color: theme.colors.error,
              fontSize: theme.typography.fontSize.sm,
              marginTop: theme.spacing.xs,
            },
          ]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '500',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    minHeight: 48,
  },
  eyeIcon: {
    position: 'absolute',
  },
  error: {
    fontWeight: '400',
  },
});

