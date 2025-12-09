/**
 * Observation Dialog Component
 * Modal for adding/editing observations
 */

import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { deleteImageFromCache, pickImage, saveImageToCache, takePhoto } from '../services/imageService';
import { Observation } from '../types';
import { Colors } from '../utils/colors';
import { getCurrentTime } from '../utils/formatters';
import { validateObservation } from '../utils/validation';

interface ObservationDialogProps {
  visible: boolean;
  observation?: Observation;
  onConfirm: (observation: Omit<Observation, 'id' | 'createdAt' | 'updatedAt' | 'cloudId' | 'syncStatus'>) => void;
  onCancel: () => void;
}

export const ObservationDialog: React.FC<ObservationDialogProps> = ({
  visible,
  observation,
  onConfirm,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState(getCurrentTime());
  const [comments, setComments] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedImageForPreview, setSelectedImageForPreview] = useState<string | null>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (observation) {
      setTitle(observation.title);
      setTime(observation.time);
      setComments(observation.comments || '');
      setImageUri(observation.imageUri);
    } else {
      setTitle('');
      setTime(getCurrentTime());
      setComments('');
      setImageUri(null);
    }
    setErrors([]);
    setShowImageOptions(false);
  }, [visible, observation]);

  const handlePickImage = async () => {
    const pickedUri = await pickImage();
    console.log('[ObservationDialog] Picked image URI:', pickedUri);
    if (pickedUri) {
      // Automatically save the image to cache
      const savedPath = await saveImageToCache(pickedUri);
      console.log('[ObservationDialog] Auto-saved image, path:', savedPath);
      if (savedPath) {
        if (observation?.imageUri) {
          await deleteImageFromCache(observation.imageUri);
        }
        setImageUri(savedPath);
        setSelectedImageForPreview(null);
      } else {
        console.log('[ObservationDialog] Failed to auto-save image');
        setSelectedImageForPreview(pickedUri); // Show for manual save
      }
      setShowImageOptions(false);
    }
  };

  const handleTakePhoto = async () => {
    const photoUri = await takePhoto();
    console.log('[ObservationDialog] Took photo URI:', photoUri);
    if (photoUri) {
      // Automatically save the photo to cache
      const savedPath = await saveImageToCache(photoUri);
      console.log('[ObservationDialog] Auto-saved photo, path:', savedPath);
      if (savedPath) {
        if (observation?.imageUri) {
          await deleteImageFromCache(observation.imageUri);
        }
        setImageUri(savedPath);
        setSelectedImageForPreview(null);
      } else {
        console.log('[ObservationDialog] Failed to auto-save photo');
        setSelectedImageForPreview(photoUri); // Show for manual save
      }
      setShowImageOptions(false);
    }
  };

  const handleSaveImage = async () => {
    console.log('[ObservationDialog] handleSaveImage - selectedImageForPreview:', selectedImageForPreview);
    if (selectedImageForPreview) {
      const savedPath = await saveImageToCache(selectedImageForPreview);
      console.log('[ObservationDialog] Image saved, path:', savedPath);
      if (savedPath) {
        // Delete old image if updating
        if (observation?.imageUri) {
          await deleteImageFromCache(observation.imageUri);
        }
        setImageUri(savedPath);
        setSelectedImageForPreview(null);
      } else {
        console.log('[ObservationDialog] Failed to save image');
        Alert.alert('Error', 'Failed to save image');
      }
    }
  };

  const handleClearImage = async () => {
    if (imageUri && observation) {
      await deleteImageFromCache(imageUri);
    }
    setImageUri(null);
    setSelectedImageForPreview(null);
  };

  const handleConfirm = () => {
    console.log('[ObservationDialog] handleConfirm - imageUri:', imageUri);
    const validationErrors = validateObservation({ title, time, comments });
    if (validationErrors.length > 0) {
      setErrors(validationErrors.map((e) => e.message));
      return;
    }

    console.log('[ObservationDialog] Confirming observation with imageUri:', imageUri);
    onConfirm({
      hikeId: observation?.hikeId || 0,
      title: title.trim(),
      time,
      comments: comments.trim() || undefined,
      imageUri,
      cloudImageUrl: observation?.cloudImageUrl || null,
      latitude: observation?.latitude,
      longitude: observation?.longitude,
      status: observation?.status || 'Open',
      confirmations: observation?.confirmations || 0,
      disputes: observation?.disputes || 0,
    });

    setTitle('');
    setTime(getCurrentTime());
    setComments('');
    setImageUri(null);
    setSelectedImageForPreview(null);
    setErrors([]);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {observation ? 'Edit Observation' : 'Add Observation'}
            </Text>
            <TouchableOpacity onPress={onCancel}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Observation title"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            {/* Time */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:mm"
                value={time}
                onChangeText={setTime}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            {/* Comments */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Comments</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Add comments (optional)"
                value={comments}
                onChangeText={setComments}
                multiline={true}
                numberOfLines={4}
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            {/* Image Selection */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Image</Text>

              {selectedImageForPreview && (
                <View style={styles.previewContainer}>
                  <Image
                    source={{ uri: selectedImageForPreview }}
                    style={styles.previewImage}
                  />
                  <View style={styles.previewButtonRow}>
                    <TouchableOpacity
                      style={[styles.smallButton, styles.saveButton]}
                      onPress={handleSaveImage}
                    >
                      <Text style={styles.smallButtonText}>Save Image</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.smallButton, styles.cancelButton]}
                      onPress={() => setSelectedImageForPreview(null)}
                    >
                      <Text style={styles.smallButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {imageUri && !selectedImageForPreview && (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: imageUri }} style={styles.image} />
                  <TouchableOpacity
                    style={[styles.smallButton, styles.deleteButton]}
                    onPress={handleClearImage}
                  >
                    <Text style={styles.smallButtonText}>Clear Image</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!imageUri && !selectedImageForPreview && (
                <TouchableOpacity
                  style={styles.imageSelectButton}
                  onPress={() => setShowImageOptions(!showImageOptions)}
                >
                  <Text style={styles.imageSelectButtonText}>📷 Select Image</Text>
                </TouchableOpacity>
              )}

              {showImageOptions && !selectedImageForPreview && (
                <View style={styles.imageOptionsContainer}>
                  <TouchableOpacity style={styles.imageOption} onPress={handlePickImage}>
                    <Text style={styles.imageOptionText}>📁 Pick from Gallery</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.imageOption} onPress={handleTakePhoto}>
                    <Text style={styles.imageOptionText}>📸 Take Photo</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Errors */}
            {errors.length > 0 && (
              <View style={styles.errorContainer}>
                {errors.map((error, index) => (
                  <Text key={index} style={styles.errorText}>
                    • {error}
                  </Text>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelActionButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>
                {observation ? 'Update' : 'Add'} Observation
              </Text>
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
    maxHeight: '90%',
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
    marginBottom: 12,
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
  multilineInput: {
    textAlignVertical: 'top',
    height: 100,
  },
  imageSelectButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  imageSelectButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  imageOptionsContainer: {
    marginTop: 8,
    gap: 8,
  },
  imageOption: {
    backgroundColor: Colors.background,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  imageOptionText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  previewContainer: {
    marginTop: 8,
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#E0E0E0',
  },
  imageContainer: {
    marginTop: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#E0E0E0',
  },
  previewButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: Colors.error,
    opacity: 0.2,
  },
  deleteButton: {
    backgroundColor: Colors.error,
    opacity: 0.2,
  },
  smallButtonText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
    padding: 12,
    borderRadius: 6,
    marginVertical: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    marginBottom: 4,
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
  cancelActionButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.textTertiary,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});
