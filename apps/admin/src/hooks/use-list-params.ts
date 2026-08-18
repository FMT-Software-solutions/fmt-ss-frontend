import { useCallback, useMemo, useState } from 'react';

interface ListParamsState {
  page: number;
  limit: number;
  search: string;
  filters: Record<string, string | undefined>;
}

/**
 * Page/search/filter state for a list view. Changing the search term or any
 * filter resets to page 1, otherwise the user can land on an empty page.
 */
export function useListParams(initialFilters: Record<string, string | undefined> = {}, limit = 25) {
  const [state, setState] = useState<ListParamsState>({
    page: 1,
    limit,
    search: '',
    filters: initialFilters,
  });

  const setPage = useCallback((page: number) => {
    setState((current) => ({ ...current, page }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setState((current) =>
      current.search === search ? current : { ...current, search, page: 1 },
    );
  }, []);

  const setFilter = useCallback((key: string, value: string | undefined) => {
    setState((current) => ({
      ...current,
      page: 1,
      filters: { ...current.filters, [key]: value },
    }));
  }, []);

  const queryParams = useMemo(
    () => ({
      page: state.page,
      limit: state.limit,
      search: state.search || undefined,
      ...state.filters,
    }),
    [state],
  );

  return {
    page: state.page,
    limit: state.limit,
    filters: state.filters,
    queryParams,
    setPage,
    setSearch,
    setFilter,
  };
}
