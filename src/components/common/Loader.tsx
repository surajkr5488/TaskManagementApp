// src/components/common/Loader.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';


interface LoaderProps {
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'large', fullScreen = true }) => {
  const { theme } = useTheme();

  if (fullScreen) {
    return (
      <View
        style={[
          styles.fullScreen,
          { backgroundColor: theme.colors.background },
        ]}>
        <ActivityIndicator size={size} color={theme.colors.primary} />
      </View>
    );
  }

  return <ActivityIndicator size={size} color={theme.colors.primary} />;
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
