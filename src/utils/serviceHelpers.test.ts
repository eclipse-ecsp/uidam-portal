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
import { 
  createResource, 
  updateResource, 
  deleteResource, 
  getResource, 
  listResources, 
  buildQueryParams,
  fetchPaginatedFilteredResources
} from './serviceHelpers';
import { userManagementApi } from '@/services/api-client';
import { handleApiError } from './apiErrorHandler';
import { fetchWithTokenRefresh } from '@/services/apiUtils';

// Mock dependencies
jest.mock('@/services/api-client');
jest.mock('@/services/apiUtils');
jest.mock('./apiErrorHandler');

describe('serviceHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildQueryParams', () => {
    it('should convert object to query params', () => {
      const params = {
        page: 1,
        size: 10,
        search: 'test',
      };

      const result = buildQueryParams(params);

      expect(result).toEqual({
        page: '1',
        size: '10',
        search: 'test',
      });
    });

    it('should filter out undefined values', () => {
      const params = {
        page: 1,
        size: undefined,
        search: 'test',
      };

      const result = buildQueryParams(params);

      expect(result).toEqual({
        page: '1',
        search: 'test',
      });
    });

    it('should filter out null values', () => {
      const params = {
        page: 1,
        size: null,
        search: 'test',
      };

      const result = buildQueryParams(params);

      expect(result).toEqual({
        page: '1',
        search: 'test',
      });
    });

    it('should handle boolean values', () => {
      const params = {
        active: true,
        deleted: false,
      };

      const result = buildQueryParams(params);

      expect(result).toEqual({
        active: 'true',
        deleted: 'false',
      });
    });

    it('should handle empty object', () => {
      const result = buildQueryParams({});
      expect(result).toEqual({});
    });
  });

  describe('createResource', () => {
    it('should create resource and extract from results array', async () => {
      const mockResponse = {
        results: [{ id: '1', name: 'Test' }],
      };
      (userManagementApi.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await createResource('/api/resource', { name: 'Test' });

      expect(result).toEqual({ id: '1', name: 'Test' });
      expect(userManagementApi.post).toHaveBeenCalledWith('/api/resource', { name: 'Test' });
    });

    it('should create resource and extract from data property', async () => {
      const mockResponse = {
        data: { id: '2', name: 'Test2' },
      };
      (userManagementApi.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await createResource('/api/resource', { name: 'Test2' });

      expect(result).toEqual({ id: '2', name: 'Test2' });
    });

    it('should use response as result if no results or data properties', async () => {
      const mockResponse = { id: '3', name: 'Test3' };
      (userManagementApi.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await createResource('/api/resource', { name: 'Test3' });

      expect(result).toEqual({ id: '3', name: 'Test3' });
    });

    it('should use custom extractResult function', async () => {
      const mockResponse = { payload: { id: '4', name: 'Test4' } };
      (userManagementApi.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await createResource('/api/resource', { name: 'Test4' }, {
        extractResult: (response) => response.payload as { id: string; name: string },
      });

      expect(result).toEqual({ id: '4', name: 'Test4' });
    });

    it('should throw error if no result returned', async () => {
      const mockResponse = { results: [], data: null };
      (userManagementApi.post as jest.Mock).mockResolvedValue(mockResponse);

      await expect(createResource('/api/resource', { name: 'Test' }))
        .rejects.toThrow('Failed to create resource: No result returned');
    });

    it('should use custom error message', async () => {
      const mockResponse = { results: [] };
      (userManagementApi.post as jest.Mock).mockResolvedValue(mockResponse);

      await expect(createResource('/api/resource', { name: 'Test' }, {
        errorMessage: 'Custom error message',
      })).rejects.toThrow('Custom error message');
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      (userManagementApi.post as jest.Mock).mockRejectedValue(error);

      await expect(createResource('/api/resource', { name: 'Test' }))
        .rejects.toThrow('API Error');
      
      expect(handleApiError).toHaveBeenCalledWith(error);
    });

    it('should not call handleApiError for custom errors', async () => {
      const mockResponse = { results: [] };
      (userManagementApi.post as jest.Mock).mockResolvedValue(mockResponse);

      await expect(createResource('/api/resource', { name: 'Test' }))
        .rejects.toThrow();
      
      expect(handleApiError).not.toHaveBeenCalled();
    });
  });

  describe('updateResource', () => {
    it('should update resource and extract from results array', async () => {
      const mockResponse = {
        results: [{ id: '1', name: 'Updated' }],
      };
      (userManagementApi.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await updateResource('/api/resource/1', { name: 'Updated' });

      expect(result).toEqual({ id: '1', name: 'Updated' });
      expect(userManagementApi.patch).toHaveBeenCalledWith('/api/resource/1', { name: 'Updated' });
    });

    it('should update resource and extract from data property', async () => {
      const mockResponse = {
        data: { id: '2', name: 'Updated2' },
      };
      (userManagementApi.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await updateResource('/api/resource/2', { name: 'Updated2' });

      expect(result).toEqual({ id: '2', name: 'Updated2' });
    });

    it('should use response as result if no results or data properties', async () => {
      const mockResponse = { id: '3', name: 'Updated3' };
      (userManagementApi.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await updateResource('/api/resource/3', { name: 'Updated3' });

      expect(result).toEqual({ id: '3', name: 'Updated3' });
    });

    it('should use custom extractResult function', async () => {
      const mockResponse = { updated: { id: '4', name: 'Updated4' } };
      (userManagementApi.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await updateResource('/api/resource/4', { name: 'Updated4' }, {
        extractResult: (response) => response.updated as { id: string; name: string },
      });

      expect(result).toEqual({ id: '4', name: 'Updated4' });
    });

    it('should throw error if no result returned', async () => {
      const mockResponse = { results: [] };
      (userManagementApi.patch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(updateResource('/api/resource/1', { name: 'Test' }))
        .rejects.toThrow('Failed to update resource: No result returned');
    });

    it('should handle API errors', async () => {
      const error = new Error('Update failed');
      (userManagementApi.patch as jest.Mock).mockRejectedValue(error);

      await expect(updateResource('/api/resource/1', { name: 'Test' }))
        .rejects.toThrow('Update failed');
      
      expect(handleApiError).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteResource', () => {
    it('should delete resource successfully', async () => {
      (userManagementApi.delete as jest.Mock).mockResolvedValue(undefined);

      await deleteResource('/api/resource/1');

      expect(userManagementApi.delete).toHaveBeenCalledWith('/api/resource/1');
    });

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed');
      (userManagementApi.delete as jest.Mock).mockRejectedValue(error);

      await expect(deleteResource('/api/resource/1'))
        .rejects.toThrow('Delete failed');
      
      expect(handleApiError).toHaveBeenCalledWith(error);
    });
  });

  describe('getResource', () => {
    it('should get resource and extract from results array', async () => {
      const mockResponse = {
        results: [{ id: '1', name: 'Resource' }],
      };
      (userManagementApi.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getResource('/api/resource/1');

      expect(result).toEqual({ id: '1', name: 'Resource' });
      expect(userManagementApi.get).toHaveBeenCalledWith('/api/resource/1');
    });

    it('should get resource and extract from data property', async () => {
      const mockResponse = {
        data: { id: '2', name: 'Resource2' },
      };
      (userManagementApi.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getResource('/api/resource/2');

      expect(result).toEqual({ id: '2', name: 'Resource2' });
    });

    it('should use response as result if no results or data properties', async () => {
      const mockResponse = { id: '3', name: 'Resource3' };
      (userManagementApi.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getResource('/api/resource/3');

      expect(result).toEqual({ id: '3', name: 'Resource3' });
    });

    it('should use custom extractResult function', async () => {
      const mockResponse = { item: { id: '4', name: 'Resource4' } };
      (userManagementApi.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getResource('/api/resource/4', {
        extractResult: (response) => response.item as { id: string; name: string },
      });

      expect(result).toEqual({ id: '4', name: 'Resource4' });
    });

    it('should return response object when results and data are empty', async () => {
      const mockResponse = { results: [], data: undefined };
      (userManagementApi.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getResource('/api/resource/1');
      
      // Implementation falls back to response object itself
      expect(result).toEqual(mockResponse);
    });

    it('should throw error with custom message when response is falsy', async () => {
      (userManagementApi.get as jest.Mock).mockResolvedValue({});

      await expect(getResource('/api/resource/1', {
        extractResult: () => undefined,
        errorMessage: 'Custom not found message',
      })).rejects.toThrow('Custom not found message');
    });

    it('should handle API errors', async () => {
      const error = new Error('Get failed');
      (userManagementApi.get as jest.Mock).mockRejectedValue(error);

      await expect(getResource('/api/resource/1'))
        .rejects.toThrow('Get failed');
      
      expect(handleApiError).toHaveBeenCalledWith(error);
    });

    it('should not call handleApiError for custom not found errors', async () => {
      (userManagementApi.get as jest.Mock).mockResolvedValue({});

      await expect(getResource('/api/resource/1', {
        extractResult: () => undefined,
      })).rejects.toThrow('Resource not found');
      
      expect(handleApiError).not.toHaveBeenCalled();
    });
  });

  describe('listResources', () => {
    it('should list resources with filter data', async () => {
      const mockResponse = {
        results: [{ id: '1' }, { id: '2' }],
        total: 2,
      };
      (userManagementApi.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await listResources('/api/resources', { status: 'active' });

      expect(result).toEqual(mockResponse);
      expect(userManagementApi.post).toHaveBeenCalledWith('/api/resources', { status: 'active' });
    });

    it('should list resources with query parameters', async () => {
      const mockResponse = {
        results: [{ id: '1' }],
        total: 1,
      };
      (userManagementApi.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await listResources(
        '/api/resources',
        { status: 'active' },
        { page: '1', size: '10' }
      );

      expect(result).toEqual(mockResponse);
      expect(userManagementApi.post).toHaveBeenCalledWith(
        '/api/resources?page=1&size=10',
        { status: 'active' }
      );
    });

    it('should list resources without filter data', async () => {
      const mockResponse = { results: [] };
      (userManagementApi.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await listResources('/api/resources');

      expect(result).toEqual(mockResponse);
      expect(userManagementApi.post).toHaveBeenCalledWith('/api/resources', {});
    });

    it('should use custom extractResult function', async () => {
      const mockResponse = { items: [{ id: '1' }], count: 1 };
      (userManagementApi.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await listResources(
        '/api/resources',
        {},
        {},
        {
          extractResult: (response) => response as { items: unknown[]; count: number },
        }
      );

      expect(result).toEqual({ items: [{ id: '1' }], count: 1 });
    });

    it('should handle API errors', async () => {
      const error = new Error('List failed');
      (userManagementApi.post as jest.Mock).mockRejectedValue(error);

      await expect(listResources('/api/resources'))
        .rejects.toThrow('List failed');
      
      expect(handleApiError).toHaveBeenCalledWith(error);
    });
  });

  describe('fetchPaginatedFilteredResources', () => {
    const mockFetch = fetchWithTokenRefresh as jest.MockedFunction<typeof fetchWithTokenRefresh>;
    const baseOptions = {
      urlPath: 'https://api.example.com/v1/items/filter',
      filterKey: 'items',
      filterName: undefined as string | undefined,
      params: { page: 0, size: 10 },
      serviceLabel: 'Test Service',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return paginated results (partial page)', async () => {
      const items = [{ id: '1' }, { id: '2' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: items }),
      } as Response);

      const result = await fetchPaginatedFilteredResources({ ...baseOptions });

      expect(result.content).toEqual(items);
      expect(result.totalElements).toBe(2);
      expect(result.totalPages).toBe(1);
      expect(result.number).toBe(0);
      expect(result.first).toBe(true);
      expect(result.last).toBe(true);
    });

    it('should use filterName when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      } as Response);

      await fetchPaginatedFilteredResources({ ...baseOptions, filterName: 'myItem' });

      const body = JSON.parse((mockFetch.mock.calls[0][1]?.body as string));
      expect(body.items).toEqual(['myItem']);
    });

    it('should use empty array when filterName is not provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      } as Response);

      await fetchPaginatedFilteredResources({ ...baseOptions, filterName: undefined });

      const body = JSON.parse((mockFetch.mock.calls[0][1]?.body as string));
      expect(body.items).toEqual([]);
    });

    it('should fetch total count when full page returned and use it', async () => {
      const fullPage = Array.from({ length: 10 }, (_, i) => ({ id: String(i) }));
      const allItems = Array.from({ length: 25 }, (_, i) => ({ id: String(i) }));

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ results: fullPage }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ results: allItems }),
        } as Response);

      const result = await fetchPaginatedFilteredResources({ ...baseOptions });

      expect(result.totalElements).toBe(25);
      expect(result.totalPages).toBe(3);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should estimate total when total count response is not ok', async () => {
      const fullPage = Array.from({ length: 10 }, (_, i) => ({ id: String(i) }));

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ results: fullPage }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({}),
        } as Response);

      const result = await fetchPaginatedFilteredResources({ ...baseOptions });

      // Falls back to page * size + results.length
      expect(result.totalElements).toBe(10);
    });

    it('should estimate total when total count fetch throws', async () => {
      const fullPage = Array.from({ length: 10 }, (_, i) => ({ id: String(i) }));

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ results: fullPage }),
        } as Response)
        .mockRejectedValueOnce(new Error('network error'));

      const result = await fetchPaginatedFilteredResources({ ...baseOptions });

      expect(result.totalElements).toBe(10);
    });

    it('should throw when response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      } as Response);

      await expect(fetchPaginatedFilteredResources({ ...baseOptions }))
        .rejects.toThrow('HTTP error! status: 500');
    });

    it('should rethrow Error instances on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('timeout'));

      await expect(fetchPaginatedFilteredResources({ ...baseOptions }))
        .rejects.toThrow('timeout');
    });

    it('should wrap non-Error throws', async () => {
      mockFetch.mockRejectedValueOnce('string error');

      await expect(fetchPaginatedFilteredResources({ ...baseOptions }))
        .rejects.toThrow('Failed to fetch items');
    });

    it('should handle page > 0 for last page calculation', async () => {
      const items = [{ id: '1' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: items }),
      } as Response);

      const result = await fetchPaginatedFilteredResources({
        ...baseOptions,
        params: { page: 2, size: 10 },
      });

      expect(result.number).toBe(2);
      expect(result.first).toBe(false);
      expect(result.totalElements).toBe(21); // page 2 * 10 + 1
    });
  });
});
