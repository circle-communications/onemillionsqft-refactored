'use client';

import { useState, useEffect } from 'react';
import { formatPrice, formatArea } from '@/lib/format';
import type { Property } from '@/types';
import {
    Bed,
    Bath,
    Maximize,
    MapPin,
    Car,
    Building,
    Calendar,
    CheckCircle2,
    Phone,
    Share2,
    Heart,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Home,
    Ruler,
    Layers,
    Hammer,
    FileText,
    Sofa,
    Crown,
    Sparkles,
    Lock,
    ExternalLink,
    School,
    Hospital,
    Train,
    ShoppingBag,
    Utensils,
    Trees,
    Layout,
    Building2,
} from 'lucide-react';
import Link from 'next/link';
import { StickyEnquiryBar } from '@/components/layout/StickyEnquiryBar';
import { useEnquiry } from '@/components/layout/EnquiryProvider';
import { allPropertiesHref, categoryHref, cityHref, textSearchHref } from '@/lib/search/links';
import { SimilarProperties, plotAttributes, type DetailProps } from './shared';

const nearbyIconMap: Record<string, React.ElementType> = {
    school: School,
    hospital: Hospital,
    metro: Train,
    railway: Train,
    mall: ShoppingBag,
    market: ShoppingBag,
    restaurant: Utensils,
    park: Trees,
    default: MapPin,
};

export function PropertyDetailExclusiveContent({ property, similar }: DetailProps) {
  const { openEnquiry: openEnquiryDialog } = useEnquiry();
  const openEnquiry = () => openEnquiryDialog({ propertySlug: property.slug, heading: property.title });
  const slug = property.slug;

    const [activeImage, setActiveImage] = useState(0);
    const [liked, setLiked] = useState(false);
    const [activeFloorPlan, setActiveFloorPlan] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);


    // Keyboard support for lightbox
    useEffect(() => {
        if (!lightboxOpen) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightboxOpen(false);
            if (e.key === 'ArrowLeft') {
                setActiveImage((prev) => {
                    const len = (property?.gallery?.length ?? 0) + 1;
                    return (prev - 1 + len) % len;
                });
            }
            if (e.key === 'ArrowRight') {
                setActiveImage((prev) => {
                    const len = (property?.gallery?.length ?? 0) + 1;
                    return (prev + 1) % len;
                });
            }
        };

        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [lightboxOpen, property]);



    const gallery = property.gallery || [];
    const allImages = [property.image_url, ...gallery].filter(Boolean);
    const amenities = property.amenities || [];
    const nearby = property.nearby || [];
    const floorPlans = property.floor_plans || [];
    const configurations = property.configurations || [];

    const overview = [
        { icon: Bed, label: 'Bedrooms', value: property.bedrooms ? `${property.bedrooms} BHK` : '—' },
        { icon: Bath, label: 'Bathrooms', value: property.bathrooms ?? '—' },
        { icon: Maximize, label: 'Built-up', value: formatArea(property.area_sqft) },
        { icon: Sofa, label: 'Furnishing', value: property.furnishing || '—' },
        { icon: Car, label: 'Parking', value: property.parking ? `${property.parking}` : '—' },
        {
            icon: Layers,
            label: 'Floor',
            value: property.floor_number ? `${property.floor_number}/${property.total_floors}` : '—',
        },
        {
            icon: Calendar,
            label: 'Age',
            value: property.age_years != null ? `${property.age_years} yrs` : '—',
        },
        { icon: CheckCircle2, label: 'Status', value: property.status || '—' },
    ];

    const nextImage = () => setActiveImage((prev) => (prev + 1) % allImages.length);
    const prevImage = () => setActiveImage((prev) => (prev - 1 + allImages.length) % allImages.length);

    const marqueeText = [
        'Exclusive Private Collection',
        'By Invitation Only',
        'OneMillionSqFt',
        'Curated Residences',
        'Private Viewings Available',
    ];

    return (
        <div className="bg-neutral-950 min-h-screen text-neutral-200">
            {/* ─── SCROLLING GOLD TOP BAR ─── */}
            <div className="sticky top-20 z-50 overflow-hidden border-b border-yellow-500/25 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950">
                <div className="flex whitespace-nowrap animate-marquee py-2.5">
                    {[...marqueeText, ...marqueeText, ...marqueeText].map((text, i) => (
                        <span
                            key={i}
                            className="flex items-center gap-3 mx-6 text-[11px] font-medium tracking-[0.22em] uppercase text-yellow-500/90"
                        >
                            <Crown className="h-3 w-3 text-yellow-500/70 flex-shrink-0" />
                            {text}
                            <span className="text-yellow-500/30">✦</span>
                        </span>
                    ))}
                </div>
            </div>

            <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-marquee {
          animation: marquee 28s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

            {/* ─── CINEMATIC HERO ─── */}
            <section className="relative h-[72vh] min-h-[520px] max-h-[820px] w-full overflow-hidden">
                <img
                    src={allImages[activeImage]}
                    alt={property.title}
                    className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 cursor-pointer"
                    onClick={() => setLightboxOpen(true)}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/45 to-neutral-950/25" />
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/75 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/[0.03] via-transparent to-amber-600/[0.04]" />

                {/* Top navigation */}
                <div className="absolute top-0 left-0 right-0 z-20">
                    <div className="container-xx py-5 flex items-center justify-between">
                        <Link href={allPropertiesHref()}
                            className="flex items-center gap-2 text-sm text-white/70 hover:text-yellow-400 transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Back to Properties</span>
                        </Link>

                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-semibold tracking-[0.15em] uppercase bg-black/50 backdrop-blur-md text-yellow-400 border border-yellow-500/40 shadow-[0_0_20px_-4px_rgba(234,179,8,0.35)]">
                                <Crown className="h-3 w-3" />
                                Exclusive
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setLiked(!liked)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 backdrop-blur-md border border-yellow-500/20 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all"
                                >
                                    <Heart
                                        className={`h-4 w-4 ${liked ? 'fill-yellow-500 text-yellow-500' : 'text-white/80'}`}
                                    />
                                </button>
                                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 backdrop-blur-md border border-yellow-500/20 hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all">
                                    <Share2 className="h-4 w-4 text-white/80" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Gallery controls */}
                {allImages.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-4 sm:left-6 top-1/4 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/35 backdrop-blur-md border border-yellow-500/20 text-white hover:border-yellow-500/50 hover:bg-black/55 transition-all"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-4 sm:right-6 top-1/4 -translate-y-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/35 backdrop-blur-md border border-yellow-500/20 text-white hover:border-yellow-500/50 hover:bg-black/55 transition-all"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </>
                )}

                {/* Expand gallery hint */}
                {/* <button
                    onClick={() => setLightboxOpen(true)}
                    className="absolute top-20 right-4 sm:right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 backdrop-blur-md border border-yellow-500/20 text-white hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all"
                    aria-label="Open gallery"
                >
                    <Maximize className="h-4 w-4" />
                </button> */}
                <button
                    onClick={() => setLightboxOpen(true)}
                    className="absolute bottom-20 right-4 sm:right-6 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 backdrop-blur-md border border-yellow-500/20 text-white hover:border-yellow-500/50 hover:bg-yellow-500/10 transition-all"
                    aria-label="Open gallery"
                >
                    <Maximize className="h-4 w-4" />
                </button>

                {/* Hero content */}
                <div className="absolute bottom-0 left-0 right-0 z-20">
                    <div className="container-xx pb-10 sm:pb-14">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                                <p className="text-[11px] font-medium tracking-[0.2em] text-yellow-400 uppercase">
                                    {property.property_type} · {property.locality}
                                </p>
                            </div>

                            <h1 className="font-serif text-3xl sm:text-4xl lg:text-4xl font-semibold text-white leading-[1.15] mb-4 drop-shadow-sm">
                                {property.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-white/75 text-sm mb-6">
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-yellow-400" />
                                    {property.locality}, {property.city}
                                </span>
                                {property.bedrooms && (
                                    <span className="flex items-center gap-1.5">
                                        <Bed className="h-3.5 w-3.5 text-yellow-400" />
                                        {property.bedrooms} BHK
                                    </span>
                                )}
                                {property.area_sqft > 0 && (
                                    <span className="flex items-center gap-1.5">
                                        <Maximize className="h-3.5 w-3.5 text-yellow-400" />
                                        {formatArea(property.area_sqft)}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-end gap-6 mb-6">
                                <div>
                                    <p className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent tracking-tight">
                                        {formatPrice(property.price)}
                                    </p>
                                    <p className="text-xs text-white/50 mt-1 tracking-wide">
                                        Price on application
                                    </p>
                                </div>
                            </div>

                            {/* <button
                                onClick={openEnquiry}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-neutral-900 text-sm font-semibold tracking-wide hover:from-yellow-400 hover:to-amber-400 active:scale-[0.98] transition-all shadow-lg shadow-yellow-500/30"
                            >
                                <Lock className="h-3.5 w-3.5" />
                                Request Builder Contact
                            </button> */}
                            <button
                                onClick={openEnquiry}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#d9b66a] via-[#e6c981] to-[#c9a45c] text-[#2a241a] hover:brightness-105 text-sm font-semibold tracking-wide active:scale-[0.98] transition-all shadow-lg shadow-yellow-500/30"
                            >
                                <Lock className="h-3.5 w-3.5" />
                                Request Builder Contact
                            </button>
                        </div>
                    </div>
                </div>

                {/* Progress dots */}
                {allImages.length > 1 && (
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                        {allImages.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImage(i)}
                                className={`h-1 rounded-full transition-all duration-300 ${i === activeImage
                                    ? 'w-7 bg-gradient-to-r from-yellow-400 to-amber-400'
                                    : 'w-1.5 bg-white/35 hover:bg-yellow-400/60'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* ─── Thumbnail strip ─── */}
            {allImages.length > 1 && (
                <div className="border-b border-yellow-500/15 bg-neutral-950">
                    <div className="container-xx py-4">
                        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                            {allImages.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`relative flex-shrink-0 h-20 w-28 sm:h-24 sm:w-36 rounded-xl overflow-hidden border transition-all ${i === activeImage
                                        ? 'border-yellow-500 ring-1 ring-yellow-500/50 shadow-[0_0_16px_-4px_rgba(234,179,8,0.4)]'
                                        : 'border-neutral-800 hover:border-yellow-500/40'
                                        }`}
                                >
                                    <img src={img} alt={`View ${i + 1}`} className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Main content ─── */}
            <div className="container-xx py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
                    {/* Left column */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Overview */}
                        <div>
                            <h2 className="font-serif text-xl font-semibold text-neutral-100 mb-6 tracking-wide flex items-center gap-2">
                                <span className="h-px w-6 bg-gradient-to-r from-yellow-500 to-transparent" />
                                Overview
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {overview.map(({ icon: Icon, label, value }) => (
                                    <div
                                        key={label}
                                        className="flex flex-col items-center text-center p-5 rounded-2xl bg-neutral-900/70 border border-yellow-500/10 hover:border-yellow-500/25 transition-colors"
                                    >
                                        <Icon className="h-5 w-5 text-yellow-500 mb-3" />
                                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
                                            {label}
                                        </p>
                                        <p className="text-sm font-medium text-neutral-200 font-serif">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="rounded-2xl border border-yellow-500/15 bg-neutral-900/50 p-6">
                            <h2 className="font-serif text-xl font-semibold text-neutral-100 mb-5 tracking-wide flex items-center gap-2">
                                <span className="h-px w-6 bg-gradient-to-r from-yellow-500 to-transparent" />
                                About this residence
                            </h2>
                            <p className="text-neutral-400 leading-relaxed text-[15px] whitespace-pre-line">
                                {property.description}
                            </p>
                        </div>

                        {/* ========== Price on Request ========== */}
                        {/* {configurations.length > 0 ? (
                            <div className="rounded-2xl border border-yellow-500/15 bg-neutral-900/50 p-6">
                                <h2 className="font-serif text-xl font-semibold text-neutral-100 mb-2 tracking-wide flex items-center gap-2">
                                    <span className="h-px w-6 bg-gradient-to-r from-yellow-500 to-transparent" />
                                    Price on Request
                                </h2>
                                <p className="text-sm text-neutral-500 mb-5">
                                    Select a configuration for the latest pricing and availability.
                                </p>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-yellow-500/15 text-left text-neutral-500">
                                                <th className="pb-3 font-medium">Configuration</th>
                                                <th className="pb-3 font-medium">Built-up Area</th>
                                                <th className="pb-3 font-medium">Price</th>
                                                <th className="pb-3 font-medium text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {configurations.map((config, idx) => (
                                                <tr key={idx} className="border-b border-yellow-500/10 last:border-0">
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Bed className="h-4 w-4 text-yellow-500" />
                                                            <span className="font-medium text-neutral-200 font-serif">
                                                                {config.bhk} BHK
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-neutral-400">
                                                        {config.area_sqft ? formatArea(config.area_sqft) : '—'}
                                                    </td>
                                                    <td className="py-4">
                                                        {config.price ? (
                                                            <span className="font-medium bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                                                                {formatPrice(config.price)}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-full bg-yellow-500/10 border border-yellow-500/25 px-2.5 py-1 text-xs font-medium text-yellow-400">
                                                                Price on Request
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <button
                                                            onClick={openEnquiry}
                                                            className="text-sm font-medium text-yellow-500 hover:text-yellow-400 transition-colors"
                                                        >
                                                            Enquire
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-yellow-500/15 bg-neutral-900/50 p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h2 className="font-serif text-xl font-semibold text-neutral-100 tracking-wide flex items-center gap-2">
                                            <span className="h-px w-6 bg-gradient-to-r from-yellow-500 to-transparent" />
                                            Price on Request
                                        </h2>
                                        <p className="mt-1.5 text-sm text-neutral-500">
                                            Contact us for the latest pricing on available{' '}
                                            {property.bedrooms ? `${property.bedrooms} BHK` : ''} residences.
                                        </p>
                                    </div>
                                    <button
                                        onClick={openEnquiry}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:from-yellow-400 hover:to-amber-400 transition-all shrink-0"
                                    >
                                        Request Pricing
                                    </button>
                                </div>
                            </div>
                        )} */}

                        {configurations.length > 0 ? (
                            <div className="rounded-2xl border border-yellow-500/15 bg-neutral-900/50 p-6">
                                <h2 className="font-serif text-xl font-semibold text-neutral-100 mb-2 tracking-wide flex items-center gap-2">
                                    <span className="h-px w-6 bg-gradient-to-r from-yellow-500 to-transparent" />
                                    Price on Request
                                </h2>
                                <p className="text-sm text-neutral-500 mb-5">
                                    Select a configuration for the latest pricing and availability.
                                </p>

                                {/* Horizontal scroll */}
                                <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide snap-x snap-mandatory">
                                    {configurations.map((config, idx) => (
                                        <div
                                            key={idx}
                                            className="flex-shrink-0 w-[220px] sm:w-[240px] snap-start rounded-xl border border-yellow-500/15 bg-neutral-950/80 p-5 flex flex-col"
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <Bed className="h-4 w-4 text-yellow-500" />
                                                <span className="font-medium text-neutral-100 font-serif text-lg">
                                                    {config.bhk} BHK
                                                </span>
                                            </div>

                                            <div className="text-sm text-neutral-500 mb-1">Built-up Area</div>
                                            <div className="text-sm font-medium text-neutral-300 mb-4">
                                                {config.area_sqft ? formatArea(config.area_sqft) : '—'}
                                            </div>

                                            <div className="mt-auto">
                                                {config.price ? (
                                                    <div className="mb-4">
                                                        <div className="text-xs text-neutral-500 mb-0.5">Price</div>
                                                        <div className="font-semibold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                                                            {formatPrice(config.price)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mb-4">
                                                        <span className="inline-flex items-center rounded-full bg-yellow-500/10 border border-yellow-500/25 px-2.5 py-1 text-xs font-medium text-yellow-400">
                                                            Price on Request
                                                        </span>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={openEnquiry}
                                                    className="w-full py-2.5 rounded-lg border border-yellow-500/30 text-sm font-medium text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-all"
                                                >
                                                    Enquire
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-yellow-500/15 bg-neutral-900/50 p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h2 className="font-serif text-xl font-semibold text-neutral-100 tracking-wide flex items-center gap-2">
                                            <span className="h-px w-6 bg-gradient-to-r from-yellow-500 to-transparent" />
                                            Price on Request
                                        </h2>
                                        <p className="mt-1.5 text-sm text-neutral-500">
                                            Contact us for the latest pricing on available{' '}
                                            {property.bedrooms ? `${property.bedrooms} BHK` : ''} residences.
                                        </p>
                                    </div>
                                    <button
                                        onClick={openEnquiry}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:from-yellow-400 hover:to-amber-400 transition-all shrink-0"
                                    >
                                        Request Pricing
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ========== Floor Plans ========== */}
                        {floorPlans.length > 0 && (
                            <div className="rounded-2xl border border-yellow-500/15 bg-neutral-900/50 p-6">
                                <h2 className="font-serif text-xl font-semibold text-neutral-100 mb-5 tracking-wide flex items-center gap-2">
                                    <span className="h-px w-6 bg-gradient-to-r from-yellow-500 to-transparent" />
                                    Floor Plans
                                </h2>

                                <div className="flex flex-wrap gap-2 mb-5">
                                    {floorPlans.map((plan, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveFloorPlan(idx)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFloorPlan === idx
                                                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-neutral-900'
                                                : 'bg-neutral-950 border border-yellow-500/15 text-neutral-400 hover:border-yellow-500/40 hover:text-neutral-200'
                                                }`}
                                        >
                                            {plan.title || `${plan.bhk} BHK`}
                                        </button>
                                    ))}
                                </div>

                                {floorPlans[activeFloorPlan] && (
                                    <div className="space-y-4">
                                        <div className="relative aspect-[4/3] md:aspect-[16/10] rounded-xl overflow-hidden bg-neutral-950 border border-yellow-500/10">
                                            {floorPlans[activeFloorPlan].image_url ? (
                                                <img
                                                    src={floorPlans[activeFloorPlan].image_url}
                                                    alt={
                                                        floorPlans[activeFloorPlan].title ||
                                                        `${floorPlans[activeFloorPlan].bhk} BHK Floor Plan`
                                                    }
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-600">
                                                    <Layout className="h-12 w-12 mb-2 text-yellow-500/40" />
                                                    <span className="text-sm">Floor plan image coming soon</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-neutral-400">
                                                <Bed className="h-4 w-4 text-yellow-500" />
                                                <span className="font-medium text-neutral-200">
                                                    {floorPlans[activeFloorPlan].bhk} BHK
                                                </span>
                                            </div>
                                            {floorPlans[activeFloorPlan].area_sqft && (
                                                <div className="flex items-center gap-2 text-neutral-400">
                                                    <Maximize className="h-4 w-4 text-yellow-500" />
                                                    <span>{formatArea(floorPlans[activeFloorPlan].area_sqft!)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {floorPlans[activeFloorPlan].description && (
                                            <p className="text-sm text-neutral-500 leading-relaxed font-serif">
                                                {floorPlans[activeFloorPlan].description}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Amenities */}
                        {amenities.length > 0 && (
                            <div className="rounded-2xl border border-yellow-500/15 bg-neutral-900/50 p-6">
                                <h2 className="font-serif text-xl font-semibold text-neutral-100 mb-6 tracking-wide flex items-center gap-2">
                                    <span className="h-px w-6 bg-gradient-to-r from-yellow-500 to-transparent" />
                                    Amenities
                                </h2>

                                <div className="flex flex-wrap gap-2.5">
                                    {amenities.map((amenity) => (
                                        <div
                                            key={amenity}
                                            className="inline-flex items-center gap-3 px-4 py-3.5 rounded-full bg-neutral-950/80 border border-yellow-500/10"
                                        >
                                            <CheckCircle2 className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                                            <span className="text-sm text-neutral-300 whitespace-nowrap">
                                                {amenity}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Specifications */}
                        <div className="rounded-2xl border border-yellow-500/15 bg-neutral-900/50 p-6">
                            <h2 className="font-serif text-xl font-semibold text-neutral-100 mb-6 tracking-wide flex items-center gap-2">
                                <span className="h-px w-6 bg-gradient-to-r from-yellow-500 to-transparent" />
                                Specifications
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                                {[
                                    { icon: Building, label: 'Developer', value: property.builder || '—' },
                                    { icon: FileText, label: 'RERA', value: property.rera_id || '—' },
                                    { icon: Home, label: 'Type', value: property.property_type },
                                    { icon: Ruler, label: 'Built-up Area', value: formatArea(property.area_sqft) },
                                    { icon: Sofa, label: 'Furnishing', value: property.furnishing || '—' },
                                    {
                                        icon: Car,
                                        label: 'Parking',
                                        value: property.parking
                                            ? `${property.parking} ${property.parking === 1 ? 'space' : 'spaces'}`
                                            : '—',
                                    },
                                    {
                                        icon: Layers,
                                        label: 'Floor',
                                        value: property.floor_number
                                            ? `${property.floor_number} of ${property.total_floors}`
                                            : '—',
                                    },
                                    {
                                        icon: Hammer,
                                        label: 'Age',
                                        value:
                                            property.age_years != null
                                                ? `${property.age_years} ${property.age_years === 1 ? 'year' : 'years'}`
                                                : '—',
                                    },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div
                                        key={label}
                                        className="flex items-center justify-between py-3.5 border-b border-yellow-500/10 last:border-0"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Icon className="h-3.5 w-3.5 text-yellow-500/50" />
                                            <span className="text-sm text-neutral-500">{label}</span>
                                        </div>
                                        <span className="text-sm font-medium text-neutral-200 font-serif text-right">
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location + Nearby */}
                        <div className="rounded-2xl border border-yellow-500/15 bg-neutral-900/50 p-4 sm:p-6">
                            <div className="flex items-start justify-between gap-4 mb-5">
                                <div>
                                    <h2 className="font-serif text-xl font-semibold text-neutral-100 tracking-wide flex items-center gap-2">
                                        <span className="h-px w-6 bg-gradient-to-r from-yellow-500 to-transparent" />
                                        Location
                                    </h2>
                                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-neutral-400">
                                        <MapPin className="h-4 w-4 shrink-0 text-yellow-500" />
                                        <span>
                                            {property.locality}, {property.city}
                                        </span>
                                    </p>
                                </div>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                        `${property.locality}, ${property.city}`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/25 bg-neutral-950 px-3.5 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-yellow-500/50 hover:text-yellow-400"
                                >
                                    Open in Maps
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            </div>

                            {/* Map */}
                            <div className="relative overflow-hidden rounded-xl border border-yellow-500/10 bg-neutral-900 aspect-[16/9] md:aspect-[21/9]">
                                <iframe
                                    title="Property location"
                                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                                        `${property.locality}, ${property.city}`
                                    )}&output=embed`}
                                    className="absolute inset-0 h-full w-full border-0"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    allowFullScreen
                                    style={{
                                        filter: 'invert(90%) hue-rotate(180deg) brightness(85%) contrast(90%)',
                                    }}
                                />
                                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-yellow-500/5 rounded-xl" />
                            </div>

                            {/* Nearby Locations & Advantages */}
                            {nearby.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-sans text-sm font-medium tracking-wide text-neutral-300 mb-4 flex items-center gap-2">
                                        <span className="h-px w-4 bg-yellow-500/50" />
                                        Nearby Locations
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {nearby.map((item, idx) => {
                                            const name = typeof item === 'string' ? item : item.name;
                                            const distance =
                                                typeof item === 'object' && item !== null ? item.distance : undefined;
                                            const type =
                                                (typeof item === 'object' && item !== null
                                                    ? item.type
                                                    : 'default'
                                                )?.toLowerCase() || 'default';
                                            const Icon = nearbyIconMap[type] || nearbyIconMap.default;

                                            return (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-3 rounded-xl bg-neutral-950/80 border border-yellow-500/10 px-3.5 py-3"
                                                >
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 border border-yellow-500/15">
                                                        <Icon className="h-4 w-4 text-yellow-500" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-medium text-neutral-200 truncate">
                                                            {name}
                                                        </div>
                                                        {distance && (
                                                            <div className="text-xs text-neutral-500 mt-0.5">{distance}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right column — sticky enquiry */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-5">
                            <div className="rounded-2xl border border-yellow-500/30 bg-neutral-900/90 p-7 shadow-[0_0_60px_-12px_rgba(234,179,8,0.2)] relative overflow-hidden">
                                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />

                                <div className="relative">
                                    <div className="flex items-center justify-center gap-1.5 mb-5 text-[10px] font-medium tracking-[0.2em] text-yellow-400 uppercase">
                                        <Lock className="h-3 w-3" />
                                        Private Enquiry
                                    </div>

                                    <div className="space-y-2.5 mb-6 text-sm text-neutral-400">
                                        <div className="flex items-center gap-2.5">
                                            <MapPin className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
                                            {property.locality}, {property.city}
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <Home className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
                                            {property.property_type}
                                            {property.bedrooms ? ` · ${property.bedrooms} BHK` : ''}
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <Maximize className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
                                            {formatArea(property.area_sqft)}
                                        </div>
                                    </div>

                                        <>
                                            <button
                                                onClick={openEnquiry}
                                                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d9b66a] via-[#e6c981] to-[#c9a45c] text-[#2a241a] text-sm font-semibold tracking-wide hover:brightness-105 active:scale-[0.98] transition-all mb-3 shadow-md shadow-yellow-500/25"
                                            >
                                                Request Builder Contact
                                            </button>
                                            <p className="text-[11px] text-neutral-600 text-center leading-relaxed">
                                                By appointment only · Mention OneMillionSqFt Exclusive
                                            </p>
                                        </>
                                </div>
                            </div>

                            {/* {property.builder && (
                                <div className="rounded-2xl border border-yellow-500/15 bg-neutral-900/60 p-6">
                                    <p className="text-[10px] font-medium tracking-[0.18em] text-yellow-500/70 uppercase mb-2">
                                        Developer
                                    </p>
                                    <p className="font-serif text-base font-medium text-neutral-100 mb-1">
                                        {property.builder}
                                    </p>
                                    {property.rera_id && (
                                        <div className="flex items-center gap-1.5 text-xs text-neutral-600 mt-2">
                                            <FileText className="h-3 w-3 text-yellow-500/40" />
                                            RERA {property.rera_id}
                                        </div>
                                    )}
                                </div>
                            )} */}

                            {property.builder && (
                                <div className="rounded-2xl border border-yellow-500/15 bg-neutral-900/60 p-6">
                                    <h3 className="font-sans font-semibold text-neutral-100 mb-3">Builder Info</h3>
                                    <div className="flex items-center gap-3">
                                        {property.builder_logo ? (
                                            // <img
                                            //     src={property.builder_logo}
                                            //     alt={`${property.builder} logo`}
                                            //     className="h-12 w-12 rounded-lg border border-neutral-200 object-contain bg-white p-1 shrink-0"
                                            //     loading="lazy"
                                            // />
                                            // <img
                                            //     src={property.builder_logo}
                                            //     alt={`${property.builder} logo`}
                                            //     className="h-12 w-12 rounded-lg border border-neutral-200 object-contain bg-white p-1 shrink-0"
                                            //     loading="lazy"
                                            // />
                                            <img
                                                src={property.builder_logo}
                                                alt={`${property.builder} logo`}
                                                className="h-auto w-32 rounded-lg border border-neutral-200 object-contain bg-white p-2 shrink-0"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center shrink-0">
                                                <Building2 className="h-5 w-5 text-neutral-400" />
                                            </div>
                                        )}
                                        {/* <p className="text-sm font-medium text-neutral-200">{property.builder}</p> */}
                                    </div>
                                    {property.rera_id && (
                                        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-3">
                                            <FileText className="h-3.5 w-3.5" />
                                            RERA: {property.rera_id}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {/* ========== Lightbox ========== */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
                    onClick={() => setLightboxOpen(false)}
                >
                    {/* Close */}
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors border border-white/10"
                        aria-label="Close gallery"
                    >
                        <span className="text-xl leading-none">×</span>
                    </button>

                    {/* Counter */}
                    <div className="absolute top-4 left-4 z-10 rounded-full bg-black/60 border border-yellow-500/20 px-3 py-1.5 text-sm text-yellow-400">
                        {activeImage + 1} / {allImages.length}
                    </div>

                    {/* Prev */}
                    {allImages.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                prevImage();
                            }}
                            className="absolute left-3 md:left-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors border border-white/10"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                    )}

                    {/* Next */}
                    {allImages.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                nextImage();
                            }}
                            className="absolute right-3 md:right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors border border-white/10"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    )}

                    {/* Image */}
                    <div
                        className="relative max-h-[85vh] max-w-[90vw] md:max-w-[80vw]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={allImages[activeImage]}
                            alt={`${property.title} - ${activeImage + 1}`}
                            className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
                        />
                    </div>

                    {/* Thumbnail strip */}
                    {allImages.length > 1 && (
                        <div
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-2 py-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {allImages.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`flex-shrink-0 h-14 w-20 rounded-md overflow-hidden border-2 transition-all ${i === activeImage
                                        ? 'border-yellow-500 opacity-100 scale-105 shadow-[0_0_12px_-2px_rgba(234,179,8,0.5)]'
                                        : 'border-transparent opacity-50 hover:opacity-90'
                                        }`}
                                >
                                    <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <SimilarProperties similar={similar} />
      <StickyEnquiryBar propertySlug={property.slug} />

        </div>
    );
}