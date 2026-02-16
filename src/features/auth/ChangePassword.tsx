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

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { LockReset as LockResetIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { UserService } from '@services/userService';

export const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestPasswordReset = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await UserService.requestPasswordReset();
      setSuccess(true);
    } catch (err) {
      console.error('Password reset request failed:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to initiate password reset. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <LockResetIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom>
                Change Password
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Secure your account by updating your password
              </Typography>
            </Box>

            {/* Success Message */}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Password reset initiated successfully!</strong>
                </Typography>
                <Typography variant="body2">
                  A password reset link has been sent to your registered email address. 
                  Please check your inbox and follow the instructions to complete the password change.
                </Typography>
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Instructions */}
            {!success && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="body1" paragraph>
                  To change your password, click the button below. You will receive an email with a secure link to reset your password.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Note:</strong> The reset link will be valid for 24 hours.
                </Typography>
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
              {!success ? (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleRequestPasswordReset}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <LockResetIcon />}
                  >
                    {loading ? 'Sending Reset Link...' : 'Request Password Reset'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    onClick={() => navigate('/profile')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={() => navigate('/profile')}
                >
                  Back to Profile
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Paper>
    </Container>
  );
};

export default ChangePassword;
