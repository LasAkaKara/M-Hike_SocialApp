/**
 * Observation List Component
 * Displays observations for a hike in a scrollable list
 */

import React from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Observation } from '../types';
import { Colors, getStatusColor } from '../utils/colors';
import { formatTime } from '../utils/formatters';

interface ObservationListProps {
  observations: Observation[];
  onEdit: (observation: Observation) => void;
  onDelete: (observationId: number) => void;
}

export const ObservationList: React.FC<ObservationListProps> = ({
  observations,
  onEdit,
  onDelete,
}) => {
  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete Observation',
      'Are you sure you want to delete this observation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(id),
        },
      ],
    );
  };

  if (observations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No observations yet</Text>
        <Text style={styles.emptySubText}>Add an observation to get started</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={observations}
      keyExtractor={(item) => item.id.toString()}
      scrollEnabled={false}
      renderItem={({ item }) => (
        <View style={styles.observationCard}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.time}>{formatTime(item.time)}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
            </View>
          </View>

          {item.comments ? (
            <Text style={styles.comments} numberOfLines={3}>
              {item.comments}
            </Text>
          ) : null}

          {item.imageUri ? (
            <>
              {console.log('[ObservationList] Rendering image, URI:', item.imageUri)}
              <Image 
                source={{ uri: item.imageUri.startsWith('file://') ? item.imageUri : `file://${item.imageUri}` }} 
                style={styles.image}
                onLoad={() => console.log('[ObservationList] Image loaded successfully:', item.imageUri)}
                onError={(error) => console.log('[ObservationList] Image load error:', error, 'URI:', item.imageUri)}
              />
            </>
          ) : null}

          {item.confirmations > 0 || item.disputes > 0 ? (
            <View style={styles.statsRow}>
              {item.confirmations > 0 && (
                <Text style={styles.statText}>✓ {item.confirmations} confirmation(s)</Text>
              )}
              {item.disputes > 0 && (
                <Text style={[styles.statText, styles.disputeText]}>
                  ✗ {item.disputes} dispute(s)
                </Text>
              )}
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => onEdit(item)}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={[styles.buttonText, styles.deleteButtonText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  observationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  time: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.surface,
    fontSize: 11,
    fontWeight: '600',
  },
  comments: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#E0E0E0',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  statText: {
    fontSize: 12,
    color: Colors.verified,
    fontWeight: '500',
  },
  disputeText: {
    color: Colors.disputed,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: Colors.primary,
  },
  deleteButton: {
    backgroundColor: Colors.error,
    opacity: 0.1,
  },
  buttonText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: Colors.error,
  },
});
