'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { sanitizeFilters, searchHref, serializeFilters, type SearchFilters } from '@/lib/search/filters';
import type { FilterOptions } from '@/lib/properties/repository';

interface SearchContextValue {
  /** The filters the UI currently shows (updates instantly, before the server responds). */
  filters: SearchFilters;
  options: FilterOptions;
  pending: boolean;
  /** Apply a change: update the UI immediately, navigate, reset to page 1. */
  update: (patch: Partial<SearchFilters>) => void;
  /** Replace the whole filter set (used by the mobile drawer's Apply button). */
  replace: (next: SearchFilters) => void;
  clearAll: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used inside <SearchProvider>');
  return ctx;
}

/**
 * The URL is the single source of truth. This provider mirrors it into local state only so the
 * controls respond instantly while the server renders the new results.
 */
export function SearchProvider({
  filters: serverFilters,
  options,
  children,
}: {
  filters: SearchFilters;
  options: FilterOptions;
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filters, setFilters] = useState(serverFilters);

  // Re-sync whenever the URL (i.e. the server's view of the filters) changes: back/forward, links, chips.
  const urlKey = serializeFilters(serverFilters).toString();
  useEffect(() => {
    setFilters(serverFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlKey]);

  const navigate = useCallback(
    (next: SearchFilters) => {
      const clean = sanitizeFilters({ ...next, page: 1 });
      setFilters(clean);
      startTransition(() => router.push(searchHref(clean), { scroll: false }));
    },
    [router],
  );

  const update = useCallback((patch: Partial<SearchFilters>) => navigate({ ...filters, ...patch }), [filters, navigate]);
  const clearAll = useCallback(() => {
    const cleared = sanitizeFilters({ ...filters, ...emptyPatch(filters) });
    navigate(cleared);
  }, [filters, navigate]);

  const value = useMemo<SearchContextValue>(
    () => ({ filters, options, pending, update, replace: navigate, clearAll }),
    [filters, options, pending, update, navigate, clearAll],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

/** Everything except the sort order is reset by "Clear all". */
function emptyPatch(current: SearchFilters): Partial<SearchFilters> {
  return {
    q: '', category: [], subtype: [], city: null, locality: [], corridor: null,
    minPrice: null, maxPrice: null, minArea: null, maxArea: null, bhk: [], bathrooms: null,
    possession: [], furnishing: [], facing: [], parking: false, amenities: [],
    rera: false, cmda: false, dtcp: false, gated: false, corner: false, sort: current.sort,
  };
}

/** Dims its children while a navigation is in flight. Children stay server-rendered. */
export function PendingFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { pending } = useSearch();
  return (
    <div
      aria-busy={pending}
      className={`transition-opacity duration-200 ${pending ? 'pointer-events-none opacity-50' : 'opacity-100'} ${className}`}
    >
      {children}
    </div>
  );
}
