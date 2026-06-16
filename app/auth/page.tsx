import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/data";
import { AuthForm } from "./AuthForm";

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
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-10">
      <Link
        href="/"
        className="mb-8 font-serif text-3xl text-gold transition-opacity hover:opacity-80"
      >
        SFMA
      </Link>
      <Suspense>
        <AuthForm redirectTo={redirectTo} />
      </Suspense>
      <p className="mt-8 text-[12.5px] text-tfaint">
        San Francisco Math Academy
      </p>
    </main>
  );
}
