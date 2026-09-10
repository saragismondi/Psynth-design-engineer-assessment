import { useCallback, useEffect, useState } from 'react';
import { useFakeStream, type UseFakeStreamOptions } from '@/fixtures';

const QUERY = '(prefers-reduced-motion: reduce)';

function readPreference() {
  return typeof window !== 'undefined' && window.matchMedia?.(QUERY).matches === true;
}

export function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(readPreference);

  useEffect(() => {
    const query = window.matchMedia?.(QUERY);
    if (!query) return;
    const onChange = () => setPrefersReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return prefersReduced;
}

export function useReducedMotionStream(options: UseFakeStreamOptions) {
  const prefersReduced = usePrefersReducedMotion();
  const stream = useFakeStream(options);
  const [settled, setSettled] = useState(false);
  const settle = useCallback(() => setSettled(true), []);

  if (!prefersReduced) return stream;

  return {
    content: settled ? options.text : '',
    status: settled ? ('done' as const) : ('idle' as const),
    start: settle,
    stop: settle,
  };
}
