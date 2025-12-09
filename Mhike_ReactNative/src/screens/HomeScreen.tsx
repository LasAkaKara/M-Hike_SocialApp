/**
 * Home Screen - List all hikes
 */

import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SearchFilterDialog } from '../components/SearchFilterDialog';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useHikes } from '../store/HikeContext';
import { Hike } from '../types';
import { Colors, getDifficultyColor } from '../utils/colors';
import { formatDate, formatTime } from '../utils/formatters';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { hikes, loading, deleteHike, searchHikes } = useHikes();
  const [filteredHikes, setFilteredHikes] = useState<Hike[]>([]);
  const [showSearchDialog, setShowSearchDialog] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setFilteredHikes(hikes);
    }, [hikes]),
  );

  const handleSearchFilter = async (filters: any) => {
    try {
      const results = await searchHikes(filters);
      setFilteredHikes(results);
      setShowSearchDialog(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to search hikes');
    }
  };

  const handleClearFilters = () => {
    setFilteredHikes(hikes);
  };

  const handleDeleteHike = (hikeId: number) => {
    Alert.alert('Delete Hike', 'Are you sure you want to delete this hike?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteHike(hikeId);
            Alert.alert('Success', 'Hike deleted successfully');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete hike');
          }
        },
      },
    ]);
  };

  const renderHikeItem = ({ item }: { item: Hike }) => (
    <TouchableOpacity
      style={styles.hikeCard}
      onPress={() => navigation.navigate('HikeDetail', { hikeId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleSection}>
          <Text style={styles.hikeName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            📍 {item.location}
          </Text>
        </View>
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(item.difficulty) },
          ]}
        >
          <Text style={styles.difficultyText}>{item.difficulty}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Time</Text>
          <Text style={styles.detailValue}>{formatTime(item.time)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Distance</Text>
          <Text style={styles.detailValue}>{item.length} km</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Parking</Text>
          <Text style={styles.detailValue}>
            {item.parkingAvailable ? '✓ Available' : '✗ None'}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteActionButton]}
          onPress={() => handleDeleteHike(item.id)}
        >
          <Text style={styles.deleteActionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setShowSearchDialog(true)}
        >
          <Text style={styles.searchButtonText}>🔍 Search & Filter</Text>
        </TouchableOpacity>
        {filteredHikes.length < hikes.length && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {filteredHikes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hikes yet</Text>
          <Text style={styles.emptySubText}>
            {hikes.length === 0
              ? 'Create a hike to get started'
              : 'No hikes match your filters'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredHikes}
          renderItem={renderHikeItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddHike')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <SearchFilterDialog
        visible={showSearchDialog}
        onApply={handleSearchFilter}
        onCancel={() => setShowSearchDialog(false)}
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
  searchBar: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  clearButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 12,
  },
  hikeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  hikeName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  difficultyText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailItem: {
    width: '50%',
    marginBottom: 8,
    paddingRight: 8,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteActionButton: {
    backgroundColor: Colors.error,
    opacity: 0.15,
  },
  deleteActionText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabText: {
    fontSize: 32,
    color: Colors.surface,
    fontWeight: '300',
  },
});
