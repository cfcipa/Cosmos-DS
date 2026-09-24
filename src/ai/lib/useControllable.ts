import * as React from 'react';

/**
 * Controlled + uncontrolled state in one hook: pass the controlled `value` (or undefined),
 * the `defaultValue` for the uncontrolled case and the `onChange` callback.
 */
export function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void): [T, (next: T | ((prev: T) => T)) => void] {
  const [inner, setInner] = React.useState<T>(defaultValue);
  const controlled = value !== undefined;
  const cur = controlled ? (value as T) : inner;
  const ref = React.useRef(cur);
  ref.current = cur;
  const cb = React.useRef(onChange);
  cb.current = onChange;
  const set = React.useCallback((next: T | ((prev: T) => T)) => {
    const v = typeof next === 'function' ? (next as (p: T) => T)(ref.current) : next;
    ref.current = v;
    if (!controlled) setInner(v);
    if (cb.current) cb.current(v);
  }, [controlled]);
  return [cur, set];
}
