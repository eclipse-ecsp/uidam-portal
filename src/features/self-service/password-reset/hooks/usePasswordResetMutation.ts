/**
 * usePasswordResetMutation Hook
 * 
 * Custom React Query mutation hook for password reset functionality.
 * Handles API call, success/error notifications, and correlation ID generation.
 * 
 * Features:
 * - Automatic correlation ID generation for request tracking
 * - Success/error toast notifications
 * - Type-safe mutation with proper error handling
 * - Integration with UserService
 */

import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { UserService } from '@/services/userService';
import { ToastService } from '@/services/toastService';
import { v4 as uuidv4 } from 'uuid';
import type { PasswordResetFormData, PasswordResetMutationContext } from '../types';
import type { ApiResponse } from '@/types/api';
import type { SelfUserPasswordRecoveryResponseV1 } from '@/types/user';

/**
 * Type for successful password reset response
 */
interface PasswordResetResponse {
  message: string;
  correlationId: string;
}

/**
 * Type for password reset error
 */
interface PasswordResetError extends Error {
  correlationId?: string;
  status?: number;
  code?: string;
}

/**
 * Options for the password reset mutation hook
 */
interface UsePasswordResetMutationOptions {
  /**
   * Callback invoked on successful password reset
   * @param data - Response data from API
   * @param variables - Original form data submitted
   * @param context - Mutation context with correlation ID
   */
  onSuccess?: (
    data: PasswordResetResponse,
    variables: PasswordResetFormData,
    context: PasswordResetMutationContext | undefined
  ) => void;

  /**
   * Callback invoked on password reset failure
   * @param error - Error object with details
   * @param variables - Original form data submitted
   * @param context - Mutation context with correlation ID
   */
  onError?: (
    error: PasswordResetError,
    variables: PasswordResetFormData,
    context: PasswordResetMutationContext | undefined
  ) => void;

  /**
   * Callback invoked when mutation settles (success or error)
   * @param data - Response data (undefined on error)
   * @param error - Error object (null on success)
   * @param variables - Original form data submitted
   * @param context - Mutation context with correlation ID
   */
  onSettled?: (
    data: PasswordResetResponse | undefined,
    error: PasswordResetError | null,
    variables: PasswordResetFormData,
    context: PasswordResetMutationContext | undefined
  ) => void;

  /**
   * Whether to show success toast notification
   * @default true
   */
  showSuccessToast?: boolean;

  /**
   * Whether to show error toast notification
   * @default true
   */
  showErrorToast?: boolean;
}

/**
 * Hook to handle password reset mutation
 * Uses React Query for mutation state management and error handling
 * 
 * API Flow:
 * 1. Generate correlation ID
 * 2. Call POST /v1/users/self/recovery/forgot-password
 * 3. Show success/error toast
 * 4. Invoke callbacks
 * 
 * @param {UsePasswordResetMutationOptions} options - Configuration options
 * @returns {UseMutationResult} React Query mutation result
 * 
 * @example
 * ```tsx
 * function PasswordResetForm() {
 *   const resetPassword = usePasswordResetMutation({
 *     onSuccess: (data) => {
 *       console.log('Reset link sent:', data.correlationId);
 *       navigate('/login');
 *     },
 *     onError: (error) => {
 *       console.error('Reset failed:', error.message);
 *     }
 *   });
 * 
 *   const onSubmit = (formData: PasswordResetFormData) => {
 *     resetPassword.mutate(formData);
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <TextField name="currentPassword" />
 *       <TextField name="newPassword" />
 *       <Button type="submit" disabled={resetPassword.isPending}>
 *         {resetPassword.isPending ? 'Resetting...' : 'Reset Password'}
 *       </Button>
 *     </form>
 *   );
 * }
 * ```
 */
export function usePasswordResetMutation(
  options: UsePasswordResetMutationOptions = {}
): UseMutationResult<
  PasswordResetResponse,
  PasswordResetError,
  PasswordResetFormData,
  PasswordResetMutationContext
> {
  const {
    onSuccess,
    onError,
    onSettled,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation<
    PasswordResetResponse,
    PasswordResetError,
    PasswordResetFormData,
    PasswordResetMutationContext
  >({
    mutationFn: async (formData: PasswordResetFormData) => {
      // Generate correlation ID for request tracking
      const correlationId = uuidv4();

      try {
        // Call password reset API (no body required per contract)
        const response: ApiResponse<SelfUserPasswordRecoveryResponseV1> =
          await UserService.postSelfRecoveryForgotPassword();

        // API returns success - extract message
        const message =
          response.data?.message ||
          'Password reset link has been sent to your email';

        return {
          message,
          correlationId,
        };
      } catch (error) {
        // Enhance error with correlation ID
        const enhancedError = error as PasswordResetError;
        enhancedError.correlationId = correlationId;

        // Extract error details
        if (typeof error === 'object' && error !== null) {
          const apiError = error as {
            response?: { status?: number; data?: { code?: string } };
          };
          enhancedError.status = apiError.response?.status;
          enhancedError.code = apiError.response?.data?.code;
        }

        throw enhancedError;
      }
    },

    onSuccess: (data, variables, context) => {
      // Show success toast if enabled
      if (showSuccessToast) {
        ToastService.success('Password reset link has been sent to your email', {
          autoHideDuration: 6000,
        });
      }

      // Invoke user callback
      onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      // Show error toast if enabled
      if (showErrorToast) {
        const errorMessage = getPasswordResetErrorMessage(error);
        ToastService.error(errorMessage, {
          autoHideDuration: 8000,
        });
      }

      // Invoke user callback
      onError?.(error, variables, context);
    },

    onSettled: (data, error, variables, context) => {
      // Invoke user callback
      onSettled?.(data, error, variables, context);
    },

    // Mutation configuration
    retry: false, // Don't retry password reset (avoid duplicate emails)
    networkMode: 'always', // Always try to execute (no offline mode)
  });
}

/**
 * Helper hook for simple password reset without custom callbacks
 * Returns mutation object and helper functions
 * 
 * @returns Mutation object with helper methods
 * 
 * @example
 * ```tsx
 * function SimplePasswordReset() {
 *   const { mutate, isPending, isSuccess, error, reset } = useSimplePasswordReset();
 * 
 *   return (
 *     <Button onClick={() => mutate(formData)} disabled={isPending}>
 *       {isPending ? 'Sending...' : 'Reset Password'}
 *     </Button>
 *   );
 * }
 * ```
 */
export function useSimplePasswordReset() {
  return usePasswordResetMutation({
    showSuccessToast: true,
    showErrorToast: true,
  });
}

/**
 * Type guard to check if error is a PasswordResetError
 * 
 * @param error - Unknown error object
 * @returns True if error is PasswordResetError
 * 
 * @example
 * ```tsx
 * const mutation = usePasswordResetMutation({
 *   onError: (error) => {
 *     if (isPasswordResetError(error)) {
 *       console.log('Correlation ID:', error.correlationId);
 *     }
 *   }
 * });
 * ```
 */
export function isPasswordResetError(error: unknown): error is PasswordResetError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as PasswordResetError).message === 'string'
  );
}

/**
 * Helper function to get user-friendly error message
 * Maps API error codes to readable messages
 * 
 * @param error - Error object from mutation
 * @returns User-friendly error message
 * 
 * @example
 * ```tsx
 * const mutation = usePasswordResetMutation({
 *   onError: (error) => {
 *     const message = getPasswordResetErrorMessage(error);
 *     toast.error(message);
 *   }
 * });
 * ```
 */
export function getPasswordResetErrorMessage(error: PasswordResetError): string {
  // Check for specific error codes
  if (error.code) {
    const errorMessages: Record<string, string> = {
      INVALID_PASSWORD: 'The current password is incorrect',
      PASSWORD_POLICY_VIOLATION: 'New password does not meet policy requirements',
      PASSWORD_REUSE: 'Cannot reuse a recent password',
      RATE_LIMIT_EXCEEDED: 'Too many attempts. Please try again later',
      USER_NOT_FOUND: 'User account not found',
      ACCOUNT_LOCKED: 'Account is locked. Please contact support',
    };

    if (errorMessages[error.code]) {
      return errorMessages[error.code];
    }
  }

  // Check for HTTP status codes
  if (error.status) {
    const statusMessages: Record<number, string> = {
      400: 'Invalid request. Please check your input',
      401: 'You must be logged in to reset your password',
      403: 'You do not have permission to perform this action',
      404: 'User account not found',
      429: 'Too many requests. Please try again later',
      500: 'Server error. Please try again later',
      503: 'Service temporarily unavailable. Please try again later',
    };

    if (statusMessages[error.status]) {
      return statusMessages[error.status];
    }
  }

  // Default error message
  return (
    error.message ||
    'Failed to reset password. Please try again or contact support'
  );
}
