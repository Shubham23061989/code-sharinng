import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async fetcher whenever `deps` change.
 * - cancels the previous request (AbortController)
 * - keeps the last data visible while refetching (isRefreshing)
 * - `enabled: false` skips the call (e.g. until filters are known)
 */
export function useApi(fetcher, deps, { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [reloadKey, setReloadKey] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));

    fetcherRef
      .current(controller.signal)
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => {
        if (error?.name === 'AbortError') return;
        setState((s) => ({ ...s, error, loading: false }));
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return {
    ...state,
    isInitialLoading: state.loading && !state.data,
    isRefreshing: state.loading && !!state.data,
    reload,
  };
}
