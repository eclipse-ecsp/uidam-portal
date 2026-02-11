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
/**
 * Tests for usePasswordRecoveryMutation hook
 * Covers success, 401, 404, and 500 error flows
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { usePasswordRecoveryMutation } from '../hooks/usePasswordRecoveryMutation';
import UserService from '@services/userService';

// Mock the UserService
jest.mock('@services/userService');

// Mock logger
jest.mock('@utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    logPasswordRecoveryEvent: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePasswordRecoveryMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle successful password recovery', async () => {
    const mockResponse = {
      success: true,
      data: { message: 'Password recovery email sent successfully' },
      status: 200,
    };

    (UserService.postSelfRecoveryForgotPassword as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePasswordRecoveryMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockResponse.data);
    expect(UserService.postSelfRecoveryForgotPassword).toHaveBeenCalledTimes(1);
  });

  it('should handle 401 unauthorized error', async () => {
    const mockResponse = {
      success: false,
      error: 'Unauthorized',
      status: 401,
    };

    (UserService.postSelfRecoveryForgotPassword as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePasswordRecoveryMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toMatchObject({
      message: 'Unauthorized',
      status: 401,
    });
  });

  it('should handle 404 user not found error', async () => {
    const mockResponse = {
      success: false,
      error: 'User not found',
      status: 404,
    };

    (UserService.postSelfRecoveryForgotPassword as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePasswordRecoveryMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toMatchObject({
      message: 'User not found',
      status: 404,
    });
  });

  it('should handle 500 server error', async () => {
    const mockResponse = {
      success: false,
      error: 'Internal server error',
      status: 500,
    };

    (UserService.postSelfRecoveryForgotPassword as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePasswordRecoveryMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toMatchObject({
      message: 'Internal server error',
      status: 500,
    });
  });

  it('should not retry on failure', async () => {
    const mockResponse = {
      success: false,
      error: 'Service unavailable',
      status: 503,
    };

    (UserService.postSelfRecoveryForgotPassword as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePasswordRecoveryMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Verify it was only called once (no retries)
    expect(UserService.postSelfRecoveryForgotPassword).toHaveBeenCalledTimes(1);
  });

  it('should handle missing response data', async () => {
    const mockResponse = {
      success: true,
      data: undefined,
      status: 200,
    };

    (UserService.postSelfRecoveryForgotPassword as jest.Mock).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePasswordRecoveryMutation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toMatchObject({
      message: 'No response data received',
    });
  });
});
