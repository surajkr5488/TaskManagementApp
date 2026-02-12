import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

export const firebaseAuth = auth;
export const firebaseFirestore = firestore;
export const firebaseMessaging = messaging;

export const COLLECTIONS = {
  USERS: 'users',
  TASKS: 'tasks',
} as const;

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

export const setupFCMListeners = (
  onMessage: (message: any) => void,
): (() => void) => {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('FCM Message:', remoteMessage);
    onMessage(remoteMessage);
  });

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background Message:', remoteMessage);
  });

  return unsubscribe;
};