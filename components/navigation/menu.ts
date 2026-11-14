import {
  Building2,
  Home,
  LandPlot,
  Warehouse,
  MapPin,
  BedDouble,
  TrendingUp,
  IndianRupee,
  ShieldCheck,
  Users,
  FilePlus,
  type LucideIcon,
} from 'lucide-react';
import {
  BHK_MAX_EXACT,
  BUDGET_BANDS,
  CATEGORY_BY_SLUG,
  type CategorySlug,
} from '@/lib/constants/property';
import { CITIES, CORRIDORS, LOCALITIES, localitiesOf, localitiesOfCorridor } from '@/lib/constants/locations';
import {
  allPropertiesHref,
  bhkHref,
  budgetHref,
  categoryHref,
  cityHref,
  corridorHref,
  localityHref,
  luxuryHref,
  possessionHref,
  subtypeHref,
} from '@/lib/search/links';
import { searchHref } from '@/lib/search/filters';
import { PATHS } from '@/lib/site';

/* ------------------------------------------------------------------ */
/*  Menu model (Level 1 = section rail, Level 2 = items,              */
/*              Level 3 = children flyout)                            */
/* ------------------------------------------------------------------ */

export type SubLink = { label: string; path: string; badge?: string };

export type MenuLink = {
  label: string;
  path: string;
  sub?: string;
  icon?: LucideIcon;
  badge?: string;
  childrenTitle?: string;
  children?: SubLink[];
};

export type MenuGroup = { heading: string; items: MenuLink[] };

export type MenuSection = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  groups: MenuGroup[];
};

export type Promo = {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  icon: LucideIcon;
  cta: SubLink;
};

export type NavItem = {
  label: string;
  sections: MenuSection[];
  promo: Promo;
  cta: SubLink;
};

/* ------------------------------------------------------------------ */
/*  Every search link below is generated from lib/constants + links.ts */
/*  so the menu can never offer a filter the listing page rejects.     */
/* ------------------------------------------------------------------ */

const lk = (label: string, path: string, badge?: string): SubLink => ({ label, path, badge });

const cat = (slug: CategorySlug) => CATEGORY_BY_SLUG[slug];

const bhkChildren = (category: CategorySlug): SubLink[] => [
  lk('1 BHK', bhkHref([1], { category: [category] })),
  lk('2 BHK', bhkHref([2], { category: [category] })),
  lk('3 BHK', bhkHref([3], { category: [category] })),
  lk(`${BHK_MAX_EXACT}+ BHK`, bhkHref([BHK_MAX_EXACT, BHK_MAX_EXACT + 1], { category: [category] })),
];

const budgetBandItem = (slug: (typeof BUDGET_BANDS)[number]['slug']): MenuLink => {
  const band = BUDGET_BANDS.find((b) => b.slug === slug)!;
  return {
    label: band.label,
    sub: band.sub,
    path: budgetHref(slug),
    icon: IndianRupee,
    childrenTitle: `Properties ${band.label.toLowerCase()}`,
    children: (['flat-apartment', 'independent-villa', 'residential-plot', 'commercial-space'] as const).map((c) =>
      lk(cat(c).label, budgetHref(slug, { category: [c] })),
    ),
  };
};

const popularLocalities = (city: (typeof CITIES)[number]['slug']) =>
  localitiesOf(city)
    .filter((l) => l.popular)
    .map((l) => lk(l.name, localityHref(city, l.slug)));

const BUYERS: NavItem = {
  label: 'For Buyers',
  cta: lk('Browse all properties', allPropertiesHref()),
  promo: {
    eyebrow: 'Why OneMillionSqFt',
    title: 'Premium properties, handpicked for you',
    body: 'Discover homes and plots that match your lifestyle and aspirations in Bengaluru and Chennai.',
    points: ['RERA verified projects', 'Trusted developers', 'Handpicked properties', 'High-value localities'],
    icon: ShieldCheck,
    cta: lk('Talk to an expert', PATHS.contact),
  },
  sections: [
    {
      id: 'types',
      label: 'Property type',
      description: 'Homes, plots & commercial',
      icon: Building2,
      groups: [
        {
          heading: 'Residential',
          items: [
            {
              label: cat('flat-apartment').label,
              sub: 'New launches and ready homes',
              path: categoryHref('flat-apartment'),
              icon: Building2,
              childrenTitle: 'Apartments by size & status',
              children: [
                ...bhkChildren('flat-apartment'),
                lk('Studio / 1 RK', subtypeHref('studio')),
                lk('Luxury apartments', luxuryHref({ category: ['flat-apartment'] })),
                lk('Ready to move', possessionHref('ready-to-move', { category: ['flat-apartment'] })),
                lk('Under construction', possessionHref('under-construction', { category: ['flat-apartment'] })),
              ],
            },
            {
              label: cat('independent-villa').label,
              sub: 'Premium independent living',
              path: categoryHref('independent-villa'),
              icon: Home,
              childrenTitle: 'Villa types',
              children: [
                lk('Independent villas', subtypeHref('villa')),
                lk('Row houses', subtypeHref('row-house')),
                lk('Duplex villas', subtypeHref('duplex-villa')),
                lk('Gated villas', categoryHref('independent-villa', { gated: true })),
                lk('Luxury villas', luxuryHref({ category: ['independent-villa'] })),
              ],
            },
          ],
        },
        {
          heading: 'Land & commercial',
          items: [
            {
              label: cat('residential-plot').label,
              sub: 'Approved layouts',
              path: categoryHref('residential-plot'),
              icon: LandPlot,
              childrenTitle: 'Plots by approval & status',
              children: [
                lk('CMDA approved', categoryHref('residential-plot', { cmda: true })),
                lk('DTCP approved', categoryHref('residential-plot', { dtcp: true })),
                lk('Gated layouts', categoryHref('residential-plot', { gated: true })),
                lk('Corner plots', categoryHref('residential-plot', { corner: true })),
                lk('Ready to build', possessionHref('ready-to-build', { category: ['residential-plot'] })),
              ],
            },
            {
              label: cat('commercial-space').label,
              sub: 'Offices, retail & warehouses',
              path: categoryHref('commercial-space'),
              icon: Warehouse,
              childrenTitle: 'Commercial spaces',
              children: [
                lk('Office space', subtypeHref('office')),
                lk('Shops & showrooms', subtypeHref('retail')),
                lk('Warehouses', subtypeHref('warehouse')),
                lk('Co-working spaces', subtypeHref('coworking')),
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'locations',
      label: 'Locations',
      description: 'Cities, corridors & localities',
      icon: MapPin,
      groups: [
        {
          heading: 'Top cities',
          items: CITIES.map((c) => ({
            label: c.name,
            sub: c.slug === 'chennai' ? 'Homes & plots across the city' : 'Premium micro-markets',
            path: cityHref(c.slug),
            icon: MapPin,
            childrenTitle: `Popular localities in ${c.name}`,
            children: popularLocalities(c.slug),
          })),
        },
        {
          heading: 'Chennai corridors',
          items: CORRIDORS.map((c) => ({
            label: c.name,
            sub: c.blurb,
            path: corridorHref(c.city, c.slug),
            icon: MapPin,
            childrenTitle: `Localities on ${c.name.replace(/ \(.*\)/, '')}`,
            children: localitiesOfCorridor(c.slug).map((l) => lk(l.name, localityHref(c.city, l.slug))),
          })),
        },
      ],
    },
    {
      id: 'budget',
      label: 'Budget',
      description: 'Find homes within your range',
      icon: IndianRupee,
      groups: [
        {
          heading: 'Browse by budget',
          items: BUDGET_BANDS.map((b) => budgetBandItem(b.slug)),
        },
      ],
    },
    {
      id: 'popular',
      label: 'Popular searches',
      description: 'What buyers look for',
      icon: TrendingUp,
      groups: [
        {
          heading: 'Buying options',
          items: [
            { label: 'Ready to move-in projects', path: possessionHref('ready-to-move') },
            { label: 'Under construction projects', path: possessionHref('under-construction') },
            { label: 'RERA registered projects', path: searchHref({ rera: true }) },
            { label: 'Gated communities', path: searchHref({ gated: true }) },
            { label: 'Affordable (under ₹40 Lakh)', path: budgetHref('under-40l') },
            { label: 'Luxury (above ₹1.5 Cr)', path: luxuryHref() },
          ],
        },
        {
          heading: 'Search by BHK',
          items: [
            ...[1, 2, 3].map(
              (n): MenuLink => ({
                label: `${n} BHK`,
                path: bhkHref([n]),
                icon: BedDouble,
                childrenTitle: `${n} BHK by property type`,
                children: [
                  lk(cat('flat-apartment').label, bhkHref([n], { category: ['flat-apartment'] })),
                  lk(cat('independent-villa').label, bhkHref([n], { category: ['independent-villa'] })),
                ],
              }),
            ),
            {
              label: `${BHK_MAX_EXACT}+ BHK`,
              path: bhkHref([BHK_MAX_EXACT, BHK_MAX_EXACT + 1]),
              icon: BedDouble,
              childrenTitle: `${BHK_MAX_EXACT}+ BHK by property type`,
              children: [
                lk(cat('flat-apartment').label, bhkHref([BHK_MAX_EXACT, BHK_MAX_EXACT + 1], { category: ['flat-apartment'] })),
                lk(
                  cat('independent-villa').label,
                  bhkHref([BHK_MAX_EXACT, BHK_MAX_EXACT + 1], { category: ['independent-villa'] }),
                ),
              ],
            },
          ],
        },
      ],
    },
  ],
};

/** Developers: only routes that exist in this app. */
const BUILDERS: NavItem = {
  label: 'For Builders',
  cta: lk('Post your property', PATHS.postProperty),
  promo: {
    eyebrow: 'For developers',
    title: 'List your projects with OneMillionSqFt',
    body: 'Reach buyers looking for premium homes and plots in Bengaluru and Chennai.',
    points: ['Free listing', 'Verified buyer leads', 'Listed within 24 hours', 'No brokerage'],
    icon: Building2,
    cta: lk('Partner with us', `${PATHS.contact}?type=builder`),
  },
  sections: [
    {
      id: 'developers',
      label: 'Developers',
      description: 'List & sell your projects',
      icon: Building2,
      groups: [
        {
          heading: 'Get started',
          items: [
            { label: 'Post Your Property', sub: 'List in minutes', path: PATHS.postProperty, icon: FilePlus, badge: 'Free' },
            { label: 'Partner With Us', sub: 'Become a listing partner', path: `${PATHS.contact}?type=builder`, icon: Users },
          ],
        },
      ],
    },
  ],
};

export const NAV: NavItem[] = [BUYERS, BUILDERS];

/** Plain links shown next to the mega menus (pages that exist). */
export const NAV_LINKS: SubLink[] = [lk('News & Articles', PATHS.blog)];

/** Re-exported so the footer can build its columns from the same data. */
export { LOCALITIES };
