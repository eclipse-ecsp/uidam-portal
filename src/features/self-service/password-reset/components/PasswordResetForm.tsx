/**
 * PasswordResetForm Component
 * 
 * Main form component for authenticated user password reset.
 * Implements FR1-FR5 from spec.md with Material-UI components.
 * 
 * Features:
 * - Current password field with show/hide toggle
 * - New password field with show/hide toggle  
 * - Confirm password field with show/hide toggle
 * - Real-time password strength indicator (linear progress bar)
 * - On-change validation with inline error messages
 * - Submit button with loading spinner
 * - Form-level error handling
 * 
 * Validation:
 * - Yup schema validation via React Hook Form
 * - Password policy enforcement
 * - Real-time feedback on field blur/change
 * 
 * @component
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Typography,
  LinearProgress,
  Alert,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockReset as LockResetIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { passwordResetSchema } from '../schemas/passwordResetSchema';
import { usePasswordPolicy } from '../hooks/usePasswordPolicy';
import { usePasswordResetMutation } from '../hooks/usePasswordResetMutation';
import { calculatePasswordStrength, getStrengthColor, getStrengthLevel } from '../utils/passwordStrength';
import { validatePasswordPolicy } from '../utils/passwordValidation';
import type { PasswordResetFormData, PasswordStrength } from '../types';
import { UI_CONFIG } from '../types';

/**
 * Props for PasswordResetForm component
 */
interface PasswordResetFormProps {
  /**
   * Callback invoked on successful password reset
   * @param data - Form data submitted
   */
  onSuccess?: (data: PasswordResetFormData) => void;

  /**
   * Callback invoked on password reset error
   * @param error - Error object
   */
  onError?: (error: Error) => void;

  /**
   * Whether to show the form header
   * @default true
   */
  showHeader?: boolean;

  /**
   * Custom submit button text
   * @default 'Reset Password'
   */
  submitButtonText?: string;

  /**
   * Additional CSS class for form container
   */
  className?: string;
}

/**
 * Password Reset Form Component
 * 
 * Implements authenticated user password reset with:
 * - Three password fields (current, new, confirm)
 * - Real-time strength calculation and validation
 * - Policy-based validation rules
 * - Loading states and error handling
 * 
 * @example
 * ```tsx
 * <PasswordResetForm
 *   onSuccess={() => navigate('/profile')}
 *   onError={(error) => console.error(error)}
 * />
 * ```
 */
export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  onSuccess,
  onError,
  showHeader = true,
  submitButtonText = 'Reset Password',
  className,
}) => {
  // Password visibility state (separate for each field)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch password policy
  const {
    data: passwordPolicies,
    isLoading: isPolicyLoading,
    error: policyError,
  } = usePasswordPolicy();

  // Password reset mutation
  const passwordResetMutation = usePasswordResetMutation({
    onSuccess: (data, variables) => {
      onSuccess?.(variables);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
    setError,
    clearErrors,
  } = useForm<PasswordResetFormData>({
    resolver: yupResolver(passwordResetSchema),
    mode: 'onChange', // Validate on change for real-time feedback
    reValidateMode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Watch password fields for strength calculation and validation
  const newPassword = watch('newPassword');
  const currentPassword = watch('currentPassword');

  // Calculate password strength
  const passwordStrength = useMemo(() => {
    if (!newPassword || !passwordPolicies) return 0;
    return calculatePasswordStrength(newPassword, passwordPolicies);
  }, [newPassword, passwordPolicies]);

  // Get strength level and color
  const strengthLevel: PasswordStrength = useMemo(
    () => getStrengthLevel(passwordStrength),
    [passwordStrength]
  );

  const strengthColor = useMemo(
    () => getStrengthColor(strengthLevel),
    [strengthLevel]
  );

  // Validate password against policy on change
  const policyValidationErrors = useMemo(() => {
    if (!newPassword || !passwordPolicies) return [];
    
    return validatePasswordPolicy(newPassword, passwordPolicies, {
      currentPassword,
    });
  }, [newPassword, currentPassword, passwordPolicies]);

  // Toggle password visibility handlers
  const handleToggleCurrentPassword = useCallback(() => {
    setShowCurrentPassword((prev) => !prev);
  }, []);

  const handleToggleNewPassword = useCallback(() => {
    setShowNewPassword((prev) => !prev);
  }, []);

  const handleToggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  // Form submission handler
  const onSubmit = useCallback(
    async (data: PasswordResetFormData) => {
      // Clear previous errors
      clearErrors();

      // Validate against password policy before submission
      if (policyValidationErrors.length > 0) {
        setError('newPassword', {
          type: 'manual',
          message: policyValidationErrors[0].message,
        });
        return;
      }

      // Submit password reset
      try {
        await passwordResetMutation.mutateAsync(data);
      } catch (error) {
        // Error handled by mutation hook
        console.error('[PasswordResetForm] Submission error:', error);
      }
    },
    [policyValidationErrors, passwordResetMutation, clearErrors, setError]
  );

  // Loading state
  if (isPolicyLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Policy error state
  if (policyError) {
    return (
      <Alert severity="error">
        Failed to load password policy. Please refresh the page or contact support.
      </Alert>
    );
  }

  return (
    <Paper elevation={2} className={className}>
      <Box p={3}>
        {/* Header */}
        {showHeader && (
          <Box mb={3} textAlign="center">
            <LockResetIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" component="h1" gutterBottom>
              Reset Your Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your current password and choose a new secure password
            </Typography>
          </Box>
        )}

        {/* Form-level error */}
        {passwordResetMutation.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {passwordResetMutation.error.message ||
              'Failed to reset password. Please try again.'}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box display="flex" flexDirection="column" gap={2.5}>
            {/* Current Password Field */}
            <Controller
              name="currentPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type={showCurrentPassword ? 'text' : 'password'}
                  label="Current Password"
                  placeholder="Enter your current password"
                  required
                  fullWidth
                  error={!!errors.currentPassword}
                  helperText={errors.currentPassword?.message}
                  disabled={passwordResetMutation.isPending}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle current password visibility"
                          onClick={handleToggleCurrentPassword}
                          edge="end"
                          size="small"
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{
                    'aria-label': 'Current password',
                    autoComplete: 'current-password',
                    maxLength: UI_CONFIG.MAX_PASSWORD_LENGTH,
                  }}
                />
              )}
            />

            {/* New Password Field */}
            <Box>
              <Controller
                name="newPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showNewPassword ? 'text' : 'password'}
                    label="New Password"
                    placeholder="Enter your new password"
                    required
                    fullWidth
                    error={!!errors.newPassword}
                    helperText={errors.newPassword?.message}
                    disabled={passwordResetMutation.isPending}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle new password visibility"
                            onClick={handleToggleNewPassword}
                            edge="end"
                            size="small"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{
                      'aria-label': 'New password',
                      autoComplete: 'new-password',
                      maxLength: UI_CONFIG.MAX_PASSWORD_LENGTH,
                    }}
                  />
                )}
              />

              {/* Password Strength Indicator */}
              {newPassword && (
                <Box mt={1}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Password Strength
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: `${strengthColor}.main`,
                        fontWeight: 'medium',
                        textTransform: 'capitalize',
                      }}
                    >
                      {strengthLevel}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength}
                    sx={{
                      height: 6,
                      borderRadius: 1,
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: `${strengthColor}.main`,
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>
              )}

              {/* Policy Validation Errors */}
              {policyValidationErrors.length > 0 && (
                <Box mt={1}>
                  <Alert severity="warning" sx={{ py: 0.5 }}>
                    <Typography variant="caption" component="div">
                      {policyValidationErrors[0].message}
                    </Typography>
                  </Alert>
                </Box>
              )}
            </Box>

            {/* Confirm Password Field */}
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm New Password"
                  placeholder="Re-enter your new password"
                  required
                  fullWidth
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  disabled={passwordResetMutation.isPending}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={handleToggleConfirmPassword}
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{
                    'aria-label': 'Confirm new password',
                    autoComplete: 'new-password',
                    maxLength: UI_CONFIG.MAX_PASSWORD_LENGTH,
                  }}
                />
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={
                !isDirty ||
                !isValid ||
                passwordResetMutation.isPending ||
                policyValidationErrors.length > 0
              }
              startIcon={
                passwordResetMutation.isPending ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <LockResetIcon />
                )
              }
              sx={{ mt: 1 }}
            >
              {passwordResetMutation.isPending ? 'Resetting...' : submitButtonText}
            </Button>
          </Box>
        </form>
      </Box>
    </Paper>
  );
};

export default PasswordResetForm;
