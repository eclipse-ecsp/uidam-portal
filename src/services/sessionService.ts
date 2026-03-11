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
import { SessionsResponse } from '@/types';
import { getConfig } from '@config/runtimeConfig';
import { API_CONFIG, OAUTH_CONFIG } from '@config/app.config';

/**
 * Service for managing user active sessions.
 *
 * Routes requests through the nginx/Vite proxy (relative URLs) so the browser
 * stays same-origin and CORS is not triggered. nginx proxies /sdp/ to the
 * auth server; Vite dev proxy does the same. Only Authorization + Content-Type
 * headers are sent — no user-id / X-Correlation-ID that the auth server rejects.
 *
 * The session path prefix (e.g. "/sdp") is read from REACT_APP_SESSION_API_PREFIX
 * in public/config.json so it can be adjusted per deployment without a rebuild.
 *
 * Endpoints (per backend curl spec):
 * - GET  {prefix}/self/tokens/active
 * - POST {prefix}/self/tokens/invalidate
 * - POST {prefix}/admin/tokens/active
 * - POST {prefix}/admin/tokens/invalidate
 */
export class SessionService {
  /**
   * Returns the stored access token from localStorage (same key as ApiClient).
   * @returns {string | null} The stored access token or null
   */
  private static getToken(): string | null {
    // NOSONAR - localStorage required for OAuth2 token storage (industry standard)
    return localStorage.getItem(OAUTH_CONFIG.TOKEN_STORAGE_KEY);
  }

  /**
   * Returns the session API prefix from runtime config (e.g. "/sdp").
   * @returns {string} The session API prefix
   */
  private static getPrefix(): string {
    return getConfig().REACT_APP_SESSION_API_PREFIX ?? '/sdp';
  }

  /**
   * Returns true when running on localhost (Vite dev server).
   * In dev, we call the auth server directly to avoid Vite proxy stripping
   * the headers the auth server needs for tenant resolution.
   * In production, we use a relative URL so nginx proxies the request
   * (same-origin, no CORS).
   * @returns {boolean} True if running on localhost
   */
  private static isDev(): boolean {
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1';
  }

  /**
   * Shared fetch helper.
   * - Dev:  calls auth server directly (full URL) — avoids Vite proxy TENANT_RESOLUTION_FAILED
   * - Prod: uses relative URL — proxied by nginx to the auth server (no CORS)
   * Only sends Authorization + Content-Type (no user-id / X-Correlation-ID).
   * @param {string} path - Path relative to auth server (e.g. /sdp/self/tokens/active)
   * @param {RequestInit} options - Fetch options
   * @returns {Promise<T>} Parsed JSON response
   */
  private static async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const url = this.isDev()
      ? `${API_CONFIG.AUTH_SERVER_URL}${path}` // direct call in dev
      : path;                                   // relative URL in prod (nginx proxies)
    console.log('Session API request:', options.method ?? 'GET', url);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Session API error:', response.status, errorText);
      throw new Error(`Session API error ${response.status}: ${errorText}`);
    }

    // 204 No Content — return empty object
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get all active sessions for the current user.
   * @returns {Promise<SessionsResponse>} List of active sessions
   */
  static async getActiveSessions(): Promise<SessionsResponse> {
    const path = `${this.getPrefix()}/self/tokens/active`;
    return this.request<SessionsResponse>(path, { method: 'GET' });
  }

  /**
   * Terminate specific sessions for the current user.
   * @param {string[]} tokenIds - Array of token IDs to invalidate
   * @returns {Promise<void>} Promise that resolves when sessions are terminated
   */
  static async terminateSessions(tokenIds: string[]): Promise<void> {
    const path = `${this.getPrefix()}/self/tokens/invalidate`;
    await this.request<void>(path, { method: 'POST', body: JSON.stringify({ tokenIds }) });
  }

  /**
   * Get active sessions for a specific user (Admin only).
   * @param {string} username - Username to get sessions for
   * @returns {Promise<SessionsResponse>} List of active sessions for the user
   */
  static async getAdminActiveSessions(username: string): Promise<SessionsResponse> {
    const path = `${this.getPrefix()}/admin/tokens/active`;
    return this.request<SessionsResponse>(path, { method: 'POST', body: JSON.stringify({ username }) });
  }

  /**
   * Terminate sessions for a specific user (Admin only).
   * @param {string} username - Username whose sessions to terminate
   * @param {string[]} tokenIds - Array of token IDs to invalidate
   * @returns {Promise<void>} Promise that resolves when sessions are terminated
   */
  static async terminateAdminSessions(username: string, tokenIds: string[]): Promise<void> {
    const path = `${this.getPrefix()}/admin/tokens/invalidate`;
    await this.request<void>(path, { method: 'POST', body: JSON.stringify({ username, tokenIds }) });
  }
}
