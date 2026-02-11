/**
 * ToastNotificationProvider Component
 * 
 * React context provider for toast notifications.
 * Integrates ToastService with Material-UI Snackbar components.
 * 
 * Features:
 * - Global toast notification system
 * - Queue management for multiple toasts
 * - Auto-dismiss with configurable duration
 * - Customizable position and styling
 * - Action buttons support
 * 
 * @component
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Snackbar, Alert, AlertTitle, Button, type AlertColor } from '@mui/material';
import { ToastService, type ToastNotification } from '@/services/toastService';

/**
 * Props for ToastNotificationProvider
 */
interface ToastNotificationProviderProps {
  /**
   * Child components
   */
  children: React.ReactNode;

  /**
   * Maximum number of toasts to display simultaneously
   * @default 3
   */
  maxToasts?: number;

  /**
   * Toast position on screen
   * @default { vertical: 'top', horizontal: 'right' }
   */
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };

  /**
   * Default auto-hide duration in milliseconds
   * @default 6000
   */
  autoHideDuration?: number;
}

/**
 * Toast Notification Provider Component
 * 
 * Wraps application with global toast notification system.
 * Listens to ToastService events and displays Snackbar notifications.
 * 
 * Usage:
 * 1. Wrap your app with this provider in App.tsx
 * 2. Call ToastService methods anywhere in your app
 * 
 * @example
 * ```tsx
 * // In App.tsx
 * <ToastNotificationProvider>
 *   <Router>
 *     <Routes />
 *   </Router>
 * </ToastNotificationProvider>
 * 
 * // In any component
 * ToastService.success('Operation successful!');
 * ```
 */
export const ToastNotificationProvider: React.FC<ToastNotificationProviderProps> = ({
  children,
  maxToasts = 3,
  anchorOrigin = { vertical: 'top', horizontal: 'right' },
  autoHideDuration = 6000,
}) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Subscribe to toast events
  useEffect(() => {
    const handleShowToast = (toast: ToastNotification) => {
      setToasts((prev) => {
        // Limit number of toasts
        const newToasts = [...prev, toast];
        if (newToasts.length > maxToasts) {
          // Remove oldest toast
          const removed = newToasts.shift();
          if (removed) {
            removed.onClose?.();
          }
        }
        return newToasts;
      });
    };

    const handleCloseToast = (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const unsubscribeShow = ToastService.subscribe('show', handleShowToast as (data: unknown) => void);
    const unsubscribeClose = ToastService.subscribe('close', handleCloseToast as (data: unknown) => void);

    return () => {
      unsubscribeShow();
      unsubscribeClose();
    };
  }, [maxToasts]);

  // Handle toast close
  const handleClose = useCallback((id: string, reason?: string) => {
    // Don't close on clickaway
    if (reason === 'clickaway') return;
    
    ToastService.close(id);
  }, []);

  return (
    <>
      {children}

      {/* Render toasts */}
      {toasts.map((toast, index) => (
        <Snackbar
          key={toast.id}
          open
          autoHideDuration={toast.autoHideDuration ?? autoHideDuration}
          onClose={(_, reason) => handleClose(toast.id, reason)}
          anchorOrigin={anchorOrigin}
          sx={{
            // Stack toasts vertically
            mt: index * 8,
          }}
        >
          <Alert
            severity={toast.type}
            variant="filled"
            onClose={() => handleClose(toast.id)}
            action={
              toast.action ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    toast.action?.onClick();
                    handleClose(toast.id);
                  }}
                >
                  {toast.action.label}
                </Button>
              ) : undefined
            }
            sx={{
              minWidth: 288,
              maxWidth: 568,
              boxShadow: 4,
            }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default ToastNotificationProvider;
