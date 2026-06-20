import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="font-serif text-6xl text-gold">∑</div>
      <h1 className="mt-4 font-serif text-3xl text-tprimary">Page not found</h1>
      <p className="mt-2 text-[14.5px] text-tmuted">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <Link
        href="/"
        className="btn-3d mt-6 px-5 py-2.5 text-[14px]"
      >
        Back home
      </Link>
    </main>
  );
}
