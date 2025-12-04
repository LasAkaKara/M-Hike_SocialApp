import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Button, TextInput, Text } from 'react-native-paper';
import { Slider } from 'react-native-paper';
import { SearchFilters } from '../types';

interface SearchFilterModalProps {
  visible: boolean;
  onDismiss: () => void;
  onApply: (filters: SearchFilters) => void;
}

const SearchFilterModal: React.FC<SearchFilterModalProps> = ({
  visible,
  onDismiss,
  onApply,
}) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [minLength, setMinLength] = useState(0);

  const handleApply = () => {
    const appliedFilters: SearchFilters = {};

    if (filters.name && filters.name.trim()) {
      appliedFilters.name = filters.name;
    }
    if (filters.location && filters.location.trim()) {
      appliedFilters.location = filters.location;
    }
    if (minLength > 0) {
      appliedFilters.minLength = minLength;
    }

    onApply(appliedFilters);
    onDismiss();
  };

  const handleReset = () => {
    setFilters({});
    setMinLength(0);
  };

  return (
    <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
      <View style={styles.header}>
        <Text variant="headlineSmall">Advanced Search</Text>
      </View>

      <View style={styles.content}>
        <TextInput
          label="Hike Name"
          value={filters.name || ''}
          onChangeText={(text) => setFilters((prev) => ({ ...prev, name: text }))}
          placeholder="Search by name..."
          style={styles.input}
        />

        <TextInput
          label="Location"
          value={filters.location || ''}
          onChangeText={(text) =>
            setFilters((prev) => ({ ...prev, location: text }))
          }
          placeholder="Search by location..."
          style={styles.input}
        />

        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Minimum Distance: {minLength.toFixed(1)} km</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={minLength}
            onValueChange={setMinLength}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <Button onPress={handleReset}>Reset</Button>
        <Button mode="contained" onPress={handleApply}>
          Apply Filters
        </Button>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#FFFBFE',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  header: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 12,
  },
  content: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#F7F2FA',
  },
  sliderContainer: {
    marginBottom: 8,
  },
  sliderLabel: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
});

export default SearchFilterModal;
