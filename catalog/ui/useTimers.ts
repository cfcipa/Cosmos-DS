import * as React from 'react';

/** Timers de las demos: se limpian solos al desmontar o al volver a programar. */
export function useTimers() {
  const ids = React.useRef<number[]>([]);
  const clear = React.useCallback(() => { ids.current.forEach((id) => window.clearTimeout(id)); ids.current = []; }, []);
  const after = React.useCallback((ms: number, fn: () => void) => { ids.current.push(window.setTimeout(fn, ms)); }, []);
  React.useEffect(() => clear, [clear]);
  return { after, clear };
}
