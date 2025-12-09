/**
 * Validation utilities for form inputs
 */

export interface ValidationError {
  field: string;
  message: string;
}

export const validateHike = (hike: {
  name?: string;
  location?: string;
  date?: string;
  time?: string;
  length?: string | number;
  difficulty?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!hike.name || hike.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Hike name is required' });
  } else if (hike.name.length > 200) {
    errors.push({ field: 'name', message: 'Hike name must be 200 characters or less' });
  }

  if (!hike.location || hike.location.trim().length === 0) {
    errors.push({ field: 'location', message: 'Location is required' });
  } else if (hike.location.length > 200) {
    errors.push({ field: 'location', message: 'Location must be 200 characters or less' });
  }

  if (!hike.date || hike.date.trim().length === 0) {
    errors.push({ field: 'date', message: 'Date is required' });
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(hike.date)) {
    errors.push({ field: 'date', message: 'Date must be in YYYY-MM-DD format' });
  }

  if (!hike.time || hike.time.trim().length === 0) {
    errors.push({ field: 'time', message: 'Time is required' });
  } else if (!/^([0-1]\d|2[0-3]):([0-5]\d)$/.test(hike.time)) {
    errors.push({ field: 'time', message: 'Time must be in HH:mm format' });
  }

  if (hike.length === undefined || hike.length === null || hike.length === '') {
    errors.push({ field: 'length', message: 'Length is required' });
  } else {
    const lengthNum = typeof hike.length === 'string' ? parseFloat(hike.length) : hike.length;
    if (isNaN(lengthNum) || lengthNum <= 0) {
      errors.push({ field: 'length', message: 'Length must be a positive number' });
    }
  }

  if (!hike.difficulty || hike.difficulty.trim().length === 0) {
    errors.push({ field: 'difficulty', message: 'Difficulty is required' });
  } else if (!['Easy', 'Medium', 'Hard'].includes(hike.difficulty)) {
    errors.push({ field: 'difficulty', message: 'Invalid difficulty level' });
  }

  return errors;
};

export const validateObservation = (observation: {
  title?: string;
  time?: string;
  comments?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!observation.title || observation.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Observation title is required' });
  } else if (observation.title.length > 200) {
    errors.push({ field: 'title', message: 'Title must be 200 characters or less' });
  }

  if (observation.time && !/^([0-1]\d|2[0-3]):([0-5]\d)$/.test(observation.time)) {
    errors.push({ field: 'time', message: 'Time must be in HH:mm format' });
  }

  if (observation.comments && observation.comments.length > 2000) {
    errors.push({ field: 'comments', message: 'Comments must be 2000 characters or less' });
  }

  return errors;
};

export const getErrorMessage = (errors: ValidationError[], field: string): string | null => {
  const error = errors.find((e) => e.field === field);
  return error ? error.message : null;
};
