import { redirect } from "next/navigation";

/**
 * The team roster lives on the SF Math Open site. Any visit to /team (from the
 * nav, footer, the `t` shortcut, or a direct link) forwards there.
 */
export default function TeamPage() {
  redirect("https://sfmathopen.replit.app/team");
}
