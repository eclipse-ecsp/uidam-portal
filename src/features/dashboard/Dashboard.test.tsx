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
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './Dashboard';
import { DashboardService } from '../../services/dashboardService';

vi.mock('../../services/dashboardService', () => ({
  DashboardService: {
    getDashboardStats: vi.fn(),
  },
}));

const mockDashboardStats = {
  totalUsers: 100,
  activeUsers: 80,
  pendingUsers: 15,
  blockedUsers: 5,
  totalAccounts: 10,
  activeAccounts: 8,
  pendingAccounts: 2,
  totalRoles: 5,
  totalScopes: 20,
  externalUsers: 10,
  federatedUsers: 5,
  userAccountMappings: 120,
  userStatusDistribution: {
    activePercentage: 80.0,
    pendingPercentage: 15.0,
    blockedPercentage: 5.0,
  },
  recentActivity: [
    {
      id: '1',
      type: 'User Created',
      description: 'New user test@example.com created',
      user: 'Admin',
      timestamp: new Date().toISOString(),
    },
  ],
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.mocked(DashboardService.getDashboardStats).mockResolvedValue({
      success: true,
      data: mockDashboardStats,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard component', () => {
    const { container } = render(<Dashboard />, { wrapper: createWrapper() });
    expect(container).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays dashboard title after loading', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('displays stat cards after loading', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument(); // totalUsers
      expect(screen.getByText('80')).toBeInTheDocument();  // activeUsers
    });
  });

  it('renders grid layout', async () => {
    const { container } = render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(container.querySelector('[class*="MuiGrid-container"]')).toBeInTheDocument();
    });
  });

  it('displays error state when API fails', async () => {
    vi.mocked(DashboardService.getDashboardStats).mockResolvedValue({
      success: false,
      error: 'Network error',
    });

    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('calls DashboardService.getDashboardStats on mount', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(DashboardService.getDashboardStats).toHaveBeenCalledTimes(1);
    });
  });
});
