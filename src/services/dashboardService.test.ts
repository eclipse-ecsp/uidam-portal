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
import { DashboardService, DashboardStatsResponse } from './dashboardService';
import { fetchWithTokenRefresh, handleApiResponse } from './apiUtils';

jest.mock('./apiUtils');

jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('../config/app.config', () => ({
  API_CONFIG: {
    API_BASE_URL: 'http://localhost:8080/api',
  },
}));

const mockFetchWithTokenRefresh = fetchWithTokenRefresh as jest.MockedFunction<typeof fetchWithTokenRefresh>;
const mockHandleApiResponse = handleApiResponse as jest.MockedFunction<typeof handleApiResponse>;

describe('DashboardService', () => {
  const mockStats: DashboardStatsResponse = {
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
        description: 'New user created',
        user: 'Admin',
        timestamp: '2025-01-01T00:00:00Z',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should fetch dashboard stats successfully', async () => {
      const mockResponse = { ok: true } as Response;
      mockFetchWithTokenRefresh.mockResolvedValueOnce(mockResponse);
      mockHandleApiResponse.mockResolvedValueOnce(mockStats);

      const result = await DashboardService.getDashboardStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStats);
      expect(mockFetchWithTokenRefresh).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/dashboard/stats',
        { method: 'GET' },
      );
      expect(mockHandleApiResponse).toHaveBeenCalledWith(mockResponse, 'Dashboard');
    });

    it('should return error when fetchWithTokenRefresh throws', async () => {
      mockFetchWithTokenRefresh.mockRejectedValueOnce(new Error('Network failure'));

      const result = await DashboardService.getDashboardStats();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network failure');
      expect(result.data).toBeUndefined();
    });

    it('should return error when handleApiResponse throws', async () => {
      const mockResponse = { ok: false, status: 500 } as Response;
      mockFetchWithTokenRefresh.mockResolvedValueOnce(mockResponse);
      mockHandleApiResponse.mockRejectedValueOnce(new Error('Internal Server Error'));

      const result = await DashboardService.getDashboardStats();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Internal Server Error');
    });

    it('should handle non-Error exceptions', async () => {
      mockFetchWithTokenRefresh.mockRejectedValueOnce('string error');

      const result = await DashboardService.getDashboardStats();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error fetching dashboard stats');
    });

    it('should return data with all expected fields', async () => {
      const mockResponse = { ok: true } as Response;
      mockFetchWithTokenRefresh.mockResolvedValueOnce(mockResponse);
      mockHandleApiResponse.mockResolvedValueOnce(mockStats);

      const result = await DashboardService.getDashboardStats();

      expect(result.data?.totalUsers).toBe(100);
      expect(result.data?.activeUsers).toBe(80);
      expect(result.data?.pendingUsers).toBe(15);
      expect(result.data?.blockedUsers).toBe(5);
      expect(result.data?.totalAccounts).toBe(10);
      expect(result.data?.activeAccounts).toBe(8);
      expect(result.data?.pendingAccounts).toBe(2);
      expect(result.data?.totalRoles).toBe(5);
      expect(result.data?.totalScopes).toBe(20);
      expect(result.data?.externalUsers).toBe(10);
      expect(result.data?.federatedUsers).toBe(5);
      expect(result.data?.userAccountMappings).toBe(120);
      expect(result.data?.userStatusDistribution.activePercentage).toBe(80.0);
      expect(result.data?.userStatusDistribution.pendingPercentage).toBe(15.0);
      expect(result.data?.userStatusDistribution.blockedPercentage).toBe(5.0);
      expect(result.data?.recentActivity).toHaveLength(1);
    });
  });
});
