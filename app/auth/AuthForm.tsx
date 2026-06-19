"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function AuthForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const dest = redirectTo || "/dashboard";

  async function handleGoogle() {
    setError(null);
    setNotice(null);
    setOauthLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(dest)}`,
      },
    });
    if (error) {
      setError(error.message);
      setOauthLoading(false);
    }
    // On success the browser is redirected to Google.
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;

        // Ensure a profile row exists (in case no DB trigger is configured).
        if (data.user) {
          await supabase.from("profiles").upsert(
            {
              id: data.user.id,
              email,
              full_name: fullName,
              role: "student",
            },
            { onConflict: "id" },
          );
        }

        if (!data.session) {
          setNotice(
            "Account created. Check your email to confirm, then sign in.",
          );
          setMode("signin");
          setLoading(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }

      router.push(dest);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="card w-full max-w-[400px] rounded-3xl p-8">
      <h1 className="font-serif text-3xl text-tprimary">Welcome to SFMA</h1>
      <p className="mt-1 text-[13.5px] text-tmuted">
        {mode === "signin"
          ? "Sign in to continue your studies."
          : "Create an account to start learning."}
      </p>

      {/* Toggle */}
      <div className="mt-5 grid grid-cols-2 gap-1 rounded-lg border border-border bg-bg p-1">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
              setNotice(null);
            }}
            className={cn(
              "rounded-md py-1.5 text-[13px] font-medium transition-colors",
              mode === m
                ? "bg-gold text-white shadow-sm"
                : "text-tmuted hover:text-tprimary",
            )}
          >
            {m === "signin" ? "Sign In" : "Sign Up"}
          </button>
        ))}
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={oauthLoading || loading}
        className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-surface py-2.5 text-[14px] font-semibold text-tprimary transition-colors hover:bg-bg disabled:opacity-60"
      >
        <GoogleGlyph className="h-[18px] w-[18px]" />
        {oauthLoading ? "Redirecting…" : "Continue with Google"}
      </button>

      <div className="my-4 flex items-center gap-3 text-[11.5px] text-tfaint">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {mode === "signup" && (
          <Field
            label="Full Name"
            type="text"
            value={fullName}
            onChange={setFullName}
            placeholder="Ada Lovelace"
            required
          />
        )}
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          required
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          required
          minLength={6}
        />

        {error && (
          <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
            {error}
          </div>
        )}
        {notice && (
          <div className="rounded-lg border border-green/40 bg-green/10 px-3 py-2 text-[12.5px] text-green">
            {notice}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gold py-2.5 text-[14px] font-semibold text-white shadow-accent transition-colors hover:bg-gold-hover disabled:opacity-60"
        >
          {loading
            ? "Please wait…"
            : mode === "signin"
              ? "Sign In"
              : "Create Account"}
        </button>
      </form>
    </div>
  );
}

function GoogleGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.29a12 12 0 0 0 0 10.74l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.96 11.96 0 0 0 12 0 12 12 0 0 0 1.29 6.63l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

function Field({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-medium text-tmuted">
        {label}
      </span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-[14px] text-tprimary outline-none transition-colors placeholder:text-tfaint focus:border-gold"
      />
    </label>
  );
}
