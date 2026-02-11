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
 * Tests for PasswordRecoveryCard component
 * Validates interaction flows and snackbar messaging
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PasswordRecoveryCard from '../components/PasswordRecoveryCard';
import { authSlice } from '@store/slices/authSlice';
import UserService from '@services/userService';

// Mock UserService
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

const createMockStore = (authState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
    },
    preloadedState: {
      auth: {
        user: {
          id: '1',
          userName: 'testuser',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          roles: [],
          scopes: [],
          accounts: [],
        },
        tokens: null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        ...authState,
      },
    },
  });
};

const createWrapper = (store: ReturnType<typeof createMockStore>) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
};

describe('PasswordRecoveryCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render card with title and CTA button', () => {
    const store = createMockStore();
    const Wrapper = createWrapper(store);

    render(
      <Wrapper>
        <PasswordRecoveryCard />
      </Wrapper>
    );

    expect(screen.getByText('Password Recovery')).toBeInTheDocument();
    expect(screen.getByText(/Initiate a password reset for your account/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
  });

  it('should open dialog when CTA is clicked', () => {
    const store = createMockStore();
    const Wrapper = createWrapper(store);

    render(
      <Wrapper>
        <PasswordRecoveryCard />
      </Wrapper>
    );

    const button = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(button);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
  });

  it('should show success snackbar after successful recovery', async () => {
    const mockResponse = {
      success: true,
      data: { message: 'Password recovery email sent successfully' },
      status: 200,
    };

    (UserService.postSelfRecoveryForgotPassword as jest.Mock).mockResolvedValue(mockResponse);

    const store = createMockStore();
    const Wrapper = createWrapper(store);

    render(
      <Wrapper>
        <PasswordRecoveryCard />
      </Wrapper>
    );

    // Open dialog
    const openButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(openButton);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    fireEvent.click(submitButton);

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Password recovery email sent successfully/i)).toBeInTheDocument();
    });
  });

  it('should show error snackbar on 401 unauthorized', async () => {
    const mockResponse = {
      success: false,
      error: 'Unauthorized',
      status: 401,
    };

    (UserService.postSelfRecoveryForgotPassword as jest.Mock).mockResolvedValue(mockResponse);

    const store = createMockStore();
    const Wrapper = createWrapper(store);

    render(
      <Wrapper>
        <PasswordRecoveryCard />
      </Wrapper>
    );

    // Open dialog
    const openButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(openButton);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    fireEvent.click(submitButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Your session has expired/i)).toBeInTheDocument();
    });
  });

  it('should show error snackbar on 404 user not found', async () => {
    const mockResponse = {
      success: false,
      error: 'User not found',
      status: 404,
    };

    (UserService.postSelfRecoveryForgotPassword as jest.Mock).mockResolvedValue(mockResponse);

    const store = createMockStore();
    const Wrapper = createWrapper(store);

    render(
      <Wrapper>
        <PasswordRecoveryCard />
      </Wrapper>
    );

    // Open dialog
    const openButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(openButton);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    fireEvent.click(submitButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/User account not found/i)).toBeInTheDocument();
    });
  });

  it('should show error snackbar on 500 server error', async () => {
    const mockResponse = {
      success: false,
      error: 'Internal server error',
      status: 500,
    };

    (UserService.postSelfRecoveryForgotPassword as jest.Mock).mockResolvedValue(mockResponse);

    const store = createMockStore();
    const Wrapper = createWrapper(store);

    render(
      <Wrapper>
        <PasswordRecoveryCard />
      </Wrapper>
    );

    // Open dialog
    const openButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(openButton);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    fireEvent.click(submitButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Server error occurred/i)).toBeInTheDocument();
    });
  });

  it('should call onRecoveryInitiated callback on success', async () => {
    const mockResponse = {
      success: true,
      data: { message: 'Password recovery email sent successfully' },
      status: 200,
    };

    (UserService.postSelfRecoveryForgotPassword as jest.Mock).mockResolvedValue(mockResponse);

    const onRecoveryInitiated = jest.fn();
    const store = createMockStore();
    const Wrapper = createWrapper(store);

    render(
      <Wrapper>
        <PasswordRecoveryCard onRecoveryInitiated={onRecoveryInitiated} />
      </Wrapper>
    );

    // Open dialog
    const openButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(openButton);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    fireEvent.click(submitButton);

    // Wait for callback
    await waitFor(() => {
      expect(onRecoveryInitiated).toHaveBeenCalled();
    }, { timeout: 1000 });
  });
});
