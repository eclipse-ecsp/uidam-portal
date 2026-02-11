/**
 * TypeScript Type Definitions for Password Reset Feature
 * 
 * Defines all interfaces and types used across the password reset feature module.
 * These types ensure type safety and provide clear contracts for component props,
 * API responses, and internal data structures.
 */

/**
 * Form data structure for password reset form
 * Used with React Hook Form for form state management
 */
export interface PasswordResetFormData {
  /** Current password for validation */
  currentPassword: string;
  
  /** New password to set */
  newPassword: string;
  
  /** Confirmation of new password (must match newPassword) */
  confirmPassword: string;
}

/**
 * Password strength levels
 * Derived from 0-100 score based on policy compliance
 */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

/**
 * Password strength thresholds and display configuration
 */
export interface PasswordStrengthLevel {
  /** Maximum score for this level (inclusive) */
  max: number;
  
  /** MUI color theme key */
  color: 'error' | 'warning' | 'success' | 'success.light' | 'success.main';
  
  /** Display label for user */
  label: PasswordStrength;
}

/**
 * Password policy item as returned by GET /v1/password-policies
 * Each item represents a specific policy rule with its configuration
 */
export interface PasswordPolicyItem {
  /** Unique policy identifier (e.g., 'MIN_LENGTH', 'COMPLEXITY') */
  policyKey: string;
  
  /** Human-readable description of the policy */
  description: string;
  
  /** Whether this policy is enforced (true) or optional (false) */
  required: boolean;
  
  /** Policy-specific configuration rules */
  rules: Record<string, unknown>;
  
  /** Evaluation order (lower numbers evaluated first) */
  priority: number;
}

/**
 * API response for password reset initiation
 * Returned by POST /v1/users/self/recovery/forgot-password
 */
export interface PasswordResetResponse {
  /** User-friendly confirmation message */
  message: string;
  
  /** Optional status code for programmatic handling */
  code?: string;
  
  /** Optional data payload (typically null for this endpoint) */
  data?: null;
  
  /** Optional HTTP status text */
  httpStatus?: string;
}

/**
 * API response wrapper for password policy
 * Returned by GET /v1/password-policies
 */
export interface PasswordPolicyResponse {
  /** Array of policy items */
  data: PasswordPolicyItem[];
  
  /** Optional message */
  message?: string;
  
  /** Optional code */
  code?: string;
}

/**
 * Password validation error structure
 * Used for detailed validation feedback
 */
export interface PasswordValidationError {
  /** Error code for programmatic handling */
  code: string;
  
  /** User-friendly error message */
  message: string;
  
  /** Which policy requirement was violated */
  policyKey?: string;
  
  /** Additional context or details */
  details?: string;
}

/**
 * Generic API error response structure
 * Standardized error format from backend
 */
export interface ApiErrorResponse {
  /** Machine-readable error code */
  code: string;
  
  /** Human-readable error message */
  message: string;
  
  /** HTTP status text */
  httpStatus: string;
  
  /** Additional error details (optional) */
  details?: string;
  
  /** Correlation ID for request tracing */
  correlationId?: string;
  
  /** ISO 8601 timestamp of error */
  timestamp?: string;
}

/**
 * Password strength scoring constants
 */
export const STRENGTH_SCORES = {
  MIN_LENGTH: 25,
  UPPERCASE: 20,
  LOWERCASE: 20,
  DIGIT: 20,
  SPECIAL_CHAR: 15,
  MAX_SCORE: 100,
} as const;

/**
 * Password strength level thresholds
 */
export const STRENGTH_LEVELS: Record<PasswordStrength, PasswordStrengthLevel> = {
  weak: { max: 40, color: 'error', label: 'weak' },
  fair: { max: 70, color: 'warning', label: 'fair' },
  good: { max: 89, color: 'success.light', label: 'good' },
  strong: { max: 100, color: 'success.main', label: 'strong' },
} as const;

/**
 * UI configuration constants
 */
export const UI_CONFIG = {
  /** Debounce delay for password strength calculation (ms) */
  DEBOUNCE_DELAY_MS: 300,
  
  /** Toast notification duration (ms) */
  TOAST_DURATION_MS: 5000,
  
  /** Button spinner size (px) */
  BUTTON_SPINNER_SIZE: 24,
  
  /** Password policy cache stale time (ms) - 5 minutes */
  POLICY_STALE_TIME_MS: 5 * 60 * 1000,
  
  /** Password policy cache time (ms) - 10 minutes */
  POLICY_CACHE_TIME_MS: 10 * 60 * 1000,
} as const;
