import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

// Firebase services
export const firebaseAuth = auth;
export const firebaseFirestore = firestore;
export const firebaseMessaging = messaging;

// Collections
export const COLLECTIONS = {
  USERS: 'users',
  TASKS: 'tasks',
} as const;

// Initialize Firebase Cloud Messaging
export const initializeFirebaseMessaging = async (): Promise<string | null> => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const fcmToken = await messaging().getToken();
      console.log('FCM Token:', fcmToken);
      return fcmToken;
    }
    return null;
  } catch (error) {
    console.error('Error initializing FCM:', error);
    return null;
  }
};

// Listen to FCM messages - FIXED VERSION
export const setupFCMListeners = (
  onMessage: (message: any) => void,
): (() => void) => {
  // Foreground message handler
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('FCM Foreground Message:', remoteMessage);
    onMessage(remoteMessage);
  });

  // Background message handler
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('FCM Background Message:', remoteMessage);
    onMessage(remoteMessage);
  });

  return unsubscribe;
};
