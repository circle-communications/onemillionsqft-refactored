import Link from 'next/link';
import { allPropertiesHref } from '@/lib/search/links';

export default function NotFound() {
  return (
    <section className="container-x py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">404</p>
      <h1 className="mt-3 font-serif text-3xl font-bold text-neutral-900 md:text-4xl">We couldn&apos;t find that page</h1>
      <p className="mx-auto mt-4 max-w-md text-neutral-500">
        The property may have been sold or the link may be out of date. Browse what&apos;s available right now.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={allPropertiesHref()} className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700">
          Browse properties
        </Link>
        <Link href="/" className="rounded-lg border border-neutral-200 px-6 py-2.5 font-semibold text-neutral-700 hover:bg-neutral-50">
          Home
        </Link>
      </div>
    </section>
  );
}
