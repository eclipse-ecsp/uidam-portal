/********************************************************************************
* Copyright (c) 2025 Harman International
*
* <p>Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* <p>http://www.apache.org/licenses/LICENSE-2.0  
*
* <p> Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* <p>SPDX-License-Identifier: Apache-2.0
********************************************************************************/
import { useState, useCallback } from 'react';

/**
 * Notification severity levels matching MUI Alert
 */
export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification state
 */
export interface Notification {
  open: boolean;
  message: string;
  severity: NotificationSeverity;
}

/**
 * Notification actions returned by the hook
 */
export interface NotificationActions {
  showNotification: (message: string, severity?: NotificationSeverity) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  hideNotification: () => void;
}

/**
 * Custom hook for managing application notifications (MUI Snackbar wrapper)
 * Provides a simple API for showing success, error, warning, and info messages
 * 
 * @returns {[Notification, NotificationActions]} Tuple of notification state and actions
 * 
 * @example
 * const [notification, { showSuccess, showError, hideNotification }] = useNotification();
 * 
 * // Show notifications
 * showSuccess('User created successfully');
 * showError('Failed to create user');
 * 
 * // Use in Snackbar
 * <Snackbar open={notification.open} onClose={hideNotification}>
 *   <Alert severity={notification.severity}>{notification.message}</Alert>
 * </Snackbar>
 */
export function useNotification(): [Notification, NotificationActions] {
  const [notification, setNotification] = useState<Notification>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showNotification = useCallback(
    (message: string, severity: NotificationSeverity = 'info') => {
      setNotification({
        open: true,
        message,
        severity,
      });
    },
    []
  );

  const showSuccess = useCallback((message: string) => {
    showNotification(message, 'success');
  }, [showNotification]);

  const showError = useCallback((message: string) => {
    showNotification(message, 'error');
  }, [showNotification]);

  const showWarning = useCallback((message: string) => {
    showNotification(message, 'warning');
  }, [showNotification]);

  const showInfo = useCallback((message: string) => {
    showNotification(message, 'info');
  }, [showNotification]);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  const actions: NotificationActions = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification,
  };

  return [notification, actions];
}
