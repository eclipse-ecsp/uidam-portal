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
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleFilterRequest,
  PaginatedResponse,
  FilterParams,
} from '@/types';
import { API_CONFIG } from '@/config/app.config';
import { userManagementApi } from './api-client';
import { createResource, updateResource, deleteResource, getResource, buildQueryParams } from '@/utils/serviceHelpers';
import { getApiHeaders } from './apiUtils';

export class RoleService {
  async getRoles(params: FilterParams & { filter?: RoleFilterRequest }): Promise<PaginatedResponse<Role>> {
    // Build filter request - backend requires roles field even if empty
    const filterRequest: Record<string, string[]> = {
      roles: params.filter?.name ? [params.filter.name] : []
    };

    const queryParams = buildQueryParams({
      page: params.page,
      pageSize: params.size,
    });

    const urlPath = `${API_CONFIG.API_BASE_URL}/v1/roles/filter`;
    const finalUrl = queryParams ? `${urlPath}?${new URLSearchParams(queryParams)}` : urlPath;

    const correlationId = crypto.randomUUID();
    console.log('Role Service - Getting roles:', { url: finalUrl, filterRequest, correlationId });

    try {
      const response = await fetch(finalUrl, {
        method: 'POST',
        headers: {
          ...getApiHeaders(),
          'X-Correlation-ID': correlationId,
        },
        body: JSON.stringify(filterRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Role Service - HTTP error:', { status: response.status, error: errorText, correlationId });
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data: { results?: Role[]; messages?: string[] } = await response.json();
      const results = data.results || [];
      
      console.log('Role Service - Success:', { resultsCount: results.length, correlationId });
      
      return {
        content: results,
        totalElements: results.length,
        totalPages: Math.ceil(results.length / params.size),
        size: params.size,
        number: params.page,
        first: params.page === 0,
        last: params.page >= Math.ceil(results.length / params.size) - 1,
      };
    } catch (error: unknown) {
      console.error('Role Service - Error details:', { error, correlationId });
      throw error instanceof Error ? error : new Error('Failed to fetch roles');
    }
  }

  async getRoleByName(name: string): Promise<Role> {
    console.log('Role Service - Getting role by name:', name);
    return getResource<Role>(`/v1/roles/${name}`);
  }

  async getRolesByIds(roleIds: number[]): Promise<Role[]> {
    console.log('Role Service - Getting roles by IDs:', roleIds);
    const response: { results?: Role[] } = await userManagementApi.post('/v1/roles/rolesById', { roleId: roleIds });
    return response.results || [];
  }

  async createRole(roleData: CreateRoleRequest): Promise<Role> {
    console.log('=== CREATE ROLE DEBUG START ===');
    console.log('Role Service - Creating role with data:', roleData);
    
    const role = await createResource<CreateRoleRequest, Role>('/v1/roles', roleData, {
      errorMessage: 'Failed to create role: No result returned'
    });
    
    console.log('Returning created role:', role);
    console.log('=== CREATE ROLE DEBUG END ===');
    return role;
  }

  async updateRole(name: string, roleData: UpdateRoleRequest): Promise<Role> {
    console.log('=== UPDATE ROLE DEBUG START ===');
    console.log('Role Service - Updating role with data:', { name, roleData });
    
    const role = await updateResource<UpdateRoleRequest, Role>(`/v1/roles/${name}`, roleData, {
      errorMessage: `Failed to update role ${name}: No result returned`
    });
    
    console.log('Returning updated role:', role);
    console.log('=== UPDATE ROLE DEBUG END ===');
    return role;
  }

  async deleteRole(name: string): Promise<void> {
    console.log('Role Service - Deleting role:', name);
    await deleteResource(`/v1/roles/${name}`);
  }

  async getAllRoles(): Promise<Role[]> {
    console.log('Role Service - Getting all roles');
    const response = await this.getRoles({
      page: 0,
      size: 1000,
    });
    return response.content;
  }

  // Legacy methods for backward compatibility
  async assignScopesToRole(roleName: string, scopeNames: string[]): Promise<Role> {
    return this.updateRole(roleName, { scopeNames });
  }

  async removeScopesFromRole(roleName: string, scopeNames: string[]): Promise<Role> {
    const currentRole = await this.getRoleByName(roleName);
    const currentScopeNames = currentRole.scopes?.map(scope => scope.name) || [];
    const updatedScopeNames = currentScopeNames.filter(name => !scopeNames.includes(name));
    
    return this.updateRole(roleName, { scopeNames: updatedScopeNames });
  }
}

export const roleService = new RoleService();
