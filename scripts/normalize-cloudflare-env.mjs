import { appendFileSync } from "node:fs";

function normalize(value) {
  let cleaned = (value ?? "").trim();
  cleaned = cleaned.replace(/^Bearer\s+/i, "").trim();

  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return cleaned.replace(/[\r\n]/g, "").trim();
}

const token = normalize(process.env.CLOUDFLARE_API_TOKEN);
const accountId = normalize(process.env.CLOUDFLARE_ACCOUNT_ID);
const githubEnv = process.env.GITHUB_ENV;

if (!githubEnv) {
  throw new Error("GITHUB_ENV is unavailable.");
}

if (!token || !accountId) {
  throw new Error("Cloudflare credentials are empty after normalization.");
}

appendFileSync(
  githubEnv,
  `CLOUDFLARE_API_TOKEN=${token}\nCLOUDFLARE_ACCOUNT_ID=${accountId}\n`,
);

console.log("Cloudflare credentials normalized without printing secret values.");
