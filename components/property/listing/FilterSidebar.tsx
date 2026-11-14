'use client';

import { SlidersHorizontal } from 'lucide-react';
import { FilterPanel } from '@/components/search/FilterPanel';
import { useSearch } from '@/components/search/SearchProvider';
import { countActiveFilters } from '@/lib/search/filters';

/** Desktop filter sidebar. Every change navigates immediately (URL is the source of truth). */
export function FilterSidebar() {
  const { filters, options, update, clearAll } = useSearch();
  const active = countActiveFilters(filters);

  return (
    <aside className="hidden lg:block w-[330px] flex-shrink-0" aria-label="Filters">
      <div className="bg-white rounded-xl border border-neutral-200 p-4 sticky top-48 max-h-[calc(100vh-13rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-sans font-semibold text-neutral-900 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-brand-600" />
            Filters
          </h2>
          {active > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full hover:bg-brand-100"
            >
              {active} active · Clear
            </button>
          )}
        </div>
        <FilterPanel value={filters} options={options} onChange={update} idPrefix="side" />
      </div>
    </aside>
  );
}
