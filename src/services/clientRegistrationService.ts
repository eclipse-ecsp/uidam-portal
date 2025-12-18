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
import { userManagementApi } from './api-client';
import { 
  RegisteredClientDetails, 
  BaseResponse, 
  ClientFormData, 
  ClientListItem 
} from '../types/client';

export class ClientRegistrationService {
  private static readonly BASE_PATH = '/v1/oauth2/client';

  /**
   * Create a new OAuth2 client
   */
  static async createClient(clientData: ClientFormData): Promise<BaseResponse> {
    const payload: RegisteredClientDetails = {
      ...clientData,
      // Ensure arrays are properly formatted
      redirectUris: clientData.redirectUris.filter(uri => uri.trim() !== ''),
      postLogoutRedirectUris: clientData.postLogoutRedirectUris?.filter(uri => uri.trim() !== '') ?? [],
      scopes: clientData.scopes.filter(scope => scope.trim() !== ''),
      authorizationGrantTypes: clientData.authorizationGrantTypes,
      clientAuthenticationMethods: clientData.clientAuthenticationMethods,
      createdBy: clientData.createdBy ?? 'web-admin', // Default creator
    };

    const response = await userManagementApi.post<BaseResponse>(this.BASE_PATH, payload, {
      headers: { scope: 'OAuth2ClientMgmt' }
    });
    return response;
  }

  /**
   * Get client details by clientId
   */
  static async getClient(clientId: string, status?: string): Promise<BaseResponse> {
    const params = status ? { status } : {};
    const response = await userManagementApi.get<BaseResponse>(`${this.BASE_PATH}/${clientId}`, { 
      params,
      headers: { scope: 'OAuth2ClientMgmt' }
    });
    return response;
  }

  /**
   * Update existing client
   */
  static async updateClient(clientId: string, clientData: ClientFormData): Promise<BaseResponse> {
    const payload: RegisteredClientDetails = {
      ...clientData,
      redirectUris: clientData.redirectUris.filter(uri => uri.trim() !== ''),
      postLogoutRedirectUris: clientData.postLogoutRedirectUris?.filter(uri => uri.trim() !== '') ?? [],
      scopes: clientData.scopes.filter(scope => scope.trim() !== ''),
      authorizationGrantTypes: clientData.authorizationGrantTypes,
      clientAuthenticationMethods: clientData.clientAuthenticationMethods,
      createdBy: clientData.createdBy ?? 'web-admin', // For update operations
    };

    const response = await userManagementApi.put<BaseResponse>(`${this.BASE_PATH}/${clientId}`, payload, {
      headers: { scope: 'OAuth2ClientMgmt' }
    });
    return response;
  }

  /**
   * Delete client
   */
  static async deleteClient(clientId: string): Promise<BaseResponse> {
    const response = await userManagementApi.delete<BaseResponse>(`${this.BASE_PATH}/${clientId}`, {
      headers: { scope: 'OAuth2ClientMgmt' }
    });
    return response;
  }

  /**
   * Get list of all clients
   * Note: Backend doesn't currently provide a list endpoint.
   * This returns an empty array with a clear message for users.
   */
  static async getClients(): Promise<ClientListItem[]> {
    // Backend API doesn't currently support listing all clients
    // Only individual client operations are available:
    // - GET /v1/oauth2/client/{clientId} - Get specific client
    // - POST /v1/oauth2/client - Create client  
    // - PUT /v1/oauth2/client/{clientId} - Update client
    // - DELETE /v1/oauth2/client/{clientId} - Delete client
    
    console.info('Client list endpoint not yet implemented in backend API');
    return [];
  }

  /**
   * Validate client form data
   */
  static validateClientData(data: ClientFormData): string[] {
    const errors: string[] = [];

    if (!data.clientId?.trim()) {
      errors.push('Client ID is required');
    }

    if (!data.clientName?.trim()) {
      errors.push('Client Name is required');
    }

    if (!data.authorizationGrantTypes?.length) {
      errors.push('At least one authorization grant type is required');
    }

    if (data.authorizationGrantTypes?.includes('authorization_code') && !data.redirectUris?.length) {
      errors.push('Redirect URIs are required for authorization code flow');
    }

    // Validate URI formats
    const urlPattern = /^https?:\/\/.+/;
    const invalidRedirectUris = data.redirectUris?.filter(uri => uri.trim() && !urlPattern.test(uri));
    if (invalidRedirectUris?.length) {
      errors.push('All redirect URIs must be valid HTTP/HTTPS URLs');
    }

    const invalidLogoutUris = data.postLogoutRedirectUris?.filter(uri => uri.trim() && !urlPattern.test(uri));
    if (invalidLogoutUris?.length) {
      errors.push('All post-logout redirect URIs must be valid HTTP/HTTPS URLs');
    }

    // Validate token validity values
    if (data.accessTokenValidity !== undefined && data.accessTokenValidity < 0) {
      errors.push('Access token validity must be a positive number');
    }

    if (data.refreshTokenValidity !== undefined && data.refreshTokenValidity < 0) {
      errors.push('Refresh token validity must be a positive number');
    }

    if (data.authorizationCodeValidity !== undefined && data.authorizationCodeValidity < 0) {
      errors.push('Authorization code validity must be a positive number');
    }

    return errors;
  }

  /**
   * Generate default client data for forms
   */
  static getDefaultClientData(): ClientFormData {
    return {
      clientId: '',
      clientName: '',
      clientSecret: '',
      authorizationGrantTypes: ['authorization_code'],
      redirectUris: [''],
      postLogoutRedirectUris: [''],
      scopes: ['openid', 'profile'],
      clientAuthenticationMethods: ['client_secret_basic'],
      accessTokenValidity: 3600, // 1 hour (backend default)
      refreshTokenValidity: 3600, // 1 hour (backend default) 
      authorizationCodeValidity: 300, // 5 minutes (backend default)
      requireAuthorizationConsent: true,
      additionalInformation: '',
      status: 'approved', // Backend default status
      createdBy: 'web-admin'
    };
  }
}
