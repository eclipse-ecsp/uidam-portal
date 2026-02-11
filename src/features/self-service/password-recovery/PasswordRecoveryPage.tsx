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
 * Password Recovery Page
 * Orchestrates the password recovery flow within the security settings
 */

import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import PasswordRecoveryCard from './components/PasswordRecoveryCard';

const PasswordRecoveryPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Security Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage your account security and password settings
        </Typography>
        
        <Box mt={4}>
          <PasswordRecoveryCard />
        </Box>
      </Box>
    </Container>
  );
};

export default PasswordRecoveryPage;
