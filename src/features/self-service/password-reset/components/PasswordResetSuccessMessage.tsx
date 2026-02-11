/**
 * PasswordResetSuccessMessage Component
 * 
 * Success message displayed after password reset completion.
 * Shows confirmation and next steps to the user.
 * 
 * Features:
 * - Success icon and message
 * - Next steps instructions
 * - Optional action buttons
 * - Auto-dismiss timer option
 * 
 * @component
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
  Paper,
  type SxProps,
  type Theme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Login as LoginIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

/**
 * Props for PasswordResetSuccessMessage component
 */
interface PasswordResetSuccessMessageProps {
  /**
   * Custom success message
   * @default 'Your password has been successfully reset'
   */
  message?: string;

  /**
   * Whether to show next steps instructions
   * @default true
   */
  showNextSteps?: boolean;

  /**
   * Whether to show action buttons
   * @default true
   */
  showActions?: boolean;

  /**
   * Callback when "Continue" button is clicked
   */
  onContinue?: () => void;

  /**
   * Callback when "Sign In" button is clicked
   */
  onSignIn?: () => void;

  /**
   * Continue button text
   * @default 'Continue'
   */
  continueButtonText?: string;

  /**
   * Sign in button text
   * @default 'Sign In Now'
   */
  signInButtonText?: string;

  /**
   * Auto-dismiss after specified milliseconds
   * If provided, message will auto-dismiss after this duration
   */
  autoDismissMs?: number;

  /**
   * Callback when auto-dismiss timer expires
   */
  onAutoDismiss?: () => void;

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
 * Password Reset Success Message Component
 * 
 * Displays confirmation after successful password reset with:
 * - Success icon and message
 * - Next steps information
 * - Action buttons (Continue/Sign In)
 * - Optional auto-dismiss
 * 
 * @example
 * ```tsx
 * <PasswordResetSuccessMessage
 *   onContinue={() => navigate('/profile')}
 *   onSignIn={() => navigate('/login')}
 * />
 * ```
 */
export const PasswordResetSuccessMessage: React.FC<PasswordResetSuccessMessageProps> = ({
  message = 'Your password has been successfully reset',
  showNextSteps = true,
  showActions = true,
  onContinue,
  onSignIn,
  continueButtonText = 'Continue',
  signInButtonText = 'Sign In Now',
  autoDismissMs,
  onAutoDismiss,
  sx,
  className,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    autoDismissMs ? Math.ceil(autoDismissMs / 1000) : null
  );

  // Auto-dismiss timer
  useEffect(() => {
    if (!autoDismissMs || !onAutoDismiss) return;

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);

    // Auto-dismiss timeout
    const dismissTimeout = setTimeout(() => {
      onAutoDismiss();
    }, autoDismissMs);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(dismissTimeout);
    };
  }, [autoDismissMs, onAutoDismiss]);

  return (
    <Paper elevation={2} sx={sx} className={className}>
      <Box p={3}>
        {/* Success Icon */}
        <Box textAlign="center" mb={2}>
          <CheckCircleIcon
            sx={{
              fontSize: 64,
              color: 'success.main',
              animation: 'fadeInScale 0.5s ease-out',
              '@keyframes fadeInScale': {
                '0%': {
                  opacity: 0,
                  transform: 'scale(0.5)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'scale(1)',
                },
              },
            }}
          />
        </Box>

        {/* Success Message */}
        <Alert
          severity="success"
          icon={false}
          sx={{
            mb: showNextSteps ? 2 : 0,
            '& .MuiAlert-message': {
              width: '100%',
            },
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            textAlign="center"
            gutterBottom
            fontWeight="medium"
          >
            Password Reset Successful!
          </Typography>
          <Typography variant="body2" textAlign="center" color="text.secondary">
            {message}
          </Typography>

          {/* Auto-dismiss countdown */}
          {timeRemaining !== null && timeRemaining > 0 && (
            <Typography
              variant="caption"
              textAlign="center"
              display="block"
              sx={{ mt: 1, color: 'text.secondary' }}
            >
              Redirecting in {timeRemaining} second{timeRemaining !== 1 ? 's' : ''}...
            </Typography>
          )}
        </Alert>

        {/* Next Steps */}
        {showNextSteps && (
          <Box mb={showActions ? 3 : 0}>
            <Typography variant="subtitle2" gutterBottom fontWeight="medium">
              What's Next?
            </Typography>
            <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
              <Typography component="li" variant="body2" color="text.secondary" mb={0.5}>
                Your new password is now active
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary" mb={0.5}>
                You'll need to sign in again with your new password
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Keep your password secure and don't share it with anyone
              </Typography>
            </Box>
          </Box>
        )}

        {/* Action Buttons */}
        {showActions && (
          <Box display="flex" flexDirection="column" gap={1.5}>
            {onContinue && (
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={onContinue}
                endIcon={<ArrowForwardIcon />}
              >
                {continueButtonText}
              </Button>
            )}
            {onSignIn && (
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={onSignIn}
                startIcon={<LoginIcon />}
              >
                {signInButtonText}
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

/**
 * Compact success message without next steps or actions
 * Useful for inline success notifications
 * 
 * @example
 * ```tsx
 * <CompactPasswordResetSuccessMessage />
 * ```
 */
export const CompactPasswordResetSuccessMessage: React.FC<
  Omit<PasswordResetSuccessMessageProps, 'showNextSteps' | 'showActions'>
> = (props) => {
  return (
    <PasswordResetSuccessMessage
      {...props}
      showNextSteps={false}
      showActions={false}
    />
  );
};

/**
 * Success message with auto-redirect
 * Automatically redirects after specified duration
 * 
 * @example
 * ```tsx
 * <AutoRedirectPasswordResetSuccessMessage
 *   autoDismissMs={5000}
 *   onAutoDismiss={() => navigate('/login')}
 * />
 * ```
 */
export const AutoRedirectPasswordResetSuccessMessage: React.FC<
  PasswordResetSuccessMessageProps
> = (props) => {
  const { autoDismissMs = 5000, ...rest } = props;
  return <PasswordResetSuccessMessage {...rest} autoDismissMs={autoDismissMs} />;
};

export default PasswordResetSuccessMessage;
