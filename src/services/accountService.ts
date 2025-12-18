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
// Account Management Service
// Comprehensive API integration for UIDAM Account Management APIs

import { AccountStatus } from '../types';
import { API_CONFIG } from '../config/app.config';
import { userManagementApi } from './api-client';
import { handleApiResponse, getApiHeaders } from './apiUtils';
import { logger } from '../utils/logger';

// API Response interfaces-
export interface ApiResponse<T> {
  code?: string;
  message?: string;
  data?: T;
  httpStatus?: string;
}

// Account Management Interfaces
export interface Account {
  id: string;
  accountName: string;
  parentId?: string;
  roles: string[];
  status: AccountStatus;
  createdBy: string;
  createDate: string;
  updatedBy?: string;
  updateDate?: string;
  description?: string;
  type?: AccountType;
  children?: Account[];
}

export type AccountType = 'ROOT' | 'ORGANIZATION' | 'DEPARTMENT' | 'TEAM';

export interface CreateAccountRequest {
  accountName: string;
  parentId?: string;
  roles?: string[];
  description?: string;
  type?: AccountType;
}

export interface UpdateAccountRequest {
  accountName?: string;
  parentId?: string;
  roles?: string[];
  status?: AccountStatus;
  description?: string;
  type?: AccountType;
}

export interface AccountFilter {
  ids?: string[];
  accountNames?: string[];
  parentIds?: string[];
  roles?: string[];
  status?: string[];
}

export interface AccountSearchParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: 'IDS' | 'ACCOUNT_NAMES' | 'PARENTIDS' | 'ROLES' | 'STATUS' | 'TYPE' | 'CREATE_DATE';
  sortOrder?: 'DESC' | 'ASC';
  ignoreCase?: boolean;
  searchType?: 'PREFIX' | 'SUFFIX' | 'CONTAINS';
}

// Account Role Management Interfaces
export interface AccountRole {
  id: string;
  name: string;
  description?: string;
  accountId: string;
  permissions: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}



// User Account Role Mapping Interfaces
export interface UserAccountRoleMapping {
  userId: string;
  accountId: string;
  roleIds: string[];
  status: 'ACTIVE' | 'INACTIVE';
  assignedAt: string;
  assignedBy: string;
}

export interface AssignUserToAccountRequest {
  userId: string;
  accountId: string;
  roleIds: string[];
}

export interface UpdateUserAccountRolesRequest {
  roleIds: string[];
}

// Account Management Service Class
export class AccountService {
  // =============================================================================
  // ACCOUNT MANAGEMENT APIs
  // =============================================================================

  // Create Account
  static async createAccount(account: CreateAccountRequest): Promise<{ success: boolean; data?: Account; error?: string }> {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/accounts`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(account),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Account create error:', response.status, response.statusText, errorText);
        
        return {
          success: false,
          error: `Failed to create account: ${response.statusText}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (err) {
      logger.error('Error creating account:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create account'
      };
    }
  }

  // Get Account by ID
  static async getAccount(accountId: string): Promise<{ success: boolean; data?: Account; error?: string }> {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/accounts/${accountId}`, {
        method: 'GET',
        headers: getApiHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Account get error:', response.status, response.statusText, errorText);
        
        return {
          success: false,
          error: `Failed to get account: ${response.statusText}`
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } catch (err) {
      logger.error('Error getting account:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to get account'
      };
    }
  }

  // Update Account - API uses POST method for updates
  static async updateAccount(accountId: string, accountData: UpdateAccountRequest): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/accounts/${accountId}`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Account update error:', response.status, response.statusText, errorText);
        
        return {
          success: false,
          error: `Failed to update account: ${response.statusText}`
        };
      }

      // API may return string response for updates
      const data = await response.text();
      return {
        success: true,
        data: data
      };
    } catch (err) {
      logger.error('Error updating account:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update account'
      };
    }
  }

  // Delete Account
  static async deleteAccount(accountId: string): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/accounts/${accountId}`, {
        method: 'DELETE',
        headers: getApiHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Account delete error:', response.status, response.statusText, errorText);
        
        return {
          success: false,
          error: `Failed to delete account: ${response.statusText}`
        };
      }

      const data = await response.text();
      return {
        success: true,
        data: data
      };
    } catch (err) {
      logger.error('Error deleting account:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to delete account'
      };
    }
  }

  // Helper function to get error message based on HTTP status code
  private static getErrorMessageForStatus(status: number): string {
    if (status === 405) {
      return 'Server configuration error. Please contact support.';
    }
    if (status === 401 || status === 403) {
      return 'User is not authorized to access this page.';
    }
    if (status === 404) {
      return 'Account service not found.';
    }
    if (status >= 500) {
      return 'Server error. Please try again later.';
    }
    return 'Failed to load accounts';
  }

  // Filter Accounts
  static async filterAccounts(
    filter: AccountFilter, 
    params?: AccountSearchParams
  ): Promise<{ success: boolean; data?: { content: Account[]; totalElements: number; }; error?: string }> {
    try {
      // Build query parameters
      const urlParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            urlParams.append(key, value.toString());
          }
        });
      }
      
      // Build endpoint URL without nested template literals
      const queryString = urlParams.toString();
      const endpoint = queryString ? `/v1/accounts/filter?${queryString}` : '/v1/accounts/filter';

      logger.debug('Account filter API request:', {
        endpoint,
        filter,
        filterJSON: JSON.stringify(filter, null, 2),
        params
      });
      
      // Use userManagementApi (axios) instead of fetch to get automatic auth headers
      const response: { items?: Account[] } = await userManagementApi.post(endpoint, filter);
      
      logger.debug('Account filter API response:', response);
      
      // Handle the actual API response format: { "items": [...] }
      const accounts = response.items || [];
      
      // Return the data in a consistent format
      return {
        success: true,
        data: {
          content: Array.isArray(accounts) ? accounts : [],
          totalElements: Array.isArray(accounts) ? accounts.length : 0
        }
      };
    } catch (err: unknown) {
      logger.error('Error filtering accounts:', err);
      
      // Type guard for axios error
      const isAxiosError = (error: unknown): error is { response?: { data?: unknown; status?: number } } => {
        return typeof error === 'object' && error !== null && 'response' in error;
      };
      
      if (isAxiosError(err)) {
        logger.error('Error response data:', err.response?.data);
        logger.error('Error response status:', err.response?.status);
      }
      
      // Create user-friendly error message using helper function
      const errorMessage = isAxiosError(err) && err.response?.status
        ? this.getErrorMessageForStatus(err.response.status)
        : 'Failed to load accounts';
      
      return {
        success: false,
        error: err instanceof Error ? err.message : errorMessage
      };
    }
  }

  // Get all accounts (convenience method)
  static async getAllAccounts(params?: AccountSearchParams): Promise<{ success: boolean; data?: { content: Account[]; totalElements: number; }; error?: string }> {
    return this.filterAccounts({}, params);
  }

  // Get accounts by status
  static async getAccountsByStatus(
    status: AccountStatus[], 
    params?: AccountSearchParams
  ): Promise<{ success: boolean; data?: { content: Account[]; totalElements: number; }; error?: string }> {
    return this.filterAccounts({ status }, params);
  }

  // Get child accounts
  static async getChildAccounts(
    parentId: string, 
    params?: AccountSearchParams
  ): Promise<{ success: boolean; data?: { content: Account[]; totalElements: number; }; error?: string }> {
    return this.filterAccounts({ parentIds: [parentId] }, params);
  }

  // Search accounts by name
  static async searchAccountsByName(
    accountNames: string[], 
    params?: AccountSearchParams
  ): Promise<{ success: boolean; data?: { content: Account[]; totalElements: number; }; error?: string }> {
    return this.filterAccounts({ accountNames }, params);
  }



  // =============================================================================
  // USER ACCOUNT ROLE MAPPING APIs
  // =============================================================================

  // Assign User to Account with Roles
  static async assignUserToAccount(assignment: AssignUserToAccountRequest): Promise<ApiResponse<UserAccountRoleMapping>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/user-account-mappings`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(assignment),
    });

    return handleApiResponse<ApiResponse<UserAccountRoleMapping>>(response);
  }

  // Get User Account Mappings
  static async getUserAccountMappings(userId: string): Promise<UserAccountRoleMapping[]> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/users/${userId}/account-mappings`, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Get user account mappings API error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    return data;
  }

  // Get Account User Mappings
  static async getAccountUserMappings(accountId: string): Promise<UserAccountRoleMapping[]> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/accounts/${accountId}/user-mappings`, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Get account user mappings API error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    return data;
  }

  // Update User Account Roles
  static async updateUserAccountRoles(
    userId: string, 
    accountId: string, 
    roleData: UpdateUserAccountRolesRequest
  ): Promise<ApiResponse<UserAccountRoleMapping>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/users/${userId}/accounts/${accountId}/roles`, {
      method: 'PATCH',
      headers: getApiHeaders(),
      body: JSON.stringify(roleData),
    });

    return handleApiResponse<ApiResponse<UserAccountRoleMapping>>(response);
  }

  // Remove User from Account
  static async removeUserFromAccount(userId: string, accountId: string): Promise<ApiResponse<string>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/users/${userId}/accounts/${accountId}`, {
      method: 'DELETE',
      headers: getApiHeaders(),
    });

    return handleApiResponse<ApiResponse<string>>(response);
  }

  // Bulk assign users to account
  static async bulkAssignUsersToAccount(
    accountId: string, 
    assignments: AssignUserToAccountRequest[]
  ): Promise<ApiResponse<UserAccountRoleMapping[]>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/accounts/${accountId}/bulk-assign-users`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(assignments),
    });

    return handleApiResponse<ApiResponse<UserAccountRoleMapping[]>>(response);
  }
}

export default AccountService;
