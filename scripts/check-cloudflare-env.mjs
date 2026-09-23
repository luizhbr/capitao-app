import fs from "node:fs";
import path from "node:path";

const mode = process.argv[2] ?? "production";
const candidates = mode === "staging"
  ? [".env.staging.local", ".env.production.local", ".env.local"]
  : [".env.production.local", ".env.local"];

function parseDotenv(file) {
  const result = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i < 1) continue;
    const key = trimmed.slice(0, i).trim();
    let value = trimmed.slice(i + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

let fileVars = {};
let loadedFile = null;
for (const f of candidates) {
  const full = path.resolve(f);
  if (fs.existsSync(full)) {
    fileVars = { ...fileVars, ...parseDotenv(full) };
    loadedFile = loadedFile ?? f;
  }
}

const values = { ...fileVars, ...process.env };
const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_APP_URL",
];

const invalid = required.filter((key) => {
  const v = values[key];
  return !v || /YOUR_|replace-me|example\.com/i.test(v);
});

if (invalid.length) {
  console.error(`\n[CAPITÃO] Variáveis ausentes ou ainda com placeholder (${mode}):`);
  for (const key of invalid) console.error(`  - ${key}`);
  console.error("\nCrie .env.production.local (ou .env.staging.local) a partir do exemplo antes do deploy.\n");
  process.exit(1);
}

try {
  new URL(values.NEXT_PUBLIC_SUPABASE_URL);
  new URL(values.NEXT_PUBLIC_APP_URL);
} catch {
  console.error("[CAPITÃO] NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_APP_URL precisam ser URLs válidas.");
  process.exit(1);
}

console.log(`[CAPITÃO] Ambiente ${mode} validado${loadedFile ? ` usando ${loadedFile}` : " via variáveis do processo"}.`);
