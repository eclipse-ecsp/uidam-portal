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
 * React Query mutation hook for self-service password recovery
 * Handles password reset initiation with correlation-aware error surfacing
 */

import { useMutation } from '@tanstack/react-query';
import UserService from '@services/userService';
import type { ApiResponse } from '@services/userService';
import type { SelfUserPasswordRecoveryResponseV1 } from '@/types';

/**
 * Custom hook for password recovery mutation
 * - Disables automatic retries per spec requirements
 * - Returns typed success/error responses from API
 */
export const usePasswordRecoveryMutation = () => {
  return useMutation<ApiResponse<SelfUserPasswordRecoveryResponseV1>, Error, void>({
    mutationFn: async () => {
      return await UserService.postSelfRecoveryForgotPassword();
    },
    retry: false, // Disable retries per specification
  });
};
