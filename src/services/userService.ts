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
// User Management Service
// Comprehensive API integration for UIDAM User Management APIs

import { API_CONFIG } from '../config/app.config';
import { handleApiResponse, getApiHeaders } from './apiUtils';

// API Response interfaces
export interface ApiResponse<T> {
  code?: string;
  message?: string;
  data?: T;
  httpStatus?: string;
}

// User Management Interfaces
export interface User {
  id: number;
  userName: string;
  status: 'PENDING' | 'BLOCKED' | 'REJECTED' | 'ACTIVE' | 'DELETED' | 'DEACTIVATED';
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  state?: string;
  city?: string;
  address1?: string;
  address2?: string;
  postalCode?: string;
  gender?: 'MALE' | 'FEMALE';
  birthDate?: string;
  locale?: string;
  timeZone?: string;
  notificationConsent?: boolean;
  devIds?: string[];
  additionalAttributes?: Record<string, any>;
  accounts?: UserAccount[];
  roles?: string[];
}

export interface UserAccount {
  account: string;
  roles: string[];
}

export interface CreateUserV1Request {
  firstName: string;
  lastName?: string;
  country?: string;
  state?: string;
  city?: string;
  address1?: string;
  address2?: string;
  postalCode?: string;
  phoneNumber?: string;
  email: string;
  gender?: 'MALE' | 'FEMALE';
  birthDate?: string;
  locale?: string;
  notificationConsent?: boolean;
  timeZone?: string;
  userName: string;
  password: string;
  aud?: string;
  roles?: string[];
}

export interface CreateUserV2Request extends CreateUserV1Request {
  accounts: UserAccount[];
}

export interface ExternalUserRequest extends Omit<CreateUserV1Request, 'password'> {
  // External users don't require passwords
}

export interface FederatedUserRequest extends Omit<CreateUserV1Request, 'password'> {
  identity_provider_name: string;
}

export interface UsersFilterV1 {
  ids?: number[];
  userNames?: string[];
  roles?: string[];
  firstNames?: string[];
  lastNames?: string[];
  countries?: string[];
  states?: string[];
  cities?: string[];
  address1?: string[];
  address2?: string[];
  postalCodes?: string[];
  phoneNumbers?: string[];
  emails?: string[];
  locales?: string[];
  gender?: ('MALE' | 'FEMALE')[];
  devIds?: string[];
  status?: ('PENDING' | 'BLOCKED' | 'REJECTED' | 'ACTIVE' | 'DELETED' | 'DEACTIVATED')[];
  additionalAttributes?: Record<string, string[]>;
}

export interface UsersFilterV2 extends UsersFilterV1 {
  accountNames?: string[];
}

export interface UserSearchParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: 'IDS' | 'USER_NAMES' | 'ROLES' | 'ROLEIDS' | 'ACCOUNTIDS' | 'STATUS' | 'FIRST_NAMES' | 'LAST_NAMES' | 'COUNTRIES' | 'STATES' | 'CITIES' | 'ADDRESS1' | 'ADDRESS2' | 'POSTAL_CODES' | 'PHONE_NUMBERS' | 'EMAILS' | 'GENDER' | 'LOCALES' | 'DEV_IDS' | 'TIMEZONE' | 'BIRTHDATE' | 'USERSTATUS';
  sortOrder?: 'DESC' | 'ASC';
  ignoreCase?: boolean;
  searchType?: 'PREFIX' | 'SUFFIX' | 'CONTAINS';
}

export interface UserStatusChangeRequest {
  ids: number[];
  approved: boolean;
}

export interface AccountRoleMappingOperation {
  op: 'ADD' | 'REMOVE' | 'REPLACE';
  path: string; // e.g., "/account/1/ROLE_NAME" or "/status"
  value?: string;
}

export interface UserMetaDataRequest {
  name: string;
  mandatory?: boolean;
  unique?: boolean;
  readOnly?: boolean;
  searchable?: boolean;
  type?: string;
  regex?: string;
}

// User Management Service Class
export class UserService {
  // V1 User APIs
  static async createUserV1(user: CreateUserV1Request): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/users`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(user),
    });
    return response.json();
  }

  static async getUserV1(id: number): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/users/${id}`, {
      method: 'GET',
      headers: getApiHeaders(),
    });
    return response.json();
  }

  static async updateUserV1(id: number, patches: any[]): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/users/${id}`, {
      method: 'PATCH',
      headers: getApiHeaders(),
      body: JSON.stringify(patches),
    });
    return response.json();
  }

  static async deleteUserV1(id: number, externalUser?: boolean): Promise<ApiResponse<User>> {
    let urlPath = `${API_CONFIG.API_BASE_URL}/v1/users/${id}`;
    if (externalUser !== undefined) {
      urlPath += `?external_user=${externalUser}`;
    }
    
    const response = await fetch(urlPath, {
      method: 'DELETE',
      headers: getApiHeaders(),
    });

    return handleApiResponse<ApiResponse<User>>(response);
  }

  static async filterUsersV1(filter: UsersFilterV1, params?: UserSearchParams): Promise<ApiResponse<User[]>> {
    const urlPath = `${API_CONFIG.API_BASE_URL}/v1/users/filter`;
    
    const urlParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          urlParams.append(key, value.toString());
        }
      });
    }
    
    const finalUrl = urlParams.toString() ? `${urlPath}?${urlParams.toString()}` : urlPath;

    const response = await fetch(finalUrl, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(filter),
    });
    return response.json();
  }

  // V2 User APIs
  static async createUserV2(user: CreateUserV2Request): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v2/users`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(user),
    });

    return handleApiResponse<ApiResponse<User>>(response);
  }

  static async getUserV2(id: number): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v2/users/${id}`, {
      method: 'GET',
      headers: getApiHeaders(),
    });
    return response.json();
  }

  static async updateUserV2(id: number, patches: any[]): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v2/users/${id}`, {
      method: 'PATCH',
      headers: getApiHeaders(),
      body: JSON.stringify(patches),
    });

    return handleApiResponse<ApiResponse<User>>(response);
  }

  static async filterUsersV2(filter: UsersFilterV2, params?: UserSearchParams): Promise<User[]> {
    // Use full URL with API base
    const urlPath = `${API_CONFIG.API_BASE_URL}/v2/users/filter`;
    
    // Add query parameters if provided
    const urlParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          urlParams.append(key, value.toString());
        }
      });
    }
    
    const finalUrl = urlParams.toString() ? `${urlPath}?${urlParams.toString()}` : urlPath;

    const response = await fetch(finalUrl, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(filter),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('User filter API error:', response.status, errorText);
      
      // Create user-friendly error message
      let errorMessage = 'Failed to load users';
      if (response.status === 405) {
        errorMessage = 'Server configuration error. Please contact support.';
      } else if (response.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (response.status === 403) {
        errorMessage = 'You do not have permission to view users.';
      } else if (response.status === 404) {
        errorMessage = 'User service not found.';
      } else if (response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Return the data directly as an array
    return data;
  }

  // Special User Types
  static async createExternalUser(user: ExternalUserRequest): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/users/external`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(user),
    });
    return response.json();
  }

  static async createFederatedUser(user: FederatedUserRequest): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/users/federated`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(user),
    });
    return response.json();
  }

  static async getExternalUser(id: number): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/users/external/${id}`, {
      method: 'GET',
      headers: getApiHeaders(),
    });
    return response.json();
  }

  static async updateExternalUser(id: number, patches: any[]): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/users/external/${id}`, {
      method: 'PATCH',
      headers: getApiHeaders(),
      body: JSON.stringify(patches),
    });
    return response.json();
  }

  static async deleteExternalUser(id: number): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/users/external/${id}`, {
      method: 'DELETE',
      headers: getApiHeaders(),
    });
    return response.json();
  }

  // User Status Management
  static async changeUserStatus(request: UserStatusChangeRequest): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/users/status`, {
      method: 'PATCH',
      headers: getApiHeaders(),
      body: JSON.stringify(request),
    });
    return response.json();
  }

  static async deleteUsersByFilter(filter: { ids: number[] }): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/users`, {
      method: 'DELETE',
      headers: getApiHeaders(),
      body: JSON.stringify(filter),
    });
    return response.json();
  }

  // User-Account-Role Mapping
  static async associateAccountAndRoles(
    userId: number, 
    operations: AccountRoleMappingOperation[]
  ): Promise<ApiResponse<{ accounts: UserAccount[] }>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/users/${userId}/accountRoleMapping`, {
      method: 'PATCH',
      headers: getApiHeaders(),
      body: JSON.stringify(operations),
    });
    return response.json();
  }

  // Self-Service APIs
  static async getSelfUser(): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/users/self`, {
      method: 'GET',
      headers: getApiHeaders(),
    });
    return response.json();
  }

  static async updateSelfUser(patches: any[]): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/users/self`, {
      method: 'PATCH',
      headers: getApiHeaders(),
      body: JSON.stringify(patches),
    });
    return response.json();
  }

  static async deleteSelfUser(externalUser?: boolean): Promise<ApiResponse<User>> {
    let urlPath = `${API_CONFIG.API_BASE_URL}/v1/users/self`;
    if (externalUser !== undefined) {
      urlPath += `?external_user=${externalUser}`;
    }
    
    const response = await fetch(urlPath, {
      method: 'DELETE',
      headers: getApiHeaders(),
    });
    return response.json();
  }

  // User Attributes
  static async getUserAttributes(): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/users/attributes`, {
      method: 'GET',
      headers: getApiHeaders(),
    });
    return response.json();
  }

  static async updateUserAttributes(attributes: UserMetaDataRequest[]): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/users/attributes`, {
      method: 'PUT',
      headers: getApiHeaders(),
      body: JSON.stringify(attributes),
    });
    return response.json();
  }

  // Utility Functions
  static async getUserByUserName(userName: string, accountName?: string): Promise<ApiResponse<any>> {
    let urlPath = `/v1/users/${userName}/byUserName`;
    if (accountName) {
      urlPath += `?accountName=${accountName}`;
    }
    
    const response = await fetch(urlPath, {
      method: 'GET',
      headers: getApiHeaders(),
    });
    return response.json();
  }

  // User Events
  static async addUserEvent(userId: number, event: any): Promise<ApiResponse<string>> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/users/${userId}/events`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(event),
    });
    return response.json();
  }
}

export default UserService;
