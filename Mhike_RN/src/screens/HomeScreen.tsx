import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  ListRenderItem,
} from 'react-native';
import { FAB, Searchbar, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/Navigation';
import { AppDispatch, RootState } from '../store';
import {
  deleteHike,
  fetchAllHikes,
  searchHikesByName,
  clearFilters,
} from '../store/slices/hikeSlice';
import { Hike } from '../types';
import HikeListItem from '../components/HikeListItem';
import SearchFilterModal from '../components/SearchFilterModal';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { filteredHikes, loading } = useSelector(
    (state: RootState) => state.hikes
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      dispatch(clearFilters());
    } else {
      dispatch(searchHikesByName(query));
    }
  };

  const handleDeleteHike = (hikeId: number) => {
    Alert.alert(
      'Delete Hike',
      'Are you sure you want to delete this hike?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              dispatch(deleteHike(hikeId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete hike');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleAddHike = () => {
    navigation.navigate('AddHike');
  };

  const handleSelectHike = (hike: Hike) => {
    navigation.navigate('HikeDetail', { hikeId: hike.id });
  };

  const renderHike: ListRenderItem<Hike> = ({ item }) => (
    <HikeListItem
      hike={item}
      onPress={() => handleSelectHike(item)}
      onDelete={() => handleDeleteHike(item.id)}
      onEdit={() => navigation.navigate('AddHike', { hikeId: item.id })}
    />
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search hikes..."
        onChangeText={handleSearchChange}
        value={searchQuery}
        style={styles.searchBar}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator animating={true} size="large" color="#2E7D32" />
        </View>
      ) : filteredHikes.length === 0 ? (
        <View style={styles.centerContainer}>
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIcon}>
              <View style={styles.emptyStateText}>No hikes yet</View>
            </View>
            <View style={styles.emptyStateText}>
              Start tracking your hikes by tapping the + button
            </View>
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredHikes}
          renderItem={renderHike}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}

      <FAB
        icon="plus"
        onPress={handleAddHike}
        style={styles.fab}
        color="#FFFFFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  searchBar: {
    margin: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyStateContainer: {
    alignItems: 'center',
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2E7D32',
  },
});

export default HomeScreen;
