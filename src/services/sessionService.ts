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
import { authServerApi } from './api-client';
import { SessionsResponse } from '@/types';
import { getConfig } from '@config/runtimeConfig';

/**
 * Service for managing user active sessions
 * Handles fetching, terminating, and monitoring user login sessions
 *
 * The API prefix (e.g. "/sdp") is read from config.json (REACT_APP_SESSION_API_PREFIX).
 * Endpoints:
 * - GET  {prefix}/self/tokens/active        – Get active sessions for current user
 * - POST {prefix}/self/tokens/invalidate    – Invalidate current user's sessions
 * - POST {prefix}/admin/tokens/active       – Get active sessions for specific user (admin)
 * - POST {prefix}/admin/tokens/invalidate   – Invalidate sessions for specific user (admin)
 */
export class SessionService {
  /**
   * Returns the API prefix from runtime config (e.g. "/sdp").
   * Falls back to "/sdp" if not configured.
   * @returns {string} The session API prefix
   */
  private static getPrefix(): string {
    return getConfig().REACT_APP_SESSION_API_PREFIX ?? '/sdp';
  }

  /**
   * Get all active sessions for the current user
   * @returns {Promise<SessionsResponse>} List of active sessions
   */
  static async getActiveSessions(): Promise<SessionsResponse> {
    try {
      const url = `${this.getPrefix()}/self/tokens/active`;
      console.log('Fetching active sessions:', url);
      const response = await authServerApi.get<SessionsResponse>(url);
      return response;
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      throw error;
    }
  }

  /**
   * Terminate specific sessions for the current user
   * @param {string[]} tokenIds - Array of token IDs to invalidate
   * @returns {Promise<void>} Promise that resolves when sessions are terminated
   */
  static async terminateSessions(tokenIds: string[]): Promise<void> {
    try {
      const url = `${this.getPrefix()}/self/tokens/invalidate`;
      console.log('Terminating sessions:', tokenIds);
      await authServerApi.post(url, { tokenIds });
    } catch (error) {
      console.error('Error terminating sessions:', error);
      throw error;
    }
  }

  /**
   * Get active sessions for a specific user (Admin only)
   * @param {string} username - Username to get sessions for
   * @returns {Promise<SessionsResponse>} List of active sessions for the user
   */
  static async getAdminActiveSessions(username: string): Promise<SessionsResponse> {
    try {
      const url = `${this.getPrefix()}/admin/tokens/active`;
      console.log('Fetching active sessions for user:', username);
      const response = await authServerApi.post<SessionsResponse>(url, { username });
      return response;
    } catch (error) {
      console.error(`Error fetching sessions for user ${username}:`, error);
      throw error;
    }
  }

  /**
   * Terminate sessions for a specific user (Admin only)
   * @param {string} username - Username whose sessions to terminate
   * @param {string[]} tokenIds - Array of token IDs to invalidate
   * @returns {Promise<void>} Promise that resolves when sessions are terminated
   */
  static async terminateAdminSessions(username: string, tokenIds: string[]): Promise<void> {
    try {
      const url = `${this.getPrefix()}/admin/tokens/invalidate`;
      console.log('Terminating sessions for user:', username, 'tokens:', tokenIds);
      await authServerApi.post(url, { username, tokenIds });
    } catch (error) {
      console.error(`Error terminating sessions for user ${username}:`, error);
      throw error;
    }
  }
}
