import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import { Hike } from '../types';
import { formatDate, formatTime } from '../utils/helpers';

interface HikeListItemProps {
  hike: Hike;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const HikeListItem: React.FC<HikeListItemProps> = ({
  hike,
  onPress,
  onEdit,
  onDelete,
}) => {
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
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text variant="headlineSmall" numberOfLines={1}>
              {hike.name}
            </Text>
            <Text variant="bodySmall" style={styles.location}>
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

        <View style={styles.detailsRow}>
          <Text variant="bodySmall">
            🗓️ {formatDate(hike.date)} at {formatTime(hike.time)}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text variant="labelSmall" style={styles.statLabel}>
              Distance
            </Text>
            <Text variant="bodyMedium">{hike.length.toFixed(1)} km</Text>
          </View>
          <View style={styles.stat}>
            <Text variant="labelSmall" style={styles.statLabel}>
              Parking
            </Text>
            <Text variant="bodyMedium">
              {hike.parkingAvailable ? '✓ Yes' : '✗ No'}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text variant="labelSmall" style={styles.statLabel}>
              Privacy
            </Text>
            <Text variant="bodyMedium">{hike.privacy}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <IconButton
            icon="pencil"
            size={18}
            onPress={onEdit}
            style={styles.actionButton}
          />
          <IconButton
            icon="delete"
            size={18}
            iconColor="#F44336"
            onPress={onDelete}
            style={styles.actionButton}
          />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 8,
    backgroundColor: '#FFFBFE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
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
  detailsRow: {
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    marginVertical: 8,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#999999',
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  actionButton: {
    marginRight: 0,
  },
});

export default HikeListItem;
