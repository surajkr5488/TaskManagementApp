// src/api/authService.ts
import { firebaseAuth } from './firebaseConfig';
import { User } from '@types/auth.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@utils/constants';

export const AuthService = {
  // Sign up with email and password
  signUp: async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await firebaseAuth().createUserWithEmailAndPassword(
        email,
        password,
      );
      const user: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      return user;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  },

  // Login with email and password
  login: async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await firebaseAuth().signInWithEmailAndPassword(
        email,
        password,
      );
      const user: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await firebaseAuth().signOut();
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Failed to logout');
    }
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const user = firebaseAuth().currentUser;
    if (!user) return null;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    };
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return firebaseAuth().currentUser !== null;
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void): (() => void) => {
    return firebaseAuth().onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  },

  // Get stored user data
  getStoredUser: async (): Promise<User | null> => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  },
};
