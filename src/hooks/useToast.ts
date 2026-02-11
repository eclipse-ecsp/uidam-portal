/**
 * useToast Hook
 * 
 * Custom React hook for displaying toast notifications.
 * Provides simple API wrapping ToastService.
 * 
 * Features:
 * - Type-safe toast methods
 * - Success, error, warning, and info notifications
 * - Custom duration and action buttons
 * - Toast queue management
 * 
 * @hook
 */

import { useCallback } from 'react';
import {
  ToastService,
  type ToastNotification,
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
} from '@/services/toastService';
import type { AlertColor } from '@mui/material';

/**
 * Toast options (subset of ToastNotification)
 */
type ToastOptions = Partial<Omit<ToastNotification, 'id' | 'message' | 'type'>>;

/**
 * Return type for useToast hook
 */
interface UseToastReturn {
  /**
   * Show a success toast
   * @param message - Toast message
   * @param options - Optional configuration
   * @returns Toast ID
   */
  success: (message: string, options?: ToastOptions) => string;

  /**
   * Show an error toast
   * @param message - Toast message
   * @param options - Optional configuration
   * @returns Toast ID
   */
  error: (message: string, options?: ToastOptions) => string;

  /**
   * Show a warning toast
   * @param message - Toast message
   * @param options - Optional configuration
   * @returns Toast ID
   */
  warning: (message: string, options?: ToastOptions) => string;

  /**
   * Show an info toast
   * @param message - Toast message
   * @param options - Optional configuration
   * @returns Toast ID
   */
  info: (message: string, options?: ToastOptions) => string;

  /**
   * Show a toast with custom type
   * @param message - Toast message
   * @param type - Toast type
   * @param options - Optional configuration
   * @returns Toast ID
   */
  show: (message: string, type: AlertColor, options?: ToastOptions) => string;

  /**
   * Close a specific toast
   * @param id - Toast ID
   */
  close: (id: string) => void;

  /**
   * Close all active toasts
   */
  closeAll: () => void;
}

/**
 * Hook for displaying toast notifications
 * 
 * Provides methods to show success, error, warning, and info toasts.
 * Wraps ToastService with React hooks for better integration.
 * 
 * @returns {UseToastReturn} Toast notification methods
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const toast = useToast();
 * 
 *   const handleSubmit = async () => {
 *     try {
 *       await saveData();
 *       toast.success('Data saved successfully');
 *     } catch (error) {
 *       toast.error('Failed to save data');
 *     }
 *   };
 * 
 *   return <Button onClick={handleSubmit}>Save</Button>;
 * }
 * ```
 */
export function useToast(): UseToastReturn {
  const success = useCallback((message: string, options?: ToastOptions): string => {
    return showSuccessToast(message, options);
  }, []);

  const error = useCallback((message: string, options?: ToastOptions): string => {
    return showErrorToast(message, options);
  }, []);

  const warning = useCallback((message: string, options?: ToastOptions): string => {
    return showWarningToast(message, options);
  }, []);

  const info = useCallback((message: string, options?: ToastOptions): string => {
    return showInfoToast(message, options);
  }, []);

  const show = useCallback(
    (message: string, type: AlertColor, options?: ToastOptions): string => {
      return ToastService.show(message, type, options);
    },
    []
  );

  const close = useCallback((id: string): void => {
    ToastService.close(id);
  }, []);

  const closeAll = useCallback((): void => {
    ToastService.closeAll();
  }, []);

  return {
    success,
    error,
    warning,
    info,
    show,
    close,
    closeAll,
  };
}

/**
 * Hook for password reset success toast
 * Pre-configured success toast for password reset
 * 
 * @returns Function to show password reset success toast
 * 
 * @example
 * ```tsx
 * function PasswordResetForm() {
 *   const showPasswordResetSuccess = usePasswordResetSuccessToast();
 * 
 *   const onSuccess = () => {
 *     showPasswordResetSuccess();
 *     navigate('/login');
 *   };
 * 
 *   return <PasswordResetForm onSuccess={onSuccess} />;
 * }
 * ```
 */
export function usePasswordResetSuccessToast(): () => string {
  const toast = useToast();

  return useCallback(() => {
    return toast.success('Password reset link sent to your email', {
      autoHideDuration: 6000,
    });
  }, [toast]);
}

/**
 * Hook for password reset error toast
 * Pre-configured error toast for password reset failures
 * 
 * @returns Function to show password reset error toast
 * 
 * @example
 * ```tsx
 * function PasswordResetForm() {
 *   const showPasswordResetError = usePasswordResetErrorToast();
 * 
 *   const onError = (error: Error) => {
 *     showPasswordResetError(error.message);
 *   };
 * 
 *   return <PasswordResetForm onError={onError} />;
 * }
 * ```
 */
export function usePasswordResetErrorToast(): (message?: string) => string {
  const toast = useToast();

  return useCallback(
    (message?: string) => {
      return toast.error(
        message || 'Failed to reset password. Please try again.',
        {
          autoHideDuration: 8000,
        }
      );
    },
    [toast]
  );
}

/**
 * Hook for form validation error toast
 * Shows toast for form validation failures
 * 
 * @returns Function to show validation error toast
 * 
 * @example
 * ```tsx
 * function Form() {
 *   const showValidationError = useValidationErrorToast();
 * 
 *   const onSubmit = (data) => {
 *     if (!validate(data)) {
 *       showValidationError('Please check the form for errors');
 *       return;
 *     }
 *     // Submit form
 *   };
 * 
 *   return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
 * }
 * ```
 */
export function useValidationErrorToast(): (message?: string) => string {
  const toast = useToast();

  return useCallback(
    (message?: string) => {
      return toast.warning(
        message || 'Please check the form for errors',
        {
          autoHideDuration: 5000,
        }
      );
    },
    [toast]
  );
}

export default useToast;
