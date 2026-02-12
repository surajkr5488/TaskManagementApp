import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '@store/store';
import {setUser} from '@store/slices/authSlice';
import {AuthStack} from './AuthStack';
import {AppStack} from './AppStack';
import {Loader} from '@components/common/Loader';
import {AuthService} from '@api/authService';
import {useTheme} from '@hooks/useTheme';
import {SyncService} from '@services/syncService';
const Stack = createNativeStackNavigator();
export const RootNavigator: React.FC = () => {
  const {theme} = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const {isAuthenticated, user} = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const checkAuth = async () => {
      const unsubscribe = AuthService.onAuthStateChanged(firebaseUser => {
        dispatch(setUser(firebaseUser));
        setIsLoading(false);
        if (firebaseUser) {
          SyncService.startAutoSync(firebaseUser.uid);
          SyncService.setupNetworkListener(firebaseUser.uid);
        } else {
          SyncService.stopAutoSync();
        }
      });
      return unsubscribe;
    };
    const unsubscribe = checkAuth();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [dispatch]);
  if (isLoading) {
    return <Loader />;
  }
  return (
    <NavigationContainer
      theme={{
        dark: theme.colors.background === '#000000',
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.notification,
        },
      }}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isAuthenticated ? (
          <Stack.Screen name="App" component={AppStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
