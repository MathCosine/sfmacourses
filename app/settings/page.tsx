import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { SettingsClient } from "@/components/SettingsClient";
import { getSessionUser } from "@/lib/data";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth?redirect=/settings");

  return (
    <SiteShell footer={false}>
      <div className="mx-auto max-w-3xl px-6 py-10 sm:px-8">
        <h1 className="text-[2.2rem] font-extrabold tracking-tight text-tprimary">Settings</h1>
        <p className="mt-1.5 text-[15px] text-tmuted">Manage your profile and preferences.</p>
        <div className="mt-8">
          <SettingsClient
            initialName={user.profile?.full_name ?? ""}
            email={user.email}
            role={user.isStaff ? "staff" : "student"}
          />
        </div>
      </div>
    </SiteShell>
  );
}
