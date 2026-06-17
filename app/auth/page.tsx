import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/data";
import { AuthForm } from "./AuthForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata = { title: "Sign In" };

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectTo } = await searchParams;
  const user = await getSessionUser();
  if (user) redirect(redirectTo || "/dashboard");

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-10">
      <div className="dot-grid absolute inset-0 opacity-50" />
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <div className="relative flex flex-col items-center">
        <Link href="/" className="mb-7 flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-[20px] font-bold text-white shadow-accent">
            ∑
          </span>
          <span className="text-[18px] font-extrabold tracking-tight text-tprimary">
            SFMA <span className="font-medium text-tmuted">Math Academy</span>
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
