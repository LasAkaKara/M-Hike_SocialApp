/**
 * Color constants for M-Hike application
 * Material Design 3 compliant
 */

export const Colors = {
  // Primary colors
  primary: '#2E7D32', // Green
  primaryLight: '#81C784',
  primaryDark: '#1B5E20',

  // Secondary colors
  secondary: '#8D6E63', // Brown
  secondaryLight: '#D7CCC8',
  secondaryDark: '#4E342E',

  // Tertiary colors
  tertiary: '#FF6F00', // Orange
  tertiaryLight: '#FFB74D',
  tertiaryDark: '#E65100',

  // Status colors
  open: '#1976D2', // Blue
  verified: '#388E3C', // Green
  disputed: '#D32F2F', // Red

  // Difficulty colors
  difficultyEasy: '#2E7D32', // Green
  difficultyMedium: '#FF6F00', // Orange
  difficultyHard: '#C62828', // Red

  // Neutral colors
  text: '#424242', // Dark gray
  textSecondary: '#616161', // Medium gray
  textTertiary: '#9E9E9E', // Light gray
  background: '#FAFAFA', // Very light gray
  surface: '#FFFFFF', // White
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#F57C00',
  info: '#1976D2',

  // Transparent
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return Colors.difficultyEasy;
    case 'medium':
      return Colors.difficultyMedium;
    case 'hard':
      return Colors.difficultyHard;
    default:
      return Colors.textSecondary;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'open':
      return Colors.open;
    case 'verified':
      return Colors.verified;
    case 'disputed':
      return Colors.disputed;
    default:
      return Colors.textSecondary;
  }
};
