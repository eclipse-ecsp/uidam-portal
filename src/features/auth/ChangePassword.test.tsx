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

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChangePassword } from './ChangePassword';
import { UserService } from '@services/userService';

jest.mock('@services/userService');
const mockUserService = UserService as jest.Mocked<typeof UserService>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ChangePassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render change password page', () => {
    render(
      <BrowserRouter>
        <ChangePassword />
      </BrowserRouter>
    );

    expect(screen.getByText('Change Password')).toBeInTheDocument();
    expect(screen.getByText(/Secure your account/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Request Password Reset/i })).toBeInTheDocument();
  });

  it('should call API and show success message on button click', async () => {
    mockUserService.requestPasswordReset.mockResolvedValueOnce({
      code: 'SUCCESS',
      message: 'Password reset email sent'
    });

    render(
      <BrowserRouter>
        <ChangePassword />
      </BrowserRouter>
    );

    const resetButton = screen.getByRole('button', { name: /Request Password Reset/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(mockUserService.requestPasswordReset).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText(/Password reset initiated successfully!/i)).toBeInTheDocument();
    expect(screen.getByText(/check your inbox/i)).toBeInTheDocument();
  });

  it('should show error message if API fails', async () => {
    mockUserService.requestPasswordReset.mockRejectedValueOnce(
      new Error('Failed to initiate password reset')
    );

    render(
      <BrowserRouter>
        <ChangePassword />
      </BrowserRouter>
    );

    const resetButton = screen.getByRole('button', { name: /Request Password Reset/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to initiate password reset/i)).toBeInTheDocument();
    });
  });

  it('should navigate back to profile on cancel', () => {
    render(
      <BrowserRouter>
        <ChangePassword />
      </BrowserRouter>
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('should show loading state during API call', async () => {
    mockUserService.requestPasswordReset.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ code: 'SUCCESS' }), 100))
    );

    render(
      <BrowserRouter>
        <ChangePassword />
      </BrowserRouter>
    );

    const resetButton = screen.getByRole('button', { name: /Request Password Reset/i });
    fireEvent.click(resetButton);

    expect(screen.getByText(/Sending Reset Link.../i)).toBeInTheDocument();
    expect(resetButton).toBeDisabled();
  });

  it('should disable cancel button during loading', async () => {
    mockUserService.requestPasswordReset.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ code: 'SUCCESS' }), 100))
    );

    render(
      <BrowserRouter>
        <ChangePassword />
      </BrowserRouter>
    );

    const resetButton = screen.getByRole('button', { name: /Request Password Reset/i });
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    
    fireEvent.click(resetButton);

    expect(cancelButton).toBeDisabled();
  });

  it('should show back to profile button after success', async () => {
    mockUserService.requestPasswordReset.mockResolvedValueOnce({
      code: 'SUCCESS',
      message: 'Password reset email sent'
    });

    render(
      <BrowserRouter>
        <ChangePassword />
      </BrowserRouter>
    );

    const resetButton = screen.getByRole('button', { name: /Request Password Reset/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Back to Profile/i })).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /Back to Profile/i });
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('should handle rate limit error', async () => {
    mockUserService.requestPasswordReset.mockRejectedValueOnce(
      new Error('Too many password reset requests. Please try again later.')
    );

    render(
      <BrowserRouter>
        <ChangePassword />
      </BrowserRouter>
    );

    const resetButton = screen.getByRole('button', { name: /Request Password Reset/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText(/Too many password reset requests/i)).toBeInTheDocument();
    });
  });
});
