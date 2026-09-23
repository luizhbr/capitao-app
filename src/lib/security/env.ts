import "server-only";
export function requireServerSecret(name: "SUPABASE_SECRET_KEY") {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required server secret: ${name}`);
  return value;
}
