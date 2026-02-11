/**
 * Password Validation Utility
 * 
 * Provides validation functions to check passwords against policy rules.
 * Used for client-side validation before API submission.
 * 
 * Note: Server-side validation is authoritative. These are advisory checks only.
 */

import type { PasswordPolicyItem, PasswordValidationError } from '../types';
import { PasswordPolicyService } from '@/services/passwordPolicyService';

/**
 * Validates password minimum length requirement
 * 
 * @param {string} password - Password to validate
 * @param {PasswordPolicyItem[]} policies - Password policies from API
 * @returns {PasswordValidationError | null} Error object if validation fails, null if valid
 */
export function validateMinLength(
  password: string,
  policies: PasswordPolicyItem[]
): PasswordValidationError | null {
  const minLength = PasswordPolicyService.getPolicyRuleValue(policies, 'MIN_LENGTH', 'minLength', 8);
  
  if (password.length < minLength) {
    return {
      code: 'MIN_LENGTH_VIOLATION',
      message: `Password must be at least ${minLength} characters`,
      policyKey: 'MIN_LENGTH',
      details: `Current length: ${password.length}, Required: ${minLength}`,
    };
  }

  return null;
}

/**
 * Validates password complexity requirements
 * Checks uppercase, lowercase, digit, and special character requirements
 * 
 * @param {string} password - Password to validate
 * @param {PasswordPolicyItem[]} policies - Password policies from API
 * @returns {PasswordValidationError[]} Array of validation errors (empty if valid)
 */
export function validateComplexity(
  password: string,
  policies: PasswordPolicyItem[]
): PasswordValidationError[] {
  const errors: PasswordValidationError[] = [];
  
  const complexityPolicy = policies.find((p) => p.policyKey === 'COMPLEXITY');
  if (!complexityPolicy || !complexityPolicy.rules) {
    return errors; // No complexity requirements
  }

  const rules = complexityPolicy.rules;

  // Validate uppercase
  if (rules.requireUppercase === true) {
    const minUppercaseCount = (rules.minUppercaseCount as number) || 1;
    const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
    
    if (uppercaseCount < minUppercaseCount) {
      errors.push({
        code: 'UPPERCASE_REQUIRED',
        message: `Password must contain at least ${minUppercaseCount} uppercase letter(s)`,
        policyKey: 'COMPLEXITY',
        details: `Found ${uppercaseCount}, Required: ${minUppercaseCount}`,
      });
    }
  }

  // Validate lowercase
  if (rules.requireLowercase === true) {
    const minLowercaseCount = (rules.minLowercaseCount as number) || 1;
    const lowercaseCount = (password.match(/[a-z]/g) || []).length;
    
    if (lowercaseCount < minLowercaseCount) {
      errors.push({
        code: 'LOWERCASE_REQUIRED',
        message: `Password must contain at least ${minLowercaseCount} lowercase letter(s)`,
        policyKey: 'COMPLEXITY',
        details: `Found ${lowercaseCount}, Required: ${minLowercaseCount}`,
      });
    }
  }

  // Validate digits
  if (rules.requireDigit === true) {
    const minDigitCount = (rules.minDigitCount as number) || 1;
    const digitCount = (password.match(/\d/g) || []).length;
    
    if (digitCount < minDigitCount) {
      errors.push({
        code: 'DIGIT_REQUIRED',
        message: `Password must contain at least ${minDigitCount} digit(s)`,
        policyKey: 'COMPLEXITY',
        details: `Found ${digitCount}, Required: ${minDigitCount}`,
      });
    }
  }

  // Validate special characters
  if (rules.requireSpecialChar === true) {
    const minSpecialCharCount = (rules.minSpecialCharCount as number) || 1;
    const specialCharList = (rules.specialCharList as string) || '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    // Create regex from allowed special characters
    const escapedChars = specialCharList.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const specialCharRegex = new RegExp(`[${escapedChars}]`, 'g');
    const specialCharCount = (password.match(specialCharRegex) || []).length;
    
    if (specialCharCount < minSpecialCharCount) {
      errors.push({
        code: 'SPECIAL_CHAR_REQUIRED',
        message: `Password must contain at least ${minSpecialCharCount} special character(s)`,
        policyKey: 'COMPLEXITY',
        details: `Found ${specialCharCount}, Required: ${minSpecialCharCount}. Allowed: ${specialCharList}`,
      });
    }
  }

  return errors;
}

/**
 * Validates that new password is not same as current password
 * 
 * @param {string} newPassword - New password
 * @param {string} currentPassword - Current password
 * @returns {PasswordValidationError | null} Error object if validation fails, null if valid
 */
export function validateNotSameAsCurrent(
  newPassword: string,
  currentPassword: string
): PasswordValidationError | null {
  if (newPassword === currentPassword) {
    return {
      code: 'SAME_AS_CURRENT',
      message: 'New password must be different from current password',
      details: 'Password cannot be reused immediately',
    };
  }

  return null;
}

/**
 * Validates that password doesn't match username or email
 * 
 * @param {string} password - Password to validate
 * @param {string} username - Username to check against
 * @param {string} [email] - Optional email to check against
 * @returns {PasswordValidationError | null} Error object if validation fails, null if valid
 */
export function validateNotMatchingUsername(
  password: string,
  username: string,
  email?: string
): PasswordValidationError | null {
  const lowerPassword = password.toLowerCase();
  const lowerUsername = username.toLowerCase();

  if (lowerPassword.includes(lowerUsername) || lowerUsername.includes(lowerPassword)) {
    return {
      code: 'MATCHES_USERNAME',
      message: 'Password cannot contain or match your username',
      details: 'Choose a password unrelated to your username',
    };
  }

  if (email) {
    const emailLocal = email.split('@')[0].toLowerCase();
    if (lowerPassword.includes(emailLocal) || emailLocal.includes(lowerPassword)) {
      return {
        code: 'MATCHES_EMAIL',
        message: 'Password cannot contain or match your email address',
        details: 'Choose a password unrelated to your email',
      };
    }
  }

  return null;
}

/**
 * Validates password against history (simulated client-side check)
 * Note: Actual history check is performed server-side
 * This is a placeholder for UI feedback
 * 
 * @param {string} _password - Password to validate (unused in client-side check)
 * @param {PasswordPolicyItem[]} policies - Password policies
 * @returns {PasswordValidationError | null} Always returns null (server-side check only)
 */
export function validateHistory(
  _password: string,
  policies: PasswordPolicyItem[]
): PasswordValidationError | null {
  const historyCount = PasswordPolicyService.getPolicyRuleValue(
    policies,
    'HISTORY',
    'passwordHistoryCount',
    0
  );

  // Client-side cannot check history - this is server-side only
  // Return null to indicate client-side check passed
  // Server will validate against actual password history
  if (historyCount > 0) {
    // Just informational - actual check happens server-side
  }

  return null;
}

/**
 * Validates all password policy requirements
 * Aggregates all validation checks into a single function
 * 
 * @param {string} password - Password to validate
 * @param {PasswordPolicyItem[]} policies - Password policies from API
 * @param {Object} [context] - Optional context for additional validations
 * @param {string} [context.currentPassword] - Current password (to check not same as new)
 * @param {string} [context.username] - Username (to check password doesn't match)
 * @param {string} [context.email] - Email (to check password doesn't match)
 * @returns {PasswordValidationError[]} Array of all validation errors (empty if valid)
 * 
 * @example
 * ```ts
 * const errors = validatePasswordPolicy('Pass123!', policies, {
 *   currentPassword: 'OldPass123!',
 *   username: 'john.doe',
 *   email: 'john.doe@example.com',
 * });
 * 
 * if (errors.length > 0) {
 *   console.error('Validation failed:', errors);
 * }
 * ```
 */
export function validatePasswordPolicy(
  password: string,
  policies: PasswordPolicyItem[],
  context?: {
    currentPassword?: string;
    username?: string;
    email?: string;
  }
): PasswordValidationError[] {
  const errors: PasswordValidationError[] = [];

  // Check minimum length
  const lengthError = validateMinLength(password, policies);
  if (lengthError) {
    errors.push(lengthError);
  }

  // Check complexity requirements
  const complexityErrors = validateComplexity(password, policies);
  errors.push(...complexityErrors);

  // Check not same as current password
  if (context?.currentPassword) {
    const sameError = validateNotSameAsCurrent(password, context.currentPassword);
    if (sameError) {
      errors.push(sameError);
    }
  }

  // Check not matching username/email
  if (context?.username) {
    const usernameError = validateNotMatchingUsername(password, context.username, context.email);
    if (usernameError) {
      errors.push(usernameError);
    }
  }

  // Note: Password history is validated server-side only

  return errors;
}

/**
 * Checks if password meets all policy requirements
 * Convenience function that returns boolean instead of errors array
 * 
 * @param {string} password - Password to validate
 * @param {PasswordPolicyItem[]} policies - Password policies
 * @param {Object} [context] - Optional context for additional validations
 * @returns {boolean} True if password is valid, false otherwise
 */
export function isPasswordValid(
  password: string,
  policies: PasswordPolicyItem[],
  context?: {
    currentPassword?: string;
    username?: string;
    email?: string;
  }
): boolean {
  const errors = validatePasswordPolicy(password, policies, context);
  return errors.length === 0;
}
