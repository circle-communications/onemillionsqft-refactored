'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles } from 'lucide-react';
import { SuggestionList, useAutocomplete } from '@/components/search/Autocomplete';
import { textSearchHref } from '@/lib/search/links';

interface SearchBarProps {
  variant?: 'hero' | 'compact';
}

/** Hero search box: free text goes straight to the canonical /properties?q=... URL. */
export function SearchBar({ variant = 'hero' }: SearchBarProps) {
  const router = useRouter();
  const [q, setQ] = useState('');

  const ac = useAutocomplete<HTMLFormElement>({ value: q, setValue: setQ, onPick: (s) => router.push(s.href) });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    ac.close();
    router.push(textSearchHref(q.replace(/\s+/g, ' ').trim()));
  };

  const isHero = variant === 'hero';

  return (
    <form
      ref={ac.containerRef}
      onSubmit={handleSubmit}
      role="search"
      className={`relative ${isHero ? 'max-w-3xl' : 'w-full'}`}
    >
      <div className="group relative rounded-md p-[2px] shadow-lg shadow-neutral-900/5 hover:shadow-xl hover:shadow-neutral-900/10 transition-all duration-300 focus-within:shadow-xl focus-within:shadow-violet-500/20">
        <div
          aria-hidden="true"
          className="ai-gradient-border absolute inset-0 rounded-xl opacity-80 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300"
        />
        <div
          aria-hidden="true"
          className="ai-gradient-border absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-40 group-focus-within:opacity-50 transition-opacity duration-300"
        />

        <div className="relative flex items-center bg-white rounded-xl">
          <div className="absolute left-4 flex items-center gap-2 pointer-events-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          <input
            type="search"
            name="q"
            aria-label="Search properties"
            maxLength={100}
            placeholder="Search for locality, project, or builder..."
            value={q}
            {...ac.inputProps}
            className="w-full bg-transparent pl-16 pr-32 py-4 md:py-4 text-[15px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none rounded-2xl"
          />

          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/30 active:scale-[0.98] transition-all duration-200"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>

      <SuggestionList ac={ac} query={q} portal />
    </form>
  );
}
