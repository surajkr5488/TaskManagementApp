import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { initializeRealm } from './src/database';
import { NotificationService } from './src/services/notificationService';
import { initializeFirebaseMessaging, setupFCMListeners } from './src/api/firebaseConfig';
import { Loader } from './src/components';
import { RootNavigator } from './src/navigation/RootNavigator';
import { persistor, store } from './src/store/store';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);
const App: React.FC = () => { useEffect(() => { const initializeApp = async () => { try { await initializeRealm(); console.log('Realm initialized'); await NotificationService.initialize(); console.log('Notifications initialized'); const fcmToken = await initializeFirebaseMessaging(); console.log('FCM Token:', fcmToken); const unsubscribe = setupFCMListeners((message) => { console.log('FCM Message received:', message); NotificationService.showNotification(message.notification?.title || 'New Notification', message.notification?.body || '') }); return unsubscribe } catch (error) { console.error('App initialization error:', error) } }; const unsubscribe = initializeApp(); return () => { if (typeof unsubscribe === 'function') { unsubscribe() } } }, []); return (<Provider store={store}><PersistGate loading={<Loader />} persistor={persistor}><StatusBar barStyle="light-content" /><RootNavigator /></PersistGate></Provider>) };
export default App;
