/**
 * Utility functions for formatting dates and times
 */

/**
 * Format date string from ISO format to display format
 * @param dateString - YYYY-MM-DD format
 * @returns Formatted date string (e.g., "Dec 04, 2025")
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString + 'T00:00:00');
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
};

/**
 * Format time string to display format
 * @param timeString - HH:mm format
 * @returns Formatted time string (e.g., "2:30 PM")
 */
export const formatTime = (timeString: string): string => {
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date(2000, 0, 1, hours, minutes);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return timeString;
  }
};

/**
 * Get current time in HH:mm format
 * @returns Current time string (e.g., "14:30")
 */
export const getCurrentTime = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Get today's date in YYYY-MM-DD format
 * @returns Today's date string
 */
export const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Validate date format YYYY-MM-DD
 * @param dateString - Date to validate
 * @returns true if valid, false otherwise
 */
export const isValidDateFormat = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString + 'T00:00:00');
  return !isNaN(date.getTime());
};

/**
 * Validate time format HH:mm
 * @param timeString - Time to validate
 * @returns true if valid, false otherwise
 */
export const isValidTimeFormat = (timeString: string): boolean => {
  const regex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(timeString);
};
