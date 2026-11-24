'use client';

import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  Bed,
  Building,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Construction,
  Home as HomeIcon,
  Key,
  LandPlot,
  MapPin,
  Phone,
  ShieldCheck,
  TrendingUp,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';

import { SearchBar } from '@/components/home/SearchBar';
import { PropertySmallCard } from '@/components/property/cards/PropertySmallCard';
import { PropertyCardHorizontal } from '@/components/property/cards/PropertyCardHorizontal';
import { PropertyCardPremium } from '@/components/property/cards/PropertyCardPremium';
import { PropertyCardNewLaunch } from '@/components/property/cards/PropertyCardNewLaunch';
import { PropertySmallCardSlider } from '@/components/home/PropertySmallCardSlider';
import { TestimonialSection } from '@/components/home/TestimonialSection';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { PostCta } from '@/components/home/PostCta';
import { BuilderCards } from '@/components/home/BuilderCards';
import type { ShowcaseBuilder } from '@/lib/builders/showcase';
import { posts } from '@/data/posts';
import { CATEGORIES, POSSESSION, type PossessionSlug } from '@/lib/constants/property';
import { CITIES } from '@/lib/constants/locations';
import { getPropertyPath } from '@/lib/routes';
import { PATHS, SITE } from '@/lib/site';
import {
  allPropertiesHref,
  bhkHref,
  categoryHref,
  cityHref,
  localityHref,
  possessionHref,
} from '@/lib/search/links';
import type { Property } from '@/types';
import HomeHero from './HomeHero';
import HomeSearchSection from './HomeSearchSection';
import { ChangingWord } from '@/components/home/ChangingWord';

/* ───────────────────────────── Props ───────────────────────────── */

export interface CityRail {
  slug: string;
  name: string;
  count: number;
  properties: Property[];
}

export interface HomeContentProps {
  featured: Property[];
  exclusive: Property[];
  latest: Property[];
  cities: CityRail[];
  stats: { total: number; builders: number };
  builders: ShowcaseBuilder[];
}

/* ───────────────────────────── Static content ───────────────────────────── */

const HERO_KEYWORDS: { label: string; href: string }[] = [
  { label: 'Ready to Move', href: possessionHref('ready-to-move') },
  { label: '2 BHK Flats', href: bhkHref([2], { category: ['flat-apartment'] }) },
  { label: 'Under Construction', href: possessionHref('under-construction') },
  { label: 'Plots', href: categoryHref('residential-plot') },
  { label: 'Commercial Spaces', href: categoryHref('commercial-space') },
];

const CATEGORY_TILE: Record<(typeof CATEGORIES)[number]['slug'], { icon: LucideIcon; blurb: string }> = {
  'flat-apartment': { icon: Building, blurb: 'Premium high-rises' },
  'independent-villa': { icon: HomeIcon, blurb: 'Luxury living' },
  'residential-plot': { icon: LandPlot, blurb: 'Build your dream' },
  'commercial-space': { icon: Warehouse, blurb: 'Offices, retail & more' },
};

const STATUS_TILES: Record<
  PossessionSlug,
  { icon: LucideIcon; description: string; soft: string; softHover: string }
> = {
  'ready-to-move': {
    icon: Key,
    description: 'Completed homes you can move into right away',
    soft: 'bg-emerald-50 text-emerald-600',
    softHover: 'group-hover:bg-emerald-100',
  },
  'under-construction': {
    icon: Construction,
    description: 'Secure your unit while the project is being built',
    soft: 'bg-amber-50 text-amber-600',
    softHover: 'group-hover:bg-amber-100',
  },
  'ready-to-build': {
    icon: LandPlot,
    description: 'Developed plots ready for your custom vision',
    soft: 'bg-sky-50 text-sky-600',
    softHover: 'group-hover:bg-sky-100',
  },
};

const BHK_TILES = [
  { title: '1 BHK', description: 'Compact & efficient', href: bhkHref([1]) },
  { title: '2 BHK', description: 'Comfort family homes', href: bhkHref([2]) },
  { title: '3 BHK', description: 'Spacious family living', href: bhkHref([3]) },
  { title: '4+ BHK', description: 'Premium residences', href: bhkHref([4, 5]) },
];

const CITY_COPY: Record<string, { blurb: string; localities: { slug: string; name: string }[] }> = {
  chennai: {
    blurb: 'Premium apartments and plots across Pallikaranai, Adyar, Porur, OMR and more.',
    localities: [
      { slug: 'pallikaranai', name: 'Pallikaranai' },
      { slug: 'perumbakkam', name: 'Perumbakkam' },
      { slug: 'adyar', name: 'Adyar' },
      { slug: 'porur', name: 'Porur' },
    ],
  },
  bengaluru: {
    blurb: "Premium living in India's tech capital — from Whitefield and Sarjapur Road to Hebbal.",
    localities: [
      { slug: 'whitefield', name: 'Whitefield' },
      { slug: 'sarjapur-road', name: 'Sarjapur Road' },
      { slug: 'hebbal', name: 'Hebbal' },
    ],
  },
};

const TICKER = [
  'RERA Approved Projects',
  'Verified Properties',
  'Exclusive Property Deals',
  'Hassle-Free Site Visits',
  'Trusted Builder Partners',
];

/* ───────────────────────────── Small pieces ───────────────────────────── */

function formatCount(n: number) {
  return n.toLocaleString('en-IN');
}

function SliderNav({ id, tone }: { id: string; tone: 'brand' | 'light' | 'gold' }) {
  const cls = {
    brand:
      'bg-brand-600 text-white shadow-sm transition-all duration-300 hover:brightness-105 hover:shadow-md',
    light:
      'bg-white text-brand-600 shadow-sm transition-all duration-300 hover:bg-brand-600 hover:text-white hover:shadow-md',
    gold: 'border border-amber-300/70 bg-gradient-to-b from-[#d9b66a] via-[#e6c981] to-[#c9a45c] text-amber-950 shadow-sm transition-all duration-300 hover:bg-amber-500 hover:border-amber-400 hover:brightness-105 hover:shadow-md',
  }[tone];
  return (
    <div className="flex items-center gap-2">
      <button type="button" className={`${id}-prev flex h-10 w-10 items-center justify-center rounded-full ${cls}`} aria-label="Previous">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button type="button" className={`${id}-next flex h-10 w-10 items-center justify-center rounded-full ${cls}`} aria-label="Next">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

/* ───────────────────────────── Page ───────────────────────────── */

export function HomeContent({ featured, exclusive, latest, cities, stats, builders }: HomeContentProps) {
  const inDemand = featured.slice(0, 6);
  const chennai = cities.find((c) => c.slug === 'chennai');
  const bengaluru = cities.find((c) => c.slug === 'bengaluru');

  const statBlocks = [
    { label: 'Total Properties', value: stats.total },
    { label: `Properties from ${chennai?.name ?? 'Chennai'}`, value: chennai?.count ?? 0 },
    { label: `Properties from ${bengaluru?.name ?? 'Bengaluru'}`, value: bengaluru?.count ?? 0 },
    { label: 'Trusted Builders', value: stats.builders },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[520px] md:min-h-[540px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://res.cloudinary.com/dib2kvojz/image/upload/v1793249862/1M_Building_1_vdgnek.jpg"
            alt=""
            className="block md:hidden w-full h-full object-cover"
          />
          <img
            src="https://res.cloudinary.com/dib2kvojz/image/upload/v1793249864/1M_Building_2_wcxwio.jpg"
            alt=""
            className="hidden md:block w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80" />
        </div>

        <div className="container-x relative z-10 pt-20 pb-5">
          <div className="max-w-3xl mb-6 animate-slide-up text-center">
            {/* <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-white-600/90 backdrop-blur-xl text-white text-xs font-medium mb-4 border border-white/70">
              <ShieldCheck className="h-4 w-4" />
              Explore. Discover. Own.
            </div> */}
            {/* <h1 className="font-serif text-2xl sm:text-3xl md:text-3xl font-semibold text-white leading-tight mb-4">
              Your Dream Property Awaits
            </h1> */}
            <h1 className="font-serif text-2xl sm:text-3xl md:text-3xl font-semibold text-white leading-tight mb-4">
              Your Dream <ChangingWord words={["Flat", "Plot", "Villa", "Space"]} /> Awaits
            </h1>
            <p className="text-sm sm:text-base lg:text-base text-white/80 leading-relaxed">
              Explore verified apartments, independent villas, plots, and commercial spaces from trusted builders.
            </p>
          </div>

          <SearchBar />

          {/* <div className="flex flex-wrap items-center gap-2.5 mt-6">
            <span className="text-white/80 text-xs font-medium mr-1">
              <TrendingUp className="inline-block h-4 w-4 mr-1 text-green-500" /> Popular Keywords
            </span>
            {HERO_KEYWORDS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="px-2 py-1 sm:px-3.5 sm:py-1 rounded-md bg-white/20 backdrop-blur-lg text-xs text-white font-medium transition-all duration-300 hover:bg-brand-600/50 hover:border-brand-600 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div> */}
          <div className="mt-6 w-0 min-w-full">
            <div className="flex flex-nowrap items-center gap-2.5 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:whitespace-normal">
              <span className="shrink-0 text-white/80 text-xs font-medium mr-1">
                <TrendingUp className="inline-block h-4 w-4 mr-1 text-green-500" /> Popular Keywords
              </span>
              {HERO_KEYWORDS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="shrink-0 px-2 py-1 sm:px-3.5 sm:py-1 rounded-md bg-white/20 backdrop-blur-lg text-xs text-white font-medium transition-all duration-300 hover:bg-brand-600/50 hover:border-brand-600 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 pt-3 w-max max-w-[95%]">
          <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-1.5 rounded-2xl rounded-bl-none rounded-br-none bg-black/40 backdrop-blur-lg text-white/70 text-xs sm:text-sm border border-white/10 shadow-lg whitespace-nowrap">
            <span className="text-white/70">✦</span>
            <span>
              Do you Own a Property?{' '}
              <Link
                href={PATHS.postProperty}
                className="underline underline-offset-2 decoration-white/80 text-white hover:text-white/80 transition-colors"
              >
                Post for FREE
              </Link>
            </span>
            <span className="text-white/70">›</span>
          </div>
        </div>
      </section>

      {/* <HomeHero postPropertyHref={PATHS.postProperty} />
      <HomeSearchSection keywords={HERO_KEYWORDS}>
        <SearchBar />
      </HomeSearchSection> */}

      {/* Stats */}
      <section className="bg-brand-600">
        <div className="container-x">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {statBlocks.map((s) => (
              <div key={s.label} className="text-center py-3 md:py-4 px-3 md:px-4 border border-white/20">
                <div className="text-2xl font-bold text-white">{formatCount(s.value)}+</div>
                <div className="text-xs md:text-sm text-white/80 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ticker */}
      <section aria-label="Highlights" className="relative overflow-hidden border-y border-neutral-200 bg-white py-4">
        <style>{`
          @keyframes tickerSlide { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .ticker-track { animation: tickerSlide 40s linear infinite; }
          .ticker-mask {
            -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
                    mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          }
          @media (prefers-reduced-motion: reduce) { .ticker-track { animation: none; } }
        `}</style>
        <div className="ticker-mask overflow-hidden">
          <div className="ticker-track flex w-max items-center">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center" aria-hidden={copy === 1}>
                {TICKER.map((text) => (
                  <span
                    key={text}
                    className="flex items-center gap-4 px-6 text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-brand-500"
                  >
                    {text}
                    <Asterisk className="text-amber-400" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property types */}
      <section className="pt-20 pb-10">
        <div className="container-x">
          <div className="flex items-center justify-between">
            <div className="text-left mb-12">
              <span className="text-brand-500 font-semibold text-sm uppercase">Explore by category</span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 mt-1 mb-3">Browse by Property Type</h2>
              <p className="text-neutral-500 max-w-2xl">
                From luxury apartments to independent villas, plots and commercial spaces, find the property type that suits you.
              </p>
            </div>
            <Link
              href={allPropertiesHref()}
              className="group hidden items-center gap-2 rounded-full border border-neutral-200 py-1.5 pl-5 pr-1.5 text-sm font-semibold text-neutral-900 transition-all duration-300 hover:border-brand-600 md:flex"
            >
              View All Properties
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_TILE[c.slug].icon;
              return (
                <Link
                  key={c.slug}
                  href={categoryHref(c.slug)}
                  className="group flex flex-col items-start p-4 bg-white rounded-xl border border-neutral-200 hover:border-brand-400 hover:shadow-lg transition-all"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-red-500 group-hover:bg-brand-600 group-hover:text-white transition-colors mb-4">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-sans font-semibold text-neutral-900 mb-1 text-left text-sm md:text-lg">{c.label}</h3>
                  <p className="text-xs text-neutral-400">{CATEGORY_TILE[c.slug].blurb}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="relative pt-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-50/40 via-white to-white pointer-events-none" />
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-amber-100/30 blur-3xl rounded-full pointer-events-none" />
          <div className="container-x relative">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-brand-500 font-semibold text-sm uppercase">Handpicked for you</span>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 mt-1">Featured Properties</h2>
              </div>
              <SliderNav id="featured" tone="brand" />
            </div>

            <div className="relative featured-properties-slider">
              <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                navigation={{ prevEl: '.featured-prev', nextEl: '.featured-next' }}
                autoplay={{ delay: 6000, disableOnInteraction: false }}
                loop={featured.length > 3}
                breakpoints={{ 640: { slidesPerView: 1.5 }, 768: { slidesPerView: 1 }, 1024: { slidesPerView: 1.3 } }}
                className="!pb-12"
              >
                {featured.map((property) => (
                  <SwiperSlide key={property.id}>
                    <PropertyCardHorizontal property={property} href={getPropertyPath(property)} />
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-32 bg-gradient-to-l from-white via-white/50 to-transparent md:block" />
            </div>
          </div>
        </section>
      )}

      {/* Exclusive */}
      {exclusive.length > 0 && (
        <section className="pt-10 bg-amber-50">
          <div className="container-x">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-brand-500 font-semibold text-sm uppercase tracking-wider">OneMillionSqFt&apos;s</span>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 mt-2">Exclusive Projects</h2>
              </div>
              <SliderNav id="exclusive" tone="gold" />
            </div>

            <div className="relative exclusive-properties-slider">
              <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={26}
                slidesPerView={1}
                navigation={{ prevEl: '.exclusive-prev', nextEl: '.exclusive-next' }}
                autoplay={{ delay: 6000, disableOnInteraction: false }}
                loop={exclusive.length > 3}
                breakpoints={{
                  640: { slidesPerView: 1.5 },
                  768: { slidesPerView: 2 },
                  1024: { slidesPerView: 2.3 },
                }}
                className="!pb-12"
              >
                {exclusive.map((property) => (
                  <SwiperSlide key={property.id}>
                    <PropertyCardPremium property={property} href={getPropertyPath(property)} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      )}

      {/* Newly added */}
      {latest.length > 0 && (
        <section className="pt-10 bg-neutral-100">
          <div className="container-x">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-brand-500 font-semibold text-sm uppercase tracking-wider">Explore More</span>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 mt-2">Newly-added Properties</h2>
              </div>
              <SliderNav id="latest" tone="light" />
            </div>

            <div className="relative featured-properties-slider">
              <Swiper
                modules={[Navigation, Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                navigation={{ prevEl: '.latest-prev', nextEl: '.latest-next' }}
                autoplay={{ delay: 6000, disableOnInteraction: false }}
                loop={latest.length > 4}
                breakpoints={{ 640: { slidesPerView: 1.5 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3.2 } }}
                className="!pb-12"
              >
                {latest.map((property) => (
                  <SwiperSlide key={property.id}>
                    <PropertyCardNewLaunch property={property} href={getPropertyPath(property)} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      )}

      {/* Browse by status */}
      <section className="py-10 bg-amber-50">
        <div className="container-x">
          <div className="mb-12 max-w-2xl">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-red-500">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Find by availability
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 mt-3 tracking-tight">Browse by Property Status</h2>
            <p className="text-neutral-600 mt-4 text-base md:text-md leading-relaxed">
              Explore projects based on their current stage — from homes you can move into today to plots ready for construction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {POSSESSION.map((p) => {
              const tile = STATUS_TILES[p.slug];
              const Icon = tile.icon;
              return (
                <Link
                  key={p.slug}
                  href={possessionHref(p.slug)}
                  aria-label={`Browse ${p.label} properties`}
                  className="group relative flex flex-col p-5 rounded-2xl border border-neutral-200 bg-white text-left overflow-hidden hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-200/60 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-red-600 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${tile.soft} ${tile.softHover} transition-all duration-300 group-hover:scale-105 group-hover:shadow-sm`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-neutral-300 group-hover:text-brand-500 transition-colors duration-300">
                      <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <h3 className="font-sans font-semibold text-neutral-900 text-lg leading-snug group-hover:text-brand-600 transition-colors duration-300">
                      {p.label}
                    </h3>
                    <p className="text-xs text-neutral-600 leading-snug line-clamp-2">{tile.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* High demand */}
      {inDemand.length > 0 && (
        <section className="py-10">
          <div className="container-x">
            <div className="mb-10">
              <span className="text-brand-500 font-semibold text-sm uppercase tracking-wider">Handpicked for you</span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 mt-2">High-demand projects to invest now</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inDemand.map((property) => (
                <PropertySmallCard key={property.id} property={property} href={getPropertyPath(property)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Browse by BHK */}
      <section className="py-10 bg-amber-50">
        <div className="container-x">
          <div className="mb-8">
            <span className="text-sm font-semibold uppercase text-brand-500">Find by configuration</span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 mt-2">Browse by BHK</h2>
            <p className="text-neutral-600 mt-3 max-w-2xl">
              Explore homes based on the number of bedrooms that suit your lifestyle and requirements.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {BHK_TILES.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group relative overflow-hidden rounded-2xl bg-white border border-neutral-200 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-brand-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-red-500 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
                    <Bed className="h-6 w-6" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-neutral-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand-600" />
                </div>
                <h3 className="font-sans text-xl font-bold text-neutral-900">{item.title}</h3>
                <p className="mt-1 text-sm text-neutral-500">{item.description}</p>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-brand-600 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top cities */}
      <section className="py-10 md:py-16 bg-white">
        <div className="container-x">
          <div className="text-left mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-4 py-1 text-xs uppercase font-semibold text-brand-400 mb-4">
              <MapPin className="h-3.5 w-3.5" />
              Explore by Location
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 mb-3">Browse by Top Cities</h2>
            <p className="text-neutral-500 max-w-2xl text-sm md:text-base">
              Explore curated properties in South India&apos;s most dynamic real estate markets
            </p>
          </div>

          <div className="space-y-16">
            {CITIES.map((city) => {
              const rail = cities.find((c) => c.slug === city.slug);
              const copy = CITY_COPY[city.slug];
              return (
                <div key={city.slug} className="bg-amber-50 p-2 md:p-4 rounded-2xl shadow-sm border border-neutral-200">
                  <div className="relative h-72 md:h-80 rounded-2xl overflow-hidden mb-4 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-400 via-neutral-600 to-neutral-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-3xl font-bold text-white mb-2">{city.name}</h3>
                        {copy && <p className="text-white/80 mb-3 max-w-xl text-sm md:text-base">{copy.blurb}</p>}
                        <div className="relative z-10 flex flex-wrap gap-2">
                          {copy?.localities.map((l) => (
                            <Link
                              key={l.slug}
                              href={localityHref(city.slug, l.slug)}
                              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90 backdrop-blur-sm transition-colors hover:bg-white/25"
                            >
                              {l.name}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <span className="inline-flex shrink-0 items-center gap-2 self-start md:self-end rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-lg transition-all duration-300 group-hover:bg-brand-600 group-hover:text-white">
                        View all in {city.name}
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>

                    {/* Whole banner links to the city search; locality pills sit above it (z-10) */}
                    <Link
                      href={cityHref(city.slug)}
                      aria-label={`View all properties in ${city.name}`}
                      className="absolute inset-0 z-[5]"
                    />
                  </div>

                  {rail && rail.properties.length > 0 && (
                    <PropertySmallCardSlider label={`${formatCount(rail.count)} properties available`}>
                      {rail.properties.map((property) => (
                        <div key={property.id} className="w-[320px] sm:w-[380px] shrink-0 snap-start">
                          <PropertySmallCard property={property} href={getPropertyPath(property)} />
                        </div>
                      ))}
                    </PropertySmallCardSlider>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <BuilderCards builders={builders} />

      <PostCta />

      <WhyChooseUs />

      {/* News & articles */}
      <section className="relative overflow-hidden bg-amber-50 py-10">
        <div className="container-x relative">
          <div className="mb-12 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-brand-600">
                From the journal
              </span>
              <h2 className="font-serif text-2xl font-bold leading-tight text-neutral-900 md:text-3xl">News &amp; Articles</h2>
              <p className="mt-3 text-neutral-500">
                Market trends, buying guides, and expert perspectives to help you make informed real estate decisions.
              </p>
            </div>

            <Link
              href={PATHS.blog}
              className="group hidden items-center gap-2 rounded-full border border-neutral-200 py-1.5 pl-5 pr-1.5 text-sm font-semibold text-neutral-900 transition-all duration-300 hover:border-brand-600 md:flex"
            >
              View All Articles
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
            {posts[0] && (
              <Link
                href={`/blog/${posts[0].slug}`}
                className="group relative col-span-1 overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left transition-all duration-500 hover:shadow-2xl hover:shadow-neutral-200/60 lg:col-span-7"
              >
                <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[16/9] lg:aspect-auto lg:h-full lg:min-h-[420px]">
                  <img
                    src={posts[0].image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                  <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md border border-white/20">
                    {posts[0].category}
                  </span>
                  <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-300 group-hover:border-brand-600 group-hover:bg-brand-600">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <div className="mb-3 flex items-center gap-4 text-xs font-medium text-white/70">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {posts[0].date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {posts[0].readTime} min read
                      </span>
                    </div>
                    <h3 className="mb-3 max-w-2xl font-sans text-md font-semibold leading-snug text-white md:text-[1.65rem]">
                      {posts[0].title}
                    </h3>
                    <p className="max-w-xl text-sm leading-relaxed text-white/75 line-clamp-2">{posts[0].excerpt}</p>
                  </div>
                </div>
              </Link>
            )}

            <div className="flex flex-col gap-4 lg:col-span-5">
              {posts.slice(1, 4).map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-1 gap-4 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-3 text-left transition-all duration-300 hover:border-brand-200 hover:shadow-lg hover:shadow-neutral-200/50 sm:gap-5 sm:p-4"
                >
                  <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-32">
                    <img
                      src={post.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-600">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                        <Clock className="h-3 w-3" />
                        {post.readTime} min
                      </span>
                    </div>
                    <h4 className="font-sans text-[15px] font-semibold leading-snug text-neutral-900 transition-colors duration-300 line-clamp-2 group-hover:text-brand-600 sm:text-base">
                      {post.title}
                    </h4>
                    <p className="mt-1.5 hidden text-xs leading-relaxed text-neutral-500 line-clamp-2 sm:block">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link
              href={PATHS.blog}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-brand-600/25"
            >
              View All Articles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <TestimonialSection />

      {/* Closing CTA */}
      <section className="py-20 bg-brand-600">
        <div className="container-x text-center">
          <h2 className="font-serif text-2xl md:text-4xl font-bold text-white mb-4">Ready to Find Your Dream Home?</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Browse our extensive collection of verified properties or get in touch with our team for personalized assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={allPropertiesHref()}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-white text-brand-600 font-semibold hover:bg-neutral-100 transition-colors"
            >
              Browse Properties <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href={SITE.phoneHref}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-brand-700 text-white font-semibold hover:bg-brand-800 transition-colors"
            >
              <Phone className="h-5 w-5" /> Talk to an Expert
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
