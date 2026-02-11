/**
 * Yup Validation Schema for Password Reset Form
 * 
 * Defines validation rules for the password reset form fields.
 * Integrates with React Hook Form via yupResolver for form validation.
 * 
 * Validation Rules:
 * - currentPassword: Required
 * - newPassword: Required, min 8 chars, complexity requirements, policy checks
 * - confirmPassword: Required, must match newPassword
 */

import * as yup from 'yup';
import type { PasswordResetFormData } from '../types';

/**
 * Password reset form validation schema
 * 
 * This schema provides client-side validation before API submission.
 * Server-side validation is authoritative - these rules are advisory only.
 * 
 * Usage with React Hook Form:
 * ```tsx
 * const { register, handleSubmit } = useForm({
 *   resolver: yupResolver(passwordResetSchema),
 * });
 * ```
 */
export const passwordResetSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Current password is required')
    .min(1, 'Current password cannot be empty'),

  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .test(
      'not-same-as-current',
      'New password must be different from current password',
      function (value) {
        const { currentPassword } = this.parent;
        if (!value || !currentPassword) return true;
        return value !== currentPassword;
      }
    )
    .test(
      'has-uppercase',
      'Password must contain at least one uppercase letter',
      (value) => {
        if (!value) return true;
        return /[A-Z]/.test(value);
      }
    )
    .test(
      'has-lowercase',
      'Password must contain at least one lowercase letter',
      (value) => {
        if (!value) return true;
        return /[a-z]/.test(value);
      }
    )
    .test(
      'has-digit',
      'Password must contain at least one digit',
      (value) => {
        if (!value) return true;
        return /\d/.test(value);
      }
    )
    .test(
      'has-special-char',
      'Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)',
      (value) => {
        if (!value) return true;
        return /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(value);
      }
    ),

  confirmPassword: yup
    .string()
    .required('Please confirm your new password')
    .test(
      'passwords-match',
      'Passwords must match',
      function (value) {
        const { newPassword } = this.parent;
        if (!value || !newPassword) return true;
        return value === newPassword;
      }
    ),
}).required();

/**
 * TypeScript type inferred from schema
 * Should match PasswordResetFormData interface
 */
export type PasswordResetSchemaType = yup.InferType<typeof passwordResetSchema>;

/**
 * Helper function to validate password against schema programmatically
 * Useful for pre-submission validation or testing
 * 
 * @param data - Form data to validate
 * @returns Promise resolving to validated data or rejecting with validation error
 * 
 * @example
 * ```ts
 * try {
 *   const validData = await validatePasswordResetForm(formData);
 *   // Proceed with API call
 * } catch (error) {
 *   // Handle validation errors
 * }
 * ```
 */
export async function validatePasswordResetForm(
  data: PasswordResetFormData
): Promise<PasswordResetFormData> {
  return passwordResetSchema.validate(data, { abortEarly: false });
}

/**
 * Helper function to validate a single field
 * Useful for real-time validation as user types
 * 
 * @param fieldName - Name of the field to validate
 * @param value - Value to validate
 * @param context - Optional context (e.g., other field values for comparison)
 * @returns Promise resolving to true if valid, or rejecting with error message
 * 
 * @example
 * ```ts
 * const isValid = await validateField('newPassword', password);
 * ```
 */
export async function validateField(
  fieldName: keyof PasswordResetFormData,
  value: string,
  context?: Partial<PasswordResetFormData>
): Promise<boolean> {
  try {
    await passwordResetSchema.validateAt(fieldName, { ...context, [fieldName]: value });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Extract error message from Yup validation error
 * 
 * @param error - Yup validation error
 * @param fieldName - Field name to get error for
 * @returns Error message string or undefined if no error
 */
export function getFieldError(
  error: yup.ValidationError | unknown,
  fieldName: keyof PasswordResetFormData
): string | undefined {
  if (error instanceof yup.ValidationError) {
    const fieldError = error.inner.find((err) => err.path === fieldName);
    return fieldError?.message;
  }
  return undefined;
}
