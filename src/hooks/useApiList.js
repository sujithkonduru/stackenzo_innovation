import { useCallback, useEffect, useState } from 'react';

/**
 * Generic list-fetching hook. `fetcher` should be a stable function
 * returning a Promise<Array>. Pass `deps` to control when it re-runs
 * (e.g. filters, organization id).
 */
export function useApiList(fetcher, deps = [], { skip = false } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (skip) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result || []);
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setData([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load, setData };
}
