export const isRequired = (value) => {
  if (value === null || value === undefined) return 'This field is required';
  if (typeof value === 'string' && value.trim() === '') return 'This field is required';
  return '';
};

export const isEmail = (value) => {
  if (!value) return '';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value) ? '' : 'Enter a valid email address';
};

export const isPhone = (value) => {
  if (!value) return '';
  const re = /^[+]?[\d\s-]{7,15}$/;
  return re.test(value) ? '' : 'Enter a valid phone number';
};

export const isPositiveNumber = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const num = Number(value);
  if (Number.isNaN(num)) return 'Must be a valid number';
  if (num <= 0) return 'Must be greater than 0';
  return '';
};

export const isNonNegativeNumber = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const num = Number(value);
  if (Number.isNaN(num)) return 'Must be a valid number';
  if (num < 0) return 'Cannot be negative';
  return '';
};

export const isPercent = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const num = Number(value);
  if (Number.isNaN(num)) return 'Must be a valid number';
  if (num < 0 || num > 100) return 'Must be between 0 and 100';
  return '';
};

export const isFutureOrTodayDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return 'Date cannot be in the past';
  return '';
};

/**
 * Runs a validators map against a values object.
 * validators: { fieldName: (value, allValues) => errorString }
 * returns: { fieldName: errorString, ... } (only fields with errors)
 */
export function validateForm(values, validators) {
  const errors = {};
  for (const field of Object.keys(validators)) {
    const rule = validators[field];
    const error = rule(values[field], values);
    if (error) errors[field] = error;
  }
  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
