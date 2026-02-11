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
/**
 * Password Recovery Dialog Component
 * Modal for confirming password recovery with React Hook Form validation
 * and Material-UI Snackbar integration for feedback
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
  Box,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { usePasswordRecoveryMutation } from '../hooks/usePasswordRecoveryMutation';
import { logger } from '@utils/logger';
import type { RootState } from '@store/index';

export interface PasswordRecoveryDialogProps {
  /** Controls dialog visibility */
  open: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Callback when recovery succeeds */
  onSuccess?: () => void;
}

const PasswordRecoveryDialog: React.FC<PasswordRecoveryDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { handleSubmit } = useForm();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Get user email from auth store for display
  const userEmail = useSelector((state: RootState) => state.auth.user?.email);

  const mutation = usePasswordRecoveryMutation();

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const onSubmit = async () => {
    try {
      const result = await mutation.mutateAsync();
      
      logger.logPasswordRecoveryEvent('success', {
        message: result.message,
        email: userEmail,
      });

      showSnackbar(
        result.message || 'Password recovery email sent successfully. Please check your inbox.',
        'success'
      );

      // Close dialog after short delay
      setTimeout(() => {
        onSuccess?.();
      }, 300);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to initiate password recovery';
      
      logger.logPasswordRecoveryEvent('error', {
        error: errorMessage,
        email: userEmail,
      });

      showSnackbar(errorMessage, 'error');
    }
  };

  const handleCancel = () => {
    if (!mutation.isPending) {
      onClose();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleCancel}
        maxWidth="sm"
        fullWidth
        aria-labelledby="password-recovery-dialog-title"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle id="password-recovery-dialog-title">
            Reset Your Password
          </DialogTitle>
          
          <DialogContent>
            <Box mb={2}>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to reset your password?
              </Typography>
              
              {userEmail && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  A password reset link will be sent to: <strong>{userEmail}</strong>
                </Typography>
              )}
              
              <Alert severity="info" sx={{ mt: 2 }}>
                You will receive an email with instructions to create a new password.
                The link will expire in 24 hours.
              </Alert>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={handleCancel}
              disabled={mutation.isPending}
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PasswordRecoveryDialog;
