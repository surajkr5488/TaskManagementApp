import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { DatabaseService } from './database';
import { NotificationService } from './services/notificationService';
import { SyncService } from './services/syncService';
import { RootNavigator } from './navigation/RootNavigator';

function App(): React.JSX.Element {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        await DatabaseService.initialize();
        console.log('✅ Database initialized');

        // Initialize notifications
        await NotificationService.initialize();
        console.log('✅ Notifications initialized');

        // Initialize sync service
        SyncService.initialize();
        console.log('✅ Sync service initialized');
      } catch (error) {
        console.error('❌ App initialization error:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}

export default App;
