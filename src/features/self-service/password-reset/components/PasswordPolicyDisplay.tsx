/**
 * PasswordPolicyDisplay Component
 * 
 * Displays password policy requirements in a readable list format.
 * Shows validation status for each policy rule.
 * 
 * Features:
 * - List of policy requirements with descriptions
 * - Validation status icons (checkmark/cross)
 * - Color-coded validation states (success/error)
 * - Support for both required and optional policies
 * - Responsive layout
 * 
 * @component
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  type SxProps,
  type Theme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import type { PasswordPolicyItem, PasswordValidationError } from '../types';
import { validatePasswordPolicy } from '../utils/passwordValidation';

/**
 * Props for PasswordPolicyDisplay component
 */
interface PasswordPolicyDisplayProps {
  /**
   * Password policy items to display
   */
  policies: PasswordPolicyItem[];

  /**
   * Current password value for validation
   * If provided, shows validation status for each policy
   */
  password?: string;

  /**
   * Current password for "not same as current" validation
   */
  currentPassword?: string;

  /**
   * Username for "not matching username" validation
   */
  username?: string;

  /**
   * Email for "not matching email" validation
   */
  email?: string;

  /**
   * Whether to show only required policies
   * @default false
   */
  showRequiredOnly?: boolean;

  /**
   * Whether to show validation status icons
   * @default true when password is provided
   */
  showValidationStatus?: boolean;

  /**
   * Whether to show policy descriptions
   * @default true
   */
  showDescriptions?: boolean;

  /**
   * Header title text
   * @default 'Password Requirements'
   */
  title?: string;

  /**
   * Whether to show the header
   * @default true
   */
  showHeader?: boolean;

  /**
   * Additional CSS styles for container
   */
  sx?: SxProps<Theme>;

  /**
   * CSS class name for container
   */
  className?: string;
}

/**
 * Password Policy Display Component
 * 
 * Shows a list of password policy requirements with optional validation status.
 * Useful for:
 * - Displaying policy rules before user enters password
 * - Showing real-time validation feedback as user types
 * - Highlighting which requirements are met/unmet
 * 
 * @example
 * ```tsx
 * // Static policy display (no validation)
 * <PasswordPolicyDisplay policies={policies} />
 * 
 * // With validation
 * <PasswordPolicyDisplay
 *   policies={policies}
 *   password={userPassword}
 *   currentPassword={currentPassword}
 *   showValidationStatus
 * />
 * ```
 */
export const PasswordPolicyDisplay: React.FC<PasswordPolicyDisplayProps> = ({
  policies,
  password,
  currentPassword,
  username,
  email,
  showRequiredOnly = false,
  showValidationStatus,
  showDescriptions = true,
  title = 'Password Requirements',
  showHeader = true,
  sx,
  className,
}) => {
  // Filter policies if showing required only
  const displayedPolicies = useMemo(() => {
    if (showRequiredOnly) {
      return policies.filter((p) => p.required);
    }
    return policies;
  }, [policies, showRequiredOnly]);

  // Validate password against policies
  const validationErrors = useMemo(() => {
    if (!password) return [];
    
    return validatePasswordPolicy(password, policies, {
      currentPassword,
      username,
      email,
    });
  }, [password, policies, currentPassword, username, email]);

  // Create map of policy key to validation status
  const validationStatusMap = useMemo(() => {
    const map = new Map<string, boolean>();
    
    if (!password) return map;

    // Mark all policies as valid initially
    displayedPolicies.forEach((policy) => {
      map.set(policy.policyKey, true);
    });

    // Mark policies with errors as invalid
    validationErrors.forEach((error) => {
      if (error.policyKey) {
        map.set(error.policyKey, false);
      }
    });

    return map;
  }, [password, displayedPolicies, validationErrors]);

  // Determine if validation status should be shown
  const shouldShowStatus = showValidationStatus ?? !!password;

  // Generate display text for policy
  const getPolicyDisplayText = (policy: PasswordPolicyItem): string => {
    if (showDescriptions && policy.description) {
      return policy.description;
    }

    // Fallback to generating text from policy rules
    const { policyKey, rules } = policy;

    switch (policyKey) {
      case 'MIN_LENGTH':
        return `At least ${rules?.minLength || 8} characters`;
      
      case 'COMPLEXITY':
        const complexityParts: string[] = [];
        if (rules?.uppercase) complexityParts.push('uppercase letter');
        if (rules?.lowercase) complexityParts.push('lowercase letter');
        if (rules?.digit) complexityParts.push('number');
        if (rules?.specialChar) complexityParts.push('special character');
        return `Contains ${complexityParts.join(', ')}`;
      
      case 'HISTORY':
        return `Cannot reuse last ${rules?.historyCount || 5} passwords`;
      
      case 'NOT_SAME_AS_CURRENT':
        return 'Must be different from current password';
      
      case 'NOT_MATCHING_USERNAME':
        return 'Must not contain username or email';
      
      default:
        return policy.description || 'Policy requirement';
    }
  };

  // Empty state
  if (displayedPolicies.length === 0) {
    return (
      <Alert severity="info" sx={sx} className={className}>
        No password policies configured
      </Alert>
    );
  }

  return (
    <Box sx={sx} className={className}>
      {/* Header */}
      {showHeader && (
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
          <InfoIcon fontSize="small" color="action" />
          <Typography variant="subtitle2" component="h3" fontWeight="medium">
            {title}
          </Typography>
        </Box>
      )}

      {/* Policy List */}
      <List dense disablePadding>
        {displayedPolicies.map((policy) => {
          const isValid = validationStatusMap.get(policy.policyKey);
          const displayText = getPolicyDisplayText(policy);

          return (
            <ListItem
              key={policy.policyKey}
              disablePadding
              sx={{
                py: 0.5,
                transition: 'opacity 0.2s ease',
                opacity: shouldShowStatus && isValid ? 0.7 : 1,
              }}
            >
              {/* Validation Icon */}
              {shouldShowStatus && (
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {isValid ? (
                    <CheckCircleIcon
                      fontSize="small"
                      sx={{ color: 'success.main' }}
                      aria-label="Requirement met"
                    />
                  ) : (
                    <CancelIcon
                      fontSize="small"
                      sx={{ color: 'error.main' }}
                      aria-label="Requirement not met"
                    />
                  )}
                </ListItemIcon>
              )}

              {/* Policy Text */}
              <ListItemText
                primary={displayText}
                primaryTypographyProps={{
                  variant: 'body2',
                  sx: {
                    color: shouldShowStatus
                      ? isValid
                        ? 'success.main'
                        : 'error.main'
                      : 'text.primary',
                  },
                }}
              />

              {/* Required Badge */}
              {!policy.required && (
                <Typography
                  variant="caption"
                  sx={{
                    ml: 1,
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 0.5,
                    backgroundColor: 'grey.200',
                    color: 'text.secondary',
                    fontSize: '0.7rem',
                  }}
                >
                  Optional
                </Typography>
              )}
            </ListItem>
          );
        })}
      </List>

      {/* Validation Summary */}
      {shouldShowStatus && validationErrors.length > 0 && (
        <Alert severity="warning" sx={{ mt: 1.5, py: 0.5 }}>
          <Typography variant="caption">
            {validationErrors.length === 1
              ? '1 requirement not met'
              : `${validationErrors.length} requirements not met`}
          </Typography>
        </Alert>
      )}

      {shouldShowStatus && validationErrors.length === 0 && password && (
        <Alert severity="success" sx={{ mt: 1.5, py: 0.5 }}>
          <Typography variant="caption">All requirements met</Typography>
        </Alert>
      )}
    </Box>
  );
};

/**
 * Compact version showing only required policies
 * 
 * @example
 * ```tsx
 * <RequiredPasswordPolicyDisplay
 *   policies={policies}
 *   password={password}
 * />
 * ```
 */
export const RequiredPasswordPolicyDisplay: React.FC<
  Omit<PasswordPolicyDisplayProps, 'showRequiredOnly'>
> = (props) => {
  return <PasswordPolicyDisplay {...props} showRequiredOnly />;
};

/**
 * Simple policy list without validation status
 * Useful for displaying requirements before user starts typing
 * 
 * @example
 * ```tsx
 * <StaticPasswordPolicyDisplay policies={policies} />
 * ```
 */
export const StaticPasswordPolicyDisplay: React.FC<
  Omit<PasswordPolicyDisplayProps, 'showValidationStatus' | 'password'>
> = (props) => {
  return <PasswordPolicyDisplay {...props} showValidationStatus={false} />;
};

export default PasswordPolicyDisplay;
