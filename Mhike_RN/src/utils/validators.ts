export interface ValidationErrors {
  [key: string]: string;
}

export const validateHike = (data: {
  name?: string;
  location?: string;
  date?: string;
  time?: string;
  length?: string | number;
  difficulty?: string;
}): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.name || data.name.trim() === '') {
    errors.name = 'Name is required';
  }

  if (!data.location || data.location.trim() === '') {
    errors.location = 'Location is required';
  }

  if (!data.date || data.date.trim() === '') {
    errors.date = 'Date is required';
  }

  if (!data.time || data.time.trim() === '') {
    errors.time = 'Time is required';
  }

  if (!data.length || data.length === '' || data.length === 0) {
    errors.length = 'Length is required';
  } else {
    const lengthNum = typeof data.length === 'string' ? parseFloat(data.length) : data.length;
    if (isNaN(lengthNum) || lengthNum <= 0) {
      errors.length = 'Length must be a positive number';
    }
  }

  if (!data.difficulty || data.difficulty.trim() === '') {
    errors.difficulty = 'Difficulty is required';
  }

  return errors;
};

export const validateObservation = (data: {
  title?: string;
}): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.title || data.title.trim() === '') {
    errors.title = 'Title is required';
  }

  return errors;
};
