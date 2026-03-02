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

// Mock the api-client module before importing SessionService
const mockAuthServerApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

jest.mock('./api-client', () => ({
  authServerApi: mockAuthServerApi,
  userManagementApi: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@config/runtimeConfig', () => ({
  getConfig: jest.fn().mockReturnValue({ REACT_APP_SESSION_API_PREFIX: '/sdp' }),
}));

import { SessionService } from './sessionService';

const SELF_TOKENS_PATH = '/sdp/self/tokens';
const ADMIN_TOKENS_PATH = '/sdp/admin/tokens';

describe('SessionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getActiveSessions', () => {
    it('should fetch all active sessions for current user successfully', async () => {
      const mockResponse: SessionsResponse = {
        sessions: [
          {
            sessionId: 'session-1',
            deviceInfo: 'Chrome on Windows',
            ipAddress: '192.168.1.1',
            loginTime: '2026-02-19T10:00:00Z',
            lastActivity: '2026-02-19T11:00:00Z',
            isCurrent: true,
          },
        ],
        totalCount: 1,
      };

      (mockAuthServerApi.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SessionService.getActiveSessions();

      expect(mockAuthServerApi.get).toHaveBeenCalledWith(
        `${SELF_TOKENS_PATH}/active`
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching sessions', async () => {
      const error = new Error('Network error');
      (mockAuthServerApi.get as jest.Mock).mockRejectedValue(error);

      await expect(SessionService.getActiveSessions()).rejects.toThrow('Network error');
    });
  });

  describe('terminateSessions', () => {
    it('should invalidate specified token IDs for current user', async () => {
      (mockAuthServerApi.post as jest.Mock).mockResolvedValue(undefined);

      await SessionService.terminateSessions(['token-1', 'token-2']);

      expect(mockAuthServerApi.post).toHaveBeenCalledWith(
        `${SELF_TOKENS_PATH}/invalidate`,
        { tokenIds: ['token-1', 'token-2'] }
      );
    });

    it('should handle errors when terminating sessions', async () => {
      const error = new Error('Termination failed');
      (mockAuthServerApi.post as jest.Mock).mockRejectedValue(error);

      await expect(SessionService.terminateSessions(['token-1'])).rejects.toThrow('Termination failed');
    });
  });

  describe('getAdminActiveSessions', () => {
    it('should fetch active sessions for a specific user (admin)', async () => {
      const mockResponse: SessionsResponse = {
        sessions: [
          {
            sessionId: 'session-2',
            deviceInfo: 'Firefox on Linux',
            ipAddress: '10.0.0.1',
            loginTime: '2026-02-20T08:00:00Z',
            lastActivity: '2026-02-20T09:00:00Z',
            isCurrent: false,
          },
        ],
        totalCount: 1,
      };

      (mockAuthServerApi.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SessionService.getAdminActiveSessions('testuser');

      expect(mockAuthServerApi.post).toHaveBeenCalledWith(
        `${ADMIN_TOKENS_PATH}/active`,
        { username: 'testuser' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when fetching admin sessions', async () => {
      const error = new Error('Admin fetch failed');
      (mockAuthServerApi.post as jest.Mock).mockRejectedValue(error);

      await expect(SessionService.getAdminActiveSessions('testuser')).rejects.toThrow('Admin fetch failed');
    });
  });

  describe('terminateAdminSessions', () => {
    it('should invalidate specified token IDs for a given user (admin)', async () => {
      (mockAuthServerApi.post as jest.Mock).mockResolvedValue(undefined);

      await SessionService.terminateAdminSessions('testuser', ['token-3', 'token-4']);

      expect(mockAuthServerApi.post).toHaveBeenCalledWith(
        `${ADMIN_TOKENS_PATH}/invalidate`,
        { username: 'testuser', tokenIds: ['token-3', 'token-4'] }
      );
    });

    it('should handle errors when terminating admin sessions', async () => {
      const error = new Error('Admin termination failed');
      (mockAuthServerApi.post as jest.Mock).mockRejectedValue(error);

      await expect(SessionService.terminateAdminSessions('testuser', ['token-3'])).rejects.toThrow('Admin termination failed');
    });
  });
});
