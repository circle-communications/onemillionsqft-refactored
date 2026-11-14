import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Search, TriangleAlert } from 'lucide-react';
import { PropertyCardHorizontalSimple } from '@/components/property/cards/PropertyCardHorizontalSimple';
import { FilterSidebar } from '@/components/property/listing/FilterSidebar';
import { ListingToolbar } from '@/components/property/listing/ListingToolbar';
import { Pagination } from '@/components/property/listing/Pagination';
import { ResultsBar } from '@/components/property/listing/ResultsBar';
import { PendingFrame, SearchProvider } from '@/components/search/SearchProvider';
import { PAGE_SIZE } from '@/lib/constants/property';
import { listingHeading } from '@/lib/search/describe';
import { canonicalQuery, hasAnyFilter, parseSearchParams, searchHref, serializeFilters } from '@/lib/search/filters';
import {
  EMPTY_FACETS,
  STATIC_FILTER_OPTIONS,
  getFilterOptions,
  searchProperties,
  type FilterOptions,
  type SearchResult,
} from '@/lib/properties/repository';
import { getPropertyPath } from '@/lib/routes';
import { createServerClient } from '@/lib/supabase/server';

type SearchParams = Record<string, string | string[] | undefined>;
interface Props {
  searchParams: SearchParams;
}

/** One lookup per request, shared by `generateMetadata` and the page. Falls back to the built-in reference data. */
const getOptions = cache(async (): Promise<FilterOptions> => {
  try {
    return await getFilterOptions(createServerClient());
  } catch (err) {
    console.error('[properties] filter options unavailable, using built-in reference data', err);
    return { ...STATIC_FILTER_OPTIONS, facets: EMPTY_FACETS };
  }
});

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const filters = parseSearchParams(searchParams);
  const options = await getOptions();
  const heading = listingHeading(filters, options);
  const canonical = serializeFilters(filters, { page: false }).toString();

  return {
    title: filters.page > 1 ? `${heading} – Page ${filters.page}` : heading,
    description: `Browse ${heading.toLowerCase()} from verified builders. Filter by budget, BHK, area, possession status and approvals.`,
    alternates: { canonical: canonical ? `/properties?${canonical}` : '/properties' },
    // free-text result pages are effectively infinite: keep them out of the index
    robots: filters.q ? { index: false, follow: true } : undefined,
  };
}

export default async function PropertiesPage({ searchParams }: Props) {
  // Old links (propertyType=Villa, type=houses, budget=40l-80l, …) are 308-redirected to the canonical URL.
  const canonical = canonicalQuery(searchParams);
  if (canonical !== null) redirect(`/properties?${canonical}`);

  const filters = parseSearchParams(searchParams);

  let result: SearchResult | null = null;
  const optionsPromise = getOptions();
  try {
    result = await searchProperties(createServerClient(), filters);
  } catch (err) {
    console.error('[properties] search failed', err);
  }
  const options = await optionsPromise;

  // Page number beyond the last page (stale link, shrunk result set) → go to the real last page.
  if (result && result.properties.length === 0 && result.total > 0 && filters.page > 1) {
    redirect(searchHref({ ...filters, page: result.totalPages }));
  }

  const heading = listingHeading(filters, options);
  const from = result && result.total > 0 ? (filters.page - 1) * PAGE_SIZE + 1 : 0;
  const to = result ? from + result.properties.length - (result.total > 0 ? 1 : 0) : 0;
  const summary = !result
    ? 'Results unavailable'
    : result.total === 0
      ? 'No results'
      : `Showing ${from}–${to} of ${result.total.toLocaleString('en-IN')} results`;

  return (
    <SearchProvider filters={filters} options={options}>
      <div className="bg-neutral-50 min-h-screen">
        <ListingToolbar />

        <section className="bg-neutral-100">
          <div className="container-mx py-8">
            <h1 className="mb-6 font-sans text-xl font-semibold text-neutral-900 md:text-xl">{heading}</h1>

            <div className="flex gap-6">
              <FilterSidebar />

              <div className="min-w-0 flex-1">
                <ResultsBar summary={summary} />

                <PendingFrame>
                  {!result ? (
                    <ErrorState />
                  ) : result.properties.length === 0 ? (
                    <EmptyState filtered={hasAnyFilter(filters)} />
                  ) : (
                    <>
                      <ul className="grid grid-cols-1 gap-4">
                        {result.properties.map((p) => (
                          <li key={p.id}>
                            <PropertyCardHorizontalSimple property={p} href={getPropertyPath(p)} />
                          </li>
                        ))}
                      </ul>
                      <Pagination filters={filters} totalPages={result.totalPages} />
                    </>
                  )}
                </PendingFrame>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SearchProvider>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-16 text-center">
      <Search className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
      <h2 className="font-serif text-xl font-bold text-neutral-900 mb-2">No Properties Found</h2>
      <p className="text-neutral-500 mb-6">
        {filtered
          ? 'Try removing a filter or widening your keywords to see more properties.'
          : 'New listings are added regularly. Please check back soon.'}
      </p>
      {filtered && (
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
        >
          Clear All Filters
        </Link>
      )}
    </div>
  );
}

function ErrorState() {
  return (
    <div role="alert" className="bg-white rounded-xl border border-neutral-200 p-16 text-center">
      <TriangleAlert className="h-12 w-12 text-brand-400 mx-auto mb-4" />
      <h2 className="font-serif text-xl font-bold text-neutral-900 mb-2">We couldn&apos;t load properties</h2>
      <p className="text-neutral-500 mb-6">Something went wrong on our side. Please try again in a moment.</p>
      <Link
        href="/properties"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
      >
        Reload
      </Link>
    </div>
  );
}
