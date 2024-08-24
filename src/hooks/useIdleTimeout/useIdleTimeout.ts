import { useEffect, useCallback, useRef } from 'react';

export const useIdleTimeout = (timeout: number, onIdle: () => void) => {
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(onIdle, timeout);
  }, [timeout, onIdle]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    resetIdleTimer();

    events.forEach((event) => {
      document.addEventListener(event, resetIdleTimer);
    });

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, resetIdleTimer);
      });
    };
  }, [resetIdleTimer]);
};
