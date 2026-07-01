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
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const dest = redirectTo || "/dashboard";

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
    <div className="card relative w-full max-w-[400px] rounded-xl p-8">
      {/* Playful academic touch: a hand-placed sticker, not another box. */}
      <span className="absolute -right-3 -top-3 rotate-6 rounded-lg bg-yellow-tint px-2.5 py-1 font-serif text-[12px] font-bold italic text-yellow shadow-sm ring-1 ring-inset ring-yellow/30">
        Always free
      </span>
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

      <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
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
          className="btn-3d w-full py-3 text-[14px]"
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
