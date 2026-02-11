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
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes with default delay (300ms)', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated' });

    // Value should NOT change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time by 300ms
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Value should now be updated
    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('should debounce value changes with custom delay', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    // 300ms should not be enough
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    // Additional 200ms (total 500ms) should trigger update
    act(() => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('should cancel previous timeout on rapid value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } }
    );

    // Rapid changes
    rerender({ value: 'second' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'third' });
    act(() => {
      jest.advanceTimersByTime(100);
    });

    rerender({ value: 'final' });

    // Still showing initial value
    expect(result.current).toBe('first');

    // Fast-forward full 300ms from LAST change
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should only show FINAL value (intermediate values skipped)
    await waitFor(() => {
      expect(result.current).toBe('final');
    });
  });

  it('should work with different data types', async () => {
    // Number
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 0 } }
    );

    numberRerender({ value: 42 });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    await waitFor(() => {
      expect(numberResult.current).toBe(42);
    });

    // Object
    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: { name: 'initial' } } }
    );

    const updatedObj = { name: 'updated' };
    objectRerender({ value: updatedObj });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    await waitFor(() => {
      expect(objectResult.current).toEqual(updatedObj);
    });

    // Array
    const { result: arrayResult, rerender: arrayRerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: [1, 2, 3] } }
    );

    const updatedArray = [4, 5, 6];
    arrayRerender({ value: updatedArray });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    await waitFor(() => {
      expect(arrayResult.current).toEqual(updatedArray);
    });
  });

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const { unmount } = renderHook(() => useDebounce('test', 300));

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('should handle delay of 0 (immediate update)', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 0),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('should work with search use case', async () => {
    // Simulate search input behavior
    const { result, rerender } = renderHook(
      ({ searchTerm }) => useDebounce(searchTerm, 300),
      { initialProps: { searchTerm: '' } }
    );

    // User types "hel" quickly (each keystroke ~50ms apart)
    rerender({ searchTerm: 'h' });
    act(() => {
      jest.advanceTimersByTime(50);
    });

    rerender({ searchTerm: 'he' });
    act(() => {
      jest.advanceTimersByTime(50);
    });

    rerender({ searchTerm: 'hel' });
    act(() => {
      jest.advanceTimersByTime(50);
    });

    rerender({ searchTerm: 'hell' });
    act(() => {
      jest.advanceTimersByTime(50);
    });

    rerender({ searchTerm: 'hello' });

    // Still showing empty string (no API call yet)
    expect(result.current).toBe('');

    // After 300ms from LAST keystroke, trigger search
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(result.current).toBe('hello');
    });
    // Now API call would fire with debounced value "hello"
  });
});
