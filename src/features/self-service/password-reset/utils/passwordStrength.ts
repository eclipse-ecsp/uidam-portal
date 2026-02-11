/**
 * Password Strength Calculation Utility
 * 
 * Calculates password strength score (0-100) based on password policy compliance.
 * Uses rules-based approach aligned with tenant password policy requirements.
 * 
 * Scoring System:
 * - Min Length (25 points): Password meets minimum length requirement
 * - Uppercase (20 points): Contains required number of uppercase letters
 * - Lowercase (20 points): Contains required number of lowercase letters
 * - Digit (20 points): Contains required number of digits
 * - Special Char (15 points): Contains required number of special characters
 * - Max Score: 100 points
 * 
 * Strength Levels:
 * - 0-40: Weak (red)
 * - 41-70: Fair (yellow)
 * - 71-89: Good (light green)
 * - 90-100: Strong (green)
 */

import type { PasswordPolicyItem, PasswordStrength } from '../types';
import { STRENGTH_SCORES, STRENGTH_LEVELS } from '../types';
import { PasswordPolicyService } from '@/services/passwordPolicyService';

/**
 * Calculates password strength score based on policy compliance
 * 
 * @param {string} password - Password to evaluate
 * @param {PasswordPolicyItem[]} policies - Array of password policy items from API
 * @returns {number} Strength score from 0-100
 * 
 * @example
 * ```ts
 * const policies = await getPasswordPolicy();
 * const score = calculatePasswordStrength('MyP@ssw0rd', policies.data);
 * console.log(score); // e.g., 95 (strong)
 * ```
 */
export function calculatePasswordStrength(
  password: string,
  policies: PasswordPolicyItem[]
): number {
  if (!password || password.length === 0) {
    return 0;
  }

  let score = 0;

  // Check minimum length requirement
  const minLength = PasswordPolicyService.getPolicyRuleValue(policies, 'MIN_LENGTH', 'minLength', 8);
  if (password.length >= minLength) {
    score += STRENGTH_SCORES.MIN_LENGTH;
  }

  // Check complexity requirements
  const complexityPolicy = policies.find((p) => p.policyKey === 'COMPLEXITY');
  if (complexityPolicy && complexityPolicy.rules) {
    const rules = complexityPolicy.rules;

    // Uppercase requirement
    const requireUppercase = rules.requireUppercase === true;
    const minUppercaseCount = (rules.minUppercaseCount as number) || 1;
    if (requireUppercase) {
      const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
      if (uppercaseCount >= minUppercaseCount) {
        score += STRENGTH_SCORES.UPPERCASE;
      }
    } else {
      // If not required, give points anyway if present
      score += STRENGTH_SCORES.UPPERCASE;
    }

    // Lowercase requirement
    const requireLowercase = rules.requireLowercase === true;
    const minLowercaseCount = (rules.minLowercaseCount as number) || 1;
    if (requireLowercase) {
      const lowercaseCount = (password.match(/[a-z]/g) || []).length;
      if (lowercaseCount >= minLowercaseCount) {
        score += STRENGTH_SCORES.LOWERCASE;
      }
    } else {
      score += STRENGTH_SCORES.LOWERCASE;
    }

    // Digit requirement
    const requireDigit = rules.requireDigit === true;
    const minDigitCount = (rules.minDigitCount as number) || 1;
    if (requireDigit) {
      const digitCount = (password.match(/\d/g) || []).length;
      if (digitCount >= minDigitCount) {
        score += STRENGTH_SCORES.DIGIT;
      }
    } else {
      score += STRENGTH_SCORES.DIGIT;
    }

    // Special character requirement
    const requireSpecialChar = rules.requireSpecialChar === true;
    const minSpecialCharCount = (rules.minSpecialCharCount as number) || 1;
    const specialCharList = (rules.specialCharList as string) || '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (requireSpecialChar) {
      // Create regex from allowed special characters
      const escapedChars = specialCharList.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const specialCharRegex = new RegExp(`[${escapedChars}]`, 'g');
      const specialCharCount = (password.match(specialCharRegex) || []).length;
      
      if (specialCharCount >= minSpecialCharCount) {
        score += STRENGTH_SCORES.SPECIAL_CHAR;
      }
    } else {
      score += STRENGTH_SCORES.SPECIAL_CHAR;
    }
  } else {
    // No complexity policy - give full points if basic checks pass
    if (/[A-Z]/.test(password)) score += STRENGTH_SCORES.UPPERCASE;
    if (/[a-z]/.test(password)) score += STRENGTH_SCORES.LOWERCASE;
    if (/\d/.test(password)) score += STRENGTH_SCORES.DIGIT;
    if (/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) score += STRENGTH_SCORES.SPECIAL_CHAR;
  }

  // Cap score at maximum
  return Math.min(score, STRENGTH_SCORES.MAX_SCORE);
}

/**
 * Converts numeric score to strength level label
 * 
 * @param {number} score - Strength score (0-100)
 * @returns {PasswordStrength} Strength level: 'weak', 'fair', 'good', or 'strong'
 * 
 * @example
 * ```ts
 * const strength = getStrengthLevel(75);
 * console.log(strength); // 'good'
 * ```
 */
export function getStrengthLevel(score: number): PasswordStrength {
  if (score <= STRENGTH_LEVELS.weak.max) return 'weak';
  if (score <= STRENGTH_LEVELS.fair.max) return 'fair';
  if (score <= STRENGTH_LEVELS.good.max) return 'good';
  return 'strong';
}

/**
 * Gets color for strength level (for MUI components)
 * 
 * @param {PasswordStrength} strength - Strength level
 * @returns {string} MUI color key
 * 
 * @example
 * ```ts
 * const color = getStrengthColor('good');
 * <LinearProgress color={color} value={score} />
 * ```
 */
export function getStrengthColor(strength: PasswordStrength): 'error' | 'warning' | 'success' {
  const level = STRENGTH_LEVELS[strength];
  // Map MUI color keys to valid LinearProgress color props
  if (level.color === 'error') return 'error';
  if (level.color === 'warning') return 'warning';
  return 'success'; // For both 'success.light' and 'success.main'
}

/**
 * Calculates strength percentage for progress bar
 * 
 * @param {number} score - Strength score (0-100)
 * @returns {number} Percentage (0-100)
 */
export function getStrengthPercentage(score: number): number {
  return Math.min(Math.max(score, 0), 100);
}

/**
 * Gets user-friendly suggestions to improve password strength
 * Based on which policy requirements are not met
 * 
 * @param {string} password - Current password
 * @param {PasswordPolicyItem[]} policies - Password policies
 * @returns {string[]} Array of improvement suggestions
 * 
 * @example
 * ```ts
 * const suggestions = getStrengthSuggestions('pass', policies);
 * // ['Add uppercase letters', 'Add digits', 'Add special characters', 'Increase length to 8 characters']
 * ```
 */
export function getStrengthSuggestions(
  password: string,
  policies: PasswordPolicyItem[]
): string[] {
  const suggestions: string[] = [];

  if (!password || password.length === 0) {
    return ['Enter a password'];
  }

  // Check length
  const minLength = PasswordPolicyService.getPolicyRuleValue(policies, 'MIN_LENGTH', 'minLength', 8);
  if (password.length < minLength) {
    suggestions.push(`Increase length to ${minLength} characters`);
  }

  // Check complexity
  const complexityPolicy = policies.find((p) => p.policyKey === 'COMPLEXITY');
  if (complexityPolicy?.rules) {
    const rules = complexityPolicy.rules;

    if (rules.requireUppercase && !/[A-Z]/.test(password)) {
      suggestions.push('Add uppercase letters');
    }

    if (rules.requireLowercase && !/[a-z]/.test(password)) {
      suggestions.push('Add lowercase letters');
    }

    if (rules.requireDigit && !/\d/.test(password)) {
      suggestions.push('Add numbers');
    }

    if (rules.requireSpecialChar) {
      const specialCharList = (rules.specialCharList as string) || '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const escapedChars = specialCharList.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const specialCharRegex = new RegExp(`[${escapedChars}]`);
      
      if (!specialCharRegex.test(password)) {
        suggestions.push('Add special characters');
      }
    }
  }

  return suggestions;
}
