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
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './Dashboard';
import { DashboardService } from '../../services/dashboardService';

jest.mock('../../services/dashboardService', () => ({
  DashboardService: {
    getDashboardStats: jest.fn(),
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
  recentActivity: [
    {
      id: '1',
      type: 'User Created',
      description: 'New user test@example.com created',
      user: 'Admin',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'Account Updated',
      description: 'Account ACME updated',
      user: 'Manager',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      type: 'Mapping Created',
      description: 'User mapped to account',
      user: 'System',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: '4',
      type: 'Federated Login',
      description: 'Federated user logged in',
      user: 'SSO',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
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
    (DashboardService.getDashboardStats as jest.Mock).mockResolvedValue({
      success: true,
      data: mockDashboardStats,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
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
    (DashboardService.getDashboardStats as jest.Mock).mockResolvedValue({
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

  it('displays user status distribution percentages', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getAllByText('80.0%').length).toBeGreaterThan(0);
      expect(screen.getByText('15.0%')).toBeInTheDocument();
      expect(screen.getByText('5.0%')).toBeInTheDocument();
    });
  });

  it('displays recent activity items', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('New user test@example.com created')).toBeInTheDocument();
      expect(screen.getByText('Account ACME updated')).toBeInTheDocument();
      expect(screen.getByText('User mapped to account')).toBeInTheDocument();
      expect(screen.getByText('Federated user logged in')).toBeInTheDocument();
    });
  });

  it('displays activity user names', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('By Admin')).toBeInTheDocument();
      expect(screen.getByText('By Manager')).toBeInTheDocument();
      expect(screen.getByText('By System')).toBeInTheDocument();
    });
  });

  it('displays all stat card values', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('120')).toBeInTheDocument(); // userAccountMappings
      expect(screen.getByText('20')).toBeInTheDocument();  // totalScopes
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('Pending Users')).toBeInTheDocument();
      expect(screen.getByText('Total Accounts')).toBeInTheDocument();
    });
  });

  it('displays secondary stat cards', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('User-Account Mappings')).toBeInTheDocument();
      expect(screen.getByText('External Users')).toBeInTheDocument();
      expect(screen.getByText('Federated Users')).toBeInTheDocument();
      expect(screen.getByText('Total Roles')).toBeInTheDocument();
    });
  });

  it('displays overview section with accounts and scopes', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('User Management Overview')).toBeInTheDocument();
      expect(screen.getByText('Active Accounts')).toBeInTheDocument();
      expect(screen.getByText('Pending Accounts')).toBeInTheDocument();
      expect(screen.getByText('Total Scopes')).toBeInTheDocument();
      expect(screen.getByText('Blocked Users')).toBeInTheDocument();
    });
  });

  it('displays special user type chips', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('External: 10')).toBeInTheDocument();
      expect(screen.getByText('Federated: 5')).toBeInTheDocument();
    });
  });

  it('displays User Status Distribution section', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('User Status Distribution')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Blocked')).toBeInTheDocument();
    });
  });

  it('displays Recent Activity section header', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('Live')).toBeInTheDocument();
    });
  });

  it('displays welcome description text', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText(/Welcome to UIDAM Admin Portal/)).toBeInTheDocument();
    });
  });

  it('handles refresh button click', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Welcome to UIDAM Admin Portal - Monitor your identity and access management system')).toBeInTheDocument();
    });
    // Click the refresh button (the one in header area)
    const refreshButtons = screen.getAllByRole('button');
    fireEvent.click(refreshButtons[0]);
    // Should trigger a refetch
    await waitFor(() => {
      expect(DashboardService.getDashboardStats).toHaveBeenCalledTimes(2);
    });
  });

  it('shows error alert with refresh button when API fails', async () => {
    (DashboardService.getDashboardStats as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Server unavailable',
    });

    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Server unavailable')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('shows generic error message when error is not an Error instance', async () => {
    (DashboardService.getDashboardStats as jest.Mock).mockResolvedValue({
      success: false,
    });

    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch dashboard statistics')).toBeInTheDocument();
    });
  });

  it('displays relative time for recent activities', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      // Fourth activity is 1 day old, should show "1 days ago"
      expect(screen.getByText('1 days ago')).toBeInTheDocument();
    });
  });

  it('displays User Activity Rate section', async () => {
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('User Activity Rate')).toBeInTheDocument();
      expect(screen.getByText('Percentage of active users')).toBeInTheDocument();
    });
  });

  it('handles empty recentActivity array', async () => {
    (DashboardService.getDashboardStats as jest.Mock).mockResolvedValue({
      success: true,
      data: { ...mockDashboardStats, recentActivity: [] },
    });
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });

  it('handles activity with empty timestamp', async () => {
    (DashboardService.getDashboardStats as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        ...mockDashboardStats,
        recentActivity: [
          { id: '10', type: 'Test', description: 'Empty timestamp event', user: 'Bot', timestamp: '' },
        ],
      },
    });
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Empty timestamp event')).toBeInTheDocument();
    });
  });

  it('handles activity with invalid timestamp', async () => {
    (DashboardService.getDashboardStats as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        ...mockDashboardStats,
        recentActivity: [
          { id: '11', type: 'Associate User', description: 'Invalid ts event', user: 'Bot', timestamp: 'not-a-date' },
        ],
      },
    });
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Invalid ts event')).toBeInTheDocument();
    });
  });

  it('handles activity with recent timestamp showing minutes ago', async () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
    (DashboardService.getDashboardStats as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        ...mockDashboardStats,
        recentActivity: [
          { id: '12', type: 'User Created', description: 'Minutes ago event', user: 'Admin', timestamp: fiveMinAgo },
        ],
      },
    });
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('5 minutes ago')).toBeInTheDocument();
    });
  });

  it('handles activity with just-now timestamp', async () => {
    const justNow = new Date().toISOString();
    (DashboardService.getDashboardStats as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        ...mockDashboardStats,
        recentActivity: [
          { id: '13', type: 'User Created', description: 'Just happened', user: 'Admin', timestamp: justNow },
        ],
      },
    });
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Just now')).toBeInTheDocument();
    });
  });

  it('handles activity with hours-ago timestamp', async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString();
    (DashboardService.getDashboardStats as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        ...mockDashboardStats,
        recentActivity: [
          { id: '14', type: 'Account Deleted', description: 'Hours ago event', user: 'Admin', timestamp: twoHoursAgo },
        ],
      },
    });
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    });
  });

  it('handles zero totalUsers gracefully for percentage display', async () => {
    (DashboardService.getDashboardStats as jest.Mock).mockResolvedValue({
      success: true,
      data: { ...mockDashboardStats, totalUsers: 0, activeUsers: 0, pendingUsers: 0, blockedUsers: 0 },
    });
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('User Status Distribution')).toBeInTheDocument();
    });
  });

  it('renders with partial stats data using fallback values', async () => {
    (DashboardService.getDashboardStats as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        totalUsers: undefined,
        activeUsers: undefined,
        pendingUsers: undefined,
        blockedUsers: undefined,
        totalAccounts: undefined,
        activeAccounts: undefined,
        pendingAccounts: undefined,
        totalRoles: undefined,
        totalScopes: undefined,
        externalUsers: undefined,
        federatedUsers: undefined,
        userAccountMappings: undefined,
        recentActivity: [],
      },
    });
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Active Users')).toBeInTheDocument();
    });
  });

  it('handles error refresh button click in error state', async () => {
    (DashboardService.getDashboardStats as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Connection refused',
    });
    render(<Dashboard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Connection refused')).toBeInTheDocument();
    });
    // Click the refresh button inside the alert
    const button = screen.getByRole('button');
    fireEvent.click(button);
    await waitFor(() => {
      expect(DashboardService.getDashboardStats).toHaveBeenCalledTimes(2);
    });
  });
});
