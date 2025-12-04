import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, Dialog, Portal, Card } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { DatabaseService } from '../database/DatabaseService';
import { fetchAllHikes } from '../store/slices/hikeSlice';

const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);

  const handleResetDatabase = () => {
    setShowConfirmDialog(true);
  };

  const confirmReset = async () => {
    setShowConfirmDialog(false);
    try {
      const db = DatabaseService.getInstance();
      await db.deleteAllData();
      dispatch(fetchAllHikes());
      Alert.alert('Success', 'All hikes and observations have been deleted');
    } catch (error) {
      Alert.alert('Error', 'Failed to reset database');
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            App Settings
          </Text>
          <Text variant="bodySmall" style={styles.description}>
            Manage your M-Hike application settings
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Database Management
          </Text>
          <Text variant="bodySmall" style={styles.warning}>
            ⚠️ This will permanently delete all your hikes and observations
          </Text>
          <Button
            mode="contained"
            buttonColor="#F44336"
            onPress={handleResetDatabase}
            style={styles.dangerButton}
          >
            Reset All Data
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            About
          </Text>
          <InfoItem label="App Name" value="M-Hike" />
          <InfoItem label="Version" value="1.0.0" />
          <InfoItem label="Platform" value="React Native" />
        </Card.Content>
      </Card>

      <Portal>
        <Dialog
          visible={showConfirmDialog}
          onDismiss={() => setShowConfirmDialog(false)}
        >
          <Dialog.Title>Reset All Data</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to delete all hikes and observations? This
              action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button
              mode="contained"
              buttonColor="#F44336"
              onPress={confirmReset}
            >
              Delete All
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View style={styles.infoItem}>
    <Text variant="labelSmall" style={styles.infoLabel}>
      {label}:
    </Text>
    <Text variant="bodySmall">{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFBFE',
  },
  title: {
    marginBottom: 8,
  },
  description: {
    color: '#666666',
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  warning: {
    color: '#F57C00',
    marginBottom: 12,
    fontWeight: '500',
  },
  dangerButton: {
    marginTop: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  infoLabel: {
    color: '#999999',
  },
});

export default SettingsScreen;
