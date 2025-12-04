import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  SegmentedButtons,
  Slider,
  Dialog,
  Portal,
  ActivityIndicator,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/Navigation';
import { AppDispatch, RootState } from '../store';
import {
  createHike,
  updateHike,
  fetchAllHikes,
} from '../store/slices/hikeSlice';
import { Hike } from '../types';
import { validateHike } from '../utils/validators';
import { getCurrentDate, getCurrentTime, difficultyLevels, privacyOptions } from '../utils/helpers';
import { DatabaseService } from '../database/DatabaseService';

type Props = NativeStackScreenProps<RootStackParamList, 'AddHike'>;

const AddHikeScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.hikes);
  const hikeId = route.params?.hikeId;

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: getCurrentDate(),
    time: getCurrentTime(),
    length: 5,
    difficulty: 'Moderate',
    parkingAvailable: false,
    privacy: 'Private',
    description: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (hikeId) {
      loadHikeData();
    }
  }, [hikeId]);

  const loadHikeData = async () => {
    try {
      const db = DatabaseService.getInstance();
      const hike = await db.getHikeById(hikeId!);
      if (hike) {
        setFormData({
          name: hike.name,
          location: hike.location,
          date: hike.date,
          time: hike.time,
          length: hike.length,
          difficulty: hike.difficulty,
          parkingAvailable: hike.parkingAvailable,
          privacy: hike.privacy,
          description: hike.description || '',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load hike data');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setFormData((prev) => ({ ...prev, date: dateStr }));
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      setFormData((prev) => ({ ...prev, time: `${hours}:${minutes}` }));
    }
  };

  const handleSubmit = () => {
    const validationErrors = validateHike(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }
    setErrors({});
    setShowReviewDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setShowReviewDialog(false);

    try {
      const now = Date.now();
      const hikeData = {
        name: formData.name,
        location: formData.location,
        date: formData.date,
        time: formData.time,
        length: parseFloat(formData.length.toString()),
        difficulty: formData.difficulty,
        parkingAvailable: formData.parkingAvailable,
        privacy: formData.privacy,
        description: formData.description || undefined,
        createdAt: now,
        updatedAt: now,
      };

      if (hikeId) {
        await dispatch(
          updateHike({
            id: hikeId,
            ...hikeData,
            createdAt: 0, // Will be updated in reducer
            updatedAt: now,
          })
        );
      } else {
        await dispatch(createHike(hikeData as any));
      }

      Alert.alert(
        'Success',
        hikeId ? 'Hike updated successfully' : 'Hike created successfully'
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save hike');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TextInput
          label="Hike Name *"
          value={formData.name}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
          style={styles.input}
          placeholder="e.g., Mountain Peak Trail"
          error={!!errors.name}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <TextInput
          label="Location *"
          value={formData.location}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, location: text }))
          }
          style={styles.input}
          placeholder="e.g., Lake District"
          error={!!errors.location}
        />
        {errors.location && (
          <Text style={styles.errorText}>{errors.location}</Text>
        )}

        <Button
          onPress={() => setShowDatePicker(true)}
          mode="outlined"
          style={styles.dateButton}
        >
          📅 Date: {formData.date}
        </Button>
        {showDatePicker && (
          <DateTimePicker
            value={new Date(formData.date)}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <Button
          onPress={() => setShowTimePicker(true)}
          mode="outlined"
          style={styles.dateButton}
        >
          🕐 Time: {formData.time}
        </Button>
        {showTimePicker && (
          <DateTimePicker
            value={
              new Date(`${formData.date}T${formData.time}:00`)
            }
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}

        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>
            Distance: {formData.length.toFixed(1)} km
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0.1}
            maximumValue={100}
            step={0.1}
            value={formData.length}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, length: value }))
            }
          />
        </View>

        <View style={styles.segmentContainer}>
          <Text style={styles.label}>Difficulty Level *</Text>
          <SegmentedButtons
            value={formData.difficulty}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, difficulty: value }))
            }
            buttons={difficultyLevels.map((level) => ({
              value: level,
              label: level,
            }))}
            style={styles.segmentedButtons}
          />
        </View>

        <View style={styles.segmentContainer}>
          <Text style={styles.label}>Privacy</Text>
          <SegmentedButtons
            value={formData.privacy}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, privacy: value }))
            }
            buttons={privacyOptions.map((option) => ({
              value: option,
              label: option,
            }))}
            style={styles.segmentedButtons}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Parking Available</Text>
          <Button
            mode={formData.parkingAvailable ? 'contained' : 'outlined'}
            onPress={() =>
              setFormData((prev) => ({
                ...prev,
                parkingAvailable: !prev.parkingAvailable,
              }))
            }
            style={styles.switchButton}
          >
            {formData.parkingAvailable ? '✓ Yes' : '✗ No'}
          </Button>
        </View>

        <TextInput
          label="Description (Optional)"
          value={formData.description}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, description: text }))
          }
          style={[styles.input, styles.descriptionInput]}
          placeholder="Add notes about this hike..."
          multiline
          numberOfLines={4}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Review & Save'}
        </Button>

        <Portal>
          <Dialog
            visible={showReviewDialog}
            onDismiss={() => setShowReviewDialog(false)}
          >
            <Dialog.Title>Review Hike Details</Dialog.Title>
            <Dialog.Content>
              <View style={styles.reviewContent}>
                <ReviewItem label="Name" value={formData.name} />
                <ReviewItem label="Location" value={formData.location} />
                <ReviewItem label="Date" value={formData.date} />
                <ReviewItem label="Time" value={formData.time} />
                <ReviewItem label="Distance" value={`${formData.length.toFixed(1)} km`} />
                <ReviewItem label="Difficulty" value={formData.difficulty} />
                <ReviewItem label="Parking" value={formData.parkingAvailable ? 'Yes' : 'No'} />
                <ReviewItem label="Privacy" value={formData.privacy} />
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowReviewDialog(false)}>
                Edit
              </Button>
              <Button mode="contained" onPress={handleConfirmSubmit}>
                Confirm
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const ReviewItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View style={styles.reviewItem}>
    <Text style={styles.reviewLabel}>{label}:</Text>
    <Text style={styles.reviewValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    padding: 16,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#FFFBFE',
  },
  errorText: {
    color: '#B3261E',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  dateButton: {
    marginBottom: 16,
  },
  sliderContainer: {
    marginBottom: 16,
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
  segmentContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  switchButton: {
    minWidth: 100,
  },
  descriptionInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 8,
  },
  reviewContent: {
    gap: 12,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  reviewLabel: {
    fontWeight: '500',
    color: '#1C1B1F',
  },
  reviewValue: {
    color: '#666666',
  },
});

export default AddHikeScreen;
