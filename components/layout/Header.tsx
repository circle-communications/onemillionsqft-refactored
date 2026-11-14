'use client';

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  X,
  Home,
  Search,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Building2,
  LandPlot,
  Warehouse,
  Users,
  UserCog,
  Newspaper,
  BookOpen,
  BarChart3,
  MapPin,
  BedDouble,
  TrendingUp,
  IndianRupee,
  Megaphone,
  Headphones,
  ClipboardList,
  FilePlus,
  Send,
  CheckCircle2,
  Ellipsis,
  EllipsisVertical,
  type LucideIcon,
  MessageCircle,
} from 'lucide-react';
import { NAV as BUILT_NAV, NAV_LINKS, type MenuLink, type NavItem, type Promo, type SubLink } from '@/components/navigation/menu';
import { useEnquiry } from '@/components/layout/EnquiryProvider';
import { PATHS, SITE } from '@/lib/site';

/* ------------------------------------------------------------------ */
/*  z-index scale (single source of truth)                            */
/*    mega-menu dim .... z-40                                         */
/*    header + mobile bottom bar .... z-50 (mega panel lives inside)  */
/*    drawer backdrop .... z-[60]   drawer .... z-[70]                */
/*    enquiry modal .... z-[80]                                       */
/* ------------------------------------------------------------------ */

const LOGO_SRC = SITE.logo;
const LOGO_SRC_HERO = SITE.logoLight;
const POST_PROPERTY_PATH = PATHS.postProperty;
const CONTACT = SITE;

const NAV: NavItem[] = BUILT_NAV;


/* ------------------------------------------------------------------ */
/*  Hooks & tiny shared pieces                                        */
/* ------------------------------------------------------------------ */

function useLockBody(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
      {children}
    </span>
  );
}

function Chip({ href, onClick, children }: { href: string; onClick: () => void; children: ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-600 transition-colors hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600"
    >
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Desktop mega menu: rail | list | flyout                           */
/* ------------------------------------------------------------------ */

function PromoCard({ promo, onNavigate }: { promo: Promo; onNavigate: () => void }) {
  const Icon = promo.icon;
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-8 text-white">
      <div>
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
          <Icon className="h-6 w-6" />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-white/70">{promo.eyebrow}</p>
        <h3 className="mt-2 text-2xl font-semibold leading-snug">{promo.title}</h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">{promo.body}</p>
        <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {promo.points.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-white/80" />
              {p}
            </li>
          ))}
        </ul>
      </div>
      <Link
        href={promo.cta.path}
        onClick={onNavigate}
        className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-neutral-100"
      >
        {promo.cta.label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function PromoStrip({ promo, onNavigate }: { promo: Promo; onNavigate: () => void }) {
  const Icon = promo.icon;
  return (
    <div className="mt-auto pt-6">
      <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 p-4 text-white">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/15">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">{promo.eyebrow}</p>
          <p className="truncate text-sm font-semibold">{promo.title}</p>
        </div>
        <Link
          href={promo.cta.path}
          onClick={onNavigate}
          className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-neutral-100"
        >
          {promo.cta.label}
        </Link>
      </div>
    </div>
  );
}

function MegaPanel({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const [sectionId, setSectionId] = useState(item.sections[0].id);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const section = item.sections.find((s) => s.id === sectionId) ?? item.sections[0];
  const items = section.groups.flatMap((g) => g.items);
  const active = items.find((i) => i.label === activeLabel) ?? items.find((i) => i.children) ?? items[0];

  const selectSection = (id: string) => {
    setSectionId(id);
    setActiveLabel(null);
  };

  return (
    <div className="absolute inset-x-0 top-full animate-slide-up border-t border-neutral-200 bg-white shadow-[0_28px_56px_-12px_rgba(0,0,0,0.22)]">
      <div className="container-xx">
        <div className="grid max-h-[calc(100vh-9rem)] min-h-[440px] grid-cols-[250px_320px_minmax(0,1fr)] overflow-y-auto xl:grid-cols-[270px_340px_minmax(0,1fr)]">
          {/* Level 1: rail */}
          <div className="border-r border-neutral-100 py-7 pr-5">
            <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">{item.label}</p>
            <div className="space-y-1">
              {item.sections.map((s) => {
                const Icon = s.icon;
                const on = s.id === section.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onMouseEnter={() => selectSection(s.id)}
                    onFocus={() => selectSection(s.id)}
                    onClick={() => selectSection(s.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${on ? 'bg-brand-50 text-brand-600' : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${on ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-500'
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{s.label}</span>
                      <span className="block truncate text-xs font-normal text-neutral-500">{s.description}</span>
                    </span>
                    <ChevronRight className={`h-4 w-4 shrink-0 ${on ? 'text-brand-600' : 'text-neutral-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level 2: items */}
          <div className="border-r border-neutral-100 bg-neutral-50/70 px-5 py-7">
            {section.groups.map((g, gi) => (
              <div key={g.heading} className={gi > 0 ? 'mt-6' : ''}>
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-neutral-400">{g.heading}</p>
                <ul className="space-y-0.5">
                  {g.items.map((it) => {
                    const Icon = it.icon;
                    const on = active.label === it.label;
                    return (
                      <li key={it.label}>
                        <Link
                          href={it.path}
                          onClick={onNavigate}
                          onMouseEnter={() => setActiveLabel(it.label)}
                          onFocus={() => setActiveLabel(it.label)}
                          className={`flex items-center gap-3 rounded-xl px-3 transition-colors ${it.sub ? 'py-2.5' : 'py-2'
                            } ${on
                              ? 'bg-white text-brand-600 shadow-sm ring-1 ring-neutral-200'
                              : 'text-neutral-700 hover:bg-white/70'
                            }`}
                        >
                          {Icon && (
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${on ? 'bg-brand-50 text-brand-600' : 'bg-white text-neutral-500 ring-1 ring-neutral-200'
                                }`}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 text-sm font-semibold">
                              {it.label}
                              {it.badge && <Badge>{it.badge}</Badge>}
                            </span>
                            {it.sub && <span className="block truncate text-xs text-neutral-500">{it.sub}</span>}
                          </span>
                          {it.children && (
                            <ChevronRight className={`h-4 w-4 shrink-0 ${on ? 'text-brand-600' : 'text-neutral-300'}`} />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Level 3: flyout */}
          <div className="flex flex-col py-7 pl-8">
            {active.children ? (
              <>
                <div className="mb-5 flex items-end justify-between gap-4 border-b border-neutral-100 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                      {active.childrenTitle ?? section.label}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-neutral-900">{active.label}</h3>
                  </div>
                  <Link
                    href={active.path}
                    onClick={onNavigate}
                    className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
                  >
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <ul className="grid grid-cols-2 gap-x-6 gap-y-1 xl:grid-cols-3">
                  {active.children.map((c) => (
                    <li key={c.label}>
                      <Link
                        href={c.path}
                        onClick={onNavigate}
                        className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
                      >
                        <span className="flex items-center gap-2">
                          {c.label}
                          {c.badge && <Badge>{c.badge}</Badge>}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>

                <PromoStrip promo={item.promo} onNavigate={onNavigate} />
              </>
            ) : (
              <PromoCard promo={item.promo} onNavigate={onNavigate} />
            )}
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="border-t border-neutral-100 bg-neutral-50">
        <div className="container-xx flex items-center justify-between gap-4 py-3.5">
          <p className="flex items-center gap-2 text-sm text-neutral-600">
            <Phone className="h-4 w-4 text-brand-600" />
            Need help? Call
            <a href={CONTACT.phoneHref} className="font-semibold text-neutral-900 hover:text-brand-600">
              {CONTACT.phone}
            </a>
          </p>
          <Link
            href={item.cta.path}
            onClick={onNavigate}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            {item.cta.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Drawer (mobile / tablet menu + desktop "more" panel)              */
/* ------------------------------------------------------------------ */

function DrawerLink({ item, onNavigate }: { item: MenuLink; onNavigate: () => void }) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.path}
        onClick={onNavigate}
        className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-neutral-50"
      >
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
            {item.label}
            {item.badge && <Badge>{item.badge}</Badge>}
          </span>
          {item.sub && <span className="block text-xs text-neutral-500">{item.sub}</span>}
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300 group-hover:text-brand-600" />
      </Link>
      {item.children && (
        <div className={`flex flex-wrap gap-1.5 pb-2 ${Icon ? 'pl-14' : 'pl-2'}`}>
          {item.children.map((c) => (
            <Chip key={c.label} href={c.path} onClick={onNavigate}>
              {c.label}
            </Chip>
          ))}
        </div>
      )}
    </li>
  );
}

function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [openItem, setOpenItem] = useState<string | null>('For Buyers');
  const [openSection, setOpenSection] = useState<string | null>(null);

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-neutral-900/50 backdrop-blur-[2px] transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        onClick={onClose}
        aria-hidden
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-[70] flex w-[90vw] max-w-[420px] flex-col bg-white shadow-2xl transition-[transform,visibility] duration-300 ease-out ${open ? 'visible translate-x-0' : 'invisible translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <Link href="/" onClick={onClose}>
            <img src={LOGO_SRC} alt="OneMillionSqFt" className="h-10 w-auto object-contain" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
          <Link
            href="/properties"
            onClick={onClose}
            className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <Search className="h-4 w-4" />
            Explore Properties
          </Link>

          <div className="space-y-2">
            {NAV.map((nav) => {
              const expanded = openItem === nav.label;
              return (
                <div key={nav.label} className="overflow-hidden rounded-xl border border-neutral-200">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpenItem(expanded ? null : nav.label)}
                    className={`flex w-full items-center justify-between px-4 py-3.5 text-left text-[15px] font-semibold transition-colors ${expanded ? 'bg-brand-50 text-brand-600' : 'text-neutral-800 hover:bg-neutral-50'
                      }`}
                  >
                    {nav.label}
                    <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  </button>

                  {expanded && (
                    <div className="space-y-1 border-t border-neutral-100 px-3 py-3">
                      {nav.sections.map((s) => {
                        const key = `${nav.label}:${s.id}`;
                        const secOpen = openSection === key;
                        const Icon = s.icon;
                        return (
                          <div key={s.id}>
                            <button
                              type="button"
                              aria-expanded={secOpen}
                              onClick={() => setOpenSection(secOpen ? null : key)}
                              className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors ${secOpen ? 'bg-neutral-50' : 'hover:bg-neutral-50'
                                }`}
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-semibold text-neutral-800">{s.label}</span>
                                <span className="block truncate text-xs text-neutral-500">{s.description}</span>
                              </span>
                              <ChevronDown
                                className={`h-4 w-4 text-neutral-400 transition-transform ${secOpen ? 'rotate-180' : ''}`}
                              />
                            </button>
                            {secOpen && (
                              <div className="mb-2 ml-3 mt-1 space-y-4 border-l border-neutral-200 pl-3">
                                {s.groups.map((g) => (
                                  <div key={g.heading}>
                                    <p className="mb-1 px-2 pt-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                                      {g.heading}
                                    </p>
                                    <ul>
                                      {g.items.map((it) => (
                                        <DrawerLink key={it.label} item={it} onNavigate={onClose} />
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-3 space-y-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.path}
                href={l.path}
                onClick={onClose}
                className="flex items-center rounded-xl border border-neutral-200 px-4 py-3.5 text-[15px] font-semibold text-neutral-800 hover:bg-neutral-50"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-neutral-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-400">Talk to us</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={CONTACT.whatsappHref} className="flex items-center gap-3 font-medium text-neutral-800 hover:text-brand-600">
                  <MessageCircle className="h-5 w-5 text-brand-500" />
                  Chat on WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 font-medium text-neutral-800 hover:text-brand-600">
                  <Mail className="h-5 w-5 text-brand-500" />
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-200 bg-white px-5 py-4">
          <Link
            href={POST_PROPERTY_PATH}
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand-600 py-3 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50"
          >
            Post Property
            <Badge>Free</Badge>
          </Link>
        </div>
      </aside>
    </>
  );
}

type HeaderProps = {
  /** 'transparent' floats over the hero on "/" and turns white after scrolling */
  variant?: 'solid' | 'transparent';
};

export function Header({ variant = 'solid' }: HeaderProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { openEnquiry: openEnquiryModal } = useEnquiry();
  const [openMega, setOpenMega] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useLockBody(drawerOpen);

  // Header floats over the page only for the transparent variant on the home page
  const overlay = variant === 'transparent' && pathname === '/';
  // Transparent only before scrolling and while no mega menu is open
  const isTransparent = overlay && !scrolled && !openMega;

  const isActive = (path: string) => pathname === path.split('?')[0];
  const navActive = (n: NavItem) =>
    n.sections.some((s) => s.groups.some((g) => g.items.some((i) => isActive(i.path))));

  const closeAll = useCallback(() => {
    setOpenMega(null);
    setDrawerOpen(false);
  }, []);

  useEffect(() => {
    closeAll();
  }, [pathname, closeAll]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAll();
      }
    };
    const onScroll = (e?: Event) => {
      const t = e?.target;
      const y =
        window.scrollY ||
        document.documentElement.scrollTop ||
        (t instanceof HTMLElement ? t.scrollTop : 0);
      setScrolled(y > 10);
    };
    onScroll();
    window.addEventListener('keydown', onKey);
    // capture: true also catches scrolling inside wrapper elements
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [closeAll]);

  const openEnquiry = () => {
    closeAll();
    openEnquiryModal();
  };

  const activeNav = NAV.find((n) => n.label === openMega) ?? null;

  const navText = isTransparent
    ? 'text-white hover:bg-white/10'
    : 'text-neutral-700 hover:bg-neutral-50 hover:text-brand-600';

  const barItem =
    'flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors';

  return (
    <>
      {/* Main header — the full-width mega panel is a child so it shares this stacking context */}
      <header
        className={`${overlay ? 'fixed inset-x-0' : 'sticky'} top-0 z-50 transition-all duration-300 ${isTransparent
          ? 'bg-transparent shadow-none'
          : `bg-white ${scrolled || openMega ? 'shadow-md' : 'border-b border-neutral-100'}`
          }`}
      >
        <div className="container-xx">
          <div className="flex h-20 items-center justify-between gap-6 lg:h-20">
            <Link href="/" className="flex shrink-0 items-center transition-transform hover:scale-[1.02]">
              <img
                src={variant === 'transparent' ? LOGO_SRC_HERO : LOGO_SRC}
                alt="OneMillionSqFt"
                className="h-10 w-auto object-contain transition lg:h-10"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden flex-1 items-center lg:flex" aria-label="Primary">
              {NAV.map((item) => {
                const isOpen = openMega === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    onClick={() => setOpenMega(isOpen ? null : item.label)}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${isOpen || navActive(item) ? 'bg-brand-50 text-brand-600' : navText
                      }`}
                  >
                    {item.label}
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                );
              })}
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.path}
                  href={l.path}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${isActive(l.path) ? 'bg-brand-50 text-brand-600' : navText}`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Desktop actions */}
            <div className="hidden shrink-0 items-center gap-3 lg:flex">
              <Link
                href="/properties"
                className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${isTransparent
                  ? 'bg-white/15 text-white hover:bg-white/25'
                  : isActive('/properties')
                    ? 'bg-brand-50 text-brand-600'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
              >
                <Search className="h-4 w-4" />
                Explore Properties
              </Link>

              <Link
                href={POST_PROPERTY_PATH}
                className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${isTransparent
                  ? 'border-white text-white hover:bg-brand-600/10'
                  : `border-brand-600 text-brand-600 hover:bg-brand-50 ${isActive(POST_PROPERTY_PATH) ? 'bg-brand-50' : ''
                  }`
                  }`}
              >
                Post Property
                <Badge>Free</Badge>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setOpenMega(null);
                  setDrawerOpen(true);
                }}
                className={`rounded-md border p-2.5 transition-colors ${isTransparent
                  ? 'border-white text-white hover:bg-white/10'
                  : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                  }`}
                aria-label="Open menu"
              >
                <Ellipsis className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile / tablet actions */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${isTransparent
                  ? 'border-white/60 text-white hover:bg-white/10'
                  : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                  }`}
              >
                <Ellipsis className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Full-width mega panel */}
        {activeNav && (
          <div className="hidden lg:block">
            <MegaPanel key={activeNav.label} item={activeNav} onNavigate={closeAll} />
          </div>
        )}
      </header>

      {/* Dim page behind the mega menu (below header, above page) */}
      {openMega && (
        <div
          aria-hidden
          onClick={() => setOpenMega(null)}
          className="fixed inset-0 z-40 hidden bg-neutral-900/30 lg:block"
        />
      )}

      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Mobile bottom action bar — add `pb-[72px] lg:pb-0` to your <main> */}
      <nav
        aria-label="Quick actions"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden"
      >
        <div className="grid grid-cols-5">
          <Link href="/" className={`${barItem} ${isActive('/') ? 'text-brand-600' : 'text-neutral-500'}`}>
            <Home className="h-5 w-5" />
            Home
          </Link>
          <Link
            href="/properties"
            className={`${barItem} ${isActive('/properties') ? 'text-brand-600' : 'text-neutral-500'}`}
          >
            <Search className="h-5 w-5" />
            Explore
          </Link>
          <Link
            href={POST_PROPERTY_PATH}
            className={`${barItem} ${isActive(POST_PROPERTY_PATH) ? 'text-brand-600' : 'text-neutral-500'}`}
          >
            <span className="relative">
              <FilePlus className="h-5 w-5" />
              <span className="absolute -right-5 -top-2 rounded bg-green-100 px-1 text-[8px] font-bold uppercase text-green-700">
                Free
              </span>
            </span>
            Post Property
          </Link>
          <button type="button" onClick={() => setDrawerOpen(true)} className={`${barItem} text-neutral-500`}>
            <EllipsisVertical className="h-5 w-5" />
            More
          </button>
          <button
            type="button"
            onClick={openEnquiry}
            className={`${barItem} bg-brand-600 font-semibold text-white hover:bg-brand-700`}
          >
            <Mail className="h-5 w-5" />
            Enquire
          </button>
        </div>
      </nav>
    </>
  );
}

/** Home-page header: transparent over the hero, white after scrolling. */
export function HeaderTransparent() {
  return <Header variant="transparent" />;
}