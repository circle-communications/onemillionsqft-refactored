import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { searchHref, type SearchFilters } from '@/lib/search/filters';

/** 1 … 4 5 [6] 7 8 … 20 */
export function pageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}

const base =
  'inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors';
const idle = 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50';
const off = 'border-neutral-200 bg-white text-neutral-700 opacity-40 pointer-events-none';

/** Crawlable pagination: real links, so every page of a search is reachable without JavaScript. */
export function Pagination({ filters, totalPages }: { filters: SearchFilters; totalPages: number }) {
  if (totalPages <= 1) return null;
  const current = filters.page;
  const href = (page: number) => searchHref({ ...filters, page });

  return (
    <nav className="my-10 flex items-center justify-center gap-2 flex-wrap" aria-label="Pagination">
      {current > 1 ? (
        <Link href={href(current - 1)} rel="prev" scroll className={`${base} ${idle}`}>
          <ChevronLeft className="h-4 w-4" /> Prev
        </Link>
      ) : (
        <span aria-disabled="true" className={`${base} ${off}`}>
          <ChevronLeft className="h-4 w-4" /> Prev
        </span>
      )}

      {pageWindow(current, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-2 text-neutral-400">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            scroll
            aria-current={p === current ? 'page' : undefined}
            className={`min-w-[40px] justify-center ${base} ${
              p === current ? 'bg-brand-600 border-brand-600 text-white' : idle
            }`}
          >
            {p}
          </Link>
        ),
      )}

      {current < totalPages ? (
        <Link href={href(current + 1)} rel="next" scroll className={`${base} ${idle}`}>
          Next <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-disabled="true" className={`${base} ${off}`}>
          Next <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
