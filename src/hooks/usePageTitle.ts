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
import { useEffect } from 'react';

/**
 * Application name constant for consistent page titles
 */
const APP_NAME = 'UIDAM Portal';

/**
 * Custom hook for dynamically setting the document title
 * Automatically appends application name and cleans up on unmount
 * 
 * @param {string} title - The page-specific title (e.g., "User Management", "Dashboard")
 * 
 * @example
 * function UserManagement() {
 *   usePageTitle('User Management');
 *   // Document title becomes: "User Management | UIDAM Portal"
 *   return <div>...</div>;
 * }
 * 
 * @example
 * function Dashboard() {
 *   usePageTitle(); // Uses default: "UIDAM Portal"
 *   return <div>...</div>;
 * }
 */
export function usePageTitle(title?: string): void {
  useEffect(() => {
    // Store previous title to restore on cleanup
    const previousTitle = document.title;

    // Set new title with app name suffix
    if (title) {
      document.title = `${title} | ${APP_NAME}`;
    } else {
      document.title = APP_NAME;
    }

    // Cleanup: restore previous title when component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
