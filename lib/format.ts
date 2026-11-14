/**
 * Display formatting for money and area. Buy-only catalogue: every price is a total price,
 * shown as ₹ lakh / crore. Pure functions, safe to use on the server and in the browser.
 */

import { CRORE, LAKH } from '@/lib/constants/property';

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const trim = (n: number, digits: number): string => n.toFixed(digits).replace(/\.?0+$/, '');

/** 8500000 → "₹85 L", 12500000 → "₹1.25 Cr". `null` → "Price on request". */
export function formatPrice(price: number | null | undefined): string {
  if (price == null || !isNum(Number(price))) return 'Price on request';
  const p = Number(price);
  if (p >= CRORE) return `₹${trim(p / CRORE, 2)} Cr`;
  if (p >= LAKH) return `₹${trim(p / LAKH, 2)} L`;
  return `₹${p.toLocaleString('en-IN')}`;
}

export function formatPriceFull(price: number | null | undefined): string {
  if (price == null || !isNum(Number(price))) return 'Price on request';
  return `₹${Number(price).toLocaleString('en-IN')}`;
}

/** "₹85 L – ₹1.2 Cr" for projects that span a price range; a single price otherwise. */
export function formatPriceRange(min: number | null | undefined, max: number | null | undefined): string {
  if (max != null && min != null && max > min) return `${formatPrice(min)} – ${formatPrice(max)}`;
  return formatPrice(min);
}

export function formatArea(sqft: number | null | undefined): string {
  if (sqft == null || !isNum(Number(sqft))) return 'N/A';
  return `${Number(sqft).toLocaleString('en-IN')} sq.ft`;
}

export function formatAreaRangeOf(min: number | null | undefined, max: number | null | undefined): string {
  if (max != null && min != null && max > min) {
    return `${Number(min).toLocaleString('en-IN')} – ${Number(max).toLocaleString('en-IN')} sq.ft`;
  }
  return formatArea(min);
}

/* ───────── filter-panel / chip labels ───────── */

/** Dropdown label for a budget step: 500000 → "₹5 L". Same output as `formatPrice`, named for intent. */
export const formatBudget = (n: number): string => formatPrice(n);

/** "No min" / "₹40 L" style labels for the budget chip: `₹40 L – ₹80 L`, `Above ₹1.5 Cr`, `Under ₹40 L`. */
export function formatBudgetRange(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `${formatBudget(min)} – ${formatBudget(max)}`;
  if (min !== null) return `Above ${formatBudget(min)}`;
  if (max !== null) return `Under ${formatBudget(max)}`;
  return '';
}

export const formatAreaStep = (n: number): string => `${n.toLocaleString('en-IN')} sq.ft`;

export function formatAreaRange(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `${min.toLocaleString('en-IN')} – ${max.toLocaleString('en-IN')} sq.ft`;
  if (min !== null) return `${min.toLocaleString('en-IN')}+ sq.ft`;
  if (max !== null) return `Up to ${max.toLocaleString('en-IN')} sq.ft`;
  return '';
}
