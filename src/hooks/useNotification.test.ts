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
import { renderHook, act } from '@testing-library/react';
import { useNotification } from './useNotification';

describe('useNotification', () => {
  it('should initialize with closed state', () => {
    const { result } = renderHook(() => useNotification());
    const [notification] = result.current;

    expect(notification.open).toBe(false);
    expect(notification.message).toBe('');
    expect(notification.severity).toBe('info');
  });

  it('should show notification with default severity (info)', () => {
    const { result } = renderHook(() => useNotification());
    const [, actions] = result.current;

    act(() => {
      actions.showNotification('Test message');
    });

    const [notification] = result.current;
    expect(notification.open).toBe(true);
    expect(notification.message).toBe('Test message');
    expect(notification.severity).toBe('info');
  });

  it('should show notification with custom severity', () => {
    const { result } = renderHook(() => useNotification());
    const [, actions] = result.current;

    act(() => {
      actions.showNotification('Error occurred', 'error');
    });

    const [notification] = result.current;
    expect(notification.open).toBe(true);
    expect(notification.message).toBe('Error occurred');
    expect(notification.severity).toBe('error');
  });

  it('should show success notification', () => {
    const { result } = renderHook(() => useNotification());
    const [, actions] = result.current;

    act(() => {
      actions.showSuccess('Operation successful');
    });

    const [notification] = result.current;
    expect(notification.open).toBe(true);
    expect(notification.message).toBe('Operation successful');
    expect(notification.severity).toBe('success');
  });

  it('should show error notification', () => {
    const { result } = renderHook(() => useNotification());
    const [, actions] = result.current;

    act(() => {
      actions.showError('Operation failed');
    });

    const [notification] = result.current;
    expect(notification.open).toBe(true);
    expect(notification.message).toBe('Operation failed');
    expect(notification.severity).toBe('error');
  });

  it('should show warning notification', () => {
    const { result } = renderHook(() => useNotification());
    const [, actions] = result.current;

    act(() => {
      actions.showWarning('Please be careful');
    });

    const [notification] = result.current;
    expect(notification.open).toBe(true);
    expect(notification.message).toBe('Please be careful');
    expect(notification.severity).toBe('warning');
  });

  it('should show info notification', () => {
    const { result } = renderHook(() => useNotification());
    const [, actions] = result.current;

    act(() => {
      actions.showInfo('FYI: Something happened');
    });

    const [notification] = result.current;
    expect(notification.open).toBe(true);
    expect(notification.message).toBe('FYI: Something happened');
    expect(notification.severity).toBe('info');
  });

  it('should hide notification', () => {
    const { result } = renderHook(() => useNotification());
    const [, actions] = result.current;

    // Show notification first
    act(() => {
      actions.showSuccess('Test message');
    });

    let [notification] = result.current;
    expect(notification.open).toBe(true);

    // Hide notification
    act(() => {
      actions.hideNotification();
    });

    [notification] = result.current;
    expect(notification.open).toBe(false);
    // Message and severity should remain (for animations)
    expect(notification.message).toBe('Test message');
    expect(notification.severity).toBe('success');
  });

  it('should handle multiple sequential notifications', () => {
    const { result } = renderHook(() => useNotification());
    const [, actions] = result.current;

    act(() => {
      actions.showInfo('First message');
    });
    let [notification] = result.current;
    expect(notification.message).toBe('First message');
    expect(notification.severity).toBe('info');

    act(() => {
      actions.showSuccess('Second message');
    });
    [notification] = result.current;
    expect(notification.message).toBe('Second message');
    expect(notification.severity).toBe('success');

    act(() => {
      actions.showError('Third message');
    });
    [notification] = result.current;
    expect(notification.message).toBe('Third message');
    expect(notification.severity).toBe('error');
  });

  it('should maintain referential stability of action functions', () => {
    const { result, rerender } = renderHook(() => useNotification());
    const [, initialActions] = result.current;

    rerender();
    const [, rerenderedActions] = result.current;

    expect(initialActions.showNotification).toBe(rerenderedActions.showNotification);
    expect(initialActions.showSuccess).toBe(rerenderedActions.showSuccess);
    expect(initialActions.showError).toBe(rerenderedActions.showError);
    expect(initialActions.showWarning).toBe(rerenderedActions.showWarning);
    expect(initialActions.showInfo).toBe(rerenderedActions.showInfo);
    expect(initialActions.hideNotification).toBe(rerenderedActions.hideNotification);
  });

  it('should handle empty message', () => {
    const { result } = renderHook(() => useNotification());
    const [, actions] = result.current;

    act(() => {
      actions.showError('');
    });

    const [notification] = result.current;
    expect(notification.open).toBe(true);
    expect(notification.message).toBe('');
    expect(notification.severity).toBe('error');
  });

  it('should handle long message', () => {
    const { result } = renderHook(() => useNotification());
    const [, actions] = result.current;

    const longMessage = 'A'.repeat(1000);
    act(() => {
      actions.showInfo(longMessage);
    });

    const [notification] = result.current;
    expect(notification.open).toBe(true);
    expect(notification.message).toBe(longMessage);
  });

  it('should integrate with MUI Snackbar pattern', () => {
    const { result } = renderHook(() => useNotification());
    const [notification, actions] = result.current;

    // Simulate typical MUI Snackbar usage
    expect(notification.open).toBe(false);

    // User action triggers notification
    act(() => {
      actions.showSuccess('User created successfully');
    });

    const [updatedNotification] = result.current;
    expect(updatedNotification.open).toBe(true);
    expect(updatedNotification.message).toBe('User created successfully');
    expect(updatedNotification.severity).toBe('success');

    // Snackbar auto-hide or user closes
    act(() => {
      actions.hideNotification();
    });

    const [finalNotification] = result.current;
    expect(finalNotification.open).toBe(false);
  });
});
