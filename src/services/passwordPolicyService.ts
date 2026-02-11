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
/**
 * Password Policy Service
 * Handles API integration for fetching and managing tenant password policies
 */

import { API_CONFIG } from '@config/app.config';
import { getApiHeaders } from './apiUtils';
import type { PasswordPolicyResponse, PasswordPolicyItem } from '@/features/self-service/password-reset/types';

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  code?: string;
  message?: string;
  data?: T;
  httpStatus?: string;
}

/**
 * Service class for password policy operations
 * Provides methods to fetch tenant-specific password policies
 */
export class PasswordPolicyService {
  /**
   * Fetches the password policy configuration for the current tenant
   * Used to display policy requirements and perform client-side validation
   * 
   * API Endpoint: GET /v1/password-policies
   * 
   * Response includes policy items such as:
   * - MIN_LENGTH: Minimum password length requirement
   * - COMPLEXITY: Uppercase, lowercase, digit, special character requirements
   * - HISTORY: Password history check (prevent reuse of previous passwords)
   * - EXPIRATION: Password expiration policy (optional)
   * 
   * @returns {Promise<PasswordPolicyResponse>} API response containing array of policy items
   * 
   * @example
   * ```ts
   * const policyResponse = await PasswordPolicyService.getPasswordPolicy();
   * const policies = policyResponse.data;
   * 
   * // Find minimum length policy
   * const minLengthPolicy = policies.find(p => p.policyKey === 'MIN_LENGTH');
   * const minLength = minLengthPolicy?.rules.minLength || 8;
   * ```
   * 
   * @throws {Error} If API request fails or returns non-OK status
   */
  static async getPasswordPolicy(): Promise<PasswordPolicyResponse> {
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/v1/password-policies`, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch password policy');
    }

    return response.json();
  }

  /**
   * Helper method to extract a specific policy rule value
   * Simplifies accessing nested policy configuration
   * 
   * @param {PasswordPolicyItem[]} policies - Array of policy items from API response
   * @param {string} policyKey - The policy key to look up (e.g., 'MIN_LENGTH', 'COMPLEXITY')
   * @param {string} ruleKey - The rule key within the policy (e.g., 'minLength', 'requireUppercase')
   * @param {T} defaultValue - Default value to return if policy or rule not found
   * @returns {T} The policy rule value or default value
   * 
   * @example
   * ```ts
   * const policies = policyResponse.data;
   * const minLength = PasswordPolicyService.getPolicyRuleValue(
   *   policies,
   *   'MIN_LENGTH',
   *   'minLength',
   *   8
   * ); // Returns minLength value or 8 if not found
   * ```
   */
  static getPolicyRuleValue<T = unknown>(
    policies: PasswordPolicyItem[],
    policyKey: string,
    ruleKey: string,
    defaultValue: T
  ): T {
    const policy = policies.find((p) => p.policyKey === policyKey);
    if (!policy || !policy.rules) {
      return defaultValue;
    }

    const value = policy.rules[ruleKey];
    return value !== undefined ? (value as T) : defaultValue;
  }

  /**
   * Helper method to check if a specific policy is required (enforced)
   * 
   * @param {PasswordPolicyItem[]} policies - Array of policy items from API response
   * @param {string} policyKey - The policy key to check
   * @returns {boolean} True if policy is required, false otherwise
   * 
   * @example
   * ```ts
   * const policies = policyResponse.data;
   * const isHistoryRequired = PasswordPolicyService.isPolicyRequired(policies, 'HISTORY');
   * ```
   */
  static isPolicyRequired(policies: PasswordPolicyItem[], policyKey: string): boolean {
    const policy = policies.find((p) => p.policyKey === policyKey);
    return policy?.required ?? false;
  }

  /**
   * Helper method to get all required policies
   * Useful for displaying mandatory requirements to users
   * 
   * @param {PasswordPolicyItem[]} policies - Array of policy items from API response
   * @returns {PasswordPolicyItem[]} Array of only required policies
   * 
   * @example
   * ```ts
   * const policies = policyResponse.data;
   * const requiredPolicies = PasswordPolicyService.getRequiredPolicies(policies);
   * // Display only mandatory requirements to user
   * ```
   */
  static getRequiredPolicies(policies: PasswordPolicyItem[]): PasswordPolicyItem[] {
    return policies.filter((p) => p.required);
  }

  /**
   * Helper method to sort policies by priority
   * Ensures policies are evaluated in correct order
   * 
   * @param {PasswordPolicyItem[]} policies - Array of policy items from API response
   * @returns {PasswordPolicyItem[]} Array of policies sorted by priority (ascending)
   * 
   * @example
   * ```ts
   * const policies = policyResponse.data;
   * const sortedPolicies = PasswordPolicyService.sortPoliciesByPriority(policies);
   * // Validate password against policies in priority order
   * ```
   */
  static sortPoliciesByPriority(policies: PasswordPolicyItem[]): PasswordPolicyItem[] {
    return [...policies].sort((a, b) => a.priority - b.priority);
  }
}

export default PasswordPolicyService;
