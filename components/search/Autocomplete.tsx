'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Building2, HardHat, LayoutGrid, MapPin, Search, type LucideIcon } from 'lucide-react';
import { MIN_QUERY, normalizeQuery, type Suggestion, type SuggestionType } from '@/lib/search/suggest';

/**
 * Autocomplete for the search boxes (hero + listing page).
 *
 *   const ac = useAutocomplete({ value, setValue, onPick });
 *   <div ref={ac.containerRef} className="relative">
 *     <input value={value} {...ac.inputProps} />
 *     <SuggestionList ac={ac} query={value} />
 *   </div>
 *
 * Typing never blocks: requests are debounced, stale ones are aborted, and any failure just means
 * "no suggestions" (the Enter key still runs a normal text search).
 * Follows the ARIA combobox pattern: ↑/↓ move, Enter picks, Esc closes.
 */

const DEBOUNCE_MS = 180;

interface Options {
  value: string;
  setValue: (v: string) => void;
  /** Called when a suggestion is chosen (click or Enter on a highlighted row). */
  onPick: (s: Suggestion) => void;
}

export interface AutocompleteApi<T extends HTMLElement = HTMLDivElement> {
  items: Suggestion[];
  open: boolean;
  loading: boolean;
  searched: boolean;
  active: number;
  listId: string;
  containerRef: React.RefObject<T>;
  close: () => void;
  pick: (s: Suggestion) => void;
  setActive: (i: number) => void;
  inputProps: {
    role: 'combobox';
    autoComplete: 'off';
    'aria-autocomplete': 'list';
    'aria-expanded': boolean;
    'aria-controls': string;
    'aria-activedescendant': string | undefined;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onFocus: () => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  };
}

/** `T` is the element that wraps the input and the dropdown (a div by default, a form in the hero). */
export function useAutocomplete<T extends HTMLElement = HTMLDivElement>({ value, setValue, onPick }: Options): AutocompleteApi<T> {
  const listId = useId();
  const containerRef = useRef<T>(null);
  const cache = useRef(new Map<string, Suggestion[]>());
  const [items, setItems] = useState<Suggestion[]>([]);
  const [searched, setSearched] = useState(false); // a request for the current text has finished
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const q = normalizeQuery(value);
  const enough = q.length >= MIN_QUERY;

  // fetch (debounced, abortable, cached per query)
  useEffect(() => {
    setActive(-1);
    if (!enough) {
      setItems([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    const key = q.toLowerCase();
    const cached = cache.current.get(key);
    if (cached) {
      setItems(cached);
      setSearched(true);
      setLoading(false);
      return;
    }

    setSearched(false);
    setLoading(true);
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const json = (await res.json()) as { suggestions?: Suggestion[] };
        const list = Array.isArray(json.suggestions) ? json.suggestions : [];
        if (cache.current.size > 100) cache.current.clear();
        cache.current.set(key, list);
        setItems(list);
        setSearched(true);
        setLoading(false);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setItems([]);
        setSearched(true);
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q, enough]);

  // close when clicking / tapping outside
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const target = e.target as Element;
      if (target.closest?.(`[data-autocomplete-list="${listId}"]`)) return; // the list may be portalled out of the container
      if (containerRef.current && !containerRef.current.contains(target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [listId]);

  const close = useCallback(() => {
    setOpen(false);
    setActive(-1);
  }, []);

  const pick = useCallback(
    (s: Suggestion) => {
      close();
      onPick(s);
    },
    [close, onPick],
  );

  const visible = open && enough && (items.length > 0 || searched);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      close();
      return;
    }
    if (e.key === 'Tab') {
      close();
      return;
    }
    if (!items.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      // -1 means "nothing highlighted" (just the typed text), so the cycle has items.length + 1 stops
      const stops = items.length + 1;
      const step = e.key === 'ArrowDown' ? 1 : -1;
      setActive((i) => ((i + 1 + step + stops) % stops) - 1);
    } else if (e.key === 'Enter' && visible && active >= 0 && items[active]) {
      e.preventDefault();
      pick(items[active]);
    }
  };

  return {
    items,
    open: visible,
    loading,
    searched,
    active,
    listId,
    containerRef,
    close,
    pick,
    setActive,
    inputProps: {
      role: 'combobox',
      autoComplete: 'off',
      'aria-autocomplete': 'list',
      'aria-expanded': visible,
      'aria-controls': listId,
      'aria-activedescendant': visible && active >= 0 ? `${listId}-${active}` : undefined,
      onChange: (e) => {
        setValue(e.target.value);
        setOpen(true);
      },
      onFocus: () => setOpen(true),
      onKeyDown,
    },
  };
}

/* ───────────────────────────── Dropdown ───────────────────────────── */

const META: Record<SuggestionType, { icon: LucideIcon; heading: string }> = {
  category: { icon: LayoutGrid, heading: 'Property types' },
  locality: { icon: MapPin, heading: 'Localities' },
  project: { icon: Building2, heading: 'Projects' },
  builder: { icon: HardHat, heading: 'Builders' },
};

/** Bold the part of `text` that matches `query`. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <strong className="font-semibold text-neutral-900">{text.slice(at, at + q.length)}</strong>
      {text.slice(at + q.length)}
    </>
  );
}

interface ListProps {
  ac: AutocompleteApi<HTMLElement>;
  query: string;
  /**
   * Render into <body>, positioned under the container. Use when an ancestor clips overflow or
   * stacks above the dropdown (the home hero does both).
   */
  portal?: boolean;
}

export function SuggestionList({ ac, query, portal = false }: ListProps) {
  const q = normalizeQuery(query);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    if (!portal || !ac.open) return;
    const place = () => {
      const r = ac.containerRef.current?.getBoundingClientRect();
      if (r) setRect({ top: r.bottom + 8, left: r.left, width: r.width });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [portal, ac.open, ac.containerRef]);

  // group while keeping the flat index that keyboard navigation uses
  const groups = useMemo(() => {
    const out: { type: SuggestionType; rows: { s: Suggestion; index: number }[] }[] = [];
    ac.items.forEach((s, index) => {
      const last = out[out.length - 1];
      if (last && last.type === s.type) last.rows.push({ s, index });
      else out.push({ type: s.type, rows: [{ s, index }] });
    });
    return out;
  }, [ac.items]);

  if (!ac.open || (portal && !rect)) return null;

  const panel = (
    <div
      data-autocomplete-list={ac.listId}
      style={portal && rect ? { position: 'fixed', top: rect.top, left: rect.left, width: rect.width } : undefined}
      className={`${portal ? 'z-[70]' : 'absolute left-0 right-0 top-full z-50 mt-2'} max-h-[min(70vh,28rem)] overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1.5 text-left shadow-xl`}
    >
      <ul id={ac.listId} role="listbox" aria-label="Search suggestions">
        {groups.map((g) => {
          const { icon: Icon, heading } = META[g.type];
          return (
            <li key={g.type} role="presentation">
              <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{heading}</div>
              <ul role="presentation">
                {g.rows.map(({ s, index }) => (
                  <li
                    key={s.id}
                    id={`${ac.listId}-${index}`}
                    role="option"
                    aria-selected={ac.active === index}
                    // keep focus in the input so the click isn't swallowed by a blur
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => ac.setActive(index)}
                    onClick={() => ac.pick(s)}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 ${
                      ac.active === index ? 'bg-brand-50' : ''
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-neutral-700">
                        <Highlight text={s.label} query={q} />
                      </span>
                      {s.sublabel && <span className="block truncate text-xs text-neutral-400">{s.sublabel}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      {ac.items.length === 0 && (
        <div className="flex items-center gap-2 px-3 py-3 text-sm text-neutral-500">
          <Search className="h-4 w-4 shrink-0 text-neutral-300" />
          No quick matches. Press Enter to search for &ldquo;{q}&rdquo;.
        </div>
      )}
    </div>
  );

  return portal ? createPortal(panel, document.body) : panel;
}
