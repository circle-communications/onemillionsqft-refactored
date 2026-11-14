'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-x py-24 text-center" role="alert">
      <h1 className="font-serif text-3xl font-bold text-neutral-900">Something went wrong</h1>
      <p className="mx-auto mt-4 max-w-md text-neutral-500">
        We hit an unexpected problem loading this page. Please try again.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700">
          Try again
        </button>
        <Link href="/" className="rounded-lg border border-neutral-200 px-6 py-2.5 font-semibold text-neutral-700 hover:bg-neutral-50">
          Home
        </Link>
      </div>
    </section>
  );
}
