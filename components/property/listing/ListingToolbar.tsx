'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { SuggestionList, useAutocomplete } from '@/components/search/Autocomplete';
import { Chip, FilterPanel } from '@/components/search/FilterPanel';
import { useSearch } from '@/components/search/SearchProvider';
import { CATEGORIES } from '@/lib/constants/property';
import { applicableGroups, countActiveFilters, emptyFilters, sanitizeFilters, type SearchFilters } from '@/lib/search/filters';

const toggle = <T,>(list: readonly T[], value: T): T[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

/** Sticky search row: free-text box, (mobile) filter drawer button, and the property-type chips. */
export function ListingToolbar() {
  const { filters, options, update } = useSearch();
  const { facets } = options;
  const hasFacets = facets.total > 0;
  const groups = applicableGroups(filters);
  const router = useRouter();
  const [draft, setDraft] = useState(filters.q);
  const ac = useAutocomplete({ value: draft, setValue: setDraft, onPick: (s) => router.push(s.href) });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const active = countActiveFilters(filters);

  // keep the box in step with the URL (chip removal, back/forward, "clear all")
  useEffect(() => setDraft(filters.q), [filters.q]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ac.close();
    update({ q: draft.replace(/\s+/g, ' ').trim() });
  };

  return (
    <div className="bg-white border-b border-neutral-200 sticky top-20 z-30">
      <div className="container-mx py-3">
        <form onSubmit={submit} role="search" className="flex gap-3">
          <div ref={ac.containerRef} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="search"
              name="q"
              aria-label="Search properties"
              maxLength={100}
              placeholder="Search by locality, project name, or builder..."
              value={draft}
              {...ac.inputProps}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-brand-500"
            />
            <SuggestionList ac={ac} query={draft} />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {active > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white text-xs">
                {active}
              </span>
            )}
          </button>
        </form>

        {/* Property type: one scrollable line, so the toolbar height never changes */}
        <div
          role="group"
          aria-label="Type of property"
          className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <Chip active={filters.category.length === 0} onClick={() => update({ category: [] })}>
            All
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.slug} active={filters.category.includes(c.slug)} onClick={() => update({ category: toggle(filters.category, c.slug) })}>
              {c.label}
              {hasFacets && <span className="ml-1 text-xs opacity-70">({facets.categories[c.slug] ?? 0})</span>}
            </Chip>
          ))}
          {filters.category.length > 0 && groups.subtypes.length > 0 && (
            <>
              <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-neutral-200" />
              {groups.subtypes.map((st) => (
                <Chip key={st.slug} active={filters.subtype.includes(st.slug)} onClick={() => update({ subtype: toggle(filters.subtype, st.slug) })}>
                  {st.label}
                </Chip>
              ))}
            </>
          )}
        </div>
      </div>

      {drawerOpen && <FilterDrawer onClose={() => setDrawerOpen(false)} />}
    </div>
  );
}

/**
 * Mobile filter drawer. Edits a local draft and applies it in one navigation, so each tap does not
 * trigger a server render while the drawer is open.
 */
function FilterDrawer({ onClose }: { onClose: () => void }) {
  const { filters, options, replace } = useSearch();
  const [draft, setDraft] = useState<SearchFilters>(filters);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const change = (patch: Partial<SearchFilters>) => setDraft((d) => sanitizeFilters({ ...d, ...patch }));
  const clear = () => setDraft((d) => ({ ...emptyFilters(), q: d.q, sort: d.sort }));
  const apply = () => {
    replace(draft);
    onClose();
  };

  // Portalled to <body>: the toolbar is `sticky z-30`, which would otherwise trap the drawer's z-index
  // underneath the header's bottom navigation bar (z-50).
  return createPortal(
    <div className="lg:hidden fixed inset-0 z-[60] bg-black/50" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className="absolute right-0 top-0 bottom-0 flex w-80 max-w-[90%] flex-col bg-white animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 p-5">
          <h2 className="font-sans font-semibold text-neutral-900 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-brand-600" />
            Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="p-1 rounded-md hover:bg-neutral-100 border"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <FilterPanel value={draft} options={options} onChange={change} idPrefix="drawer" />
        </div>

        <div className="flex gap-3 border-t border-neutral-100 p-4">
          <button
            type="button"
            onClick={clear}
            className="flex-1 rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={apply}
            className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Show results
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
