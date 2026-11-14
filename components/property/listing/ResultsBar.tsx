'use client';

import { ChevronDown, SortAsc, X } from 'lucide-react';
import { useSearch } from '@/components/search/SearchProvider';
import { SORT_OPTIONS, isSortKey } from '@/lib/constants/property';
import { activeFilterChips } from '@/lib/search/describe';

interface Props {
  /** "Showing 1–10 of 42 results", computed on the server from the rendered page. */
  summary: string;
}

/** Result count, sort order and the removable chips for every active filter. */
export function ResultsBar({ summary }: Props) {
  const { filters, options, update, clearAll } = useSearch();
  const chips = activeFilterChips(filters, options);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-neutral-500" aria-live="polite">
          {summary}
        </p>
        <div className="relative">
          <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          <label htmlFor="sort-results" className="sr-only">
            Sort results
          </label>
          <select
            id="sort-results"
            value={filters.sort}
            onChange={(e) => isSortKey(e.target.value) && update({ sort: e.target.value })}
            className="pl-9 pr-8 py-2 rounded-lg border border-neutral-200 text-sm appearance-none bg-white focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
        </div>
      </div>

      {chips.length > 0 && (
        <ul className="mt-4 flex flex-wrap items-center gap-2" aria-label="Active filters">
          {chips.map((chip) => (
            <li key={chip.id}>
              <button
                type="button"
                onClick={() => update(chip.patch)}
                aria-label={`Remove filter: ${chip.label}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100"
              >
                {chip.label}
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
          <li>
            <button type="button" onClick={clearAll} className="px-2 py-1 text-xs font-medium text-neutral-500 underline hover:text-neutral-800">
              Clear all
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
