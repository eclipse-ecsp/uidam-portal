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
 * Password Recovery Card Component
 * Displays a card in the security settings with a CTA to trigger password recovery
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import PasswordRecoveryDialog from './PasswordRecoveryDialog';

export interface PasswordRecoveryCardProps {
  /** Optional callback when recovery is initiated */
  onRecoveryInitiated?: () => void;
}

const PasswordRecoveryCard: React.FC<PasswordRecoveryCardProps> = ({
  onRecoveryInitiated,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleRecoverySuccess = () => {
    setDialogOpen(false);
    onRecoveryInitiated?.();
  };

  return (
    <>
      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <LockResetIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="h2">
              Password Recovery
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Initiate a password reset for your account. You will receive an email
            with instructions to create a new password.
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDialog}
            startIcon={<LockResetIcon />}
          >
            Reset Password
          </Button>
        </CardActions>
      </Card>

      <PasswordRecoveryDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleRecoverySuccess}
      />
    </>
  );
};

export default PasswordRecoveryCard;
