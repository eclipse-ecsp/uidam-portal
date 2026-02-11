/**
 * usePasswordStrength Hook
 * 
 * Custom hook for real-time password strength calculation with debouncing.
 * Watches password input and calculates strength using policy-based rules.
 * 
 * Features:
 * - Debounced strength calculation (300ms)
 * - Password policy integration
 * - Strength level and color determination
 * - Improvement suggestions
 * - Memoized results for performance
 * 
 * @hook
 */

import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { usePasswordPolicy } from './usePasswordPolicy';
import {
  calculatePasswordStrength,
  getStrengthLevel,
  getStrengthColor,
  getStrengthSuggestions,
} from '../utils/passwordStrength';
import type { PasswordStrength } from '../types';

/**
 * Password strength calculation result
 */
interface PasswordStrengthResult {
  /**
   * Numeric strength score (0-100)
   */
  score: number;

  /**
   * Strength level classification
   */
  level: PasswordStrength;

  /**
   * Color for visual indicator
   * 'error' | 'warning' | 'success'
   */
  color: 'error' | 'warning' | 'success';

  /**
   * Suggestions for improvement
   */
  suggestions: string[];

  /**
   * Whether the calculation is in progress (debouncing)
   */
  isCalculating: boolean;

  /**
   * Whether password policy is loading
   */
  isPolicyLoading: boolean;

  /**
   * Error loading password policy
   */
  policyError: Error | null;
}

/**
 * Options for usePasswordStrength hook
 */
interface UsePasswordStrengthOptions {
  /**
   * Debounce delay in milliseconds
   * @default 300
   */
  debounceMs?: number;

  /**
   * Whether to calculate strength immediately without debounce
   * @default false
   */
  immediate?: boolean;

  /**
   * Minimum password length to start calculating
   * Avoids unnecessary calculations for very short passwords
   * @default 1
   */
  minLengthToCalculate?: number;
}

/**
 * Hook to calculate password strength in real-time
 * 
 * Watches password input and calculates strength score, level, color,
 * and suggestions using password policy rules. Debounces calculations
 * to avoid excessive computation during typing.
 * 
 * @param {string} password - Current password value
 * @param {UsePasswordStrengthOptions} options - Configuration options
 * @returns {PasswordStrengthResult} Strength calculation result
 * 
 * @example
 * ```tsx
 * function PasswordField() {
 *   const [password, setPassword] = useState('');
 *   const strength = usePasswordStrength(password);
 * 
 *   return (
 *     <>
 *       <TextField
 *         value={password}
 *         onChange={(e) => setPassword(e.target.value)}
 *       />
 *       <LinearProgress
 *         value={strength.score}
 *         color={strength.color}
 *       />
 *       <Typography color={strength.color}>
 *         {strength.level}
 *       </Typography>
 *     </>
 *   );
 * }
 * ```
 */
export function usePasswordStrength(
  password: string,
  options: UsePasswordStrengthOptions = {}
): PasswordStrengthResult {
  const {
    debounceMs = 300,
    immediate = false,
    minLengthToCalculate = 1,
  } = options;

  // Fetch password policy
  const {
    data: passwordPolicies,
    isLoading: isPolicyLoading,
    error: policyError,
  } = usePasswordPolicy();

  // Debounce password input
  const debouncedPassword = useDebounce(password, debounceMs);

  // Track if currently debouncing
  const [isCalculating, setIsCalculating] = useState(false);

  // Use immediate password or debounced password
  const passwordToCalculate = immediate ? password : debouncedPassword;

  // Update calculating state
  useEffect(() => {
    if (immediate) {
      setIsCalculating(false);
      return;
    }

    if (password !== debouncedPassword) {
      setIsCalculating(true);
    } else {
      setIsCalculating(false);
    }
  }, [password, debouncedPassword, immediate]);

  // Calculate strength
  const result = useMemo<PasswordStrengthResult>(() => {
    // Return empty result if password is too short or policy not loaded
    if (
      !passwordToCalculate ||
      passwordToCalculate.length < minLengthToCalculate ||
      !passwordPolicies ||
      passwordPolicies.length === 0
    ) {
      return {
        score: 0,
        level: 'weak',
        color: 'error',
        suggestions: [],
        isCalculating: false,
        isPolicyLoading,
        policyError,
      };
    }

    // Calculate strength score
    const score = calculatePasswordStrength(passwordToCalculate, passwordPolicies);

    // Determine strength level
    const level = getStrengthLevel(score);

    // Get color for visualization
    const color = getStrengthColor(level);

    // Get improvement suggestions
    const suggestions = getStrengthSuggestions(passwordToCalculate, passwordPolicies);

    return {
      score,
      level,
      color,
      suggestions,
      isCalculating,
      isPolicyLoading,
      policyError,
    };
  }, [
    passwordToCalculate,
    passwordPolicies,
    minLengthToCalculate,
    isCalculating,
    isPolicyLoading,
    policyError,
  ]);

  return result;
}

/**
 * Hook for immediate (non-debounced) password strength calculation
 * Useful when you need real-time feedback without delay
 * 
 * @param {string} password - Current password value
 * @returns {PasswordStrengthResult} Strength calculation result
 * 
 * @example
 * ```tsx
 * function InstantPasswordStrength() {
 *   const [password, setPassword] = useState('');
 *   const strength = useImmediatePasswordStrength(password);
 * 
 *   return <PasswordStrengthIndicator {...strength} />;
 * }
 * ```
 */
export function useImmediatePasswordStrength(password: string): PasswordStrengthResult {
  return usePasswordStrength(password, { immediate: true });
}

/**
 * Hook to check if password meets minimum strength requirement
 * Returns boolean indicating if password is strong enough
 * 
 * @param {string} password - Current password value
 * @param {number} minScore - Minimum required score (0-100), default 50
 * @returns {boolean} True if password meets minimum strength
 * 
 * @example
 * ```tsx
 * function PasswordForm() {
 *   const [password, setPassword] = useState('');
 *   const isStrongEnough = usePasswordMeetsMinimumStrength(password, 70);
 * 
 *   return (
 *     <Button disabled={!isStrongEnough}>
 *       Submit
 *     </Button>
 *   );
 * }
 * ```
 */
export function usePasswordMeetsMinimumStrength(
  password: string,
  minScore: number = 50
): boolean {
  const { score } = usePasswordStrength(password);
  return score >= minScore;
}

/**
 * Hook to get password strength color only
 * Optimized for cases where you only need the color
 * 
 * @param {string} password - Current password value
 * @returns {'error' | 'warning' | 'success'} Strength color
 * 
 * @example
 * ```tsx
 * function PasswordColorIndicator() {
 *   const [password, setPassword] = useState('');
 *   const color = usePasswordStrengthColor(password);
 * 
 *   return <Box sx={{ backgroundColor: `${color}.main` }} />;
 * }
 * ```
 */
export function usePasswordStrengthColor(
  password: string
): 'error' | 'warning' | 'success' {
  const { color } = usePasswordStrength(password);
  return color;
}

export default usePasswordStrength;
