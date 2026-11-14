'use client';

import { useState, useEffect } from 'react';
import { formatPrice, formatPriceFull, formatArea } from '@/lib/format';
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
    Mail,
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
    Eye,
    TrendingUp,
    Flame,
    Award,
    ShieldCheck,
    Zap,
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

export function PropertyDetailFeaturedContent({ property, similar }: DetailProps) {
  const { openEnquiry: openEnquiryDialog } = useEnquiry();
  const openEnquiry = () => openEnquiryDialog({ propertySlug: property.slug, heading: property.title });
  const slug = property.slug;

    const [activeImage, setActiveImage] = useState(0);
    const [liked, setLiked] = useState(false);
    const [activeFloorPlan, setActiveFloorPlan] = useState(0);

    const [lightboxOpen, setLightboxOpen] = useState(false);

    // Deterministic "urgency" stats seeded off slug so they don't jump around on re-render
    const seed = slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const [viewers, setViewers] = useState(12 + (seed % 23));
    const inquiries24h = 4 + (seed % 9);


    // Gentle live-viewer flicker for urgency effect
    useEffect(() => {
        const interval = setInterval(() => {
            setViewers((v) => Math.max(6, v + (Math.random() > 0.5 ? 1 : -1)));
        }, 4000);
        return () => clearInterval(interval);
    }, []);



    const gallery = property.gallery || [];
    const allImages = [property.image_url, ...gallery];
    const amenities = property.amenities || [];
    const nearby = property.nearby || [];
    const floorPlans = property.floor_plans || [];
    const configurations = property.configurations || [];

    const overview = [
        { icon: Bed, label: 'Bedrooms', value: property.bedrooms ? `${property.bedrooms} BHK` : 'N/A' },
        { icon: Bath, label: 'Bathrooms', value: property.bathrooms ? `${property.bathrooms}` : 'N/A' },
        { icon: Maximize, label: 'Built-up Area', value: formatArea(property.area_sqft) },
        { icon: Sofa, label: 'Furnishing', value: property.furnishing },
        { icon: Car, label: 'Parking', value: `${property.parking} ${property.parking === 1 ? 'Space' : 'Spaces'}` },
        { icon: Layers, label: 'Floor', value: property.floor_number ? `${property.floor_number} of ${property.total_floors}` : 'N/A' },
        { icon: Calendar, label: 'Property Age', value: `${property.age_years} ${property.age_years === 1 ? 'Year' : 'Years'}` },
        { icon: CheckCircle2, label: 'Status', value: property.status },
    ];

    const badges = [
        { icon: Award, label: 'Featured', className: 'bg-yellow-400 text-yellow-900' },
        { icon: ShieldCheck, label: 'RERA Verified', className: 'bg-emerald-500 text-white', show: !!property.rera_id },
    ].filter((b) => b.show !== false);

    const nextImage = () => setActiveImage((prev) => (prev + 1) % allImages.length);
    const prevImage = () => setActiveImage((prev) => (prev - 1 + allImages.length) % allImages.length);

    return (
        <div className="bg-neutral-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-neutral-200">
                <div className="container-xx py-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Link href="/" className="hover:text-brand-600">Home</Link>
                        <span>/</span>
                        <Link href={allPropertiesHref()} className="hover:text-brand-600">Properties</Link>
                        <span>/</span>
                        <Link href={cityHref(property.city_slug)} className="hover:text-brand-600">{property.city}</Link>
                        <span>/</span>
                        {/* <span className="text-neutral-900 font-medium truncate">{property.title}</span> */}
                        <span className="text-neutral-900 font-medium truncate">{property.slug}</span>
                    </div>
                </div>
            </div>

            {/* Urgency strip */}
            <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white">
                <div className="container-xx py-2.5 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm font-medium">
                    <span className="hidden sm:flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4" /> {inquiries24h} inquiries in the last 24 hours
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Zap className="h-4 w-4" /> High demand — limited availability
                    </span>
                </div>
            </div>

            {/* Gallery */}
            <div className="container-xx py-6">
                {/* <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,4fr)_minmax(150px,1fr)] gap-4 mb-6">
                    <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden group">
                        <img
                            src={allImages[activeImage]}
                            alt={property.title}
                            className="w-full h-full object-cover"
                        />

                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {allImages.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`h-2 rounded-full transition-all ${i === activeImage ? 'w-8 bg-brand-600' : 'w-2 bg-white/70'
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[85%]">
                            {badges.map(({ icon: Icon, label, className }) => (
                                <span
                                    key={label}
                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${className}`}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {label.toUpperCase()}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible">
                        {allImages.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImage(i)}
                                className={`flex-shrink-0 h-24 w-32 lg:w-full lg:h-24 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImage
                                    ? 'border-brand-600'
                                    : 'border-transparent hover:border-neutral-300'
                                    }`}
                            >
                                <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div> */}

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Gallery */}
                        {/* <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_100px] lg:grid-cols-[minmax(0,1fr)_110px] gap-3">
                            <div className="relative h-[280px] sm:h-[320px] md:h-[380px] rounded-2xl overflow-hidden group">
                                <img
                                    src={allImages[activeImage]}
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                />

                                <button
                                    onClick={prevImage}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <button
                                    onClick={nextImage}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>

                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {allImages.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(i)}
                                            className={`h-1.5 rounded-full transition-all ${i === activeImage ? 'w-6 bg-brand-600' : 'w-1.5 bg-white/70'
                                                }`}
                                        />
                                    ))}
                                </div>

                                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
                                    {badges.map(({ icon: Icon, label, className }) => (
                                        <span
                                            key={label}
                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md ${className}`}
                                        >
                                            <Icon className="h-3 w-3" />
                                            {label.toUpperCase()}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-x-visible">
                                {allImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`flex-shrink-0 h-16 w-24 sm:w-full sm:h-[70px] rounded-lg overflow-hidden border-2 transition-colors ${i === activeImage
                                            ? 'border-brand-600'
                                            : 'border-transparent hover:border-neutral-300'
                                            }`}
                                    >
                                        <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div> */}

                        {/* Gallery - compact + lightbox */}
                        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_100px] lg:grid-cols-[minmax(0,1fr)_110px] gap-3">
                            {/* Main Image */}
                            <div className="relative h-[280px] sm:h-[320px] md:h-[380px] rounded-2xl overflow-hidden group">
                                <img
                                    src={allImages[activeImage]}
                                    alt={property.title}
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() => setLightboxOpen(true)}
                                />

                                {/* Expand hint */}
                                <button
                                    onClick={() => setLightboxOpen(true)}
                                    className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                    aria-label="Open gallery"
                                >
                                    <Maximize className="h-4 w-4" />
                                </button>

                                <button
                                    onClick={prevImage}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <button
                                    onClick={nextImage}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>

                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {allImages.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(i)}
                                            className={`h-1.5 rounded-full transition-all ${i === activeImage ? 'w-6 bg-brand-600' : 'w-1.5 bg-white/70'
                                                }`}
                                        />
                                    ))}
                                </div>

                                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
                                    {badges.map(({ icon: Icon, label, className }) => (
                                        <span
                                            key={label}
                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md ${className}`}
                                        >
                                            <Icon className="h-3 w-3" />
                                            {label.toUpperCase()}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Thumbnails */}
                            <div className="flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-x-visible">
                                {allImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`flex-shrink-0 h-16 w-24 sm:w-full sm:h-[70px] rounded-lg overflow-hidden border-2 transition-colors ${i === activeImage
                                            ? 'border-brand-600'
                                            : 'border-transparent hover:border-neutral-300'
                                            }`}
                                    >
                                        <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ========== Lightbox ========== */}
                        {lightboxOpen && (
                            <div
                                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
                                onClick={() => setLightboxOpen(false)}
                            >
                                {/* Close */}
                                <button
                                    onClick={() => setLightboxOpen(false)}
                                    className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                                    aria-label="Close gallery"
                                >
                                    <span className="text-xl leading-none">×</span>
                                </button>

                                {/* Counter */}
                                <div className="absolute top-4 left-4 z-10 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white">
                                    {activeImage + 1} / {allImages.length}
                                </div>

                                {/* Prev */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        prevImage();
                                    }}
                                    className="absolute left-3 md:left-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </button>

                                {/* Next */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        nextImage();
                                    }}
                                    className="absolute right-3 md:right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </button>

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

                                {/* Thumbnail strip at bottom */}
                                <div
                                    className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-2 py-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {allImages.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(i)}
                                            className={`flex-shrink-0 h-14 w-20 rounded-md overflow-hidden border-2 transition-all ${i === activeImage
                                                ? 'border-white opacity-100 scale-105'
                                                : 'border-transparent opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Title & Price */}
                        <div className="bg-white rounded-xl border-2 p-6 relative overflow-hidden">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <span className="text-sm font-medium text-brand-600 uppercase tracking-wider">
                                        {property.property_type} in {property.locality}
                                    </span>
                                    <h1 className="font-serif text-xl md:text-2xl font-bold text-neutral-900 mt-1 mb-2">
                                        {property.title}
                                    </h1>
                                    <div className="flex items-center gap-1 text-neutral-500">
                                        <MapPin className="h-4 w-4" />
                                        <span>
                                            {property.locality}, {property.city}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => setLiked(!liked)}
                                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 hover:border-brand-300 hover:bg-brand-50 transition-colors"
                                    >
                                        <Heart
                                            className={`h-5 w-5 ${liked ? 'fill-brand-600 text-brand-600' : 'text-neutral-600'
                                                }`}
                                        />
                                    </button>
                                    <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 hover:border-brand-300 hover:bg-brand-50 transition-colors">
                                        <Share2 className="h-5 w-5 text-neutral-600" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-end justify-between border-t border-neutral-100 pt-4">
                                <div>
                                    <div className="text-3xl font-bold text-brand-600">
                                        {formatPrice(property.price)}
                                    </div>
                                    <div className="text-sm text-neutral-500 mt-1">
                                        onwards
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-neutral-500">Price per sqft</div>
                                    <div className="font-semibold text-neutral-900">
                                        ₹{Math.round(property.price / property.area_sqft).toLocaleString('en-IN')}/sqft
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Overview */}
                        <div className="bg-white rounded-xl border border-neutral-200 p-6">
                            <h2 className="font-serif text-xl font-bold text-neutral-900 mb-5">Property Overview</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {overview.map(({ icon: Icon, label, value }) => (
                                    <div
                                        key={label}
                                        className="flex flex-col items-center text-center p-4 rounded-lg bg-neutral-100"
                                    >
                                        <Icon className="h-6 w-6 text-red-500 mb-2" />
                                        <div className="text-xs text-neutral-400 mb-1">{label}</div>
                                        <div className="text-sm font-semibold text-neutral-900">{value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-xl border border-neutral-200 p-6">
                            <h2 className="font-serif text-xl font-bold text-neutral-900 mb-4">About this property</h2>
                            <p className="text-neutral-600 leading-relaxed">{property.description}</p>
                        </div>

                        {/* ========== Price on Request (BHK configurations) ========== */}
                        {/* {configurations.length > 0 ? (
                            <div className="bg-white rounded-xl border border-neutral-200 p-6">
                                <h2 className="font-serif text-xl font-bold text-neutral-900 mb-5">Price on Request</h2>
                                <p className="text-sm text-neutral-500 mb-5">
                                    Select a configuration to get the latest pricing and availability.
                                </p>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-neutral-200 text-left text-neutral-500">
                                                <th className="pb-3 font-medium">Configuration</th>
                                                <th className="pb-3 font-medium">Built-up Area</th>
                                                <th className="pb-3 font-medium">Price</th>
                                                <th className="pb-3 font-medium text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {configurations.map((config, idx) => (
                                                <tr key={idx} className="border-b border-neutral-100 last:border-0">
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Bed className="h-4 w-4 text-red-500" />
                                                            <span className="font-semibold text-neutral-900">
                                                                {config.bhk} BHK
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-neutral-600">
                                                        {config.area_sqft ? formatArea(config.area_sqft) : '—'}
                                                    </td>
                                                    <td className="py-4">
                                                        {config.price ? (
                                                            <span className="font-semibold text-brand-600">
                                                                {formatPrice(config.price)}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                                                Price on Request
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <button
                                                            onClick={openEnquiry}
                                                            className="text-sm font-medium text-red-600 hover:text-red-700"
                                                        >
                                                            Enquire Now
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-neutral-200 p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h2 className="font-serif text-xl font-bold text-neutral-900">
                                            Price on Request
                                        </h2>
                                        <p className="mt-1 text-sm text-neutral-500">
                                            Contact us for the latest pricing on available{' '}
                                            {property.bedrooms ? `${property.bedrooms} BHK` : ''} units.
                                        </p>
                                    </div>
                                    <button
                                        onClick={openEnquiry}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:brightness-105 transition-all"
                                    >
                                        Request Pricing
                                    </button>
                                </div>
                            </div>
                        )} */}

                        {configurations.length > 0 ? (
                            <div className="bg-white rounded-xl border border-neutral-200 p-6">
                                <h2 className="font-serif text-xl font-bold text-neutral-900 mb-2">Price on Request</h2>
                                <p className="text-sm text-neutral-500 mb-5">
                                    Select a configuration to get the latest pricing and availability.
                                </p>

                                {/* Horizontal scroll */}
                                <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide snap-x snap-mandatory">
                                    {configurations.map((config, idx) => (
                                        <div
                                            key={idx}
                                            className="flex-shrink-0 w-[220px] sm:w-[240px] snap-start rounded-xl border border-neutral-200 bg-neutral-50 p-5 flex flex-col"
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <Bed className="h-4 w-4 text-red-500" />
                                                <span className="font-semibold text-neutral-900 text-lg">
                                                    {config.bhk} BHK
                                                </span>
                                            </div>

                                            <div className="text-sm text-neutral-500 mb-1">Built-up Area</div>
                                            <div className="text-sm font-medium text-neutral-700 mb-4">
                                                {config.area_sqft ? formatArea(config.area_sqft) : '—'}
                                            </div>

                                            <div className="mt-auto">
                                                {config.price ? (
                                                    <div className="mb-4">
                                                        <div className="text-xs text-neutral-500 mb-0.5">Price</div>
                                                        <div className="font-semibold text-brand-600">
                                                            {formatPrice(config.price)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mb-4">
                                                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                                            Price on Request
                                                        </span>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={openEnquiry}
                                                    className="w-full py-2.5 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
                                                >
                                                    Enquire Now
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-neutral-200 p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h2 className="font-serif text-xl font-bold text-neutral-900">
                                            Price on Request
                                        </h2>
                                        <p className="mt-1 text-sm text-neutral-500">
                                            Contact us for the latest pricing on available{' '}
                                            {property.bedrooms ? `${property.bedrooms} BHK` : ''} units.
                                        </p>
                                    </div>
                                    <button
                                        onClick={openEnquiry}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:brightness-105 transition-all"
                                    >
                                        Request Pricing
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ========== Floor Plans ========== */}
                        {floorPlans.length > 0 && (
                            <div className="bg-white rounded-xl border border-neutral-200 p-6">
                                <h2 className="font-serif text-xl font-bold text-neutral-900 mb-5">Floor Plans</h2>

                                <div className="flex flex-wrap gap-2 mb-5">
                                    {floorPlans.map((plan, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveFloorPlan(idx)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFloorPlan === idx
                                                ? 'bg-red-600 text-white'
                                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                                }`}
                                        >
                                            {plan.title || `${plan.bhk} BHK`}
                                        </button>
                                    ))}
                                </div>

                                {floorPlans[activeFloorPlan] && (
                                    <div className="space-y-4">
                                        <div className="relative aspect-[4/3] md:aspect-[14/6] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                                            {floorPlans[activeFloorPlan].image_url ? (
                                                <img
                                                    src={floorPlans[activeFloorPlan].image_url}
                                                    alt={
                                                        floorPlans[activeFloorPlan].title ||
                                                        `${floorPlans[activeFloorPlan].bhk} BHK Floor Plan`
                                                    }
                                                    className="w-full h-full object-contain p-3"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400">
                                                    <Layout className="h-12 w-12 mb-2" />
                                                    <span className="text-sm">Floor plan image coming soon</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-neutral-600">
                                                <Bed className="h-4 w-4 text-red-500" />
                                                <span className="font-medium">
                                                    {floorPlans[activeFloorPlan].bhk} BHK
                                                </span>
                                            </div>
                                            {floorPlans[activeFloorPlan].area_sqft && (
                                                <div className="flex items-center gap-2 text-neutral-600">
                                                    <Maximize className="h-4 w-4 text-red-500" />
                                                    <span>{formatArea(floorPlans[activeFloorPlan].area_sqft!)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {floorPlans[activeFloorPlan].description && (
                                            <p className="text-sm text-neutral-600 leading-relaxed">
                                                {floorPlans[activeFloorPlan].description}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Amenities */}
                        {amenities.length > 0 && (
                            <div className="bg-white rounded-xl border border-neutral-200 p-6">
                                <h2 className="font-serif text-xl font-bold text-neutral-900 mb-5">
                                    Amenities
                                </h2>

                                <div className="flex flex-wrap gap-3">
                                    {amenities.map((amenity) => (
                                        <div
                                            key={amenity}
                                            className="inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-neutral-100"
                                        >
                                            <CheckCircle2 className="h-5 w-5 text-red-500 flex-shrink-0" />
                                            <span className="text-sm text-neutral-700 whitespace-nowrap">
                                                {amenity}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Property Details */}
                        <div className="bg-white rounded-xl border border-neutral-200 p-6">
                            <h2 className="font-serif text-xl font-bold text-neutral-900 mb-5">Property Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                                {[
                                    { icon: Building, label: 'Builder', value: property.builder || 'N/A' },
                                    { icon: FileText, label: 'RERA ID', value: property.rera_id || 'N/A' },
                                    { icon: Home, label: 'Property Type', value: property.property_type },
                                    { icon: Ruler, label: 'Built-up Area', value: formatArea(property.area_sqft) },
                                    { icon: Sofa, label: 'Furnishing', value: property.furnishing },
                                    {
                                        icon: Car,
                                        label: 'Car Parking',
                                        value: `${property.parking} ${property.parking === 1 ? 'Space' : 'Spaces'}`,
                                    },
                                    {
                                        icon: Layers,
                                        label: 'Floor Details',
                                        value: property.floor_number
                                            ? `Floor ${property.floor_number} of ${property.total_floors}`
                                            : 'N/A',
                                    },
                                    {
                                        icon: Hammer,
                                        label: 'Property Age',
                                        value: `${property.age_years} ${property.age_years === 1 ? 'Year' : 'Years'}`,
                                    },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div
                                        key={label}
                                        className="flex items-center justify-between py-2 border-b border-neutral-100"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Icon className="h-4 w-4 text-neutral-400" />
                                            <span className="text-sm text-neutral-500">{label}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-neutral-900">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location + Nearby */}
                        <div className="bg-white rounded-xl border border-neutral-200 p-6">
                            <div className="flex items-start justify-between gap-4 mb-5">
                                <div>
                                    <h2 className="font-serif text-xl font-bold text-neutral-900">Location</h2>
                                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-neutral-500">
                                        <MapPin className="h-4 w-4 shrink-0 text-amber-500" />
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
                                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3.5 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-white"
                                >
                                    Open in Maps
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            </div>

                            {/* Map */}
                            <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 aspect-[16/9] md:aspect-[21/9]">
                                <iframe
                                    title="Property location"
                                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                                        `${property.locality}, ${property.city}`
                                    )}&output=embed`}
                                    className="absolute inset-0 h-full w-full border-0"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    allowFullScreen
                                />
                                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5 rounded-xl" />
                            </div>

                            {/* Nearby Locations / Location Advantages */}
                            {nearby.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-sans text-sm font-semibold text-neutral-900 mb-4">
                                        Nearby Locations & Advantages
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
                                                    className="flex items-center gap-3 rounded-lg bg-neutral-50 px-3.5 py-3"
                                                >
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-neutral-200">
                                                        <Icon className="h-4 w-4 text-red-500" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-medium text-neutral-900 truncate">
                                                            {name}
                                                        </div>
                                                        {distance && (
                                                            <div className="text-xs text-neutral-500 mt-0.5">
                                                                {distance}
                                                            </div>
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

                    {/* Right Column - Contact Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-36 space-y-4">
                            <div className="bg-white rounded-xl border-2 border-yellow-300 p-6">
                                <div className="flex items-center justify-center gap-1.5 mb-3 text-xs font-bold text-red-600 bg-red-50 rounded-full py-1.5">
                                    <Flame className="h-3.5 w-3.5" /> {inquiries24h} PEOPLE INQUIRED TODAY
                                </div>

                                <div className="space-y-3 mb-5">
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <MapPin className="h-4 w-4 text-brand-600" />
                                        {property.locality}, {property.city}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <Home className="h-4 w-4 text-brand-600" />
                                        {property.property_type}
                                        {property.bedrooms && ` · ${property.bedrooms} BHK`}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <Maximize className="h-4 w-4 text-brand-600" />
                                        {formatArea(property.area_sqft)}
                                    </div>
                                </div>

                                    <>
                                        <button
                                            onClick={openEnquiry}
                                            className="w-full py-3 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold hover:brightness-105 transition-all mb-3"
                                        >
                                            Contact Builder
                                        </button>
                                        {/* <p className="text-xs text-neutral-400 text-center">
                                            Mention OneMillionSqFt for priority assistance
                                        </p> */}
                                    </>
                            </div>

                            {/* Builder Info */}
                            {/* {property.builder && (
                                <div className="bg-white rounded-xl border border-neutral-200 p-5">
                                    <h3 className="font-semibold text-neutral-900 mb-2">Developer</h3>
                                    <p className="text-sm text-neutral-600 mb-1">{property.builder}</p>
                                    {property.rera_id && (
                                        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-2">
                                            <FileText className="h-3.5 w-3.5" />
                                            RERA: {property.rera_id}
                                        </div>
                                    )}
                                </div>
                            )} */}

                            {/* {property.builder && (
                                <div className="bg-white rounded-xl border border-neutral-200 p-5">
                                    <h3 className="font-sans font-semibold text-neutral-900 mb-3">Builder Info</h3>
                                    <div className="flex items-center gap-3">
                                        {property.builder_logo ? (
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
                                    </div>
                                    {property.rera_id && (
                                        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-3">
                                            <FileText className="h-3.5 w-3.5" />
                                            RERA: {property.rera_id}
                                        </div>
                                    )}
                                </div>
                            )} */}

                            {property.builder && (
                                <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)]">
                                    <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />

                                    <div className="p-5 pt-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="font-sans font-semibold text-neutral-900">Builder Info</h3>
                                            {property.rera_id && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                                    <ShieldCheck className="h-3 w-3" />
                                                    RERA Registered
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 rounded-xl bg-neutral-50 p-3.5">
                                            {property.builder_logo ? (
                                                <img
                                                    src={property.builder_logo}
                                                    alt={`${property.builder} logo`}
                                                    className="h-16 w-16 shrink-0 rounded-xl border border-neutral-200 bg-white object-contain p-2"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white">
                                                    <Building2 className="h-6 w-6 text-neutral-400" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                                    Developer
                                                </div>
                                                <div className="truncate font-sans text-base font-bold text-neutral-900">
                                                    {property.builder}
                                                </div>
                                                <div className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                                                    <MapPin className="h-3 w-3 text-amber-500" />
                                                    {property.city}
                                                </div>
                                            </div>
                                        </div>

                                        <dl className="mt-4 divide-y divide-neutral-100 text-sm">
                                            {[
                                                { icon: Home, label: 'Project type', value: property.property_type },
                                                { icon: MapPin, label: 'Locality', value: property.locality },
                                                { icon: CheckCircle2, label: 'Status', value: property.status },
                                                {
                                                    icon: Calendar,
                                                    label: 'Property age',
                                                    value:
                                                        property.age_years != null
                                                            ? `${property.age_years} ${property.age_years === 1 ? 'year' : 'years'}`
                                                            : null,
                                                },
                                            ]
                                                .filter((row) => row.value)
                                                .map(({ icon: Icon, label, value }) => (
                                                    <div key={label} className="flex items-center justify-between gap-3 py-2.5">
                                                        <dt className="flex items-center gap-2 text-neutral-500">
                                                            <Icon className="h-3.5 w-3.5 text-red-400" />
                                                            {label}
                                                        </dt>
                                                        <dd className="text-right font-semibold text-neutral-900">{value}</dd>
                                                    </div>
                                                ))}
                                        </dl>

                                        {property.rera_id && (
                                            <div className="mt-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 p-3.5">
                                                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    RERA registration no.
                                                </div>
                                                <div className="mt-1 break-all font-mono text-sm font-semibold text-neutral-900">
                                                    {property.rera_id}
                                                </div>
                                            </div>
                                        )}

                                        {/* <button
                                            onClick={() =>
                                                navigate(
                                                    `/properties?city=${encodeURIComponent(property.city)}&search=${encodeURIComponent(property.builder)}`
                                                )
                                            }
                                            className="group mt-4 flex w-full items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-900 transition-all hover:border-red-200 hover:bg-red-50/50 hover:text-red-600"
                                        >
                                            View more projects by {property.builder}
                                            <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
                                        </button> */}

                                        <p className="mt-3 text-[11px] leading-relaxed text-neutral-400">
                                            Always verify the RERA registration on your state's official RERA portal before booking.
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            <SimilarProperties similar={similar} />
      <StickyEnquiryBar propertySlug={property.slug} />

        </div>
    );
}
