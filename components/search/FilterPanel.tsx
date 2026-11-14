'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  Bath,
  Bed,
  Car,
  ChevronDown,
  Compass,
  IndianRupee,
  KeyRound,
  MapPin,
  Ruler,
  ShieldCheck,
  Sofa,
  Sparkles,
} from 'lucide-react';
import {
  AMENITIES,
  AREA_STEPS,
  BATHROOM_OPTIONS,
  BHK_OPTIONS,
  FACING,
  FURNISHING,
  PRICE_STEPS,
} from '@/lib/constants/property';
import { applicableGroups, type SearchFilters } from '@/lib/search/filters';
import { formatAreaStep, formatBudget } from '@/lib/format';
import type { FilterOptions } from '@/lib/properties/repository';

/* ───────────────────────── tiny controlled primitives ───────────────────────── */

const toggle = <T,>(list: readonly T[], value: T): T[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

function Section({ icon: Icon, title, children }: { icon: typeof Bed; title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-600">
        <Icon className="h-4 w-4" /> {title}
      </legend>
      {children}
    </fieldset>
  );
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1 text-sm font-medium transition-colors ${active ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
        }`}
    >
      {children}
    </button>
  );
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
      />
      {children}
    </label>
  );
}

const selectCls =
  'w-full cursor-pointer appearance-none rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-8 text-sm focus:border-brand-500 focus:outline-none';

function Select({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
    </div>
  );
}

/** Options for a min/max dropdown. A value that came from a deep link but is not a standard step stays selectable. */
function stepOptions(steps: readonly number[], current: number | null, format: (n: number) => string, none: string) {
  const values = current !== null && !steps.includes(current) ? [...steps, current].sort((a, b) => a - b) : steps;
  return (
    <>
      <option value="">{none}</option>
      {values.map((v) => (
        <option key={v} value={v}>
          {format(v)}
        </option>
      ))}
    </>
  );
}

const num = (v: string): number | null => (v === '' ? null : Number(v));

/* ───────────────────────── Filter panel ───────────────────────── */

interface Props {
  value: SearchFilters;
  options: FilterOptions;
  onChange: (patch: Partial<SearchFilters>) => void;
  /** Distinguishes DOM ids when the panel is mounted twice (desktop sidebar + mobile drawer). */
  idPrefix: string;
}

export function FilterPanel({ value: f, options, onChange, idPrefix }: Props) {
  const g = applicableGroups(f);
  const { facets } = options;
  const hasFacets = facets.total > 0;
  const [localityQuery, setLocalityQuery] = useState('');

  const cityCorridors = useMemo(
    () => (f.city ? options.corridors.filter((c) => c.city === f.city) : []),
    [options.corridors, f.city],
  );

  const localityChoices = useMemo(() => {
    const q = localityQuery.trim().toLowerCase();
    return options.localities
      .filter((l) => !f.city || l.city === f.city)
      .filter((l) => !f.corridor || l.corridor === f.corridor)
      .filter((l) => !hasFacets || (facets.localities[`${l.city}/${l.slug}`] ?? 0) > 0 || f.locality.includes(l.slug))
      .filter((l) => !q || l.name.toLowerCase().includes(q))
      .sort((a, b) => Number(b.popular) - Number(a.popular) || a.name.localeCompare(b.name));
  }, [options.localities, f.city, f.corridor, f.locality, localityQuery, hasFacets, facets.localities]);

  const cityName = (slug: string) => options.cities.find((c) => c.slug === slug)?.name ?? slug;
  const id = (name: string) => `${idPrefix}-${name}`;

  return (
    <div className="space-y-6">
      {/* Location */}
      <Section icon={MapPin} title="Location">
        <div className="space-y-3">
          <Select
            id={id('city')}
            label="City"
            value={f.city ?? ''}
            onChange={(v) => onChange({ city: v || null, corridor: null, locality: [] })}
          >
            <option value="">All cities</option>
            {options.cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
                {hasFacets ? ` (${facets.cities[c.slug] ?? 0})` : ''}
              </option>
            ))}
          </Select>

          {/* {cityCorridors.length > 0 && (
            <Select
              id={id('corridor')}
              label="Corridor"
              value={f.corridor ?? ''}
              onChange={(v) => onChange({ corridor: v || null, locality: [] })}
            >
              <option value="">All corridors</option>
              {cityCorridors.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
          )} */}

          <div>
            <label htmlFor={id('locality-q')} className="sr-only">
              Search localities
            </label>
            <input
              id={id('locality-q')}
              type="search"
              value={localityQuery}
              onChange={(e) => setLocalityQuery(e.target.value)}
              placeholder="Search localities…"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
            <div className="mt-2 max-h-44 space-y-2 overflow-y-auto rounded-lg border border-neutral-100 p-2">
              {localityChoices.length === 0 && <p className="px-1 py-2 text-xs text-neutral-400">No matching localities</p>}
              {localityChoices.map((l) => (
                <Check key={`${l.city}/${l.slug}`} checked={f.locality.includes(l.slug)} onChange={() => onChange({ locality: toggle(f.locality, l.slug), city: f.city ?? l.city })}>
                  <span>
                    {l.name}
                    {!f.city && <span className="ml-1 text-xs text-neutral-400">{cityName(l.city)}</span>}
                  </span>
                </Check>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Budget */}
      <Section icon={IndianRupee} title="Budget">
        <div className="grid grid-cols-2 gap-3">
          <Select id={id('min-price')} label="Minimum budget" value={f.minPrice ?? ''} onChange={(v) => onChange({ minPrice: num(v) })}>
            {stepOptions(PRICE_STEPS, f.minPrice, formatBudget, 'No min')}
          </Select>
          <Select id={id('max-price')} label="Maximum budget" value={f.maxPrice ?? ''} onChange={(v) => onChange({ maxPrice: num(v) })}>
            {stepOptions(PRICE_STEPS, f.maxPrice, formatBudget, 'No max')}
          </Select>
        </div>
      </Section>

      {/* Area */}
      <Section icon={Ruler} title="Area (sq.ft.)">
        <div className="grid grid-cols-2 gap-3">
          <Select id={id('min-area')} label="Minimum area" value={f.minArea ?? ''} onChange={(v) => onChange({ minArea: num(v) })}>
            {stepOptions(AREA_STEPS, f.minArea, formatAreaStep, 'No min')}
          </Select>
          <Select id={id('max-area')} label="Maximum area" value={f.maxArea ?? ''} onChange={(v) => onChange({ maxArea: num(v) })}>
            {stepOptions(AREA_STEPS, f.maxArea, formatAreaStep, 'No max')}
          </Select>
        </div>
      </Section>

      {g.bedrooms && (
        <Section icon={Bed} title="Bedrooms">
          <div className="flex flex-wrap gap-2">
            {BHK_OPTIONS.map((b) => (
              <Chip key={b.value} active={f.bhk.includes(b.value)} onClick={() => onChange({ bhk: toggle(f.bhk, b.value) })}>
                {b.label}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {g.bathrooms && (
        <Section icon={Bath} title="Bathrooms">
          <div className="flex flex-wrap gap-2">
            {BATHROOM_OPTIONS.map((b) => (
              <Chip key={b} active={f.bathrooms === b} onClick={() => onChange({ bathrooms: f.bathrooms === b ? null : b })}>
                {b}+
              </Chip>
            ))}
          </div>
        </Section>
      )}

      <Section icon={KeyRound} title="Possession status">
        <div className="flex flex-wrap gap-2">
          {g.possession.map((p) => (
            <Chip key={p.slug} active={f.possession.includes(p.slug)} onClick={() => onChange({ possession: toggle(f.possession, p.slug) })}>
              {p.label}
            </Chip>
          ))}
        </div>
      </Section>

      {g.furnishing && (
        <Section icon={Sofa} title="Furnishing">
          <div className="flex flex-wrap gap-2">
            {FURNISHING.map((o) => (
              <Chip key={o.slug} active={f.furnishing.includes(o.slug)} onClick={() => onChange({ furnishing: toggle(f.furnishing, o.slug) })}>
                {o.label}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      <Section icon={Compass} title="Facing">
        <div className="flex flex-wrap gap-2">
          {FACING.map((o) => (
            <Chip key={o.slug} active={f.facing.includes(o.slug)} onClick={() => onChange({ facing: toggle(f.facing, o.slug) })}>
              {o.label}
            </Chip>
          ))}
        </div>
      </Section>

      {g.parking && (
        <Section icon={Car} title="Parking">
          <Chip active={f.parking} onClick={() => onChange({ parking: !f.parking })}>
            Parking available
          </Chip>
        </Section>
      )}

      <Section icon={Sparkles} title="Amenities">
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => (
            <Chip key={a.slug} active={f.amenities.includes(a.slug)} onClick={() => onChange({ amenities: toggle(f.amenities, a.slug) })}>
              {a.label}
            </Chip>
          ))}
        </div>
      </Section>

      <Section icon={ShieldCheck} title="Approvals & features">
        <div className="space-y-2">
          {g.approvals.map((a) => (
            <Check key={a.key} checked={f[a.key]} onChange={() => onChange({ [a.key]: !f[a.key] })}>
              {a.label}
            </Check>
          ))}
        </div>
      </Section>
    </div>
  );
}

