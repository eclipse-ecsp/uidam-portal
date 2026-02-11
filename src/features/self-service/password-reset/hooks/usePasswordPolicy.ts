/**
 * usePasswordPolicy Hook
 * 
 * Custom React Query hook to fetch and cache password policy configuration.
 * Provides automatic caching, background refetching, and error handling.
 * 
 * Cache Strategy:
 * - Stale time: 5 minutes (policy doesn't change frequently)
 * - Cache time: 10 minutes (keep in cache after component unmount)
 * - Retry: 2 attempts on failure
 * - Background refetch: Disabled (policy is static)
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { PasswordPolicyService } from '@/services/passwordPolicyService';
import type { PasswordPolicyItem } from '../types';
import { UI_CONFIG } from '../types';

/**
 * Query key for password policy
 * Consistent key for caching and invalidation
 */
export const PASSWORD_POLICY_QUERY_KEY = ['passwordPolicy'] as const;

/**
 * Hook to fetch password policy from API
 * Uses React Query for caching and automatic refetching
 * 
 * Features:
 * - Automatic caching (5 min stale time, 10 min cache time)
 * - Loading and error states
 * - Retry logic on failure
 * - Type-safe response
 * 
 * @returns {UseQueryResult} React Query result object with data, isLoading, error states
 * 
 * @example
 * ```tsx
 * function PasswordResetForm() {
 *   const { data: policies, isLoading, error } = usePasswordPolicy();
 * 
 *   if (isLoading) return <CircularProgress />;
 *   if (error) return <Alert severity="error">Failed to load policy</Alert>;
 * 
 *   return (
 *     <PasswordPolicyDisplay policies={policies || []} />
 *   );
 * }
 * ```
 */
export function usePasswordPolicy(): UseQueryResult<PasswordPolicyItem[], Error> {
  return useQuery<PasswordPolicyItem[], Error>({
    queryKey: PASSWORD_POLICY_QUERY_KEY,
    
    queryFn: async () => {
      const response = await PasswordPolicyService.getPasswordPolicy();
      return response.data || [];
    },

    // Cache configuration
    staleTime: UI_CONFIG.POLICY_STALE_TIME_MS, // 5 minutes
    gcTime: UI_CONFIG.POLICY_CACHE_TIME_MS, // 10 minutes (formerly cacheTime)
    
    // Retry configuration
    retry: 2, // Retry twice on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    
    // Refetch configuration
    refetchOnWindowFocus: false, // Don't refetch on window focus (policy is static)
    refetchOnReconnect: false, // Don't refetch on reconnect
    refetchOnMount: false, // Use cached data on mount if available
    
    // Error handling
    throwOnError: false, // Don't throw errors - handle in component
  });
}

/**
 * Helper hook to get required password policies only
 * Filters the full policy list to only required (enforced) policies
 * 
 * @returns {UseQueryResult} React Query result with only required policies
 * 
 * @example
 * ```tsx
 * function PasswordRequirements() {
 *   const { data: requiredPolicies } = useRequiredPasswordPolicies();
 * 
 *   return (
 *     <ul>
 *       {requiredPolicies?.map(policy => (
 *         <li key={policy.policyKey}>{policy.description}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useRequiredPasswordPolicies(): UseQueryResult<PasswordPolicyItem[], Error> {
  const query = usePasswordPolicy();

  return {
    ...query,
    data: query.data?.filter((p) => p.required) || [],
  } as UseQueryResult<PasswordPolicyItem[], Error>;
}

/**
 * Helper hook to get a specific policy rule value
 * Simplifies accessing nested policy configuration
 * 
 * @param {string} policyKey - The policy key to look up
 * @param {string} ruleKey - The rule key within the policy
 * @param {T} defaultValue - Default value if policy not found
 * @returns {T | undefined} The policy rule value or default
 * 
 * @example
 * ```tsx
 * function MinLengthDisplay() {
 *   const minLength = usePolicyRuleValue('MIN_LENGTH', 'minLength', 8);
 *   return <Typography>Minimum length: {minLength}</Typography>;
 * }
 * ```
 */
export function usePolicyRuleValue<T = unknown>(
  policyKey: string,
  ruleKey: string,
  defaultValue: T
): T | undefined {
  const { data: policies, isLoading } = usePasswordPolicy();

  if (isLoading || !policies) {
    return defaultValue;
  }

  const policy = policies.find((p) => p.policyKey === policyKey);
  if (!policy || !policy.rules) {
    return defaultValue;
  }

  const value = policy.rules[ruleKey];
  return value !== undefined ? (value as T) : defaultValue;
}

/**
 * Helper hook to check if password policy is available
 * Useful for conditional rendering based on policy availability
 * 
 * @returns {boolean} True if policy is loaded and available
 * 
 * @example
 * ```tsx
 * function PasswordForm() {
 *   const isPolicyAvailable = useIsPolicyAvailable();
 * 
 *   return (
 *     <form>
 *       <TextField label="Password" />
 *       {isPolicyAvailable && <PasswordPolicyDisplay />}
 *     </form>
 *   );
 * }
 * ```
 */
export function useIsPolicyAvailable(): boolean {
  const { data, isLoading, error } = usePasswordPolicy();
  return !isLoading && !error && !!data && data.length > 0;
}
