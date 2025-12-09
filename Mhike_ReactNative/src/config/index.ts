/**
 * Application Configuration
 */

export const APP_CONFIG = {
  // Database
  DATABASE_NAME: 'mhike.db',
  DATABASE_VERSION: 1,

  // Image Storage
  IMAGE_CACHE_DIR: 'mhike_images/',
  IMAGE_QUALITY: 0.85,
  IMAGE_MAX_SIZE: 5242880, // 5MB in bytes

  // Validation
  VALIDATION: {
    NAME_MAX: 200,
    LOCATION_MAX: 200,
    DESCRIPTION_MAX: 2000,
    COMMENTS_MAX: 2000,
    TITLE_MAX: 200,
  },

  // Defaults
  DEFAULT_PRIVACY: 'Public' as const,
  DEFAULT_OBSERVATION_STATUS: 'Open' as const,
  DEFAULT_DIFFICULTY: 'Easy' as const,

  // Time Formats
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm',
};

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'] as const;
export const PRIVACY_LEVELS = ['Public', 'Private'] as const;
export const OBSERVATION_STATUSES = ['Open', 'Verified', 'Disputed'] as const;
