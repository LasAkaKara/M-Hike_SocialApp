/**
 * Hike Detail Screen
 * Shows full hike details and observations
 */

import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ObservationDialog } from '../components/ObservationDialog';
import { ObservationList } from '../components/ObservationList';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useHikes } from '../store/HikeContext';
import { Hike, Observation } from '../types';
import { Colors, getDifficultyColor } from '../utils/colors';
import { formatDate, formatTime } from '../utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'HikeDetail'>;

export const HikeDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { hikeId } = route.params;
  const { getHike, getObservations, addObservation, updateObservation, deleteObservation } =
    useHikes();

  const [hike, setHike] = useState<Hike | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showObservationDialog, setShowObservationDialog] = useState(false);
  const [editingObservation, setEditingObservation] = useState<Observation | undefined>();

  useFocusEffect(
    useCallback(() => {
      const hikeData = getHike(hikeId);
      if (hikeData) {
        setHike(hikeData);
        const obs = getObservations(hikeId);
        setObservations(obs);
      }
      setLoading(false);
    }, [hikeId, getHike, getObservations]),
  );

  const handleAddObservation = () => {
    setEditingObservation(undefined);
    setShowObservationDialog(true);
  };

  const handleEditObservation = (obs: Observation) => {
    setEditingObservation(obs);
    setShowObservationDialog(true);
  };

  const handleConfirmObservation = async (
    obs: Omit<Observation, 'id' | 'createdAt' | 'updatedAt' | 'cloudId' | 'syncStatus'>,
  ) => {
    try {
      console.log('[HikeDetailScreen] handleConfirmObservation called with imageUri:', obs.imageUri);
      if (editingObservation) {
        const updated: Observation = {
          ...editingObservation,
          ...obs,
        };
        await updateObservation(updated);
        Alert.alert('Success', 'Observation updated successfully');
      } else {
        console.log('[HikeDetailScreen] Adding new observation for hikeId:', hikeId);
        await addObservation(hikeId, obs);
        Alert.alert('Success', 'Observation added successfully');
      }
      setShowObservationDialog(false);
      setEditingObservation(undefined);

      // Refresh observations
      const updatedObs = getObservations(hikeId);
      setObservations(updatedObs);
    } catch (error) {
      console.log('[HikeDetailScreen] handleConfirmObservation error:', error);
      Alert.alert('Error', 'Failed to save observation');
    }
  };

  const handleDeleteObservation = async (obsId: number) => {
    try {
      await deleteObservation(obsId, hikeId);
      Alert.alert('Success', 'Observation deleted');
      const updatedObs = getObservations(hikeId);
      setObservations(updatedObs);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete observation');
    }
  };

  if (loading || !hike) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.titleRow}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>{hike.name}</Text>
              <Text style={styles.location}>📍 {hike.location}</Text>
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

          <View style={styles.privacyRow}>
            <Text style={styles.privacyText}>
              {hike.privacy === 'Public' ? '🌍 Public' : '🔒 Private'}
            </Text>
          </View>
        </View>

        {/* Main Details Grid */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailCard}>
              <Text style={styles.detailCardLabel}>Date</Text>
              <Text style={styles.detailCardValue}>{formatDate(hike.date)}</Text>
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.detailCardLabel}>Time</Text>
              <Text style={styles.detailCardValue}>{formatTime(hike.time)}</Text>
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.detailCardLabel}>Distance</Text>
              <Text style={styles.detailCardValue}>{hike.length} km</Text>
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.detailCardLabel}>Parking</Text>
              <Text style={styles.detailCardValue}>
                {hike.parkingAvailable ? '✓ Available' : '✗ None'}
              </Text>
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.detailCardLabel}>Privacy</Text>
              <Text style={styles.detailCardValue}>{hike.privacy}</Text>
            </View>
            <View style={styles.detailCard}>
              <Text style={styles.detailCardLabel}>Observations</Text>
              <Text style={styles.detailCardValue}>{observations.length}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {hike.description ? (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>{hike.description}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.descriptionBox}>
              <Text style={styles.noDescriptionText}>No description provided</Text>
            </View>
          </View>
        )}

        {/* Observations */}
        <View style={styles.observationsSection}>
          <View style={styles.observationHeader}>
            <Text style={styles.sectionTitle}>Observations ({observations.length})</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddObservation}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          <ObservationList
            observations={observations}
            onEdit={handleEditObservation}
            onDelete={handleDeleteObservation}
          />
        </View>
      </ScrollView>

      {/* Edit Button */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editActionButton]}
          onPress={() => navigation.navigate('AddHike', { hikeId: hike.id })}
        >
          <Text style={styles.editActionText}>✏️ Edit Hike</Text>
        </TouchableOpacity>
      </View>

      {/* Observation Dialog */}
      <ObservationDialog
        visible={showObservationDialog}
        observation={editingObservation}
        onConfirm={handleConfirmObservation}
        onCancel={() => {
          setShowObservationDialog(false);
          setEditingObservation(undefined);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 20,
  },
  headerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  location: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  difficultyText: {
    color: Colors.surface,
    fontSize: 13,
    fontWeight: '600',
  },
  privacyRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  privacyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  detailsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  detailCardLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  detailCardValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  descriptionSection: {
    marginBottom: 16,
  },
  descriptionBox: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  noDescriptionText: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  observationsSection: {
    marginBottom: 16,
  },
  observationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  bottomActions: {
    padding: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editActionButton: {
    backgroundColor: Colors.primary,
  },
  editActionText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});
