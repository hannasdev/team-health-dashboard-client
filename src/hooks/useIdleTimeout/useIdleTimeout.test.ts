// src/hooks/useIdleTimeout.test.ts
import { renderHook, act } from '@testing-library/react';
import { useIdleTimeout } from './useIdleTimeout';

jest.useFakeTimers();

describe('useIdleTimeout', () => {
  it('should call onIdle after the specified timeout', () => {
    const onIdle = jest.fn();
    renderHook(() => {
      useIdleTimeout(1000, onIdle);
    });

    act(() => {
      jest.advanceTimersByTime(999);
    });
    expect(onIdle).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  it('should reset the timer on user activity', () => {
    const onIdle = jest.fn();
    renderHook(() => {
      useIdleTimeout(1000, onIdle);
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown'));
    });

    act(() => {
      jest.advanceTimersByTime(999);
    });
    expect(onIdle).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onIdle).toHaveBeenCalledTimes(1);
  });

  // Add more tests as needed
});
