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
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { authSlice } from '../../store/slices/authSlice';
import { authService } from '../../services/auth.service';

// Mock runtime config so OAUTH_CONFIG.TOKEN_STORAGE_KEY resolves to a known value
jest.mock('@config/runtimeConfig', () => ({
  getConfig: jest.fn(() => ({
    REACT_APP_TOKEN_STORAGE_KEY: 'uidam_admin_token',
    REACT_APP_REFRESH_TOKEN_STORAGE_KEY: 'uidam_admin_refresh_token',
  })),
  loadRuntimeConfig: jest.fn(),
  loadConfig: jest.fn(),
}));

jest.mock('../../services/auth.service', () => ({
  authService: {
    initiateLogin: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockInitiateLogin = authService.initiateLogin as jest.Mock;

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
    },
    preloadedState: {
      auth: {
        isAuthenticated: false,
        user: null,
        token: null,
        tokens: null,
        isLoading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

const renderLogin = (store: ReturnType<typeof createMockStore>) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/login']}>
        <Login />
      </MemoryRouter>
    </Provider>
  );

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear URL params
    window.history.pushState({}, '', '/login');
  });

  describe('Rendering', () => {
    it('renders login page with title', () => {
      const store = createMockStore();
      renderLogin(store);

      expect(screen.getByText('UIDAM Admin Portal')).toBeInTheDocument();
    });

    it('renders authorization server description', () => {
      const store = createMockStore();
      renderLogin(store);

      expect(screen.getByText(/Secure access via UIDAM Authorization Server/i)).toBeInTheDocument();
    });

    it('renders sign in button', () => {
      const store = createMockStore();
      renderLogin(store);

      expect(screen.getByRole('button', { name: /Sign In with UIDAM/i })).toBeInTheDocument();
    });

    it('renders instruction text', () => {
      const store = createMockStore();
      renderLogin(store);

      expect(screen.getByText(/Click the button below to sign in/i)).toBeInTheDocument();
    });
  });

  describe('Login Flow', () => {
    it('calls authService.initiateLogin when sign in button is clicked', async () => {
      const store = createMockStore();
      mockInitiateLogin.mockResolvedValueOnce(undefined);

      renderLogin(store);

      const signInButton = screen.getByRole('button', { name: /Sign In with UIDAM/i });
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(mockInitiateLogin).toHaveBeenCalledTimes(1);
      });
    });

    it('shows loading state when login is in progress', () => {
      const store = createMockStore({ isLoading: true });
      renderLogin(store);

      expect(screen.getByText('Redirecting...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('disables button during loading', () => {
      const store = createMockStore({ isLoading: true });
      renderLogin(store);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('handles login failure', async () => {
      const store = createMockStore();
      const errorMessage = 'Login failed';
      mockInitiateLogin.mockRejectedValueOnce(new Error(errorMessage));

      renderLogin(store);

      const signInButton = screen.getByRole('button', { name: /Sign In with UIDAM/i });
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(mockInitiateLogin).toHaveBeenCalled();
      });
    });

    it('handles non-Error exceptions', async () => {
      const store = createMockStore();
      mockInitiateLogin.mockRejectedValueOnce('String error');

      renderLogin(store);

      const signInButton = screen.getByRole('button', { name: /Sign In with UIDAM/i });
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(mockInitiateLogin).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling from URL', () => {
    it('displays error from URL query parameters', () => {
      window.history.pushState({}, '', '/login?error=access_denied');
      const store = createMockStore();

      renderLogin(store);

      expect(screen.getByText('access_denied')).toBeInTheDocument();
    });

    it('displays error description from URL', () => {
      window.history.pushState({}, '', '/login?error=invalid_request&error_description=Missing+parameter');
      const store = createMockStore();

      renderLogin(store);

      expect(screen.getByText('Missing parameter')).toBeInTheDocument();
    });

    it('prefers error_description over error code', () => {
      window.history.pushState({}, '', '/login?error=error_code&error_description=Detailed+error+message');
      const store = createMockStore();

      renderLogin(store);

      expect(screen.getByText('Detailed error message')).toBeInTheDocument();
      expect(screen.queryByText('error_code')).not.toBeInTheDocument();
    });

    it('does not display error alert when no error in URL', () => {
      window.history.pushState({}, '', '/login');
      const store = createMockStore();

      renderLogin(store);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Error Display from Store', () => {
    it('displays error from Redux store', () => {
      const store = createMockStore({ error: 'Authentication failed' });

      renderLogin(store);

      expect(screen.getByText('Authentication failed')).toBeInTheDocument();
    });

    it('shows error alert with severity', () => {
      const store = createMockStore({ error: 'Test error' });

      renderLogin(store);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('UI States', () => {
    it('shows login icon when not loading', () => {
      const store = createMockStore();
      const { container } = renderLogin(store);

      expect(container.querySelector('[data-testid="LoginIcon"]')).toBeInTheDocument();
    });

    it('shows progress indicator when loading', () => {
      const store = createMockStore({ isLoading: true });
      renderLogin(store);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('applies gradient background', () => {
      const store = createMockStore();
      const { container } = renderLogin(store);

      const box = container.firstChild as HTMLElement;
      expect(box).toHaveStyle({ minHeight: '100vh' });
    });
  });

  describe('Accessibility', () => {
    it('button has appropriate role and name', () => {
      const store = createMockStore();
      renderLogin(store);

      const button = screen.getByRole('button', { name: /Sign In with UIDAM/i });
      expect(button).toBeInTheDocument();
    });

    it('error alert is accessible', () => {
      const store = createMockStore({ error: 'Error message' });
      renderLogin(store);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Error message');
    });
  });

  describe('Cross-Tab Auth Sync', () => {
    it('redirects to dashboard immediately when already authenticated', () => {
      const store = createMockStore({ isAuthenticated: true });
      renderLogin(store);

      expect(mockNavigate).toHaveBeenCalledWith('/uidam/dashboard', { replace: true });
    });

    it('does not redirect when not authenticated', () => {
      const store = createMockStore();
      renderLogin(store);

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('redirects to dashboard when another tab logs in (storage event with new token)', async () => {
      const store = createMockStore();
      renderLogin(store);

      await act(async () => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'uidam_admin_token',
            newValue: 'new-access-token',
            storageArea: localStorage,
          })
        );
      });

      expect(mockNavigate).toHaveBeenCalledWith('/uidam/dashboard', { replace: true });
    });

    it('does not redirect when another tab removes the token (logout event)', async () => {
      const store = createMockStore();
      renderLogin(store);

      await act(async () => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'uidam_admin_token',
            newValue: null,
            storageArea: localStorage,
          })
        );
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('ignores storage events for unrelated keys', async () => {
      const store = createMockStore();
      renderLogin(store);

      await act(async () => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'some_other_key',
            newValue: 'some-value',
            storageArea: localStorage,
          })
        );
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
