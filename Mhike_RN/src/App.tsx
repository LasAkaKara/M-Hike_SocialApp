import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import { theme } from './theme/theme';
import Navigation from './navigation/Navigation';
import { DatabaseService } from './database/DatabaseService';
import { fetchAllHikes } from './store/slices/hikeSlice';
import { AppDispatch } from './store';

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        const db = DatabaseService.getInstance();
        await db.initialize();

        // Load all hikes
        dispatch(fetchAllHikes());
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    initializeApp();
  }, [dispatch]);

  return <Navigation />;
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PaperProvider theme={theme}>
          <AppContent />
        </PaperProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
