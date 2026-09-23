import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type CapitaoRole = "moderator" | "institute_admin" | "platform_admin";

/**
 * Server-side role check. Uses the admin client ONLY inside the server bundle
 * to read private.user_roles — the browser never sees service-role credentials.
 * Returns false when no secret is configured (fail-closed).
 */
export async function getUserRoles(userId: string | null | undefined): Promise<CapitaoRole[]> {
  if (!userId) return [];
  if (!process.env.SUPABASE_SECRET_KEY) return [];
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("user_roles" as never)
      .select("role")
      .eq("user_id", userId);
    if (error) return [];
    return ((data as unknown as Array<{ role: string }>) ?? [])
      .map((r) => r.role)
      .filter((r): r is CapitaoRole =>
        r === "moderator" || r === "institute_admin" || r === "platform_admin",
      );
  } catch {
    return [];
  }
}

export function isModerator(roles: CapitaoRole[]): boolean {
  return roles.length > 0;
}
