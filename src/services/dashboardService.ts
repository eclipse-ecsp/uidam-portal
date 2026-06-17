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
// Dashboard Service
// API integration for UIDAM Dashboard Statistics

import { API_CONFIG } from '../config/app.config';
import { handleApiResponse, fetchWithTokenRefresh } from './apiUtils';
import { logger } from '../utils/logger';

/**
 * Recent activity item from user events.
 */
export interface RecentActivityItem {
  id: string;
  type: string;
  description: string;
  user: string;
  timestamp: string;
}

/**
 * Dashboard statistics response from GET /v1/dashboard/stats.
 */
export interface DashboardStatsResponse {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  blockedUsers: number;
  totalAccounts: number;
  activeAccounts: number;
  pendingAccounts: number;
  totalRoles: number;
  totalScopes: number;
  externalUsers: number;
  federatedUsers: number;
  userAccountMappings: number;
  recentActivity: RecentActivityItem[];
}

/**
 * Service class for fetching dashboard statistics.
 * Communicates with the UIDAM backend dashboard API.
 */
export class DashboardService {
  /**
   * Fetches aggregated dashboard statistics from the backend.
   * @returns Dashboard statistics including user counts, account counts, and recent activity.
   */
  static async getDashboardStats(): Promise<{ success: boolean; data?: DashboardStatsResponse; error?: string }> {
    try {
      const response = await fetchWithTokenRefresh(`${API_CONFIG.API_BASE_URL}/v1/dashboard/stats`, {
        method: 'GET',
      });

      const data = await handleApiResponse<DashboardStatsResponse>(response, 'Dashboard');
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching dashboard stats';
      logger.error('Dashboard stats exception:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}
