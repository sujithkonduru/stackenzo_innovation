// These values are taken directly from the backend source
// (api/sale.js, api/employeeRequest.js, api/inventry.js, api/purchase.js).
// Do not add values here that the backend does not actually support.

export const STOCK_MOVEMENT_TYPES = {
  PURCHASE: 'PURCHASE',
  SALE: 'SALE',
  ISSUE: 'ISSUE',
  RETURN: 'RETURN',
  SCRAP: 'SCRAP'
  // ADJUSTMENT is referenced in the frontend spec but the backend never
  // writes this movement_type anywhere. Do not send it to the API.
};

export const PAYMENT_METHODS = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER'];

export const PAYMENT_STATUSES = ['PENDING', 'PARTIALLY_PAID', 'PAID'];

export const MATERIAL_REQUEST_STATUSES = [
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED'
];

export const MATERIAL_RETURN_CONDITIONS = ['WORKING', 'DAMAGED', 'SCRAP'];

// The `users` table has a free-text `role` column, but there is no backend
// API to create/list users or enforce roles. These are UI-only labels used
// for local role-based navigation/route guarding.
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE'
};

export const DEFAULT_EXPIRY_SOON_DAYS = 30;

export const UNIT_OPTIONS = [
  'pcs',
  'kg',
  'g',
  'l',
  'ml',
  'box',
  'pack',
  'roll',
  'meter',
  'set'
];

export const LOCAL_STORAGE_KEYS = {
  THEME: 'stackenzo_theme',
  SESSION: 'stackenzo_session',
  EXPIRY_THRESHOLD: 'stackenzo_expiry_threshold_days'
};
