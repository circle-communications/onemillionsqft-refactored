'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { EnquiryModal } from '@/components/layout/EnquiryModal';

export interface EnquiryOptions {
  /** Listing the visitor is asking about (stored with the lead). */
  propertySlug?: string;
  /** Modal title, e.g. the project name. */
  heading?: string;
}

interface EnquiryContextValue {
  /** Opens the site-wide enquiry dialog. */
  openEnquiry: (options?: EnquiryOptions) => void;
}

const EnquiryContext = createContext<EnquiryContextValue | null>(null);

export function useEnquiry(): EnquiryContextValue {
  const ctx = useContext(EnquiryContext);
  if (!ctx) throw new Error('useEnquiry must be used inside <EnquiryProvider> (mounted in app/layout.tsx)');
  return ctx;
}

/** Mounted once in the root layout: header, cards and detail pages all open the same dialog. */
export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; options: EnquiryOptions }>({ open: false, options: {} });

  const openEnquiry = useCallback((options: EnquiryOptions = {}) => setState({ open: true, options }), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  // lock page scroll while the dialog is open
  useEffect(() => {
    if (!state.open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [state.open]);

  const value = useMemo(() => ({ openEnquiry }), [openEnquiry]);

  return (
    <EnquiryContext.Provider value={value}>
      {children}
      <EnquiryModal
        open={state.open}
        onClose={close}
        propertySlug={state.options.propertySlug}
        heading={state.options.heading}
      />
    </EnquiryContext.Provider>
  );
}
