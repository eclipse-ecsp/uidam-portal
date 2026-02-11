/**
 * ErrorAlert Component
 * 
 * Reusable error alert component for displaying error messages.
 * Supports different severity levels and action buttons.
 * 
 * Features:
 * - Error message display with icon
 * - Multiple severity levels
 * - Optional retry/dismiss actions
 * - Auto-dismiss capability
 * - Correlation ID display for debugging
 * 
 * @component
 */

import React, { useEffect, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  Box,
  Collapse,
  IconButton,
  Typography,
  type AlertColor,
  type SxProps,
  type Theme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

/**
 * Props for ErrorAlert component
 */
interface ErrorAlertProps {
  /**
   * Error message to display
   */
  message: string;

  /**
   * Alert title (optional)
   */
  title?: string;

  /**
   * Severity level
   * @default 'error'
   */
  severity?: AlertColor;

  /**
   * Error details (shown in collapsible section)
   */
  details?: string;

  /**
   * Correlation ID for tracking
   */
  correlationId?: string;

  /**
   * Whether the alert is visible
   * @default true
   */
  visible?: boolean;

  /**
   * Whether to show close button
   * @default true
   */
  closable?: boolean;

  /**
   * Whether to show retry button
   * @default false
   */
  retryable?: boolean;

  /**
   * Retry button text
   * @default 'Retry'
   */
  retryButtonText?: string;

  /**
   * Callback when close button is clicked
   */
  onClose?: () => void;

  /**
   * Callback when retry button is clicked
   */
  onRetry?: () => void;

  /**
   * Auto-dismiss after specified milliseconds
   */
  autoDismissMs?: number;

  /**
   * Callback when auto-dismiss timer expires
   */
  onAutoDismiss?: () => void;

  /**
   * Additional CSS styles
   */
  sx?: SxProps<Theme>;

  /**
   * CSS class name
   */
  className?: string;
}

/**
 * Error Alert Component
 * 
 * Displays error messages with optional actions and details.
 * Supports:
 * - Different severity levels (error, warning, info, success)
 * - Close and retry actions
 * - Collapsible error details
 * - Auto-dismiss timer
 * - Correlation ID for debugging
 * 
 * @example
 * ```tsx
 * <ErrorAlert
 *   message="Failed to reset password"
 *   severity="error"
 *   retryable
 *   onRetry={handleRetry}
 *   correlationId="abc-123"
 * />
 * ```
 */
export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  title,
  severity = 'error',
  details,
  correlationId,
  visible = true,
  closable = true,
  retryable = false,
  retryButtonText = 'Retry',
  onClose,
  onRetry,
  autoDismissMs,
  onAutoDismiss,
  sx,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const [showDetails, setShowDetails] = useState(false);

  // Sync internal visibility with prop
  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  // Auto-dismiss timer
  useEffect(() => {
    if (!autoDismissMs || !onAutoDismiss || !isVisible) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onAutoDismiss();
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [autoDismissMs, onAutoDismiss, isVisible]);

  // Handle close
  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  // Handle toggle details
  const handleToggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <Alert
      severity={severity}
      sx={sx}
      className={className}
      action={
        <Box display="flex" alignItems="center" gap={0.5}>
          {retryable && onRetry && (
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
              startIcon={<RefreshIcon />}
            >
              {retryButtonText}
            </Button>
          )}
          {closable && (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      }
    >
      {/* Title */}
      {title && <AlertTitle>{title}</AlertTitle>}

      {/* Message */}
      <Typography variant="body2">{message}</Typography>

      {/* Correlation ID */}
      {correlationId && (
        <Typography
          variant="caption"
          display="block"
          sx={{ mt: 0.5, opacity: 0.8, fontFamily: 'monospace' }}
        >
          ID: {correlationId}
        </Typography>
      )}

      {/* Details Toggle */}
      {details && (
        <Box mt={1}>
          <Button
            size="small"
            color="inherit"
            onClick={handleToggleDetails}
            endIcon={
              <ExpandMoreIcon
                sx={{
                  transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              />
            }
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>

          {/* Collapsible Details */}
          <Collapse in={showDetails}>
            <Box
              mt={1}
              p={1.5}
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {details}
            </Box>
          </Collapse>
        </Box>
      )}
    </Alert>
  );
};

/**
 * Simple error alert without actions
 * 
 * @example
 * ```tsx
 * <SimpleErrorAlert message="An error occurred" />
 * ```
 */
export const SimpleErrorAlert: React.FC<
  Pick<ErrorAlertProps, 'message' | 'severity' | 'sx' | 'className'>
> = (props) => {
  return <ErrorAlert {...props} closable={false} retryable={false} />;
};

/**
 * Retryable error alert
 * 
 * @example
 * ```tsx
 * <RetryableErrorAlert
 *   message="Network error"
 *   onRetry={handleRetry}
 * />
 * ```
 */
export const RetryableErrorAlert: React.FC<
  Pick<
    ErrorAlertProps,
    | 'message'
    | 'title'
    | 'details'
    | 'correlationId'
    | 'onRetry'
    | 'onClose'
    | 'sx'
    | 'className'
  >
> = (props) => {
  return <ErrorAlert {...props} retryable />;
};

/**
 * Auto-dismiss error alert
 * 
 * @example
 * ```tsx
 * <AutoDismissErrorAlert
 *   message="Temporary error"
 *   autoDismissMs={5000}
 *   onAutoDismiss={() => console.log('Dismissed')}
 * />
 * ```
 */
export const AutoDismissErrorAlert: React.FC<ErrorAlertProps> = (props) => {
  const { autoDismissMs = 5000, ...rest } = props;
  return <ErrorAlert {...rest} autoDismissMs={autoDismissMs} />;
};

export default ErrorAlert;
