/**
 * Image handling service
 * Manages image picking, storage, and display
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Observation } from '../types';

const CACHE_DIR = FileSystem.cacheDirectory;
const IMAGE_DIR = CACHE_DIR ? `${CACHE_DIR}mhike_images/` : '';

/**
 * Ensure image directory exists
 */
export const ensureImageDirectoryExists = async (): Promise<void> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(IMAGE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(IMAGE_DIR, { intermediates: true });
    }
  } catch (error) {
    console.error('Failed to create image directory:', error);
  }
};

/**
 * Request camera roll permissions
 */
export const requestImagePickerPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Failed to request image picker permissions:', error);
    return false;
  }
};

/**
 * Request camera permissions
 */
export const requestCameraPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Failed to request camera permissions:', error);
    return false;
  }
};

/**
 * Pick an image from device gallery
 */
export const pickImage = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestImagePickerPermissions();
    if (!hasPermission) {
      console.warn('Camera roll permission denied');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    console.error('Failed to pick image:', error);
    return null;
  }
};

/**
 * Take a photo with device camera
 */
export const takePhoto = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      console.warn('Camera permission denied');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    console.error('Failed to take photo:', error);
    return null;
  }
};

/**
 * Save image from URI to cache directory
 * Returns the local file path
 */
export const saveImageToCache = async (imageUri: string): Promise<string | null> => {
  try {
    await ensureImageDirectoryExists();

    const filename = `observation_${Date.now()}.jpg`;
    const targetPath = `${IMAGE_DIR}${filename}`;

    // Copy image to cache directory
    await FileSystem.copyAsync({
      from: imageUri,
      to: targetPath,
    });

    // Ensure the path is in proper file:// format if needed
    const properUri = targetPath.startsWith('file://') ? targetPath : `file://${targetPath}`;
    console.log('Image saved to:', properUri);
    return properUri;
  } catch (error) {
    console.error('Failed to save image to cache:', error);
    return null;
  }
};

/**
 * Delete image file from cache
 */
export const deleteImageFromCache = async (imageUri: string): Promise<boolean> => {
  try {
    if (!imageUri || !imageUri.startsWith(IMAGE_DIR)) {
      return true; // Not a cached file, consider it deleted
    }

    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(imageUri);
    }

    return true;
  } catch (error) {
    console.error('Failed to delete image:', error);
    return false;
  }
};

/**
 * Check if image file exists
 */
export const imageExists = async (imageUri: string): Promise<boolean> => {
  try {
    if (!imageUri) return false;
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    return fileInfo.exists;
  } catch {
    return false;
  }
};

/**
 * Get image dimensions
 */
export const getImageDimensions = async (
  imageUri: string,
): Promise<{ width: number; height: number } | null> => {
  try {
    if (!imageUri) return null;

    // For local files, we can try to get dimensions
    // For now, return default aspect ratio
    return { width: 1200, height: 900 };
  } catch (error) {
    console.error('Failed to get image dimensions:', error);
    return null;
  }
};

/**
 * Clean up orphaned images (call when observation is deleted)
 */
export const cleanupOrphanedImages = async (observations: Observation[]): Promise<void> => {
  try {
    const files = await FileSystem.readDirectoryAsync(IMAGE_DIR);
    const activeImages = observations
      .map((obs) => obs.imageUri)
      .filter((uri): uri is string => !!uri);

    for (const file of files) {
      const filePath = `${IMAGE_DIR}${file}`;
      if (!activeImages.includes(filePath)) {
        await FileSystem.deleteAsync(filePath, { idempotent: true });
      }
    }
  } catch (error) {
    console.error('Failed to cleanup orphaned images:', error);
  }
};
