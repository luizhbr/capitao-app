import "server-only";
import { createClient } from "@supabase/supabase-js";
import { requireServerSecret } from "@/lib/security/env";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  return createClient(url,requireServerSecret("SUPABASE_SECRET_KEY"),{
    db:{schema:"api"},
    auth:{autoRefreshToken:false,persistSession:false,detectSessionInUrl:false}
  });
}
