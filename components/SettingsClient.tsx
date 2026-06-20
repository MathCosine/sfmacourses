"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfileName, updateProfileAvatar } from "@/app/settings/actions";
import { createClient } from "@/lib/supabase/client";
import { cn, initials } from "@/lib/utils";
import {
  uploadToCloudinary,
  avatarUrl,
  cloudinaryConfigured,
} from "@/lib/cloudinary";
import { Sun, Moon, Settings as SettingsIcon, LogOut, Check } from "@/components/icons";

type ThemePref = "light" | "dark" | "system";

export function SettingsClient({
  initialName,
  initialAvatar,
  email,
  role,
}: {
  initialName: string;
  initialAvatar: string | null;
  email: string;
  role: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState<string | null>(initialAvatar);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarErr, setAvatarErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const configured = cloudinaryConfigured();

  async function handleAvatar(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarErr("Please choose an image file.");
      return;
    }
    setAvatarErr(null);
    setAvatarBusy(true);
    try {
      const url = await uploadToCloudinary(file);
      const res = await updateProfileAvatar(url);
      if (!res.ok) throw new Error(res.error);
      setAvatar(url);
      router.refresh();
    } catch (e) {
      setAvatarErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setAvatarBusy(false);
    }
  }

  async function removeAvatar() {
    setAvatarBusy(true);
    const res = await updateProfileAvatar(null);
    if (res.ok) {
      setAvatar(null);
      router.refresh();
    }
    setAvatarBusy(false);
  }
  const [theme, setTheme] = useState<ThemePref>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const t = localStorage.getItem("theme");
      setTheme(t === "dark" ? "dark" : t === "light" ? "light" : "system");
    } catch {
      /* ignore */
    }
  }, []);

  function applyTheme(pref: ThemePref) {
    setTheme(pref);
    try {
      if (pref === "system") {
        localStorage.removeItem("theme");
        const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.classList.toggle("dark", dark);
      } else {
        localStorage.setItem("theme", pref);
        document.documentElement.classList.toggle("dark", pref === "dark");
      }
    } catch {
      /* ignore */
    }
  }

  function save() {
    setSaved(false);
    startTransition(async () => {
      const res = await updateProfileName(name);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  const themeOptions: { value: ThemePref; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
    { value: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
    { value: "system", label: "System", icon: <SettingsIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Profile */}
      <section className="card rounded-2xl p-6">
        <h2 className="text-[16px] font-bold text-tprimary">Profile</h2>
        <p className="mt-0.5 text-[13px] text-tmuted">How your name and photo appear across SFMA.</p>

        {/* Avatar */}
        <div className="mt-5 flex items-center gap-4">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl(avatar, 128)}
              alt=""
              className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-inset ring-border"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold/15 text-[18px] font-bold text-gold ring-1 ring-inset ring-gold/25">
              {initials(name, email)}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-medium text-tmuted transition-colors hover:text-tprimary">
              {avatarBusy ? "Uploading…" : avatar ? "Change photo" : "Upload photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={avatarBusy}
                onChange={(e) => handleAvatar(e.target.files)}
              />
            </label>
            {avatar && (
              <button
                onClick={removeAvatar}
                disabled={avatarBusy}
                className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-medium text-tmuted transition-colors hover:text-danger disabled:opacity-60"
              >
                Remove
              </button>
            )}
            {avatarErr && <span className="text-[12px] text-danger">{avatarErr}</span>}
            {!configured && !avatar && (
              <span className="text-[11.5px] text-tmuted">
                Set the Cloudinary env vars to enable uploads.
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 max-w-md space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-medium text-tmuted">Display name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-[14px] text-tprimary outline-none transition-colors placeholder:text-tfaint focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-medium text-tmuted">Email</span>
            <input
              value={email}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-[14px] text-tmuted outline-none"
            />
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={pending}
              className="btn-3d px-5 py-2.5 text-[13.5px]"
            >
              {pending ? "Saving…" : "Save changes"}
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-green">
                <Check className="h-4 w-4" /> Saved
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="card rounded-2xl p-6">
        <h2 className="text-[16px] font-bold text-tprimary">Appearance</h2>
        <p className="mt-0.5 text-[13px] text-tmuted">Choose how SFMA looks to you.</p>
        <div className="mt-5 inline-grid grid-cols-3 gap-1.5 rounded-xl border border-border bg-bg p-1.5">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => applyTheme(opt.value)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-[13.5px] font-medium transition-colors",
                mounted && theme === opt.value
                  ? "bg-surface text-tprimary shadow-sm"
                  : "text-tmuted hover:text-tprimary",
              )}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Account */}
      <section className="card rounded-2xl p-6">
        <h2 className="text-[16px] font-bold text-tprimary">Account</h2>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="text-[13.5px] text-tmuted">
            Role: <span className="font-semibold capitalize text-tprimary">{role}</span>
          </div>
          <button
            onClick={async () => {
              await createClient().auth.signOut();
              window.location.href = "/";
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-[13.5px] font-medium text-tmuted transition-colors hover:border-danger/50 hover:text-danger"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </section>
    </div>
  );
}
