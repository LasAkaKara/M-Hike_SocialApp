/**
 * Search Filter Dialog Component
 * Modal for multi-criteria search
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SearchFilters } from '../types';
import { Colors } from '../utils/colors';

interface SearchFilterDialogProps {
  visible: boolean;
  onApply: (filters: SearchFilters) => void;
  onCancel: () => void;
}

export const SearchFilterDialog: React.FC<SearchFilterDialogProps> = ({
  visible,
  onApply,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [minLength, setMinLength] = useState('');
  const [date, setDate] = useState('');

  const handleApply = () => {
    const filters: SearchFilters = {};

    if (name.trim()) filters.name = name.trim();
    if (location.trim()) filters.location = location.trim();
    if (minLength.trim()) {
      const length = parseFloat(minLength);
      if (!isNaN(length) && length > 0) {
        filters.minLength = length;
      }
    }
    if (date.trim()) filters.date = date.trim();

    onApply(filters);
  };

  const handleReset = () => {
    setName('');
    setLocation('');
    setMinLength('');
    setDate('');
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Search & Filter Hikes</Text>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Name Filter */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Hike Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Search by name..."
                value={name}
                onChangeText={setName}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            {/* Location Filter */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Search by location..."
                value={location}
                onChangeText={setLocation}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            {/* Minimum Length Filter */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Minimum Length (km)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter minimum distance..."
                value={minLength}
                onChangeText={setMinLength}
                keyboardType="decimal-pad"
                placeholderTextColor={Colors.textTertiary}
              />
              <Text style={styles.helperText}>
                Only show hikes with at least this distance
              </Text>
            </View>

            {/* Date Filter */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2025-12-04"
                value={date}
                onChangeText={setDate}
                placeholderTextColor={Colors.textTertiary}
              />
              <Text style={styles.helperText}>
                Leave blank to show all dates
              </Text>
            </View>

            <Text style={styles.infoText}>
              ℹ️ All filters are optional and can be combined
            </Text>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.applyButton]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
  form: {
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.textTertiary,
  },
  resetButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.textTertiary,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: Colors.primary,
  },
  applyButtonText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});
