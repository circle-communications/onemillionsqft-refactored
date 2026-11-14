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
  ExternalLink,
  School,
  Hospital,
  Train,
  ShoppingBag,
  Utensils,
  Trees,
  Layout,
  Building2,
  Compass,
} from 'lucide-react';
import Link from 'next/link';
import { StickyEnquiryBar } from '@/components/layout/StickyEnquiryBar';
import { useEnquiry } from '@/components/layout/EnquiryProvider';
import { allPropertiesHref, categoryHref, cityHref, textSearchHref } from '@/lib/search/links';
import { SimilarProperties, plotAttributes, type DetailProps } from './shared';

// Optional helper – map landmark type → icon
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

type InfoItem = { icon: React.ElementType; label: string; value?: string };

// Boolean / string helper for optional plot flags → "Yes" / "No" / text / undefined
const flag = (v: unknown): string | undefined => {
  if (v === null || v === undefined || v === '') return undefined;
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return String(v);
};

export function PlotDetailContent({ property, similar }: DetailProps) {
  const { openEnquiry: openEnquiryDialog } = useEnquiry();
  const openEnquiry = () => openEnquiryDialog({ propertySlug: property.slug, heading: property.title });
  const slug = property.slug;

  const [activeImage, setActiveImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [activeFloorPlan, setActiveFloorPlan] = useState(0);




  const gallery = property.gallery || [];
  const allImages = [property.image_url, ...gallery];
  const amenities = property.amenities || [];

  // ---- Plot / land detection ----
  // Matches property_type values like "Plot", "Residential Plot", "Commercial Land", "Farm Land"
  const isPlot = /plot|land/i.test(property.property_type ?? '');

  // ---- Optional data (add these to your Property type) ----
  // nearby: Array<{ name: string; distance?: string; type?: string }>
  // floor_plans (or layout_plans): Array<{ bhk?: number; title?: string; image_url?: string; area_sqft?: number; description?: string }>
  // configurations: Array<{ bhk?: number; area_sqft?: number; price?: number | null; status?: string }>
  //
  // ---- Optional plot-only fields (all hidden when empty) ----
  // plot_dimensions (e.g. "30 x 40 ft"), facing, road_width (e.g. "30 ft"), corner_plot (boolean),
  // boundary_wall (boolean | string), land_use, approval_authority, ownership
  const x = plotAttributes(property);
  const nearby = property.nearby ?? [];
  const floorPlans = property.floor_plans ?? [];
  const configurations = property.configurations ?? [];

  // ---- Overview ----
  const apartmentOverview: InfoItem[] = [
    { icon: Bed, label: 'Bedrooms', value: property.bedrooms ? `${property.bedrooms} BHK` : 'N/A' },
    { icon: Bath, label: 'Bathrooms', value: property.bathrooms ? `${property.bathrooms}` : 'N/A' },
    { icon: Maximize, label: 'Built-up Area', value: formatArea(property.area_sqft) },
    { icon: Sofa, label: 'Furnishing', value: property.furnishing },
    { icon: Car, label: 'Parking', value: `${property.parking} ${property.parking === 1 ? 'Space' : 'Spaces'}` },
    { icon: Layers, label: 'Floor', value: property.floor_number ? `${property.floor_number} of ${property.total_floors}` : 'N/A' },
    { icon: Calendar, label: 'Property Age', value: `${property.age_years} ${property.age_years === 1 ? 'Year' : 'Years'}` },
    { icon: CheckCircle2, label: 'Status', value: property.status },
  ];

  const plotOverview: InfoItem[] = [
    { icon: Maximize, label: 'Plot Area', value: formatArea(property.area_sqft) },
    { icon: Ruler, label: 'Dimensions', value: flag(x.plot_dimensions) },
    { icon: Compass, label: 'Facing', value: flag(x.facing) },
    { icon: Ruler, label: 'Road Width', value: flag(x.road_width) },
    { icon: MapPin, label: 'Corner Plot', value: flag(x.corner_plot) },
    { icon: Layout, label: 'Boundary Wall', value: flag(x.boundary_wall) },
    { icon: Layers, label: 'Land Use', value: flag(x.land_use) },
    { icon: FileText, label: 'Approval', value: flag(x.approval_authority) },
    { icon: CheckCircle2, label: 'Status', value: property.status },
  ];

  const overview = (isPlot ? plotOverview : apartmentOverview).filter((i) => i.value);

  // ---- Property details table ----
  const apartmentDetails: InfoItem[] = [
    { icon: Building, label: 'Builder', value: property.builder || 'N/A' },
    { icon: FileText, label: 'RERA ID', value: property.rera_id || 'N/A' },
    { icon: Home, label: 'Property Type', value: property.property_type },
    { icon: Ruler, label: 'Built-up Area', value: formatArea(property.area_sqft) },
    { icon: Sofa, label: 'Furnishing', value: property.furnishing },
    { icon: Car, label: 'Car Parking', value: `${property.parking} ${property.parking === 1 ? 'Space' : 'Spaces'}` },
    { icon: Layers, label: 'Floor Details', value: property.floor_number ? `Floor ${property.floor_number} of ${property.total_floors}` : 'N/A' },
    { icon: Hammer, label: 'Property Age', value: `${property.age_years} ${property.age_years === 1 ? 'Year' : 'Years'}` },
  ];

  const plotDetails: InfoItem[] = [
    { icon: Building, label: 'Developer', value: property.builder || undefined },
    { icon: FileText, label: 'RERA ID', value: property.rera_id || undefined },
    { icon: Home, label: 'Property Type', value: property.property_type },
    { icon: Ruler, label: 'Plot Area', value: formatArea(property.area_sqft) },
    { icon: Ruler, label: 'Plot Dimensions', value: flag(x.plot_dimensions) },
    { icon: Compass, label: 'Facing', value: flag(x.facing) },
    { icon: Ruler, label: 'Road Width', value: flag(x.road_width) },
    { icon: MapPin, label: 'Corner Plot', value: flag(x.corner_plot) },
    { icon: Layout, label: 'Boundary Wall', value: flag(x.boundary_wall) },
    { icon: Layers, label: 'Land Use', value: flag(x.land_use) },
    { icon: FileText, label: 'Approval Authority', value: flag(x.approval_authority) },
    { icon: Home, label: 'Ownership', value: flag(x.ownership) },
  ];

  const details = (isPlot ? plotDetails : apartmentDetails).filter((i) => i.value);

  const nextImage = () => setActiveImage((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setActiveImage((prev) => (prev - 1 + allImages.length) % allImages.length);

  const pricePerSqft =
    property.price && property.area_sqft
      ? `₹${Math.round(property.price / property.area_sqft).toLocaleString('en-IN')}/sqft`
      : '—';

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-x py-4">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Link href="/" className="hover:text-brand-600">Home</Link>
            <span>/</span>
            <Link href={allPropertiesHref()} className="hover:text-brand-600">Properties</Link>
            <span>/</span>
            <Link href={cityHref(property.city_slug)} className="hover:text-brand-600">{property.city}</Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium truncate">{property.title}</span>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="container-x py-6">
        <div className="mb-6 space-y-3">
          {/* Main image */}
          <div className="relative h-[280px] sm:h-[400px] md:h-[560px] rounded-3xl overflow-hidden group">
            <img
              src={allImages[activeImage]}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Bottom gradient for readability */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

            {/* Featured badge */}
            {property.featured && (
              <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-400 text-yellow-900 shadow">
                FEATURED
              </span>
            )}

            {/* Counter */}
            <span className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur-sm">
              {activeImage + 1} / {allImages.length}
            </span>

            {/* Arrows */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-2 rounded-full transition-all ${i === activeImage ? 'w-8 bg-white' : 'w-2 bg-white/60'}`}
                />
              ))}
            </div>
          </div>

          {/* Thumbnail strip */}
          <div className="flex gap-3 overflow-x-auto pb-1 snap-x">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`snap-start flex-shrink-0 h-20 w-28 sm:h-24 sm:w-36 rounded-xl overflow-hidden border-2 transition-all ${i === activeImage
                  ? 'border-brand-600 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
              >
                <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Price */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
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
                    <Heart className={`h-5 w-5 ${liked ? 'fill-brand-600 text-brand-600' : 'text-neutral-600'}`} />
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
                  <div className="font-semibold text-neutral-900">{pricePerSqft}</div>
                </div>
              </div>
            </div>

            {/* Overview */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="font-serif text-xl font-bold text-neutral-900 mb-5">
                {isPlot ? 'Plot Overview' : 'Property Overview'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {overview.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex flex-col items-center text-center p-4 rounded-lg bg-neutral-100">
                    <Icon className="h-6 w-6 text-brand-600 mb-2" />
                    <div className="text-xs text-neutral-400 mb-1">{label}</div>
                    <div className="text-sm font-semibold text-neutral-900">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h2 className="font-serif text-xl font-bold text-neutral-900 mb-4">
                {isPlot ? 'About this plot' : 'About this property'}
              </h2>
              <p className="text-neutral-600 leading-relaxed">{property.description}</p>
            </div>

            {/* ========== Price on Request (BHK configurations / plot sizes) ========== */}
            {configurations.length > 0 && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <h2 className="font-serif text-xl font-bold text-neutral-900 mb-5">Price on Request</h2>
                <p className="text-sm text-neutral-500 mb-5">
                  {isPlot
                    ? 'Select a plot size to get the latest pricing and availability.'
                    : 'Select a configuration to get the latest pricing and availability.'}
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 text-left text-neutral-500">
                        <th className="pb-3 font-medium">{isPlot ? 'Plot Size' : 'Configuration'}</th>
                        {!isPlot && <th className="pb-3 font-medium">Built-up Area</th>}
                        <th className="pb-3 font-medium">Price</th>
                        <th className="pb-3 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {configurations.map((config: any, idx: number) => (
                        <tr key={idx} className="border-b border-neutral-100 last:border-0">
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              {isPlot ? (
                                <>
                                  <Ruler className="h-4 w-4 text-brand-600" />
                                  <span className="font-semibold text-neutral-900">
                                    {config.area_sqft ? formatArea(config.area_sqft) : config.title || '—'}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Bed className="h-4 w-4 text-brand-600" />
                                  <span className="font-semibold text-neutral-900">
                                    {config.bhk} BHK
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                          {!isPlot && (
                            <td className="py-4 text-neutral-600">
                              {config.area_sqft ? formatArea(config.area_sqft) : '—'}
                            </td>
                          )}
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
                              className="text-sm font-medium text-brand-600 hover:text-brand-700"
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
            )}

            {/* Fallback when no configurations but we still want a "Price on Request" CTA */}
            {configurations.length === 0 && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-neutral-900">Price on Request</h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      {isPlot
                        ? 'Contact us for the latest pricing and availability of plots in this project.'
                        : `Contact us for the latest pricing on available ${property.bedrooms ? `${property.bedrooms} BHK` : ''} units.`}
                    </p>
                  </div>
                  <button
                    onClick={openEnquiry}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
                  >
                    Request Pricing
                  </button>
                </div>
              </div>
            )}

            {/* ========== Floor Plans / Layout Plan ========== */}
            {floorPlans.length > 0 && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <h2 className="font-serif text-xl font-bold text-neutral-900 mb-5">
                  {isPlot ? 'Layout Plan' : 'Floor Plans'}
                </h2>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {floorPlans.map((plan: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveFloorPlan(idx)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFloorPlan === idx
                        ? 'bg-brand-600 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                    >
                      {plan.title || (plan.bhk ? `${plan.bhk} BHK` : `Plan ${idx + 1}`)}
                    </button>
                  ))}
                </div>

                {/* Active plan */}
                {floorPlans[activeFloorPlan] && (
                  <div className="space-y-4">
                    <div className="relative aspect-[4/3] md:aspect-[16/10] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                      {floorPlans[activeFloorPlan].image_url ? (
                        <img
                          src={floorPlans[activeFloorPlan].image_url}
                          alt={
                            floorPlans[activeFloorPlan].title ||
                            (isPlot ? 'Layout Plan' : `${floorPlans[activeFloorPlan].bhk} BHK Floor Plan`)
                          }
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400">
                          <Layout className="h-12 w-12 mb-2" />
                          <span className="text-sm">
                            {isPlot ? 'Layout plan image coming soon' : 'Floor plan image coming soon'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {!isPlot && floorPlans[activeFloorPlan].bhk && (
                        <div className="flex items-center gap-2 text-neutral-600">
                          <Bed className="h-4 w-4 text-brand-600" />
                          <span className="font-medium">{floorPlans[activeFloorPlan].bhk} BHK</span>
                        </div>
                      )}
                      {floorPlans[activeFloorPlan].area_sqft && (
                        <div className="flex items-center gap-2 text-neutral-600">
                          <Maximize className="h-4 w-4 text-brand-600" />
                          <span>{formatArea(floorPlans[activeFloorPlan].area_sqft)}</span>
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
              <h2 className="font-serif text-xl font-bold text-neutral-900 mb-5">
                {isPlot ? 'Plot Details' : 'Property Details'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {details.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-neutral-100">
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
                    {nearby.map((item: any, idx: number) => {
                      const name = typeof item === 'string' ? item : item.name;
                      const distance = typeof item === 'object' ? item.distance : undefined;
                      const type = (typeof item === 'object' ? item.type : 'default')?.toLowerCase() || 'default';
                      const Icon = nearbyIconMap[type] || nearbyIconMap.default;

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-3 rounded-lg bg-neutral-50 px-3.5 py-3"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-neutral-200">
                            <Icon className="h-4 w-4 text-brand-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-neutral-900 truncate">{name}</div>
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

          {/* Right Column - Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-36 space-y-4">
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <MapPin className="h-4 w-4 text-brand-600" />
                    {property.locality}, {property.city}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Home className="h-4 w-4 text-brand-600" />
                    {property.property_type}
                    {!isPlot && property.bedrooms && ` · ${property.bedrooms} BHK`}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Maximize className="h-4 w-4 text-brand-600" />
                    {formatArea(property.area_sqft)}
                  </div>
                  {isPlot && flag(x.facing) && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Compass className="h-4 w-4 text-brand-600" />
                      {flag(x.facing)} facing
                    </div>
                  )}
                </div>

                  <>
                    <button
                      onClick={openEnquiry}
                      className="w-full py-3 rounded-lg bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors mb-3"
                    >
                      Request a Call Back
                    </button>
                    <p className="text-xs text-neutral-400 text-center">
                      Mention OneMillionSqFt for priority assistance
                    </p>
                  </>
              </div>

              {property.builder && (
                <div className="bg-white rounded-xl border border-neutral-200 p-5">
                  <h3 className="font-sans font-semibold text-neutral-900 mb-3">
                    {/* {isPlot ? 'Developer Info' : 'Builder Info'} */}
                    Developer Info
                  </h3>
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