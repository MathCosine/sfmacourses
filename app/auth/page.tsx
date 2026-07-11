import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/data";
import { safeInternalPath } from "@/lib/utils";
import { AuthForm } from "./AuthForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrandMark } from "@/components/Brand";

export const metadata = { title: "Sign In" };

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: rawRedirect } = await searchParams;
  // Only allow same-origin paths — blocks open-redirect phishing links.
  const redirectTo = safeInternalPath(rawRedirect) ?? undefined;
  const user = await getSessionUser();
  if (user) redirect(redirectTo || "/dashboard");

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-10">
      <div className="graph-paper-lg absolute inset-0 opacity-70" />
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <div className="relative flex flex-col items-center">
        <Link href="/" className="mb-7 flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <BrandMark className="h-10 w-10 shrink-0" />
          <span className="flex items-center gap-2">
            <span className="text-[17px] font-extrabold tracking-tight text-tprimary">SFMA</span>
            <span className="h-3.5 w-px bg-border-strong" />
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.13em] text-tmuted">
              Math Academy
            </span>
          </span>
        </Link>
        <Suspense>
          <AuthForm redirectTo={redirectTo} />
        </Suspense>
        <Link href="/" className="mt-7 text-[12.5px] text-tfaint transition-colors hover:text-tmuted">
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
