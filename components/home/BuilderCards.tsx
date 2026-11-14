'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Keyboard } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ArrowRight, BadgeCheck, ShieldCheck, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ShowcaseBuilder } from '@/lib/builders/showcase';

import 'swiper/css';

function BuilderCard({ builder, index }: { builder: ShowcaseBuilder; index: number }) {
  const [active, setActive] = useState(0);
  const project = builder.projects[active];

  return (
    <div
      className="builder-rise group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-600/10"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-500 via-brand-400 to-brand-300 bg-[length:200%_100%] transition-all duration-700 group-hover:bg-right" />

      <div className="flex flex-1 flex-col p-4">
        {/* Logo + name */}
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-100 bg-white p-2 shadow-sm">
            {builder.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={builder.logo} alt={builder.name} loading="lazy" className="h-full w-full object-contain" />
            ) : (
              <span className="text-xl font-bold text-brand-600">{builder.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-sans text-lg font-bold text-neutral-800">{builder.name}</h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-neutral-500">{builder.tagline}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {builder.badges.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-600"
            >
              <ShieldCheck className="h-3 w-3" />
              {b}
            </span>
          ))}
        </div>

        {/* Project tabs — swiper-no-swiping lets the tabs scroll natively inside the slider */}
        <div
          role="tablist"
          aria-label={`${builder.name} projects`}
          className="swiper-no-swiping mt-5 flex gap-5 overflow-x-auto border-b border-neutral-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {builder.projects.map((p, i) => (
            <button
              key={p.href}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`relative shrink-0 whitespace-nowrap pb-2.5 text-sm font-semibold transition-colors ${
                i === active ? 'text-brand-500' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {p.name}
              <span
                className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-brand-500 transition-transform duration-300 ${
                  i === active ? 'scale-x-100' : 'scale-x-0'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Project preview */}
        <Link href={project.href} className="group/preview relative mt-4 block h-44 w-full overflow-hidden rounded-xl text-left">
          {project.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={project.href}
              src={project.image}
              alt={project.name}
              loading="lazy"
              className="builder-fade absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover/preview:scale-110"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-400 via-neutral-600 to-neutral-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div key={project.href} className="builder-fade absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="truncate pb-1 font-sans text-base font-semibold text-white">{project.name}</div>
              <div className="flex items-center gap-1 text-xs text-white/80">
                <MapPin className="h-3 w-3" />
                {project.locality}
              </div>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-neutral-900 transition-all duration-300 group-hover/preview:bg-brand-400 group-hover/preview:text-white">
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/preview:translate-x-0.5" />
            </span>
          </div>
        </Link>

        {/* CTA */}
        <Link
          href={builder.href}
          className="group/cta mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-600"
        >
          View all projects
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

export function BuilderCards({ builders }: { builders: ShowcaseBuilder[] }) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  if (builders.length === 0) return null;

  const syncEdges = (s: SwiperType) => {
    setIsBeginning(s.isBeginning);
    setIsEnd(s.isEnd);
  };

  const arrowClass =
    'flex h-11 w-11 items-center justify-center rounded-full border border-brand-400 bg-white text-brand-600 shadow-sm transition-all duration-300 hover:border-brand-300 hover:bg-brand-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-brand-400 disabled:hover:bg-white disabled:hover:text-brand-600';

  return (
    <section className="relative overflow-hidden bg-neutral-100 py-10">
      <style>{`
        @keyframes builderRise {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes builderFade {
          from { opacity: 0; transform: scale(1.03); }
          to { opacity: 1; transform: scale(1); }
        }
        .builder-rise { animation: builderRise .7s ease both; }
        .builder-fade { animation: builderFade .5s ease both; }
        @media (prefers-reduced-motion: reduce) {
          .builder-rise, .builder-fade { animation: none; }
        }
      `}</style>

      <div className="container-x relative">
        {/* Header + arrows */}
        <div className="mb-10 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-left">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-4 py-1 text-xs font-semibold uppercase text-brand-500">
              <BadgeCheck className="h-3.5 w-3.5" />
              Our Trusted Partners
            </span>
            <h2 className="mb-3 font-serif text-2xl font-bold text-neutral-900 md:text-3xl">Trusted Builders</h2>
            <p className="max-w-2xl text-neutral-500">
              We partner with Chennai&apos;s most reputed developers, known for quality construction and timely delivery
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => swiperRef.current?.slidePrev()}
              disabled={isBeginning}
              aria-label="Previous builders"
              className={arrowClass}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => swiperRef.current?.slideNext()}
              disabled={isEnd}
              aria-label="Next builders"
              className={arrowClass}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Slider */}
        <Swiper
          modules={[A11y, Keyboard]}
          slidesPerView="auto"
          spaceBetween={24}
          speed={500}
          grabCursor
          keyboard={{ enabled: true, onlyInViewport: true }}
          breakpoints={{ 1024: { spaceBetween: 32 } }}
          onSwiper={(s) => {
            swiperRef.current = s;
            syncEdges(s);
          }}
          onSlideChange={syncEdges}
          onReachBeginning={syncEdges}
          onReachEnd={syncEdges}
          onResize={syncEdges}
          onSlidesUpdated={syncEdges}
          className="!-mx-4 !px-4 !pb-6 !pt-3 sm:!-mx-6 sm:!px-6"
        >
          {builders.map((b, i) => (
            <SwiperSlide key={b.slug} className="!h-auto !w-[min(100%,360px)]">
              <BuilderCard builder={b} index={i} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
