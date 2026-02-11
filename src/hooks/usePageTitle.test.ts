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
import { renderHook } from '@testing-library/react';
import { usePageTitle } from './usePageTitle';

describe('usePageTitle', () => {
  let originalTitle: string;

  beforeEach(() => {
    // Store original title before each test
    originalTitle = document.title;
  });

  afterEach(() => {
    // Restore original title after each test
    document.title = originalTitle;
  });

  it('should set document title with app name suffix when title is provided', () => {
    renderHook(() => usePageTitle('User Management'));
    expect(document.title).toBe('User Management | UIDAM Portal');
  });

  it('should set document title to app name only when no title is provided', () => {
    renderHook(() => usePageTitle());
    expect(document.title).toBe('UIDAM Portal');
  });

  it('should set document title to app name only when empty string is provided', () => {
    renderHook(() => usePageTitle(''));
    expect(document.title).toBe('UIDAM Portal');
  });

  it('should restore previous title on unmount', () => {
    document.title = 'Previous Title';
    const { unmount } = renderHook(() => usePageTitle('New Title'));

    expect(document.title).toBe('New Title | UIDAM Portal');

    unmount();

    expect(document.title).toBe('Previous Title');
  });

  it('should update title when title prop changes', () => {
    const { rerender } = renderHook(
      ({ title }) => usePageTitle(title),
      { initialProps: { title: 'Dashboard' } }
    );

    expect(document.title).toBe('Dashboard | UIDAM Portal');

    rerender({ title: 'User Management' });
    expect(document.title).toBe('User Management | UIDAM Portal');

    rerender({ title: 'Settings' });
    expect(document.title).toBe('Settings | UIDAM Portal');
  });

  it('should handle title with special characters', () => {
    renderHook(() => usePageTitle('User & Role Management'));
    expect(document.title).toBe('User & Role Management | UIDAM Portal');
  });

  it('should handle very long titles', () => {
    const longTitle = 'A'.repeat(100);
    renderHook(() => usePageTitle(longTitle));
    expect(document.title).toBe(`${longTitle} | UIDAM Portal`);
  });

  it('should handle multiple component instances correctly', () => {
    const { unmount: unmount1 } = renderHook(() => usePageTitle('Component 1'));
    expect(document.title).toBe('Component 1 | UIDAM Portal');

    // Second component overwrites the title
    const { unmount: unmount2 } = renderHook(() => usePageTitle('Component 2'));
    expect(document.title).toBe('Component 2 | UIDAM Portal');

    // Unmount second component - restores title to what it was before Component 2
    unmount2();
    expect(document.title).toBe('Component 1 | UIDAM Portal');

    // Unmount first component - restores original title
    unmount1();
    expect(document.title).toBe(originalTitle);
  });

  it('should handle switching from title to no title', () => {
    const { rerender } = renderHook(
      ({ title }: { title?: string }) => usePageTitle(title),
      { initialProps: { title: 'Dashboard' as string | undefined } }
    );

    expect(document.title).toBe('Dashboard | UIDAM Portal');

    rerender({ title: undefined });
    expect(document.title).toBe('UIDAM Portal');
  });

  it('should handle switching from no title to title', () => {
    const { rerender } = renderHook(
      ({ title }: { title?: string }) => usePageTitle(title),
      { initialProps: { title: undefined as string | undefined } }
    );

    expect(document.title).toBe('UIDAM Portal');

    rerender({ title: 'Settings' });
    expect(document.title).toBe('Settings | UIDAM Portal');
  });

  it('should be used in typical route component pattern', () => {
    // Simulate Dashboard component
    const { unmount: unmountDashboard } = renderHook(() => usePageTitle('Dashboard'));
    expect(document.title).toBe('Dashboard | UIDAM Portal');
    unmountDashboard();

    // Simulate navigation to UserManagement component
    const { unmount: unmountUsers } = renderHook(() => usePageTitle('User Management'));
    expect(document.title).toBe('User Management | UIDAM Portal');
    unmountUsers();

    // Simulate navigation to Settings component
    const { unmount: unmountSettings } = renderHook(() => usePageTitle('Settings'));
    expect(document.title).toBe('Settings | UIDAM Portal');
    unmountSettings();

    // After all unmounts, original title should be restored
    expect(document.title).toBe(originalTitle);
  });

  it('should handle undefined title parameter', () => {
    renderHook(() => usePageTitle(undefined));
    expect(document.title).toBe('UIDAM Portal');
  });

  it('should handle null title parameter', () => {
    // @ts-expect-error Testing runtime behavior with null
    renderHook(() => usePageTitle(null));
    expect(document.title).toBe('UIDAM Portal');
  });

  it('should handle title with leading/trailing whitespace', () => {
    // Hook trims whitespace for clean titles
    renderHook(() => usePageTitle('  Dashboard  '));
    expect(document.title).toBe('Dashboard | UIDAM Portal');
  });
});
