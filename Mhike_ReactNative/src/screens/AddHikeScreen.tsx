/**
 * Add/Edit Hike Screen
 */

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useHikes } from '../store/HikeContext';
import { Hike } from '../types';
import { Colors } from '../utils/colors';
import { getCurrentTime, getTodayDate } from '../utils/formatters';
import { validateHike, ValidationError } from '../utils/validation';

type Props = NativeStackScreenProps<RootStackParamList, 'AddHike'>;

export const AddHikeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { addHike, updateHike, getHike } = useHikes();
  const hikeId = (route.params as any)?.hikeId;
  const existingHike = hikeId ? getHike(hikeId) : null;

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(getTodayDate());
  const [time, setTime] = useState(getCurrentTime());
  const [length, setLength] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [parkingAvailable, setParkingAvailable] = useState(true);
  const [privacy, setPrivacy] = useState<'Public' | 'Private'>('Public');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (existingHike) {
      setName(existingHike.name);
      setLocation(existingHike.location);
      setDate(existingHike.date);
      setTime(existingHike.time);
      setLength(existingHike.length.toString());
      setDifficulty(existingHike.difficulty);
      setParkingAvailable(existingHike.parkingAvailable);
      setPrivacy(existingHike.privacy);
      setDescription(existingHike.description || '');
    }
  }, [existingHike]);

  const validateAndSave = async () => {
    const validationErrors = validateHike({
      name,
      location,
      date,
      time,
      length,
      difficulty,
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      if (existingHike) {
        const updatedHike: Hike = {
          ...existingHike,
          name: name.trim(),
          location: location.trim(),
          date,
          time,
          length: parseFloat(length),
          difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
          parkingAvailable,
          privacy,
          description: description.trim() || undefined,
        };
        await updateHike(updatedHike);
        Alert.alert('Success', 'Hike updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await addHike({
          name: name.trim(),
          location: location.trim(),
          date,
          time,
          length: parseFloat(length),
          difficulty: difficulty as 'Easy' | 'Medium' | 'Hard',
          parkingAvailable,
          privacy,
          description: description.trim() || undefined,
        });
        Alert.alert('Success', 'Hike created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save hike');
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (field: string): string | null => {
    const error = errors.find((e) => e.field === field);
    return error ? error.message : null;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.form}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Hike Name *</Text>
          <TextInput
            style={[styles.input, getErrorMessage('name') && styles.inputError]}
            placeholder="Enter hike name"
            value={name}
            onChangeText={setName}
            placeholderTextColor={Colors.textTertiary}
          />
          {getErrorMessage('name') && (
            <Text style={styles.errorMessage}>{getErrorMessage('name')}</Text>
          )}
        </View>

        {/* Location */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={[styles.input, getErrorMessage('location') && styles.inputError]}
            placeholder="Enter location"
            value={location}
            onChangeText={setLocation}
            placeholderTextColor={Colors.textTertiary}
          />
          {getErrorMessage('location') && (
            <Text style={styles.errorMessage}>{getErrorMessage('location')}</Text>
          )}
        </View>

        {/* Date and Time Row */}
        <View style={styles.rowContainer}>
          <View style={[styles.fieldGroup, styles.flex1]}>
            <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
            <TextInput
              style={[styles.input, getErrorMessage('date') && styles.inputError]}
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={setDate}
              placeholderTextColor={Colors.textTertiary}
            />
            {getErrorMessage('date') && (
              <Text style={styles.errorMessage}>{getErrorMessage('date')}</Text>
            )}
          </View>

          <View style={[styles.fieldGroup, styles.flex1]}>
            <Text style={styles.label}>Time (HH:mm) *</Text>
            <TextInput
              style={[styles.input, getErrorMessage('time') && styles.inputError]}
              placeholder="HH:mm"
              value={time}
              onChangeText={setTime}
              placeholderTextColor={Colors.textTertiary}
            />
            {getErrorMessage('time') && (
              <Text style={styles.errorMessage}>{getErrorMessage('time')}</Text>
            )}
          </View>
        </View>

        {/* Length and Difficulty Row */}
        <View style={styles.rowContainer}>
          <View style={[styles.fieldGroup, styles.flex1]}>
            <Text style={styles.label}>Length (km) *</Text>
            <TextInput
              style={[styles.input, getErrorMessage('length') && styles.inputError]}
              placeholder="e.g., 5.5"
              value={length}
              onChangeText={setLength}
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.textTertiary}
            />
            {getErrorMessage('length') && (
              <Text style={styles.errorMessage}>{getErrorMessage('length')}</Text>
            )}
          </View>

          <View style={[styles.fieldGroup, styles.flex1]}>
            <Text style={styles.label}>Difficulty *</Text>
            <View style={styles.pickerRow}>
              {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <TouchableOpacity
                  key={diff}
                  style={[
                    styles.difficultyOption,
                    difficulty === diff && styles.difficultyOptionSelected,
                  ]}
                  onPress={() => setDifficulty(diff)}
                >
                  <Text
                    style={[
                      styles.difficultyOptionText,
                      difficulty === diff && styles.difficultyOptionTextSelected,
                    ]}
                  >
                    {diff}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Parking Available */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Parking Available</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                parkingAvailable && styles.toggleOptionSelected,
              ]}
              onPress={() => setParkingAvailable(true)}
            >
              <Text
                style={[
                  styles.toggleOptionText,
                  parkingAvailable && styles.toggleOptionTextSelected,
                ]}
              >
                ✓ Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                !parkingAvailable && styles.toggleOptionSelected,
              ]}
              onPress={() => setParkingAvailable(false)}
            >
              <Text
                style={[
                  styles.toggleOptionText,
                  !parkingAvailable && styles.toggleOptionTextSelected,
                ]}
              >
                ✗ No
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Privacy</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                privacy === 'Public' && styles.toggleOptionSelected,
              ]}
              onPress={() => setPrivacy('Public')}
            >
              <Text
                style={[
                  styles.toggleOptionText,
                  privacy === 'Public' && styles.toggleOptionTextSelected,
                ]}
              >
                🌍 Public
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                privacy === 'Private' && styles.toggleOptionSelected,
              ]}
              onPress={() => setPrivacy('Private')}
            >
              <Text
                style={[
                  styles.toggleOptionText,
                  privacy === 'Private' && styles.toggleOptionTextSelected,
                ]}
              >
                🔒 Private
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Add optional description..."
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={4}
            placeholderTextColor={Colors.textTertiary}
          />
          <Text style={styles.helperText}>
            {description.length}/2000 characters
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={validateAndSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.surface} />
          ) : (
            <Text style={styles.saveButtonText}>
              {existingHike ? 'Update Hike' : 'Create Hike'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    paddingBottom: 20,
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
    backgroundColor: Colors.surface,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: '#FFEBEE',
  },
  multilineInput: {
    textAlignVertical: 'top',
    height: 100,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  errorMessage: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 6,
  },
  difficultyOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  difficultyOptionSelected: {
    backgroundColor: Colors.primary,
  },
  difficultyOptionText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  difficultyOptionTextSelected: {
    color: Colors.surface,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  toggleOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
    opacity: 0.1,
  },
  toggleOptionText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  toggleOptionTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});
