/**
 * Toast Notification Service
 * 
 * Centralized service for displaying toast notifications using Material-UI Snackbar.
 * Provides simple API for success, error, warning, and info toasts.
 * 
 * Features:
 * - Multiple notification types (success, error, warning, info)
 * - Auto-dismiss with configurable duration
 * - Queue management for multiple toasts
 * - Action buttons support
 * - Position configuration
 * 
 * @service
 */

import { type AlertColor } from '@mui/material';
import { EventEmitter } from 'events';

/**
 * Toast notification configuration
 */
export interface ToastNotification {
  /**
   * Unique identifier for the toast
   */
  id: string;

  /**
   * Toast message
   */
  message: string;

  /**
   * Toast type/severity
   */
  type: AlertColor;

  /**
   * Auto-hide duration in milliseconds
   * Set to null to disable auto-hide
   * @default 6000
   */
  autoHideDuration?: number | null;

  /**
   * Optional action button config
   */
  action?: {
    label: string;
    onClick: () => void;
  };

  /**
   * Callback when toast is closed
   */
  onClose?: () => void;
}

/**
 * Toast position on screen
 */
export type ToastPosition = {
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
};

/**
 * Default toast configuration
 */
const DEFAULT_TOAST_CONFIG = {
  autoHideDuration: 6000,
  position: {
    vertical: 'top' as const,
    horizontal: 'right' as const,
  },
};

/**
 * Toast Notification Service
 * 
 * Singleton service for managing toast notifications.
 * Uses EventEmitter pattern for React component integration.
 * 
 * @example
 * ```ts
 * // Show success toast
 * ToastService.success('Password reset successful');
 * 
 * // Show error with custom duration
 * ToastService.error('Failed to reset password', { 
 *   autoHideDuration: 10000 
 * });
 * 
 * // Show toast with action button
 * ToastService.info('New update available', {
 *   action: {
 *     label: 'Refresh',
 *     onClick: () => window.location.reload()
 *   }
 * });
 * ```
 */
class ToastNotificationService extends EventEmitter {
  private toastQueue: ToastNotification[] = [];
  private toastCounter = 0;

  /**
   * Show a success toast notification
   * 
   * @param message - Toast message
   * @param options - Optional configuration
   */
  success(
    message: string,
    options?: Partial<Omit<ToastNotification, 'id' | 'message' | 'type'>>
  ): string {
    return this.show(message, 'success', options);
  }

  /**
   * Show an error toast notification
   * 
   * @param message - Toast message
   * @param options - Optional configuration
   */
  error(
    message: string,
    options?: Partial<Omit<ToastNotification, 'id' | 'message' | 'type'>>
  ): string {
    return this.show(message, 'error', options);
  }

  /**
   * Show a warning toast notification
   * 
   * @param message - Toast message
   * @param options - Optional configuration
   */
  warning(
    message: string,
    options?: Partial<Omit<ToastNotification, 'id' | 'message' | 'type'>>
  ): string {
    return this.show(message, 'warning', options);
  }

  /**
   * Show an info toast notification
   * 
   * @param message - Toast message
   * @param options - Optional configuration
   */
  info(
    message: string,
    options?: Partial<Omit<ToastNotification, 'id' | 'message' | 'type'>>
  ): string {
    return this.show(message, 'info', options);
  }

  /**
   * Show a toast notification
   * 
   * @param message - Toast message
   * @param type - Toast type
   * @param options - Optional configuration
   * @returns Toast ID
   */
  show(
    message: string,
    type: AlertColor,
    options?: Partial<Omit<ToastNotification, 'id' | 'message' | 'type'>>
  ): string {
    const id = `toast-${++this.toastCounter}`;

    const toast: ToastNotification = {
      id,
      message,
      type,
      autoHideDuration: options?.autoHideDuration ?? DEFAULT_TOAST_CONFIG.autoHideDuration,
      action: options?.action,
      onClose: options?.onClose,
    };

    this.toastQueue.push(toast);
    this.emit('show', toast);

    return id;
  }

  /**
   * Close a specific toast by ID
   * 
   * @param id - Toast ID to close
   */
  close(id: string): void {
    const index = this.toastQueue.findIndex((t) => t.id === id);
    if (index !== -1) {
      const [toast] = this.toastQueue.splice(index, 1);
      this.emit('close', id);
      toast.onClose?.();
    }
  }

  /**
   * Close all active toasts
   */
  closeAll(): void {
    const ids = [...this.toastQueue.map((t) => t.id)];
    ids.forEach((id) => this.close(id));
  }

  /**
   * Subscribe to toast events
   * 
   * @param event - Event name ('show' | 'close')
   * @param listener - Event handler
   * @returns Unsubscribe function
   */
  subscribe(event: 'show' | 'close', listener: (data: unknown) => void): () => void {
    this.on(event, listener);
    return () => this.off(event, listener);
  }

  /**
   * Get current toast queue
   * 
   * @returns Array of active toasts
   */
  getQueue(): ToastNotification[] {
    return [...this.toastQueue];
  }
}

/**
 * Singleton instance of ToastNotificationService
 */
export const ToastService = new ToastNotificationService();

/**
 * Helper function for success toasts
 * 
 * @param message - Toast message
 * @param options - Optional configuration
 * @returns Toast ID
 */
export const showSuccessToast = (
  message: string,
  options?: Partial<Omit<ToastNotification, 'id' | 'message' | 'type'>>
): string => ToastService.success(message, options);

/**
 * Helper function for error toasts
 * 
 * @param message - Toast message
 * @param options - Optional configuration
 * @returns Toast ID
 */
export const showErrorToast = (
  message: string,
  options?: Partial<Omit<ToastNotification, 'id' | 'message' | 'type'>>
): string => ToastService.error(message, options);

/**
 * Helper function for warning toasts
 * 
 * @param message - Toast message
 * @param options - Optional configuration
 * @returns Toast ID
 */
export const showWarningToast = (
  message: string,
  options?: Partial<Omit<ToastNotification, 'id' | 'message' | 'type'>>
): string => ToastService.warning(message, options);

/**
 * Helper function for info toasts
 * 
 * @param message - Toast message
 * @param options - Optional configuration
 * @returns Toast ID
 */
export const showInfoToast = (
  message: string,
  options?: Partial<Omit<ToastNotification, 'id' | 'message' | 'type'>>
): string => ToastService.info(message, options);

export default ToastService;
