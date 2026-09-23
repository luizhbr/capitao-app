import "server-only";

/** Resolve the public Supabase project URL (publishable — safe for the browser). */
export function supabasePublicConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
  };
}

export function supabaseConfigured(): boolean {
  const { url, publishableKey } = supabasePublicConfig();
  return Boolean(url && publishableKey);
}
