/**
 * PasswordStrengthIndicator Component
 * 
 * Visual indicator for password strength with linear progress bar.
 * Displays strength level and color-coded progress.
 * 
 * Features:
 * - Linear progress bar (0-100%)
 * - Color coding (red/orange/green based on strength)
 * - Strength level label (Weak/Fair/Good/Strong)
 * - Accessible ARIA labels
 * 
 * @component
 */

import React from 'react';
import { Box, LinearProgress, Typography, type SxProps, type Theme } from '@mui/material';
import type { PasswordStrength } from '../types';
import { getStrengthColor } from '../utils/passwordStrength';

/**
 * Props for PasswordStrengthIndicator component
 */
interface PasswordStrengthIndicatorProps {
  /**
   * Password strength value (0-100)
   * 0 = weakest, 100 = strongest
   */
  strength: number;

  /**
   * Password strength level
   * 'weak' | 'fair' | 'good' | 'strong'
   */
  strengthLevel: PasswordStrength;

  /**
   * Whether to show the strength label
   * @default true
   */
  showLabel?: boolean;

  /**
   * Whether to show the strength value as percentage
   * @default false
   */
  showPercentage?: boolean;

  /**
   * Custom label text (overrides default)
   */
  label?: string;

  /**
   * Height of progress bar in pixels
   * @default 6
   */
  barHeight?: number;

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
 * Password Strength Indicator Component
 * 
 * Displays visual feedback for password strength using:
 * - Linear progress bar with dynamic color
 * - Text label showing strength level
 * - Optional percentage display
 * 
 * Colors:
 * - Red (error): Weak (0-40%)
 * - Orange (warning): Fair (41-70%)
 * - Green (success): Good/Strong (71-100%)
 * 
 * @example
 * ```tsx
 * <PasswordStrengthIndicator
 *   strength={75}
 *   strengthLevel="good"
 *   showLabel
 * />
 * ```
 */
export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  strength,
  strengthLevel,
  showLabel = true,
  showPercentage = false,
  label,
  barHeight = 6,
  sx,
  className,
}) => {
  // Get color based on strength level
  const strengthColor = getStrengthColor(strengthLevel);

  // Ensure strength is clamped to 0-100
  const clampedStrength = Math.min(Math.max(strength, 0), 100);

  // Label text (default or custom)
  const labelText = label || 'Password Strength';

  // Value text (level or percentage)
  const valueText = showPercentage
    ? `${clampedStrength}%`
    : strengthLevel.charAt(0).toUpperCase() + strengthLevel.slice(1);

  return (
    <Box sx={sx} className={className}>
      {/* Label Row */}
      {showLabel && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={0.5}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            component="span"
            id="password-strength-label"
          >
            {labelText}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: `${strengthColor}.main`,
              fontWeight: 'medium',
              textTransform: 'capitalize',
            }}
            component="span"
            aria-live="polite"
            aria-atomic="true"
          >
            {valueText}
          </Typography>
        </Box>
      )}

      {/* Progress Bar */}
      <LinearProgress
        variant="determinate"
        value={clampedStrength}
        aria-label="Password strength indicator"
        aria-labelledby={showLabel ? 'password-strength-label' : undefined}
        aria-valuenow={clampedStrength}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${valueText} - ${clampedStrength}%`}
        sx={{
          height: barHeight,
          borderRadius: 1,
          backgroundColor: 'grey.200',
          '& .MuiLinearProgress-bar': {
            backgroundColor: `${strengthColor}.main`,
            borderRadius: 1,
            transition: 'transform 0.3s ease, background-color 0.3s ease',
          },
        }}
      />
    </Box>
  );
};

/**
 * Compact version of PasswordStrengthIndicator
 * Shows only progress bar without label
 * 
 * @example
 * ```tsx
 * <CompactPasswordStrengthIndicator
 *   strength={60}
 *   strengthLevel="fair"
 * />
 * ```
 */
export const CompactPasswordStrengthIndicator: React.FC<
  Omit<PasswordStrengthIndicatorProps, 'showLabel'>
> = (props) => {
  return <PasswordStrengthIndicator {...props} showLabel={false} />;
};

/**
 * Password strength indicator with percentage display
 * Shows strength percentage instead of level name
 * 
 * @example
 * ```tsx
 * <PercentagePasswordStrengthIndicator
 *   strength={85}
 *   strengthLevel="strong"
 * />
 * ```
 */
export const PercentagePasswordStrengthIndicator: React.FC<
  Omit<PasswordStrengthIndicatorProps, 'showPercentage'>
> = (props) => {
  return <PasswordStrengthIndicator {...props} showPercentage />;
};

export default PasswordStrengthIndicator;
