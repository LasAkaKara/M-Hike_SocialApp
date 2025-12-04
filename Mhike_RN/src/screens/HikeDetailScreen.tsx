import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  Alert,
  ListRenderItem,
  ActivityIndicator as RNActivityIndicator,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  IconButton,
  ActivityIndicator,
  FAB,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/Navigation';
import { AppDispatch, RootState } from '../store';
import {
  setSelectedHike,
  deleteHike,
} from '../store/slices/hikeSlice';
import {
  fetchObservationsByHikeId,
  deleteObservation,
} from '../store/slices/observationSlice';
import { Hike, Observation } from '../types';
import { DatabaseService } from '../database/DatabaseService';
import { formatDate, formatTime } from '../utils/helpers';

type Props = NativeStackScreenProps<RootStackParamList, 'HikeDetail'>;

const HikeDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { hikeId } = route.params;
  const [hike, setHike] = useState<Hike | null>(null);
  const [loading, setLoading] = useState(true);
  const { observations } = useSelector(
    (state: RootState) => state.observations
  );

  useEffect(() => {
    loadHikeData();
  }, [hikeId]);

  const loadHikeData = async () => {
    try {
      setLoading(true);
      const db = DatabaseService.getInstance();
      const hikeData = await db.getHikeById(hikeId);
      setHike(hikeData);
      dispatch(fetchObservationsByHikeId(hikeId));
    } catch (error) {
      Alert.alert('Error', 'Failed to load hike details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHike = () => {
    Alert.alert(
      'Delete Hike',
      'Are you sure you want to delete this hike and all its observations?',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              dispatch(deleteHike(hikeId));
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete hike');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleDeleteObservation = (obsId: number) => {
    Alert.alert(
      'Delete Observation',
      'Are you sure you want to delete this observation?',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              dispatch(deleteObservation(obsId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete observation');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderObservation: ListRenderItem<Observation> = ({ item }) => (
    <Card style={styles.observationCard}>
      <Card.Content>
        <View style={styles.obsHeader}>
          <View style={styles.obsTitleSection}>
            <Text variant="titleMedium">{item.title}</Text>
            <Text variant="labelSmall" style={styles.obsTime}>
              {item.time}
            </Text>
          </View>
          <IconButton
            icon="delete"
            size={18}
            iconColor="#F44336"
            onPress={() => handleDeleteObservation(item.id)}
          />
        </View>
        {item.comments && (
          <Text variant="bodySmall" style={styles.obsComments}>
            {item.comments}
          </Text>
        )}
        {item.imageUri && (
          <Text variant="labelSmall" style={styles.obsImage}>
            📷 Image attached
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  if (loading || !hike) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return '#4CAF50';
      case 'moderate':
        return '#FF9800';
      case 'hard':
        return '#F44336';
      default:
        return '#999999';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.titleRow}>
              <View style={styles.titleSection}>
                <Text variant="headlineMedium">{hike.name}</Text>
                <Text variant="bodyMedium" style={styles.location}>
                  📍 {hike.location}
                </Text>
              </View>
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(hike.difficulty) },
                ]}
              >
                <Text style={styles.difficultyText}>{hike.difficulty}</Text>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <DetailItem label="Date" value={formatDate(hike.date)} />
              <DetailItem label="Time" value={formatTime(hike.time)} />
              <DetailItem label="Distance" value={`${hike.length.toFixed(1)} km`} />
              <DetailItem label="Parking" value={hike.parkingAvailable ? '✓ Available' : '✗ Not Available'} />
              <DetailItem label="Privacy" value={hike.privacy} />
            </View>

            {hike.description && (
              <View style={styles.descriptionContainer}>
                <Text variant="labelSmall" style={styles.descriptionLabel}>
                  Description
                </Text>
                <Text variant="bodySmall">{hike.description}</Text>
              </View>
            )}

            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={() =>
                  navigation.navigate('AddHike', { hikeId: hike.id })
                }
              >
                Edit
              </Button>
              <Button
                mode="outlined"
                buttonColor="#F44336"
                textColor="#F44336"
                onPress={handleDeleteHike}
              >
                Delete
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Text variant="headlineSmall" style={styles.observationsTitle}>
          Observations ({observations.length})
        </Text>

        {observations.length === 0 ? (
          <View style={styles.emptyObservations}>
            <Text variant="bodySmall">No observations yet</Text>
          </View>
        ) : (
          <FlatList
            data={observations}
            renderItem={renderObservation}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            style={styles.observationsList}
          />
        )}
      </ScrollView>

      <FAB
        icon="plus"
        onPress={() => {
          // Navigate to add observation - will be created next
          Alert.alert('Info', 'Add observation feature coming soon');
        }}
        style={styles.fab}
        color="#FFFFFF"
      />
    </View>
  );
};

const DetailItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View style={styles.detailItem}>
    <Text variant="labelSmall" style={styles.detailLabel}>
      {label}
    </Text>
    <Text variant="bodyMedium">{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    marginBottom: 16,
    backgroundColor: '#FFFBFE',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
    marginRight: 8,
  },
  location: {
    color: '#666666',
    marginTop: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
    paddingVertical: 12,
  },
  detailItem: {
    width: '50%',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  detailLabel: {
    color: '#999999',
    marginBottom: 4,
  },
  descriptionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  descriptionLabel: {
    color: '#999999',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  observationsTitle: {
    marginBottom: 12,
    marginTop: 16,
  },
  observationsList: {
    marginBottom: 16,
  },
  observationCard: {
    marginBottom: 8,
    backgroundColor: '#FFFBFE',
  },
  obsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  obsTitleSection: {
    flex: 1,
  },
  obsTime: {
    color: '#999999',
    marginTop: 4,
  },
  obsComments: {
    marginVertical: 8,
    color: '#666666',
  },
  obsImage: {
    color: '#2E7D32',
    marginTop: 8,
  },
  emptyObservations: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2E7D32',
  },
});

export default HikeDetailScreen;
