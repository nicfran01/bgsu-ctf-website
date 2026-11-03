import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

/**
 * Search, filter, and sort state stored in the query string, so a filtered
 * view can be shared as a link and survives a refresh.
 * Multi-value filters are stored comma-separated: ?category=web,crypto
 */
export function useListParams<K extends string, S extends string>(filterKeys: readonly K[], sorts: readonly S[]) {
  const [params, setParams] = useSearchParams();

  const query = params.get('q') ?? '';
  const sortParam = params.get('sort') as S | null;
  const sort: S = sortParam && sorts.includes(sortParam) ? sortParam : sorts[0]!;

  const filters = useMemo(() => {
    const out = {} as Record<K, string[]>;
    for (const key of filterKeys) out[key] = (params.get(key) ?? '').split(',').filter(Boolean);
    return out;
  }, [params, filterKeys]);

  const update = useCallback(
    (mutate: (next: URLSearchParams) => void) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          mutate(next);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const setQuery = useCallback(
    (value: string) => update((p) => (value ? p.set('q', value) : p.delete('q'))),
    [update],
  );

  const setSort = useCallback(
    (value: S) => update((p) => (value === sorts[0] ? p.delete('sort') : p.set('sort', value))),
    [update, sorts],
  );

  const toggle = useCallback(
    (key: K, value: string) =>
      update((p) => {
        const current = new Set((p.get(key) ?? '').split(',').filter(Boolean));
        if (current.has(value)) current.delete(value);
        else current.add(value);
        if (current.size) p.set(key, [...current].join(','));
        else p.delete(key);
      }),
    [update],
  );

  const clear = useCallback((key: K) => update((p) => p.delete(key)), [update]);

  const reset = useCallback(
    () =>
      update((p) => {
        p.delete('q');
        for (const key of filterKeys) p.delete(key);
      }),
    [update, filterKeys],
  );

  const isFiltered = query !== '' || filterKeys.some((k) => filters[k].length > 0);

  return { query, sort, filters, setQuery, setSort, toggle, clear, reset, isFiltered };
}
