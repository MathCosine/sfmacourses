"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="font-serif text-5xl text-gold">∑</div>
      <h1 className="mt-4 font-serif text-3xl text-tprimary">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-[14.5px] text-tmuted">
        We hit an unexpected error rendering this page. Try again, or head back
        to your dashboard.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-[11.5px] text-tfaint">
          Reference: {error.digest}
        </p>
      )}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-gold px-5 py-2.5 text-[14px] font-semibold text-white shadow-accent transition-colors hover:bg-gold-hover"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-md border border-border bg-surface px-5 py-2.5 text-[14px] font-medium text-tprimary transition-colors hover:border-gold/50"
        >
          Dashboard
        </Link>
      </div>
    </main>
  );
}
