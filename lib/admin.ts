/**
 * Emails that are always treated as staff, regardless of their `profiles.role`
 * value. This guarantees a permanent admin account that cannot be locked out.
 */
export const SUPER_ADMIN_EMAILS = ["sfmathopen@gmail.com"];

export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
